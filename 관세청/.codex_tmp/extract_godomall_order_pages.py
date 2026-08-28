from pathlib import Path
import sys

from pypdf import PdfReader

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

pdf_path = Path(r"C:\MyMain\관세청\documents\godomall5_openAPI_spec_v1.0_20250616.pdf")
reader = PdfReader(str(pdf_path))

for page_no, page in enumerate(reader.pages, start=1):
    page_text = page.extract_text() or ""
    if "4.1. 주문조회" in page_text or "Order_Search.php" in page_text:
        print(f"\n===== PAGE {page_no} =====")
        print(page_text)

for page_no in range(51, 62):
    page_text = reader.pages[page_no - 1].extract_text() or ""
    print(f"\n===== PAGE {page_no} =====")
    print(page_text)

for page_no in (11, 12, 13):
    page_text = reader.pages[page_no - 1].extract_text() or ""
    print(f"\n===== PAGE {page_no} =====")
    print(page_text)
