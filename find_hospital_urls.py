#!/usr/bin/env python3
"""
find_hospital_urls.py
從 hospitals.tw 抓取台灣醫院官方網站及網路掛號連結，更新 hospitals.json

用法:
  python find_hospital_urls.py             # 處理全部未填的醫院
  python find_hospital_urls.py --start 50  # 從第 50 筆開始
  python find_hospital_urls.py --count 10  # 只處理 10 筆
  python find_hospital_urls.py --merge     # 合併快取到 hospitals.json
  python find_hospital_urls.py --stats     # 顯示統計
  python find_hospital_urls.py --force     # 忽略快取，強制重搜
"""
import sys
import json
import time
import re
import argparse
from pathlib import Path
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# ── 設定 ──────────────────────────────────────────────────────────────
CACHE_FILE = Path("hospital_urls_cache.json")
HOSPITALS_JSON = Path("src/data/hospitals.json")
SEARCH_DELAY = 2.5   # 每次搜尋間隔（秒）
REQUEST_TIMEOUT = 15

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "zh-TW,zh;q=0.9,en;q=0.8",
}

# hospitals.tw 需跳過的路徑（非醫院頁面）
SKIP_PATHS = [
    "/page/", "/doctor/", "/emergency/", "/progress/", "/register/",
    "/about", "/terms", "/privacy", "/symptom", "/clinic", "/animal",
    "chinese-new-year", "holiday-", "-holiday", "er/", "twedr.com", "#",
]

# 掛號文字關鍵字
APPT_TEXT_KW = ["網路掛號", "線上掛號", "掛號", "預約掛號", "網路預約", "線上預約"]


# ── URL 工具 ─────────────────────────────────────────────────────────
def base_url(url: str) -> str:
    """取 URL 的根網址（scheme + netloc + 首層路徑）"""
    if not url:
        return url
    p = urlparse(url)
    return f"{p.scheme}://{p.netloc}/"


# ── 名稱處理 ─────────────────────────────────────────────────────────
def extract_short_name(full_name: str) -> str:
    """
    抽取醫院常用短名，用於搜尋。
    "長庚醫療財團法人台北長庚紀念醫院" → "台北長庚紀念醫院"
    "基督復臨安息日會醫療財團法人臺安醫院" → "臺安醫院"
    """
    name = full_name
    # 剝除法人前綴
    name = re.sub(r"^[\u4e00-\u9fff\w]{0,15}醫療財團法人", "", name).strip()
    name = re.sub(r"^[\u4e00-\u9fff\w]{0,10}財團法人", "", name).strip()
    name = re.sub(r"^[\u4e00-\u9fff\w]{0,10}社團法人", "", name).strip()
    # 剝除 國立/私立 + 校名 + 附設 前綴
    name = re.sub(r"^(?:國立|私立|公立)[\u4e00-\u9fff]+?附設", "", name).strip()
    # 剝除 附設XXXX 後綴
    name = re.sub(r"附設[\u4e00-\u9fff\w]{2,20}$", "", name).strip()
    return name or full_name


# ── hospitals.tw 搜尋 ────────────────────────────────────────────────
def search_hospitals_tw(full_name: str, short_name: str) -> str:
    """
    在 hospitals.tw 搜尋醫院，回傳該醫院的 hospitals.tw 頁面 URL。
    例: "臺安醫院" → "https://hospitals.tw/tahsda/"
    """
    for query in [full_name, short_name]:
        try:
            resp = requests.get(
                "https://hospitals.tw/",
                params={"s": query},
                headers=HEADERS,
                timeout=REQUEST_TIMEOUT,
            )
            soup = BeautifulSoup(resp.text, "html.parser")
            for a in soup.find_all("a", href=True):
                href = a["href"]
                text = a.get_text(strip=True)
                # 必須是 hospitals.tw 的頁面
                if "hospitals.tw/" not in href:
                    continue
                # 跳過已知的非醫院頁面
                if any(bad in href for bad in SKIP_PATHS):
                    continue
                # 必須有 slug（不是根路徑）
                slug = href.rstrip("/").split("/")[-1]
                if not slug:
                    continue
                # 確認是醫院頁面（含門診/掛號關鍵字，或名稱包含中文）
                if "門診" in text or "掛號" in text or "看診" in text:
                    return href
        except Exception as e:
            print(f"    [搜尋失敗] {e}")
        time.sleep(SEARCH_DELAY)
    return ""


