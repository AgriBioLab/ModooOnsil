const prototypeData = {
  "meta": {
    "project": "모두의온실",
    "version": "2026-11-12-cycle-environment-change-erd-v2",
    "today": "2026-11-12",
    "user": "화훼 재배 농민",
    "mode": "prototype",
    "commonCrop": "호접란",
    "commonVariety": "만천홍"
  },
  "header": {
    "breadcrumb": [
      "재배관리",
      "재배일지"
    ],
    "title": "재배일지",
    "currentUser": {
      "id": "FARMER-DEMO-01",
      "displayName": "김철수",
      "role": "화훼농민",
      "certification": "농업경영체 인증회원"
    }
  },
  "crops": [
    {
      "cropId": "CR-ORCHID",
      "name": "호접란",
      "varieties": [
        {
          "varietyId": "V-MH",
          "name": "만천홍"
        }
      ]
    }
  ],
  "greenhouses": [
    {
      "greenhouseId": "GH-A",
      "name": "A동 온실",
      "type": "연동형",
      "mediumType": "바크"
    },
    {
      "greenhouseId": "GH-B",
      "name": "B동 온실",
      "type": "단동형",
      "mediumType": "바크"
    },
    {
      "greenhouseId": "GH-C",
      "name": "C동 온실",
      "type": "단동형",
      "mediumType": "바크"
    },
    {
      "greenhouseId": "GH-D",
      "name": "D동 온실",
      "type": "단동형",
      "mediumType": "바크"
    },
    {
      "greenhouseId": "GH-E",
      "name": "E동 온실",
      "type": "단동형",
      "mediumType": "바크"
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
      "cycleId": "CY-MH-A1",
      "name": "2026년 호접란 A동 1차",
      "cropId": "CR-ORCHID",
      "varietyId": "V-MH",
      "greenhouseId": "GH-A",
      "actualStartDate": "2026-09-01",
      "status": "진행",
      "stageHistory": [
        {
          "eventId": "EV-A-01",
          "stageId": "VEG",
          "effectiveDate": "2026-09-01",
          "sourceDiaryId": null,
          "reason": ""
        },
        {
          "eventId": "EV-A-02",
          "stageId": "IND",
          "effectiveDate": "2026-11-08",
          "sourceDiaryId": "D-A-1108",
          "reason": "새 잎과 생육 상태를 확인해 꽃눈유도 단계로 전환 / 야간 온도 관리 조건을 확인한 뒤 다음 단계 적용"
        }
      ],
      "plannedStartAt": "2026-08-27T09:00",
      "expectedEndAt": "2027-02-28T18:00",
      "registeredAt": "2026-08-12T11:00:00",
      "actualStartAt": "2026-09-01T08:30",
      "actualEndAt": null,
      "endReason": null,
      "environmentStandardSetId": "STD-MH-2026",
      "memberId": "FARMER-DEMO-01"
    },
    {
      "cycleId": "CY-MH-B1",
      "name": "2026년 호접란 B동 1차",
      "cropId": "CR-ORCHID",
      "varietyId": "V-MH",
      "greenhouseId": "GH-B",
      "actualStartDate": "2026-10-03",
      "status": "진행",
      "stageHistory": [
        {
          "eventId": "EV-B-01",
          "stageId": "VEG",
          "effectiveDate": "2026-10-03",
          "sourceDiaryId": null,
          "reason": ""
        }
      ],
      "plannedStartAt": "2026-09-28T09:00",
      "expectedEndAt": "2027-02-15T18:00",
      "registeredAt": "2026-08-12T11:00:00",
      "actualStartAt": "2026-10-03T09:00",
      "actualEndAt": null,
      "endReason": null,
      "environmentStandardSetId": "STD-MH-2026",
      "memberId": "FARMER-DEMO-01"
    },
    {
      "cycleId": "CY-MH-C2",
      "name": "2026년 호접란 C동 2차",
      "cropId": "CR-ORCHID",
      "varietyId": "V-MH",
      "greenhouseId": "GH-C",
      "actualStartDate": "2026-08-18",
      "status": "진행",
      "stageHistory": [
        {
          "eventId": "EV-C-01",
          "stageId": "VEG",
          "effectiveDate": "2026-08-18",
          "sourceDiaryId": null,
          "reason": ""
        },
        {
          "eventId": "EV-C-02",
          "stageId": "IND",
          "effectiveDate": "2026-09-28",
          "sourceDiaryId": "D-C-0928",
          "reason": "꽃눈 형성 시작 상태를 확인"
        },
        {
          "eventId": "EV-C-03",
          "stageId": "REP",
          "effectiveDate": "2026-10-30",
          "sourceDiaryId": "D-C-1030",
          "reason": "꽃대 발달과 화아 생육 관찰 결과 반영 / 재배 담당자 현장 관찰 결과 최종 확인"
        }
      ],
      "plannedStartAt": "2026-08-15T09:00",
      "expectedEndAt": "2027-01-31T18:00",
      "registeredAt": "2026-08-12T11:00:00",
      "actualStartAt": "2026-08-18T09:30",
      "actualEndAt": null,
      "endReason": null,
      "environmentStandardSetId": "STD-MH-2026",
      "memberId": "FARMER-DEMO-01"
    },
    {
      "cycleId": "CY-MH-D0",
      "name": "2026년 호접란 D동 1차",
      "cropId": "CR-ORCHID",
      "varietyId": "V-MH",
      "greenhouseId": "GH-D",
      "actualStartDate": "2026-05-01",
      "status": "종료",
      "stageHistory": [
        {
          "eventId": "EV-D-01",
          "stageId": "VEG",
          "effectiveDate": "2026-05-01",
          "sourceDiaryId": null,
          "reason": ""
        },
        {
          "eventId": "EV-D-02",
          "stageId": "IND",
          "effectiveDate": "2026-07-03",
          "sourceDiaryId": null,
          "reason": "꽃눈유도 개시 시연 데이터"
        },
        {
          "eventId": "EV-D-03",
          "stageId": "REP",
          "effectiveDate": "2026-08-20",
          "sourceDiaryId": null,
          "reason": "생식생장기 진입 시연 데이터"
        }
      ],
      "plannedStartAt": "2026-05-01T08:00",
      "expectedEndAt": "2026-11-01T18:00",
      "registeredAt": "2026-04-20T09:30:00",
      "actualStartAt": "2026-05-01T08:00",
      "actualEndAt": "2026-11-03T17:00",
      "endReason": "재배 일정 완료",
      "environmentStandardSetId": "STD-MH-2026",
      "memberId": "FARMER-DEMO-01"
    },
    {
      "cycleId": "CY-MH-E2",
      "name": "2026년 호접란 E동 2차",
      "cropId": "CR-ORCHID",
      "varietyId": "V-MH",
      "greenhouseId": "GH-E",
      "actualStartDate": null,
      "status": "미진행",
      "stageHistory": [],
      "plannedStartAt": "2026-11-20T09:00",
      "expectedEndAt": "2027-04-30T18:00",
      "registeredAt": "2026-11-07T09:00",
      "actualStartAt": null,
      "actualEndAt": null,
      "endReason": null,
      "environmentStandardSetId": "STD-MH-2026",
      "memberId": "FARMER-DEMO-01"
    }
  ],
  "sampleDiaries": [
    {
      "diaryId": "D-A-0902",
      "cycleId": "CY-MH-A1",
      "workDate": "2026-09-02",
      "stageId": "VEG",
      "createdAt": "2026-09-02T17:10:00",
      "updatedAt": "2026-09-02T17:10:00",
      "tasks": [
        {
          "taskId": "T-A0902-01",
          "name": "이식 후 활착 점검",
          "type": "생육 관리",
          "startedAt": "2026-09-02T09:20:00",
          "status": "완료",
          "content": "뿌리와 잎 상태 관찰 후 기록"
        }
      ],
      "stageChangeReason": ""
    },
    {
      "diaryId": "D-A-1107",
      "cycleId": "CY-MH-A1",
      "workDate": "2026-11-07",
      "stageId": "VEG",
      "createdAt": "2026-11-07T18:00:00",
      "updatedAt": "2026-11-07T18:00:00",
      "tasks": [
        {
          "taskId": "T-A1107-01",
          "name": "배지 수분 확인",
          "type": "생육 관리",
          "startedAt": "2026-11-07T08:40:00",
          "status": "완료",
          "content": "바크 배지의 건조 정도 확인"
        },
        {
          "taskId": "T-A1107-02",
          "name": "오전 관수",
          "type": "관수",
          "startedAt": "2026-11-07T09:00:00",
          "status": "완료",
          "content": "수분 상태 확인 후 오전 관수"
        }
      ],
      "stageChangeReason": ""
    },
    {
      "diaryId": "D-A-1108",
      "cycleId": "CY-MH-A1",
      "workDate": "2026-11-08",
      "stageId": "IND",
      "createdAt": "2026-11-08T16:12:00",
      "updatedAt": "2026-11-08T16:12:00",
      "tasks": [
        {
          "taskId": "T-A1108-01",
          "name": "생육단계 전환 점검",
          "type": "생육 관리",
          "startedAt": "2026-11-08T10:00:00",
          "status": "완료",
          "content": "꽃눈유도 전환을 위한 생육상태 확인"
        },
        {
          "taskId": "T-A1108-02",
          "name": "온실 온도 설정 확인",
          "type": "환경 조절",
          "startedAt": "2026-11-08T14:30:00",
          "status": "완료",
          "content": "야간 온도 제어 설정 및 기록 확인"
        }
      ],
      "stageChangeReason": "새 잎과 생육 상태를 확인해 꽃눈유도 단계로 전환 / 야간 온도 관리 조건을 확인한 뒤 다음 단계 적용"
    },
    {
      "diaryId": "D-A-1110",
      "cycleId": "CY-MH-A1",
      "workDate": "2026-11-10",
      "stageId": "IND",
      "createdAt": "2026-11-10T09:10:00",
      "updatedAt": "2026-11-10T16:45:00",
      "tasks": [
        {
          "taskId": "T-A1110-01",
          "name": "오전 관수",
          "type": "관수",
          "startedAt": "2026-11-10T08:30:00",
          "status": "완료",
          "content": "만천홍 배지 수분 확인 후 관수"
        },
        {
          "taskId": "T-A1110-02",
          "name": "잎 상태 확인",
          "type": "생육 관리",
          "startedAt": "2026-11-10T11:20:00",
          "status": "완료",
          "content": "잎색과 뿌리 상태 관찰"
        },
        {
          "taskId": "T-A1110-03",
          "name": "환기 설정 점검",
          "type": "환경 조절",
          "startedAt": "2026-11-10T16:00:00",
          "status": "미완료",
          "content": "환기 설정값 확인 예정"
        }
      ],
      "stageChangeReason": ""
    },
    {
      "diaryId": "D-B-1105",
      "cycleId": "CY-MH-B1",
      "workDate": "2026-11-05",
      "stageId": "VEG",
      "createdAt": "2026-11-05T17:00:00",
      "updatedAt": "2026-11-05T17:00:00",
      "tasks": [
        {
          "taskId": "T-B1105-01",
          "name": "정기 방제",
          "type": "방제",
          "startedAt": "2026-11-05T10:00:00",
          "status": "완료",
          "content": "계획된 방제 작업 후 시설 점검"
        },
        {
          "taskId": "T-B1105-02",
          "name": "작업 도구 정리",
          "type": "기타",
          "startedAt": "2026-11-05T16:10:00",
          "status": "완료",
          "content": "작업 도구 세척 및 정리"
        }
      ],
      "stageChangeReason": ""
    },
    {
      "diaryId": "D-B-1111",
      "cycleId": "CY-MH-B1",
      "workDate": "2026-11-11",
      "stageId": "VEG",
      "createdAt": "2026-11-11T08:20:00",
      "updatedAt": "2026-11-11T08:20:00",
      "tasks": [
        {
          "taskId": "T-B1111-01",
          "name": "오전 관수",
          "type": "관수",
          "startedAt": "2026-11-11T08:00:00",
          "status": "완료",
          "content": "오전 배지 상태 확인 후 관수"
        },
        {
          "taskId": "T-B1111-02",
          "name": "잎 점검",
          "type": "생육 관리",
          "startedAt": "2026-11-11T11:20:00",
          "status": "미완료",
          "content": "신엽 성장 상태 확인 예정"
        },
        {
          "taskId": "T-B1111-03",
          "name": "환기 설정 확인",
          "type": "환경 조절",
          "startedAt": "2026-11-11T15:00:00",
          "status": "미완료",
          "content": "오후 환기 설정 조정 예정"
        },
        {
          "taskId": "T-B1111-04",
          "name": "작업 장비 소독",
          "type": "기타",
          "startedAt": "2026-11-11T17:30:00",
          "status": "미완료",
          "content": "사용 장비 소독 및 정리 예정"
        }
      ],
      "stageChangeReason": ""
    },
    {
      "diaryId": "D-C-0928",
      "cycleId": "CY-MH-C2",
      "workDate": "2026-09-28",
      "stageId": "IND",
      "createdAt": "2026-09-28T14:30:00",
      "updatedAt": "2026-09-28T14:30:00",
      "tasks": [
        {
          "taskId": "T-C0928-01",
          "name": "꽃눈 확인",
          "type": "생육 관리",
          "startedAt": "2026-09-28T09:00:00",
          "status": "완료",
          "content": "꽃눈 형성 상태 관찰"
        }
      ],
      "stageChangeReason": "꽃눈 형성 시작 상태를 확인"
    },
    {
      "diaryId": "D-C-1030",
      "cycleId": "CY-MH-C2",
      "workDate": "2026-10-30",
      "stageId": "REP",
      "createdAt": "2026-10-30T17:20:00",
      "updatedAt": "2026-10-30T17:20:00",
      "tasks": [
        {
          "taskId": "T-C1030-01",
          "name": "꽃대 생장 점검",
          "type": "생육 관리",
          "startedAt": "2026-10-30T09:40:00",
          "status": "완료",
          "content": "꽃대 길이와 굵기 관찰"
        },
        {
          "taskId": "T-C1030-02",
          "name": "온실 환경 확인",
          "type": "환경 조절",
          "startedAt": "2026-10-30T15:00:00",
          "status": "완료",
          "content": "온실 환경 제어값 확인"
        }
      ],
      "stageChangeReason": "꽃대 발달과 화아 생육 관찰 결과 반영 / 재배 담당자 현장 관찰 결과 최종 확인"
    },
    {
      "diaryId": "D-C-1109",
      "cycleId": "CY-MH-C2",
      "workDate": "2026-11-09",
      "stageId": "REP",
      "createdAt": "2026-11-09T16:44:00",
      "updatedAt": "2026-11-09T16:44:00",
      "tasks": [
        {
          "taskId": "T-C1109-01",
          "name": "잎과 꽃대 관찰",
          "type": "생육 관리",
          "startedAt": "2026-11-09T09:40:00",
          "status": "완료",
          "content": "꽃대 성장과 잎 상태 기록"
        },
        {
          "taskId": "T-C1109-02",
          "name": "오전 관수",
          "type": "관수",
          "startedAt": "2026-11-09T10:00:00",
          "status": "완료",
          "content": "배지 상태 확인 후 관수"
        },
        {
          "taskId": "T-C1109-03",
          "name": "시설 점검",
          "type": "기타",
          "startedAt": "2026-11-09T16:20:00",
          "status": "완료",
          "content": "창 개폐 및 시설 상태 점검"
        }
      ],
      "stageChangeReason": ""
    }
  ],
  "issueSamples": [
    {
      "issueId": "ISS-B-01",
      "cycleId": "CY-MH-B1",
      "issueType": "온도",
      "occurredAt": "2026-11-11T07:30:00",
      "message": "온실 내부 온도 측정값 확인 필요",
      "status": "발생"
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
  "formDefaults": {
    "newDiaryTasks": [
      {
        "name": "오전 관수",
        "time": "09:00",
        "type": "관수",
        "status": "완료",
        "content": "바크 배지 수분 확인 후 오전 관수 실시"
      },
      {
        "name": "꽃대 생육 점검",
        "time": "10:30",
        "type": "생육 관리",
        "status": "미완료",
        "content": "꽃대와 잎의 생육상태를 확인하고 특이사항 기록"
      }
    ]
  },
  "pagination": {
    "pageSize": 5,
    "cyclePageSize": 5,
    "environmentPageSize": 7
  },
  "standardSets": [
    {
      "id": "STD-MH-2026",
      "name": "호접란 만천홍 재배단계별 환경 기준 (시연)",
      "cropId": "CR-ORCHID",
      "varietyId": "V-MH",
      "referenceType": "프로토타입 예시값",
      "confirmed": false
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
      "criterionId": "CRIT-VEG",
      "setId": "STD-MH-2026",
      "cropId": "CR-ORCHID",
      "stageId": "VEG",
      "stageOrder": 1,
      "standardDays": 56,
      "thresholds": {
        "dayTempC": [
          22,
          29
        ],
        "nightTempC": [
          18,
          24
        ],
        "humidityPct": [
          60,
          80
        ],
        "co2Ppm": [
          450,
          900
        ],
        "solarWm2": [
          80,
          420
        ],
        "lightUmolM2S": [
          120,
          360
        ],
        "substrateTempC": [
          18,
          27
        ],
        "substrateMoisturePct": [
          35,
          70
        ],
        "substrateEcMsCm": [
          0.8,
          1.7
        ],
        "substratePh": [
          5.5,
          6.5
        ]
      }
    },
    {
      "criterionId": "CRIT-IND",
      "setId": "STD-MH-2026",
      "cropId": "CR-ORCHID",
      "stageId": "IND",
      "stageOrder": 2,
      "standardDays": 42,
      "thresholds": {
        "dayTempC": [
          20,
          27
        ],
        "nightTempC": [
          16,
          21
        ],
        "humidityPct": [
          55,
          75
        ],
        "co2Ppm": [
          450,
          850
        ],
        "solarWm2": [
          75,
          390
        ],
        "lightUmolM2S": [
          110,
          330
        ],
        "substrateTempC": [
          17,
          26
        ],
        "substrateMoisturePct": [
          32,
          68
        ],
        "substrateEcMsCm": [
          0.8,
          1.6
        ],
        "substratePh": [
          5.5,
          6.4
        ]
      }
    },
    {
      "criterionId": "CRIT-REP",
      "setId": "STD-MH-2026",
      "cropId": "CR-ORCHID",
      "stageId": "REP",
      "stageOrder": 3,
      "standardDays": 65,
      "thresholds": {
        "dayTempC": [
          20,
          28
        ],
        "nightTempC": [
          17,
          22
        ],
        "humidityPct": [
          55,
          78
        ],
        "co2Ppm": [
          450,
          900
        ],
        "solarWm2": [
          90,
          450
        ],
        "lightUmolM2S": [
          130,
          380
        ],
        "substrateTempC": [
          18,
          27
        ],
        "substrateMoisturePct": [
          35,
          70
        ],
        "substrateEcMsCm": [
          0.8,
          1.8
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
      "environmentChangeId": "ENVCH-001",
      "cycleId": "CY-MH-A1",
      "insideTempC": 23.4,
      "humidityPct": 67,
      "co2Ppm": 670,
      "solarWm2": 205,
      "lightUmolM2S": 228,
      "substrateTempC": 22.1,
      "substrateMoisturePct": 54,
      "substrateEcMsCm": 1.25,
      "substratePh": 5.9,
      "measuredAt": "2026-11-12T08:00:00"
    },
    {
      "environmentChangeId": "ENVCH-002",
      "cycleId": "CY-MH-A1",
      "insideTempC": 23.6,
      "humidityPct": 69,
      "co2Ppm": 690,
      "solarWm2": 30,
      "lightUmolM2S": 90,
      "substrateTempC": 20.8,
      "substrateMoisturePct": 51,
      "substrateEcMsCm": 1.2,
      "substratePh": 6.0,
      "measuredAt": "2026-11-11T19:30:00"
    },
    {
      "environmentChangeId": "ENVCH-003",
      "cycleId": "CY-MH-A1",
      "insideTempC": 22.0,
      "humidityPct": 81,
      "co2Ppm": 620,
      "solarWm2": 195,
      "lightUmolM2S": 200,
      "substrateTempC": 21.5,
      "substrateMoisturePct": 49,
      "substrateEcMsCm": 1.2,
      "substratePh": 5.8,
      "measuredAt": "2026-11-11T09:00:00"
    },
    {
      "environmentChangeId": "ENVCH-004",
      "cycleId": "CY-MH-A1",
      "insideTempC": 24.5,
      "humidityPct": 65,
      "co2Ppm": 700,
      "solarWm2": 240,
      "lightUmolM2S": 255,
      "substrateTempC": 22.8,
      "substrateMoisturePct": 56,
      "substrateEcMsCm": 1.15,
      "substratePh": 6.1,
      "measuredAt": "2026-11-10T14:20:00"
    },
    {
      "environmentChangeId": "ENVCH-005",
      "cycleId": "CY-MH-A1",
      "insideTempC": 22.4,
      "humidityPct": 68,
      "co2Ppm": 640,
      "solarWm2": 215,
      "lightUmolM2S": 215,
      "substrateTempC": 21.9,
      "substrateMoisturePct": 50,
      "substrateEcMsCm": 1.1,
      "substratePh": 5.8,
      "measuredAt": "2026-11-08T09:00:00"
    },
    {
      "environmentChangeId": "ENVCH-006",
      "cycleId": "CY-MH-A1",
      "insideTempC": 24.0,
      "humidityPct": 73,
      "co2Ppm": 610,
      "solarWm2": 198,
      "lightUmolM2S": 221,
      "substrateTempC": 22.5,
      "substrateMoisturePct": 48,
      "substrateEcMsCm": 1.05,
      "substratePh": 6.0,
      "measuredAt": "2026-11-07T10:10:00"
    },
    {
      "environmentChangeId": "ENVCH-007",
      "cycleId": "CY-MH-B1",
      "insideTempC": 23.2,
      "humidityPct": 72,
      "co2Ppm": 610,
      "solarWm2": 220,
      "lightUmolM2S": 198,
      "substrateTempC": 21.1,
      "substrateMoisturePct": 62,
      "substrateEcMsCm": 1.0,
      "substratePh": 5.9,
      "measuredAt": "2026-11-12T08:00:00"
    },
    {
      "environmentChangeId": "ENVCH-008",
      "cycleId": "CY-MH-B1",
      "insideTempC": 30.2,
      "humidityPct": 75,
      "co2Ppm": 660,
      "solarWm2": 230,
      "lightUmolM2S": 230,
      "substrateTempC": 24.1,
      "substrateMoisturePct": 71,
      "substrateEcMsCm": 1.45,
      "substratePh": 6.0,
      "measuredAt": "2026-11-11T07:45:00"
    },
    {
      "environmentChangeId": "ENVCH-009",
      "cycleId": "CY-MH-B1",
      "insideTempC": 24.9,
      "humidityPct": 63,
      "co2Ppm": 700,
      "solarWm2": 295,
      "lightUmolM2S": 290,
      "substrateTempC": 22.0,
      "substrateMoisturePct": 58,
      "substrateEcMsCm": 1.2,
      "substratePh": 5.8,
      "measuredAt": "2026-11-10T15:00:00"
    },
    {
      "environmentChangeId": "ENVCH-010",
      "cycleId": "CY-MH-B1",
      "insideTempC": 20.4,
      "humidityPct": 65,
      "co2Ppm": 600,
      "solarWm2": 30,
      "lightUmolM2S": 90,
      "substrateTempC": 20.5,
      "substrateMoisturePct": 58,
      "substrateEcMsCm": 1.1,
      "substratePh": 5.9,
      "measuredAt": "2026-11-09T20:30:00"
    },
    {
      "environmentChangeId": "ENVCH-011",
      "cycleId": "CY-MH-C2",
      "insideTempC": 25.0,
      "humidityPct": 68,
      "co2Ppm": 710,
      "solarWm2": 340,
      "lightUmolM2S": 310,
      "substrateTempC": 23.0,
      "substrateMoisturePct": 55,
      "substrateEcMsCm": 2.1,
      "substratePh": 5.8,
      "measuredAt": "2026-11-12T09:10:00"
    },
    {
      "environmentChangeId": "ENVCH-012",
      "cycleId": "CY-MH-C2",
      "insideTempC": 19.3,
      "humidityPct": 62,
      "co2Ppm": 680,
      "solarWm2": 110,
      "lightUmolM2S": 140,
      "substrateTempC": 20.0,
      "substrateMoisturePct": 52,
      "substrateEcMsCm": 1.55,
      "substratePh": 5.4,
      "measuredAt": "2026-11-11T17:10:00"
    },
    {
      "environmentChangeId": "ENVCH-013",
      "cycleId": "CY-MH-C2",
      "insideTempC": 25.0,
      "humidityPct": 66,
      "co2Ppm": 750,
      "solarWm2": 320,
      "lightUmolM2S": 315,
      "substrateTempC": 21.9,
      "substrateMoisturePct": 56,
      "substrateEcMsCm": 1.15,
      "substratePh": 5.9,
      "measuredAt": "2026-10-30T10:20:00"
    },
    {
      "environmentChangeId": "ENVCH-014",
      "cycleId": "CY-MH-D0",
      "insideTempC": 24.0,
      "humidityPct": 69,
      "co2Ppm": 700,
      "solarWm2": 220,
      "lightUmolM2S": 240,
      "substrateTempC": 22.0,
      "substrateMoisturePct": 54,
      "substrateEcMsCm": 1.15,
      "substratePh": 6.0,
      "measuredAt": "2026-11-03T14:00:00"
    },
    {
      "environmentChangeId": "ENVCH-015",
      "cycleId": "CY-MH-B1",
      "insideTempC": null,
      "humidityPct": 74,
      "co2Ppm": 645,
      "solarWm2": null,
      "lightUmolM2S": 135,
      "substrateTempC": 21.4,
      "substrateMoisturePct": 60,
      "substrateEcMsCm": 1.1,
      "substratePh": 5.9,
      "measuredAt": "2026-11-12T06:10:00"
    }
  ]
};
