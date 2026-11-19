(() => {
'use strict';
const { ready, notify: toast, escapeHtml, allMembers, loadSignupMembers, signupKey, saveAuthUser, loadAuthUser, showAccount, bindAccount, setCurrentMenu } = window.ModooCommon;
const $ = (s, base = document) => base.querySelector(s), $$ = (s, base = document) => [...base.querySelectorAll(s)];
const htmlText = escapeHtml, clone = x => JSON.parse(JSON.stringify(x));
const pageNums = (cur, total) => { if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1); let s = Math.max(2, cur - 2), e = Math.min(total - 1, cur + 2); if (cur <= 3) e = 5; if (cur >= total - 2) s = total - 4; const list = [1]; if (s > 2) list.push('...'); for (let i = s; i <= e; i++) list.push(i); if (e < total - 1) list.push('...'); list.push(total); return list; };
const pageBtns = (cur, total, attr) => pageNums(cur, total).map(p => p === '...' ? '<span class="page-ellipsis" aria-hidden="true">…</span>' : `<button type="button" class="page-button" ${attr}="${p}" ${p === cur ? 'aria-current="page"' : ''} aria-label="${p}페이지">${p}</button>`).join('');
const storageKey = kind => `modoo-sprint2:${sampleData.meta.version}:${config.header.currentUser.id}:${kind}`;
const config = clone(sampleData);
const diaryRows = [];
const state = {
  page: 'list',
  selectedId: null,
  selectedCycleId: null,
  selectedGhId: null,
  selectedMeasurementId: null,
  selectedIssueId: null
};
const main = $('#main');
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const options = (values, sel) => values.map(x => `<option value="${escapeHtml(x.value)}" ${String(x.value) === String(sel) ? 'selected' : ''}>${escapeHtml(x.label)}</option>`).join('');
const getCycle = id => config.cycles.find(c => c.cycleId === id) || config.cycles[0];
const gh = id => config.greenhouses.find(g => g.greenhouseId === id);
const cropOf = c => config.crops.find(x => x.cropId === c.cropId);
const varietyOf = c => (cropOf(c)?.varieties || []).find(x => x.varietyId === c.varietyId);
const getStage = id => config.growthStages.find(s => s.stageId === id) || config.growthStages[0];
const stageOrder = id => getStage(id).order;
const stageByDate = (cycle, date) => { const events = [...cycle.stageHistory].filter(e => e.effectiveDate <= date).sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate)); return events.at(-1)?.stageId || config.growthStages[0].stageId; };
const lastEvent = cycle => [...cycle.stageHistory].sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate)).at(-1);
const getDiary = id => diaryRows.find(d => d.diaryId === id) || diaryRows[0];
const timeOf = x => String(x.startedAt || '').slice(11, 16) || '09:00';
const timeSort = (a, b) => timeOf(a).localeCompare(timeOf(b)) || (a.taskId || '').localeCompare(b.taskId || '');
const makeStarted = (date, time) => `${date}T${time}:00`;
const statusBadge = (label, toneMap = {}) => `<span class="krds-badge ${toneMap[label] || 'bg-light-gray'}">${htmlText(label)}</span>`;
const taskTone = status => status === '완료' ? 'bg-light-success' : 'bg-light-gray';
const trashSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 4h4M7 7l1 13h8l1-13M10 11v6M14 11v6"/></svg>';
const formatAt = x => x ? String(x).replace('T', ' ').slice(0, 16) : '—';
const dateFrom = x => String(x || '').slice(0, 10);
const getSelectedCycle = () => config.cycles.find(c => c.cycleId === state.selectedCycleId) || config.cycles[0];
const getReading = id => config.environmentChanges.find(s => s.environmentChangeId === id) || config.environmentChanges[0];
const stdSet = id => config.standardSets.find(x => x.id === id) || config.standardSets[0];
const getCriteria = (cycle, stageId) => { const standard = stdSet(cycle?.environmentStandardSetId); return config.stageEnvironmentalCriteria.find(x => x.varietyId === standard.varietyId && x.stageId === stageId); };
const fmtVal = v => v === null || v === undefined ? '—' : String(v);
const stdMetricCols = [['dayTempC','주간 온도(°C)'],['nightTempC','야간 온도(°C)'],['humidityPct','습도(%RH)'],['co2Ppm','CO₂(ppm)'],['solarWm2','일사량(W/m²)'],['lightUmolM2S','광도(μmol/m²/s)'],['substrateTempC','배지 온도(°C)'],['substrateMoisturePct','배지 수분(%)'],['substrateEcMsCm','배지 EC(mS/cm)'],['substratePh','배지 pH']];
const toReason = v => { if (typeof v === 'string') return v.trim(); if (v && typeof v === 'object') return Object.values(v).filter(Boolean).map(x => String(x).trim()).join(' / '); return ''; };
const getReasons = reason => { const text = toReason(reason); return text ? `<p class="reason-text">${htmlText(text)}</p>` : ''; };
const getContextHTML = c => `<div class="cycle-meta"><div><span class="meta-label">품목명</span><strong class="meta-value">${htmlText(cropOf(c)?.name || '-')}</strong></div><div><span class="meta-label">품종명</span><strong class="meta-value">${htmlText(varietyOf(c)?.name || '-')}</strong></div><div><span class="meta-label">온실명</span><strong class="meta-value">${htmlText(gh(c.greenhouseId)?.name || '-')}</strong></div></div>`;
function persist(){try{localStorage.setItem(storageKey("diaries"),JSON.stringify({diaries:diaryRows,cycleStageHistories:Object.fromEntries(config.cycles.map(c=>[c.cycleId,c.stageHistory]))}))}catch{}}
function loadSaved(){let saved;try{saved=JSON.parse(localStorage.getItem(storageKey("diaries"))||'null')}catch{}
 diaryRows.splice(0, diaryRows.length, ...(Array.isArray(saved?.diaries) ? saved.diaries : clone(config.sampleDiaries)));
 if(saved?.cycleStageHistories)for(const c of config.cycles){if(Array.isArray(saved.cycleStageHistories[c.cycleId]))c.stageHistory=saved.cycleStageHistories[c.cycleId].map(e=>{const {reasons,...rest}=e;return {...rest,reason:toReason(e.reason||reasons)}})}
 diaryRows.forEach(d=>{delete d.title;d.stageChangeReason=toReason(d.stageChangeReason||d.stageChangeReasons);delete d.stageChangeReasons;d.tasks=(d.tasks||[]).map(t=>({...t,startedAt:t.startedAt||makeStarted(d.workDate,t.time||'09:00'),name:t.name||t.type,content:t.content??''})).sort(timeSort)});
 loadStandards();
}
function error(s){const el=$('#formError');if(el){el.textContent=s;el.classList.remove('hidden')}toast(s)}
function updateNavigation() {
 const isStd = state.page==='standard'||state.page==='standard-create';
 const stdModal = window.__stdState?.cropModal;
 const stdDetail = window.__stdState?.cropDetailId;
 const isStdCreate = state.page==='standard-create' || (stdModal && !stdModal.varietyId);
 const entry = isStd ? (isStdCreate?'standard-create':'standard') : state.page==='cycle-create' ? 'cycle-create' : state.page.startsWith('cycle-') ? 'cycle-list' : state.page==='gh-create' ? 'gh-create' : state.page.startsWith('gh-') ? 'gh-list' : state.page.startsWith('env-') ? 'env-list' : state.page.startsWith('issue-') ? 'issue-list' : state.page==='create' ? 'create' : 'list';
 const current = setCurrentMenu(entry);
 if (isStd) {
  $('#crumb').textContent = isStdCreate ? '재배품목 / 품목 · 품종 등록' : stdModal?.varietyId ? '재배품목 / 품목 · 품종 수정' : stdDetail ? '재배품목 / 품목 · 품종 상세' : '재배품목 / 품목 · 품종 목록';
  return;
 }
 const viewState = state.page.replace(/^(cycle-|gh-|env-|issue-)/, '');
 const step = {list:'목록',create:'등록',detail:'상세',edit:'수정'}[viewState] || '목록';
 const section = state.page.startsWith('cycle-') ? '작기계획' : state.page.startsWith('gh-') ? '온실 정보' : (state.page.startsWith('env-')||state.page.startsWith('issue-')) ? (current?.textContent||'') : '재배일지작업';
 const prefix = (state.page.startsWith('gh-')||state.page.startsWith('env-')||state.page.startsWith('issue-')) ? ['온실', section, step] : [section, step];
 $('#crumb').textContent = prefix.filter(Boolean).join(' / ');
}
const pageFile=target=>(target==='standard'||target==='standard-create')?'cropStageStandard.html':target.startsWith('cycle-')?'cultivationPlanList.html':target.startsWith('gh-')?'greenhouseList.html':target.startsWith('env-')?'environmentChangeList.html':target.startsWith('issue-')?'environmentIssueList.html':target==='member'?'mypage.html?tab=pw':target==='profile'?'mypage.html':target==='cert'?'mypage.html?tab=cert':'cultivationDiaryList.html';
function go(target,id){
 const hostPage=document.body?.dataset?.page;
 if(hostPage&&pageFile(target).split('?')[0]!==pageFile(hostPage).split('?')[0]){
  const url = new URL(pageFile(target), location.href);
  if (target !== hostPage && target !== 'cert') url.searchParams.set('view', target);
  if (id) url.searchParams.set('id', id);
  location.href = url.href;
  return;
 }
 if(target==='standard'||target==='standard-create'){
  const st=window.__stdState||(window.__stdState={cropFilter:'all',editCriteria:false,cropModal:null,cropDetailId:null});
  st.editCriteria=false;st.cropDetailId=null;
  st.cropModal=target==='standard-create'?{cropId:'',varietyId:'',cropName:'',varietyName:''}:null;
  state.page=target;render();return;
 }
 if(target.startsWith('issue-')&&id)state.selectedIssueId=id;
 else if(target.startsWith('cycle-')&&id)state.selectedCycleId=id;
 else if(target.startsWith('gh-')&&id)state.selectedGhId=id;
 else if(target.startsWith('env-')&&id)state.selectedMeasurementId=id;
 else if(id)state.selectedId=id;
 if((target==='detail'||target==='edit')&&!diaryRows.length){toast('등록된 재배일지작업이 없습니다.');return}
 state.page=target;render();}
