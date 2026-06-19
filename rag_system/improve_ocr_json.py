"""
Utility to enrich and normalize existing OCR JSONL output without re-running OCR.

Usage:
    python improve_ocr_json.py \
        --input storage/ocr_pages.jsonl \
        --output storage/ocr_pages_improved.jsonl \
        --overwrite
"""

from __future__ import annotations

import argparse
import hashlib
import json
import unicodedata
import re
from datetime import datetime, timezone
from pathlib import Path
from collections import Counter, defaultdict


def normalize_text(value: str) -> str:
    if not isinstance(value, str):
        return ""
    text = value.replace("\r", "\n")
    text = text.replace("\u200f", "")
    text = text.replace("\u200e", "")
    text = text.replace("\ufeff", "")
    text = unicodedata.normalize("NFKC", text)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r" ?\n ?", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def is_page_number_line(line: str) -> bool:
    return bool(re.match(r"^\s*(page\s*\d+|pg\.?\s*\d+|[\d]+)\s*$", line, re.IGNORECASE))


def is_section_like(line: str) -> bool:
    clean = line.strip()
    if not clean or len(clean) < 4:
        return False
    if len(clean) > 180:
        return False

    word_count = len(clean.split())
    if word_count > 16:
        return False

    has_letters = any(ch.isalpha() for ch in clean)
    if not has_letters:
        return False

    digits_ratio = sum(ch.isdigit() for ch in clean) / max(len(clean), 1)
    if digits_ratio > 0.25:
        return False

    upper_ratio = sum(ch.isupper() for ch in clean) / max(1, sum(ch.isalpha() for ch in clean))
    ends_with_colon = clean.endswith(":")
    has_title_case = any(ch.isupper() for ch in clean) and clean[0].isupper()
    return ends_with_colon or upper_ratio > 0.6 or has_title_case


def is_table_row(line: str) -> bool:
    tokens = [t for t in re.split(r"\s+", line.strip()) if t]
    if len(tokens) < 4:
        return False
    digits = sum(1 for t in tokens if re.fullmatch(r"[-+]?\d{1,3}(?:,\d{3})*(?:\.\d+)?|[-+]?\d+\.\d+", t))
    numeric_like = digits / max(len(tokens), 1)
    punct_ratio = sum(1 for ch in line if ch in ".,:%()[]{}-") / max(len(line), 1)
    return (numeric_like >= 0.35 and len(tokens) >= 5) or (numeric_like >= 0.55 and punct_ratio > 0.02)


def infer_document_headers_footers(records: list[dict]) -> tuple[set[str], set[str]]:
    if not records:
        return set(), set()

    doc_pages = {}
    for rec in records:
        doc_pages.setdefault(str(rec.get("path", rec.get("source", ""))), 0)
        doc_pages[str(rec.get("path", rec.get("source", "")))] += 1

    # Group lines by side-of-page position and document
    top_pool = defaultdict(Counter)
    bottom_pool = defaultdict(Counter)

    for rec in records:
        doc_key = str(rec.get("path", rec.get("source", "")))
        lines = [ln.strip() for ln in str(rec.get("text", "")).splitlines() if ln.strip()]
        if not lines:
            continue
        for ln in lines[:4]:
            top_pool[doc_key][ln] += 1
        for ln in lines[-4:]:
            bottom_pool[doc_key][ln] += 1

    known_headers = set()
    known_footers = set()
    for doc_key, total in doc_pages.items():
        if total == 0:
            continue
        threshold = max(2, int(total * 0.45))
        for line, count in top_pool[doc_key].items():
            if count >= threshold and len(line) <= 150:
                known_headers.add(line)
        for line, count in bottom_pool[doc_key].items():
            if count >= threshold and len(line) <= 150:
                known_footers.add(line)
    return known_headers, known_footers


def make_record_id(source: str, path: str, page: int, index: int) -> str:
    raw = f"{path}:{page}:{index}:{len(source)}"
    return hashlib.sha1(raw.encode("utf-8", errors="ignore")).hexdigest()


def make_doc_id(path: str) -> str:
    return hashlib.sha1(path.encode("utf-8", errors="ignore")).hexdigest()


def detect_language(text: str) -> str | None:
    if not text:
        return None
    urdu_hits = sum(1 for ch in text if "\u0600" <= ch <= "\u06ff")
    latin_hits = sum(1 for ch in text if "A" <= ch <= "z")
    if urdu_hits > latin_hits:
        return "ur"
    if latin_hits >= urdu_hits and latin_hits > 0:
        return "en"
    return None


