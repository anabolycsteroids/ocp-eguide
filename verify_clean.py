#!/usr/bin/env python3
"""
Final verification - check for any remaining issues.
"""
import zipfile
import re
from lxml import etree

SRC = "OCP_eGuide_Rapport_Stage_Final_Clean.docx"

W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'

# Read document
with zipfile.ZipFile(SRC, 'r') as zin:
    doc_xml = zin.read('word/document.xml')
    settings_xml = zin.read('word/settings.xml')

root = etree.fromstring(doc_xml)

# 1. Check language settings on all runs
lang_set = 0
lang_not_set = 0
for t in root.iter(f'{W}t'):
    parent = t.getparent()  # w:r
    if parent is not None:
        rPr = parent.find(f'{W}rPr')
        if rPr is not None:
            lang = rPr.find(f'{W}lang')
            if lang is not None:
                lang_val = lang.get(f'{W}val', '')
                if 'fr' in lang_val.lower():
                    lang_set += 1
                else:
                    lang_not_set += 1
                    print(f"  Language not French: {lang_val}")
            else:
                lang_not_set += 1
        else:
            lang_not_set += 1

print(f"Language check: {lang_set} runs set to French, {lang_not_set} not set")

# 2. Check for grey backgrounds/shading
shading_count = 0
for pPr in root.iter(f'{W}pPr'):
    shd = pPr.find(f'{W}shd')
    if shd is not None:
        fill = shd.get(f'{W}fill', '')
        if fill and fill not in ['auto', 'FFFFFF', 'ffffff', '']:
            shading_count += 1
            print(f"  Paragraph shading: {fill}")

for tcPr in root.iter(f'{W}tcPr'):
    shd = tcPr.find(f'{W}shd')
    if shd is not None:
        fill = shd.get(f'{W}fill', '')
        if fill and fill.lower() not in ['auto', 'ffffff', '']:
            # Check if it's the OCP green (legitimate)
            if fill.upper() not in ['00A050', '00FF00', '92D050']:
                shading_count += 1
                print(f"  Table cell shading: {fill}")

print(f"Non-standard shading: {shading_count}")

# 3. Check for grey text color
grey_text = 0
for rPr in root.iter(f'{W}rPr'):
    color = rPr.find(f'{W}color')
    if color is not None:
        val = color.get(f'{W}val', '')
        if val and val.lower() not in ['000000', 'auto', '000001', '1a1a1a', '212121', '333333']:
            grey_text += 1
            if grey_text <= 10:
                print(f"  Non-black text color: {val}")

print(f"Non-black text colors: {grey_text}")

# 4. Check for spacing issues
full_text = []
for t in root.iter(f'{W}t'):
    if t.text:
        full_text.append(t.text)
full = " ".join(full_text)

double_spaces = len(re.findall(r'  +', full))
space_before_dot = len(re.findall(r' \.', full))
space_before_comma = len(re.findall(r' ,', full))
missing_space_after = len(re.findall(r'[.;:!?][a-zA-ZÀ-ÿ]', full))

print(f"\nSpacing check:")
print(f"  Double spaces: {double_spaces}")
print(f"  Spaces before '.': {space_before_dot}")
print(f"  Spaces before ',': {space_before_comma}")
print(f"  Missing space after punctuation: {missing_space_after}")

# 5. Check for "de OCP" (should be "d'OCP")
if "de OCP" in full:
    print("  WARNING: 'de OCP' found (should be \"d'OCP\")")
else:
    print("  'de OCP' → OK (not found)")

# 6. Check for common French errors
errors = []
if re.search(r'\bcomponent\b', full, re.IGNORECASE):
    errors.append("'component' found")
if re.search(r'\bfunction\b', full, re.IGNORECASE):
    errors.append("'function' found")
if re.search(r'\breturn\b', full, re.IGNORECASE):
    errors.append("'return' found")
if re.search(r'\bimport\b', full, re.IGNORECASE):
    errors.append("'import' found")
if re.search(r'\bconst\b', full, re.IGNORECASE):
    errors.append("'const' found")

if errors:
    print(f"\nEnglish code words found: {errors}")
else:
    print("\nNo English code words found")

# 7. Verify ZIP integrity
print("\nZIP integrity check:")
try:
    with zipfile.ZipFile(SRC, 'r') as z:
        bad = z.testzip()
        if bad:
            print(f"  BAD file: {bad}")
        else:
            print("  All files OK")
        
        # Check required files exist
        required = ['word/document.xml', '[Content_Types].xml', '_rels/.rels']
        for req in required:
            if req in z.namelist():
                print(f"  {req}: present")
            else:
                print(f"  {req}: MISSING!")
except Exception as e:
    print(f"  ERROR: {e}")

# 8. Verify images
print("\nImage check:")
with zipfile.ZipFile(SRC, 'r') as z:
    img_files = [f for f in z.namelist() if f.startswith('word/media/')]
    print(f"  Image files: {len(img_files)}")
    for img in img_files:
        data = z.read(img)
        is_png = data[:4] == b'\x89PNG'
        print(f"    {img}: {len(data)} bytes, PNG={is_png}")

# 9. File size
import os
size = os.path.getsize(SRC)
print(f"\nFile size: {size/1024/1024:.1f} MB")

print("\n=== VERIFICATION COMPLETE ===")
