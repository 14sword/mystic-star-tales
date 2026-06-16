import os
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

root = '/Users/xieqing/Desktop/后期/小案例/mystic-star-tales'
output_dir = os.path.join(root, 'assets/images')
os.makedirs(output_dir, exist_ok=True)

# Helper function to hex to RGB tuple
def hex_to_rgb(hex_str):
    hex_str = hex_str.lstrip('#')
    return tuple(int(hex_str[i:i+2], 16) for i in (0, 2, 4))

# Generate radial gradient glow
def create_glow(width, height, cx, cy, radius, color, bg_color):
    # Create float grids
    x = np.linspace(-1, 1, width)
    y = np.linspace(-1, 1, height)
    xv, yv = np.meshgrid(x, y)
    
    # Calculate distance from offset center
    dist = np.sqrt((xv - cx)**2 + (yv - cy)**2)
    
    # Gaussian-like soft falloff
    sigma = radius / 2.0
    glow_map = np.exp(-dist**2 / (2 * (sigma**2)))
    
    # Create RGB layers
    r = np.ones_like(glow_map) * color[0]
    g = np.ones_like(glow_map) * color[1]
    b = np.ones_like(glow_map) * color[2]
    
    rgb_glow = np.stack([r, g, b], axis=-1)
    
    # Blend with background
    bg = np.stack([
        np.ones((height, width)) * bg_color[0],
        np.ones((height, width)) * bg_color[1],
        np.ones((height, width)) * bg_color[2]
    ], axis=-1)
    
    blended = bg + (rgb_glow - bg) * np.expand_dims(glow_map, axis=-1)
    blended = np.clip(blended, 0, 255).astype(np.uint8)
    
    return Image.fromarray(blended)

# Draw elegant stardust/star field
def draw_stars(image, count, color):
    draw = ImageDraw.Draw(image)
    w, h = image.size
    np.random.seed(42) # Deterministic
    xs = np.random.randint(0, w, count)
    ys = np.random.randint(0, h, count)
    sizes = np.random.choice([1, 2, 3], count, p=[0.7, 0.2, 0.1])
    
    for x, y, size in zip(xs, ys, sizes):
        if size == 1:
            draw.point((x, y), fill=color)
        else:
            r = size - 1
            draw.ellipse([x - r, y - r, x + r, y + r], fill=color)