# ── 從 hospitals.tw 頁面抓取官網和掛號 URL ───────────────────────────
def get_info_from_hw_page(hw_url: str) -> tuple[str, str]:
    """
    抓取 hospitals.tw 的醫院頁面，回傳 (官網 URL, 掛號 URL)。
    """
    try:
        resp = requests.get(hw_url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
        soup = BeautifulSoup(resp.text, "html.parser")
        website, appt = "", ""
        for a in soup.find_all("a", href=True):
            href = a["href"]
            text = a.get_text(strip=True)
            if "hospitals.tw" in href or not href.startswith("http"):
                continue
            if "官方網站" in text and not website:
                website = href
            if any(kw in text for kw in APPT_TEXT_KW) and not appt:
                if href != website:  # 掛號連結應該與官網不同
                    appt = href
        # 若掛號連結不存在，但官網有，嘗試同一網域下的掛號路徑
        if not appt and website:
            appt = find_appt_from_homepage(website)
        return website, appt
    except Exception as e:
        print(f"    [解析失敗] {e}")
        return "", ""


# ── 從官網首頁找掛號連結（備用） ─────────────────────────────────────
def find_appt_from_homepage(website_url: str) -> str:
    APPT_URL_RE = re.compile(r"(appointment|register|booking|netreg|regist|預約|掛號)", re.I)
    try:
        resp = requests.get(
            website_url, headers=HEADERS, timeout=REQUEST_TIMEOUT, allow_redirects=True
        )
        soup = BeautifulSoup(resp.text, "html.parser")
        for a in soup.find_all("a", href=True):
            text = a.get_text(strip=True)
            href = a["href"]
            if not href or href.startswith("#") or href.startswith("javascript"):
                continue
            if any(kw in text for kw in APPT_TEXT_KW):
                return href if href.startswith("http") else urljoin(website_url, href)
        for a in soup.find_all("a", href=True):
            href = a["href"]
            if APPT_URL_RE.search(href) and not any(
                bad in href for bad in [".pdf", ".jpg", ".png", "mailto:", "#"]
            ):
                return href if href.startswith("http") else urljoin(website_url, href)
    except Exception:
        pass
    return ""


# ── 快取 ──────────────────────────────────────────────────────────────
def load_cache() -> dict:
    if CACHE_FILE.exists():
        with open(CACHE_FILE, encoding="utf-8") as f:
            return json.load(f)
    return {}


def save_cache(cache: dict):
    with open(CACHE_FILE, "w", encoding="utf-8") as f:
        json.dump(cache, f, ensure_ascii=False, indent=2)


# ── 處理單間醫院 ─────────────────────────────────────────────────────
def process_hospital(hospital: dict, cache: dict) -> dict:
    hid = hospital["id"]
    name = hospital["name"]
    short = extract_short_name(name)

    if hid in cache:
        print(f"  [快取] {short}")
        return cache[hid]

    result = {
        "website": hospital.get("website") or "",
        "appointmentUrl": hospital.get("appointmentUrl") or "",
    }

    need_website = not result["website"]
    need_appt = not result["appointmentUrl"]

    if not need_website and not need_appt:
        cache[hid] = result
        return result

    # ── 從 hospitals.tw 搜尋 ─────────────────────────────────────────
    print(f"  搜尋: {short}")
    hw_url = search_hospitals_tw(name, short)
    if hw_url:
        print(f"  → 頁面: {hw_url}")
        web, appt = get_info_from_hw_page(hw_url)
        if need_website and web:
            result["website"] = base_url(web)   # 只保留根網址
            print(f"    官網: {result['website']}")
        if need_appt and appt:
            result["appointmentUrl"] = appt
            print(f"    掛號: {appt}")
    else:
        print(f"  → 未在 hospitals.tw 找到")
        # 如果有官網但無掛號，直接從官網抓
        if not need_website and need_appt and result["website"]:
            appt = find_appt_from_homepage(result["website"])
            if appt:
                result["appointmentUrl"] = appt
                print(f"    掛號(官網): {appt}")

    cache[hid] = result
    return result


# ── 統計 ─────────────────────────────────────────────────────────────
def show_stats(hospitals: list, cache: dict):
    total = len(hospitals)
    has_web  = sum(1 for h in hospitals if h.get("website"))
    has_appt = sum(1 for h in hospitals if h.get("appointmentUrl"))
    c_web  = sum(1 for v in cache.values() if v.get("website"))
    c_appt = sum(1 for v in cache.values() if v.get("appointmentUrl"))
    print(f"hospitals.json  : {total} 間  官網={has_web}  掛號={has_appt}")
    print(f"快取 (cache)    : {len(cache)} 筆  官網={c_web}  掛號={c_appt}")


# ── 合併快取 ─────────────────────────────────────────────────────────
def merge_cache(hospitals: list, cache: dict) -> list:
    updated = 0
    for h in hospitals:
        hid = h["id"]
        if hid in cache:
            c = cache[hid]
            if c.get("website") and not h.get("website"):
                h["website"] = c["website"]
                updated += 1
            if c.get("appointmentUrl") and not h.get("appointmentUrl"):
                h["appointmentUrl"] = c["appointmentUrl"]
                updated += 1
    print(f"合併完成：更新 {updated} 個欄位。")
    return hospitals


# ── 主程式 ────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="從 hospitals.tw 抓取醫院官網及掛號連結")
    parser.add_argument("--start", type=int, default=0)
    parser.add_argument("--count", type=int, default=None)
    parser.add_argument("--merge",  action="store_true", help="合併快取到 hospitals.json")
    parser.add_argument("--stats",  action="store_true", help="顯示統計")
    parser.add_argument("--force",  action="store_true", help="忽略快取，重新搜尋")
    args = parser.parse_args()

    with open(HOSPITALS_JSON, encoding="utf-8") as f:
        hospitals = json.load(f)
    cache = load_cache()

    if args.stats:
        show_stats(hospitals, cache)
        return

    if args.merge:
        hospitals = merge_cache(hospitals, cache)
        with open(HOSPITALS_JSON, "w", encoding="utf-8") as f:
            json.dump(hospitals, f, ensure_ascii=False, indent=2)
        show_stats(hospitals, cache)
        return

    need = [h for h in hospitals if not h.get("website") or not h.get("appointmentUrl")]
    subset = need[args.start:]
    if args.count:
        subset = subset[: args.count]

    print(f"待處理: {len(subset)} 間（從索引 {args.start} 開始）")
    print(f"快取已有: {len(cache)} 筆")
    print("=" * 60)

    for i, hospital in enumerate(subset):
        print(f"\n[{i+1}/{len(subset)}] {hospital['name']} ({hospital['city']})")
        if args.force:
            cache.pop(hospital["id"], None)
        process_hospital(hospital, cache)
        if (i + 1) % 10 == 0:
            save_cache(cache)
            print(f"  [已儲存快取 {len(cache)} 筆]")

    save_cache(cache)
    print("\n" + "=" * 60)
    print(f"完成！共處理 {len(subset)} 間，快取 {len(cache)} 筆。")
    print("執行 --merge 將結果合併到 hospitals.json")


if __name__ == "__main__":
    main()
