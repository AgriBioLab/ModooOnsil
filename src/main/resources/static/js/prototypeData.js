// MariaDB 'modooonsil-reduced-dummy' 스냅샷(2026-11-16T11:24:07)에서 생성한 정적 UI 데이터.
// 직접 수정하지 말고 DB 내보내기 후 생성 스크립트를 다시 실행한다.
const prototypeData = {
  "meta": {
    "project": "모두의온실",
    "version": "db-snapshot-2026-11-16T11:24:07",
    "today": "2026-11-16",
    "user": "화훼 재배 농민",
    "mode": "db-snapshot",
    "commonCrop": "호접란",
    "commonVariety": "만천홍",
    "source": {
      "database": "modooonsil-reduced-dummy",
      "exportedAt": "2026-11-16T11:24:07",
      "counts": {
        "farm_member": 3,
        "greenhouse": 6,
        "crop": 4,
        "crop_stage_standard": 10,
        "cultivation_plan": 7,
        "cultivation_diary": 8,
        "cultivation_diary_task": 16,
        "greenhouse_environment_history": 15,
        "greenhouse_issue": 5
      }
    }
  },
  "header": {
    "breadcrumb": [
      "재배관리",
      "재배일지"
    ],
    "title": "재배일지",
    "currentUser": {
      "id": "940001",
      "displayName": "김민준",
      "role": "화훼농민",
      "certification": "인증",
      "businessNumber": "FLOW-940001",
      "username": "seedrose01",
      "farmName": "모두의 장미농장",
      "email": "seed-workflow-rose@example.test",
      "phone": "010-4829-3715",
      "address": "경기도 고양시",
      "addressDetail": "테스트 농장 1",
      "mainCrop": "장미",
      "description": "장미 재배 및 온실 환경 관리 농장"
    }
  },
  "crops": [
    {
      "cropId": "940001",
      "name": "장미",
      "varieties": [
        {
          "varietyId": "940001",
          "name": "레드나오미"
        }
      ]
    },
    {
      "cropId": "940002",
      "name": "호접란",
      "varieties": [
        {
          "varietyId": "940002",
          "name": "만천홍"
        },
        {
          "varietyId": "940003",
          "name": "비비안"
        },
        {
          "varietyId": "940004",
          "name": "주피터"
        }
      ]
    }
  ],
  "greenhouses": [
    {
      "greenhouseId": "940001",
      "memberId": "940001",
      "name": "A온실",
      "type": "단동",
      "coverType": "유리",
      "buildingCount": 1,
      "sideHeight": 4.5,
      "width": 8,
      "length": 40,
      "registeredArea": 320,
      "mediumType": "수태"
    },
    {
      "greenhouseId": "940002",
      "memberId": "940001",
      "name": "B온실",
      "type": "단동",
      "coverType": "유리",
      "buildingCount": 1,
      "sideHeight": 4.5,
      "width": 8,
      "length": 40,
      "registeredArea": 320,
      "mediumType": "코코피트"
    },
    {
      "greenhouseId": "940004",
      "memberId": "940002",
      "name": "A온실",
      "type": "단동",
      "coverType": "비닐",
      "buildingCount": 1,
      "sideHeight": 4.5,
      "width": 8,
      "length": 40,
      "registeredArea": 320,
      "mediumType": "코코피트"
    },
    {
      "greenhouseId": "940005",
      "memberId": "940002",
      "name": "B온실",
      "type": "연동",
      "coverType": "유리",
      "buildingCount": 3,
      "sideHeight": 4.5,
      "width": 24,
      "length": 40,
      "registeredArea": 960,
      "mediumType": "수태"
    },
    {
      "greenhouseId": "940009",
      "memberId": "940002",
      "name": "C온실",
      "type": "단동",
      "coverType": "유리",
      "buildingCount": 2,
      "sideHeight": 4.2,
      "width": 10,
      "length": 35,
      "registeredArea": 350,
      "mediumType": "수태"
    },
    {
      "greenhouseId": "941018",
      "memberId": "940002",
      "name": "D온실",
      "type": "연동",
      "coverType": "비닐",
      "buildingCount": 3,
      "sideHeight": 4,
      "width": 11,
      "length": 35,
      "registeredArea": 385,
      "mediumType": "수태"
    }
  ],
  "growthStages": [
    {
      "stageId": "VEG",
      "order": 1,
      "name": "영양생장기"
    },
    {
      "stageId": "IND",
      "order": 2,
      "name": "꽃눈유도기"
    },
    {
      "stageId": "REP",
      "order": 3,
      "name": "생식생장기"
    }
  ],
  "workTypes": [
    {
      "value": "관수",
      "label": "관수"
    },
    {
      "value": "방제",
      "label": "방제"
    },
    {
      "value": "환경 조절",
      "label": "환경 조절"
    },
    {
      "value": "생육 관리",
      "label": "생육 관리"
    },
    {
      "value": "기타",
      "label": "기타"
    }
  ],
  "taskStatuses": [
    {
      "value": "완료",
      "label": "완료"
    },
    {
      "value": "미완료",
      "label": "미완료"
    }
  ],
  "cycles": [
    {
      "cycleId": "940001",
      "memberId": "940002",
      "greenhouseId": "940004",
      "cropId": "940002",
      "varietyId": "940002",
      "environmentStandardSetId": "940004",
      "stageHistory": [
        {
          "eventId": "940001",
          "stageId": "VEG",
          "effectiveDate": "2026-10-02",
          "effectiveAt": "2026-10-02T08:30:15",
          "sourceDiaryId": "940001",
          "reason": null
        },
        {
          "eventId": "940002",
          "stageId": "IND",
          "effectiveDate": "2026-10-24",
          "effectiveAt": "2026-10-24T08:30:15",
          "sourceDiaryId": "940002",
          "reason": "잎과 줄기의 생장이 안정되어 꽃눈유도기로 전환"
        },
        {
          "eventId": "940003",
          "stageId": "REP",
          "effectiveDate": "2026-11-09",
          "effectiveAt": "2026-11-09T08:30:15",
          "sourceDiaryId": "940003",
          "reason": "꽃봉오리 형성을 확인해 생식생장기로 전환"
        }
      ],
      "actualStartDate": "2026-10-01",
      "plannedStartAt": "2026-10-01T00:00:00",
      "expectedEndAt": "2026-12-20T23:59:59",
      "actualStartAt": "2026-10-01T00:00:00",
      "actualEndAt": null,
      "registeredAt": "2026-07-02T09:00:00",
      "name": "2026년 가을 1차 작기",
      "status": "진행",
      "endReason": null
    },
    {
      "cycleId": "940002",
      "memberId": "940002",
      "greenhouseId": "940004",
      "cropId": "940002",
      "varietyId": "940002",
      "environmentStandardSetId": "940006",
      "stageHistory": [
        {
          "eventId": "940005",
          "stageId": "REP",
          "effectiveDate": "2026-09-20",
          "effectiveAt": "2026-09-20T08:30:15",
          "sourceDiaryId": "940005",
          "reason": null
        }
      ],
      "actualStartDate": "2026-07-10",
      "plannedStartAt": "2026-07-10T00:00:00",
      "expectedEndAt": "2026-09-20T23:59:59",
      "actualStartAt": "2026-07-10T00:00:00",
      "actualEndAt": "2026-09-20T23:59:59",
      "registeredAt": "2026-07-02T09:00:00",
      "name": "2026년 여름 작기",
      "status": "종료",
      "endReason": "예정 수확 완료"
    },
    {
      "cycleId": "940003",
      "memberId": "940002",
      "greenhouseId": "940009",
      "cropId": "940002",
      "varietyId": "940002",
      "environmentStandardSetId": "940004",
      "stageHistory": [],
      "actualStartDate": null,
      "plannedStartAt": "2026-11-20T00:00:00",
      "expectedEndAt": "2027-01-20T23:59:59",
      "actualStartAt": null,
      "actualEndAt": null,
      "registeredAt": "2026-07-02T09:00:00",
      "name": "2026년 겨울 1차 작기",
      "status": "미진행",
      "endReason": null
    },
    {
      "cycleId": "940005",
      "memberId": "940002",
      "greenhouseId": "940005",
      "cropId": "940002",
      "varietyId": "940002",
      "environmentStandardSetId": "940005",
      "stageHistory": [],
      "actualStartDate": "2026-11-03",
      "plannedStartAt": "2026-11-01T00:00:00",
      "expectedEndAt": "2026-12-29T23:59:59",
      "actualStartAt": "2026-11-03T00:00:00",
      "actualEndAt": null,
      "registeredAt": "2026-07-02T09:00:00",
      "name": "2026년 가을 2차 작기",
      "status": "진행",
      "endReason": null
    },
    {
      "cycleId": "940006",
      "memberId": "940002",
      "greenhouseId": "940005",
      "cropId": "940002",
      "varietyId": "940003",
      "environmentStandardSetId": "940007",
      "stageHistory": [],
      "actualStartDate": null,
      "plannedStartAt": "2026-11-08T00:00:00",
      "expectedEndAt": "2027-01-09T23:59:59",
      "actualStartAt": null,
      "actualEndAt": null,
      "registeredAt": "2026-07-02T09:00:00",
      "name": "2026년 늦가을 작기",
      "status": "미진행",
      "endReason": null
    },
    {
      "cycleId": "940008",
      "memberId": "940002",
      "greenhouseId": "940009",
      "cropId": "940002",
      "varietyId": "940004",
      "environmentStandardSetId": "940010",
      "stageHistory": [],
      "actualStartDate": null,
      "plannedStartAt": "2026-12-01T00:00:00",
      "expectedEndAt": "2027-02-10T23:59:59",
      "actualStartAt": null,
      "actualEndAt": null,
      "registeredAt": "2026-11-13T10:10:00",
      "name": "2026년 동계 작기",
      "status": "미진행",
      "endReason": null
    },
    {
      "cycleId": "940009",
      "memberId": "940002",
      "greenhouseId": "940009",
      "cropId": "940002",
      "varietyId": "940002",
      "environmentStandardSetId": "940004",
      "stageHistory": [
        {
          "eventId": "940008",
          "stageId": "VEG",
          "effectiveDate": "2026-11-08",
          "effectiveAt": "2026-11-08T09:20:00",
          "sourceDiaryId": "940008",
          "reason": null
        },
        {
          "eventId": "940009",
          "stageId": "IND",
          "effectiveDate": "2026-11-12",
          "effectiveAt": "2026-11-12T13:30:00",
          "sourceDiaryId": "940009",
          "reason": "꽃눈 형성을 확인해 단계 변경"
        }
      ],
      "actualStartDate": "2026-10-04",
      "plannedStartAt": "2026-10-01T00:00:00",
      "expectedEndAt": "2026-11-10T23:59:59",
      "actualStartAt": "2026-10-04T00:00:00",
      "actualEndAt": null,
      "registeredAt": "2026-09-20T09:00:00",
      "name": "2026년 가을 3차 작기",
      "status": "진행",
      "endReason": null
    }
  ],
  "sampleDiaries": [
    {
      "diaryId": "940001",
      "cycleId": "940001",
      "workDate": "2026-10-02",
      "workedAt": "2026-10-02T08:30:15",
      "stageId": "VEG",
      "createdAt": "2026-10-02T09:05:00",
      "updatedAt": null,
      "stageChangeReason": null,
      "tasks": [
        {
          "taskId": "940001",
          "startedAt": "2026-10-02T09:00:00",
          "name": "양액 관수",
          "type": "관수",
          "status": "완료",
          "content": "양액 관수 작업 결과 기록"
        },
        {
          "taskId": "940002",
          "startedAt": "2026-10-02T10:05:00",
          "name": "양액 관수",
          "type": "관수",
          "status": "미완료",
          "content": null
        },
        {
          "taskId": "940003",
          "startedAt": "2026-10-02T09:10:00",
          "name": "병해충 예찰",
          "type": "방제",
          "status": "완료",
          "content": "병해충 예찰 작업 결과 기록"
        },
        {
          "taskId": "940004",
          "startedAt": "2026-10-02T10:15:00",
          "name": "병해충 예찰",
          "type": "방제",
          "status": "미완료",
          "content": null
        },
        {
          "taskId": "940005",
          "startedAt": "2026-10-02T09:20:00",
          "name": "환기창 조절",
          "type": "환경 조절",
          "status": "완료",
          "content": "환기창 조절 작업 결과 기록"
        },
        {
          "taskId": "940006",
          "startedAt": "2026-10-02T10:25:00",
          "name": "환기창 조절",
          "type": "환경 조절",
          "status": "미완료",
          "content": null
        }
      ]
    },
    {
      "diaryId": "940002",
      "cycleId": "940001",
      "workDate": "2026-10-24",
      "workedAt": "2026-10-24T08:30:15",
      "stageId": "IND",
      "createdAt": "2026-10-24T09:05:00",
      "updatedAt": "2026-10-25T10:00:00",
      "stageChangeReason": "잎과 줄기의 생장이 안정되어 꽃눈유도기로 전환",
      "tasks": [
        {
          "taskId": "940007",
          "startedAt": "2026-10-24T09:00:00",
          "name": "꽃봉오리 확인",
          "type": "생육 관리",
          "status": "완료",
          "content": "꽃봉오리 확인 작업 결과 기록"
        },
        {
          "taskId": "940008",
          "startedAt": "2026-10-24T10:05:00",
          "name": "꽃봉오리 확인",
          "type": "생육 관리",
          "status": "미완료",
          "content": null
        },
        {
          "taskId": "940009",
          "startedAt": "2026-10-24T09:10:00",
          "name": "작업 통로 정리",
          "type": "기타",
          "status": "완료",
          "content": "작업 통로 정리 작업 결과 기록"
        },
        {
          "taskId": "940010",
          "startedAt": "2026-10-24T10:15:00",
          "name": "작업 통로 정리",
          "type": "기타",
          "status": "미완료",
          "content": null
        }
      ]
    },
    {
      "diaryId": "940003",
      "cycleId": "940001",
      "workDate": "2026-11-09",
      "workedAt": "2026-11-09T08:30:15",
      "stageId": "REP",
      "createdAt": "2026-11-09T09:05:00",
      "updatedAt": null,
      "stageChangeReason": "꽃봉오리 형성을 확인해 생식생장기로 전환",
      "tasks": [
        {
          "taskId": "940011",
          "startedAt": "2026-11-09T09:20:00",
          "name": "개화 상태 확인",
          "type": "생육 관리",
          "status": "완료",
          "content": null
        }
      ]
    },
    {
      "diaryId": "940004",
      "cycleId": "940001",
      "workDate": "2026-11-12",
      "workedAt": "2026-11-12T08:30:15",
      "stageId": "REP",
      "createdAt": "2026-11-12T09:05:00",
      "updatedAt": null,
      "stageChangeReason": null,
      "tasks": []
    },
    {
      "diaryId": "940005",
      "cycleId": "940002",
      "workDate": "2026-09-20",
      "workedAt": "2026-09-20T08:30:15",
      "stageId": "REP",
      "createdAt": "2026-09-20T09:05:00",
      "updatedAt": null,
      "stageChangeReason": null,
      "tasks": [
        {
          "taskId": "940012",
          "startedAt": "2026-09-20T09:25:00",
          "name": "수확 후 정리",
          "type": "기타",
          "status": "완료",
          "content": "수확 후 정리 작업 완료"
        }
      ]
    },
    {
      "diaryId": "940008",
      "cycleId": "940009",
      "workDate": "2026-11-08",
      "workedAt": "2026-11-08T09:20:00",
      "stageId": "VEG",
      "createdAt": "2026-11-08T10:00:00",
      "updatedAt": null,
      "stageChangeReason": null,
      "tasks": [
        {
          "taskId": "940014",
          "startedAt": "2026-11-08T09:20:00",
          "name": "배지 수분 저하로 추가 관수",
          "type": "관수",
          "status": "완료",
          "content": "관수 후 배지 수분 54% 확인"
        }
      ]
    },
    {
      "diaryId": "940009",
      "cycleId": "940009",
      "workDate": "2026-11-12",
      "workedAt": "2026-11-12T13:30:00",
      "stageId": "IND",
      "createdAt": "2026-11-13T08:45:00",
      "updatedAt": "2026-11-13T09:10:00",
      "stageChangeReason": "꽃눈 형성을 확인해 단계 변경",
      "tasks": [
        {
          "taskId": "940015",
          "startedAt": "2026-11-12T13:35:00",
          "name": "고온 대응 측창 개방",
          "type": "환경 조절",
          "status": "완료",
          "content": "측창 개방 후 온도 재측정"
        },
        {
          "taskId": "940016",
          "startedAt": "2026-11-12T15:00:00",
          "name": "황색 점착 트랩 교체",
          "type": "방제",
          "status": "미완료",
          "content": null
        }
      ]
    },
    {
      "diaryId": "940010",
      "cycleId": "940009",
      "workDate": "2026-11-13",
      "workedAt": "2026-11-13T08:30:00",
      "stageId": "IND",
      "createdAt": "2026-11-13T08:35:00",
      "updatedAt": null,
      "stageChangeReason": null,
      "tasks": [
        {
          "taskId": "940017",
          "startedAt": "2026-11-13T08:30:00",
          "name": "습도 센서 연결 점검",
          "type": "기타",
          "status": "완료",
          "content": "커넥터 재결합 후 측정 정상 복귀"
        }
      ]
    }
  ],
  "issueSamples": [
    {
      "issueId": "940001",
      "cycleId": "940001",
      "occurredAt": "2026-10-03T08:00:00",
      "actionCompletedAt": null,
      "issueType": "온도",
      "message": "온도 하한 미만 · 발생",
      "status": "발생",
      "issueValue": 17.99,
      "actionContent": null
    },
    {
      "issueId": "940002",
      "cycleId": "940001",
      "occurredAt": "2026-10-03T08:01:00",
      "actionCompletedAt": null,
      "issueType": "온도",
      "message": "온도 하한 미만 · 조치중",
      "status": "조치중",
      "issueValue": 17.99,
      "actionContent": "설비와 센서 상태를 점검 중"
    },
    {
      "issueId": "940003",
      "cycleId": "940001",
      "occurredAt": "2026-10-03T08:02:00",
      "actionCompletedAt": "2026-10-03T11:30:00",
      "issueType": "온도",
      "message": "온도 하한 미만 · 조치 완료",
      "status": "조치 완료",
      "issueValue": 17.99,
      "actionContent": "설비 조정 후 재측정 완료"
    },
    {
      "issueId": "940055",
      "cycleId": "940009",
      "occurredAt": "2026-11-08T09:15:00",
      "actionCompletedAt": "2026-11-08T09:45:00",
      "issueType": "배지수분량",
      "message": "배지 수분이 기준 하한 미만으로 떨어짐",
      "status": "조치 완료",
      "issueValue": 36,
      "actionContent": "추가 관수 후 09:45에 배지 수분 54% 확인"
    },
    {
      "issueId": "940056",
      "cycleId": "940009",
      "occurredAt": "2026-11-12T13:30:00",
      "actionCompletedAt": "2026-11-12T14:10:00",
      "issueType": "온도",
      "message": "한낮 온도가 기준 상한을 초과함",
      "status": "조치 완료",
      "issueValue": 31.2,
      "actionContent": "측창을 개방하고 14:10에 온도 25.4℃ 확인"
    }
  ],
  "rules": {
    "diaryUniqueBy": [
      "cycleId",
      "workDate"
    ],
    "diaryTitle": false,
    "dateRange": [
      "actualStartDate",
      "today"
    ],
    "historicalRegistration": true,
    "noStageRegression": true,
    "stageImmutableAfterDiarySaved": true,
    "stageHistoryInitialDateEqualsCycleStart": true,
    "workTypesCustomizable": false,
    "taskPlanningAllowed": true,
    "unimplemented": [
      "사진",
      "날씨",
      "일지별 비고",
      "작업유형 사용자 정의"
    ],
    "stageChangeReasonRequiredWhenStageAdvances": true,
    "stageChangeReasonTypes": [
      "growth",
      "environment",
      "other"
    ],
    "stageChangeReasonInput": "생육단계가 변경되는 경우 단일 변경 사유 입력칸 필수"
  },
  "formDefaults": {},
  "pagination": {
    "pageSize": 5,
    "cyclePageSize": 5,
    "environmentPageSize": 7
  },
  "standardSets": [
    {
      "id": "940001",
      "name": "레드나오미 · 영양생장기",
      "cropId": "940001",
      "varietyId": "940001",
      "stageId": "VEG"
    },
    {
      "id": "940002",
      "name": "레드나오미 · 꽃눈유도기",
      "cropId": "940001",
      "varietyId": "940001",
      "stageId": "IND"
    },
    {
      "id": "940003",
      "name": "레드나오미 · 생식생장기",
      "cropId": "940001",
      "varietyId": "940001",
      "stageId": "REP"
    },
    {
      "id": "940004",
      "name": "만천홍 · 영양생장기",
      "cropId": "940002",
      "varietyId": "940002",
      "stageId": "VEG"
    },
    {
      "id": "940005",
      "name": "만천홍 · 꽃눈유도기",
      "cropId": "940002",
      "varietyId": "940002",
      "stageId": "IND"
    },
    {
      "id": "940006",
      "name": "만천홍 · 생식생장기",
      "cropId": "940002",
      "varietyId": "940002",
      "stageId": "REP"
    },
    {
      "id": "940007",
      "name": "비비안 · 영양생장기",
      "cropId": "940002",
      "varietyId": "940003",
      "stageId": "VEG"
    },
    {
      "id": "940008",
      "name": "비비안 · 꽃눈유도기",
      "cropId": "940002",
      "varietyId": "940003",
      "stageId": "IND"
    },
    {
      "id": "940009",
      "name": "비비안 · 생식생장기",
      "cropId": "940002",
      "varietyId": "940003",
      "stageId": "REP"
    },
    {
      "id": "940010",
      "name": "주피터 · 기준 미입력",
      "cropId": "940002",
      "varietyId": "940004",
      "stageId": null
    }
  ],
  "measurementFields": [
    {
      "key": "insideTempC",
      "label": "온실 내부 온도 측정값",
      "unit": "°C",
      "criterion": "insideTemp"
    },
    {
      "key": "humidityPct",
      "label": "온실 내부 습도 측정값",
      "unit": "%RH",
      "criterion": "humidityPct"
    },
    {
      "key": "co2Ppm",
      "label": "온실 내부 이산화탄소 측정값",
      "unit": "ppm",
      "criterion": "co2Ppm"
    },
    {
      "key": "solarWm2",
      "label": "온실 내부 일사량 측정값",
      "unit": "W/m²",
      "criterion": "solarWm2"
    },
    {
      "key": "lightUmolM2S",
      "label": "온실 내부 광량 측정값",
      "unit": "μmol/m²/s",
      "criterion": "lightUmolM2S"
    },
    {
      "key": "substrateTempC",
      "label": "온실 내부 배지 온도 측정값",
      "unit": "°C",
      "criterion": "substrateTempC"
    },
    {
      "key": "substrateMoisturePct",
      "label": "온실 내부 배지 수분 측정값",
      "unit": "%",
      "criterion": "substrateMoisturePct"
    },
    {
      "key": "substrateEcMsCm",
      "label": "온실 내부 배지 EC 측정값",
      "unit": "mS/cm",
      "criterion": "substrateEcMsCm"
    },
    {
      "key": "substratePh",
      "label": "온실 내부 배지 pH 측정값",
      "unit": "pH",
      "criterion": "substratePh"
    }
  ],
  "stageEnvironmentalCriteria": [
    {
      "criterionId": "940001",
      "setId": "940001",
      "cropId": "940001",
      "varietyId": "940001",
      "stageId": "VEG",
      "stageOrder": 1,
      "standardDays": 21,
      "thresholds": {
        "dayTempC": [
          18,
          28
        ],
        "nightTempC": [
          14,
          20
        ],
        "humidityPct": [
          50,
          80
        ],
        "co2Ppm": [
          400,
          1000
        ],
        "solarWm2": [
          200,
          800
        ],
        "lightUmolM2S": [
          150,
          550
        ],
        "substrateTempC": [
          16,
          25
        ],
        "substrateMoisturePct": [
          40,
          70
        ],
        "substrateEcMsCm": [
          1.2,
          2.4
        ],
        "substratePh": [
          5.5,
          6.5
        ]
      }
    },
    {
      "criterionId": "940002",
      "setId": "940002",
      "cropId": "940001",
      "varietyId": "940001",
      "stageId": "IND",
      "stageOrder": 2,
      "standardDays": 14,
      "thresholds": {
        "dayTempC": [
          19,
          29
        ],
        "nightTempC": [
          15,
          21
        ],
        "humidityPct": [
          50,
          80
        ],
        "co2Ppm": [
          400,
          1000
        ],
        "solarWm2": [
          200,
          800
        ],
        "lightUmolM2S": [
          150,
          550
        ],
        "substrateTempC": [
          16,
          25
        ],
        "substrateMoisturePct": [
          40,
          70
        ],
        "substrateEcMsCm": [
          1.2,
          2.4
        ],
        "substratePh": [
          5.5,
          6.5
        ]
      }
    },
    {
      "criterionId": "940003",
      "setId": "940003",
      "cropId": "940001",
      "varietyId": "940001",
      "stageId": "REP",
      "stageOrder": 3,
      "standardDays": 28,
      "thresholds": {
        "dayTempC": [
          20,
          30
        ],
        "nightTempC": [
          16,
          22
        ],
        "humidityPct": [
          50,
          80
        ],
        "co2Ppm": [
          400,
          1000
        ],
        "solarWm2": [
          200,
          800
        ],
        "lightUmolM2S": [
          150,
          550
        ],
        "substrateTempC": [
          16,
          25
        ],
        "substrateMoisturePct": [
          40,
          70
        ],
        "substrateEcMsCm": [
          1.2,
          2.4
        ],
        "substratePh": [
          5.5,
          6.5
        ]
      }
    },
    {
      "criterionId": "940004",
      "setId": "940004",
      "cropId": "940002",
      "varietyId": "940002",
      "stageId": "VEG",
      "stageOrder": 1,
      "standardDays": 21,
      "thresholds": {
        "dayTempC": [
          18,
          28
        ],
        "nightTempC": [
          14,
          20
        ],
        "humidityPct": [
          50,
          80
        ],
        "co2Ppm": [
          400,
          1000
        ],
        "solarWm2": [
          200,
          800
        ],
        "lightUmolM2S": [
          150,
          550
        ],
        "substrateTempC": [
          16,
          25
        ],
        "substrateMoisturePct": [
          40,
          70
        ],
        "substrateEcMsCm": [
          1.2,
          2.4
        ],
        "substratePh": [
          5.5,
          6.5
        ]
      }
    },
    {
      "criterionId": "940005",
      "setId": "940005",
      "cropId": "940002",
      "varietyId": "940002",
      "stageId": "IND",
      "stageOrder": 2,
      "standardDays": 14,
      "thresholds": {
        "dayTempC": [
          19,
          29
        ],
        "nightTempC": [
          15,
          21
        ],
        "humidityPct": [
          50,
          80
        ],
        "co2Ppm": [
          400,
          1000
        ],
        "solarWm2": [
          200,
          800
        ],
        "lightUmolM2S": [
          150,
          550
        ],
        "substrateTempC": [
          16,
          25
        ],
        "substrateMoisturePct": [
          40,
          70
        ],
        "substrateEcMsCm": [
          1.2,
          2.4
        ],
        "substratePh": [
          5.5,
          6.5
        ]
      }
    },
    {
      "criterionId": "940006",
      "setId": "940006",
      "cropId": "940002",
      "varietyId": "940002",
      "stageId": "REP",
      "stageOrder": 3,
      "standardDays": 28,
      "thresholds": {
        "dayTempC": [
          20,
          30
        ],
        "nightTempC": [
          16,
          22
        ],
        "humidityPct": [
          50,
          80
        ],
        "co2Ppm": [
          400,
          1000
        ],
        "solarWm2": [
          200,
          800
        ],
        "lightUmolM2S": [
          150,
          550
        ],
        "substrateTempC": [
          16,
          25
        ],
        "substrateMoisturePct": [
          40,
          70
        ],
        "substrateEcMsCm": [
          1.2,
          2.4
        ],
        "substratePh": [
          5.5,
          6.5
        ]
      }
    },
    {
      "criterionId": "940007",
      "setId": "940007",
      "cropId": "940002",
      "varietyId": "940003",
      "stageId": "VEG",
      "stageOrder": 1,
      "standardDays": 21,
      "thresholds": {
        "dayTempC": [
          18,
          28
        ],
        "nightTempC": [
          14,
          20
        ],
        "humidityPct": [
          50,
          80
        ],
        "co2Ppm": [
          400,
          1000
        ],
        "solarWm2": [
          200,
          800
        ],
        "lightUmolM2S": [
          150,
          550
        ],
        "substrateTempC": [
          16,
          25
        ],
        "substrateMoisturePct": [
          40,
          70
        ],
        "substrateEcMsCm": [
          1.2,
          2.4
        ],
        "substratePh": [
          5.5,
          6.5
        ]
      }
    },
    {
      "criterionId": "940008",
      "setId": "940008",
      "cropId": "940002",
      "varietyId": "940003",
      "stageId": "IND",
      "stageOrder": 2,
      "standardDays": 14,
      "thresholds": {
        "dayTempC": [
          19,
          29
        ],
        "nightTempC": [
          15,
          21
        ],
        "humidityPct": [
          50,
          80
        ],
        "co2Ppm": [
          400,
          1000
        ],
        "solarWm2": [
          200,
          800
        ],
        "lightUmolM2S": [
          150,
          550
        ],
        "substrateTempC": [
          16,
          25
        ],
        "substrateMoisturePct": [
          40,
          70
        ],
        "substrateEcMsCm": [
          1.2,
          2.4
        ],
        "substratePh": [
          5.5,
          6.5
        ]
      }
    },
    {
      "criterionId": "940009",
      "setId": "940009",
      "cropId": "940002",
      "varietyId": "940003",
      "stageId": "REP",
      "stageOrder": 3,
      "standardDays": 28,
      "thresholds": {
        "dayTempC": [
          20,
          30
        ],
        "nightTempC": [
          16,
          22
        ],
        "humidityPct": [
          50,
          80
        ],
        "co2Ppm": [
          400,
          1000
        ],
        "solarWm2": [
          200,
          800
        ],
        "lightUmolM2S": [
          150,
          550
        ],
        "substrateTempC": [
          16,
          25
        ],
        "substrateMoisturePct": [
          40,
          70
        ],
        "substrateEcMsCm": [
          1.2,
          2.4
        ],
        "substratePh": [
          5.5,
          6.5
        ]
      }
    }
  ],
  "cyclePolicies": {
    "manualEnd": true,
    "automatedEnd": false,
    "environmentReadingMode": "작기 중 환경변화 조회만 제공",
    "dayNightClassification": "미확정: 온도 비교는 미판정 처리",
    "cycleNameUniqueInPrototype": true,
    "cycleStartInitialStage": "VEG",
    "endReasonOptional": true,
    "plannedAndActualDateSeparate": true,
    "statusValues": [
      "미진행",
      "진행",
      "종료"
    ],
    "greenhouseRegistration": "이번 스프린트 UI 대상 제외",
    "environmentChangeParent": "작기계획",
    "environmentChangeChildFields": [
      "환경변화 일련번호",
      "작기계획 일련번호",
      "측정일시",
      "환경측정값 9개"
    ]
  },
  "environmentChanges": [
    {
      "environmentChangeId": "940001",
      "cycleId": "940001",
      "measuredAt": "2026-10-03T08:00:00",
      "insideTempC": 17.99,
      "humidityPct": 65,
      "co2Ppm": 650,
      "solarWm2": 450,
      "lightUmolM2S": 300,
      "substrateTempC": 20,
      "substrateMoisturePct": 55,
      "substrateEcMsCm": 1.8,
      "substratePh": 6
    },
    {
      "environmentChangeId": "940002",
      "cycleId": "940001",
      "measuredAt": "2026-10-03T08:01:00",
      "insideTempC": 17.99,
      "humidityPct": 65,
      "co2Ppm": 650,
      "solarWm2": 450,
      "lightUmolM2S": 300,
      "substrateTempC": 20,
      "substrateMoisturePct": 55,
      "substrateEcMsCm": 1.8,
      "substratePh": 6
    },
    {
      "environmentChangeId": "940003",
      "cycleId": "940001",
      "measuredAt": "2026-10-03T08:02:00",
      "insideTempC": 17.99,
      "humidityPct": 65,
      "co2Ppm": 650,
      "solarWm2": 450,
      "lightUmolM2S": 300,
      "substrateTempC": 20,
      "substrateMoisturePct": 55,
      "substrateEcMsCm": 1.8,
      "substratePh": 6
    },
    {
      "environmentChangeId": "940128",
      "cycleId": "940009",
      "measuredAt": "2026-11-08T09:00:00",
      "insideTempC": 25,
      "humidityPct": 67,
      "co2Ppm": 659,
      "solarWm2": 320,
      "lightUmolM2S": 230,
      "substrateTempC": 20,
      "substrateMoisturePct": 55,
      "substrateEcMsCm": 1.8,
      "substratePh": 6
    },
    {
      "environmentChangeId": "940135",
      "cycleId": "940009",
      "measuredAt": "2026-11-10T03:00:00",
      "insideTempC": 19,
      "humidityPct": 69,
      "co2Ppm": 675,
      "solarWm2": 0,
      "lightUmolM2S": 0,
      "substrateTempC": 20,
      "substrateMoisturePct": 55,
      "substrateEcMsCm": 1.8,
      "substratePh": 6
    },
    {
      "environmentChangeId": "940140",
      "cycleId": "940009",
      "measuredAt": "2026-11-11T09:00:00",
      "insideTempC": 25,
      "humidityPct": 70,
      "co2Ppm": 683,
      "solarWm2": 320,
      "lightUmolM2S": 230,
      "substrateTempC": 20,
      "substrateMoisturePct": 55,
      "substrateEcMsCm": 1.8,
      "substratePh": 6
    },
    {
      "environmentChangeId": "940141",
      "cycleId": "940009",
      "measuredAt": "2026-11-11T18:00:00",
      "insideTempC": 23,
      "humidityPct": 70,
      "co2Ppm": 683,
      "solarWm2": 0,
      "lightUmolM2S": 0,
      "substrateTempC": 20,
      "substrateMoisturePct": 55,
      "substrateEcMsCm": 1.8,
      "substratePh": 6
    },
    {
      "environmentChangeId": "940143",
      "cycleId": "940009",
      "measuredAt": "2026-11-12T09:00:00",
      "insideTempC": 23,
      "humidityPct": null,
      "co2Ppm": 691,
      "solarWm2": 320,
      "lightUmolM2S": 230,
      "substrateTempC": 20,
      "substrateMoisturePct": 55,
      "substrateEcMsCm": 1.8,
      "substratePh": 6
    },
    {
      "environmentChangeId": "940149",
      "cycleId": "940009",
      "measuredAt": "2026-11-13T18:00:00",
      "insideTempC": 22,
      "humidityPct": 68,
      "co2Ppm": 699,
      "solarWm2": 0,
      "lightUmolM2S": 0,
      "substrateTempC": 20,
      "substrateMoisturePct": 55,
      "substrateEcMsCm": 1.8,
      "substratePh": 6
    },
    {
      "environmentChangeId": "940150",
      "cycleId": "940005",
      "measuredAt": "2026-11-13T09:00:00",
      "insideTempC": 23,
      "humidityPct": 68,
      "co2Ppm": 620,
      "solarWm2": 380,
      "lightUmolM2S": 250,
      "substrateTempC": 21,
      "substrateMoisturePct": 56,
      "substrateEcMsCm": 1.7,
      "substratePh": 6.1
    },
    {
      "environmentChangeId": "940151",
      "cycleId": "940009",
      "measuredAt": "2026-11-08T09:15:00",
      "insideTempC": 23,
      "humidityPct": 68,
      "co2Ppm": 650,
      "solarWm2": 320,
      "lightUmolM2S": 230,
      "substrateTempC": 20,
      "substrateMoisturePct": 36,
      "substrateEcMsCm": 1.8,
      "substratePh": 6
    },
    {
      "environmentChangeId": "940152",
      "cycleId": "940009",
      "measuredAt": "2026-11-08T09:45:00",
      "insideTempC": 23,
      "humidityPct": 69,
      "co2Ppm": 650,
      "solarWm2": 330,
      "lightUmolM2S": 240,
      "substrateTempC": 20,
      "substrateMoisturePct": 54,
      "substrateEcMsCm": 1.8,
      "substratePh": 6
    },
    {
      "environmentChangeId": "940153",
      "cycleId": "940009",
      "measuredAt": "2026-11-12T13:30:00",
      "insideTempC": 31.2,
      "humidityPct": 68,
      "co2Ppm": 650,
      "solarWm2": 600,
      "lightUmolM2S": 410,
      "substrateTempC": 21,
      "substrateMoisturePct": 55,
      "substrateEcMsCm": 1.8,
      "substratePh": 6
    },
    {
      "environmentChangeId": "940154",
      "cycleId": "940009",
      "measuredAt": "2026-11-12T14:10:00",
      "insideTempC": 25.4,
      "humidityPct": 67,
      "co2Ppm": 650,
      "solarWm2": 550,
      "lightUmolM2S": 380,
      "substrateTempC": 21,
      "substrateMoisturePct": 55,
      "substrateEcMsCm": 1.8,
      "substratePh": 6
    },
    {
      "environmentChangeId": "940156",
      "cycleId": "940005",
      "measuredAt": "2026-11-13T09:10:00",
      "insideTempC": 23,
      "humidityPct": 85,
      "co2Ppm": 620,
      "solarWm2": 380,
      "lightUmolM2S": 250,
      "substrateTempC": 21,
      "substrateMoisturePct": 56,
      "substrateEcMsCm": 1.7,
      "substratePh": 6.1
    }
  ],
  "members": [
    {
      "id": "940001",
      "displayName": "김민준",
      "role": "화훼농민",
      "certification": "인증",
      "businessNumber": "FLOW-940001",
      "username": "seedrose01",
      "farmName": "모두의 장미농장",
      "email": "seed-workflow-rose@example.test",
      "phone": "010-4829-3715",
      "address": "경기도 고양시",
      "addressDetail": "테스트 농장 1",
      "mainCrop": "장미",
      "description": "장미 재배 및 온실 환경 관리 농장"
    },
    {
      "id": "940002",
      "displayName": "이서연",
      "role": "화훼농민",
      "certification": "미인증",
      "businessNumber": null,
      "username": "seedmum02",
      "farmName": "해솔 호접란농장",
      "email": "haesol.orchid@example.com",
      "phone": "010-7315-8492",
      "address": "경기도 고양시 일산동구 호수로 595",
      "addressDetail": "가동 102호",
      "mainCrop": "호접란",
      "description": "호접란 전용 온실 재배 및 생육 환경 관리 농장"
    },
    {
      "id": "940003",
      "displayName": "박도윤",
      "role": "화훼농민",
      "certification": "미인증",
      "businessNumber": null,
      "username": "seedempty03",
      "farmName": "새싹농장",
      "email": null,
      "phone": null,
      "address": null,
      "addressDetail": null,
      "mainCrop": null,
      "description": null
    }
  ]
};