function heading(title,description='',back=false){return `<div class="pagehead"><div><h1>${title}</h1>${description?`<p>${htmlText(description)}</p>`:''}</div>${back?'<button type="button" class="backlink" id="returnList">← 재배일지작업 목록으로</button>':''}</div>`}
function bindBack(){const el=$('#returnList');if(el)el.addEventListener('click',()=>go('list'))}
function render(){
  updateNavigation();
  const p = pages;
  if (state.page.startsWith('cycle-')) {
    if (state.page === 'cycle-list') p.cycle?.renderCycleList();
    else if (state.page === 'cycle-detail') p.cycle?.renderCycleDetail();
    else p.cycle?.renderCycleEditor(state.page === 'cycle-edit');
  } else if (state.page.startsWith('gh-')) {
    if (state.page === 'gh-list') p.greenhouse?.renderGreenhouseList();
    else if (state.page === 'gh-detail') p.greenhouse?.renderGreenhouseDetail();
    else p.greenhouse?.renderGreenhouseEditor(state.page === 'gh-edit');
  } else if (state.page.startsWith('env-')) {
    p.environment?.renderEnvList();
  } else if (state.page.startsWith('issue-')) {
    p.environment?.renderIssues(state.page === 'issue-detail');
  } else if (state.page === 'standard' || state.page === 'standard-create') {
    p.standard?.renderStandardPage();
  } else if (state.page === 'list') {
    p.diary?.renderList();
  } else if (state.page === 'detail') {
    p.diary?.renderDetail();
  } else {
    p.diary?.renderEditor(state.page === 'edit');
  }
}
function unifiedListPanel({title,count,actionHtml='',filterHtml='',filterTag='div',filterId='',filterClass='',bodyHtml='',footHtml='',ariaLabel}){
 const fAttr=filterId?` id="${filterId}"`:'';
 const fCls=filterClass?`list-filter-strip ${filterClass}`:'list-filter-strip';
 const filterBar=filterHtml?`<${filterTag} class="${fCls}"${fAttr}>${filterHtml}</${filterTag}>`:'';
 const summaryBar=`<div class="list-summary-bar"><span class="list-total-count">총 <strong>${count}</strong>건</span>${actionHtml?`<div class="list-summary-actions">${actionHtml}</div>`:''}</div>`;
 return `<section class="panel list-section" aria-label="${htmlText(ariaLabel||title)}">${filterBar}${summaryBar}${bodyHtml}${footHtml}</section>`;
}
function listFilterField(id,label,ctrlHtml,extraClass=''){const cls=extraClass?`list-ctrl-field ${extraClass}`:'list-ctrl-field';return `<label class="${cls}"${id?` for="${id}"`:''}><span>${htmlText(label)}</span>${ctrlHtml}</label>`}
function dateRangeControl(idPrefix,fromVal,toVal){
 const hasVal=Boolean(fromVal||toVal);
 const label=hasVal?`${fromVal||'시작일'} ~ ${toVal||'종료일'}`:'연도-월-일 ~ 연도-월-일';
 return `<div class="drp-wrap" id="${idPrefix}Wrap"><input type="hidden" id="${idPrefix}From" value="${htmlText(fromVal)}"><input type="hidden" id="${idPrefix}To" value="${htmlText(toVal)}"><button type="button" class="ctrl drp-trigger${hasVal?'':' is-placeholder'}" id="${idPrefix}Trigger" aria-expanded="false"><span>${htmlText(label)}</span><svg class="drp-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg></button><div class="drp-popover hidden" id="${idPrefix}Pop" role="dialog" aria-label="기간 선택 달력"></div></div>`;
}
function mountDateRangePicker(idPrefix){
 const wrap=$(`#${idPrefix}Wrap`),trig=$(`#${idPrefix}Trigger`),pop=$(`#${idPrefix}Pop`);
 const fromEl=$(`#${idPrefix}From`),toEl=$(`#${idPrefix}To`);
 if(!wrap||!trig||!pop||!fromEl||!toEl)return;
 let draftFrom=fromEl.value,draftTo=toEl.value;
 const baseStart=draftFrom?new Date(draftFrom+'T00:00:00'):new Date(today()+'T00:00:00');
 let startYM=[baseStart.getFullYear(),baseStart.getMonth()];
 let endYM=draftTo?[new Date(draftTo+'T00:00:00').getFullYear(),new Date(draftTo+'T00:00:00').getMonth()]:(startYM[1]===11?[startYM[0]+1,0]:[startYM[0],startYM[1]+1]);
 const pad2=n=>String(n).padStart(2,'0');
 const ymStr=(y,m)=>`${y}-${pad2(m+1)}`;
 const shiftYM=([y,m],d)=>{const dt=new Date(y,m+d,1);return [dt.getFullYear(),dt.getMonth()]};
 const buildCal=(title,ym,which)=>{
  const [y,m]=ym,firstDow=new Date(y,m,1).getDay(),daysInMonth=new Date(y,m+1,0).getDate();
  const prevDays=new Date(y,m,0).getDate();
  let cells='';
  for(let i=firstDow-1;i>=0;i--)cells+=`<span class="drp-day is-out">${prevDays-i}</span>`;
  for(let d=1;d<=daysInMonth;d++){
   const iso=`${ymStr(y,m)}-${pad2(d)}`;
   const isSel=(which==='from'&&iso===draftFrom)||(which==='to'&&iso===draftTo);
   const inRange=draftFrom&&draftTo&&iso>draftFrom&&iso<draftTo;
   const isEdge=(iso===draftFrom||iso===draftTo);
   cells+=`<button type="button" class="drp-day${isSel||isEdge?' is-selected':''}${inRange?' is-in-range':''}" data-drp-pick="${which}" data-drp-date="${iso}">${d}</button>`;
  }
  const rem=(firstDow+daysInMonth)%7;
  if(rem)for(let d=1;d<=7-rem;d++)cells+=`<span class="drp-day is-out">${d}</span>`;
  return `<div class="drp-pane"><div class="drp-pane-title">${title}</div><div class="drp-nav"><button type="button" class="drp-nav-btn" data-drp-nav="${which}:-1" aria-label="이전 달">‹</button><strong>${y}년 ${m+1}월</strong><button type="button" class="drp-nav-btn" data-drp-nav="${which}:1" aria-label="다음 달">›</button></div><div class="drp-weekdays"><span>일</span><span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span>토</span></div><div class="drp-days">${cells}</div><div class="drp-pane-foot"><button type="button" class="btn xs" data-drp-today="${which}">오늘</button></div></div>`;
 };
 const drawPop=()=>{
  pop.innerHTML=`<div class="drp-grid">${buildCal('시작일',startYM,'from')}${buildCal('종료일',endYM,'to')}</div><div class="drp-foot"><button type="button" class="btn xs" data-drp-action="clear">초기화</button><div class="drp-foot-right"><button type="button" class="btn xs" data-drp-action="close">닫기</button><button type="button" class="btn main xs" data-drp-action="apply">선택완료</button></div></div>`;
  pop.querySelectorAll('[data-drp-nav]').forEach(b=>b.onclick=()=>{const [w,d]=b.dataset.drpNav.split(':');if(w==='from')startYM=shiftYM(startYM,Number(d));else endYM=shiftYM(endYM,Number(d));drawPop()});
  pop.querySelectorAll('[data-drp-pick]').forEach(b=>b.onclick=()=>{
   const w=b.dataset.drpPick,dt=b.dataset.drpDate;
   if(w==='from'){draftFrom=dt;if(draftTo&&draftFrom>draftTo)draftTo=draftFrom}
   else{draftTo=dt;if(draftFrom&&draftTo<draftFrom)draftFrom=draftTo}
   drawPop();
  });
  pop.querySelectorAll('[data-drp-today]').forEach(b=>b.onclick=()=>{
   const w=b.dataset.drpToday,t=today();
   if(w==='from'){draftFrom=t;startYM=[Number(t.slice(0,4)),Number(t.slice(5,7))-1];if(draftTo&&draftFrom>draftTo)draftTo=draftFrom}
   else{draftTo=t;endYM=[Number(t.slice(0,4)),Number(t.slice(5,7))-1];if(draftFrom&&draftTo<draftFrom)draftFrom=draftTo}
   drawPop();
  });
  pop.querySelector('[data-drp-action="clear"]').onclick=()=>{draftFrom='';draftTo='';fromEl.value='';toEl.value='';trig.classList.add('is-placeholder');trig.querySelector('span').textContent='연도-월-일 ~ 연도-월-일';closePop()};
  pop.querySelector('[data-drp-action="close"]').onclick=()=>closePop();
  pop.querySelector('[data-drp-action="apply"]').onclick=()=>{
   fromEl.value=draftFrom;toEl.value=draftTo;
   const has=Boolean(draftFrom||draftTo);
   trig.classList.toggle('is-placeholder',!has);
   trig.querySelector('span').textContent=has?`${draftFrom||'시작일'} ~ ${draftTo||'종료일'}`:'연도-월-일 ~ 연도-월-일';
   closePop();
  };
 };
 const closePop=()=>{pop.classList.add('hidden');trig.setAttribute('aria-expanded','false')};
 pop.onclick=e=>e.stopPropagation();
 trig.onclick=e=>{
  e.stopPropagation();
  const open=pop.classList.contains('hidden');
  document.querySelectorAll('.drp-popover').forEach(p=>p.classList.add('hidden'));
  document.querySelectorAll('.drp-trigger').forEach(t=>t.setAttribute('aria-expanded','false'));
  if(open){draftFrom=fromEl.value;draftTo=toEl.value;drawPop();pop.classList.remove('hidden');trig.setAttribute('aria-expanded','true')}
  else closePop();
 };
 if(window.__drpDocClick)document.removeEventListener('click',window.__drpDocClick);
 window.__drpDocClick=e=>{if(!e.target.closest('.drp-wrap')){document.querySelectorAll('.drp-popover').forEach(p=>p.classList.add('hidden'));document.querySelectorAll('.drp-trigger').forEach(t=>t.setAttribute('aria-expanded','false'))}};
 document.addEventListener('click',window.__drpDocClick);
}

