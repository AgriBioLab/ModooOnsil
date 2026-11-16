-- ModooOnsil 2차 스프린트 MariaDB 조회용 쿼리 모음 (확정 DDL 기준)
SET NAMES utf8mb4;
USE modooonsil;

-- 1. 테이블별 데이터 건수 확인
SELECT 'farm_member' AS table_name, COUNT(*) AS cnt FROM farm_member
UNION ALL SELECT 'greenhouse', COUNT(*) FROM greenhouse
UNION ALL SELECT 'crop', COUNT(*) FROM crop
UNION ALL SELECT 'crop_stage_standard', COUNT(*) FROM crop_stage_standard
UNION ALL SELECT 'cultivation_plan', COUNT(*) FROM cultivation_plan
UNION ALL SELECT 'cultivation_diary', COUNT(*) FROM cultivation_diary
UNION ALL SELECT 'cultivation_diary_task', COUNT(*) FROM cultivation_diary_task
UNION ALL SELECT 'greenhouse_environment_history', COUNT(*) FROM greenhouse_environment_history
UNION ALL SELECT 'greenhouse_issue', COUNT(*) FROM greenhouse_issue;

-- 2. 회원별 데이터 분포 확인 (로그인 범위 검수용)
SELECT m.member_id,
       m.farm_name,
       m.username,
       m.certification_status,
       (SELECT COUNT(*) FROM greenhouse g WHERE g.member_id = m.member_id) AS greenhouse_cnt,
       (SELECT COUNT(*) FROM cultivation_plan p WHERE p.member_id = m.member_id) AS plan_cnt,
       (SELECT COUNT(*) FROM cultivation_diary d
        JOIN cultivation_plan p ON p.plan_id = d.plan_id
        WHERE p.member_id = m.member_id) AS diary_cnt
FROM farm_member m
ORDER BY m.member_id;

-- 3. 재배일지작업 목록 조회 (전체/미완료 작업 건수 포함)
SELECT d.diary_id,
       DATE(d.worked_at) AS work_date,
       g.greenhouse_name,
       c.crop_name,
       c.variety_name,
       p.plan_name,
       d.growth_stage,
       COUNT(t.task_id) AS total_task_cnt,
       SUM(CASE WHEN t.task_status = '미완료' THEN 1 ELSE 0 END) AS incomplete_task_cnt
FROM cultivation_diary d
JOIN cultivation_plan p ON p.plan_id = d.plan_id
JOIN greenhouse g ON g.greenhouse_id = p.greenhouse_id
JOIN crop_stage_standard s ON s.standard_id = p.standard_id
JOIN crop c ON c.crop_id = s.crop_id
LEFT JOIN cultivation_diary_task t ON t.diary_id = d.diary_id
WHERE p.member_id = 940001
GROUP BY d.diary_id, d.worked_at, g.greenhouse_name, c.crop_name, c.variety_name, p.plan_name, d.growth_stage
ORDER BY d.worked_at DESC, d.diary_id DESC;

-- 4. 재배일지작업 상세 - 기본정보 (재배일지정보)
SELECT d.diary_id,
       p.plan_name,
       c.crop_name,
       c.variety_name,
       g.greenhouse_name,
       d.worked_at,
       d.growth_stage,
       d.stage_change_reason,
       d.created_at,
       d.updated_at
FROM cultivation_diary d
JOIN cultivation_plan p ON p.plan_id = d.plan_id
JOIN greenhouse g ON g.greenhouse_id = p.greenhouse_id
JOIN crop_stage_standard s ON s.standard_id = p.standard_id
JOIN crop c ON c.crop_id = s.crop_id
WHERE p.member_id = 940001
  AND d.diary_id = 940001;

-- 5. 재배일지작업 상세 - 작업내용 목록
SELECT t.task_id,
       t.task_name,
       t.task_type,
       t.task_time,
       t.task_status,
       t.task_content
FROM cultivation_diary_task t
JOIN cultivation_diary d ON d.diary_id = t.diary_id
JOIN cultivation_plan p ON p.plan_id = d.plan_id
WHERE p.member_id = 940001
  AND t.diary_id = 940001
ORDER BY t.task_time, t.task_id;

-- 6. 작기계획 목록 조회
SELECT p.plan_id,
       p.plan_name,
       g.greenhouse_name,
       c.crop_name,
       c.variety_name,
       p.plan_status,
       p.planned_start_date,
       p.actual_start_date,
       p.planned_end_date,
       p.actual_end_date
FROM cultivation_plan p
JOIN greenhouse g ON g.greenhouse_id = p.greenhouse_id
JOIN crop_stage_standard s ON s.standard_id = p.standard_id
JOIN crop c ON c.crop_id = s.crop_id
WHERE p.member_id = 940001
ORDER BY p.planned_start_date DESC;

-- 7. 온실 환경변화 목록 조회
SELECT h.environment_history_id,
       p.plan_name,
       g.greenhouse_name,
       h.measured_at,
       h.temperature,
       h.humidity,
       h.co2,
       h.radiation,
       h.light
FROM greenhouse_environment_history h
JOIN cultivation_plan p ON p.plan_id = h.plan_id
JOIN greenhouse g ON g.greenhouse_id = p.greenhouse_id
WHERE p.member_id = 940001
ORDER BY h.measured_at DESC;

-- 8. 온실 환경 이슈 목록 조회
SELECT i.issue_id,
       i.occurred_at,
       p.plan_name,
       i.issue_type,
       i.issue_message,
       i.issue_status,
       i.issue_value,
       i.action_content,
       i.action_completed_at
FROM greenhouse_issue i
JOIN cultivation_plan p ON p.plan_id = i.plan_id
WHERE p.member_id = 940001
ORDER BY i.occurred_at DESC;
