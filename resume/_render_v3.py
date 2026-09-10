# -*- coding: utf-8 -*-
"""v3 pptx를 슬라이드별 PNG(2560x1440)와 PDF로 내보낸다. 정렬 육안 검증용."""
import os, sys, glob
import win32com.client

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "박종혁_PM_포트폴리오_v3.pptx")
PNG = os.path.join(HERE, "_v3_png")
PDF = os.path.join(HERE, "박종혁_PM_포트폴리오_v3.pdf")

os.makedirs(PNG, exist_ok=True)
for f in glob.glob(os.path.join(PNG, "*.png")):
    os.remove(f)

app = win32com.client.Dispatch("PowerPoint.Application")
pres = app.Presentations.Open(SRC, WithWindow=False)
for i, sl in enumerate(pres.Slides, 1):
    sl.Export(os.path.join(PNG, "s%02d.png" % i), "PNG", 2560, 1440)
pres.SaveAs(PDF, 32)
pres.Close()
app.Quit()
print("png:", len(glob.glob(os.path.join(PNG, "*.png"))))
print("pdf:", PDF)