function singleDateControl(id,value='',opts={}){
 const val=value||'';
 const hasVal=Boolean(val);
 const ph=opts.placeholder||'연도-월-일';
 return `<div class="drp-wrap drp-single-wrap" id="${id}Wrap"><input type="hidden" id="${id}" value="${htmlText(val)}" data-min="${htmlText(opts.min||'')}" data-max="${htmlText(opts.max||'')}" data-placeholder="${htmlText(ph)}"${opts.clearable===false?' data-clearable="0"':''}><button type="button" class="ctrl drp-trigger${hasVal?'':' is-placeholder'}" id="${id}Trigger" aria-expanded="false"${opts.disabled?' disabled':''}><span>${htmlText(hasVal?val:ph)}</span><svg class="drp-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg></button><div class="drp-popover drp-single hidden" id="${id}Pop" role="dialog" aria-label="날짜 선택 달력"></div></div>`;
}
function setSingleDateValue(id,value,opts={}){
 const input=$(`#${id}`),trig=$(`#${id}Trigger`);
 if(!input)return;
 const val=value||'';
 input.value=val;
 if(opts.min!==undefined)input.dataset.min=opts.min||'';
 if(opts.max!==undefined)input.dataset.max=opts.max||'';
 if(trig){
  const ph=input.dataset.placeholder||'연도-월-일';
  trig.classList.toggle('is-placeholder',!val);
  const span=trig.querySelector('span');
  if(span)span.textContent=val||ph;
 }
}
function mountSingleDatePicker(id){
 const wrap=$(`#${id}Wrap`),trig=$(`#${id}Trigger`),pop=$(`#${id}Pop`),input=$(`#${id}`);
 if(!wrap||!trig||!pop||!input||trig.disabled)return;
 const pad2=n=>String(n).padStart(2,'0');
 const ymStr=(y,m)=>`${y}-${pad2(m+1)}`;
 const shiftYM=([y,m],d)=>{const dt=new Date(y,m+d,1);return [dt.getFullYear(),dt.getMonth()]};
 let viewYM=null;
 const initYM=()=>{
  const base=input.value?new Date(input.value+'T00:00:00'):new Date(today()+'T00:00:00');
  viewYM=[base.getFullYear(),base.getMonth()];
 };
 const closePop=()=>{pop.classList.add('hidden');trig.setAttribute('aria-expanded','false')};
 const drawPop=()=>{
  const [y,m]=viewYM,firstDow=new Date(y,m,1).getDay(),daysInMonth=new Date(y,m+1,0).getDate();
  const prevDays=new Date(y,m,0).getDate();
  const minD=input.dataset.min||'',maxD=input.dataset.max||'',cur=input.value||'';
  const clearable=input.dataset.clearable!=='0';
  let cells='';
  for(let i=firstDow-1;i>=0;i--)cells+=`<span class="drp-day is-out">${prevDays-i}</span>`;
  for(let d=1;d<=daysInMonth;d++){
   const iso=`${ymStr(y,m)}-${pad2(d)}`;
   const disabled=(minD&&iso<minD)||(maxD&&iso>maxD);
   cells+=`<button type="button" class="drp-day${iso===cur?' is-selected':''}" data-sdp-date="${iso}"${disabled?' disabled':''}>${d}</button>`;
  }
  const rem=(firstDow+daysInMonth)%7;
  if(rem)for(let d=1;d<=7-rem;d++)cells+=`<span class="drp-day is-out">${d}</span>`;
  const t=today(),todayDisabled=(minD&&t<minD)||(maxD&&t>maxD);
  pop.innerHTML=`<div class="drp-pane"><div class="drp-nav"><button type="button" class="drp-nav-btn" data-sdp-nav="-1" aria-label="이전 달">‹</button><strong>${y}년 ${m+1}월</strong><button type="button" class="drp-nav-btn" data-sdp-nav="1" aria-label="다음 달">›</button></div><div class="drp-weekdays"><span>일</span><span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span>토</span></div><div class="drp-days">${cells}</div></div><div class="drp-foot">${clearable?'<button type="button" class="btn xs" data-sdp-action="clear">초기화</button>':'<span></span>'}<div class="drp-foot-right"><button type="button" class="btn xs" data-sdp-action="today"${todayDisabled?' disabled':''}>오늘</button><button type="button" class="btn xs" data-sdp-action="close">닫기</button></div></div>`;
  pop.querySelectorAll('[data-sdp-nav]').forEach(b=>b.onclick=()=>{viewYM=shiftYM(viewYM,Number(b.dataset.sdpNav));drawPop()});
  const pick=iso=>{
   setSingleDateValue(id,iso);
   input.dispatchEvent(new Event('change',{bubbles:true}));
   closePop();
  };
  pop.querySelectorAll('[data-sdp-date]').forEach(b=>b.onclick=()=>pick(b.dataset.sdpDate));
  const clr=pop.querySelector('[data-sdp-action="clear"]');
  if(clr)clr.onclick=()=>pick('');
  pop.querySelector('[data-sdp-action="today"]').onclick=()=>pick(today());
  pop.querySelector('[data-sdp-action="close"]').onclick=()=>closePop();
 };
 pop.onclick=e=>e.stopPropagation();
 trig.onclick=e=>{
  e.stopPropagation();
  const open=pop.classList.contains('hidden');
  document.querySelectorAll('.drp-popover').forEach(p=>p.classList.add('hidden'));
  document.querySelectorAll('.drp-trigger').forEach(t=>t.setAttribute('aria-expanded','false'));
  if(open){initYM();drawPop();pop.classList.remove('hidden');trig.setAttribute('aria-expanded','true')}
  else closePop();
 };
 if(window.__drpDocClick)document.removeEventListener('click',window.__drpDocClick);
 window.__drpDocClick=e=>{if(!e.target.closest('.drp-wrap')){document.querySelectorAll('.drp-popover').forEach(p=>p.classList.add('hidden'));document.querySelectorAll('.drp-trigger').forEach(t=>t.setAttribute('aria-expanded','false'))}};
 document.addEventListener('click',window.__drpDocClick);
}

