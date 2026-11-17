const sampleData = {
  "meta": {
    "project": "모두의온실",
    "version": "db-snapshot-2026-11-16T08:53:17",
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
        "crop": 16,
        "crop_stage_standard": 46,
        "cultivation_plan": 7,
        "cultivation_diary": 8,
        "cultivation_diary_task": 30,
        "greenhouse_environment_history": 47,
        "greenhouse_issue": 5
      }
    }
  },
  "authDefaults": {
    "loginUsername": "seedmum02",
    "loginPassword": "modoodemo01",
    "signup": {
      "signupFarmName": "해솔 호접란농장",
      "signupRepresentativeName": "이서연",
      "signupUsername": "haesol02",
      "signupEmail": "haesol.orchid@example.com",
      "signupPassword": "modoodemo01",
      "signupPasswordConfirm": "modoodemo01",
      "signupPhone": "010-7315-8492",
      "signupMainCrop": "호접란"
    },
    "businessNumber": "123-45-67890"
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
        },
        {
          "varietyId": "940005",
          "name": "핑크뷰티"
        },
        {
          "varietyId": "940006",
          "name": "레드윙"
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
        },
        {
          "varietyId": "940007",
          "name": "리틀프린스"
        },
        {
          "varietyId": "940008",
          "name": "아리홍"
        },
        {
          "varietyId": "940009",
          "name": "핑크드림"
        }
      ]
    },
    {
      "cropId": "940010",
      "name": "국화",
      "varieties": [
        {
          "varietyId": "940010",
          "name": "백마"
        },
        {
          "varietyId": "940011",
          "name": "신마"
        },
        {
          "varietyId": "940012",
          "name": "백강"
        }
      ]
    },
    {
      "cropId": "940013",
      "name": "거베라",
      "varieties": [
        {
          "varietyId": "940013",
          "name": "브리즈"
        },
        {
          "varietyId": "940014",
          "name": "하모니"
        }
      ]
    },
    {
      "cropId": "940015",
      "name": "카네이션",
      "varieties": [
        {
          "varietyId": "940015",
          "name": "마블매직"
        },
        {
          "varietyId": "940016",
          "name": "퍼플뷰티"
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
      "mediumType": "수태",
      "imageUrl": "img/gh-a.jpg"
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
      "mediumType": "코코피트",
      "imageUrl": "img/gh-b.jpg"
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
      "mediumType": "코코피트",
      "imageUrl": "img/gh-a.jpg"
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
      "mediumType": "수태",
      "imageUrl": "img/gh-b.jpg"
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
      "mediumType": "수태",
      "imageUrl": "img/gh-c.jpg"
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
      "mediumType": "수태",
      "imageUrl": "img/gh-d.jpg"
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
        },
        {
          "eventId": "940010",
          "stageId": "BLO",
          "effectiveDate": "2026-11-14",
          "effectiveAt": "2026-11-14T09:00:00",
          "sourceDiaryId": null,
          "reason": "꽃대 신장 및 개화 진행 확인"
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
    },
    {
      "cycleId": "940010",
      "memberId": "940002",
      "greenhouseId": "941018",
      "cropId": "940002",
      "varietyId": "940004",
      "environmentStandardSetId": "940010",
      "stageHistory": [
        {
          "eventId": "940011",
          "stageId": "VEG",
          "effectiveDate": "2026-11-10",
          "effectiveAt": "2026-11-10T09:00:00",
          "sourceDiaryId": null,
          "reason": null
        }
      ],
      "actualStartDate": "2026-11-10",
      "plannedStartAt": "2026-11-10T00:00:00",
      "expectedEndAt": "2027-01-25T23:59:59",
      "actualStartAt": "2026-11-10T00:00:00",
      "actualEndAt": null,
      "registeredAt": "2026-11-05T09:00:00",
      "name": "2026년 초겨울 1차 작기",
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
        },
        {
          "taskId": "940109",
          "startedAt": "2026-11-09T08:40:00",
          "name": "양액 관수 및 배액 점검",
          "type": "관수",
          "status": "완료",
          "content": "배지 수분 적정 수준"
        },
        {
          "taskId": "940110",
          "startedAt": "2026-11-09T13:00:00",
          "name": "주간 환기창 자동 개폐 확인",
          "type": "환경 조절",
          "status": "미완료",
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
      "tasks": [
        {
          "taskId": "940104",
          "startedAt": "2026-11-12T08:30:00",
          "name": "양액 EC·pH 점검 및 관수",
          "type": "관수",
          "status": "완료",
          "content": "EC 1.8 mS/cm, pH 6.0 확인"
        },
        {
          "taskId": "940105",
          "startedAt": "2026-11-12T10:15:00",
          "name": "화경 유인 및 지주 고정",
          "type": "생육 관리",
          "status": "완료",
          "content": "생식생장기 화경 꺾임 방지"
        },
        {
          "taskId": "940106",
          "startedAt": "2026-11-12T17:00:00",
          "name": "야간 보온 커튼 점검",
          "type": "환경 조절",
          "status": "미완료",
          "content": null
        }
      ]
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
        },
        {
          "taskId": "940113",
          "startedAt": "2026-09-20T08:30:00",
          "name": "최종 출하 등급 선별",
          "type": "생육 관리",
          "status": "완료",
          "content": "특품·상품 선별 완료"
        },
        {
          "taskId": "940114",
          "startedAt": "2026-09-20T11:00:00",
          "name": "관수 라인 세척 및 소독",
          "type": "기타",
          "status": "완료",
          "content": "차기 작기 준비 완료"
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
        },
        {
          "taskId": "940111",
          "startedAt": "2026-11-08T10:30:00",
          "name": "잎 생장 및 뿌리 활착 점검",
          "type": "생육 관리",
          "status": "완료",
          "content": "뿌리 상태 양호"
        },
        {
          "taskId": "940112",
          "startedAt": "2026-11-08T15:00:00",
          "name": "온실 내부 응애 예찰",
          "type": "방제",
          "status": "미완료",
          "content": null
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
        },
        {
          "taskId": "940107",
          "startedAt": "2026-11-12T09:00:00",
          "name": "오전 점적 관수",
          "type": "관수",
          "status": "완료",
          "content": "관수량 정상 공급"
        },
        {
          "taskId": "940108",
          "startedAt": "2026-11-12T11:00:00",
          "name": "꽃눈 분화 상태 확인",
          "type": "생육 관리",
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
      "updatedAt": "2026-11-13T11:20:00",
      "stageChangeReason": null,
      "tasks": [
        {
          "taskId": "940017",
          "startedAt": "2026-11-13T08:30:00",
          "name": "습도 센서 연결 점검",
          "type": "기타",
          "status": "완료",
          "content": "커넥터 재결합 후 측정 정상 복귀"
        },
        {
          "taskId": "940101",
          "startedAt": "2026-11-13T09:00:00",
          "name": "아침 배지 수분 점검 및 관수",
          "type": "관수",
          "status": "완료",
          "content": "배지 수분 55% 유지 확인"
        },
        {
          "taskId": "940102",
          "startedAt": "2026-11-13T10:30:00",
          "name": "오전 차광막 개폐 조절",
          "type": "환경 조절",
          "status": "완료",
          "content": "광도 300~420 범위 유지"
        },
        {
          "taskId": "940103",
          "startedAt": "2026-11-13T14:00:00",
          "name": "신엽 병해충 예찰",
          "type": "방제",
          "status": "미완료",
          "content": null
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
      "occurredAt": "2026-10-03T07:00:00",
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
      "occurredAt": "2026-10-03T05:00:00",
      "actionCompletedAt": "2026-10-03T11:00:00",
      "issueType": "온도",
      "message": "온도 하한 미만 · 조치 완료",
      "status": "조치 완료",
      "issueValue": 17.99,
      "actionContent": "설비 조정 후 재측정 완료"
    },
    {
      "issueId": "940055",
      "cycleId": "940009",
      "occurredAt": "2026-11-08T10:00:00",
      "actionCompletedAt": "2026-11-08T11:00:00",
      "issueType": "배지수분량",
      "message": "배지 수분이 기준 하한 미만으로 떨어짐",
      "status": "조치 완료",
      "issueValue": 36,
      "actionContent": "추가 관수 후 11:00에 배지 수분 54% 확인"
    },
    {
      "issueId": "940056",
      "cycleId": "940009",
      "occurredAt": "2026-11-12T13:00:00",
      "actionCompletedAt": "2026-11-12T14:00:00",
      "issueType": "온도",
      "message": "한낮 온도가 기준 상한을 초과함",
      "status": "조치 완료",
      "issueValue": 31.2,
      "actionContent": "측창을 개방하고 14:00에 온도 25.4℃ 확인"
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
    },
    {
      "id": "940011",
      "name": "핑크뷰티 · 영양생장기",
      "cropId": "940001",
      "varietyId": "940005",
      "stageId": "VEG"
    },
    {
      "id": "940012",
      "name": "핑크뷰티 · 꽃눈유도기",
      "cropId": "940001",
      "varietyId": "940005",
      "stageId": "IND"
    },
    {
      "id": "940013",
      "name": "핑크뷰티 · 생식생장기",
      "cropId": "940001",
      "varietyId": "940005",
      "stageId": "REP"
    },
    {
      "id": "940014",
      "name": "레드윙 · 영양생장기",
      "cropId": "940001",
      "varietyId": "940006",
      "stageId": "VEG"
    },
    {
      "id": "940015",
      "name": "레드윙 · 꽃눈유도기",
      "cropId": "940001",
      "varietyId": "940006",
      "stageId": "IND"
    },
    {
      "id": "940016",
      "name": "레드윙 · 생식생장기",
      "cropId": "940001",
      "varietyId": "940006",
      "stageId": "REP"
    },
    {
      "id": "940017",
      "name": "리틀프린스 · 영양생장기",
      "cropId": "940002",
      "varietyId": "940007",
      "stageId": "VEG"
    },
    {
      "id": "940018",
      "name": "리틀프린스 · 꽃눈유도기",
      "cropId": "940002",
      "varietyId": "940007",
      "stageId": "IND"
    },
    {
      "id": "940019",
      "name": "리틀프린스 · 생식생장기",
      "cropId": "940002",
      "varietyId": "940007",
      "stageId": "REP"
    },
    {
      "id": "940020",
      "name": "아리홍 · 영양생장기",
      "cropId": "940002",
      "varietyId": "940008",
      "stageId": "VEG"
    },
    {
      "id": "940021",
      "name": "아리홍 · 꽃눈유도기",
      "cropId": "940002",
      "varietyId": "940008",
      "stageId": "IND"
    },
    {
      "id": "940022",
      "name": "아리홍 · 생식생장기",
      "cropId": "940002",
      "varietyId": "940008",
      "stageId": "REP"
    },
    {
      "id": "940023",
      "name": "핑크드림 · 영양생장기",
      "cropId": "940002",
      "varietyId": "940009",
      "stageId": "VEG"
    },
    {
      "id": "940024",
      "name": "핑크드림 · 꽃눈유도기",
      "cropId": "940002",
      "varietyId": "940009",
      "stageId": "IND"
    },
    {
      "id": "940025",
      "name": "핑크드림 · 생식생장기",
      "cropId": "940002",
      "varietyId": "940009",
      "stageId": "REP"
    },
    {
      "id": "940026",
      "name": "백마 · 영양생장기",
      "cropId": "940010",
      "varietyId": "940010",
      "stageId": "VEG"
    },
    {
      "id": "940027",
      "name": "백마 · 꽃눈유도기",
      "cropId": "940010",
      "varietyId": "940010",
      "stageId": "IND"
    },
    {
      "id": "940028",
      "name": "백마 · 생식생장기",
      "cropId": "940010",
      "varietyId": "940010",
      "stageId": "REP"
    },
    {
      "id": "940029",
      "name": "신마 · 영양생장기",
      "cropId": "940010",
      "varietyId": "940011",
      "stageId": "VEG"
    },
    {
      "id": "940030",
      "name": "신마 · 꽃눈유도기",
      "cropId": "940010",
      "varietyId": "940011",
      "stageId": "IND"
    },
    {
      "id": "940031",
      "name": "신마 · 생식생장기",
      "cropId": "940010",
      "varietyId": "940011",
      "stageId": "REP"
    },
    {
      "id": "940032",
      "name": "백강 · 영양생장기",
      "cropId": "940010",
      "varietyId": "940012",
      "stageId": "VEG"
    },
    {
      "id": "940033",
      "name": "백강 · 꽃눈유도기",
      "cropId": "940010",
      "varietyId": "940012",
      "stageId": "IND"
    },
    {
      "id": "940034",
      "name": "백강 · 생식생장기",
      "cropId": "940010",
      "varietyId": "940012",
      "stageId": "REP"
    },
    {
      "id": "940035",
      "name": "브리즈 · 영양생장기",
      "cropId": "940013",
      "varietyId": "940013",
      "stageId": "VEG"
    },
    {
      "id": "940036",
      "name": "브리즈 · 꽃눈유도기",
      "cropId": "940013",
      "varietyId": "940013",
      "stageId": "IND"
    },
    {
      "id": "940037",
      "name": "브리즈 · 생식생장기",
      "cropId": "940013",
      "varietyId": "940013",
      "stageId": "REP"
    },
    {
      "id": "940038",
      "name": "하모니 · 영양생장기",
      "cropId": "940013",
      "varietyId": "940014",
      "stageId": "VEG"
    },
    {
      "id": "940039",
      "name": "하모니 · 꽃눈유도기",
      "cropId": "940013",
      "varietyId": "940014",
      "stageId": "IND"
    },
    {
      "id": "940040",
      "name": "하모니 · 생식생장기",
      "cropId": "940013",
      "varietyId": "940014",
      "stageId": "REP"
    },
    {
      "id": "940041",
      "name": "마블매직 · 영양생장기",
      "cropId": "940015",
      "varietyId": "940015",
      "stageId": "VEG"
    },
    {
      "id": "940042",
      "name": "마블매직 · 꽃눈유도기",
      "cropId": "940015",
      "varietyId": "940015",
      "stageId": "IND"
    },
    {
      "id": "940043",
      "name": "마블매직 · 생식생장기",
      "cropId": "940015",
      "varietyId": "940015",
      "stageId": "REP"
    },
    {
      "id": "940044",
      "name": "퍼플뷰티 · 영양생장기",
      "cropId": "940015",
      "varietyId": "940016",
      "stageId": "VEG"
    },
    {
      "id": "940045",
      "name": "퍼플뷰티 · 꽃눈유도기",
      "cropId": "940015",
      "varietyId": "940016",
      "stageId": "IND"
    },
    {
      "id": "940046",
      "name": "퍼플뷰티 · 생식생장기",
      "cropId": "940015",
      "varietyId": "940016",
      "stageId": "REP"
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
    },
    {
      "criterionId": "940011",
      "setId": "940011",
      "cropId": "940001",
      "varietyId": "940005",
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
      "criterionId": "940012",
      "setId": "940012",
      "cropId": "940001",
      "varietyId": "940005",
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
      "criterionId": "940013",
      "setId": "940013",
      "cropId": "940001",
      "varietyId": "940005",
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
      "criterionId": "940014",
      "setId": "940014",
      "cropId": "940001",
      "varietyId": "940006",
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
      "criterionId": "940015",
      "setId": "940015",
      "cropId": "940001",
      "varietyId": "940006",
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
      "criterionId": "940016",
      "setId": "940016",
      "cropId": "940001",
      "varietyId": "940006",
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
      "criterionId": "940017",
      "setId": "940017",
      "cropId": "940002",
      "varietyId": "940007",
      "stageId": "VEG",
      "stageOrder": 1,
      "standardDays": 35,
      "thresholds": {
        "dayTempC": [
          24,
          30
        ],
        "nightTempC": [
          20,
          24
        ],
        "humidityPct": [
          60,
          80
        ],
        "co2Ppm": [
          400,
          900
        ],
        "solarWm2": [
          150,
          500
        ],
        "lightUmolM2S": [
          120,
          350
        ],
        "substrateTempC": [
          20,
          26
        ],
        "substrateMoisturePct": [
          45,
          70
        ],
        "substrateEcMsCm": [
          0.8,
          1.5
        ],
        "substratePh": [
          5.5,
          6.2
        ]
      }
    },
    {
      "criterionId": "940018",
      "setId": "940018",
      "cropId": "940002",
      "varietyId": "940007",
      "stageId": "IND",
      "stageOrder": 2,
      "standardDays": 28,
      "thresholds": {
        "dayTempC": [
          20,
          25
        ],
        "nightTempC": [
          16,
          20
        ],
        "humidityPct": [
          55,
          75
        ],
        "co2Ppm": [
          400,
          900
        ],
        "solarWm2": [
          150,
          550
        ],
        "lightUmolM2S": [
          140,
          380
        ],
        "substrateTempC": [
          18,
          24
        ],
        "substrateMoisturePct": [
          40,
          65
        ],
        "substrateEcMsCm": [
          0.9,
          1.6
        ],
        "substratePh": [
          5.5,
          6.2
        ]
      }
    },
    {
      "criterionId": "940019",
      "setId": "940019",
      "cropId": "940002",
      "varietyId": "940007",
      "stageId": "REP",
      "stageOrder": 3,
      "standardDays": 42,
      "thresholds": {
        "dayTempC": [
          21,
          26
        ],
        "nightTempC": [
          17,
          21
        ],
        "humidityPct": [
          55,
          75
        ],
        "co2Ppm": [
          400,
          900
        ],
        "solarWm2": [
          150,
          550
        ],
        "lightUmolM2S": [
          140,
          380
        ],
        "substrateTempC": [
          18,
          24
        ],
        "substrateMoisturePct": [
          40,
          65
        ],
        "substrateEcMsCm": [
          0.9,
          1.6
        ],
        "substratePh": [
          5.5,
          6.2
        ]
      }
    },
    {
      "criterionId": "940020",
      "setId": "940020",
      "cropId": "940002",
      "varietyId": "940008",
      "stageId": "VEG",
      "stageOrder": 1,
      "standardDays": 35,
      "thresholds": {
        "dayTempC": [
          24,
          30
        ],
        "nightTempC": [
          20,
          24
        ],
        "humidityPct": [
          60,
          80
        ],
        "co2Ppm": [
          400,
          900
        ],
        "solarWm2": [
          150,
          500
        ],
        "lightUmolM2S": [
          120,
          350
        ],
        "substrateTempC": [
          20,
          26
        ],
        "substrateMoisturePct": [
          45,
          70
        ],
        "substrateEcMsCm": [
          0.8,
          1.5
        ],
        "substratePh": [
          5.5,
          6.2
        ]
      }
    },
    {
      "criterionId": "940021",
      "setId": "940021",
      "cropId": "940002",
      "varietyId": "940008",
      "stageId": "IND",
      "stageOrder": 2,
      "standardDays": 28,
      "thresholds": {
        "dayTempC": [
          20,
          25
        ],
        "nightTempC": [
          16,
          20
        ],
        "humidityPct": [
          55,
          75
        ],
        "co2Ppm": [
          400,
          900
        ],
        "solarWm2": [
          150,
          550
        ],
        "lightUmolM2S": [
          140,
          380
        ],
        "substrateTempC": [
          18,
          24
        ],
        "substrateMoisturePct": [
          40,
          65
        ],
        "substrateEcMsCm": [
          0.9,
          1.6
        ],
        "substratePh": [
          5.5,
          6.2
        ]
      }
    },
    {
      "criterionId": "940022",
      "setId": "940022",
      "cropId": "940002",
      "varietyId": "940008",
      "stageId": "REP",
      "stageOrder": 3,
      "standardDays": 42,
      "thresholds": {
        "dayTempC": [
          21,
          26
        ],
        "nightTempC": [
          17,
          21
        ],
        "humidityPct": [
          55,
          75
        ],
        "co2Ppm": [
          400,
          900
        ],
        "solarWm2": [
          150,
          550
        ],
        "lightUmolM2S": [
          140,
          380
        ],
        "substrateTempC": [
          18,
          24
        ],
        "substrateMoisturePct": [
          40,
          65
        ],
        "substrateEcMsCm": [
          0.9,
          1.6
        ],
        "substratePh": [
          5.5,
          6.2
        ]
      }
    },
    {
      "criterionId": "940023",
      "setId": "940023",
      "cropId": "940002",
      "varietyId": "940009",
      "stageId": "VEG",
      "stageOrder": 1,
      "standardDays": 35,
      "thresholds": {
        "dayTempC": [
          24,
          30
        ],
        "nightTempC": [
          20,
          24
        ],
        "humidityPct": [
          60,
          80
        ],
        "co2Ppm": [
          400,
          900
        ],
        "solarWm2": [
          150,
          500
        ],
        "lightUmolM2S": [
          120,
          350
        ],
        "substrateTempC": [
          20,
          26
        ],
        "substrateMoisturePct": [
          45,
          70
        ],
        "substrateEcMsCm": [
          0.8,
          1.5
        ],
        "substratePh": [
          5.5,
          6.2
        ]
      }
    },
    {
      "criterionId": "940024",
      "setId": "940024",
      "cropId": "940002",
      "varietyId": "940009",
      "stageId": "IND",
      "stageOrder": 2,
      "standardDays": 28,
      "thresholds": {
        "dayTempC": [
          20,
          25
        ],
        "nightTempC": [
          16,
          20
        ],
        "humidityPct": [
          55,
          75
        ],
        "co2Ppm": [
          400,
          900
        ],
        "solarWm2": [
          150,
          550
        ],
        "lightUmolM2S": [
          140,
          380
        ],
        "substrateTempC": [
          18,
          24
        ],
        "substrateMoisturePct": [
          40,
          65
        ],
        "substrateEcMsCm": [
          0.9,
          1.6
        ],
        "substratePh": [
          5.5,
          6.2
        ]
      }
    },
    {
      "criterionId": "940025",
      "setId": "940025",
      "cropId": "940002",
      "varietyId": "940009",
      "stageId": "REP",
      "stageOrder": 3,
      "standardDays": 42,
      "thresholds": {
        "dayTempC": [
          21,
          26
        ],
        "nightTempC": [
          17,
          21
        ],
        "humidityPct": [
          55,
          75
        ],
        "co2Ppm": [
          400,
          900
        ],
        "solarWm2": [
          150,
          550
        ],
        "lightUmolM2S": [
          140,
          380
        ],
        "substrateTempC": [
          18,
          24
        ],
        "substrateMoisturePct": [
          40,
          65
        ],
        "substrateEcMsCm": [
          0.9,
          1.6
        ],
        "substratePh": [
          5.5,
          6.2
        ]
      }
    },
    {
      "criterionId": "940026",
      "setId": "940026",
      "cropId": "940010",
      "varietyId": "940010",
      "stageId": "VEG",
      "stageOrder": 1,
      "standardDays": 24,
      "thresholds": {
        "dayTempC": [
          18,
          26
        ],
        "nightTempC": [
          14,
          19
        ],
        "humidityPct": [
          55,
          75
        ],
        "co2Ppm": [
          400,
          1000
        ],
        "solarWm2": [
          200,
          750
        ],
        "lightUmolM2S": [
          150,
          500
        ],
        "substrateTempC": [
          16,
          23
        ],
        "substrateMoisturePct": [
          45,
          70
        ],
        "substrateEcMsCm": [
          1.2,
          2
        ],
        "substratePh": [
          5.8,
          6.5
        ]
      }
    },
    {
      "criterionId": "940027",
      "setId": "940027",
      "cropId": "940010",
      "varietyId": "940010",
      "stageId": "IND",
      "stageOrder": 2,
      "standardDays": 21,
      "thresholds": {
        "dayTempC": [
          18,
          25
        ],
        "nightTempC": [
          15,
          19
        ],
        "humidityPct": [
          50,
          70
        ],
        "co2Ppm": [
          400,
          1000
        ],
        "solarWm2": [
          200,
          750
        ],
        "lightUmolM2S": [
          150,
          500
        ],
        "substrateTempC": [
          16,
          23
        ],
        "substrateMoisturePct": [
          40,
          65
        ],
        "substrateEcMsCm": [
          1.2,
          2
        ],
        "substratePh": [
          5.8,
          6.5
        ]
      }
    },
    {
      "criterionId": "940028",
      "setId": "940028",
      "cropId": "940010",
      "varietyId": "940010",
      "stageId": "REP",
      "stageOrder": 3,
      "standardDays": 35,
      "thresholds": {
        "dayTempC": [
          17,
          24
        ],
        "nightTempC": [
          13,
          18
        ],
        "humidityPct": [
          50,
          70
        ],
        "co2Ppm": [
          400,
          900
        ],
        "solarWm2": [
          180,
          700
        ],
        "lightUmolM2S": [
          140,
          480
        ],
        "substrateTempC": [
          15,
          22
        ],
        "substrateMoisturePct": [
          40,
          65
        ],
        "substrateEcMsCm": [
          1.1,
          1.9
        ],
        "substratePh": [
          5.8,
          6.5
        ]
      }
    },
    {
      "criterionId": "940029",
      "setId": "940029",
      "cropId": "940010",
      "varietyId": "940011",
      "stageId": "VEG",
      "stageOrder": 1,
      "standardDays": 24,
      "thresholds": {
        "dayTempC": [
          18,
          26
        ],
        "nightTempC": [
          14,
          19
        ],
        "humidityPct": [
          55,
          75
        ],
        "co2Ppm": [
          400,
          1000
        ],
        "solarWm2": [
          200,
          750
        ],
        "lightUmolM2S": [
          150,
          500
        ],
        "substrateTempC": [
          16,
          23
        ],
        "substrateMoisturePct": [
          45,
          70
        ],
        "substrateEcMsCm": [
          1.2,
          2
        ],
        "substratePh": [
          5.8,
          6.5
        ]
      }
    },
    {
      "criterionId": "940030",
      "setId": "940030",
      "cropId": "940010",
      "varietyId": "940011",
      "stageId": "IND",
      "stageOrder": 2,
      "standardDays": 21,
      "thresholds": {
        "dayTempC": [
          18,
          25
        ],
        "nightTempC": [
          15,
          19
        ],
        "humidityPct": [
          50,
          70
        ],
        "co2Ppm": [
          400,
          1000
        ],
        "solarWm2": [
          200,
          750
        ],
        "lightUmolM2S": [
          150,
          500
        ],
        "substrateTempC": [
          16,
          23
        ],
        "substrateMoisturePct": [
          40,
          65
        ],
        "substrateEcMsCm": [
          1.2,
          2
        ],
        "substratePh": [
          5.8,
          6.5
        ]
      }
    },
    {
      "criterionId": "940031",
      "setId": "940031",
      "cropId": "940010",
      "varietyId": "940011",
      "stageId": "REP",
      "stageOrder": 3,
      "standardDays": 35,
      "thresholds": {
        "dayTempC": [
          17,
          24
        ],
        "nightTempC": [
          13,
          18
        ],
        "humidityPct": [
          50,
          70
        ],
        "co2Ppm": [
          400,
          900
        ],
        "solarWm2": [
          180,
          700
        ],
        "lightUmolM2S": [
          140,
          480
        ],
        "substrateTempC": [
          15,
          22
        ],
        "substrateMoisturePct": [
          40,
          65
        ],
        "substrateEcMsCm": [
          1.1,
          1.9
        ],
        "substratePh": [
          5.8,
          6.5
        ]
      }
    },
    {
      "criterionId": "940032",
      "setId": "940032",
      "cropId": "940010",
      "varietyId": "940012",
      "stageId": "VEG",
      "stageOrder": 1,
      "standardDays": 24,
      "thresholds": {
        "dayTempC": [
          18,
          26
        ],
        "nightTempC": [
          14,
          19
        ],
        "humidityPct": [
          55,
          75
        ],
        "co2Ppm": [
          400,
          1000
        ],
        "solarWm2": [
          200,
          750
        ],
        "lightUmolM2S": [
          150,
          500
        ],
        "substrateTempC": [
          16,
          23
        ],
        "substrateMoisturePct": [
          45,
          70
        ],
        "substrateEcMsCm": [
          1.2,
          2
        ],
        "substratePh": [
          5.8,
          6.5
        ]
      }
    },
    {
      "criterionId": "940033",
      "setId": "940033",
      "cropId": "940010",
      "varietyId": "940012",
      "stageId": "IND",
      "stageOrder": 2,
      "standardDays": 21,
      "thresholds": {
        "dayTempC": [
          18,
          25
        ],
        "nightTempC": [
          15,
          19
        ],
        "humidityPct": [
          50,
          70
        ],
        "co2Ppm": [
          400,
          1000
        ],
        "solarWm2": [
          200,
          750
        ],
        "lightUmolM2S": [
          150,
          500
        ],
        "substrateTempC": [
          16,
          23
        ],
        "substrateMoisturePct": [
          40,
          65
        ],
        "substrateEcMsCm": [
          1.2,
          2
        ],
        "substratePh": [
          5.8,
          6.5
        ]
      }
    },
    {
      "criterionId": "940034",
      "setId": "940034",
      "cropId": "940010",
      "varietyId": "940012",
      "stageId": "REP",
      "stageOrder": 3,
      "standardDays": 35,
      "thresholds": {
        "dayTempC": [
          17,
          24
        ],
        "nightTempC": [
          13,
          18
        ],
        "humidityPct": [
          50,
          70
        ],
        "co2Ppm": [
          400,
          900
        ],
        "solarWm2": [
          180,
          700
        ],
        "lightUmolM2S": [
          140,
          480
        ],
        "substrateTempC": [
          15,
          22
        ],
        "substrateMoisturePct": [
          40,
          65
        ],
        "substrateEcMsCm": [
          1.1,
          1.9
        ],
        "substratePh": [
          5.8,
          6.5
        ]
      }
    },
    {
      "criterionId": "940035",
      "setId": "940035",
      "cropId": "940013",
      "varietyId": "940013",
      "stageId": "VEG",
      "stageOrder": 1,
      "standardDays": 25,
      "thresholds": {
        "dayTempC": [
          18,
          25
        ],
        "nightTempC": [
          13,
          17
        ],
        "humidityPct": [
          55,
          75
        ],
        "co2Ppm": [
          400,
          900
        ],
        "solarWm2": [
          200,
          750
        ],
        "lightUmolM2S": [
          150,
          500
        ],
        "substrateTempC": [
          16,
          22
        ],
        "substrateMoisturePct": [
          45,
          70
        ],
        "substrateEcMsCm": [
          1.2,
          2
        ],
        "substratePh": [
          5.5,
          6.2
        ]
      }
    },
    {
      "criterionId": "940036",
      "setId": "940036",
      "cropId": "940013",
      "varietyId": "940013",
      "stageId": "IND",
      "stageOrder": 2,
      "standardDays": 20,
      "thresholds": {
        "dayTempC": [
          18,
          25
        ],
        "nightTempC": [
          13,
          17
        ],
        "humidityPct": [
          50,
          70
        ],
        "co2Ppm": [
          400,
          900
        ],
        "solarWm2": [
          200,
          750
        ],
        "lightUmolM2S": [
          160,
          520
        ],
        "substrateTempC": [
          16,
          22
        ],
        "substrateMoisturePct": [
          45,
          70
        ],
        "substrateEcMsCm": [
          1.2,
          2
        ],
        "substratePh": [
          5.5,
          6.2
        ]
      }
    },
    {
      "criterionId": "940037",
      "setId": "940037",
      "cropId": "940013",
      "varietyId": "940013",
      "stageId": "REP",
      "stageOrder": 3,
      "standardDays": 30,
      "thresholds": {
        "dayTempC": [
          17,
          24
        ],
        "nightTempC": [
          12,
          16
        ],
        "humidityPct": [
          50,
          70
        ],
        "co2Ppm": [
          400,
          900
        ],
        "solarWm2": [
          200,
          750
        ],
        "lightUmolM2S": [
          160,
          520
        ],
        "substrateTempC": [
          16,
          22
        ],
        "substrateMoisturePct": [
          45,
          70
        ],
        "substrateEcMsCm": [
          1.2,
          2
        ],
        "substratePh": [
          5.5,
          6.2
        ]
      }
    },
    {
      "criterionId": "940038",
      "setId": "940038",
      "cropId": "940013",
      "varietyId": "940014",
      "stageId": "VEG",
      "stageOrder": 1,
      "standardDays": 25,
      "thresholds": {
        "dayTempC": [
          18,
          25
        ],
        "nightTempC": [
          13,
          17
        ],
        "humidityPct": [
          55,
          75
        ],
        "co2Ppm": [
          400,
          900
        ],
        "solarWm2": [
          200,
          750
        ],
        "lightUmolM2S": [
          150,
          500
        ],
        "substrateTempC": [
          16,
          22
        ],
        "substrateMoisturePct": [
          45,
          70
        ],
        "substrateEcMsCm": [
          1.2,
          2
        ],
        "substratePh": [
          5.5,
          6.2
        ]
      }
    },
    {
      "criterionId": "940039",
      "setId": "940039",
      "cropId": "940013",
      "varietyId": "940014",
      "stageId": "IND",
      "stageOrder": 2,
      "standardDays": 20,
      "thresholds": {
        "dayTempC": [
          18,
          25
        ],
        "nightTempC": [
          13,
          17
        ],
        "humidityPct": [
          50,
          70
        ],
        "co2Ppm": [
          400,
          900
        ],
        "solarWm2": [
          200,
          750
        ],
        "lightUmolM2S": [
          160,
          520
        ],
        "substrateTempC": [
          16,
          22
        ],
        "substrateMoisturePct": [
          45,
          70
        ],
        "substrateEcMsCm": [
          1.2,
          2
        ],
        "substratePh": [
          5.5,
          6.2
        ]
      }
    },
    {
      "criterionId": "940040",
      "setId": "940040",
      "cropId": "940013",
      "varietyId": "940014",
      "stageId": "REP",
      "stageOrder": 3,
      "standardDays": 30,
      "thresholds": {
        "dayTempC": [
          17,
          24
        ],
        "nightTempC": [
          12,
          16
        ],
        "humidityPct": [
          50,
          70
        ],
        "co2Ppm": [
          400,
          900
        ],
        "solarWm2": [
          200,
          750
        ],
        "lightUmolM2S": [
          160,
          520
        ],
        "substrateTempC": [
          16,
          22
        ],
        "substrateMoisturePct": [
          45,
          70
        ],
        "substrateEcMsCm": [
          1.2,
          2
        ],
        "substratePh": [
          5.5,
          6.2
        ]
      }
    },
    {
      "criterionId": "940041",
      "setId": "940041",
      "cropId": "940015",
      "varietyId": "940015",
      "stageId": "VEG",
      "stageOrder": 1,
      "standardDays": 28,
      "thresholds": {
        "dayTempC": [
          16,
          23
        ],
        "nightTempC": [
          10,
          14
        ],
        "humidityPct": [
          55,
          75
        ],
        "co2Ppm": [
          400,
          900
        ],
        "solarWm2": [
          200,
          700
        ],
        "lightUmolM2S": [
          150,
          480
        ],
        "substrateTempC": [
          14,
          20
        ],
        "substrateMoisturePct": [
          45,
          70
        ],
        "substrateEcMsCm": [
          1.2,
          2
        ],
        "substratePh": [
          6,
          6.8
        ]
      }
    },
    {
      "criterionId": "940042",
      "setId": "940042",
      "cropId": "940015",
      "varietyId": "940015",
      "stageId": "IND",
      "stageOrder": 2,
      "standardDays": 21,
      "thresholds": {
        "dayTempC": [
          16,
          22
        ],
        "nightTempC": [
          10,
          14
        ],
        "humidityPct": [
          50,
          70
        ],
        "co2Ppm": [
          400,
          900
        ],
        "solarWm2": [
          200,
          700
        ],
        "lightUmolM2S": [
          160,
          500
        ],
        "substrateTempC": [
          14,
          20
        ],
        "substrateMoisturePct": [
          40,
          65
        ],
        "substrateEcMsCm": [
          1.2,
          2
        ],
        "substratePh": [
          6,
          6.8
        ]
      }
    },
    {
      "criterionId": "940043",
      "setId": "940043",
      "cropId": "940015",
      "varietyId": "940015",
      "stageId": "REP",
      "stageOrder": 3,
      "standardDays": 35,
      "thresholds": {
        "dayTempC": [
          15,
          22
        ],
        "nightTempC": [
          9,
          13
        ],
        "humidityPct": [
          50,
          70
        ],
        "co2Ppm": [
          400,
          900
        ],
        "solarWm2": [
          200,
          700
        ],
        "lightUmolM2S": [
          160,
          500
        ],
        "substrateTempC": [
          14,
          20
        ],
        "substrateMoisturePct": [
          40,
          65
        ],
        "substrateEcMsCm": [
          1.2,
          2
        ],
        "substratePh": [
          6,
          6.8
        ]
      }
    },
    {
      "criterionId": "940044",
      "setId": "940044",
      "cropId": "940015",
      "varietyId": "940016",
      "stageId": "VEG",
      "stageOrder": 1,
      "standardDays": 28,
      "thresholds": {
        "dayTempC": [
          16,
          23
        ],
        "nightTempC": [
          10,
          14
        ],
        "humidityPct": [
          55,
          75
        ],
        "co2Ppm": [
          400,
          900
        ],
        "solarWm2": [
          200,
          700
        ],
        "lightUmolM2S": [
          150,
          480
        ],
        "substrateTempC": [
          14,
          20
        ],
        "substrateMoisturePct": [
          45,
          70
        ],
        "substrateEcMsCm": [
          1.2,
          2
        ],
        "substratePh": [
          6,
          6.8
        ]
      }
    },
    {
      "criterionId": "940045",
      "setId": "940045",
      "cropId": "940015",
      "varietyId": "940016",
      "stageId": "IND",
      "stageOrder": 2,
      "standardDays": 21,
      "thresholds": {
        "dayTempC": [
          16,
          22
        ],
        "nightTempC": [
          10,
          14
        ],
        "humidityPct": [
          50,
          70
        ],
        "co2Ppm": [
          400,
          900
        ],
        "solarWm2": [
          200,
          700
        ],
        "lightUmolM2S": [
          160,
          500
        ],
        "substrateTempC": [
          14,
          20
        ],
        "substrateMoisturePct": [
          40,
          65
        ],
        "substrateEcMsCm": [
          1.2,
          2
        ],
        "substratePh": [
          6,
          6.8
        ]
      }
    },
    {
      "criterionId": "940046",
      "setId": "940046",
      "cropId": "940015",
      "varietyId": "940016",
      "stageId": "REP",
      "stageOrder": 3,
      "standardDays": 35,
      "thresholds": {
        "dayTempC": [
          15,
          22
        ],
        "nightTempC": [
          9,
          13
        ],
        "humidityPct": [
          50,
          70
        ],
        "co2Ppm": [
          400,
          900
        ],
        "solarWm2": [
          200,
          700
        ],
        "lightUmolM2S": [
          160,
          500
        ],
        "substrateTempC": [
          14,
          20
        ],
        "substrateMoisturePct": [
          40,
          65
        ],
        "substrateEcMsCm": [
          1.2,
          2
        ],
        "substratePh": [
          6,
          6.8
        ]
      }
    },
    {
      "criterionId": "940004",
      "setId": "940004",
      "cropId": "940002",
      "varietyId": "940004",
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
      "varietyId": "940004",
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
      "varietyId": "940004",
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
      "measuredAt": "2026-10-03T07:00:00",
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
      "measuredAt": "2026-10-03T05:00:00",
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
      "measuredAt": "2026-11-08T10:00:00",
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
      "measuredAt": "2026-11-08T11:00:00",
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
      "measuredAt": "2026-11-12T13:00:00",
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
      "measuredAt": "2026-11-12T14:00:00",
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
      "measuredAt": "2026-11-13T15:00:00",
      "insideTempC": 23,
      "humidityPct": 85,
      "co2Ppm": 620,
      "solarWm2": 380,
      "lightUmolM2S": 250,
      "substrateTempC": 21,
      "substrateMoisturePct": 56,
      "substrateEcMsCm": 1.7,
      "substratePh": 6.1
    },
    {
      "environmentChangeId": "940201",
      "cycleId": "940001",
      "measuredAt": "2026-10-03T06:00:00",
      "insideTempC": 18.4,
      "humidityPct": 72,
      "co2Ppm": 740,
      "solarWm2": 25,
      "lightUmolM2S": 18,
      "substrateTempC": 19.5,
      "substrateMoisturePct": 56,
      "substrateEcMsCm": 1.75,
      "substratePh": 6
    },
    {
      "environmentChangeId": "940202",
      "cycleId": "940001",
      "measuredAt": "2026-10-03T09:00:00",
      "insideTempC": 20.8,
      "humidityPct": 66,
      "co2Ppm": 630,
      "solarWm2": 310,
      "lightUmolM2S": 210,
      "substrateTempC": 20.1,
      "substrateMoisturePct": 55,
      "substrateEcMsCm": 1.8,
      "substratePh": 6
    },
    {
      "environmentChangeId": "940203",
      "cycleId": "940001",
      "measuredAt": "2026-10-03T10:00:00",
      "insideTempC": 22.6,
      "humidityPct": 62,
      "co2Ppm": 580,
      "solarWm2": 480,
      "lightUmolM2S": 320,
      "substrateTempC": 20.5,
      "substrateMoisturePct": 54,
      "substrateEcMsCm": 1.8,
      "substratePh": 6
    },
    {
      "environmentChangeId": "940204",
      "cycleId": "940001",
      "measuredAt": "2026-10-03T11:00:00",
      "insideTempC": 24.3,
      "humidityPct": 59,
      "co2Ppm": 540,
      "solarWm2": 610,
      "lightUmolM2S": 410,
      "substrateTempC": 21,
      "substrateMoisturePct": 54,
      "substrateEcMsCm": 1.82,
      "substratePh": 6
    },
    {
      "environmentChangeId": "940205",
      "cycleId": "940001",
      "measuredAt": "2026-10-03T12:00:00",
      "insideTempC": 25.9,
      "humidityPct": 56,
      "co2Ppm": 510,
      "solarWm2": 710,
      "lightUmolM2S": 480,
      "substrateTempC": 21.4,
      "substrateMoisturePct": 53,
      "substrateEcMsCm": 1.82,
      "substratePh": 6.1
    },
    {
      "environmentChangeId": "940206",
      "cycleId": "940001",
      "measuredAt": "2026-10-03T13:00:00",
      "insideTempC": 26.5,
      "humidityPct": 55,
      "co2Ppm": 495,
      "solarWm2": 730,
      "lightUmolM2S": 495,
      "substrateTempC": 21.8,
      "substrateMoisturePct": 53,
      "substrateEcMsCm": 1.85,
      "substratePh": 6.1
    },
    {
      "environmentChangeId": "940207",
      "cycleId": "940001",
      "measuredAt": "2026-10-03T14:00:00",
      "insideTempC": 25.7,
      "humidityPct": 57,
      "co2Ppm": 520,
      "solarWm2": 640,
      "lightUmolM2S": 430,
      "substrateTempC": 21.7,
      "substrateMoisturePct": 52,
      "substrateEcMsCm": 1.85,
      "substratePh": 6.1
    },
    {
      "environmentChangeId": "940208",
      "cycleId": "940001",
      "measuredAt": "2026-10-03T15:00:00",
      "insideTempC": 24.1,
      "humidityPct": 60,
      "co2Ppm": 555,
      "solarWm2": 470,
      "lightUmolM2S": 310,
      "substrateTempC": 21.3,
      "substrateMoisturePct": 58,
      "substrateEcMsCm": 1.78,
      "substratePh": 6
    },
    {
      "environmentChangeId": "940209",
      "cycleId": "940001",
      "measuredAt": "2026-10-03T16:00:00",
      "insideTempC": 22.4,
      "humidityPct": 63,
      "co2Ppm": 600,
      "solarWm2": 260,
      "lightUmolM2S": 175,
      "substrateTempC": 20.9,
      "substrateMoisturePct": 57,
      "substrateEcMsCm": 1.78,
      "substratePh": 6
    },
    {
      "environmentChangeId": "940210",
      "cycleId": "940001",
      "measuredAt": "2026-10-03T18:00:00",
      "insideTempC": 19.8,
      "humidityPct": 68,
      "co2Ppm": 680,
      "solarWm2": 15,
      "lightUmolM2S": 10,
      "substrateTempC": 20.2,
      "substrateMoisturePct": 56,
      "substrateEcMsCm": 1.78,
      "substratePh": 6
    },
    {
      "environmentChangeId": "940211",
      "cycleId": "940002",
      "measuredAt": "2026-09-19T07:00:00",
      "insideTempC": 20.2,
      "humidityPct": 74,
      "co2Ppm": 720,
      "solarWm2": 85,
      "lightUmolM2S": 60,
      "substrateTempC": 20.4,
      "substrateMoisturePct": 58,
      "substrateEcMsCm": 1.65,
      "substratePh": 5.9
    },
    {
      "environmentChangeId": "940212",
      "cycleId": "940002",
      "measuredAt": "2026-09-19T09:00:00",
      "insideTempC": 22.5,
      "humidityPct": 68,
      "co2Ppm": 640,
      "solarWm2": 340,
      "lightUmolM2S": 230,
      "substrateTempC": 20.8,
      "substrateMoisturePct": 57,
      "substrateEcMsCm": 1.68,
      "substratePh": 5.9
    },
    {
      "environmentChangeId": "940213",
      "cycleId": "940002",
      "measuredAt": "2026-09-19T11:00:00",
      "insideTempC": 25.1,
      "humidityPct": 62,
      "co2Ppm": 560,
      "solarWm2": 590,
      "lightUmolM2S": 400,
      "substrateTempC": 21.5,
      "substrateMoisturePct": 55,
      "substrateEcMsCm": 1.7,
      "substratePh": 6
    },
    {
      "environmentChangeId": "940214",
      "cycleId": "940002",
      "measuredAt": "2026-09-19T13:00:00",
      "insideTempC": 27.4,
      "humidityPct": 58,
      "co2Ppm": 510,
      "solarWm2": 720,
      "lightUmolM2S": 490,
      "substrateTempC": 22.1,
      "substrateMoisturePct": 54,
      "substrateEcMsCm": 1.72,
      "substratePh": 6
    },
    {
      "environmentChangeId": "940215",
      "cycleId": "940002",
      "measuredAt": "2026-09-19T15:00:00",
      "insideTempC": 26.2,
      "humidityPct": 60,
      "co2Ppm": 540,
      "solarWm2": 510,
      "lightUmolM2S": 345,
      "substrateTempC": 21.9,
      "substrateMoisturePct": 53,
      "substrateEcMsCm": 1.72,
      "substratePh": 6
    },
    {
      "environmentChangeId": "940216",
      "cycleId": "940002",
      "measuredAt": "2026-09-19T17:00:00",
      "insideTempC": 23.8,
      "humidityPct": 65,
      "co2Ppm": 610,
      "solarWm2": 190,
      "lightUmolM2S": 130,
      "substrateTempC": 21.3,
      "substrateMoisturePct": 56,
      "substrateEcMsCm": 1.68,
      "substratePh": 6
    },
    {
      "environmentChangeId": "940217",
      "cycleId": "940002",
      "measuredAt": "2026-09-19T19:00:00",
      "insideTempC": 21.1,
      "humidityPct": 71,
      "co2Ppm": 690,
      "solarWm2": 0,
      "lightUmolM2S": 0,
      "substrateTempC": 20.7,
      "substrateMoisturePct": 56,
      "substrateEcMsCm": 1.68,
      "substratePh": 6
    },
    {
      "environmentChangeId": "940218",
      "cycleId": "940002",
      "measuredAt": "2026-09-19T21:00:00",
      "insideTempC": 19.6,
      "humidityPct": 73,
      "co2Ppm": 730,
      "solarWm2": 0,
      "lightUmolM2S": 0,
      "substrateTempC": 20.3,
      "substrateMoisturePct": 56,
      "substrateEcMsCm": 1.68,
      "substratePh": 6
    },
    {
      "environmentChangeId": "940219",
      "cycleId": "940005",
      "measuredAt": "2026-11-13T06:00:00",
      "insideTempC": 18.8,
      "humidityPct": 76,
      "co2Ppm": 750,
      "solarWm2": 0,
      "lightUmolM2S": 0,
      "substrateTempC": 19.8,
      "substrateMoisturePct": 57,
      "substrateEcMsCm": 1.68,
      "substratePh": 6.1
    },
    {
      "environmentChangeId": "940220",
      "cycleId": "940005",
      "measuredAt": "2026-11-13T07:00:00",
      "insideTempC": 19.6,
      "humidityPct": 74,
      "co2Ppm": 710,
      "solarWm2": 75,
      "lightUmolM2S": 50,
      "substrateTempC": 20,
      "substrateMoisturePct": 57,
      "substrateEcMsCm": 1.68,
      "substratePh": 6.1
    },
    {
      "environmentChangeId": "940221",
      "cycleId": "940005",
      "measuredAt": "2026-11-13T08:00:00",
      "insideTempC": 21.2,
      "humidityPct": 71,
      "co2Ppm": 660,
      "solarWm2": 210,
      "lightUmolM2S": 145,
      "substrateTempC": 20.4,
      "substrateMoisturePct": 56,
      "substrateEcMsCm": 1.7,
      "substratePh": 6.1
    },
    {
      "environmentChangeId": "940222",
      "cycleId": "940005",
      "measuredAt": "2026-11-13T10:00:00",
      "insideTempC": 24,
      "humidityPct": 65,
      "co2Ppm": 590,
      "solarWm2": 480,
      "lightUmolM2S": 325,
      "substrateTempC": 21.2,
      "substrateMoisturePct": 55,
      "substrateEcMsCm": 1.72,
      "substratePh": 6.1
    },
    {
      "environmentChangeId": "940223",
      "cycleId": "940005",
      "measuredAt": "2026-11-13T11:00:00",
      "insideTempC": 25.4,
      "humidityPct": 62,
      "co2Ppm": 550,
      "solarWm2": 590,
      "lightUmolM2S": 400,
      "substrateTempC": 21.6,
      "substrateMoisturePct": 54,
      "substrateEcMsCm": 1.74,
      "substratePh": 6.1
    },
    {
      "environmentChangeId": "940224",
      "cycleId": "940005",
      "measuredAt": "2026-11-13T12:00:00",
      "insideTempC": 26.3,
      "humidityPct": 60,
      "co2Ppm": 520,
      "solarWm2": 660,
      "lightUmolM2S": 445,
      "substrateTempC": 22,
      "substrateMoisturePct": 54,
      "substrateEcMsCm": 1.74,
      "substratePh": 6.1
    },
    {
      "environmentChangeId": "940225",
      "cycleId": "940005",
      "measuredAt": "2026-11-13T13:00:00",
      "insideTempC": 26.8,
      "humidityPct": 59,
      "co2Ppm": 505,
      "solarWm2": 675,
      "lightUmolM2S": 455,
      "substrateTempC": 22.1,
      "substrateMoisturePct": 53,
      "substrateEcMsCm": 1.75,
      "substratePh": 6.1
    },
    {
      "environmentChangeId": "940226",
      "cycleId": "940005",
      "measuredAt": "2026-11-13T14:00:00",
      "insideTempC": 25.9,
      "humidityPct": 61,
      "co2Ppm": 530,
      "solarWm2": 540,
      "lightUmolM2S": 365,
      "substrateTempC": 21.9,
      "substrateMoisturePct": 58,
      "substrateEcMsCm": 1.7,
      "substratePh": 6.1
    },
    {
      "environmentChangeId": "940227",
      "cycleId": "940005",
      "measuredAt": "2026-11-13T16:00:00",
      "insideTempC": 23.5,
      "humidityPct": 66,
      "co2Ppm": 600,
      "solarWm2": 220,
      "lightUmolM2S": 150,
      "substrateTempC": 21.3,
      "substrateMoisturePct": 57,
      "substrateEcMsCm": 1.7,
      "substratePh": 6.1
    },
    {
      "environmentChangeId": "940228",
      "cycleId": "940005",
      "measuredAt": "2026-11-13T18:00:00",
      "insideTempC": 20.9,
      "humidityPct": 71,
      "co2Ppm": 680,
      "solarWm2": 0,
      "lightUmolM2S": 0,
      "substrateTempC": 20.6,
      "substrateMoisturePct": 57,
      "substrateEcMsCm": 1.7,
      "substratePh": 6.1
    },
    {
      "environmentChangeId": "940229",
      "cycleId": "940009",
      "measuredAt": "2026-11-13T06:00:00",
      "insideTempC": 18.6,
      "humidityPct": 73,
      "co2Ppm": 745,
      "solarWm2": 0,
      "lightUmolM2S": 0,
      "substrateTempC": 19.6,
      "substrateMoisturePct": 56,
      "substrateEcMsCm": 1.78,
      "substratePh": 6
    },
    {
      "environmentChangeId": "940230",
      "cycleId": "940009",
      "measuredAt": "2026-11-13T10:00:00",
      "insideTempC": 23.8,
      "humidityPct": 64,
      "co2Ppm": 615,
      "solarWm2": 430,
      "lightUmolM2S": 295,
      "substrateTempC": 20.6,
      "substrateMoisturePct": 55,
      "substrateEcMsCm": 1.8,
      "substratePh": 6
    },
    {
      "environmentChangeId": "940231",
      "cycleId": "940009",
      "measuredAt": "2026-11-13T12:00:00",
      "insideTempC": 26.1,
      "humidityPct": 60,
      "co2Ppm": 560,
      "solarWm2": 620,
      "lightUmolM2S": 420,
      "substrateTempC": 21.3,
      "substrateMoisturePct": 54,
      "substrateEcMsCm": 1.82,
      "substratePh": 6
    },
    {
      "environmentChangeId": "940232",
      "cycleId": "940009",
      "measuredAt": "2026-11-13T15:00:00",
      "insideTempC": 24.9,
      "humidityPct": 63,
      "co2Ppm": 595,
      "solarWm2": 410,
      "lightUmolM2S": 280,
      "substrateTempC": 21.1,
      "substrateMoisturePct": 56,
      "substrateEcMsCm": 1.8,
      "substratePh": 6
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
      "description": "장미 재배 및 온실 환경 관리 농장",
      "createdAt": "2026-06-15 10:00",
      "certifiedAt": "2026-06-18 11:30"
    },
    {
      "id": "940002",
      "displayName": "이서연",
      "role": "화훼농민",
      "certification": "인증",
      "businessNumber": "123-45-67890",
      "username": "seedmum02",
      "farmName": "해솔 호접란농장",
      "email": "haesol.orchid@example.com",
      "phone": "010-7315-8492",
      "address": "경기도 고양시 일산동구 호수로 595",
      "addressDetail": "가동 102호",
      "mainCrop": "호접란",
      "description": "호접란 전용 온실 재배 및 생육 환경 관리 농장",
      "createdAt": "2026-07-01 09:00",
      "certifiedAt": "2026-07-03 14:20"
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
      "description": null,
      "createdAt": "2026-10-01 09:00",
      "certifiedAt": null
    }
  ]
};
