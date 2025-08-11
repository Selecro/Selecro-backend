import {Application} from '@loopback/core';
import cron from 'node-cron';
import {
  BadgeRepository,
  CommentRepository,
  DictionaryRepository,
  EducationModeRepository,
  EducationStepRepository,
  FileRepository,
  ManualProgressRepository,
  ManualPurchaseRepository,
  ManualRepository,
  ManualStepRepository,
  NewsRepository,
  NotificationRepository,
  PermissionRepository,
  RoleRepository,
  ToolRepository,
  UserManualInteractionRepository,
} from '../repositories';

const RETENTION_PERIOD_DAYS = 30;

export function startHardDeleteJob(app: Application) {
  cron.schedule('0 2 * * *', async () => {
    const now = new Date();
    const hardDeleteThreshold = new Date(now.getTime() - RETENTION_PERIOD_DAYS * 24 * 60 * 60 * 1000);

    try {
      const fileRepo = await app.get<FileRepository>('repositories.FileRepository');
      const roleRepo = await app.get<RoleRepository>('repositories.RoleRepository');
      const permissionRepo = await app.get<PermissionRepository>('repositories.PermissionRepository');
      const badgeRepo = await app.get<BadgeRepository>('repositories.BadgeRepository');
      const notificationRepo = await app.get<NotificationRepository>('repositories.NotificationRepository');
      const newsRepo = await app.get<NewsRepository>('repositories.NewsRepository');
      const educationModeRepo = await app.get<EducationModeRepository>('repositories.EducationModeRepository');
      const toolRepo = await app.get<ToolRepository>('repositories.ToolRepository');
      const educationStepRepo = await app.get<EducationStepRepository>('repositories.EducationStepRepository');
      const dictionaryRepo = await app.get<DictionaryRepository>('repositories.DictionaryRepository');
      const manualRepo = await app.get<ManualRepository>('repositories.ManualRepository');
      const manualStepRepo = await app.get<ManualStepRepository>('repositories.ManualStepRepository');
      const manualProgressRepo = await app.get<ManualProgressRepository>('repositories.ManualProgressRepository');
      const manualPurchaseRepo = await app.get<ManualPurchaseRepository>('repositories.ManualPurchaseRepository');
      const userManualInteractionRepo = await app.get<UserManualInteractionRepository>('repositories.UserManualInteractionRepository');
      const commentRepo = await app.get<CommentRepository>('repositories.CommentRepository');

      const repositories = [
        fileRepo,
        roleRepo,
        permissionRepo,
        badgeRepo,
        notificationRepo,
        newsRepo,
        educationModeRepo,
        toolRepo,
        educationStepRepo,
        dictionaryRepo,
        manualRepo,
        manualStepRepo,
        manualProgressRepo,
        manualPurchaseRepo,
        userManualInteractionRepo,
        commentRepo,
      ];

      for (const repo of repositories) {
        await repo.deleteAll({
          deleted: true,
          deletedAt: {lt: hardDeleteThreshold},
        });
      }

    } catch (error) {
      console.error('Error during hard-delete job:', error);
    }
  });
}