function signIn(member, initialPage='list', initialId=null){
 Object.assign(config, clone(sampleData));config.header.currentUser=member;
 config.greenhouses=config.greenhouses.filter(row=>row.memberId===member.id);
 config.cycles=config.cycles.filter(row=>row.memberId===member.id);
 const ids=new Set(config.cycles.map(row=>row.cycleId));
 for(const key of ['sampleDiaries','environmentChanges','issueSamples'])config[key]=config[key].filter(row=>ids.has(row.cycleId));
 state.page=initialPage;state.selectedId=null;state.selectedCycleId=null;state.selectedGhId=null;state.selectedMeasurementId=null;state.selectedIssueId=null;
 if(state.page.startsWith('issue-')&&initialId)state.selectedIssueId=initialId;
 else if(state.page.startsWith('cycle-')&&initialId)state.selectedCycleId=initialId;
 else if(state.page.startsWith('gh-')&&initialId)state.selectedGhId=initialId;
 else if(state.page.startsWith('env-')&&initialId)state.selectedMeasurementId=initialId;
 else if(initialId)state.selectedId=initialId;
 
 showAccount(member);loadStandards();loadGreenhouseExtras();loadCycleExtras();loadIssueExtras();loadSaved();render();
 if(main)main.focus();
}

const CYCLE_SEED_REV='2026-11-18-v2';
function storeCycleExtras(){try{localStorage.setItem(storageKey("cycles"),JSON.stringify({seedRev:CYCLE_SEED_REV,cycles:config.cycles}))}catch{}}
function loadCycleExtras(){try{const saved=JSON.parse(localStorage.getItem(storageKey("cycles"))||'null');if(Array.isArray(saved?.cycles)){
  const valid=saved.cycles.filter(c=>c&&c.cycleId&&c.greenhouseId&&c.environmentStandardSetId).map(c=>({...c,stageHistory:Array.isArray(c.stageHistory)?c.stageHistory:[]}));
  if(saved.seedRev!==CYCLE_SEED_REV){
   const seedIds=new Set(sampleData.cycles.map(s=>s.cycleId));
   const customCycles=valid.filter(c=>!seedIds.has(c.cycleId));
   config.cycles=[...clone(sampleData.cycles),...customCycles];
   storeCycleExtras();
   return;
  }
  config.cycles=valid;
  if(!config.cycles.length)throw Error('empty');
 }}catch{}}