# Draw gold geometry (concentric circles, orbits, star alignments)
def draw_sacred_geometry(image, style, color):
    draw = ImageDraw.Draw(image)
    w, h = image.size
    cx, cy = w // 2, h // 2
    
    if style == 'portal':
        # Concentric circles and golden gate lines
        for r in [120, 240, 360]:
            draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=color, width=2)
        draw.line([cx - 400, cy, cx + 400, cy], fill=color, width=1)
        draw.line([cx, cy - 400, cx, cy + 400], fill=color, width=1)
    
    elif style == 'sunburst':
        # Radiating lines from center
        for i in range(16):
            angle = i * (2 * math.pi / 16)
            x2 = cx + int(450 * math.cos(angle))
            y2 = cy + int(450 * math.sin(angle))
            draw.line([cx, cy, x2, y2], fill=color, width=1)
        draw.ellipse([cx - 80, cy - 80, cx + 80, cy + 80], outline=color, width=3)
        draw.ellipse([cx - 160, cy - 160, cx + 160, cy + 160], outline=color, width=1)
        
    elif style == 'cave':
        # Outer rays with dark inner center
        for i in range(32):
            angle = i * (2 * math.pi / 32)
            x1 = cx + int(180 * math.cos(angle))
            y1 = cy + int(180 * math.sin(angle))
            x2 = cx + int(480 * math.cos(angle))
            y2 = cy + int(480 * math.sin(angle))
            draw.line([x1, y1, x2, y2], fill=color, width=1)
        draw.ellipse([cx - 180, cy - 180, cx + 180, cy + 180], outline=color, width=2)
        
    elif style == 'mirror':
        # Hexagonal pattern and mirror circle
        draw.ellipse([cx - 200, cy - 200, cx + 200, cy + 200], outline=color, width=3)
        for i in range(6):
            angle = i * (2 * math.pi / 6)
            x = cx + int(200 * math.cos(angle))
            y = cy + int(200 * math.sin(angle))
            draw.line([cx, cy, x, y], fill=color, width=1)
            draw.ellipse([x - 15, y - 15, x + 15, y + 15], outline=color, width=2)
            
    elif style == 'hill':
        # Elegant landscape curve and portal
        draw.arc([cx - 600, cy - 100, cx + 600, cy + 800], start=180, end=360, fill=color, width=3)
        # Gateway
        draw.rectangle([cx - 60, cy - 120, cx + 60, cy + 300], outline=color, width=2)
        draw.arc([cx - 60, cy - 180, cx + 60, cy - 60], start=180, end=360, fill=color, width=2)
        
    elif style == 'dance':
        # Circular ring of nodes
        draw.ellipse([cx - 240, cy - 240, cx + 240, cy + 240], outline=color, width=1)
        for i in range(8):
            angle = i * (2 * math.pi / 8)
            x = cx + int(240 * math.cos(angle))
            y = cy + int(240 * math.sin(angle))
            draw.ellipse([x - 20, y - 20, x + 20, y + 20], outline=color, width=2)
            draw.ellipse([x - 5, y - 5, x + 5, y + 5], fill=color)

    elif style == 'chalice':
        # Cup shape outline
        draw.line([cx - 60, cy + 180, cx + 60, cy + 180], fill=color, width=3)
        draw.line([cx, cy + 80, cx, cy + 180], fill=color, width=2)
        draw.ellipse([cx - 100, cy - 100, cx + 100, cy + 100], outline=color, width=2)
        draw.rectangle([cx - 110, cy - 110, cx + 110, cy], fill=(0, 0, 0, 0)) # erase top half
        draw.line([cx - 100, cy, cx + 100, cy], fill=color, width=2)
        
    elif style == 'druid':
        # Tree branch outlines and stone pillars
        draw.line([cx - 200, cy + 300, cx - 200, cy - 50], fill=color, width=4)
        draw.line([cx + 200, cy + 300, cx + 200, cy - 50], fill=color, width=4)
        draw.line([cx - 240, cy - 50, cx - 160, cy - 50], fill=color, width=3)
        draw.line([cx + 160, cy - 50, cx + 240, cy - 50], fill=color, width=3)
        # Branches overlay
        draw.arc([cx - 400, cy - 400, cx + 400, cy + 400], start=210, end=330, fill=color, width=2)

    elif style == 'serpent':
        # Sinusoidal wavy tracks
        pts = []
        for py in range(100, 924, 10):
            px = cx + int(150 * math.sin(py / 80.0))
            pts.append((px, py))
        draw.line(pts, fill=color, width=3)
        # Wings arcs
        for py in range(200, 800, 150):
            px = cx + int(150 * math.sin(py / 80.0))
            draw.arc([px - 100, py - 50, px + 100, py + 50], start=0, end=360, fill=color, width=1)

    elif style == 'corn':
        # Diamond seed lattice
        for r in range(-3, 4):
            for c in range(-3, 4):
                if (r + c) % 2 == 0:
                    px = cx + c * 60
                    py = cy + r * 80
                    draw.polygon([
                        (px, py - 25), (px + 18, py),
                        (px, py + 25), (px - 18, py)
                    ], outline=color, width=1)
                    
    elif style == 'calendar':
        # Circular gear teeth
        draw.ellipse([cx - 220, cy - 220, cx + 220, cy + 220], outline=color, width=3)
        draw.ellipse([cx - 140, cy - 140, cx + 140, cy + 140], outline=color, width=2)
        for i in range(24):
            angle = i * (2 * math.pi / 24)
            x1 = cx + int(220 * math.cos(angle))
            y1 = cy + int(220 * math.sin(angle))
            x2 = cx + int(240 * math.cos(angle))
            y2 = cy + int(240 * math.sin(angle))
            draw.line([x1, y1, x2, y2], fill=color, width=2)

    elif style == 'pyramid':
        # Step-pyramid outline
        draw.polygon([(cx, cy - 120), (cx - 300, cy + 280), (cx + 300, cy + 280)], outline=color, width=2)
        for h_off in range(-60, 280, 50):
            ratio = (280 - h_off) / 400.0
            w_half = int(300 * ratio)
            draw.line([cx - w_half, cy + h_off, cx + w_half, cy + h_off], fill=color, width=1)

    elif style == 'feather':
        # Feather quill and barbs
        draw.line([cx - 100, cy + 300, cx + 100, cy - 300], fill=color, width=3)
        for i in range(-15, 16):
            t = i / 20.0
            px = cx + int(100 * t)
            py = cy - int(300 * t)
            # draw diagonal barbs
            draw.line([px, py, px + 80, py - 40], fill=color, width=1)
            draw.line([px, py, px - 80, py + 40], fill=color, width=1)

    elif style == 'snow':
        # Hexagonal snowflake patterns
        for i in range(6):
            angle = i * (2 * math.pi / 6)
            x2 = cx + int(250 * math.cos(angle))
            y2 = cy + int(250 * math.sin(angle))
            draw.line([cx, cy, x2, y2], fill=color, width=2)
            # Draw branches
            bx = cx + int(150 * math.cos(angle))
            by = cy + int(150 * math.sin(angle))
            for ba in [angle - math.pi/4, angle + math.pi/4]:
                bx2 = bx + int(40 * math.cos(ba))
                by2 = by + int(40 * math.sin(ba))
                draw.line([bx, by, bx2, by2], fill=color, width=1)

    elif style == 'lamp':
        # Teapot/Oil Lamp shape outline
        draw.ellipse([cx - 120, cy + 20, cx + 120, cy + 180], outline=color, width=2)
        # Handle
        draw.arc([cx - 180, cy + 40, cx - 100, cy + 160], start=90, end=270, fill=color, width=2)
        # Spout
        draw.line([cx + 120, cy + 100, cx + 240, cy + 40], fill=color, width=2)
        draw.line([cx + 110, cy + 140, cx + 240, cy + 40], fill=color, width=2)

    elif style == 'smoke':
        # Spiral smoking trail
        pts = []
        for t in np.linspace(0, 10 * math.pi, 200):
            r_val = 10 + t * 8
            px = cx + int(r_val * math.cos(t))
            py = cy + 250 - int(t * 18)
            pts.append((px, py))
        draw.line(pts, fill=color, width=2)

    elif style == 'carpet':
        # Flying carpet parallelogram outline
        p1 = (cx - 240, cy + 80)
        p2 = (cx + 120, cy - 120)
        p3 = (cx + 240, cy - 80)
        p4 = (cx - 120, cy + 120)
        draw.polygon([p1, p2, p3, p4], outline=color, width=2)
        # Fringe lines
        for offset in range(-120, 120, 15):
            draw.line([cx + offset - 60, cy + 100 + int(offset/3), cx + offset - 55, cy + 110 + int(offset/3)], fill=color, width=1)

