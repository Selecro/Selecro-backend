INSERT INTO public.user (username, email, phone_number, password_hash, account_status, client_since) VALUES
('johndoe', 'john.doe@example.com', '123-456-7890', 'hashed_pass_1', 'active', '2023-01-15 10:00:00+00'),
('alice_smith', 'alice.smith@test.org', '987-654-3210', 'hashed_pass_2', 'suspended', '2023-03-20 14:30:00+00'),
('sysadmin', 'admin@sys.com', '555-123-4567', 'hashed_pass_3', 'active', '2022-11-01 08:00:00+00'),
('reporterguy', 'report@example.com', '555-999-8888', 'hashed_pass_4', 'active', '2023-05-10 11:15:00+00'),
('moderator', 'mod@sys.com', '555-777-6666', 'hashed_pass_5', 'active', '2023-02-01 09:00:00+00');

INSERT INTO public.language (language_code, language_name) VALUES
('en_US', 'English (United States)'),
('es_ES', 'Spanish (Spain)'),
('fr_FR', 'French (France)');

INSERT INTO public.file (uploader_user_id, file_category, mime_type, file_size_bytes, file_checksum, storage_url, storage_service, storage_identifier, is_public, is_system_generated) VALUES
(1, 'profile_picture', 'image/jpeg', 150000, 'abc123def456', 'https://storage.com/johndoe/profile1.jpg', 'S3', 'johndoe/profile1.jpg', TRUE, FALSE),
(3, 'system_document', 'application/pdf', 5000000, 'xyz789uvw012', 'https://storage.com/system/policy_v2.pdf', 'GCP', 'system/policy_v2.pdf', TRUE, TRUE),
(2, 'user_document', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 80000, 'lmn456opq789', 'https://storage.com/alice/doc_proof.docx', 'Azure', 'alice/doc_proof.docx', FALSE, FALSE);

INSERT INTO public.device (user_id, device_name, language_id, device_os, device_version) VALUES
(1, 'John-iPhone-15', 1, 'iOS', '17.3.1'),
(1, 'John-Macbook-Pro', 1, 'macOS', '14.0'),
(2, 'Alice-Galaxy-S23', 2, 'Android', '14'),
(3, 'Admin-Workstation', 1, 'Windows', '11');

INSERT INTO public.session (user_id, device_id, session_token, expires_at, ip_address, country, user_agent) VALUES
(1, 1, 'token_john_iphone_12345', NOW() + INTERVAL '1 day', '203.0.113.1', 'USA', 'Mozilla/5.0 (iPhone)'),
(1, 2, 'token_john_mac_67890', NOW() + INTERVAL '30 minutes', '203.0.113.1', 'USA', 'Mozilla/5.0 (Macintosh)'),
(2, 3, 'token_alice_android_abcde', NOW() + INTERVAL '2 hours', '198.51.100.25', 'Spain', 'Mozilla/5.0 (Android)');

INSERT INTO public.user_profile (user_id, first_name, last_name, bio, profile_picture_file_id, location, date_of_birth, status) VALUES
(1, 'John', 'Doe', 'Tech enthusiast and music lover.', 1, 'New York, USA', '1990-05-20', 'online'),
(2, 'Alice', 'Smith', 'Traveler and photographer.', NULL, 'Madrid, Spain', '1995-10-01', 'away'),
(3, 'System', 'Admin', 'Manages the platform.', NULL, 'Headquarters, CZ', '1980-01-01', 'busy');

INSERT INTO public.user_setting (user_id, theme, language_id, timezone, email_verified) VALUES
(1, 'dark', 1, 'America/New_York', TRUE),
(2, 'light', 2, 'Europe/Madrid', TRUE),
(3, 'system', 1, 'Europe/Prague', TRUE);

INSERT INTO public.user_consent (user_id, terms_of_service_accepted_at, tos_version, privacy_policy_accepted_at, pp_version, marketing_consent_given_at) VALUES
(1, '2023-01-15 10:05:00+00', '1.2', '2023-01-15 10:05:00+00', '1.1', '2023-01-15 10:05:00+00'),
(2, '2023-03-20 14:35:00+00', '1.3', '2023-03-20 14:35:00+00', '1.2', NULL),
(3, '2022-11-01 08:05:00+00', '1.2', '2022-11-01 08:05:00+00', '1.1', '2022-11-01 08:05:00+00');

INSERT INTO public.user_notification_preference (user_id, email_promotional, push_promotional) VALUES
(1, TRUE, TRUE),
(2, FALSE, FALSE),
(3, TRUE, FALSE);

INSERT INTO public.user_auth (user_id, recovery_email, last_password_change) VALUES
(1, 'john.recovery@example.com', '2023-10-01 12:00:00+00'),
(2, NULL, '2023-03-20 14:30:00+00'),
(3, 'admin.recovery@sys.com', NULL);

INSERT INTO public.user_metadata (user_id, sign_up_ip, user_agent_info, referral_source, is_bot, custom_data) VALUES
(1, '192.0.2.1', 'Chrome on Windows 10', 'google_ad', FALSE, '{"level": "premium"}'),
(2, '192.0.2.10', 'Safari on iOS', 'direct', FALSE, '{}'),
(3, '192.0.2.50', 'System Agent', 'internal', TRUE, '{"role": "superuser"}');

INSERT INTO public.password_history (user_id, password_hash) VALUES
(1, 'old_hash_1'),
(1, 'old_hash_2'),
(2, 'old_hash_alice');

