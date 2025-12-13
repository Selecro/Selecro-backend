import {Application} from '@loopback/core';
import cron from 'node-cron';
import {RemoteConfigService} from '../providers';
import {
  CommentRepository,
  EntityFileRepository,
  EventRepository,
  FileRepository,
  GlobalReviewRepository,
  NewsRepository,
  RatingRepository,
  ReactionRepository,
  SupportTicketRepository,
  User2FaLoginLogRepository,
  UserActivityLogRepository,
  UserLoginHistoryRepository,
  UserReportRepository
} from '../repositories';

type SoftDeleteRepository =
  CommentRepository | EntityFileRepository | EventRepository | FileRepository |
  GlobalReviewRepository | NewsRepository | RatingRepository | ReactionRepository |
  SupportTicketRepository | UserActivityLogRepository | UserLoginHistoryRepository |
  User2FaLoginLogRepository | UserReportRepository;


export function startHardDeleteJob(app: Application) {
  cron.schedule('0 2 * * *', async () => {
    console.log('Starting hard-delete job...');
    const remoteConfigService = await app.get<RemoteConfigService>('services.RemoteConfigService');

    let config: {retention_period_days: number};
    try {
      config = await remoteConfigService.getConfigValues();
    } catch (e) {
      console.error('Failed to retrieve remote config for hard-delete job:', e);
      return;
    }

    const RETENTION_PERIOD_DAYS = config.retention_period_days || 30;

    const now = new Date();
    const hardDeleteThreshold = new Date(now.getTime() - RETENTION_PERIOD_DAYS * 24 * 60 * 60 * 1000);

    console.log(`Hard delete threshold: ${hardDeleteThreshold.toISOString()}`);
    console.log(`Retention period: ${RETENTION_PERIOD_DAYS} days.`);

    try {
      const fileRepo = await app.get<FileRepository>('repositories.FileRepository');
      const newsRepo = await app.get<NewsRepository>('repositories.NewsRepository');
      const supportTicketRepo = await app.get<SupportTicketRepository>('repositories.SupportTicketRepository');
      const commentRepo = await app.get<CommentRepository>('repositories.CommentRepository');
      const ratingRepo = await app.get<RatingRepository>('repositories.RatingRepository');
      const entityFileRepo = await app.get<EntityFileRepository>('repositories.EntityFileRepository');
      const reactionRepo = await app.get<ReactionRepository>('repositories.ReactionRepository');
      const globalReviewRepo = await app.get<GlobalReviewRepository>('repositories.GlobalReviewRepository');
      const eventRepo = await app.get<EventRepository>('repositories.EventRepository');
      const userActivityLogRepo = await app.get<UserActivityLogRepository>('repositories.UserActivityLogRepository');
      const userLoginHistoryRepo = await app.get<UserLoginHistoryRepository>('repositories.UserLoginHistoryRepository');
      const user2FaLoginLogRepo = await app.get<User2FaLoginLogRepository>('repositories.User2FaLoginLogRepository');
      const userReportRepo = await app.get<UserReportRepository>('repositories.UserReportRepository');

      const repositories: SoftDeleteRepository[] = [
        fileRepo,
        newsRepo,
        supportTicketRepo,
        commentRepo,
        ratingRepo,
        entityFileRepo,
        reactionRepo,
        globalReviewRepo,
        eventRepo,
        userActivityLogRepo,
        userLoginHistoryRepo,
        user2FaLoginLogRepo,
        userReportRepo,
      ];

      for (const repo of repositories) {
        console.log(`Processing hard-delete for: ${repo.constructor.name}`);
        await repo.deleteAll({
          is_deleted: true,
          deleted_at: {lt: hardDeleteThreshold},
        });
      }
      console.log('Hard-delete job completed successfully.');

    } catch (error) {
      console.error('Error during hard-delete job:', error);
    }
  });
}
