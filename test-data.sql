INSERT INTO public.user (id, uuid, first_name, last_name, username, email, email_verified, date_of_birth, account_status, last_login_at, last_active_at, created_at, updated_at, phone_number, is_oauth_user) VALUES
(1, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Jan', 'Novák', 'jannovak', 'jan.novak@example.com', TRUE, '1985-05-15', 'active', '2025-07-01 10:00:00', '2025-07-01 10:15:00', '2025-07-01 09:00:00', '2025-07-01 09:00:00', '+420777123456', FALSE),
(2, 'b1c2d3e4-f5f6-7a8b-9c0d-1e2f3g4h5i6j', 'Petr', 'Svoboda', 'petrsvoboda', 'petr.svoboda@example.com', FALSE, '1990-11-20', 'pending_verification', NULL, NULL, '2025-07-01 09:05:00', '2025-07-01 09:05:00', '+420602987654', FALSE),
(3, 'c3a4b5c6-d7d8-e9f0-1g2h-3i4j5k6l7m8n', 'Marie', 'Černá', 'marie.c', 'marie.cerna@example.com', TRUE, '1992-03-22', 'active', '2025-06-25 14:30:00', '2025-07-01 11:00:00', '2025-06-25 14:00:00', '2025-06-25 14:00:00', '+420732555888', FALSE),
(4, 'd4e5f6g7-h8h9-i0j1-2k3l-4m5n6o7p8q9r', 'Jiří', 'Dvořák', 'jiri.d', 'jiri.dvorak@example.com', TRUE, '1988-08-05', 'active', '2025-07-01 09:15:00', '2025-07-01 09:30:00', '2025-07-01 09:10:00', '2025-07-01 09:10:00', '+420721222333', FALSE),
(5, 'e5f6g7h8-i9i0-j1k2-3l4m-5n6o7p8q9r0s', 'Lenka', 'Nováková', 'lenka.n', 'lenka.novakova@example.com', TRUE, '1995-01-30', 'active', '2025-06-30 18:00:00', '2025-06-30 18:05:00', '2025-06-30 17:55:00', '2025-06-30 17:55:00', '+420603444555', FALSE),
(6, 'f6g7h8i9-j0j1-k2l3-4m5n-6o7p8q9r0s1t', 'Martin', 'Pospíšil', 'martin.p', 'martin.pospisil@example.com', TRUE, '1989-07-10', 'active', '2025-07-01 12:00:00', '2025-07-01 12:30:00', '2025-07-01 11:55:00', '2025-07-01 11:55:00', '+420777999888', FALSE);

INSERT INTO public.device (id, user_id, device_name, last_used_at, is_trusted, biometric_enabled, device_os, device_version, device_fingerprint, device_token, last_known_ip, created_at, updated_at) VALUES
(1, 1, 'Jan''s iPhone', '2025-07-01 10:15:00', TRUE, TRUE, 'iOS', '18.0', 'fingerprint1', 'token1', '192.168.1.1', '2025-06-28 10:00:00', '2025-06-28 10:00:00'),
(2, 2, 'Petr''s Android', '2025-06-29 11:00:00', FALSE, FALSE, 'Android', '14', 'fingerprint2', 'token2', '10.0.0.1', '2025-06-28 10:01:00', '2025-06-28 10:01:00'),
(3, 3, 'Marie''s Laptop', '2025-07-01 11:00:00', TRUE, FALSE, 'Windows', '11', 'fingerprint3', 'token3', '172.16.0.1', '2025-06-28 10:02:00', '2025-06-28 10:02:00'),
(4, 4, 'Jiri''s Tablet', '2025-07-01 09:30:00', TRUE, TRUE, 'iPadOS', '18.0', 'fingerprint4', 'token4', '203.0.113.1', '2025-06-28 10:03:00', '2025-06-28 10:03:00'),
(5, 5, 'Lenka''s Desktop', '2025-06-30 18:05:00', FALSE, FALSE, 'Linux', '22.04', 'fingerprint5', 'token5', '2001:db8::1', '2025-06-28 10:04:00', '2025-06-28 10:04:00');

INSERT INTO public.session (id, user_id, device_id, session_token, login_time, last_active, expires_at, is_active, user_agent, ip_address, country, region, city, latitude, longitude, cookie_consent, system_version, public_key) VALUES
(1, 1, 1, 'session_token_1', '2025-07-01 10:00:00', '2025-07-01 10:15:00', '2025-07-02 10:00:00', TRUE, 'Mozilla/5.0 (iPhone)', '192.168.1.1', 'Czechia', 'Prague', 'Prague', 50.0755, 14.4378, TRUE, '1.0.0', 'public_key_1'),
(2, 2, 2, 'session_token_2', '2025-06-29 11:00:00', '2025-06-29 11:10:00', '2025-06-30 11:00:00', FALSE, 'Mozilla/5.0 (Android)', '10.0.0.1', 'Czechia', 'South Moravian Region', 'Brno', 49.1951, 16.6068, FALSE, '1.0.1', 'public_key_2'),
(3, 3, 3, 'session_token_3', '2025-06-25 14:30:00', '2025-07-01 11:00:00', '2025-07-02 14:30:00', TRUE, 'Mozilla/5.0 (Windows)', '172.16.0.1', 'Czechia', 'Moravian-Silesian Region', 'Ostrava', 49.8209, 18.2625, TRUE, '1.0.2', 'public_key_3'),
(4, 4, 4, 'session_token_4', '2025-07-01 09:15:00', '2025-07-01 09:30:00', '2025-07-02 09:15:00', TRUE, 'Mozilla/5.0 (iPad)', '203.0.113.1', 'Czechia', 'Plzeň Region', 'Pilsen', 49.7479, 13.3776, TRUE, '1.0.3', 'public_key_4'),
(5, 5, 5, 'session_token_5', '2025-06-30 18:00:00', '2025-06-30 18:05:00', '2025-07-01 18:00:00', TRUE, 'Mozilla/5.0 (X11)', '2001:db8::1', 'Czechia', 'Liberec Region', 'Liberec', 50.7671, 15.0562, TRUE, '1.0.4', 'public_key_5');

INSERT INTO public.file (id, uuid, file_name, file_type, file_category, file_size_bytes, mime_type, file_checksum, storage_url, storage_service, storage_identifier, uploaded_at, creator_user_id) VALUES
(1, 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6', 'profile_pic_jan.jpg', 'image', 'profile_picture', 15000, 'image/jpeg', 'abcef12345', '[https://storage.example.com/profiles/jan_profile.jpg](https://storage.example.com/profiles/jan_profile.jpg)', 'S3', 'jan_profile_s3_id', '2025-07-01 09:01:00', 1),
(2, 'f81d4fae-7dec-11d0-a765-00a0c91e6bf7', 'document_petr.pdf', 'document', 'user_uploaded_document', 250000, 'application/pdf', 'b1c2d3e4f5', '[https://storage.example.com/documents/petr_doc.pdf](https://storage.example.com/documents/petr_doc.pdf)', 'S3', 'petr_doc_s3_id', '2025-07-01 09:06:00', 2),
(3, 'f81d4fae-7dec-11d0-a765-00a0c91e6bf8', 'invoice_marie.pdf', 'document', 'invoice', 50000, 'application/pdf', 'c1d2e3f4g5', '[https://storage.example.com/invoices/marie_inv.pdf](https://storage.example.com/invoices/marie_inv.pdf)', 'S3', 'marie_inv_s3_id', '2025-06-25 14:01:00', 3),
(4, 'f81d4fae-7dec-11d0-a765-00a0c91e6bf9', 'report_jiri.xlsx', 'document', 'report', 120000, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'd1e2f3g4h5', '[https://storage.example.com/reports/jiri_report.xlsx](https://storage.example.com/reports/jiri_report.xlsx)', 'S3', 'jiri_report_s3_id', '2025-07-01 09:11:00', 4),
(5, 'f81d4fae-7dec-11d0-a765-00a0c91e6bfa', 'video_lenka.mp4', 'video', 'other_category', 5000000, 'video/mp4', 'e1f2g3h4i5', '[https://storage.example.com/videos/lenka_video.mp4](https://storage.example.com/videos/lenka_video.mp4)', 'S3', 'lenka_video_s3_id', '2025-06-30 17:56:00', 5),
(6, 'f81d4fae-7dec-11d0-a765-00a0c91e6bfb', 'system_contract.pdf', 'document', 'system_generated_document', 75000, 'application/pdf', 'f1g2h3i4j5', '[https://storage.example.com/system/contract.pdf](https://storage.example.com/system/contract.pdf)', 'S3', 'system_contract_s3_id', '2025-07-01 09:02:00', 1),
(7, 'a1b2c3d4-e5f6-7g8h-9i0j-1k2l3m4n5o6p', 'badge_icon_1.png', 'image', 'other_category', 5000, 'image/png', 'g1h2i3j4k5', '[https://storage.example.com/badges/badge1.png](https://storage.example.com/badges/badge1.png)', 'S3', 'badge_1_s3_id', '2025-06-01 08:30:00', 1),
(8, 'b2c3d4e5-f6g7-8h9i-0j1k-2l3m4n5o6p7q', 'dictionary_img_1.jpg', 'image', 'other_category', 8000, 'image/jpeg', 'h1i2j3k4l5', '[https://storage.example.com/dictionary/dict1.jpg](https://storage.example.com/dictionary/dict1.jpg)', 'S3', 'dict_img_1_s3_id', '2025-06-10 10:00:00', 4),
(9, 'c3d4e5f6-g7h8-9i0j-1k2l-3m4n5o6p7q8r', 'dictionary_anim_1.gif', 'image', 'other_category', 100000, 'image/gif', 'i1j2k3l4m5', '[https://storage.example.com/dictionary/dict_anim1.gif](https://storage.example.com/dictionary/dict_anim1.gif)', 'S3', 'dict_anim_1_s3_id', '2025-06-10 10:00:00', 4),
(10, 'd4e5f6g7-h8i9-j0k1-2l3m-4n5o6p7q8r9s', 'dictionary_mark_1.svg', 'image', 'other_category', 2000, 'image/svg+xml', 'j1k2l3m4n5', '[https://storage.example.com/dictionary/dict_mark1.svg](https://storage.example.com/dictionary/dict_mark1.svg)', 'S3', 'dict_mark_1_s3_id', '2025-06-10 10:00:00', 4);

INSERT INTO public.user_file (id, user_id, file_id, generated_or_uploaded_at) VALUES
(1, 1, 1, '2025-07-01 09:01:00'),
(2, 2, 2, '2025-07-01 09:06:00'),
(3, 3, 3, '2025-06-25 14:01:00'),
(4, 4, 4, '2025-07-01 09:11:00'),
(5, 5, 5, '2025-06-30 17:56:00'),
(6, 1, 6, '2025-07-01 09:02:00');

INSERT INTO public.user_setting (user_id, bio, dark_mode, user_language_preference, user_display_status, terms_privacy_agreement_accepted_at, gdpr_consent_given_at, profile_picture_file_id) VALUES
(1, 'Hello, I''m Jan!', TRUE, 'en', 'online', '2025-05-01 10:00:00', '2025-05-01 10:05:00', 1),
(2, 'Hi, I''m Petr.', FALSE, 'cz', 'invisible', NULL, NULL, NULL),
(3, 'My bio here.', TRUE, 'cz', 'away', '2025-06-01 12:00:00', '2025-06-01 12:05:00', 3),
(4, 'Creative person.', FALSE, 'en', 'online', '2025-06-15 08:00:00', '2025-06-15 08:05:00', 4),
(5, 'Loves coding.', TRUE, 'cz', 'do_not_disturb', '2025-05-20 16:00:00', '2025-05-20 16:05:00', 5);

INSERT INTO public.user_location (user_id, country, city, postal_code, street_address, latitude, longitude) VALUES
(1, 'Czechia', 'Prague', '11000', 'Old Town Square 1', 50.087811, 14.420460),
(2, 'Czechia', 'Brno', '60200', 'Freedom Square 2', 49.194788, 16.609590),
(3, 'Czechia', 'Ostrava', '70200', 'Masaryk Square 3', 49.820923, 18.262529),
(4, 'Czechia', 'Pilsen', '30100', 'Republic Square 4', 49.747970, 13.377660),
(5, 'Czechia', 'Liberec', '46001', 'Dr. E. Beneše Square 5', 50.768132, 15.056070);

INSERT INTO public.user_notification_setting (user_id, receive_news, receive_private_messages, marketing_consent_given_at) VALUES
(1, TRUE, TRUE, '2025-05-01 10:00:00'),
(2, FALSE, TRUE, NULL),
(3, TRUE, FALSE, '2025-06-01 12:00:00'),
(4, TRUE, TRUE, '2025-06-15 08:00:00'),
(5, FALSE, FALSE, '2025-05-20 16:00:00');

INSERT INTO public.user_security (user_id, two_factor_enabled, recovery_email, failed_login_attempts, password_last_changed_at, last_login_ip, password_hash) VALUES
(1, TRUE, 'jan.novak@gmail.com', 0, '2025-06-20 08:00:00', '192.168.1.1', 'hashed_password_jan'),
(2, FALSE, 'petr.svoboda@seznam.cz', 1, '2025-07-01 10:00:00', '10.0.0.1', 'hashed_password_petr'),
(3, TRUE, 'marie.cerna@yahoo.com', 0, '2025-06-25 14:00:00', '172.16.0.1', 'hashed_password_marie'),
(4, FALSE, 'jiri.dvorak@outlook.com', 0, '2025-06-30 11:00:00', '203.0.113.1', 'hashed_password_jiri'),
(5, TRUE, 'lenka.novakova@mail.com', 0, '2025-05-15 09:00:00', '2001:db8::1', 'hashed_password_lenka');

INSERT INTO public.role (id, creator_user_id, role_name, role_description, created_at, updated_at) VALUES
(1, 1, 'admin', 'Administrator with full access.', '2025-06-01 08:00:00', '2025-06-01 08:00:00'),
(2, 1, 'user', 'Standard user with basic permissions.', '2025-06-01 08:01:00', '2025-06-01 08:01:00'),
(3, 3, 'marketer', 'User with permissions to manage news and promotions.', '2025-06-01 08:02:00', '2025-06-01 08:02:00'),
(4, 4, 'educator', 'User who can create educational content and manuals.', '2025-06-01 08:03:00', '2025-06-01 08:03:00'),
(5, 5, 'customer', 'User with limited access, primarily for purchasing and viewing content.', '2025-06-01 08:04:00', '2025-06-01 08:04:00');

INSERT INTO public.permission (id, creator_user_id, resource_type, action_type, permission_description, created_at, updated_at) VALUES
(1, 1, 'user', 'read', 'Allows reading user profiles.', '2025-06-01 08:10:00', '2025-06-01 08:10:00'),
(2, 1, 'file', 'write', 'Allows uploading new files.', '2025-06-01 08:11:00', '2025-06-01 08:11:00'),
(3, 1, 'manual', 'update', 'Allows updating manual content.', '2025-06-01 08:12:00', '2025-06-01 08:12:00'),
(4, 1, 'news', 'write', 'Allows creating new news articles.', '2025-06-01 08:13:00', '2025-06-01 08:13:00'),
(5, 1, 'user', 'delete', 'Allows deleting user accounts.', '2025-06-01 08:14:00', '2025-06-01 08:14:00'),
(6, 1, 'role', 'read', 'Allows reading role information.', '2025-06-01 08:15:00', '2025-06-01 08:15:00');

INSERT INTO public.user_role (id, user_id, role_id) VALUES
(1, 1, 1),
(2, 1, 2),
(3, 2, 2),
(4, 3, 3),
(5, 4, 4),
(6, 5, 5);

INSERT INTO public.role_permission (id, role_id, permission_id) VALUES
(1, 1, 1),
(2, 1, 2),
(3, 1, 3),
(4, 1, 4),
(5, 1, 5),
(6, 2, 1);

INSERT INTO public.login_history (id, user_id, login_time, login_status, failure_reason, ip_address, user_agent, session_id) VALUES
(1, 1, '2025-07-01 10:00:00', 'success', NULL, '192.168.1.1', 'Mozilla/5.0 (iPhone)', 1),
(2, 2, '2025-07-01 10:01:00', 'failure', 'wrong_password', '10.0.0.1', 'Mozilla/5.0 (Android)', 2),
(3, 2, '2025-07-01 10:05:00', 'pending_2fa', NULL, '10.0.0.1', 'Mozilla/5.0 (Android)', 2),
(4, 3, '2025-06-25 14:30:00', 'success', NULL, '172.16.0.1', 'Mozilla/5.0 (Windows)', 3),
(5, 4, '2025-07-01 09:15:00', 'success', NULL, '203.0.113.1', 'Mozilla/5.0 (iPad)', 4),
(6, 5, '2025-06-30 18:00:00', 'success', NULL, '2001:db8::1', 'Mozilla/5.0 (X11)', 5);

INSERT INTO public.two_factor_auth_log (id, user_id, two_factor_auth_log_method_type, success, attempted_at, ip_address, session_id) VALUES
(1, 1, 'email', TRUE, '2025-07-01 10:02:00', '192.168.1.1', 1),
(2, 2, 'TOTP', FALSE, '2025-07-01 10:06:00', '10.0.0.1', 2),
(3, 3, 'email', TRUE, '2025-06-25 14:31:00', '172.16.0.1', 3),
(4, 4, 'email', FALSE, '2025-07-01 09:16:00', '203.0.113.1', 4),
(5, 5, 'TOTP', TRUE, '2025-06-30 18:01:00', '2001:db8::1', 5);

INSERT INTO public.system_log (id, user_id, system_log_type, system_log_time, system_action, resource_id, system_severity, details, metadata, session_id) VALUES
(1, 1, 'authentication', '2025-07-01 10:00:00', 'login', '1', 'info', 'User 1 logged in successfully.', '{"user_agent": "Mozilla/5.0"}', 1),
(2, 2, 'error', '2025-07-01 10:01:00', 'login', '2', 'warning', 'User 2 failed login attempt.', '{"ip": "10.0.0.1"}', 2),
(3, 3, 'data_access', '2025-06-25 14:35:00', 'read', '5', 'info', 'User 3 read file 5.', '{"file_id": 5}', 3),
(4, 4, 'system_event', '2025-07-01 09:30:00', 'update', '4', 'debug', 'User 4 updated a report.', NULL, 4),
(5, 5, 'authentication', '2025-06-30 18:05:00', 'logout', '5', 'info', 'User 5 logged out.', '{"session_id": "xyz"}', 5);

INSERT INTO public.two_factor_auth_method (id, user_id, two_factor_auth_method_type, is_primary, two_factor_auth_method_enabled, verified, secret_data, created_at, updated_at) VALUES
(1, 1, 'email', TRUE, TRUE, TRUE, 'jan.novak@example.com', '2025-06-28 10:10:00', '2025-06-28 10:10:00'),
(2, 2, 'email', TRUE, TRUE, FALSE, 'petr.svoboda@example.com', '2025-06-28 10:11:00', '2025-06-28 10:11:00'),
(3, 3, 'TOTP', TRUE, TRUE, TRUE, 'secret_totp_3', '2025-06-28 10:12:00', '2025-06-28 10:12:00'),
(4, 4, 'email', TRUE, FALSE, FALSE, 'jiri.dvorak@example.com', '2025-06-28 10:13:00', '2025-06-28 10:13:00'),
(5, 5, 'biometric', TRUE, TRUE, TRUE, 'fingerprint_data_5', '2025-06-28 10:14:00', '2025-06-28 10:14:00');

INSERT INTO public.password_history (id, user_id, password_hash, changed_at) VALUES
(1, 1, 'old_hashed_password_jan_1', '2025-05-10 08:00:00'),
(2, 1, 'old_hashed_password_jan_2', '2025-06-10 08:00:00'),
(3, 2, 'old_hashed_password_petr', '2025-06-20 10:00:00'),
(4, 3, 'old_hashed_password_marie', '2025-06-15 14:00:00'),
(5, 4, 'old_hashed_password_jiri', '2025-06-20 11:00:00');

INSERT INTO public.oauth_account (id, user_id, oauth_provider, provider_user_id, access_token, refresh_token, token_expires_at, created_at, updated_at) VALUES
(1, 1, 'google', 'google_jan', 'google_access_token_1', 'google_refresh_token_1', '2025-07-02 10:00:00', '2025-06-28 10:20:00', '2025-06-28 10:20:00'),
(2, 3, 'github', 'github_marie', 'github_access_token_2', NULL, NULL, '2025-06-28 10:21:00', '2025-06-28 10:21:00'),
(3, 4, 'facebook', 'facebook_jiri', 'facebook_access_token_3', 'facebook_refresh_token_3', '2025-07-03 09:15:00', '2025-06-28 10:22:00', '2025-06-28 10:22:00'),
(4, 5, 'microsoft', 'microsoft_lenka', 'microsoft_access_token_4', NULL, NULL, '2025-06-28 10:23:00', '2025-06-28 10:23:00'),
(5, 6, 'google', 'google_martin', 'google_access_token_5', 'google_refresh_token_5', '2025-07-04 12:00:00', '2025-06-28 10:24:00', '2025-06-28 10:24:00');

INSERT INTO public.two_factor_auth_backup_code (id, user_id, code_hash, used_at, created_at, batch_id) VALUES
(1, 1, 'hash_code1', '2025-06-25 14:32:00', '2025-06-25 14:32:00', 'batch1'),
(2, 1, 'hash_code2', '2025-06-25 14:32:00', '2025-06-25 14:32:00', 'batch1'),
(3, 3, 'hash_code3', '2025-06-25 14:32:00', '2025-06-25 14:32:00', 'batch2'),
(4, 3, 'hash_code4', NULL, '2025-07-01 10:00:00', 'batch2'),
(5, 5, 'hash_code5', NULL, '2025-07-01 10:01:00', 'batch3');

INSERT INTO public.follower (id, follower_id, followed_id, followed_at, is_active) VALUES
(1, 1, 3, '2025-08-07 21:57:13', TRUE),
(2, 1, 4, '2025-08-07 21:57:13', TRUE),
(3, 3, 1, '2025-08-07 21:57:13', TRUE),
(4, 4, 5, '2025-08-07 21:57:13', TRUE),
(5, 5, 1, '2025-08-07 21:57:13', TRUE);

INSERT INTO public.badge (id, uuid, creator_user_id, image_file_id, badge_name, badge_description, created_at, updated_at) VALUES
(1, 'badge-1-uuid', 1, 7, 'First Login', 'Awarded for the first login.', '2025-06-01 08:30:00', '2025-06-01 08:30:00'),
(2, 'badge-2-uuid', 1, 7, 'First Upload', 'Awarded for uploading a file.', '2025-06-01 08:31:00', '2025-06-01 08:31:00'),
(3, 'badge-3-uuid', 1, 7, 'Community Member', 'Awarded for commenting on a post.', '2025-06-01 08:32:00', '2025-06-01 08:32:00'),
(4, 'badge-4-uuid', 1, 7, 'Trusted User', 'Awarded for being an active and trusted user.', '2025-06-01 08:33:00', '2025-06-01 08:33:00'),
(5, 'badge-5-uuid', 1, 7, 'Super Contributor', 'Awarded for contributing a lot of content.', '2025-06-01 08:34:00', '2025-06-01 08:34:00');

INSERT INTO public.user_badge (id, badge_id, user_id, awarded_at, visible_on_profile) VALUES
(1, 1, 1, '2025-07-01 09:00:00', TRUE),
(2, 2, 1, '2025-07-01 09:05:00', TRUE),
(3, 3, 3, '2025-07-01 09:10:00', TRUE),
(4, 4, 4, '2025-07-01 09:15:00', TRUE),
(5, 5, 5, '2025-07-01 09:20:00', TRUE);

INSERT INTO public.notification (id, user_id, creator_user_id, title, notification_message, notification_type, audience_type, created_at) VALUES
(1, 1, 1, 'Welcome to our platform!', 'Your account has been successfully created.', 'success', 'user', '2025-08-07 21:51:58'),
(2, 2, 1, 'Verify your email address', 'Please click the link to verify your email.', 'warning', 'user', '2025-08-07 21:51:58'),
(3, 3, 1, 'New message from Jan', 'Hello Marie, how are you?', 'activity', 'user', '2025-08-07 21:51:58'),
(4, 4, 1, 'Report generated', 'Your monthly report is ready for download.', 'info', 'user', '2025-08-07 21:51:58'),
(5, NULL, 1, 'New promotion', 'Check out our latest offers!', 'promotion', 'broadcast', '2025-08-07 21:51:58'),
(6, NULL, 1, 'System Maintenance', 'We will be undergoing scheduled maintenance tonight.', 'info', 'group', '2025-08-07 21:51:58');

INSERT INTO public.news (id, uuid, creator_user_id, image_file_id, title_cz, title_en, content_cz, content_en, published_at, news_status, created_at, updated_at) VALUES
(1, 'news-1-uuid', 1, 6, 'Novinky v naší aplikaci', 'News in our app', 'Dnes jsme vydali novou verzi aplikace.', 'We have released a new version of the app today.', '2025-07-01 08:00:00', 'active', '2025-06-25 09:00:00', '2025-06-25 09:00:00'),
(2, 'news-2-uuid', 1, 6, 'Letní akce', 'Summer promotion', 'Užijte si léto s našimi slevami!', 'Enjoy the summer with our discounts!', '2025-06-30 09:00:00', 'active', '2025-06-25 09:01:00', '2025-06-25 09:01:00'),
(3, 'news-3-uuid', 3, 6, 'Nový průvodce', 'New guide', 'Připravili jsme pro vás nový průvodce.', 'We have prepared a new guide for you.', '2025-06-25 10:00:00', 'active', '2025-06-25 09:02:00', '2025-06-25 09:02:00'),
(4, 'news-4-uuid', 3, 6, 'Úspěchy komunity', 'Community achievements', 'Představujeme vám nejlepší projekty.', 'We present you the best projects.', '2025-06-20 11:00:00', 'active', '2025-06-20 10:00:00', '2025-06-20 10:00:00'),
(5, 'news-5-uuid', 3, 6, 'Technická údržba', 'Technical maintenance', 'Plánovaná údržba systému.', 'Scheduled system maintenance.', NULL, 'draft', '2025-07-01 10:00:00', '2025-07-01 10:00:00');

INSERT INTO public.news_delivery (id, news_id, user_id, device_id, news_delivery_language, sent_as_push, delivered_as_in_app, read_at, created_at) VALUES
(1, 1, 1, 1, 'en', TRUE, TRUE, '2025-07-01 08:05:00', '2025-07-01 08:05:00'),
(2, 1, 3, 3, 'cz', FALSE, TRUE, NULL, '2025-07-01 08:05:00'),
(3, 2, 4, 4, 'en', TRUE, TRUE, '2025-06-30 09:05:00', '2025-06-30 09:05:00'),
(4, 2, 5, 5, 'cz', FALSE, FALSE, NULL, '2025-06-30 09:05:00'),
(5, 3, 1, 1, 'cz', TRUE, TRUE, '2025-06-25 10:05:00', '2025-06-25 10:05:00');

INSERT INTO public.tool (id, uuid, creator_user_id, image_file_id, title_cz, title_en, description_cz, description_en, video_url, tool_status, created_at, updated_at) VALUES
(1, 'tool-1-uuid', 4, 1, 'Pletací jehlice', 'Knitting needles', 'Různé velikosti a materiály jehlic.', 'Different sizes and materials of needles.', '[https://video.example.com/needles](https://video.example.com/needles)', 'active', '2025-06-01 08:50:00', '2025-06-01 08:50:00'),
(2, 'tool-2-uuid', 4, 1, 'Háčkovací háčky', 'Crochet hooks', 'Sada háčků pro pokročilé.', 'A set of hooks for advanced users.', '[https://video.example.com/hooks](https://video.example.com/hooks)', 'active', '2025-06-01 08:51:00', '2025-06-01 08:51:00'),
(3, 'tool-3-uuid', 4, 1, 'Šicí stroj', 'Sewing machine', 'Základní model pro začátečníky.', 'Basic model for beginners.', '[https://video.example.com/sewing_machine](https://video.example.com/sewing_machine)', 'active', '2025-06-01 08:52:00', '2025-06-01 08:52:00'),
(4, 'tool-4-uuid', 4, 1, 'Sada nití', 'Thread set', 'Barevná sada nití pro všechny projekty.', 'A colorful set of threads for all projects.', '[https://video.example.com/threads](https://video.example.com/threads)', 'active', '2025-06-01 08:53:00', '2025-06-01 08:53:00'),
(5, 'tool-5-uuid', 4, 1, 'Krejčovské nůžky', 'Tailor''s scissors', 'Kvalitní nůžky pro přesný střih.', 'Quality scissors for precise cutting.', '[https://video.example.com/scissors](https://video.example.com/scissors)', 'active', '2025-06-01 08:54:00', '2025-06-01 08:54:00');

INSERT INTO public.dictionary (id, uuid, creator_user_id, image_file_id, animation_file_id, mark_file_id, title_cz, title_en, description_cz, description_en, abbrevation_cz, abbrevation_en, dictionary_status, created_at, updated_at) VALUES
(1, 'dict-1-uuid', 4, 8, 9, 10, 'Oko', 'Stitch', 'Základní jednotka pletení.', 'The basic unit of knitting.', 'O', 'st', 'active', '2025-06-10 10:00:00', '2025-06-10 10:00:00'),
(2, 'dict-2-uuid', 4, 8, 9, 10, 'Hladce', 'Knit', 'Základní typ oka v pletení.', 'The basic type of stitch in knitting.', 'HL', 'k', 'active', '2025-06-10 10:01:00', '2025-06-10 10:01:00'),
(3, 'dict-3-uuid', 4, 8, 9, 10, 'Obrace', 'Purl', 'Opak hladce, tvoří lícovou stranu.', 'The reverse of a knit stitch, creates the right side.', 'OB', 'p', 'active', '2025-06-10 10:02:00', '2025-06-10 10:02:00'),
(4, 'dict-4-uuid', 4, 8, 9, 10, 'Řetízek', 'Chain', 'Základní prvek v háčkování.', 'The basic element in crochet.', 'ŘO', 'ch', 'active', '2025-06-10 10:03:00', '2025-06-10 10:03:00'),
(5, 'dict-5-uuid', 4, 8, 9, 10, 'Sloupek', 'Post', 'Výškový sloupek v háčkování.', 'A tall stitch in crochet.', 'SL', 'ps', 'draft', '2025-06-10 10:04:00', '2025-06-10 10:04:00');

INSERT INTO public.education_mode (id, uuid, creator_user_id, image_file_id, title_cz, title_en, description_cz, description_en, education_mode_status, tool, created_at, updated_at) VALUES
(1, 'edu-1-uuid', 4, 1, 'Základy pletení', 'Knitting basics', 'Naučte se základní techniky pletení.', 'Learn basic knitting techniques.', 'active', 'some tool', '2025-06-01 08:40:00', '2025-06-01 08:40:00'),
(2, 'edu-2-uuid', 4, 1, 'Pokročilé háčkování', 'Advanced crochet', 'Pro ty, kteří již umí základy.', 'For those who already know the basics.', 'active', 'some tool', '2025-06-01 08:41:00', '2025-06-01 08:41:00'),
(3, 'edu-3-uuid', 4, 1, 'Úvod do šití', 'Introduction to sewing', 'První kroky se šicím strojem.', 'First steps with a sewing machine.', 'draft', 'some tool', '2025-06-01 08:42:00', '2025-06-01 08:42:00'),
(4, 'edu-4-uuid', 4, 1, 'Oprava oděvů', 'Garment repair', 'Jak opravit a prodloužit životnost oblečení.', 'How to repair and extend the life of clothes.', 'active', 'some tool', '2025-06-01 08:43:00', '2025-06-01 08:43:00'),
(5, 'edu-5-uuid', 4, 1, 'Design triček', 'T-shirt design', 'Vytvořte si vlastní originální tričko.', 'Create your own original T-shirt.', 'draft', 'some tool', '2025-06-01 08:44:00', '2025-06-01 08:44:00');

INSERT INTO public.education_step (id, education_mode_id, description_cz, description_en, video_url, tool, step_order, created_at, updated_at) VALUES
(1, 1, 'První oko', 'First stitch', '[https://video.example.com/step1](https://video.example.com/step1)', 'some tool', 1, '2025-06-05 08:00:00', '2025-06-05 08:00:00'),
(2, 1, 'Hladce a obrace', 'Knit and purl', '[https://video.example.com/step2](https://video.example.com/step2)', 'some tool', 2, '2025-06-05 08:01:00', '2025-06-05 08:01:00'),
(3, 1, 'Ukončení pleteniny', 'Binding off', '[https://video.example.com/step3](https://video.example.com/step3)', 'some tool', 3, '2025-06-05 08:02:00', '2025-06-05 08:02:00'),
(4, 2, 'Kruhové háčkování', 'Crocheting in the round', '[https://video.example.com/step4](https://video.example.com/step4)', 'some tool', 1, '2025-06-06 09:00:00', '2025-06-06 09:00:00'),
(5, 2, 'Změna barvy', 'Changing color', '[https://video.example.com/step5](https://video.example.com/step5)', 'some tool', 2, '2025-06-06 09:01:00', '2025-06-06 09:01:00');

INSERT INTO public.manual (id, uuid, creator_user_id, image_file_id, title, manual_difficulty, price, manual_language, crochet_abbreviation, crochet_tool, manual_type, manual_status, created_at, updated_at) VALUES
(1, 'manual-1-uuid', 4, 1, 'První šála', 'beginner', 0.00, 'cz', 'hladce', 'jehlice 5mm', 'how_to', 'public', '2025-06-15 11:00:00', '2025-06-15 11:00:00'),
(2, 'manual-2-uuid', 4, 1, 'Vlněná čepice', 'intermediate', 99.00, 'cz', 'kruhové pletení', 'háčky 4mm', 'how_to', 'premium', '2025-06-15 11:01:00', '2025-06-15 11:01:00'),
(3, 'manual-3-uuid', 4, 1, 'Oprava svetru', 'beginner', 0.00, 'cz', NULL, NULL, 'repair', 'public', '2025-06-15 11:02:00', '2025-06-15 11:02:00'),
(4, 'manual-4-uuid', 4, 1, 'Pokročilé pletení', 'advanced', 199.90, 'cz', NULL, NULL, 'how_to', 'premium', '2025-06-15 11:03:00', '2025-06-15 11:03:00'),
(5, 'manual-5-uuid', 4, 1, 'Háčkovaná deka', 'intermediate', 0.00, 'cz', 'řetízek, sloupek', 'háčky 6mm', 'how_to', 'public', '2025-06-15 11:04:00', '2025-06-15 11:04:00');

INSERT INTO public.manual_step (id, manual_id, image_file_id, title, description, step_order, created_at, updated_at) VALUES
(1, 1, 1, 'Nahazování ok', 'První krok k pletení šály.', 1, '2025-06-16 09:00:00', '2025-06-16 09:00:00'),
(2, 1, 1, 'Pletení hladce', 'Opakujeme pro celou šálu.', 2, '2025-06-16 09:01:00', '2025-06-16 09:01:00'),
(3, 1, 1, 'Ukončení', 'Poslední krok k dokončení projektu.', 3, '2025-06-16 09:02:00', '2025-06-16 09:02:00'),
(4, 2, 1, 'Začátek čepice', 'Pletení v kruhu.', 1, '2025-06-17 10:00:00', '2025-06-17 10:00:00'),
(5, 2, 1, 'Zmenšování', 'Postupné zmenšování obvodu čepice.', 2, '2025-06-17 10:01:00', '2025-06-17 10:01:00');

INSERT INTO public.manual_progress (id, user_id, manual_id, current_step_id, total_time_seconds, started_at, last_updated_at, is_finished) VALUES
(1, 1, 1, 2, 3600, '2025-06-20 08:00:00', '2025-06-21 09:00:00', FALSE),
(2, 3, 3, 1, 7200, '2025-06-21 10:00:00', '2025-06-21 12:00:00', TRUE),
(3, 4, 5, 1, 1800, '2025-06-22 13:00:00', '2025-06-22 13:30:00', FALSE),
(4, 5, 1, 1, 600, '2025-06-23 14:00:00', '2025-06-23 14:10:00', FALSE),
(5, 6, 3, NULL, 1200, '2025-06-24 15:00:00', '2025-06-24 15:20:00', FALSE);

INSERT INTO public.manual_purchase (id, user_id, manual_id, purchase_date, price_paid, currency, transaction_id, payment_status, created_at, updated_at) VALUES
(1, 1, 2, '2025-06-28 10:00:00', 99.00, 'czk', 'txn_001', 'completed', '2025-06-28 10:00:00', '2025-06-28 10:00:00'),
(2, 3, 2, '2025-06-29 11:00:00', 99.00, 'czk', 'txn_002', 'completed', '2025-06-29 11:00:00', '2025-06-29 11:00:00'),
(3, 4, 4, '2025-06-30 12:00:00', 199.00, 'czk', 'txn_003', 'completed', '2025-06-30 12:00:00', '2025-06-30 12:00:00'),
(4, 5, 2, '2025-07-01 13:00:00', 99.00, 'czk', 'txn_004', 'pending', '2025-07-01 13:00:00', '2025-07-01 13:00:00'),
(5, 6, 4, '2025-07-02 14:00:00', 199.00, 'czk', 'txn_005', 'failed', '2025-07-02 14:00:00', '2025-07-02 14:00:00');

INSERT INTO public.user_manual_interaction (id, user_id, manual_id, user_manual_interaction_type, created_at) VALUES
(1, 1, 1, 'view', '2025-07-01 10:00:00'),
(2, 1, 1, 'like', '2025-06-29 11:00:00'),
(3, 3, 2, 'view', '2025-06-25 14:30:00'),
(4, 4, 4, 'view', '2025-07-01 09:15:00'),
(5, 5, 5, 'share', '2025-06-30 18:00:00');

INSERT INTO public.comment (id, uuid, parent_comment_id, user_id, manual_id, education_mode_id, comment_text, comment_on_type, rating, commented_at) VALUES
(1, 'comment-1-uuid', NULL, 1, 1, NULL, 'Skvělý návod pro začátečníky!', 'manual', 5, '2025-08-07 21:52:44'),
(2, 'comment-2-uuid', NULL, 3, NULL, 1, 'Výborné video, děkuji!', 'education_mode', 4, '2025-08-07 21:52:44'),
(3, 'comment-3-uuid', 1, 4, 1, NULL, 'Souhlasím, je to velmi jasné.', 'manual', 5, '2025-08-07 21:52:44'),
(4, 'comment-4-uuid', NULL, 5, NULL, 2, 'Máte v plánu další lekce?', 'education_mode', NULL, '2025-08-07 21:52:44'),
(5, 'comment-5-uuid', 4, 1, NULL, 2, 'Taky bych ráda věděla.', 'education_mode', NULL, '2025-08-07 21:52:44');
