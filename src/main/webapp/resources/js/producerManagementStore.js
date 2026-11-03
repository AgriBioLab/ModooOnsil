/* 생산자 UI 검토용 저장소. 서버 인증/저장과 구분하며 기존 v2 저장소는 수정하지 않습니다. */
(function (root) {
  'use strict';
  const GRADES = Object.freeze(['특상', '상', '중']);
  const planning = root.ProducerPlanning || (typeof module !== 'undefined' && module.exports ? require('./producerPlanning.js') : null);
  const KEY = 'agribiolab-producer-management-v3';
  const clone = value => JSON.parse(JSON.stringify(value));
  const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const id = prefix => prefix + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9);
  const validDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value || '') && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
  function seed() {
    return {
      version: 3,
      farms: [{ id: 'farm-demo', name: '나의 화훼농장', address: '경기도 수원시 · 예시', note: '검토용 농장', active: true }],
      houses: [
        { id: 'house-c', farmId: 'farm-demo', name: 'C동', zone: '1번 베드', area: 600, houseType:'단동', buildingCount:1, covering:'유리', sideHeight:5, width:15, length:40, substrate:'상토', active:true },
        { id: 'house-b', farmId: 'farm-demo', name: 'B동', zone: '1번 베드', area: 640, houseType:'연동', buildingCount:2, covering:'비닐', sideHeight:4.5, width:16, length:40, substrate:'코코피트', active:true },
        { id: 'house-a', farmId: 'farm-demo', name: 'A동', zone: '1번 베드', area: 1000, houseType:'단동', buildingCount:1, covering:'비닐', sideHeight:4, width:20, length:50, substrate:'수태', active:true }
      ],
      cycles: [
        { id: 'cycle-demo', houseId: 'house-c', name: '설 출하 호접란 1차', crop: '호접란', variety: '만천홍', start: '2026-06-15', initial: 1000, unit: '화분', stage: '꽃대·봉오리 발달', targetStart: '2027-01-20', targetEnd: '2027-02-05', targetQty: 900, status: 'active', note: '검토용 재배 예시' },
        { id: 'cycle-b', houseId: 'house-b', name: '호접란 가을 출하', crop: '호접란', variety: '만천홍', start: '2026-03-01', initial: 800, unit: '화분', stage: '개화·출하 준비', targetStart: '2026-10-01', targetEnd: '2026-11-15', targetQty: 750, status: 'active', note: '검토용 재배 예시' },
        { id:'cycle-a',houseId:'house-a',name:'호접란 겨울 출하',crop:'호접란',variety:'만천홍',start:'2026-01-23',initial:1000,unit:'화분',stage:'개화기',targetStart:'2026-12-24',targetEnd:'2026-12-28',targetQty:900,status:'active',note:'',displayProgress:80,flowerStalks:2,flowering:50,color:'양호' }
      ],
      records: [14, 21, 28].map((day, i) => ({ id: 'observation-' + day, cycleId: 'cycle-demo', date: '2026-10-' + day, type: '생육·관찰', text: '같은 표본의 꽃대 길이를 측정했습니다. · 예시', metric: '꽃대 길이', value: 12 + i * 4, measureUnit: 'cm', sample: '표본 P-01', method: '동일 꽃대의 기부부터 끝까지', photo: '' })),
      shipments: [{ id: 'shipment-demo', cycleId: 'cycle-b', date: '2026-10-28', recipient: '화훼유통센터 · 예시', specification: '분화', grade: '', quantity: 200, unit: '화분', note: '검토용 출하', cancelled: false, history: [] }],
      adjustments: [{ id: 'loss-demo', cycleId: 'cycle-b', date: '2026-10-20', type: '폐기', quantity: -20, note: '검토용 수량 변경' }],
      environment: [14, 21, 28].flatMap((day, i) => ['house-c', 'house-b'].map(houseId => ({ id: houseId + '-' + day, houseId, date: '2026-10-' + day, time: '09:00', temp: 24 + i * 0.4, humidity: 72 - i, source: '온실 센서', sensorId: houseId + '-ENV-01' }))).concat([-1.5,-1,-0.4,0.2,0.5,0].map((offset,i) => ({id:'house-a-env-' + i,houseId:'house-a',date:'2026-11-03',time:String(9+i).padStart(2,'0') + ':00',temp:24.5+offset,humidity:68+offset,light:320+offset*10,outsideTemp:22+offset,outsideHumidity:50+offset,co2:485,units:{light:'W/m²',co2:'ppm'},source:'온실 센서',sensorId:'house-a-ENV-01'}))),
      profile: { name: '김*수', phone: '', loginId: 'producer-demo' }, imported: false
    };
  }
  function importLegacy(old) {
    const next = seed();
    next.houses = []; next.cycles = []; next.records = []; next.shipments = []; next.adjustments = []; next.environment = [];
    for (const house of old.houses) {
      next.houses.push({ id: house.id, farmId: 'farm-demo', name: house.name, zone: (house.beds || []).map(b => b.name).join(', '), area: '', active: true });
      for (const bed of house.beds || []) {
        const firstRecord = (old.records || []).filter(r => r.house === house.id && r.bed === bed.name && validDate(r.date)).map(r => r.date).sort()[0];
        const start = validDate(bed.start) ? bed.start : firstRecord || today();
        next.cycles.push({ id: 'legacy-' + bed.id, houseId: house.id, name: house.name + ' ' + bed.name + ' ' + (house.crop || '재배'), crop: house.crop || '', variety: house.variety || '', start, initial: 0, quantityPending: true, unit: '화분', stage: (house.stages || [])[bed.phase] || '미등록', targetStart: bed.shipment || '', targetEnd: bed.shipment || '', targetQty: '', status: 'active', note: '이전 시안에서 가져옴. 시작 재배수량·단위를 확인해 주세요.' + (!validDate(bed.start) ? ' 실제 시작일이 없어 최초 기록일 또는 오늘을 임시 표시합니다. 실제 날짜로 수정해 주세요.' : '') });
      }
    }
    for (const record of old.records || []) {
      const house = old.houses.find(h => h.id === record.house);
      const bed = house?.beds?.find(b => b.name === record.bed);
      next.records.push({ ...record, cycleId: bed ? 'legacy-' + bed.id : '', metric: '', value: '', measureUnit: '', sample: '', method: '', photo: '', text: record.text + (bed ? '' : ' [이전 위치: ' + (house?.name || record.house || '') + ' ' + (record.bed || '') + ']') });
    }
    next.imported = true;
    return next;
  }
  // 출하 단위와 재배 단위가 다르면 사용자가 확인한 재배 차감 수량만 사용합니다.
  const stockQuantity = shipment => shipment.stockQuantity == null || shipment.stockQuantity === '' ? Number(shipment.quantity) : Number(shipment.stockQuantity);
  function validate(s) {
    if (planning) planning.validate(s);
    const requireText = (v, label) => { if (!String(v || '').trim()) throw new Error(label + '을(를) 입력해 주세요.'); };
    const find = (type, key) => s[type].find(v => v.id === key);
    const optionalNumber = (value, label, integer = false) => {
      if (value == null || value === '') return;
      const number = Number(value);
      if (!Number.isFinite(number) || number < 0 || (integer && !Number.isSafeInteger(number))) throw new Error(label + '은(는) 0 이상의 ' + (integer ? '정수' : '수') + '로 입력해 주세요.');
    };
    for (const f of s.farms) requireText(f.name, '농장명');
    for (const h of s.houses) {
      requireText(h.name, '온실명');
      for (const [key, label] of [['area', '온실 면적'], ['buildingCount', '동수'], ['sideHeight', '측고'], ['width', '폭'], ['length', '길이']]) optionalNumber(h[key], label, key === 'buildingCount');
      if (!find('farms', h.farmId)) throw new Error('소속 농장을 선택해 주세요.');
      if (s.houses.some(other => other.id !== h.id && other.farmId === h.farmId && other.name.trim() === h.name.trim())) throw new Error('같은 농장에 이미 등록된 온실명입니다.');
    }
    for (const c of s.cycles) {
      requireText(c.name, '작기명'); requireText(c.crop, '품목명'); requireText(c.unit, '수량 단위'); requireText(c.stage, '생육단계');
      const house = find('houses', c.houseId);
      if (!house) throw new Error('재배 온실을 선택해 주세요.');
      if (c.status === 'active' && (!house.active || !find('farms', house.farmId).active)) throw new Error('진행 중 작기의 농장·온실은 사용 종료할 수 없습니다.');
      if (!validDate(c.start) || c.start > today()) throw new Error('재배 시작일을 오늘 이전 날짜로 입력해 주세요.');
      optionalNumber(c.cultivationArea, '재배면적');
      if (c.harvestDate && (!validDate(c.harvestDate) || c.harvestDate < c.start || c.harvestDate > today() || (c.endDate && c.harvestDate > c.endDate))) throw new Error('수확일은 작기 시작일부터 종료일 또는 오늘 사이여야 합니다.');
      if (c.plantingDate && (!validDate(c.plantingDate) || c.plantingDate > today() || (c.endDate && c.plantingDate > c.endDate))) throw new Error('정식일은 실제 작업 날짜로 입력하고 재배 종료일을 넘지 않게 해 주세요.');
      if (!Number.isSafeInteger(c.initial) || c.initial < 0) throw new Error('시작 재배수량은 0 이상의 정수여야 합니다.');
      if (c.targetQty !== '' && (!Number.isSafeInteger(c.targetQty) || c.targetQty <= 0)) throw new Error('목표 출하량은 양수이거나 미등록이어야 합니다.');
      if ([c.targetStart, c.targetEnd].some(d => d && !validDate(d)) || (c.targetStart && c.targetEnd && c.targetStart > c.targetEnd)) throw new Error('출하 예정기간을 확인해 주세요.');
      if (c.status === 'ended' && (!validDate(c.endDate) || c.endDate < c.start || c.endDate > today())) throw new Error('종료일은 시작일부터 오늘 사이여야 합니다.');
    }
    for (const r of s.records) {
      const cycle = r.cycleId && find('cycles', r.cycleId);
      if (r.cycleId && !cycle) throw new Error('일지의 작기를 찾을 수 없습니다.');
      if (!validDate(r.date) || r.date > today()) throw new Error('일지의 실제 날짜를 확인해 주세요.');
      if (cycle && (r.date < cycle.start || (cycle.endDate && r.date > cycle.endDate))) throw new Error('일지 날짜는 해당 작기의 시작·종료 범위 안이어야 합니다.');
      requireText(r.text, '관찰 또는 작업 내용');
      optionalNumber(r.growthWeek, '생육주차', true);
      if (r.shading != null && !['', '0', '1'].includes(String(r.shading))) throw new Error('차광 여부는 닫기 또는 걷기로 기록해 주세요.');
      if (r.metric === '화색' && (Number(r.value) < 0 || Number(r.value) > 5)) throw new Error('화색 평가점수는 자료 기준인 0~5 범위로 입력해 주세요.');
      if ([r.metric, r.measureUnit, r.sample, r.method].some(v => String(v || '').trim()) || (r.value !== '' && r.value != null)) {
        requireText(r.metric, '측정 항목');
        for (const [key, label] of [['measureUnit', '측정 단위'], ['sample', '조사 개체번호'], ['method', '조사 방법']]) requireText(r[key], label);
        if (r.value === '' || !Number.isFinite(Number(r.value)) || Number(r.value) < 0) throw new Error('측정값을 0 이상으로 입력해 주세요.');
      }
      if (r.photo && !/^data:image\/(png|jpeg|webp);base64,/.test(r.photo)) throw new Error('지원하지 않는 사진 형식입니다.');
    }
    for (const shipment of s.shipments) {
      const c = find('cycles', shipment.cycleId);
      if (!c) throw new Error('출하 대상 작기를 선택해 주세요.');
      if (!validDate(shipment.date) || shipment.date < c.start || shipment.date > today()) throw new Error('실제 출하일은 작기 시작일부터 오늘 사이여야 합니다.');
      if (c.endDate && shipment.date > c.endDate) throw new Error('작기 종료일 이후에 출하할 수 없습니다.');
      if (!Number.isFinite(shipment.quantity) || shipment.quantity <= 0) throw new Error('출하량은 0보다 큰 수여야 합니다.');
      requireText(shipment.unit, '출하 단위');
      if (shipment.unit !== c.unit && (shipment.stockQuantity == null || shipment.stockQuantity === '')) throw new Error('출하 단위가 다릅니다. 실제 차감할 재배수량을 확인해 입력해 주세요.');
      if (!Number.isSafeInteger(stockQuantity(shipment)) || stockQuantity(shipment) <= 0) throw new Error('차감 재배수량은 1 이상의 정수여야 합니다.');
      if (shipment.unit === c.unit && stockQuantity(shipment) !== shipment.quantity) throw new Error('같은 단위의 출하량과 차감 재배수량은 같아야 합니다.');
      optionalNumber(shipment.totalAmount, '총금액');
      if (shipment.harvestDate && (!validDate(shipment.harvestDate) || shipment.harvestDate < c.start || shipment.harvestDate > shipment.date)) throw new Error('수확일은 작기 시작일부터 출하일 사이여야 합니다.');
      const gradeRows = shipment.gradeBreakdown || [];
      for (const row of gradeRows) {
        requireText(row.grade, '출하 등급명');
        if (!Number.isFinite(row.quantity) || row.quantity < 0) throw new Error('등급별 출하 수량을 0 이상으로 입력해 주세요.');
      }
      if (new Set(gradeRows.map(row => row.grade.trim())).size !== gradeRows.length) throw new Error('중복된 출하 등급명이 있습니다.');
      if (gradeRows.length && Math.abs(gradeRows.reduce((sum, row) => sum + row.quantity, 0) - shipment.quantity) > 0.000001) throw new Error('등급별 출하 수량 합계는 총출하량과 같아야 합니다.');
      requireText(shipment.recipient, '출하처');
    }
    for (const a of s.adjustments) {
      const c = find('cycles', a.cycleId);
      if (!c || !validDate(a.date) || a.date < c.start || a.date > today() || (c.endDate && a.date > c.endDate)) throw new Error('수량 변경의 작기·실제 날짜를 확인해 주세요.');
      if (!Number.isSafeInteger(a.quantity) || a.quantity === 0) throw new Error('변경 수량을 0이 아닌 정수로 입력해 주세요.');
      requireText(a.note, '수량 변경 사유');
    }
    for (const c of s.cycles) {
      const events = [...s.adjustments.filter(a => a.cycleId === c.id).map(a => ({ date: a.date, quantity: a.quantity })), ...s.shipments.filter(v => v.cycleId === c.id && !v.cancelled).map(v => ({ date: v.date, quantity: -stockQuantity(v) }))].sort((a, b) => a.date.localeCompare(b.date) || b.quantity - a.quantity);
      let stock = c.initial;
      for (const event of events) { stock += event.quantity; if (!Number.isSafeInteger(stock) || stock < 0) throw new Error(c.name + ': 해당 날짜의 재배수량을 초과합니다. 출하·수량 변경 이력을 확인해 주세요.'); }
      if (c.status === 'ended' && stock > 0 && !String(c.endNote || '').trim()) throw new Error('재배수량이 남은 작기는 종료 결과·남은 수량 처리 내용을 입력해 주세요.');
    }
  }
  function create(storage) {
    let state; let notice = '';
    try {
      const saved = storage.getItem(KEY);
      if (saved) { state = JSON.parse(saved); if (state.version !== 3) throw new Error('지원하지 않는 저장 형식'); validate(state); }
      else {
        const raw = storage.getItem('agribiolab-workspace-demo-v2');
        const old = raw ? JSON.parse(raw) : null;
        state = old?.houses?.length ? importLegacy(old) : seed();
        validate(state);
      }
    } catch (_) {
      state = seed(); notice = '저장 데이터를 읽지 못했습니다. 기존 원본은 유지되며, 복구 전 변경 저장은 잠겨 있습니다.';
    }
    function transact(fn) {
      if (notice) throw new Error(notice);
      const current = storage.getItem(KEY);
      if (current) {
        const latest = JSON.parse(current); validate(latest); state = latest;
      }
      const next = clone(state); const result = fn(next); validate(next);
      storage.setItem(KEY, JSON.stringify(next)); state = next;
      return result;
    }
    return {
      get: () => clone(state), notice, today,
      preparePrototype() {
        if (notice || state.prototypeDataVersion >= root.ProducerPrototypeData.VERSION) return;
        const backupKey = KEY + '-before-prototype' + root.ProducerPrototypeData.VERSION;
        if (storage.getItem(KEY) && !storage.getItem(backupKey)) storage.setItem(backupKey,storage.getItem(KEY));
        return transact(s => root.ProducerPrototypeData.enrich(s,today()));
      },
      preparePlanning() {
        if (notice || !planning || !planning.needsSeed(state)) return;
        const original=storage.getItem(KEY);const backupKey=KEY+'-before-planning22';
        if(original&&!storage.getItem(backupKey))storage.setItem(backupKey,original);
        return transact(s=>planning.enrich(s,today()));
      },
      prepareJournalEnvironment(){
        const data=root.ProducerPrototypeData;if(notice||!data?.needsJournalEnvironment||!data.needsJournalEnvironment(state))return;
        const original=storage.getItem(KEY);const backup=KEY+'-before-journal-environment24';if(original&&!storage.getItem(backup))storage.setItem(backup,original);
        return transact(s=>data.ensureJournalEnvironment(s));
      },
      acceptGuide(cycleId,key) {
        return transact(s=>{
          const c=s.cycles.find(c=>c.id===cycleId);const guide=planning.guides(s,c,today()).find(g=>g.key===key);
          if(!guide)throw new Error('가이드가 변경되었거나 이미 계획에 추가되었습니다. 다시 확인해 주세요.');
          const item={...guide,id:id('plan-task'),guideKey:guide.key,status:'planned',time:'',quantity:'',unit:'',history:[{action:'가이드에서 추가',at:new Date().toISOString(),reason:guide.reason}]};
          s.planTasks||=[];s.planTasks.push(item);return item.id;
        });
      },
      saveGuideRules(cycleId,values){
        return transact(s=>{
          const c=s.cycles.find(c=>c.id===cycleId);if(!c||c.status==='ended')throw new Error('진행 중인 작기에서 가이드 기준을 설정해 주세요.');
          const next=Object.fromEntries(Object.keys(planning.defaultGuide).map(key=>[key,values[key]===''?'':Number(values[key])]));
          c.guideHistory=[...(c.guideHistory||[]),{at:new Date().toISOString(),before:c.planGuide||null,after:next}];c.planGuide=next;
        });
      },
      balance: cycleId => { const c = state.cycles.find(v => v.id === cycleId); return c ? c.initial + state.adjustments.filter(v => v.cycleId === cycleId).reduce((n, v) => n + v.quantity, 0) - state.shipments.filter(v => v.cycleId === cycleId && !v.cancelled).reduce((n, v) => n + stockQuantity(v), 0) : 0; },
      save(type, values) {
        return transact(s => {
          if (!['farms', 'houses', 'cycles', 'records', 'shipments', 'planStages', 'planTasks'].includes(type)) throw new Error('지원하지 않는 기록입니다.');
          if (['planStages','planTasks'].includes(type)) s[type] ||= [];
          const existing = values.id ? s[type].find(v => v.id === values.id) : null;
          if (values.id && !existing) throw new Error('기록이 삭제되었거나 변경되었습니다. 다시 조회해 주세요.');
          if (type === 'records' && existing?.inputSource === 'automatic') throw new Error('자동 실행 원본은 재배일지에서 직접 수정할 수 없습니다.');
          if (['planStages','planTasks'].includes(type)) {
            const c=s.cycles.find(c=>c.id===values.cycleId);
            if(!c||c.status==='ended')throw new Error('진행 중인 작기에서 계획을 등록·수정해 주세요.');
            if(existing&&existing.cycleId!==values.cycleId)throw new Error('계획의 작기는 변경할 수 없습니다.');
            if(type==='planTasks'&&existing?.automationEventId)throw new Error('자동 실행 계획은 실행 원본과 함께 조회합니다.');
            if(type==='planTasks'&&existing&&existing.date!==values.date&&!String(values.reason||'').trim())throw new Error('일정 변경 사유를 입력해 주세요.');
            if(type==='planTasks'&&existing&&planning.status(s,existing)==='completed'&&existing.status!==values.status)throw new Error('완료된 작업의 상태는 연결된 실적에서 확인해 주세요.');
          }
          if (type === 'cycles') {
            for (const [key, label, max] of [['displayProgress', '재배 진행률', 100], ['flowerStalks', '평균 꽃대 수', Infinity], ['flowering', '평균 개화율', 100]]) {
              const value = values[key];
              if (value == null || value === '' || (existing && value === existing[key])) continue;
              if (!Number.isFinite(Number(value)) || Number(value) < 0 || Number(value) > max) throw new Error(label + (max === 100 ? '은(는) 0~100 사이의 수로 입력해 주세요.' : '는 0 이상의 수로 입력해 주세요.'));
            }
          }
          if (type === 'cycles' && existing && ((!existing.quantityPending && existing.unit !== values.unit) || existing.houseId !== values.houseId) && (s.records.some(r => r.cycleId === existing.id) || s.shipments.some(r => r.cycleId === existing.id) || s.adjustments.some(r => r.cycleId === existing.id))) throw new Error('이력이 있는 작기의 단위·온실은 직접 변경할 수 없습니다. 위치 이동은 별도 이력 설계 후 지원합니다.');
          if (type === 'shipments' && existing?.cancelled) throw new Error('취소된 출하는 정정할 수 없습니다. 새 출하를 등록해 주세요.');
          if (type === 'shipments' && !existing && s.cycles.find(c => c.id === values.cycleId)?.status === 'ended') throw new Error('종료한 작기에 새 출하를 등록할 수 없습니다.');
          if (type === 'shipments' && s.cycles.find(c => c.id === values.cycleId)?.quantityPending) throw new Error('이전 시안에서 가져온 작기의 시작 재배수량·단위를 먼저 등록해 주세요.');
          if (type === 'shipments') {
            if (values.grade && !GRADES.includes(values.grade) && values.grade !== existing?.grade) throw new Error('출하 등급은 특상·상·중에서 선택해 주세요.');
            for (const row of values.gradeBreakdown || []) {
              if (!GRADES.includes(row.grade) && !existing?.gradeBreakdown?.some(old => old.grade === row.grade)) throw new Error('등급별 수량은 특상·상·중 기준으로 입력해 주세요.');
            }
          }
          const item = { active: true, ...existing, ...values, id: existing?.id || id(type) };
          if(type==='cycles'&&existing&&['targetQty','targetStart','targetEnd','targetGrade','targetSpecification','targetRecipient'].some(key=>existing[key]!==item[key]))item.targetHistory=[...(existing.targetHistory||[]),{at:new Date().toISOString(),before:Object.fromEntries(['targetQty','targetStart','targetEnd','targetGrade','targetSpecification','targetRecipient'].map(key=>[key,existing[key]??''])),after:Object.fromEntries(['targetQty','targetStart','targetEnd','targetGrade','targetSpecification','targetRecipient'].map(key=>[key,item[key]??'']))}];
          if (['planStages','planTasks'].includes(type)) item.history=[...(existing?.history||[]),{at:new Date().toISOString(),action:existing?'수정':'등록',before:existing?clone(existing):null,reason:values.reason||'',date:values.date||'',start:values.start||'',end:values.end||''}].map(h=>{if(h.before)delete h.before.history;return h;});
          if (type === 'cycles') item.quantityPending = false;
          if (type === 'shipments') item.history = [...(existing?.history || []), { at: new Date().toISOString(), action: existing ? '정정' : '등록', quantity: item.quantity, unit: item.unit, stockQuantity: stockQuantity(item), stockUnit: s.cycles.find(c => c.id === item.cycleId)?.unit }];
          if (existing) Object.assign(existing, item); else s[type].push(item);
          return item.id;
        });
      },
      remove(type, key, reason) {
        return transact(s => {
          if (!['farms','houses','cycles','records','shipments'].includes(type)) throw new Error('계획은 연기·생략으로 이력을 보존해 주세요.');
          const entry = s[type]?.find(v => v.id === key);
          if (!entry) throw new Error('기록을 찾을 수 없습니다.');
          if (type === 'records' && entry.inputSource === 'automatic') throw new Error('자동 실행 원본은 재배일지에서 직접 삭제할 수 없습니다.');
          if (type === 'shipments') {
            if (!String(reason || '').trim()) throw new Error('취소 사유를 입력해 주세요.');
            if (entry.cancelled) throw new Error('이미 취소된 출하입니다.');
            entry.cancelled = true; entry.cancelReason = reason;
            entry.history.push({ at: new Date().toISOString(), action: '취소', reason }); return;
          }
          const linked = type === 'farms' ? s.houses.some(v => v.farmId === key) : type === 'houses' ? s.cycles.some(v => v.houseId === key) : type === 'cycles' ? s.records.some(v => v.cycleId === key) || s.shipments.some(v => v.cycleId === key) || s.adjustments.some(v => v.cycleId === key) || (s.planTasks||[]).some(v=>v.cycleId===key) || (s.planStages||[]).some(v=>v.cycleId===key) : false;
          if (linked) throw new Error('연결된 기록이 있어 삭제할 수 없습니다. 사용 종료 또는 작기 종료로 이력을 보존해 주세요.');
          s[type] = s[type].filter(v => v.id !== key);
        });
      },
      adjust(values) { return transact(s => { const c = s.cycles.find(c => c.id === values.cycleId); if (c?.status === 'ended') throw new Error('종료한 작기는 수량을 변경할 수 없습니다.'); if (c?.quantityPending) throw new Error('시작 재배수량·단위를 먼저 등록해 주세요.'); s.adjustments.push({ ...values, id: id('quantity') }); }); },
      profile(values) { return transact(s => { s.profile.name = String(values.name || '').trim(); s.profile.phone = String(values.phone || '').trim(); if (!s.profile.name) throw new Error('이름을 입력해 주세요.'); }); }
    };
  }
  // All records in this workspace belong to its current member profile.
  // Resolve descendants by ID; names are display values and are never join keys.
  function context(state, ref = {}) {
    const lookup = (type, key) => key ? state[type].find(item => item.id === key) : null;
    const record = lookup('records',ref.recordId);
    const shipment = lookup('shipments',ref.shipmentId);
    const adjustment = lookup('adjustments',ref.adjustmentId);
    if ((ref.recordId && !record) || (ref.shipmentId && !shipment) || (ref.adjustmentId && !adjustment)) return null;
    const cycleId = ref.cycleId || record?.cycleId || shipment?.cycleId || adjustment?.cycleId;
    const cycle = lookup('cycles',cycleId);
    const house = lookup('houses',ref.houseId || cycle?.houseId);
    const farm = lookup('farms',ref.farmId || house?.farmId);
    if ((cycleId && !cycle) || ((ref.houseId || cycle) && !house) || ((ref.farmId || house) && !farm)) return null;
    if ((cycle && ref.houseId && cycle.houseId !== ref.houseId) || (house && ref.farmId && house.farmId !== ref.farmId)) return null;
    for (const item of [record,shipment,adjustment]) if (item?.cycleId && item.cycleId !== cycleId) return null;
    return { profile:state.profile, farm, house, cycle, record, shipment, adjustment };
  }
  const api = { create, seed, validate, context, KEY, today, stockQuantity, GRADES };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ProducerManagementStore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