def enhance_record(record: dict, index: int) -> dict:
    raw_text = str(record.get("text", ""))
    clean_text = normalize_text(raw_text)

    source = str(record.get("source", ""))
    path = str(record.get("path", ""))
    page = int(record.get("page", 0))
    doc_id = make_doc_id(path or source)
    record_id = make_record_id(source, path, page, index)

    words = re.findall(r"\S+", clean_text)
    lines = [line for line in clean_text.split("\n") if line.strip()]

    enhanced = dict(record)
    enhanced.setdefault("text_raw", raw_text)
    enhanced["text"] = clean_text
    enhanced["text_normalized"] = clean_text
    enhanced["record_id"] = record_id
    enhanced["doc_id"] = doc_id
    enhanced["lang"] = detect_language(clean_text)
    enhanced["text_char_count"] = len(clean_text)
    enhanced["text_word_count"] = len(words)
    enhanced["line_count"] = len(lines)
    enhanced["source_base"] = source
    enhanced["path"] = path
    enhanced["generated_at"] = datetime.now(timezone.utc).isoformat()
    enhanced["text_hash_sha256"] = hashlib.sha256(
        clean_text.encode("utf-8", errors="ignore")
    ).hexdigest()
    return enhanced


def detect_sections_and_layout_lines(lines: list[str]) -> tuple[list[dict], list[dict], list[dict]]:
    sections = []
    removed = []
    table_regions = []

    current_section = "body"
    if lines:
        sections.append({
            "name": current_section,
            "start_line": 0,
        })

    table_start = None
    table_count = 0

    for index, line in enumerate(lines):
        clean_line = line.strip()
        if not clean_line:
            continue

        if is_section_like(clean_line):
            current_section = clean_line[:180]
            # close previous section
            if sections and sections[-1]["name"] == "body":
                sections[-1]["end_line"] = index - 1
            elif sections and sections[-1]["name"] != "body":
                if index - 1 >= sections[-1]["start_line"]:
                    sections[-1]["end_line"] = index - 1
            if not sections or sections[-1]["name"] != current_section:
                sections.append({"name": current_section, "start_line": index})

        if is_table_row(clean_line):
            if table_start is None:
                table_start = index
                table_count += 1
            table_regions.append({
                "line": index,
                "text": clean_line,
                "type": "table_like_row",
            })
        else:
            if table_start is not None:
                table_start = None

    if sections:
        sections[-1]["end_line"] = len(lines) - 1

    table_summary = []
    if table_regions:
        start = table_regions[0]["line"]
        prev = start
        last = start
        for idx in range(1, len(table_regions)):
            line_no = table_regions[idx]["line"]
            if line_no == prev + 1:
                prev = line_no
            else:
                table_summary.append({
                    "start_line": start,
                    "end_line": prev,
                    "rows": prev - start + 1,
                    "table": True,
                })
                start = line_no
                prev = line_no
        table_summary.append({
            "start_line": start,
            "end_line": prev,
            "rows": prev - start + 1,
            "table": True,
        })

    return sections, removed, [
        {
            **region,
            "section": next(
                (section["name"] for section in sections if section["start_line"] <= region["line"] <= section["end_line"]),
                "body",
            )
        } for region in table_regions
    ], table_summary


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", default="storage/ocr_pages.jsonl")
    parser.add_argument("--output", default="storage/ocr_pages_improved.jsonl")
    parser.add_argument("--overwrite", action="store_true")
    args = parser.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output)

    if not input_path.exists():
        raise FileNotFoundError(f"OCR JSONL file not found: {input_path}")

    with input_path.open("r", encoding="utf-8") as f:
        lines = [line for line in f if line.strip()]

    parsed = [json.loads(line) for line in lines]
    known_headers, known_footers = infer_document_headers_footers(parsed)

    improved = []
    for idx, record in enumerate(parsed):
        source = str(record.get("source", ""))
        path = str(record.get("path", ""))
        text_lines = [
            ln.strip()
            for ln in str(record.get("text", "")).splitlines()
            if ln.strip()
        ]

        filtered_lines = []
        removed_meta = []
        for line_no, line in enumerate(text_lines):
            if is_page_number_line(line):
                removed_meta.append({"line_no": line_no, "text": line, "type": "page-number"})
                continue
            if line in known_headers:
                removed_meta.append({"line_no": line_no, "text": line, "type": "header"})
                continue
            if line in known_footers:
                removed_meta.append({"line_no": line_no, "text": line, "type": "footer"})
                continue
            filtered_lines.append(line)

        record["text"] = "\n".join(filtered_lines)
        updated = enhance_record(record, idx)

        sections, removed_sections, table_lines, table_summary = detect_sections_and_layout_lines(filtered_lines)

        # Merge page layout removals with section detection leftovers
        removed_meta.extend(removed_sections)
        updated["removed_lines"] = removed_meta
        updated["sections"] = sections
        updated["table_lines"] = table_lines
        updated["table_regions"] = table_summary
        updated["table_detected"] = bool(table_summary)
        updated["table_line_count"] = len(table_lines)
        updated["path"] = path
        updated["source"] = source
        improved.append(updated)

    if args.overwrite:
        backup_path = input_path.with_suffix(".jsonl.bak")
        input_path.replace(backup_path)
        output_path = input_path
        print(f"Backup created at: {backup_path}")

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as f:
        for item in improved:
            f.write(json.dumps(item, ensure_ascii=False) + "\n")

    print(f"Improved records written: {len(improved)}")
    print(f"Output path: {output_path}")


if __name__ == "__main__":
    main()
