from pathlib import Path
import re
import sys

from pypdf import PdfReader

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

pdf_path = Path(r"C:\MyMain\관세청\documents\godomall5_openAPI_spec_v1.0_20250616.pdf")
reader = PdfReader(str(pdf_path))
keywords = (
    "partner_key",
    "secret_key",
    "openhub",
    "http://",
    "https://",
    "data_url",
    "lastOrder",
    "size",
    "x-godo",
)

print(f"pages={len(reader.pages)}")
for page_no, page in enumerate(reader.pages, start=1):
    text = page.extract_text() or ""
    if any(keyword.casefold() in text.casefold() for keyword in keywords):
        compact = re.sub(r"\s+", " ", text).strip()
        matches = []
        lowered = compact.casefold()
        for keyword in keywords:
            idx = lowered.find(keyword.casefold())
            if idx >= 0:
                start = max(0, idx - 220)
                end = min(len(compact), idx + 650)
                matches.append(compact[start:end])
        deduped = []
        for match in matches:
            if match not in deduped:
                deduped.append(match)
        print(f"\nPAGE {page_no}")
        for match in deduped[:5]:
            print(match)
