"""Build the shareable producer prototypes from the workspace sources."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]
WEB = ROOT / "src/main/webapp"
OUTPUT = ROOT / "docs/ui"


def inline_page(name, styles, script):
    html = (WEB / "view" / name).read_text(encoding="utf-8")
    for stylesheet in styles:
        pattern = r'<link rel="stylesheet" href="\.\./resources/css/' + re.escape(stylesheet) + r'(?:\?[^\"]*)?">'
        css = (WEB / "resources/css" / stylesheet).read_text(encoding="utf-8")
        html, count = re.subn(pattern, lambda _: "<style>\n" + css + "\n</style>", html)
        assert count == 1, stylesheet
    html, count = re.subn(r'  <script src="\.\./resources/js/[^\"]+" defer></script>\n', "", html)
    assert count >= 1, name
    scripts = [script] if isinstance(script, str) else script
    javascript = "\n".join((WEB / "resources/js" / item).read_text(encoding="utf-8") for item in scripts)
    return html.replace("</body>", "<script>\n" + javascript + "\n</script>\n</body>")


main = inline_page("producerMain.html", ["common.css", "header.css", "sidemenu.css", "searchBox.css", "table.css", "detail.css", "producerManagement.css", "producerServiceChrome.css"], ["producerPrototypeMedia.js", "producerPrototypeData.js", "producerPlanning.js", "producerPlanningUI.js", "producerManagementStore.js", "producerTerminology.js", "producerHomeSample.js", "producerGreenhouseSample.js", "producerSiteMap.js", "producerServiceInfo.js", "producerSensorData.js", "producerShipment.js", "producerInsights.js", "producerManagement.js"])
header = (WEB / "view/common/producerWorkspaceHeader.html").read_text(encoding="utf-8")
main, header_count = re.subn(r'<div id="header" data-src="common/producerWorkspaceHeader\.html(?:\?[^\"]*)?"></div>', lambda _: '<div id="header">' + header + '</div>', main)
assert header_count == 1, 'producer header'
main = main.replace('<body class="producer-main producer-workspace producer-management">', '<body class="producer-main producer-workspace producer-management" data-standalone="true">')
main = re.sub(r'href="producerMain\.html(?:\?([^\"]*))?"', lambda m: 'href="?' + (m.group(1) or "view=home") + '"', main)
main = main.replace('href="../main.html"', 'href="../../src/main/webapp/main.html"')
main = main.replace('href="producerSignup.html', 'href="producer-signup-prototype.html')
(OUTPUT / "producer-main-prototype.html").write_text(main, encoding="utf-8")

signup = inline_page("producerSignup.html", ["common.css", "producerSignup.css"], "producerSignup.js")
signup = signup.replace('href="producerMain.html"', 'href="producer-main-prototype.html"')
signup = signup.replace('href="../main.html"', 'href="../../src/main/webapp/main.html"')
(OUTPUT / "producer-signup-prototype.html").write_text(signup, encoding="utf-8")
print("Built producer main and signup standalone previews.")