function cycleStatus(c){return c.status||'미진행'}
function moduleHeading(title,caption='',backLabel='',onback=''){
 return `<div class="pagehead"><div><h1>${htmlText(title)}</h1>${caption?`<p>${htmlText(caption)}</p>`:''}</div>${backLabel?`<button type="button" class="backlink" id="moduleBack" data-goto="${onback}">← ${htmlText(backLabel)}</button>`:''}</div>`;
}
function bindModuleBack(){const b=$('#moduleBack');if(b)b.onclick=()=>go(b.dataset.goto)}
function pageControls(count,pageNum,size,kind){let pages=Math.max(1,Math.ceil(count/size)),start=count?(pageNum-1)*size+1:0,end=Math.min(pageNum*size,count);
 return `<div class="list-foot"><nav class="pagination" aria-label="${htmlText(kind)} 페이지 이동"><button class="page-button" data-modpage="prev" ${pageNum===1?'disabled':''}>이전</button>${pageBtns(pageNum,pages,'data-modpage')}<button class="page-button" data-modpage="next" ${pageNum===pages?'disabled':''}>다음</button></nav></div>`;
}
function bindPages(selector,get,set,total,size,draw){$$('[data-modpage]').forEach(b=>b.onclick=()=>{const v=b.dataset.modpage;set(v==='prev'?Math.max(1,get()-1):v==='next'?Math.min(Math.ceil(total/size),get()+1):Number(v));draw()})}

