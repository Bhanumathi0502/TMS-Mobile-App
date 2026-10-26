from pathlib import Path
from PIL import Image, ImageOps

root = Path(__file__).resolve().parent
assets = root / 'assets'
assets.mkdir(exist_ok=True)

logo = Image.open(assets / 'TMS.png').convert('RGBA')
icon = Image.new('RGBA', (1024, 1024), (255, 255, 255, 255))
contained = ImageOps.contain(logo, (960, 960), method=Image.Resampling.LANCZOS)
icon.alpha_composite(contained, ((1024 - contained.width) // 2, (1024 - contained.height) // 2))
icon.save(assets / 'tms-icon.png')

print('Created', assets / 'tms-icon.png', 'from', assets / 'TMS.png')
