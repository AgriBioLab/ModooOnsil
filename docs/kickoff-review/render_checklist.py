from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import json
root=Path(__file__).parent
data=json.loads((root/"cards.json").read_text(encoding="utf-8"))
S=2
im=Image.new("RGB",(1920*S,1080*S),"#f3f6fa")
d=ImageDraw.Draw(im)
def font(n,b=False):
 return ImageFont.truetype("C:/Windows/Fonts/"+("malgunbd.ttf" if b else "malgun.ttf"),int(n*S))
def text(x,y,t,n=24,fill="#26364c",b=False):
 d.text((int(x*S),int(y*S)),t,font=font(n,b),fill=fill)
def box(x,y,w,h,fill,outline=None,r=14):
 d.rounded_rectangle((x*S,y*S,(x+w)*S,(y+h)*S),radius=r*S,fill=fill,outline=outline,width=1*S)
def wrap(t,n,width):
 lines=[];line=""
 for c in t:
  if d.textlength(line+c,font=font(n))>width*S:
   lines.append(line);line=c
  else:line+=c
 if line:lines.append(line)
 return lines
text(64,40,data["title"],44,"#112540",True)
text(66,105,"Spring 전환 기준  ·  규칙 합의 → 구현 → 테스트·검증",26,"#52647c")
box(64,155,220,38,"#e3ebf6",r=19)
text(83,162,"킥오프 검토안 · 9개 항목",19,"#244f86",True)
text(1290,161,"팀 합의 전 · 2026.10.21 기준",22,"#52647c")
accents=["#2563b4","#2563b4","#2563b4","#0c7f79","#ad6409","#0c7f79","#0c7f79","#7653ae","#7653ae"]
for i,c in enumerate(data["cards"]):
 x=64+(i%3)*600;y=222+(i//3)*238
 box(x,y,576,216,"#ffffff","#dce4ee",15)
 box(x,y,7,216,accents[i],r=3)
 text(x+24,y+15,c["key"],18,"#607086",True)
 box(x+443,y+14,108,28,"#f0f3f7",r=14)
 text(x+461,y+17,"합의 대기",17,"#607086")
 text(x+24,y+56,c["no"],27,accents[i],True)
 title_lines=wrap(c["title"],28,459)
 if len(title_lines)>1: raise ValueError("Title too wide: "+c["title"])
 text(x+76,y+53,c["title"],28,"#182c47",True)
 yy=y+107
 for line in c["lines"]:
  for j,part in enumerate(wrap("• "+line,23,523)):
   text(x+25,yy,part,23,"#40536e");yy+=32
  yy+=5
 if yy>y+205:raise ValueError("Card overflow "+c["no"])
text(64,966,"피드백: 각 Jira 카드 댓글 → 선택 규칙·근거·담당·기한 기록",25,"#244f86",True)
text(64,1012,"합의안 SCRUM-47  |  구현 SCRUM-49·71  |  검증 SCRUM-63·64·65  |  데일리 SCRUM-68",20,"#607086")
im.save(root/"checklist-16x9.png",optimize=True)
im.resize((1920,1080),Image.Resampling.LANCZOS).save(root/"checklist-1920x1080.png",optimize=True)
print("Created 3840x2160 and 1920x1080 PNGs")

