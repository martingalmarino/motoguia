"""Genera fotos de escenario 4:3 sobre blanco para las tarjetas y fichas.

Uso: python3 scripts/normalize-images.py

Lee public/images/motos/<archivo> y escribe public/images/motos/stage/<id>-{600,1200}.webp.
Los originales no se modifican.
"""

from pathlib import Path

from PIL import Image, ImageChops, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'public' / 'images' / 'motos'
OUT = SRC / 'stage'
W, H = 1200, 900
# Fotos de ambiente o con placas de texto: se recortan a mano a 4:3 sin tocar la moto.
MANUAL_CROPS = {
    'sunra-future.jpg': (0, 188, 700, 713),
    'sunra-miku-max.jpg': (17, 215, 684, 715),
}
COVER = {'mondial-ld-110-max.jpg'}


def content_box(img: Image.Image):
    if img.mode == 'RGBA':
        mask = img.getchannel('A').point(lambda v: 255 if v > 12 else 0)
    else:
        rgb = img.convert('RGB')
        white = Image.new('RGB', rgb.size, (255, 255, 255))
        mask = ImageChops.difference(rgb, white).convert('L').point(lambda v: 255 if v > 22 else 0)
    # La erosión descarta líneas finas de diseño y bordes sucios; después se recupera el margen.
    box = mask.filter(ImageFilter.MinFilter(9)).getbbox()
    if not box:
        return mask.getbbox()
    pad = 6
    return (max(box[0] - pad, 0), max(box[1] - pad, 0), min(box[2] + pad, img.width), min(box[3] + pad, img.height))


def on_white(img: Image.Image) -> Image.Image:
    if img.mode != 'RGBA':
        return img.convert('RGB')
    base = Image.new('RGB', img.size, (255, 255, 255))
    base.paste(img, mask=img.getchannel('A'))
    return base


def stage(name: str) -> Image.Image:
    img = Image.open(SRC / name)
    img = img.convert('RGBA') if 'A' in img.getbands() or img.mode == 'P' else img.convert('RGB')
    if name in MANUAL_CROPS:
        return on_white(img).crop(MANUAL_CROPS[name]).resize((W, H), Image.LANCZOS)
    if name in COVER:
        rgb = on_white(img)
        target_w = round(rgb.height * 4 / 3)
        left = (rgb.width - target_w) // 2
        return rgb.crop((left, 0, left + target_w, rgb.height)).resize((W, H), Image.LANCZOS)
    box = content_box(img) or (0, 0, img.width, img.height)
    bike = on_white(img).crop(box)
    ratio = bike.width / bike.height
    # Motos anchas ocupan ~86 % del ancho; las altas se limitan por alto para no tocar el borde.
    max_w, max_h = W * 0.86, H * 0.78
    scale = min(max_w / bike.width, max_h / bike.height)
    if ratio < 1.15:
        scale = min(scale, (H * 0.8) / bike.height)
    size = (round(bike.width * scale), round(bike.height * scale))
    bike = bike.resize(size, Image.LANCZOS)
    canvas = Image.new('RGB', (W, H), (255, 255, 255))
    x = (W - size[0]) // 2
    y = (H - size[1]) // 2 + round(H * 0.02)
    canvas.paste(bike, (x, y))
    return canvas


def main():
    OUT.mkdir(exist_ok=True)
    for path in sorted(SRC.iterdir()):
        if path.is_dir() or path.suffix.lower() not in {'.png', '.jpg', '.jpeg', '.webp'}:
            continue
        result = stage(path.name)
        stem = path.stem
        result.save(OUT / f'{stem}-1200.webp', 'WEBP', quality=82, method=6)
        result.resize((600, 450), Image.LANCZOS).save(OUT / f'{stem}-600.webp', 'WEBP', quality=80, method=6)
        print(stem)


if __name__ == '__main__':
    main()
