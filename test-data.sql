INSERT INTO public.user (id, user_uuid, username, email, password_hash, is_active, created_at, updated_at, last_login, account_status) VALUES
(1, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'adminuser', 'admin@example.com', '$2a$10$HASHEDPASSWORD1', TRUE, '2025-07-01 09:00:00+02', '2025-07-01 09:00:00+02', '2025-07-01 10:00:00+02', 'active'),
(2, 'b1c2d3e4-f5f6-7a8b-9c0d-1e2f3a4b5c6d', 'moderator_sam', 'sam@example.com', '$2a$10$HASHEDPASSWORD2', TRUE, '2025-07-01 09:05:00+02', '2025-07-01 09:05:00+02', '2025-07-01 12:00:00+02', 'active'),
(3, 'c3a4b5c6-d7d8-e9f0-1a2b-3c4d5e6f7a8b', 'john_doe', 'john.doe@test.com', '$2a$10$HASHEDPASSWORD3', TRUE, '2025-06-25 14:00:00+02', '2025-06-25 14:00:00+02', '2025-06-25 14:30:00+02', 'active'),
(4, 'd4e5f6a7-b8c9-d0e1-2f3a-4b5c6d7e8f9a', 'creator_alex', 'alex@manuals.com', '$2a$10$HASHEDPASSWORD5', TRUE, '2025-07-01 09:10:00+02', '2025-07-01 09:10:00+02', '2025-07-01 09:15:00+02', 'active');

INSERT INTO public.language (id, language_code, language_name) VALUES
(1, 'en', 'English'),
(2, 'cs', 'Czech');

INSERT INTO public.device (id, device_uuid, user_id, device_name, last_used_at, is_trusted, biometric_enabled, language_id, device_os, device_version, last_known_ip, created_at, updated_at) VALUES
(1, 'e0e1e2e3-f4f5-a6b7-c8d9-e0f1a2b3c4d5', 1, 'Admin PC Chrome', '2025-07-01 10:15:00+02', TRUE, FALSE, 1, 'Windows', '10.0', '192.168.1.1', '2025-07-01 09:00:00+02', '2025-07-01 09:00:00+02'),
(2, 'a1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6', 3, 'John iPhone', '2025-07-08 14:00:00+02', FALSE, TRUE, 1, 'iOS', '18.0', '203.0.113.45', '2025-06-25 14:00:00+02', '2025-06-25 14:00:00+02');

INSERT INTO public.session (id, user_id, device_id, session_token, login_at, last_active, expires_at, is_active, ip_address) VALUES
(1, 1, 1, 'tok_admin_123', '2025-07-01 10:00:00+02', '2025-07-01 10:15:00+02', '2025-07-02 09:00:00+02', TRUE, '192.168.1.1'),
(2, 3, 2, 'tok_john_ios', '2025-06-25 14:30:00+02', '2025-07-08 14:00:00+02', '2025-07-08 14:00:00+02', TRUE, '203.0.113.45');

INSERT INTO public.file (id, file_uuid, uploader_user_id, file_category, mime_type, file_size_bytes, storage_url, storage_service, storage_identifier, is_public, is_system_generated, is_admin_uploaded, created_at, updated_at) VALUES
(1, 'f0f1f2f3-1111-2222-3333-a0a1a2a3a4a5', 1, 'system_document', 'image/png', 51200, 's3://bucket/sys/logo.png', 'S3', 'sys-logo-1', TRUE, TRUE, TRUE, '2025-07-01 09:00:00+02', '2025-07-01 09:00:00+02'),
(2, 'e1e2e3e4-4444-5555-6666-b1b2b3b4b5b6', 3, 'profile_picture', 'image/jpeg', 204800, 's3://bucket/user/john/pp.jpg', 'S3', 'user-pp-john', FALSE, FALSE, FALSE, '2025-06-25 14:00:00+02', '2025-06-25 14:00:00+02'),
(3, 'd2d3d4d5-7777-8888-9999-c2c3c4c5c6c7', 4, 'user_document', 'application/pdf', 1024000, 'gdrive://user/alex/pattern.pdf', 'GCS', 'alex-pattern-1', FALSE, FALSE, FALSE, '2025-07-01 09:10:00+02', '2025-07-01 09:10:00+02');

