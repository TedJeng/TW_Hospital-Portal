"""
Convert ODS hospital data to hospitals.json format.
Usage: python convert_hospitals.py
"""
import zipfile
import xml.etree.ElementTree as ET
import sys
import json
import re

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

ODS_PATH = "醫療機構與人員基本資料_20241231.ods"
EXISTING_JSON = "src/data/hospitals.json"
OUTPUT_JSON = "src/data/hospitals.json"

NS = {
    'table': 'urn:oasis:names:tc:opendocument:xmlns:table:1.0',
    'text': 'urn:oasis:names:tc:opendocument:xmlns:text:1.0',
    'office': 'urn:oasis:names:tc:opendocument:xmlns:office:1.0',
}

# ─── City name normalization (ODS uses 臺, types use 台) ─────────────────────
CITY_NORMALIZE = {
    "臺北市": "台北市",
    "臺中市": "台中市",
    "臺南市": "台南市",
    "臺東縣": "台東縣",
}

ALL_CITIES = {
    "台北市", "新北市", "桃園市", "台中市", "台南市", "高雄市",
    "基隆市", "新竹市", "新竹縣", "嘉義市", "嘉義縣",
    "苗栗縣", "彰化縣", "南投縣", "雲林縣", "屏東縣",
    "宜蘭縣", "花蓮縣", "台東縣", "澎湖縣", "金門縣", "連江縣",
}

# ─── Service tags derived from 科別 ─────────────────────────────────────────
SERVICE_MAP = [
    (["急診科"],                                    "急診"),
    (["精神科", "精神醫學科", "兒童青少年精神科"], "精神科"),
    (["中醫一般科", "中醫科", "針灸科", "傷科"],  "中醫"),
    (["復健科", "物理治療科"],                     "復健"),
    (["腫瘤科", "放射腫瘤科", "血液腫瘤科"],       "癌症中心"),
    (["安寧緩和醫療科", "安寧療護"],               "安寧療護"),
    (["腎臟科"],                                    "透析"),
    (["牙科", "牙科一般科", "口腔外科"],           "牙科"),
    (["中醫傷科", "骨科"],                         "骨科"),
]

# ─── Phone formatter ─────────────────────────────────────────────────────────
THREE_DIGIT_AREA = {"037", "038", "039", "049", "055", "056",
                    "082", "083", "086", "089", "093", "096"}

def format_phone(raw: str) -> str:
    digits = re.sub(r'\D', '', raw)
    n = len(digits)
    if n == 0:
        return raw.strip()
    if n == 10 and digits[:2] == "02":
        return f"{digits[:2]}-{digits[2:6]}-{digits[6:]}"
    if n == 10 and digits[:3] in THREE_DIGIT_AREA:
        return f"{digits[:3]}-{digits[3:6]}-{digits[6:]}"
    if n == 10:
        return f"{digits[:2]}-{digits[2:6]}-{digits[6:]}"
    if n == 9 and digits[:3] in THREE_DIGIT_AREA:
        return f"{digits[:3]}-{digits[3:6]}-{digits[6:]}"
    if n == 9 and digits[0] == "0":
        return f"{digits[:2]}-{digits[2:5]}-{digits[5:]}"
    if n == 8 and digits[0] != "0":
        # Missing area code — return as-is with grouping
        return f"{digits[:4]}-{digits[4:]}"
    return raw.strip()

# ─── Service extractor ───────────────────────────────────────────────────────
def extract_services(dept_str: str, dept_count: int) -> list[str]:
    services: list[str] = []
    depts = {d.strip() for d in dept_str.split(",") if d.strip()}

    # 急診 first if present
    if "急診科" in depts:
        services.append("急診")

    # 門診 always (all hospitals)
    services.append("門診")

    # 住院 if enough departments (indicates inpatient capability)
    if dept_count >= 6:
        services.append("住院")

    # Specialty services
    for keywords, label in SERVICE_MAP:
        if label in ("急診",):
            continue  # Already handled
        if any(kw in depts for kw in keywords):
            if label not in services:
                services.append(label)
        if len(services) >= 4:
            break

    return services[:4]

