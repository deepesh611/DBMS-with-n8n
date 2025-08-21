-- Adminer 5.3.0 MySQL 9.4.0 dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;

SET NAMES utf8mb4;

CREATE DATABASE `church_management` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `church_management`;

CREATE TABLE `family_relationships` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `member_id` int unsigned NOT NULL,
  `related_member_id` int unsigned NOT NULL,
  `relationship_type` enum('Spouse','Child','Parent','Sibling','Other') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_relationship` (`member_id`,`related_member_id`,`relationship_type`),
  KEY `idx_member_relationships` (`member_id`),
  KEY `idx_family_connections` (`related_member_id`),
  CONSTRAINT `family_relationships_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE CASCADE,
  CONSTRAINT `family_relationships_ibfk_2` FOREIGN KEY (`related_member_id`) REFERENCES `members` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `family_tree` (`member_id` int unsigned, `member_name` varchar(201), `relationship_type` enum('Spouse','Child','Parent','Sibling','Other'), `related_member_id` int unsigned, `related_member_name` varchar(201), `family_name` varchar(100));


CREATE TABLE `member_employment` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `member_id` int unsigned NOT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `designation` varchar(255) DEFAULT NULL,
  `profession` varchar(255) DEFAULT NULL,
  `is_employed` tinyint(1) DEFAULT '0',
  `employment_start_date` date DEFAULT NULL,
  `is_current` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_member_employment` (`member_id`),
  KEY `idx_profession` (`profession`),
  CONSTRAINT `member_employment_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `member_phones` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `member_id` int unsigned NOT NULL,
  `phone_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `phone_number` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_member_phone_type` (`member_id`,`phone_type`),
  KEY `idx_member_phones` (`member_id`),
  CONSTRAINT `member_phones_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `member_summary` (`id` int unsigned, `full_name` varchar(313), `family_name` varchar(100), `email` varchar(255), `dob` date, `church_joining_date` date, `family_status` enum('Here','Origin Country'), `is_employed` tinyint(1), `company_name` varchar(255), `designation` varchar(255), `phone_numbers` text);


CREATE TABLE `members` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `middle_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) NOT NULL,
  `family_name` varchar(100) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `baptism_date` date DEFAULT NULL,
  `baptism_church` varchar(255) DEFAULT NULL,
  `baptism_country` varchar(100) DEFAULT NULL,
  `family_status` enum('Here','Origin Country') DEFAULT 'Here',
  `carsel` varchar(255) DEFAULT NULL,
  `local_address` text,
  `church_joining_date` date DEFAULT NULL,
  `profile_pic` varchar(500) DEFAULT NULL,
  `family_photo` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_name` (`first_name`,`last_name`),
  KEY `idx_family` (`family_name`),
  KEY `idx_joining_date` (`church_joining_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `family_tree`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `family_tree` AS select `m1`.`id` AS `member_id`,concat(`m1`.`first_name`,' ',`m1`.`last_name`) AS `member_name`,`fr`.`relationship_type` AS `relationship_type`,`m2`.`id` AS `related_member_id`,concat(`m2`.`first_name`,' ',`m2`.`last_name`) AS `related_member_name`,`m1`.`family_name` AS `family_name` from ((`members` `m1` join `family_relationships` `fr` on((`m1`.`id` = `fr`.`member_id`))) join `members` `m2` on((`fr`.`related_member_id` = `m2`.`id`)));

DROP TABLE IF EXISTS `member_summary`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `member_summary` AS select `m`.`id` AS `id`,concat(`m`.`title`,' ',`m`.`first_name`,(case when (`m`.`middle_name` is not null) then concat(' ',`m`.`middle_name`) else '' end),' ',`m`.`last_name`) AS `full_name`,`m`.`family_name` AS `family_name`,`m`.`email` AS `email`,`m`.`dob` AS `dob`,`m`.`church_joining_date` AS `church_joining_date`,`m`.`family_status` AS `family_status`,max(`me`.`is_employed`) AS `is_employed`,max(`me`.`company_name`) AS `company_name`,max(`me`.`designation`) AS `designation`,group_concat(distinct concat(`mp`.`phone_type`,': ',`mp`.`phone_number`) separator ', ') AS `phone_numbers` from ((`members` `m` left join `member_employment` `me` on(((`m`.`id` = `me`.`member_id`) and (`me`.`is_current` = true)))) left join `member_phones` `mp` on(((`m`.`id` = `mp`.`member_id`) and (`mp`.`is_active` = true)))) group by `m`.`id`,`m`.`title`,`m`.`first_name`,`m`.`middle_name`,`m`.`last_name`,`m`.`family_name`,`m`.`email`,`m`.`dob`,`m`.`church_joining_date`,`m`.`family_status`;

-- 2025-08-21 08:41:45 UTC
