#!/usr/bin/env python3
"""Convert SVG logo to high-quality PNG for embedding in Word document."""
import sys
sys.path.insert(0, '/home/imrane/.pyenv/versions/3.12.11/lib/python3.12/site-packages')

import cairosvg
from PIL import Image
import io

svg_path = "/mnt/c/Users/unknown/Downloads/project assets/ocp logo for free buff to use pls.svg"
png_path = "/mnt/c/Users/unknown/Downloads/project assets/ocp_logo_for_doc.png"

# Convert SVG to PNG at high resolution (4x for crisp print quality)
png_data = cairosvg.svg2png(url=svg_path, output_width=1200, output_height=1200)

# Also save a smaller version for headers
with open(png_path, 'wb') as f:
    f.write(png_data)

# Check dimensions
img = Image.open(io.BytesIO(png_data))
print(f"Logo PNG created: {png_path}")
print(f"Dimensions: {img.size[0]}x{img.size[1]} pixels")
print(f"File size: {len(png_data)} bytes")