function storeIssueExtras(){try{localStorage.setItem(storageKey('issues'),JSON.stringify({issues:config.issueSamples}))}catch{}}
function loadIssueExtras(){try{const saved=JSON.parse(localStorage.getItem(storageKey('issues'))||'null');if(Array.isArray(saved?.issues)&&saved.issues.length)config.issueSamples=saved.issues}catch{}}

function storeGreenhouseExtras(){try{localStorage.setItem(storageKey('greenhouses'),JSON.stringify({greenhouses:config.greenhouses}))}catch{}}
function loadGreenhouseExtras(){try{const saved=JSON.parse(localStorage.getItem(storageKey('greenhouses'))||'null');if(Array.isArray(saved?.greenhouses)&&saved.greenhouses.length)config.greenhouses=saved.greenhouses.map(g=>(g.imageUrl!==undefined&&!String(g.imageUrl||'').endsWith('.svg'))?g:{...g,imageUrl:sampleData.greenhouses.find(x=>x.greenhouseId===g.greenhouseId)?.imageUrl??null})}catch{}}

function storeStandards(){try{localStorage.setItem(storageKey('standards'),JSON.stringify({crops:config.crops,criteria:config.stageEnvironmentalCriteria,standardMeta:config.standardMeta||{}}))}catch{}}
function loadStandards(){try{const saved=JSON.parse(localStorage.getItem(storageKey('standards'))||'null');if(Array.isArray(saved?.crops)&&saved.crops.length)config.crops=saved.crops;if(Array.isArray(saved?.criteria))config.stageEnvironmentalCriteria=saved.criteria;if(saved?.standardMeta&&typeof saved.standardMeta==='object')config.standardMeta=saved.standardMeta}catch{}}

