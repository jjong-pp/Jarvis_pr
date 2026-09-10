from pathlib import Path

from PIL import Image


RENDER_DIR = Path(r"C:\MyMain\main\resume\비나우\portfolio\rendered_v1.3")
OUTPUT_PATH = Path(r"C:\MyMain\main\resume\비나우\portfolio\output\박종혁_비나우_구매수요예측_SCM_포트폴리오_최종_v1.3.pdf")


def build() -> Path:
    paths = [RENDER_DIR / f"slide-{idx}.png" for idx in range(1, 8)]
    images = [Image.open(path).convert("RGB") for path in paths]
    try:
        first, *rest = images
        OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
        first.save(OUTPUT_PATH, "PDF", save_all=True, append_images=rest, resolution=150.0)
    finally:
        for image in images:
            image.close()
    return OUTPUT_PATH


if __name__ == "__main__":
    print(build())
