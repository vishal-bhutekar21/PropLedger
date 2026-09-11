import os
import sys
import fitz

sys.path.append(os.path.dirname(__file__))

from generate_doc_01 import build_doc_01
from generate_doc_02 import build_doc_02
from generate_doc_03 import build_doc_03
from generate_doc_04 import build_doc_04
from generate_doc_05 import build_doc_05
from generate_doc_06 import build_doc_06
from generate_doc_07 import build_doc_07
from generate_doc_08 import build_doc_08
from generate_doc_09 import build_doc_09
from generate_doc_10 import build_doc_10

def build_all_pdfs():
    output_dir = "docs/pdf"
    os.makedirs(output_dir, exist_ok=True)

    generators = [
        ("01_Enterprise_System_Architecture.pdf", build_doc_01),
        ("02_Database_Schema_And_Data_Modeling.pdf", build_doc_02),
        ("03_Advanced_SQL_And_Analytics_Engine.pdf", build_doc_03),
        ("04_Normalization_Indexing_And_Performance.pdf", build_doc_04),
        ("05_Transactions_Concurrency_And_ACID.pdf", build_doc_05),
        ("06_Identity_JWT_And_Spring_Security.pdf", build_doc_06),
        ("07_Spring_Boot_API_And_Domain_Services.pdf", build_doc_07),
        ("08_Financial_Subledger_And_Billing_Engine.pdf", build_doc_08),
        ("09_Frontend_Architecture_And_React19.pdf", build_doc_09),
        ("10_FullStack_Integration_And_Interview_Handbook.pdf", build_doc_10),
    ]

    print("=" * 80)
    print("PROPLEDGER: GENERATING 10-VOLUME ENTERPRISE ARCHITECTURE PDF SUITE")
    print("=" * 80)

    results = []
    for filename, fn in generators:
        filepath = os.path.join(output_dir, filename)
        pages_returned = fn(filepath)
        
        # Verify page count directly with PyMuPDF
        doc = fitz.open(filepath)
        actual_pages = len(doc)
        doc.close()

        file_size_kb = os.path.getsize(filepath) / 1024.0
        results.append((filename, actual_pages, file_size_kb))

    print("\n" + "=" * 80)
    print(f"{'Volume File':<52} | {'Pages':<6} | {'Size (KB)':<10} | {'Status'}")
    print("-" * 80)
    
    all_ten = True
    for filename, pages, size in results:
        status = "PASSED (10/10)" if pages == 10 else f"FAILED ({pages}/10)"
        if pages != 10:
            all_ten = False
        print(f"{filename:<52} | {pages:<6} | {size:>8.1f} KB | {status}")

    print("=" * 80)
    total_pages = sum(r[1] for r in results)
    total_size = sum(r[2] for r in results)
    print(f"Total PDFs: 10 | Total Pages: {total_pages} | Total Size: {total_size:.1f} KB")
    print("All PDFs generated exactly with 10 pages!" if all_ten else "WARNING: Page count mismatch detected.")
    print("=" * 80)

if __name__ == "__main__":
    build_all_pdfs()