async function init(){
 const hostPage=document.body?.dataset?.page||'entry';
 if(hostPage==='entry'){
  const saved=loadAuthUser();
  const member=allMembers().find(row=>row.username===saved);
  location.replace(member?'cultivationDiaryList.html':'login.html');return;
 }
 await ready;
 const savedUser=loadAuthUser();
 const member=allMembers().find(row=>row.username===savedUser);
 if(!member){location.replace('login.html');return}
 bindAccount(() => go('profile'));
 for(const button of $$('#navigation [data-go]'))button.addEventListener('click',e=>{e.preventDefault();go(button.dataset.go)});
 for(const button of $$('[data-close-dialog]'))button.addEventListener('click',()=>document.getElementById(button.dataset.closeDialog).close());
 if($('#cycleStartConfirm'))$('#cycleStartConfirm').onclick=()=>pages.cycle?.commitCycleStart();
 if($('#cycleEndConfirm'))$('#cycleEndConfirm').onclick=()=>pages.cycle?.commitCycleEnd();
 const params=new URLSearchParams(location.search);
 const initialView=params.get('view')||hostPage;
 if (initialView === 'profile' || initialView === 'cert') {
  location.replace(pageFile(initialView));
  return;
 }
 const initialId=params.get('id');
 const initialCycleId=params.get('cycleId');
 signIn(member,initialView,initialId);
 if(initialCycleId&&initialView==='list'&&config.cycles.some(c=>c.cycleId===initialCycleId)){
  pages.diary?.applyCycleFilter(initialCycleId);
 }
}

const pages = {};
window.ModooApp = {
  state, config, diaryRows, pages,
  $, $$, escapeHtml, htmlText, clone, toast, today, options, storageKey,
  pageNums, pageBtns, pageControls, bindPages,
  getCycle, gh, cropOf, varietyOf, getStage, stageOrder, stageByDate, lastEvent,
  getDiary, timeOf, timeSort, makeStarted, statusBadge, taskTone, trashSvg,
  formatAt, dateFrom, getSelectedCycle, getReading, stdSet, getCriteria, fmtVal, stdMetricCols,
  toReason, getReasons, getContextHTML,
  persist, loadSaved, storeCycleExtras, loadCycleExtras, storeIssueExtras, loadIssueExtras,
  storeGreenhouseExtras, loadGreenhouseExtras, storeStandards, loadStandards,
  error, go, render, updateNavigation, heading, bindBack, moduleHeading, bindModuleBack, cycleStatus,
  unifiedListPanel, listFilterField, dateRangeControl, mountDateRangePicker,
  singleDateControl, setSingleDateValue, mountSingleDatePicker
};
document.addEventListener('DOMContentLoaded', init);
})();