# Main generator dictionary
specs = {
    'anubis': {
        'bg': '#090f18', 'accent': '#d4b36f', 'teal': '#5fa9c7',
        'frames': [
            (4, 'portal', 0.1, 0.1, 0.45) # frame 4
        ]
    },
    'amaterasu': {
        'bg': '#101018', 'accent': '#e3b65e', 'teal': '#f2dfaa',
        'frames': [
            (1, 'sunburst', 0.0, -0.4, 0.35),
            (2, 'cave', 0.0, 0.0, 0.2),
            (3, 'mirror', 0.2, 0.2, 0.35),
            (4, 'sunburst', 0.0, 0.0, 0.5)
        ]
    },
    'sidhe': {
        'bg': '#07131c', 'accent': '#b7c77a', 'teal': '#82c8bd',
        'frames': [
            (1, 'hill', 0.0, 0.4, 0.4),
            (2, 'dance', 0.0, 0.0, 0.3),
            (3, 'chalice', 0.0, 0.1, 0.3),
            (4, 'druid', 0.0, -0.1, 0.4)
        ]
    },
    'quetzalcoatl': {
        'bg': '#07161c', 'accent': '#d2aa53', 'teal': '#49c8a7',
        'frames': [
            (1, 'serpent', 0.0, 0.0, 0.4),
            (2, 'corn', 0.0, 0.2, 0.3),
            (3, 'calendar', 0.0, 0.0, 0.35),
            (4, 'pyramid', 0.0, 0.1, 0.4)
        ]
    },
    'firebird': {
        'bg': '#130d12', 'accent': '#ff9d3d', 'teal': '#ffd27a',
        'frames': [
            (1, 'sunburst', 0.0, 0.0, 0.4), # orchard star
            (2, 'portal', -0.2, 0.1, 0.3), # ride search
            (3, 'feather', 0.0, 0.0, 0.35),
            (4, 'sunburst', 0.0, 0.0, 0.55) # spring light
        ]
    },
    'genie': {
        'bg': '#07111e', 'accent': '#d9ad64', 'teal': '#64c9d7',
        'frames': [
            (1, 'lamp', 0.0, 0.2, 0.3),
            (2, 'smoke', 0.0, 0.0, 0.4),
            (3, 'carpet', 0.0, 0.0, 0.35),
            (4, 'portal', 0.0, 0.0, 0.45)
        ]
    }
}

print("Starting custom frames generation...")

for story_id, config in specs.items():
    bg_rgb = hex_to_rgb(config['bg'])
    accent_rgb = hex_to_rgb(config['accent'])
    teal_rgb = hex_to_rgb(config['teal'])
    
    # Gold line color for sacred geometry
    gold_color = accent_rgb
    
    for frame_idx, style, cx, cy, radius in config['frames']:
        filename = f"{story_id}_frame_{frame_idx}.png"
        path = os.path.join(output_dir, filename)
        
        print(f"Generating {filename} with style '{style}'...")
        
        # Create base background with glowing radial nebulae
        img = create_glow(1024, 1024, cx, cy, radius, teal_rgb, bg_rgb)
        
        # Draw ambient stars
        draw_stars(img, 120, (255, 255, 255))
        draw_stars(img, 40, gold_color)
        
        # Draw sacred geometry outlines (simulating constellation star-maps)
        draw_sacred_geometry(img, style, gold_color)
        
        # Apply slight blur to make lines look like glowing light
        blurred = img.filter(ImageFilter.GaussianBlur(1.2))
        
        # Blend original sharp geometry on top slightly for definition
        img_final = Image.blend(img, blurred, 0.5)
        
        img_final.save(path, 'PNG')
        print(f"Saved {path}")

print("All custom frame assets successfully generated!")