INSERT INTO public.user_profile (user_id, first_name, last_name, profile_picture_file_id, date_of_birth, last_active_at, status) VALUES
(1, 'System', 'Admin', NULL, '1980-01-01', '2025-07-01 10:15:00+02', 'online'),
(3, 'John', 'Doe', 2, '1992-03-22', '2025-07-01 11:00:00+02', 'online'),
(2, 'Sam', 'Moderator', NULL, '1990-10-10', '2025-07-01 12:05:00+02', 'online'),
(4, 'Alex', 'Creator', NULL, '1988-08-05', '2025-07-01 09:30:00+02', 'online');

INSERT INTO public.user_setting (user_id, theme, language_id, timezone, email_verified) VALUES
(1, 'light', 1, 'Europe/Prague', TRUE),
(2, 'light', 1, 'Europe/London', TRUE),
(3, 'light', 2, 'America/New_York', TRUE),
(4, 'light', 1, 'Asia/Tokyo', TRUE);

INSERT INTO public.user_consent (user_id, terms_of_service_accepted_at, privacy_policy_accepted_at, marketing_consent_given_at, data_processing_consent_given_at, third_party_data_sharing_consent_given_at) VALUES
(1, '2024-07-01 09:00:00+02', '2024-07-01 09:00:00+02', '2025-01-01 09:00:00+02', '2024-07-01 09:00:00+02', '2024-07-01 09:00:00+02'),
(3, '2025-04-01 09:00:00+02', '2025-04-01 09:00:00+02', NULL, '2025-04-01 09:00:00+02', NULL),
(4, '2025-06-30 09:00:00+02', '2025-06-30 09:00:00+02', '2025-07-01 09:00:00+02', '2025-06-30 09:00:00+02', '2025-07-01 09:00:00+02');

INSERT INTO public.user_notification_preference (user_id, email_new_follower, email_post_likes, email_mentions, email_promotional, push_new_follower, push_post_likes, push_mentions, push_promotional) VALUES
(1, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE),
(3, TRUE, TRUE, TRUE, FALSE, TRUE, TRUE, TRUE, TRUE),
(4, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE);

INSERT INTO public.user_auth (user_id, recovery_email, phone_number, last_password_change) VALUES
(1, 'admin_recovery@example.com', NULL, '2025-07-01 09:00:00+02'),
(3, 'john_recovery@test.com', '+420732555888', '2025-06-25 14:00:00+02'),
(4, 'alex_recovery@manuals.com', NULL, '2025-07-01 09:10:00+02');

INSERT INTO public.user_point (user_id, balance, last_updated_at) VALUES
(1, 99999, '2025-07-01 09:00:00+02'),
(3, 500, '2025-06-25 14:00:00+02'),
(4, 1000, '2025-07-01 09:10:00+02');

