CREATE TABLE `greenhouse` (
	`greenhouse_id`	BIGINT	NOT NULL	COMMENT '필수',
	`member_id`	BIGINT	NULL,
	`greenhouse_name`	VARCHAR(100)	NULL	COMMENT '필수',
	`created_at`	DATETIME	NULL	COMMENT '필수',
	`greenhouse_type`	VARCHAR(30)	NULL,
	`cover_type`	VARCHAR(30)	NULL,
	`building_count`	INT	NULL,
	`side_height`	DECIMAL(6,2)	NULL,
	`width`	DECIMAL(8,2)	NULL,
	`length`	DECIMAL(8,2)	NULL,
	`registered_area`	DECIMAL(12,2)	NULL,
	`medium_type`	VARCHAR(30)	NULL,
	`greenhouse_image_url`	VARCHAR(500)	NULL,
	`updated_at`	DATETIME	NULL
);

CREATE TABLE `crop_stage_standard` (
	`standard_id`	BIGINT	NOT NULL	COMMENT '필수',
	`crop_id`	BIGINT	NULL	COMMENT '필수',
	`created_at`	DATETIME	NULL	COMMENT '필수',
	`growth_stage`	VARCHAR(30)	NULL,
	`stage_duration_days`	INT	NULL,
	`stage_order`	INT	NULL,
	`day_temp_min`	DECIMAL(5,2)	NULL,
	`day_temp_max`	DECIMAL(5,2)	NULL,
	`night_temp_min`	DECIMAL(5,2)	NULL,
	`night_temp_max`	DECIMAL(5,2)	NULL,
	`humidity_min`	DECIMAL(5,2)	NULL,
	`humidity_max`	DECIMAL(5,2)	NULL,
	`co2_min`	DECIMAL(8,2)	NULL,
	`co2_max`	DECIMAL(8,2)	NULL,
	`radiation_min`	DECIMAL(10,2)	NULL,
	`radiation_max`	DECIMAL(10,2)	NULL,
	`light_min`	DECIMAL(10,2)	NULL,
	`light_max`	DECIMAL(10,2)	NULL,
	`soil_temp_min`	DECIMAL(5,2)	NULL,
	`soil_temp_max`	DECIMAL(5,2)	NULL,
	`soil_moisture_min`	DECIMAL(5,2)	NULL,
	`soil_moisture_max`	DECIMAL(5,2)	NULL,
	`soil_ec_min`	DECIMAL(8,3)	NULL,
	`soil_ec_max`	DECIMAL(8,3)	NULL,
	`soil_ph_min`	DECIMAL(4,2)	NULL,
	`soil_ph_max`	DECIMAL(4,2)	NULL
);

CREATE TABLE `cultivation_diary_task` (
	`task_id`	BIGINT	NOT NULL	COMMENT '필수',
	`diary_id`	BIGINT	NULL	COMMENT '필수',
	`task_type`	VARCHAR(30)	NULL	COMMENT '필수',
	`task_name`	VARCHAR(100)	NULL	COMMENT '필수',
	`task_time`	DATETIME	NULL	COMMENT '필수',
	`task_status`	VARCHAR(20)	NULL	COMMENT '필수',
	`task_content`	TEXT	NULL
);

CREATE TABLE `greenhouse_environment_history` (
	`environment_history_id`	BIGINT	NOT NULL	COMMENT '필수',
	`plan_id`	BIGINT	NULL	COMMENT '필수',
	`measured_at`	DATETIME	NULL	COMMENT '필수',
	`temperature`	DECIMAL(5,2)	NULL,
	`humidity`	DECIMAL(5,2)	NULL,
	`co2`	DECIMAL(8,2)	NULL,
	`radiation`	DECIMAL(10,2)	NULL,
	`light`	DECIMAL(10,2)	NULL,
	`soil_temperature`	DECIMAL(5,2)	NULL,
	`soil_moisture`	DECIMAL(5,2)	NULL,
	`soil_ec`	DECIMAL(8,3)	NULL,
	`soil_ph`	DECIMAL(4,2)	NULL
);

CREATE TABLE `cultivation_diary` (
	`diary_id`	BIGINT	NOT NULL	COMMENT '필수',
	`plan_id`	BIGINT	NULL	COMMENT '필수',
	`worked_at`	DATETIME	NULL	COMMENT '필수',
	`created_at`	DATETIME	NULL	COMMENT '필수',
	`growth_stage`	VARCHAR(30)	NULL,
	`updated_at`	DATETIME	NULL,
	`stage_change_reason`	TEXT	NULL
);

