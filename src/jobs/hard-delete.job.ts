import {Application} from '@loopback/core';
import cron from 'node-cron';
import {RemoteConfigService} from '../providers';
import {
  CartRepository,
  CommentRepository,
  DictionaryRepository,
  EducationModeRepository,
  EntityFileRepository,
  FileRepository,
  ForumRepository,
  ManualRepository,
  NewsRepository,
  PointTransactionRepository,
  ProductRepository,
  RatingRepository,
  ReactionRepository,
  SavedCartRepository,
  SupportTicketRepository,
  ThreadRepository,
  ToolRepository,
  User2FaLoginLogRepository,
  UserActivityLogRepository,
  UserLoginHistoryRepository,
  UserReportRepository,
  WishlistRepository,
} from '../repositories';

type SoftDeleteRepository =
  | CommentRepository
  | EntityFileRepository
  | FileRepository
  | NewsRepository
  | RatingRepository
  | ReactionRepository
  | SupportTicketRepository
  | UserActivityLogRepository
  | UserLoginHistoryRepository
  | User2FaLoginLogRepository
  | UserReportRepository
  | PointTransactionRepository
  | ForumRepository
  | ThreadRepository
  | ToolRepository
  | DictionaryRepository
  | EducationModeRepository
  | ManualRepository
  | ProductRepository
  | CartRepository
  | SavedCartRepository
  | WishlistRepository;

export function startHardDeleteJob(app: Application) {
  cron.schedule('0 2 * * *', async () => {
    console.log('Starting hard-delete job...');
    const remoteConfigService = await app.get<RemoteConfigService>(
      'services.RemoteConfigService',
    );

    let config: {retentionPeriodDays: number};
    try {
      config = await remoteConfigService.getConfigValues();
    } catch (e) {
      console.error('Failed to retrieve remote config for hard-delete job:', e);
      return;
    }

    const RETENTION_PERIOD_DAYS = config.retentionPeriodDays || 30;

    const now = new Date();
    const hardDeleteThreshold = new Date(
      now.getTime() - RETENTION_PERIOD_DAYS * 24 * 60 * 60 * 1000,
    );

    console.log(`Hard delete threshold: ${hardDeleteThreshold.toISOString()}`);
    console.log(`Retention period: ${RETENTION_PERIOD_DAYS} days.`);

    try {
      const fileRepo = await app.get<FileRepository>(
        'repositories.FileRepository',
      );
      const newsRepo = await app.get<NewsRepository>(
        'repositories.NewsRepository',
      );
      const supportTicketRepo = await app.get<SupportTicketRepository>(
        'repositories.SupportTicketRepository',
      );
      const commentRepo = await app.get<CommentRepository>(
        'repositories.CommentRepository',
      );
      const ratingRepo = await app.get<RatingRepository>(
        'repositories.RatingRepository',
      );
      const entityFileRepo = await app.get<EntityFileRepository>(
        'repositories.EntityFileRepository',
      );
      const reactionRepo = await app.get<ReactionRepository>(
        'repositories.ReactionRepository',
      );
      const userActivityLogRepo = await app.get<UserActivityLogRepository>(
        'repositories.UserActivityLogRepository',
      );
      const userLoginHistoryRepo = await app.get<UserLoginHistoryRepository>(
        'repositories.UserLoginHistoryRepository',
      );
      const user2FaLoginLogRepo = await app.get<User2FaLoginLogRepository>(
        'repositories.User2FaLoginLogRepository',
      );
      const userReportRepo = await app.get<UserReportRepository>(
        'repositories.UserReportRepository',
      );
      const pointTransactionRepo = await app.get<PointTransactionRepository>(
        'repositories.PointTransactionRepository',
      );
      const forumRepo = await app.get<ForumRepository>(
        'repositories.ForumRepository',
      );
      const threadRepo = await app.get<ThreadRepository>(
        'repositories.ThreadRepository',
      );
      const toolRepo = await app.get<ToolRepository>(
        'repositories.ToolRepository',
      );
      const dictionaryRepo = await app.get<DictionaryRepository>(
        'repositories.DictionaryRepository',
      );
      const educationModeRepo = await app.get<EducationModeRepository>(
        'repositories.EducationModeRepository',
      );
      const manualRepo = await app.get<ManualRepository>(
        'repositories.ManualRepository',
      );
      const productRepo = await app.get<ProductRepository>(
        'repositories.ProductRepository',
      );
      const cartRepo = await app.get<CartRepository>(
        'repositories.CartRepository',
      );
      const savedCartRepo = await app.get<SavedCartRepository>(
        'repositories.SavedCartRepository',
      );
      const wishlistRepo = await app.get<WishlistRepository>(
        'repositories.WishlistRepository',
      );

      const repositories: SoftDeleteRepository[] = [
        fileRepo,
        newsRepo,
        supportTicketRepo,
        commentRepo,
        ratingRepo,
        entityFileRepo,
        reactionRepo,
        userActivityLogRepo,
        userLoginHistoryRepo,
        user2FaLoginLogRepo,
        userReportRepo,
        pointTransactionRepo,
        forumRepo,
        threadRepo,
        toolRepo,
        dictionaryRepo,
        educationModeRepo,
        manualRepo,
        productRepo,
        cartRepo,
        savedCartRepo,
        wishlistRepo,
      ];

      for (const repo of repositories) {
        console.log(`Processing hard-delete for: ${repo.constructor.name}`);
        await repo.deleteAll({
          isDeleted: true,
          deletedAt: {lt: hardDeleteThreshold},
        });
      }
      console.log('Hard-delete job completed successfully.');
    } catch (error) {
      console.error('Error during hard-delete job:', error);
    }
  });
}