# ─── Parse ODS ───────────────────────────────────────────────────────────────
def parse_ods(path: str) -> list[dict]:
    with zipfile.ZipFile(path, 'r') as z:
        with z.open('content.xml') as f:
            content = f.read().decode('utf-8')

    root = ET.fromstring(content)
    body = root.find('.//office:spreadsheet', NS)
    table = body.findall('table:table', NS)[0]
    rows = table.findall('table:table-row', NS)

    def cell_val(cell):
        texts = cell.findall('.//text:p', NS)
        return ' '.join(t.text or '' for t in texts).strip()

    header = [cell_val(c) for c in rows[0].findall('table:table-cell', NS)]

    records = []
    for row in rows[1:]:
        vals = [cell_val(c) for c in row.findall('table:table-cell', NS)]
        if len(vals) >= 5:
            records.append(dict(zip(header, vals)))

    return records

# ─── Build hospital entry ─────────────────────────────────────────────────────
def build_entry(rec: dict, existing_map: dict) -> dict | None:
    name = rec.get("機構名稱", "").strip()
    if not name or "醫院" not in name:
        return None

    code = rec.get("機構代碼", "").strip()
    raw_loc = rec.get("縣市區名", "").strip()
    address = rec.get("地址", "").strip()
    phone_raw = rec.get("電話", "").strip()
    dept_str = rec.get("科別", "").strip()

    # Parse city and district from 縣市區名 (e.g. "臺北市松山區")
    city_raw = ""
    district = ""
    for length in (3, 4):
        candidate = raw_loc[:length]
        normalized = CITY_NORMALIZE.get(candidate, candidate)
        if normalized in ALL_CITIES:
            city_raw = normalized
            district = raw_loc[length:]
            break

    if not city_raw:
        # Fallback: try to extract from address
        for city in ALL_CITIES:
            tc_city = {v: k for k, v in CITY_NORMALIZE.items()}.get(city, city)
            if address.startswith(city) or address.startswith(tc_city):
                city_raw = city
                break
        if not city_raw:
            return None  # Skip unknown cities

    # Department count for service inference
    dept_count = len([d for d in dept_str.split(",") if d.strip()])

    # Look up existing entry for website URL
    existing = existing_map.get(name)
    if not existing:
        # Try partial match
        for ex_name, ex_data in existing_map.items():
            if ex_name in name or name in ex_name:
                existing = ex_data
                break

    website = (existing or {}).get("website", "")

    return {
        "id": code,
        "name": name,
        "city": city_raw,
        "district": district,
        "address": address,
        "phone": format_phone(phone_raw),
        "website": website,
        "services": extract_services(dept_str, dept_count),
    }

# ─── Main ─────────────────────────────────────────────────────────────────────
def main():
    print("Reading existing hospitals.json …")
    with open(EXISTING_JSON, encoding='utf-8') as f:
        existing_list = json.load(f)
    existing_map = {h["name"]: h for h in existing_list}
    # Also index by partial/normalized name
    existing_map_norm = {}
    for h in existing_list:
        n = h["name"]
        # Remove common legal entity prefixes for fuzzy match
        short = re.sub(r'^(衛生福利部|臺北市立|新北市立|桃園市立|臺中市立|臺南市立|高雄市立|基隆市立)', '', n)
        existing_map_norm[short] = h

    print(f"  Loaded {len(existing_list)} existing entries.")

    print("Parsing ODS …")
    records = parse_ods(ODS_PATH)
    print(f"  {len(records)} total records.")

    hospitals = []
    skipped_city = 0
    for rec in records:
        entry = build_entry(rec, existing_map)
        if entry:
            hospitals.append(entry)
        elif rec.get("機構名稱") and "醫院" in rec.get("機構名稱", ""):
            skipped_city += 1

    print(f"  Built {len(hospitals)} hospital entries.")
    print(f"  Skipped {skipped_city} due to unknown city.")

    # Website coverage stats
    with_website = sum(1 for h in hospitals if h["website"])
    print(f"  Website URLs preserved: {with_website}")

    # City distribution
    from collections import Counter
    city_dist = Counter(h["city"] for h in hospitals)
    print("\nCity distribution:")
    for city, count in sorted(city_dist.items()):
        print(f"  {city}: {count}")

    print(f"\nWriting {OUTPUT_JSON} …")
    with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(hospitals, f, ensure_ascii=False, indent=2)
    print("Done!")

if __name__ == "__main__":
    main()
