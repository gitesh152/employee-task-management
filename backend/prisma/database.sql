-- Employee Task Management System
-- Database Schema SQL Script
-- Generated from Prisma Schema
-- Date: 2026-07-08

-- Create Database
CREATE DATABASE IF NOT EXISTS `employee_task_management`;
USE `employee_task_management`;

-- Create Users Table
CREATE TABLE `User` (
  `id` VARCHAR(191) NOT NULL,
  `fullName` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `password` VARCHAR(191) NOT NULL,
  `role` ENUM('ADMIN', 'EMPLOYEE') NOT NULL,
  `department` VARCHAR(191),
  `designation` VARCHAR(191),
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`),
  KEY `User_role_idx` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Refresh Tokens Table
CREATE TABLE `RefreshToken` (
  `id` VARCHAR(191) NOT NULL,
  `tokenHash` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `expiresAt` DATETIME(3) NOT NULL,
  `revokedAt` DATETIME(3),
  `replacedByHash` VARCHAR(191),
  `ip` VARCHAR(191),
  `userAgent` VARCHAR(191),
  `rememberMe` BOOLEAN NOT NULL DEFAULT false,

  PRIMARY KEY (`id`),
  UNIQUE KEY `RefreshToken_tokenHash_key` (`tokenHash`),
  KEY `RefreshToken_userId_idx` (`userId`),
  KEY `RefreshToken_expiresAt_idx` (`expiresAt`),
  KEY `RefreshToken_userId_revokedAt_idx` (`userId`, `revokedAt`),
  CONSTRAINT `RefreshToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Tasks Table
CREATE TABLE `Task` (
  `id` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `description` LONGTEXT NOT NULL,
  `priority` ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL DEFAULT 'MEDIUM',
  `status` ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED') NOT NULL DEFAULT 'PENDING',
  `startDate` DATETIME(3) NOT NULL,
  `dueDate` DATETIME(3) NOT NULL,
  `assignedToId` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`),
  KEY `Task_assignedToId_idx` (`assignedToId`),
  KEY `Task_status_idx` (`status`),
  KEY `Task_priority_idx` (`priority`),
  KEY `Task_dueDate_idx` (`dueDate`),
  CONSTRAINT `Task_assignedToId_fkey` FOREIGN KEY (`assignedToId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Attachments Table
CREATE TABLE `Attachment` (
  `id` VARCHAR(191) NOT NULL,
  `fileName` VARCHAR(191) NOT NULL,
  `fileUrl` VARCHAR(191) NOT NULL,
  `fileType` VARCHAR(191) NOT NULL,
  `fileSize` INTEGER NOT NULL,
  `taskId` VARCHAR(191) NOT NULL,
  `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  UNIQUE KEY `Attachment_taskId_key` (`taskId`),
  KEY `Attachment_taskId_idx` (`taskId`),
  CONSTRAINT `Attachment_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `Task` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Notifications Table
CREATE TABLE `Notification` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `taskId` VARCHAR(191),
  `type` ENUM('TASK_ASSIGNED', 'TASK_DUE', 'TASK_COMPLETED') NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `message` LONGTEXT NOT NULL,
  `isRead` BOOLEAN NOT NULL DEFAULT false,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  KEY `Notification_userId_isRead_idx` (`userId`, `isRead`),
  KEY `Notification_createdAt_idx` (`createdAt`),
  KEY `Notification_taskId_fkey` (`taskId`),
  CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Notification_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `Task` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Prisma Migrations Table
CREATE TABLE `_prisma_migrations` (
  `id` VARCHAR(36) NOT NULL,
  `checksum` VARCHAR(64) NOT NULL,
  `finished_at` TIMESTAMP NULL,
  `migration_name` VARCHAR(255) NOT NULL,
  `logs` LONGTEXT,
  `rolled_back_at` TIMESTAMP NULL,
  `started_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `applied_steps_count` INTEGER UNSIGNED NOT NULL DEFAULT 0,

  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Sample Admin User (Password: admin123)
-- This is optional and for testing purposes only
-- In production, use the registration endpoint instead
INSERT INTO `User` (
  `id`,
  `fullName`,
  `email`,
  `password`,
  `role`,
  `department`,
  `designation`,
  `createdAt`,
  `updatedAt`
) VALUES (
  'admin-user-001',
  'Admin User',
  'admin@company.com',
  -- This is a bcrypt hash of 'admin123' - CHANGE IN PRODUCTION
  '$2b$10$YourHashedPasswordHere',
  'ADMIN',
  'Management',
  'System Administrator',
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE `updatedAt` = NOW();

-- Insert Sample Employee Users
INSERT INTO `User` (
  `id`,
  `fullName`,
  `email`,
  `password`,
  `role`,
  `department`,
  `designation`,
  `createdAt`,
  `updatedAt`
) VALUES 
  (
    'emp-user-001',
    'John Doe',
    'john.doe@company.com',
    -- Bcrypt hash of 'employee123' - CHANGE IN PRODUCTION
    '$2b$10$YourHashedPasswordHere',
    'EMPLOYEE',
    'Engineering',
    'Senior Software Engineer',
    NOW(),
    NOW()
  ),
  (
    'emp-user-002',
    'Jane Smith',
    'jane.smith@company.com',
    -- Bcrypt hash of 'employee123' - CHANGE IN PRODUCTION
    '$2b$10$YourHashedPasswordHere',
    'EMPLOYEE',
    'Design',
    'UI/UX Designer',
    NOW(),
    NOW()
  ),
  (
    'emp-user-003',
    'Bob Johnson',
    'bob.johnson@company.com',
    -- Bcrypt hash of 'employee123' - CHANGE IN PRODUCTION
    '$2b$10$YourHashedPasswordHere',
    'EMPLOYEE',
    'Marketing',
    'Marketing Manager',
    NOW(),
    NOW()
  )
ON DUPLICATE KEY UPDATE `updatedAt` = NOW();

-- Insert Sample Tasks
INSERT INTO `Task` (
  `id`,
  `title`,
  `description`,
  `priority`,
  `status`,
  `startDate`,
  `dueDate`,
  `assignedToId`,
  `createdAt`,
  `updatedAt`
) VALUES
  (
    'task-001',
    'Implement User Authentication',
    'Implement JWT-based authentication system with access and refresh tokens',
    'HIGH',
    'IN_PROGRESS',
    NOW(),
    DATE_ADD(NOW(), INTERVAL 5 DAY),
    'emp-user-001',
    NOW(),
    NOW()
  ),
  (
    'task-002',
    'Design Dashboard UI',
    'Create mockups and design for the main dashboard interface',
    'MEDIUM',
    'PENDING',
    NOW(),
    DATE_ADD(NOW(), INTERVAL 7 DAY),
    'emp-user-002',
    NOW(),
    NOW()
  ),
  (
    'task-003',
    'Setup Database Schema',
    'Create and migrate database schema for employee and task management',
    'HIGH',
    'COMPLETED',
    DATE_SUB(NOW(), INTERVAL 10 DAY),
    DATE_SUB(NOW(), INTERVAL 2 DAY),
    'emp-user-001',
    NOW(),
    NOW()
  ),
  (
    'task-004',
    'Create Marketing Campaign',
    'Design and launch Q3 marketing campaign',
    'MEDIUM',
    'IN_PROGRESS',
    DATE_SUB(NOW(), INTERVAL 3 DAY),
    DATE_ADD(NOW(), INTERVAL 10 DAY),
    'emp-user-003',
    NOW(),
    NOW()
  );

-- Insert Sample Notifications
INSERT INTO `Notification` (
  `id`,
  `userId`,
  `taskId`,
  `type`,
  `title`,
  `message`,
  `isRead`,
  `createdAt`
) VALUES
  (
    'notif-001',
    'emp-user-001',
    'task-001',
    'TASK_ASSIGNED',
    'New Task Assigned',
    'You have been assigned the task: Implement User Authentication',
    false,
    NOW()
  ),
  (
    'notif-002',
    'emp-user-002',
    'task-002',
    'TASK_ASSIGNED',
    'New Task Assigned',
    'You have been assigned the task: Design Dashboard UI',
    true,
    DATE_SUB(NOW(), INTERVAL 1 DAY)
  ),
  (
    'notif-003',
    'emp-user-003',
    'task-004',
    'TASK_DUE',
    'Task Due Soon',
    'Your task "Create Marketing Campaign" is due in 10 days',
    false,
    NOW()
  );

-- Create Indexes for Better Performance
-- Additional compound indexes for common queries
CREATE INDEX `idx_task_status_duedate` ON `Task` (`status`, `dueDate`);
CREATE INDEX `idx_notification_user_created` ON `Notification` (`userId`, `createdAt`);
CREATE INDEX `idx_refreshtoken_user_expires` ON `RefreshToken` (`userId`, `expiresAt`);

-- Set default charset and collation
ALTER DATABASE `employee_task_management` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Display completion message
SELECT 'Database setup completed successfully!' as status;
