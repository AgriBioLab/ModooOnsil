(() => {
'use strict';
const app = window.ModooApp;
const { state, config, diaryRows, pages, $, $$, escapeHtml, htmlText, clone, toast, today, options, storageKey, pageNums, pageBtns, pageControls, bindPages, getCycle, gh, cropOf, varietyOf, getStage, stageOrder, stageByDate, lastEvent, getDiary, timeOf, timeSort, makeStarted, statusBadge, taskTone, trashSvg, formatAt, dateFrom, getSelectedCycle, getReading, stdSet, getCriteria, fmtVal, stdMetricCols, toReason, getReasons, getContextHTML, persist, loadSaved, storeCycleExtras, loadCycleExtras, storeIssueExtras, loadIssueExtras, storeGreenhouseExtras, loadGreenhouseExtras, storeStandards, loadStandards, error, go, render, heading, bindBack, moduleHeading, bindModuleBack, cycleStatus, unifiedListPanel, listFilterField, dateRangeControl, mountDateRangePicker } = app;
let ghListPage=1,ghFilters={name:'all',type:'all',cover:'all',medium:'all'};
function renderGreenhouseList(){
 const rows=config.greenhouses.filter(g=>(ghFilters.name==='all'||g.name===ghFilters.name)&&(ghFilters.type==='all'||g.type===ghFilters.type)&&(ghFilters.cover==='all'||g.coverType===ghFilters.cover)&&(ghFilters.medium==='all'||g.mediumType===ghFilters.medium));
 const size=Number(config.pagination?.pageSize)||5;ghListPage=Math.min(Math.max(1,ghListPage),Math.max(1,Math.ceil(rows.length/size)));const from=(ghListPage-1)*size,paged=rows.slice(from,from+size);
 main.innerHTML=moduleHeading('온실 정보')+unifiedListPanel({
  title:'온실 정보',
  count:rows.length,
  actionHtml:'<button type="button" class="btn main xs" id="ghCreate">+ 온실 등록</button>',
  filterHtml:`${listFilterField('ghFilterName','온실명',`<select class="ctrl" id="ghFilterName">${options([{value:'all',label:'전체'},...config.greenhouses.map(g=>({value:g.name,label:g.name}))],ghFilters.name)}</select>`)}${listFilterField('ghFilterType','유형',`<select class="ctrl" id="ghFilterType">${options([{value:'all',label:'전체'},{value:'단동',label:'단동'},{value:'연동',label:'연동'}],ghFilters.type)}</select>`)}${listFilterField('ghFilterCover','피복형태',`<select class="ctrl" id="ghFilterCover">${options([{value:'all',label:'전체'},{value:'유리',label:'유리'},{value:'비닐',label:'비닐'}],ghFilters.cover)}</select>`)}${listFilterField('ghFilterMedium','배지형태',`<select class="ctrl" id="ghFilterMedium">${options([{value:'all',label:'전체'},{value:'수태',label:'수태'},{value:'코코피트',label:'코코피트'}],ghFilters.medium)}</select>`)}<div class="list-filter-actions"><button type="button" class="btn list-reset-btn" id="ghResetFilter">초기화</button><button type="button" class="btn main list-search-btn" id="ghDoFilter">검색</button></div>`,
  bodyHtml:`<div class="panel-body">${paged.length?`<div class="gh-card-grid">${paged.map(g=>`<article class="gh-card"><button type="button" class="gh-card-media" data-gh-detail="${g.greenhouseId}" aria-label="${htmlText(g.name)} 상세 보기">${g.imageUrl?`<img src="${escapeHtml(g.imageUrl)}" alt="${htmlText(g.name)} 사진">`:`<div class="gh-card-placeholder"><span>등록된 사진 없음</span></div>`}</button><div class="gh-card-body"><div class="gh-card-head"><button type="button" class="linkbtn gh-card-title" data-gh-detail="${g.greenhouseId}">${htmlText(g.name)}</button>${g.type?`<span class="krds-badge bg-light-success">${htmlText(g.type)}</span>`:''}</div><dl class="gh-card-specs"><div><dt>피복형태</dt><dd>${htmlText(g.coverType||'—')}</dd></div><div><dt>동 수</dt><dd>${g.buildingCount!=null?`${g.buildingCount}동`:'—'}</dd></div><div><dt>등록 면적</dt><dd>${g.registeredArea!=null?`${g.registeredArea} ㎡`:'—'}</dd></div><div><dt>배지형태</dt><dd>${htmlText(g.mediumType||'—')}</dd></div></dl></div></article>`).join('')}</div>`:'<p class="empty" style="padding:40px 12px;margin:0">등록된 온실이 없습니다.</p>'}</div>`,
  footHtml:pageControls(rows.length,ghListPage,size,'온실 정보')
 });
 $('#ghResetFilter').onclick=()=>{ghFilters={name:'all',type:'all',cover:'all',medium:'all'};ghListPage=1;renderGreenhouseList()};
 $('#ghDoFilter').onclick=()=>{ghFilters={name:$('#ghFilterName').value,type:$('#ghFilterType').value,cover:$('#ghFilterCover').value,medium:$('#ghFilterMedium').value};ghListPage=1;renderGreenhouseList()};
 $('#ghCreate').onclick=()=>go('gh-create');
 $$('[data-gh-detail]').forEach(b=>b.onclick=()=>go('gh-detail',b.dataset.ghDetail));
 bindPages('',()=>ghListPage,v=>ghListPage=v,rows.length,size,renderGreenhouseList);
}
function renderGreenhouseDetail(){
 const g=config.greenhouses.find(x=>x.greenhouseId===state.selectedGhId)||config.greenhouses[0];
 if(!g){go('gh-list');return}
 state.selectedGhId=g.greenhouseId;
 const linked=config.cycles.filter(c=>c.greenhouseId===g.greenhouseId);
 const facts=[
  ['등록 면적',g.registeredArea!=null?`${g.registeredArea} ㎡`:'—'],
  ['동 수',g.buildingCount!=null?`${g.buildingCount}동`:'—'],
  ['피복형태',g.coverType||'—'],
  ['배지형태',g.mediumType||'—'],
  ['측고',g.sideHeight!=null?`${g.sideHeight} m`:'—'],
  ['폭',g.width!=null?`${g.width} m`:'—'],
  ['길이',g.length!=null?`${g.length} m`:'—'],
  ['온실 사진 URL',g.imageUrl||'—']
 ];
 main.innerHTML=moduleHeading('온실 정보 상세','')+
 `<div class="module-scroll"><section class="panel"><div class="panel-head"><div class="panel-head-title"><h2>${htmlText(g.name)}</h2>${g.type?`<span class="krds-badge bg-light-success">${htmlText(g.type)}</span>`:''}</div><span class="counter">${htmlText(g.type||'유형 미지정')} · ${htmlText(g.coverType||'피복 미지정')}</span></div><div class="panel-body"><div class="${g.imageUrl?'gh-detail-layout':''}">${g.imageUrl?`<div class="gh-photo-box"><img class="gh-detail-photo" src="${escapeHtml(g.imageUrl)}" alt="${htmlText(g.name)} 사진"></div>`:''}<dl class="profile-facts facts-2col">${facts.map(([a,b])=>`<dt>${htmlText(a)}</dt><dd>${htmlText(String(b))}</dd>`).join('')}</dl></div></div></section>
 <div class="hidden" id="ghDeleteConfirm" style="padding:10px 12px;border:1px solid var(--line);background:#fff;display:flex;align-items:center;justify-content:flex-end;gap:8px"><span>이 온실을 삭제하시겠습니까?</span><button type="button" class="btn" id="ghDeleteCancel">취소</button><button type="button" class="btn main" id="ghDeleteOk">삭제 확인</button></div>
 <div class="module-actions"><div class="module-actions-left"><button class="btn" id="ghToList">목록</button></div><button class="btn" id="ghDelete">삭제</button><button class="btn main" id="ghToEdit">수정</button></div></div>`;
 bindModuleBack();$('#ghToList').onclick=()=>go('gh-list');$('#ghToEdit').onclick=()=>go('gh-edit',g.greenhouseId);
 $('#ghDelete').onclick=()=>{
  if(linked.length){toast('연결된 작기가 있는 온실은 삭제할 수 없습니다.');return}
  $('#ghDeleteConfirm').classList.remove('hidden');
 };
 $('#ghDeleteCancel').onclick=()=>$('#ghDeleteConfirm').classList.add('hidden');
 $('#ghDeleteOk').onclick=()=>{config.greenhouses=config.greenhouses.filter(x=>x.greenhouseId!==g.greenhouseId);storeGreenhouseExtras();toast('온실을 삭제했습니다.');go('gh-list')};
}
function renderGreenhouseEditor(edit){
 const g=edit?(config.greenhouses.find(x=>x.greenhouseId===state.selectedGhId)||config.greenhouses[0]):null;
 if(edit&&!g){go('gh-list');return}
 const row=g||{greenhouseId:'',name:'',type:'단동',coverType:'비닐',buildingCount:1,sideHeight:'',width:'',length:'',registeredArea:'',mediumType:'수태',imageUrl:''};
 main.innerHTML=moduleHeading(edit?'온실 정보 수정':'온실 정보 등록','')+
 `<form class="module-form panel" id="ghForm" novalidate><div class="panel-head"><h2>온실 정보</h2><span class="counter">* 필수 입력</span></div><div class="module-form-scroll"><div class="module-input-grid">
 <div class="field wide"><label for="ghName">온실명 *</label><input class="ctrl" id="ghName" maxlength="100" value="${htmlText(row.name)}" placeholder="예: E온실" required></div>
 <div class="field"><label for="ghType">유형</label><select class="ctrl" id="ghType">${options([{value:'',label:'미선택'},{value:'단동',label:'단동'},{value:'연동',label:'연동'}],row.type||'')}</select></div>
 <div class="field"><label for="ghCover">피복형태</label><select class="ctrl" id="ghCover">${options([{value:'',label:'미선택'},{value:'유리',label:'유리'},{value:'비닐',label:'비닐'}],row.coverType||'')}</select></div>
 <div class="field"><label for="ghCount">동 수</label><input class="ctrl" id="ghCount" type="number" min="1" value="${row.buildingCount??''}"></div>
 <div class="field"><label for="ghMedium">배지형태</label><select class="ctrl" id="ghMedium">${options([{value:'',label:'미선택'},{value:'수태',label:'수태'},{value:'코코피트',label:'코코피트'}],row.mediumType||'')}</select></div>
 <div class="field"><label for="ghSide">측고 (m)</label><input class="ctrl" id="ghSide" type="number" step="0.01" min="0" value="${row.sideHeight??''}"></div>
 <div class="field"><label for="ghWidth">폭 (m)</label><input class="ctrl" id="ghWidth" type="number" step="0.01" min="0" value="${row.width??''}"></div>
 <div class="field"><label for="ghLength">길이 (m)</label><input class="ctrl" id="ghLength" type="number" step="0.01" min="0" value="${row.length??''}"></div>
 <div class="field"><label for="ghArea">등록 면적 (㎡)</label><input class="ctrl" id="ghArea" type="number" step="0.01" min="0" value="${row.registeredArea??''}"></div>
 <div class="field wide"><label for="ghImageUrl">온실 사진 URL</label><input class="ctrl" id="ghImageUrl" type="text" maxlength="500" value="${htmlText(row.imageUrl||'')}" placeholder="이미지 URL을 입력하세요 (예: https://... 또는 img/gh-a.jpg)"><div id="ghPhotoPreview" class="${row.imageUrl?'gh-photo-box':'gh-photo-box hidden'}" style="margin-top:10px">${row.imageUrl?`<img class="gh-detail-photo" src="${escapeHtml(row.imageUrl)}" alt="온실 사진 미리보기">`:''}</div></div>
 </div><div class="errorbox hidden" id="ghErr"></div></div>
 <div class="module-actions"><button type="button" class="btn" id="ghCancel">취소</button><button type="submit" class="btn main">${edit?'수정 저장':'등록'}</button></div></form>`;
 bindModuleBack();$('#ghCancel').onclick=()=>go(edit?'gh-detail':'gh-list',g?.greenhouseId);
 const updateGhPreview=src=>{const box=$('#ghPhotoPreview');if(!box)return;if(src){box.classList.remove('hidden');box.innerHTML=`<img class="gh-detail-photo" src="${escapeHtml(src)}" alt="온실 사진 미리보기">`}else{box.classList.add('hidden');box.innerHTML=''}};
 $('#ghImageUrl').oninput=e=>updateGhPreview(e.target.value.trim());
 $('#ghForm').onsubmit=e=>{
  e.preventDefault();
  const name=$('#ghName').value.trim();
  if(!name){$('#ghErr').textContent='온실명을 입력하세요.';$('#ghErr').classList.remove('hidden');return}
  const numOrNull=id=>{const v=$(id).value.trim();return v===''?null:Number(v)};
  const payload={greenhouseId:g?g.greenhouseId:'GH-NEW-'+Date.now(),memberId:config.header.currentUser.id,name,type:$('#ghType').value||null,coverType:$('#ghCover').value||null,buildingCount:numOrNull('#ghCount'),sideHeight:numOrNull('#ghSide'),width:numOrNull('#ghWidth'),length:numOrNull('#ghLength'),registeredArea:numOrNull('#ghArea'),mediumType:$('#ghMedium').value||null,imageUrl:$('#ghImageUrl').value.trim()||null};
  if(g)Object.assign(g,payload);else config.greenhouses.unshift(payload);
  storeGreenhouseExtras();toast(edit?'온실 정보를 수정했습니다.':'온실을 등록했습니다.');go('gh-detail',payload.greenhouseId);
 };
}

pages.greenhouse = { renderGreenhouseList, renderGreenhouseDetail, renderGreenhouseEditor };
})();
