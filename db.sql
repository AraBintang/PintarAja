-- Adminer 5.4.1 MariaDB 10.11.13-MariaDB-0ubuntu0.24.04.1 dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

SET NAMES utf8mb4;

DROP TABLE IF EXISTS `cache`;
CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `cache_locks`;
CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `failed_jobs`;
CREATE TABLE `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `jobs`;
CREATE TABLE `jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) unsigned NOT NULL,
  `reserved_at` int(10) unsigned DEFAULT NULL,
  `available_at` int(10) unsigned NOT NULL,
  `created_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `job_batches`;
CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `migrations`;
CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `m_coupon`;
CREATE TABLE `m_coupon` (
  `M_CouponID` int(11) NOT NULL AUTO_INCREMENT,
  `M_CouponM_PlanID` char(1) DEFAULT NULL,
  `M_CouponDays` int(11) NOT NULL,
  `M_CouponCode` varchar(25) DEFAULT NULL,
  `M_CouponUsed` char(1) NOT NULL DEFAULT 'N',
  `M_CouponUsedDate` datetime DEFAULT NULL,
  `M_CouponM_UserID` int(11) NOT NULL DEFAULT 0,
  `M_CouponExpired` date DEFAULT NULL,
  `M_CouponCreated` datetime NOT NULL DEFAULT current_timestamp(),
  `M_CouponLastUpdated` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`M_CouponID`),
  KEY `M_CouponCode` (`M_CouponCode`),
  KEY `M_CouponUsed` (`M_CouponUsed`),
  KEY `M_CouponUsedDate` (`M_CouponUsedDate`),
  KEY `M_CouponM_UserID` (`M_CouponM_UserID`),
  KEY `M_CouponExpired` (`M_CouponExpired`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `m_coupons`;
CREATE TABLE `m_coupons` (
  `M_CouponsID` int(11) NOT NULL AUTO_INCREMENT,
  `M_CouponsCode` char(10) DEFAULT NULL,
  `M_CouponsUsed` char(1) NOT NULL DEFAULT 'N',
  `M_CouponsCreated` datetime NOT NULL DEFAULT current_timestamp(),
  `M_CouponsLastUpdated` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`M_CouponsID`),
  UNIQUE KEY `M_CouponsCode` (`M_CouponsCode`),
  KEY `M_CouponsUsed` (`M_CouponsUsed`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `m_document`;
CREATE TABLE `m_document` (
  `M_DocumentID` int(11) NOT NULL AUTO_INCREMENT,
  `M_DocumentM_UserID` int(11) NOT NULL DEFAULT 0,
  `M_DocumentM_WorkbookID` int(11) NOT NULL DEFAULT 0,
  `M_DocumentName` varchar(100) DEFAULT NULL,
  `M_DocumentPromptData` text DEFAULT 0,
  `M_DocumentFullPrompt` text DEFAULT NULL,
  `M_DocumentResult` text DEFAULT NULL,
  `M_DocumentCreated` datetime NOT NULL DEFAULT current_timestamp(),
  `M_DocumentLastUpdated` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`M_DocumentID`),
  KEY `M_DocumentName` (`M_DocumentName`),
  KEY `M_DocumentM_WorkbookID` (`M_DocumentM_WorkbookID`),
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `m_humanizer`;
CREATE TABLE `m_humanizer` (
  `M_HumanizerID` int(11) NOT NULL AUTO_INCREMENT,
  `M_HumanizerM_UserID` int(11) NOT NULL,
  `M_HumanizerName` varchar(255) NOT NULL,
  `M_HumanizerData` longtext NOT NULL,
  `M_HumanizerCreated` datetime NOT NULL DEFAULT current_timestamp(),
  `M_HumanizerLastUpdated` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`M_HumanizerID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `m_paper`;
