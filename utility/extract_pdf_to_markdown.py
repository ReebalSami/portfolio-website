"""
PDF to Markdown Extraction Utility.

Usage:
    python utility/extract_pdf_to_markdown.py <pdf_filename>
    python utility/extract_pdf_to_markdown.py --all
    python utility/extract_pdf_to_markdown.py --missing

Arguments:
    <pdf_filename>  Name of the PDF file (searches in root and pdf/ subdirectory)
    --all           Extract all PDFs found in root and pdf/ subdirectory
    --missing       Only extract PDFs that don't already have a .md counterpart

Output:
    Creates a .md file next to the source PDF (same name, .md extension).
"""

import pdfplumber
import sys
import os
from pathlib import Path


# Project root and Bewerbung directory
PROJECT_ROOT = Path(__file__).resolve().parent.parent
BEWERBUNG_DIR = PROJECT_ROOT / "Bewerbung"
PDF_SUBDIRS = [BEWERBUNG_DIR, BEWERBUNG_DIR / "pdf"]


def find_pdf(pdf_name: str) -> Path | None:
    """Find a PDF file by name in known directories."""
    for directory in PDF_SUBDIRS:
        candidate = directory / pdf_name
        if candidate.exists():
            return candidate
    # Try as absolute path
    candidate = Path(pdf_name)
    if candidate.exists():
        return candidate
    return None


def get_all_pdfs() -> list[Path]:
    """Get all PDF files from known directories."""
    pdfs = []
    for directory in PDF_SUBDIRS:
        if directory.exists():
            pdfs.extend(sorted(directory.glob("*.pdf")))
    return pdfs


def get_md_path(pdf_path: Path) -> Path:
    """Get the corresponding markdown output path for a PDF."""
    return pdf_path.with_suffix(".md")


def extract_text_from_pdf(pdf_path: Path) -> str | None:
    """
    Extract text content from a PDF using pdfplumber.

    Parameters:
        pdf_path: Path to the PDF file.

    Returns:
        Extracted text as string, or None if extraction fails.
    """
    print(f"  Processing: {pdf_path.name}")

    try:
        text_parts = []
        with pdfplumber.open(pdf_path) as pdf:
            for i, page in enumerate(pdf.pages):
                extracted = page.extract_text()
                if extracted:
                    text_parts.append(f"<!-- Page {i + 1} -->\n{extracted}")
                else:
                    text_parts.append(f"<!-- Page {i + 1}: No text extracted -->")

        full_text = "\n\n".join(text_parts)

        if len(full_text.strip()) < 50:
            print(f"  WARNING: Very little text extracted ({len(full_text.strip())} chars). "
                  "PDF may be image-based (OCR not attempted).")
            return full_text if full_text.strip() else None

        return full_text

    except Exception as e:
        print(f"  ERROR: Extraction failed for {pdf_path.name}: {e}")
        return None


def save_as_markdown(text: str, md_path: Path, source_pdf: str) -> None:
    """Save extracted text to a markdown file with metadata header."""
    header = (
        f"# {source_pdf}\n\n"
        f"> Auto-extracted from `{source_pdf}` using pdfplumber.\n\n"
        f"---\n\n"
    )
    md_path.write_text(header + text, encoding="utf-8")
    print(f"  Saved: {md_path.relative_to(PROJECT_ROOT)}")


def process_pdf(pdf_path: Path, skip_existing: bool = False) -> bool:
    """
    Extract a single PDF to markdown.

    Parameters:
        pdf_path: Path to the PDF.
        skip_existing: If True, skip if .md already exists.

    Returns:
        True if extraction was performed, False if skipped or failed.
    """
    md_path = get_md_path(pdf_path)

    if skip_existing and md_path.exists():
        print(f"  SKIP (already exists): {md_path.name}")
        return False

    text = extract_text_from_pdf(pdf_path)
    if text:
        save_as_markdown(text, md_path, pdf_path.name)
        return True
    else:
        print(f"  FAILED: No content extracted from {pdf_path.name}")
        return False


def main() -> None:
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    arg = sys.argv[1]

    if arg == "--all":
        pdfs = get_all_pdfs()
        print(f"Found {len(pdfs)} PDF(s). Extracting all...\n")
        success = sum(1 for p in pdfs if process_pdf(p, skip_existing=False))
        print(f"\nDone. Extracted {success}/{len(pdfs)} PDFs.")

    elif arg == "--missing":
        pdfs = get_all_pdfs()
        missing = [p for p in pdfs if not get_md_path(p).exists()]
        print(f"Found {len(pdfs)} PDF(s), {len(missing)} missing markdown.\n")
        success = sum(1 for p in missing if process_pdf(p, skip_existing=False))
        print(f"\nDone. Extracted {success}/{len(missing)} PDFs.")

    else:
        pdf_path = find_pdf(arg)
        if pdf_path is None:
            print(f"ERROR: PDF not found: {arg}")
            print(f"Searched in: {', '.join(str(d) for d in PDF_SUBDIRS)}")
            sys.exit(1)
        process_pdf(pdf_path)


if __name__ == "__main__":
    main()