INSERT INTO public.user_metadata (user_id, sign_up_ip, last_login_ip, user_agent_info, referral_source) VALUES
(1, '192.168.1.1', '192.168.1.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/100.0.4896.75', 'direct'),
(3, '203.0.113.45', '203.0.113.45', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148', 'google_ad'),
(4, '10.0.0.5', '10.0.0.6', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15', 'internal_signup');

INSERT INTO public.point_transaction (id, user_id, session_id, type, subtype, amount, balance_after_transaction, is_revenue, created_at) VALUES
(1, 3, 2, 'EARN', 'manual_completion', 100, 600, TRUE, '2025-07-01 15:00:00+02'),
(2, 3, 2, 'SPEND', 'purchase', -50, 550, FALSE, '2025-07-01 15:05:00+02'),
(3, 4, NULL, 'EARN', 'login_bonus', 10, 1010, TRUE, '2025-07-01 15:10:00+02');

INSERT INTO public.password_history (id, user_id, password_hash, created_at) VALUES
(1, 3, '$2a$10$OLDHASHEDPASSWORD1', '2024-06-25 14:00:00+02'),
(2, 3, '$2a$10$OLDHASHEDPASSWORD2', '2025-01-25 14:00:00+02'),
(3, 1, '$2a$10$OLDHASHEDPASSWORD3', '2024-12-01 09:00:00+02');

INSERT INTO public.user_activity_log (id, user_id, session_id, event_type, event_description, ip_address, user_agent, created_at) VALUES
(1, 1, 1, 'LOGIN', 'Successful login', '192.168.1.1', 'Admin PC Chrome User Agent', '2025-07-01 10:00:00+02'),
(2, 3, 2, 'MANUAL_VIEW', 'Viewed Beanie Tutorial', '203.0.113.45', 'John iPhone User Agent', '2025-07-01 11:00:00+02'),
(3, NULL, 2, 'LOGOUT', 'User logged out', '203.0.113.45', 'John iPhone User Agent', '2025-07-08 14:00:00+02');

INSERT INTO public.oauth_provider (id, name, created_at) VALUES
(1, 'google', '2025-01-01 00:00:00+02'),
(2, 'facebook', '2025-01-01 00:00:00+02'),
(3, 'github', '2025-01-01 00:00:00+02');

INSERT INTO public.user_oauth_account (user_id, provider_id, provider_user_id, access_token, created_at, updated_at) VALUES
(3, 1, 'john_google_id', 'google_token_1', '2025-06-25 14:00:00+02', '2025-07-01 11:00:00+02'),
(4, 2, 'alex_fb_id', 'facebook_token_1', '2025-07-01 09:10:00+02', '2025-07-01 09:15:00+02'),
(1, 3, 'admin_gh_id', 'github_token_1', '2025-07-01 09:00:00+02', '2025-07-01 10:00:00+02');

INSERT INTO public.user_2fa_method (id, user_id, method, is_enabled, is_primary, secret, created_at, updated_at) VALUES
(1, 1, 'authenticator', TRUE, TRUE, 'TOTP_SECRET_ADMIN', '2025-07-01 09:00:00+02', '2025-07-01 09:00:00+02'),
(2, 3, 'sms', TRUE, TRUE, NULL, '2025-06-25 14:00:00+02', '2025-06-25 14:00:00+02'),
(3, 4, 'email', TRUE, FALSE, NULL, '2025-07-01 09:10:00+02', '2025-07-01 09:10:00+02');

INSERT INTO public.user_2fa_backup_code (id, user_id, batch_id, code_hash, is_used, created_at) VALUES
(1, 1, '99999999-0000-1111-2222-333333333333', 'CODEHASH1', FALSE, '2025-06-01 09:00:00+02'),
(2, 1, '99999999-0000-1111-2222-333333333333', 'CODEHASH2', FALSE, '2025-06-01 09:00:00+02'),
(3, 3, '44444444-5555-6666-7777-888888888888', 'CODEHASH3', TRUE, '2025-06-01 09:00:00+02');

INSERT INTO public.user_login_history (id, user_id, session_id, login_at, ip_address, is_successful) VALUES
(1, 3, 2, '2025-06-25 14:30:00+02', '203.0.113.45', TRUE),
(2, 3, NULL, '2025-07-01 10:59:00+02', '203.0.113.45', FALSE),
(3, 1, 1, '2025-07-01 10:00:00+02', '192.168.1.1', TRUE);

INSERT INTO public.user_2fa_login_log (id, user_id, session_id, attempted_at, is_successful, method_used, ip_address) VALUES
(1, 1, 1, '2025-07-01 10:00:10+02', TRUE, 'authenticator', '192.168.1.1'),
(2, 3, 2, '2025-06-25 14:30:10+02', TRUE, 'sms', '203.0.113.45'),
(3, 4, NULL, '2025-07-01 09:14:00+02', FALSE, 'email', '10.0.0.6');

INSERT INTO public.follower (follower_user_id, followed_user_id, status, created_at, updated_at) VALUES
(3, 4, 'approved', '2025-06-26 10:00:00+02', '2025-06-26 10:00:00+02'),
(1, 3, 'approved', '2025-07-01 10:00:00+02', '2025-07-01 10:00:00+02'),
(4, 1, 'pending', '2025-07-01 10:00:00+02', '2025-07-01 10:00:00+02');

INSERT INTO public.user_report (id, reporter_user_id, reported_user_id, reason, status, moderator_user_id, attached_file_id, created_at) VALUES
(1, 3, 4, 'Spamming comments', 'pending', NULL, 3, '2025-07-01 13:40:00+02'),
(2, 1, 3, 'Inappropriate profile picture', 'approved', 2, NULL, '2025-07-01 13:45:00+02'),
(3, 3, NULL, 'General platform bug', 'rejected', 2, NULL, '2025-07-01 13:50:00+02');

INSERT INTO public.user_file_access (user_id, file_id) VALUES
(1, 3),
(3, 3),
(4, 1);

INSERT INTO public.user_webauthn_credential (id, user_id, credential_id, public_key, credential_name, created_at) VALUES
(1, 1, E'\\x44534e3111', E'\\x046f5c87', 'Admin FIDO Key', '2025-07-01 10:00:00+02'),
(2, 3, E'\\x5254593222', E'\\x049e7b2a', 'John Laptop', '2025-06-25 14:00:00+02'),
(3, 3, E'\\x9923883333', E'\\x041a2b3c', 'John Phone', '2025-06-25 14:05:00+02');

INSERT INTO public.news (id, translation_group_id, language_id, title, body, status, author_user_id, created_at, updated_at) VALUES
(1, '66666666-7777-8888-9999-aaaaaaaaaaaa', 1, 'New Feature Alert', 'We have released a new tool!', 'published', 1, '2025-07-01 14:00:00+02', '2025-07-01 14:05:00+02');

INSERT INTO public.notification (id, translation_group_id, language_id, audience_type, user_id, title, notification_message, notification_type, is_read, created_at) VALUES
(1, '90909090-1111-2222-3333-444444444444', 1, 'user', 3, 'Order Shipped!', 'Your order ORD-2025-001 has shipped.', 'success', FALSE, '2025-07-01 20:00:00+02'),
(2, '80808080-1111-2222-3333-444444444444', 1, 'all', NULL, 'Server Downtime', 'Scheduled maintenance tonight.', 'warning', FALSE, '2025-07-01 18:00:00+02'),
(3, '70707070-1111-2222-3333-444444444444', 2, 'user', 4, 'Error de Pago', 'Su último pago falló.', 'error', FALSE, '2025-07-01 19:15:00+02');

INSERT INTO public.role (id, name, created_at) VALUES
(1, 'admin', '2025-01-01 00:00:00+02'),
(2, 'moderator', '2025-01-01 00:00:00+02'),
(3, 'basic_user', '2025-01-01 00:00:00+02'),
(4, 'content_creator', '2025-01-01 00:00:00+02'),
(5, 'premium_user', '2025-01-01 00:00:00+02');

INSERT INTO public.permission (id, name, created_at) VALUES
(1, 'read', '2025-01-01 00:00:00+02'),
(2, 'write', '2025-01-01 00:00:00+02'),
(3, 'moderate', '2025-01-01 00:00:00+02');

INSERT INTO public.role_permission (role_id, permission_id) VALUES
(1, 1),
(1, 2),
(2, 3);

INSERT INTO public.user_role (user_id, role_id, changed_by_user_id, created_at) VALUES
(1, 1, 1, '2025-07-01 09:00:00+02'),
(3, 3, 1, '2025-07-01 09:05:00+02'),
(4, 4, 1, '2025-07-01 09:10:00+02');

INSERT INTO public.forum (id, forum_uuid, name, description, author_user_id, created_at, updated_at) VALUES
(1, 'ff111111-2222-3333-4444-555555555555', 'General Chat', 'Discussions about everything.', 1, '2025-07-01 12:00:00+02', '2025-07-01 12:00:00+02'),
(2, 'ee222222-3333-4444-5555-666666666666', 'Troubleshooting', 'Get help with your projects.', 4, '2025-07-01 12:05:00+02', '2025-07-01 12:05:00+02'),
(3, 'dd333333-4444-5555-6666-777777777777', 'Pattern Releases', 'Showcase and announcements.', 1, '2025-07-01 12:10:00+02', '2025-07-01 12:10:00+02');

INSERT INTO public.thread (id, thread_uuid, forum_id, author_user_id, title, body, created_at, updated_at) VALUES
(1, '11111111-aaaa-bbbb-cccc-dddddddddddd', 1, 3, 'Hello world!', 'Just started using the app.', '2025-07-01 12:30:00+02', '2025-07-01 12:30:00+02'),
(2, '22222222-aaaa-bbbb-cccc-dddddddddddd', 2, 4, 'Need help with tension', 'My yarn keeps getting loose.', '2025-07-01 12:35:00+02', '2025-07-01 12:35:00+02'),
(3, '33333333-aaaa-bbbb-cccc-dddddddddddd', 3, 1, 'Official Release: New Blanket', 'Check out the new manual.', '2025-07-01 12:40:00+02', '2025-07-01 12:40:00+02');

INSERT INTO public.support_ticket (id, ticket_uuid, user_id, session_id, title, description, status, priority, assigned_to_user_id, created_at, updated_at) VALUES
(1, '11111111-aaaa-bbbb-cccc-dddddddddddd', 3, NULL, 'Cannot access premium manual', 'The advanced amigurumi manual link is broken.', 'open', 'high', 2, '2025-07-01 13:50:00+02', '2025-07-01 13:50:00+02'),
(2, '22222222-aaaa-bbbb-cccc-dddddddddddd', 4, NULL, 'Question about points', 'My point balance seems wrong.', 'closed', 'medium', 2, '2025-07-01 13:55:00+02', '2025-07-01 14:00:00+02'),
(3, '33333333-aaaa-bbbb-cccc-dddddddddddd', NULL, 2, 'Guest checkout error', 'I cannot complete my purchase.', 'awaiting_reply', 'critical', NULL, '2025-07-01 13:58:00+02', '2025-07-01 13:58:00+02');

INSERT INTO public.tool (id, translation_group_id, language_id, creator_user_id, title, description, status, created_at, updated_at) VALUES
(1, '77777777-8888-9999-aaaa-bbbbbbbbbbbb', 1, 1, 'Yarn Calculator', 'Calculates yardage based on project size.', 'published', '2025-07-01 11:00:00+02', '2025-07-01 11:00:00+02'),
(2, '88888888-9999-aaaa-bbbb-cccccccccccc', 1, 4, 'Color Picker', 'Suggests complementary colors.', 'published', '2025-07-01 11:05:00+02', '2025-07-01 11:05:00+02'),
(3, '99999999-aaaa-bbbb-cccc-dddddddddddd', 2, 1, 'Medidor de Ganchos', 'Convierte tamaños de ganchos.', 'draft', '2025-07-01 11:10:00+02', '2025-07-01 11:10:00+02');

INSERT INTO public.dictionary (id, translation_group_id, language_id, creator_user_id, title, abbreviation, status, image_file_id, created_at, updated_at) VALUES
(1, '00000000-1111-2222-3333-444444444444', 1, 4, 'Crochet Terms', 'CT', 'published', 1, '2025-07-01 11:15:00+02', '2025-07-01 11:15:00+02'),
(2, '55555555-6666-7777-8888-999999999999', 1, 1, 'Knitting Stitches', 'KS', 'published', NULL, '2025-07-01 11:20:00+02', '2025-07-01 11:20:00+02'),
(3, 'aaaaaaa0-bbbb-cccc-dddd-eeeeeeeeeeee', 2, 4, 'Términos Básicos', 'TB', 'draft', NULL, '2025-07-01 11:25:00+02', '2025-07-01 11:25:00+02');

INSERT INTO public.education_mode (id, translation_group_id, language_id, creator_user_id, title, description, tool, status, points, created_at, updated_at) VALUES
(1, '01010101-1111-2222-3333-444444444444', 1, 4, 'First Crochet Stitches', 'Learn the basics.', 'Hook', 'published', 50, '2025-07-01 11:30:00+02', '2025-07-01 11:30:00+02'),
(2, '02020202-1111-2222-3333-444444444444', 1, 4, 'Advanced Tool Use', 'How to use the calculator.', 'Calculator', 'published', 100, '2025-07-01 11:35:00+02', '2025-07-01 11:35:00+02'),
(3, '03030303-1111-2222-3333-444444444444', 2, 1, 'Modo de Aprendizaje', 'Aprendizaje en español', 'Any', 'draft', 0, '2025-07-01 11:40:00+02', '2025-07-01 11:40:00+02');

INSERT INTO public.education_step (id, translation_group_id, language_id, education_mode_id, description, video_url, image_file_id, tool, step_order, created_at, updated_at) VALUES
(1, '11121314-1111-2222-3333-444444444444', 1, 1, 'Watch video on Chain Stitch.', 'https://video.com/chain_stitch', NULL, 'Hook', 1, '2025-07-01 11:45:00+02', '2025-07-01 11:45:00+02'),
(2, '21222324-1111-2222-3333-444444444444', 1, 1, 'Practice Single Crochet.', 'https://video.com/single_crochet', 2, 'Hook', 2, '2025-07-01 11:50:00+02', '2025-07-01 11:50:00+02'),
(3, '31323334-1111-2222-3333-444444444444', 2, 1, 'Paso final de práctica.', 'https://video.com/final_step_es', NULL, 'Hook', 3, '2025-07-01 11:55:00+02', '2025-07-01 11:55:00+02');

INSERT INTO public.manual (id, translation_group_id, language_id, creator_user_id, title, manual_difficulty, price, manual_form, manual_type, status, created_at, updated_at) VALUES
(1, '11111111-2222-3333-4444-555555555555', 1, 4, 'Easy Beanie Tutorial', 'easy', 0, 'write', 'how_to', 'public', '2025-07-01 12:00:00+02', '2025-07-01 12:00:00+02'),
(2, '22222222-3333-4444-5555-666666666666', 1, 4, 'Advanced Amigurumi', 'hard', 15, 'draw', 'assembly', 'premium', '2025-07-01 12:05:00+02', '2025-07-01 12:05:00+02');

INSERT INTO public.manual_step (id, translation_group_id, language_id, manual_id, title, description, image_file_id, step_order, created_at, updated_at) VALUES
(1, 'f0e1d2c3-1111-2222-3333-a1b2c3d4e5f6', 1, 1, 'The Magic Ring Start', 'Create a slip knot and chain 3. Join with a slip stitch to form the magic ring.', NULL, 1, '2025-07-01 09:15:00+02', '2025-07-01 09:15:00+02'),
(2, 'f0e1d2c3-1111-2222-3333-a1b2c3d4e5f6', 1, 1, 'Increase Rounds', 'Single crochet 6 stitches into the ring. For the next round, increase in every stitch. (Video: https://video.com/beanie_inc)', NULL, 2, '2025-07-01 09:16:00+02', '2025-07-01 09:16:00+02'),
(3, 'f0e1d2c3-1111-2222-3333-a1b2c3d4e5f6', 1, 1, 'Straight Body', 'Continue single crocheting without increasing until the desired length is reached (about 8 inches).', NULL, 3, '2025-07-01 09:17:00+02', '2025-07-01 09:17:00+02'),
(4, 'e1d2c3b4-4444-5555-6666-b2c3d4e5f6a1', 1, 2, 'Foundation and Wire Frame', 'Assemble the internal wire structure as detailed in the attached PDF. This provides stability.', 3, 1, '2025-07-01 09:20:00+02', '2025-07-01 09:20:00+02'),
(5, 'e1d2c3b4-4444-5555-6666-b2c3d4e5f6a1', 1, 2, 'Creating the Texture', 'Use the loop stitch technique to achieve a fuzzy texture on the body sections. (Video: https://video.com/amigurumi_texture)', 1, 2, '2025-07-01 09:21:00+02', '2025-07-01 09:21:00+02');

INSERT INTO public.product_type (id, translation_group_id, language_id, name, created_at, updated_at) VALUES
(1, '1a2b3c4d-1234-5678-90ab-cdef01234567', 1, 'Yarn', '2025-07-01 12:10:00+02', '2025-07-01 12:10:00+02');

INSERT INTO public.product (id, translation_group_id, language_id, title, description, price, product_type_id, created_at, updated_at) VALUES
(1, '33333333-4444-5555-6666-777777777777', 1, 'Wool Blend Yarn', 'Soft yarn.', 9.99, 1, '2025-07-01 12:15:00+02', '2025-07-01 12:15:00+02'),
(2, '44444444-5555-6666-7777-888888888888', 1, 'Ergonomic Crochet Hook Set', 'Set of 5 hooks.', 19.50, 1, '2025-07-01 12:20:00+02', '2025-07-01 12:20:00+02'),
(3, '55555555-6666-7777-8888-999999999999', 1, 'Beginner Scarf Pattern', 'Digital pattern.', 4.99, 1, '2025-07-01 12:25:00+02', '2025-07-01 12:25:00+02');

INSERT INTO public.comment (id, comment_uuid, parent_comment_id, thread_id, manual_id, education_mode_id, product_id, author_user_id, body, created_at, updated_at) VALUES
(1, 'c0000001-1111-2222-3333-444444444444', NULL, 1, NULL, NULL, NULL, 1, 'Welcome to the community!', '2025-07-01 13:00:00+02', '2025-07-01 13:00:00+02'),
(2, 'c0000002-1111-2222-3333-444444444444', NULL, NULL, 1, NULL, NULL, 3, 'Very easy to follow!', '2025-07-01 13:05:00+02', '2025-07-01 13:05:00+02'),
(3, 'c0000003-1111-2222-3333-444444444444', NULL, NULL, NULL, 1, NULL, 4, 'Great introductory lesson.', '2025-07-01 13:10:00+02', '2025-07-01 13:10:00+02'),
(4, 'c0000004-1111-2222-3333-444444444444', NULL, NULL, NULL, NULL, 1, 3, 'Softest yarn ever.', '2025-07-01 13:15:00+02', '2025-07-01 13:15:00+02'),
(5, 'c0000005-1111-2222-3333-444444444444', 1, 1, NULL, NULL, NULL, 3, 'Thanks for the welcome!', '2025-07-01 13:20:00+02', '2025-07-01 13:20:00+02');

INSERT INTO public.status_history (id, support_ticket_id, news_id, user_id, old_status, new_status, changed_by_user_id, change_reason, created_at) VALUES
(1, 1, NULL, NULL, 'open', 'in_progress', 2, 'Assigned to self', '2025-07-01 14:00:00+02'),
(2, NULL, 1, NULL, 'draft', 'published', 1, NULL, '2025-07-01 14:05:00+02'),
(3, NULL, NULL, 3, 'active', 'active', 1, NULL, '2025-07-01 14:10:00+02');

INSERT INTO public.rating (id, user_id, manual_id, education_mode_id, product_id, rating_value, created_at, updated_at) VALUES
(1, 3, 1, NULL, NULL, 5, '2025-07-01 13:20:00+02', '2025-07-01 13:20:00+02'),
(2, 1, NULL, 1, NULL, 4, '2025-07-01 13:25:00+02', '2025-07-01 13:25:00+02'),
(3, 3, NULL, NULL, 1, 5, '2025-07-01 13:30:00+02', '2025-07-01 13:30:00+02');

INSERT INTO public.entity_file (id, file_id, user_report_id, tool_id, product_id, author_user_id, created_at, updated_at) VALUES
(1, 3, 1, NULL, NULL, 3, '2025-07-01 13:40:00+02', '2025-07-01 13:40:00+02'),
(2, 1, NULL, 1, NULL, 1, '2025-07-01 11:00:00+02', '2025-07-01 11:00:00+02'),
(3, 1, NULL, NULL, 1, 1, '2025-07-01 12:15:00+02', '2025-07-01 12:15:00+02');

INSERT INTO public.reaction (id, user_id, comment_id, reaction_type, created_at) VALUES
(1, 3, 1, 'like', '2025-07-01 13:25:00+02'),
(2, 4, 1, 'love', '2025-07-01 13:30:00+02'),
(3, 1, 3, 'like', '2025-07-01 13:35:00+02');

INSERT INTO public.progress_tracking (id, user_id, manual_id, education_mode_id, current_step_order, is_finished, started_at, last_updated_at) VALUES
(1, 3, 1, NULL, 2, FALSE, '2025-07-01 11:00:00+02', '2025-07-01 11:05:00+02'),
(2, 1, NULL, 1, 3, TRUE, '2025-07-01 10:00:00+02', '2025-07-01 10:10:00+02'),
(3, 4, NULL, 1, 1, FALSE, '2025-07-01 09:10:00+02', '2025-07-01 09:10:00+02');

INSERT INTO public.user_manual_interaction (id, user_id, manual_id, interaction_type, created_at) VALUES
(1, 3, 1, 'view', '2025-07-01 11:00:00+02'),
(2, 3, 1, 'save', '2025-07-01 11:05:00+02'),
(3, 4, 1, 'like', '2025-07-01 11:10:00+02');

INSERT INTO public.theme (id, translation_group_id, language_id, name) VALUES
(1, 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff', 1, 'Modern'),
(2, '1a1b1c1d-1e1f-1a1b-1c1d-1e1f1a1b1c1d', 1, 'Rustic'),
(3, '2a2b2c2d-2e2f-2a2b-2c2d-2e2f2a2b2c2d', 2, 'Clásico');

INSERT INTO public.category (id, translation_group_id, language_id, name) VALUES
(1, '3a3b3c3d-3e3f-3a3b-3c3d-3e3f3a3b3c3d', 1, 'Crochet'),
(2, '4a4b4c4d-4e4f-4a4b-4c4d-4e4f4a4b4c4d', 1, 'Knitting'),
(3, '5a5b5c5d-5e5f-5a5b-5c5d-5e5f5a5b5c5d', 1, 'Home Repair');

INSERT INTO public.manual_product_theme (manual_id, product_id, theme_id) VALUES
(1, NULL, 1),
(2, NULL, 2),
(NULL, 1, 2);

INSERT INTO public.manual_product_category (manual_id, product_id, category_id) VALUES
(1, NULL, 1),
(2, NULL, 1),
(NULL, 1, 2);

INSERT INTO public.inventory (id, product_id, charge_type, quantity_change, reason, changed_at) VALUES
(1, 1, 'initial_stock', 500, 'Initial load', '2025-07-01 00:00:00+02'),
(2, 1, 'sale', -5, 'Order #123', '2025-07-01 16:00:00+02'),
(3, 2, 'restock', 100, 'Monthly delivery', '2025-07-01 00:00:00+02');

INSERT INTO public.cart (id, cart_uuid, user_id, created_at, updated_at) VALUES
(1, 'cc111111-2222-3333-4444-555555555555', 3, '2025-07-01 17:00:00+02', '2025-07-01 17:00:00+02'),
(2, 'cc222222-3333-4444-5555-666666666666', 4, '2025-07-01 17:05:00+02', '2025-07-01 17:05:00+02'),
(3, 'cc333333-4444-5555-6666-777777777777', 1, '2025-07-01 17:10:00+02', '2025-07-01 17:10:00+02');

INSERT INTO public.cart_item (id, cart_id, product_id, quantity, created_at) VALUES
(1, 1, 1, 2, '2025-07-01 17:00:00+02'),
(2, 1, 2, 1, '2025-07-01 17:01:00+02'),
(3, 2, 1, 5, '2025-07-01 17:05:00+02');

INSERT INTO public.saved_cart (user_id, name, created_at) VALUES
(3, 'Weekend Project Cart', '2025-07-01 17:30:00+02'),
(4, 'Yarn Stockup', '2025-07-01 17:35:00+02'),
(3, 'Gift Ideas', '2025-07-01 17:40:00+02');

INSERT INTO public.wishlist (user_id, product_id) VALUES
(3, 3),
(4, 1),
(4, 2);

INSERT INTO public.order (id, order_uuid, user_id, cart_id, total_price, order_status, order_number, guest_email, created_at, updated_at) VALUES
(1, 'cc111111-2222-3333-4444-555555555555', 3, 1, 29.48, 'shipped', 'ORD-2025-001', NULL, '2025-07-01 19:00:00+02', '2025-07-01 19:00:00+02'),
(2, 'cc222222-3333-4444-5555-666666666666', 4, 2, 49.95, 'processing', 'ORD-2025-002', NULL, '2025-07-01 19:05:00+02', '2025-07-01 19:05:00+02'),
(3, 'cc333333-4444-5555-6666-777777777777', NULL, NULL, 15.00, 'pending', 'ORD-2025-003', 'guest@checkout.com', '2025-07-01 19:10:00+02', '2025-07-01 19:10:00+02');

INSERT INTO public.order_item (id, order_id, product_id, quantity, unit_price, total_price, created_at) VALUES
(1, 1, 1, 2, 9.99, 19.98, '2025-07-01 19:00:00+02'),
(2, 1, 2, 1, 9.50, 9.50, '2025-07-01 19:00:00+02'),
(3, 2, 1, 5, 9.99, 49.95, '2025-07-01 19:05:00+02');

INSERT INTO public.payment (id, payment_uuid, payment_method, payment_status, amount_paid, created_at, transaction_id, order_id) VALUES
(1, 'cc111111-2222-3333-4444-555555555555', 'Credit Card', 'completed', 29.48, '2025-07-01 19:01:00+02', 'TXN-001', 1),
(2, 'cc222222-3333-4444-5555-666666666666', 'PayPal', 'pending', 49.95, '2025-07-01 19:06:00+02', 'TXN-002', 2),
(3, 'cc333333-4444-5555-6666-777777777777', 'Bitcoin', 'failed', 15.00, '2025-07-01 19:11:00+02', 'TXN-003', 3);

INSERT INTO public.discount_code (id, code, discount_type, discount_value, max_uses, valid_from, valid_until) VALUES
(1, 'WELCOME10', 'percentage', 10.00, 100, '2025-06-01 00:00:00+02', '2026-07-01 00:00:00+02'),
(2, 'FREESHIP', 'fixed', 5.00, NULL, '2024-07-01 00:00:00+02', NULL),
(3, 'SALE50', 'percentage', 50.00, 1, '2025-07-01 20:00:00+02', '2025-07-02 20:00:00+02');

INSERT INTO public.order_discount (id, discount_applied, discount_id, order_id) VALUES
(1, 2.95, 1, 1),
(2, 5.00, 2, 1),
(3, 24.98, 3, 2);

INSERT INTO public.refund (id, reason, refund_status, order_id) VALUES
(1, 'Product out of stock', 'completed', 1),
(2, 'Customer changed mind', 'pending', 2),
(3, 'Shipping damage', 'failed', 3);