CREATE TABLE `m_paper` (
  `M_PaperID` int(11) NOT NULL AUTO_INCREMENT,
  `M_PaperName` varchar(255) NOT NULL,
  `M_PaperCreated` datetime NOT NULL DEFAULT current_timestamp(),
  `M_PaperLastUpdated` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`M_PaperID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `m_paper` (`M_PaperID`, `M_PaperName`, `M_PaperCreated`, `M_PaperLastUpdated`) VALUES
(1,	'Skripsi',	'2026-03-05 08:56:53',	'2026-03-05 08:56:53'),
(2,	'Tesis',	'2026-03-05 08:56:53',	'2026-03-05 08:56:53'),
(3,	'Disertasi',	'2026-03-05 08:56:53',	'2026-03-05 08:56:53'),
(4,	'Makalah',	'2026-03-05 08:56:53',	'2026-03-05 08:56:53'),
(5,	'Proposal Penelitian',	'2026-03-05 08:56:53',	'2026-03-05 08:56:53'),
(6,	'Artikel Ilmiah',	'2026-03-05 08:56:53',	'2026-03-05 08:56:53'),
(7,	'Laporan Akhir',	'2026-03-05 08:56:53',	'2026-03-05 08:56:53'),
(8,	'Jurnal',	'2026-03-05 08:56:53',	'2026-03-05 08:56:53'),
(9,	'Essay',	'2026-03-05 08:56:53',	'2026-03-05 08:56:53'),
(10,	'Paper Konferensi',	'2026-03-05 08:56:53',	'2026-03-05 08:56:53');

DROP TABLE IF EXISTS `m_paraphrase`;
CREATE TABLE `m_paraphrase` (
  `M_ParaphraseID` int(11) NOT NULL AUTO_INCREMENT,
  `M_ParaphraseM_UserID` int(11) NOT NULL,
  `M_ParaphraseName` varchar(255) NOT NULL,
  `M_ParaphraseData` longtext NOT NULL,
  `M_ParaphraseCreated` datetime NOT NULL DEFAULT current_timestamp(),
  `M_ParaphraseLastUpdated` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`M_ParaphraseID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `m_plan`;
CREATE TABLE `m_plan` (
  `M_PlanID` int(11) NOT NULL AUTO_INCREMENT,
  `M_PlanName` varchar(45) DEFAULT NULL,
  `M_PlanTagLine` varchar(255) DEFAULT NULL,
  `M_PlanPrice` text DEFAULT NULL,
  `M_PlanFeature` text DEFAULT NULL,
  `M_PlanIsPopular` char(1) NOT NULL DEFAULT 'N',
  `M_PlanCreated` datetime NOT NULL DEFAULT current_timestamp(),
  `M_PlanLastUpdated` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`M_PlanID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `m_plansetting`;
CREATE TABLE `m_plansetting` (
  `M_PlanSettingID` int(11) NOT NULL AUTO_INCREMENT,
  `M_PlanSettingM_PlanID` int(11) DEFAULT NULL,
  `M_PlanSettingM_SettingID` int(11) DEFAULT NULL,
  `M_PlanSettingCreated` datetime NOT NULL DEFAULT current_timestamp(),
  `M_PlanSettingLastUpdated` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`M_PlanSettingID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `m_prompt`;
CREATE TABLE `m_prompt` (
  `M_PromptID` int(11) NOT NULL AUTO_INCREMENT,
  `M_PromptM_PaperID` int(11) NOT NULL DEFAULT 0,
  `M_PromptM_SectionID` int(11) NOT NULL DEFAULT 0,
  `M_PromptName` varchar(45) NOT NULL,
  `M_PromptValue` text NOT NULL,
  `M_PromptCreated` datetime NOT NULL DEFAULT current_timestamp(),
  `M_PromptLastUpdated` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`M_PromptID`),
  KEY `M_PromptM_PaperID` (`M_PromptM_PaperID`),
  KEY `M_PromptM_SectionID` (`M_PromptM_SectionID`),
  KEY `M_PromptName` (`M_PromptName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `m_section`;
CREATE TABLE `m_section` (
  `M_SectionID` int(11) NOT NULL AUTO_INCREMENT,
  `M_SectionM_PaperID` int(11) DEFAULT NULL,
  `M_SectionName` varchar(255) DEFAULT NULL,
  `M_SectionCreated` datetime NOT NULL DEFAULT current_timestamp(),
  `M_SectionLastUpdated` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`M_SectionID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `m_setting`;
CREATE TABLE `m_setting` (
  `M_SettingID` int(11) NOT NULL AUTO_INCREMENT,
  `M_SettingCode` varchar(45) DEFAULT NULL,
  `M_SettingName` varchar(45) DEFAULT NULL,
  `M_SettingModel` varchar(255) DEFAULT NULL,
  `M_SettingKey` text DEFAULT NULL,
  `M_SettingIsActive` char(1) NOT NULL DEFAULT 'N',
  `M_SettingCreated` datetime NOT NULL DEFAULT current_timestamp(),
  `M_SettingLastUpdated` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`M_SettingID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `m_transcribe`;
CREATE TABLE `m_transcribe` (
  `M_TranscribeID` int(11) NOT NULL AUTO_INCREMENT,
  `M_TranscribeM_UserID` int(11) NOT NULL,
  `M_TranscribeName` varchar(255) NOT NULL,
  `M_TranscribeData` longtext NOT NULL,
  `M_TranscribeSource` varchar(45) NOT NULL,
  `M_TranscribeCreated` datetime NOT NULL DEFAULT current_timestamp(),
  `M_TranscribeLastUpdated` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`M_TranscribeID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `m_user`;
CREATE TABLE `m_user` (
  `M_UserID` int(11) NOT NULL AUTO_INCREMENT,
  `M_UserEmail` varchar(200) DEFAULT NULL,
  `M_UserEmailVerifiedAt` datetime DEFAULT NULL,
  `M_UserToken` varchar(255) DEFAULT NULL,
  `M_UserFullName` varchar(20) DEFAULT NULL,
  `M_UserImage` varchar(255) DEFAULT NULL,
  `M_UserPhone` varchar(45) DEFAULT NULL,
  `M_UserPassword` text DEFAULT NULL,
  `M_UserIsActive` char(1) NOT NULL DEFAULT 'Y',
  `M_UserRole` char(1) NOT NULL DEFAULT 'U',
  `M_UserPlan` int(11) NOT NULL DEFAULT 1,
  `M_UserSubsExp` datetime DEFAULT NULL,
  `M_UserCreated` datetime NOT NULL DEFAULT current_timestamp(),
  `M_UserLastUpdated` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`M_UserID`),
  UNIQUE KEY `M_UserEmail_UNIQUE` (`M_UserEmail`),
  KEY `M_UserEmail` (`M_UserEmail`),
  KEY `M_UserToken` (`M_UserToken`),
  KEY `M_UserIsActive` (`M_UserIsActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `m_user` (`M_UserID`, `M_UserEmail`, `M_UserEmailVerifiedAt`, `M_UserToken`, `M_UserFullName`, `M_UserImage`, `M_UserPhone`, `M_UserPassword`, `M_UserIsActive`, `M_UserRole`, `M_UserPlan`, `M_UserSubsExp`, `M_UserCreated`, `M_UserLastUpdated`) VALUES
(1,	'dahyun@gmail.com',	'2026-03-02 09:28:38',	'WGmx2QpNSjTgvOPo3PBIX3uGoT7ALWEMkksAhsIwLqyDSFyiqm6FAeqHG67piPEN',	'Kim Dahyun',	'1736910131.jpeg',	'+82',	'$2y$12$j7O84ba4ZSZhW8iQygDwaeqvX5eOYUvL4z05aDk12s95Yqz/bGLBy',	'Y',	'U',	1,	NULL,	'2024-12-04 08:27:54',	'2026-03-02 12:00:26'),
(2,	'johndoe@gmail.com',	'2026-03-02 09:28:38',	'TYYXZUHuCOMjBMBjJvw02QDff8r9THmla29FijzgXpVjqAnyiQ0i7fPq6Ptdd7i8',	'Johny Racing 200',	'1737102103.jpg',	'0987654321',	'$2y$12$2xb687fB9DzLzzVDOD00buTX7Y6yZguoJG/5rOlyC6CHSinh7dAUq',	'Y',	'A',	2,	'2026-11-28 16:04:04',	'2024-12-04 08:27:54',	'2026-03-05 11:05:27');

DROP TABLE IF EXISTS `m_workbook`;
CREATE TABLE `m_workbook` (
  `M_WorkbookID` int(11) NOT NULL AUTO_INCREMENT,
  `M_WorkbookM_UserID` int(11) NOT NULL DEFAULT 0,
  `M_WorkbookName` varchar(100) DEFAULT NULL,
  `M_WorkbookCreated` datetime NOT NULL DEFAULT current_timestamp(),
  `M_WorkbookLastUpdated` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`M_WorkbookID`),
  KEY `M_WorkbookName` (`M_WorkbookName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `password_reset_tokens`;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `personal_access_tokens`;
CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) unsigned NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `sessions`;
CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `t_chat`;
CREATE TABLE `t_chat` (
  `T_ChatID` int(11) NOT NULL AUTO_INCREMENT,
  `T_ChatT_ConversationID` int(11) NOT NULL DEFAULT 0,
  `T_ChatCode` varchar(45) DEFAULT NULL,
  `T_ChatRole` varchar(45) NOT NULL,
  `T_ChatContent` longtext DEFAULT NULL,
  `T_ChatCreated` datetime NOT NULL DEFAULT current_timestamp(),
  `T_ChatLastUpdated` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`T_ChatID`),
  KEY `T_ChatT_ConversationID` (`T_ChatT_ConversationID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `t_conversation`;
CREATE TABLE `t_conversation` (
  `T_ConversationID` int(11) NOT NULL AUTO_INCREMENT,
  `T_ConversationM_UserID` int(11) NOT NULL DEFAULT 0,
  `T_ConversationTitle` varchar(50) NOT NULL,
  `T_ConversationIsActive` char(1) NOT NULL DEFAULT 'Y',
  `T_ConversationCreated` datetime NOT NULL DEFAULT current_timestamp(),
  `T_ConversationLastUpdated` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`T_ConversationID`),
  KEY `T_ConversationTitle` (`T_ConversationTitle`),
  KEY `T_ConversationM_UserID` (`T_ConversationM_UserID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `t_otp`;
CREATE TABLE `t_otp` (
  `T_OtpID` int(11) NOT NULL AUTO_INCREMENT,
  `T_OtpM_UserEmail` varchar(255) DEFAULT NULL,
  `T_OtpValue` varchar(45) DEFAULT NULL,
  `T_OtpExpired` datetime DEFAULT NULL,
  `T_OtpCreated` datetime NOT NULL DEFAULT current_timestamp(),
  `T_OtpLastUpdated` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`T_OtpID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `t_transaction`;
CREATE TABLE `t_transaction` (
  `T_TransactionID` int(11) NOT NULL AUTO_INCREMENT,
  `T_TransactionM_UserID` int(11) DEFAULT NULL,
  `T_TransactionM_PlanID` int(11) DEFAULT NULL,
  `T_TransactionIdResult` varchar(45) DEFAULT NULL,
  `T_TransactionIdRefrence` varchar(255) DEFAULT NULL,
  `T_TransactionQR` text DEFAULT NULL,
  `T_TransactionItem` varchar(255) DEFAULT NULL,
  `T_TransactionAmount` int(11) DEFAULT NULL,
  `T_TransactionStatus` varchar(1) DEFAULT NULL,
  `T_TransactionMethod` varchar(45) DEFAULT NULL,
  `T_TransactionChannel` varchar(45) DEFAULT NULL,
  `T_TransactionExpired` varchar(45) DEFAULT NULL,
  `T_TransactionCreated` datetime NOT NULL DEFAULT current_timestamp(),
  `T_TransactionLastUpdated` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`T_TransactionID`),
  UNIQUE KEY `T_TransactionID_UNIQUE` (`T_TransactionID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 2026-03-09 06:00:31 UTC