INSERT INTO public.user_activity_log (user_id, session_id, event_type, event_description, ip_address, user_agent) VALUES
(1, 1, 'login_success', 'Successful login from iPhone', '203.0.113.1', 'Mozilla/5.0 (iPhone)'),
(1, 2, 'view_profile', 'Viewed profile settings', '203.0.113.1', 'Mozilla/5.0 (Macintosh)'),
(2, 3, 'upload_file', 'Uploaded proof document', '198.51.100.25', 'Mozilla/5.0 (Android)');

INSERT INTO public.oauth_provider (name) VALUES
('Google'),
('Facebook'),
('Apple');

INSERT INTO public.user_oauth_account (user_id, provider_id, provider_user_id, access_token, expires_at) VALUES
(1, 1, 'google_id_john', 'token_g_john', NOW() + INTERVAL '60 minutes'),
(2, 2, 'facebook_id_alice', 'token_f_alice', NOW() + INTERVAL '120 minutes'),
(3, 1, 'google_id_admin', 'token_g_admin', NOW() + INTERVAL '30 minutes');

INSERT INTO public.user_2fa_method (user_id, method, is_enabled, is_primary, secret) VALUES
(1, 'authenticator', TRUE, TRUE, 'TOTP_SECRET_JOHN'),
(1, 'sms', TRUE, FALSE, NULL),
(2, 'email', TRUE, TRUE, 'ALICE@EMAIL.COM');

INSERT INTO public.user_2fa_backup_code (user_id, batch_id, code_hash, is_used) VALUES
(1, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'code_hash_1', FALSE),
(1, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'code_hash_2', TRUE),
(2, 'b1fcc199-9c0b-4ef8-bb6d-6bb9bd380a11', 'code_hash_3', FALSE);

INSERT INTO public.user_login_history (user_id, session_id, ip_address, user_agent, is_successful, country) VALUES
(1, 1, '203.0.113.1', 'Mozilla/5.0 (iPhone)', TRUE, 'USA'),
(2, 3, '198.51.100.25', 'Mozilla/5.0 (Android)', TRUE, 'Spain');

INSERT INTO public.user_2fa_login_log (user_id, session_id, is_successful, method_used, ip_address) VALUES
(1, 1, TRUE, 'authenticator', '203.0.113.1'),
(2, 3, TRUE, 'email', '198.51.100.25');

INSERT INTO public.user_report (reporter_user_id, session_id, reported_user_id, reason, status, moderator_user_id) VALUES
(4, NULL, 1, 'Inappropriate profile picture.', 'pending', NULL),
(1, 1, 2, 'Spamming in comment section.', 'approved', 5),
(4, NULL, 3, 'Frivolous report.', 'rejected', 5);

INSERT INTO public.user_file_access (user_id, file_id) VALUES
(1, 2),
(2, 1),
(4, 1);

INSERT INTO public.user_webauthn_credential (user_id, credential_id, public_key, sign_count, attestation_type, credential_name) VALUES
(1, E'\\x1234567890abcdef'::bytea, E'\\xabcdef1234567890'::bytea, 10, 'none', 'Johns Security Key'),
(1, E'\\x9876543210fedcba'::bytea, E'\\xfedcba0123456789'::bytea, 5, 'fido-u2f', 'Johns Laptop Fingerprint'),
(2, E'\\x1122334455667788'::bytea, E'\\x8877665544332211'::bytea, 1, 'packed', 'Alices Mobile Passkey');

INSERT INTO public.news (translation_group_id, language_id, title, body, file_id, status, published_at, author_user_id) VALUES
('d1a9f0e6-9e6a-4b0c-9f6e-6a9b0c9f0e6a', 1, 'New Terms of Service', 'We have updated our terms of service, effective immediately.', 2, 'published', '2023-11-01 10:00:00+00', 3),
('d1a9f0e6-9e6a-4b0c-9f6e-6a9b0c9f0e6a', 2, 'Nuevos Términos de Servicio', 'Hemos actualizado nuestros términos de servicio, con efecto inmediato.', 2, 'published', '2023-11-01 10:00:00+00', 3),
('e2b861f7-9e6a-4b0c-9f6e-6a9b0c9f0e6a', 1, 'Holiday Hours', 'Our support hours will be adjusted during the holiday season.', NULL, 'scheduled', '2023-12-15 09:00:00+00', 3);

INSERT INTO public.notification (language_id, audience_type, user_id, title, notification_message, notification_type) VALUES
(1, 'user', 1, 'Welcome!', 'Thank you for joining our platform.', 'success'),
(1, 'all', NULL, 'System Update', 'Maintenance will occur tonight.', 'system'),
(1, 'user', 2, 'New Follower', 'Someone just followed you!', 'activity');

INSERT INTO public.role (name, description) VALUES
('Standard User', 'Basic platform access.'),
('Moderator', 'Can review and moderate content/reports.'),
('Administrator', 'Full system access.');

INSERT INTO public.permission (name, description) VALUES
('read:self_profile', 'View own profile data.'),
('write:post', 'Create or edit own content.'),
('admin:full_access', 'All administration permissions.');

INSERT INTO public.role_permission (role_id, permission_id) VALUES
(1, 1),
(1, 2),
(2, 1),
(2, 2),
(3, 1),
(3, 2),
(3, 3);

INSERT INTO public.user_role (user_id, role_id, changed_by_user_id) VALUES
(1, 1, 3),
(2, 1, 3),
(5, 2, 3),
(3, 3, 3);

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