CREATE TABLE `cultivation_plan` (
	`plan_id`	BIGINT	NOT NULL	COMMENT '필수',
	`greenhouse_id`	BIGINT	NULL	COMMENT '필수',
	`member_id`	BIGINT	NULL	COMMENT '필수',
	`standard_id`	BIGINT	NULL	COMMENT '필수',
	`plan_name`	VARCHAR(100)	NULL	COMMENT '필수',
	`plan_status`	VARCHAR(20)	NULL	COMMENT '필수',
	`planned_start_date`	DATETIME	NULL	COMMENT '필수',
	`planned_end_date`	DATETIME	NULL	COMMENT '필수',
	`created_at`	DATETIME	NULL	COMMENT '필수',
	`actual_start_date`	DATETIME	NULL,
	`actual_end_date`	DATETIME	NULL,
	`end_reason`	TEXT	NULL
);

CREATE TABLE `greenhouse_issue` (
	`issue_id`	BIGINT	NOT NULL	COMMENT '필수',
	`plan_id`	BIGINT	NULL	COMMENT '필수',
	`issue_type`	VARCHAR(30)	NULL	COMMENT '필수',
	`issue_message`	TEXT	NULL	COMMENT '필수',
	`occurred_at`	DATETIME	NULL	COMMENT '필수',
	`issue_status`	VARCHAR(20)	NULL	COMMENT '필수',
	`issue_value`	DECIMAL(12,3)	NULL,
	`action_content`	TEXT	NULL,
	`action_completed_at`	DATETIME	NULL
);

CREATE TABLE `crop` (
	`crop_id`	BIGINT	NOT NULL	COMMENT '필수',
	`crop_name`	VARCHAR(100)	NULL	COMMENT '필수',
	`variety_name`	VARCHAR(100)	NULL	COMMENT '필수'
);

CREATE TABLE `farm_member` (
	`member_id`	BIGINT	NOT NULL	COMMENT '필수',
	`farm_name`	VARCHAR(100)	NULL	COMMENT '필수',
	`representative_name`	VARCHAR(50)	NULL	COMMENT '필수',
	`username`	VARCHAR(50)	NULL	COMMENT '필수',
	`password`	VARCHAR(255)	NULL	COMMENT '필수',
	`created_at`	DATETIME	NULL	COMMENT '필수',
	`phone_number`	VARCHAR(20)	NULL,
	`email`	VARCHAR(255)	NULL,
	`farm_address`	VARCHAR(255)	NULL,
	`farm_address_detail`	VARCHAR(255)	NULL,
	`main_crop`	VARCHAR(100)	NULL,
	`farm_description`	TEXT	NULL,
	`certified_at`	DATETIME	NULL,
	`updated_at`	DATETIME	NULL,
	`farm_business_number`	VARCHAR(20)	NULL,
	`certification_status`	VARCHAR(20)	NULL
);

ALTER TABLE `greenhouse`
    ADD CONSTRAINT `PK_GREENHOUSE` PRIMARY KEY (`greenhouse_id`),
    MODIFY COLUMN `greenhouse_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '필수';

ALTER TABLE `crop_stage_standard`
    ADD CONSTRAINT `PK_CROP_STAGE_STANDARD` PRIMARY KEY (`standard_id`),
    MODIFY COLUMN `standard_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '필수';

ALTER TABLE `cultivation_diary_task`
    ADD CONSTRAINT `PK_CULTIVATION_DIARY_TASK` PRIMARY KEY (`task_id`),
    MODIFY COLUMN `task_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '필수';

ALTER TABLE `greenhouse_environment_history`
    ADD CONSTRAINT `PK_GREENHOUSE_ENVIRONMENT_HISTORY` PRIMARY KEY (`environment_history_id`),
    MODIFY COLUMN `environment_history_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '필수';

ALTER TABLE `cultivation_diary`
    ADD CONSTRAINT `PK_CULTIVATION_DIARY` PRIMARY KEY (`diary_id`),
    MODIFY COLUMN `diary_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '필수';

ALTER TABLE `cultivation_plan`
    ADD CONSTRAINT `PK_CULTIVATION_PLAN` PRIMARY KEY (`plan_id`),
    MODIFY COLUMN `plan_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '필수';

ALTER TABLE `greenhouse_issue`
    ADD CONSTRAINT `PK_GREENHOUSE_ISSUE` PRIMARY KEY (`issue_id`),
    MODIFY COLUMN `issue_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '필수';

ALTER TABLE `crop`
    ADD CONSTRAINT `PK_CROP` PRIMARY KEY (`crop_id`),
    MODIFY COLUMN `crop_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '필수';

ALTER TABLE `farm_member`
    ADD CONSTRAINT `PK_FARM_MEMBER` PRIMARY KEY (`member_id`),
    MODIFY COLUMN `member_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '필수';
