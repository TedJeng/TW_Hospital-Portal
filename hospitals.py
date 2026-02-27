import pandas as pd
import json
import requests
from urllib.parse import quote
from bs4 import BeautifulSoup

# --- 載入開放資料檔案 --- #
file_path = "醫療機構與人員基本資料_20241231.ods"
df = pd.read_excel(file_path, engine="odf")

# 篩選醫院
hospital_df = df[df["醫療機構類別"].str.contains("醫院")]

def find_official_site(name):
    query = quote(name + " 官方網站")
    url = f"https://www.bing.com/search?q={query}"
    r = requests.get(url, headers={"User-Agent": "Mozilla/5.0"})
    soup = BeautifulSoup(r.text, "html.parser")
    link = soup.select_one("li.b_algo h2 a")
    return link["href"] if link else ""

def find_registration_url(site_url):
    # 嘗試加上通用掛號頁面路徑（若無則回空值）
    possible_paths = ["/appointment", "/掛號", "/booking", "/register"]
    for p in possible_paths:
        test_url = site_url.rstrip("/") + p
        try:
            r = requests.head(test_url, timeout=2)
            if r.status_code == 200:
                return test_url
        except:
            continue
    return ""

hospitals = []

for _, row in hospital_df.iterrows():
    name = row["醫療機構名稱"]
    address = row["機構地址"]
    phone = row["機構電話"]
    site = find_official_site(name)

    hospitals.append({
        "id": name.lower().replace(" ", "-"),
        "name": name,
        "address": address,
        "phone": phone,
        "website": site,
        "registration": find_registration_url(site)
    })

# 輸出 JSON
with open("taiwan_hospitals.json", "w", encoding="utf-8") as f:
    json.dump(hospitals, f, ensure_ascii=False, indent=2)

print(f"生成功完成, 共找到 {len(hospitals)} 間醫院!")