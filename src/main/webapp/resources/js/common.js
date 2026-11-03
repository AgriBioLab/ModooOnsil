// 공통 HTML을 불러오는 함수입니다.
function loadHTML(id, url) {
    var target = document.getElementById(id);
    if (!target) return;
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                target.innerHTML = xhr.responseText;
                target.dispatchEvent(new CustomEvent("common-layout-loaded", { bubbles: true }));
            } else {
                target.textContent = "공통 화면을 불러오지 못했습니다.";
            }
        }
    };

    xhr.open("get", url, true);
    xhr.send();
}

// 기존 contextPath 계약을 유지하며 정적 HTML에서는 현재 view 경로로 계산합니다.
var commonLayoutBasePath = typeof contextPath === "string"
    ? contextPath
    : new URL("../", document.baseURI).pathname.replace(/\/$/, "");
["header", "side"].forEach(function(id) {
    var target = document.getElementById(id);
    if (!target) return;
    // 생산자 시안은 전용 조각을 명시하고, 기존 담당자 화면은 종전 조각을 사용합니다.
    loadHTML(id, target.getAttribute("data-src") || commonLayoutBasePath + "/view/common/" + id + ".html");
});
