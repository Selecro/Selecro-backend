CREATE TABLE public.user (
    id BIGSERIAL PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE NOT NULL,
    date_of_birth DATE,
    account_status VARCHAR(255) CHECK (account_status IN ('active', 'suspended', 'deleted', 'pending_verification')) DEFAULT 'pending_verification' NOT NULL,
    last_login_at TIMESTAMP,
    last_active_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    phone_number VARCHAR(20),
    is_oauth_user BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE TABLE public.device (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    device_name VARCHAR(255) NOT NULL,
    last_used_at TIMESTAMP,
    is_trusted BOOLEAN DEFAULT FALSE NOT NULL,
    biometric_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    device_language_preference VARCHAR(255) CHECK (device_language_preference IN ('en', 'cz')) DEFAULT 'cz' NOT NULL,
    device_os VARCHAR(100),
    device_version VARCHAR(100),
    device_fingerprint TEXT,
    device_token TEXT,
    last_known_ip VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES public.user(id)
);

CREATE INDEX idx_device_user_id ON public.device(user_id);
CREATE INDEX idx_device_last_used_at ON public.device(last_used_at);
CREATE INDEX idx_device_device_token ON public.device(device_token);
CREATE INDEX idx_device_device_language_preference ON public.device(device_language_preference);

CREATE TABLE public.session (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    device_id BIGINT NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    user_agent TEXT,
    ip_address VARCHAR(45),
    country VARCHAR(100),
    region VARCHAR(100),
    city VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    cookie_consent BOOLEAN DEFAULT FALSE NOT NULL,
    system_version VARCHAR(100),
    public_key TEXT,
    FOREIGN KEY (user_id) REFERENCES public.user(id),
    FOREIGN KEY (device_id) REFERENCES public.device(id)
);

CREATE INDEX idx_session_user_id ON public.session(user_id);
CREATE INDEX idx_session_device_id ON public.session(device_id);
CREATE INDEX idx_session_is_active ON public.session(is_active);

CREATE TABLE public.file (
    id BIGSERIAL PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(255) CHECK (file_type IN ('image', 'video', 'document', 'other')) NOT NULL,
    file_category VARCHAR(255) CHECK (file_category IN ('profile_picture', 'user_uploaded_document', 'system_generated_document', 'invoice', 'report', 'contract', 'other_category')) NOT NULL,
    file_size_bytes BIGINT,
    mime_type VARCHAR(100),
    file_checksum VARCHAR(64),
    storage_url VARCHAR(512) UNIQUE NOT NULL,
    storage_service VARCHAR(100),
    storage_identifier VARCHAR(255) UNIQUE,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    creator_user_id BIGINT NOT NULL,
    session_id BIGINT,
    deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMP,
    deleted_by BIGINT,
    FOREIGN KEY (creator_user_id) REFERENCES public.user(id),
    FOREIGN KEY (deleted_by) REFERENCES public.user(id),
    FOREIGN KEY (session_id) REFERENCES public.session(id)
);

CREATE INDEX idx_file_creator_user_id ON public.file(creator_user_id);
CREATE INDEX idx_file_category ON public.file(file_category);
CREATE INDEX idx_file_deleted ON public.file(deleted);
CREATE INDEX idx_file_session_id ON public.file(session_id);

CREATE TABLE public.user_file (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    file_id BIGINT NOT NULL,
    session_id BIGINT,
    generated_or_uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES public.user(id),
    FOREIGN KEY (file_id) REFERENCES public.file(id),
    FOREIGN KEY (session_id) REFERENCES public.session(id),
    UNIQUE (user_id, file_id)
);

CREATE INDEX idx_user_file_user_id ON public.user_file(user_id);
CREATE INDEX idx_user_file_file_id ON public.user_file(file_id);
CREATE INDEX idx_user_file_session_id ON public.user_file(session_id);

CREATE TABLE public.user_setting (
    user_id BIGINT PRIMARY KEY,
    bio TEXT,
    dark_mode BOOLEAN DEFAULT FALSE NOT NULL,
    user_language_preference VARCHAR(255) CHECK (user_language_preference IN ('en', 'cz')) DEFAULT 'cz' NOT NULL,
    user_display_status VARCHAR(255) CHECK (user_display_status IN ('online', 'away', 'do_not_disturb', 'invisible', 'not_set')) DEFAULT 'not_set' NOT NULL,
    terms_privacy_agreement_accepted_at TIMESTAMP,
    gdpr_consent_given_at TIMESTAMP,
    profile_picture_file_id BIGINT,
    session_id BIGINT,
    FOREIGN KEY (user_id) REFERENCES public.user(id),
    FOREIGN KEY (profile_picture_file_id) REFERENCES public.file(id),
    FOREIGN KEY (session_id) REFERENCES public.session(id)
);

CREATE INDEX idx_user_setting_user_language_preference ON public.user_setting(user_language_preference);
CREATE INDEX idx_user_setting_profile_picture_file_id ON public.user_setting(profile_picture_file_id);
CREATE INDEX idx_user_setting_session_id ON public.user_setting(session_id);

CREATE TABLE public.user_location (
    user_id BIGINT PRIMARY KEY,
    country VARCHAR(100),
    city VARCHAR(100),
    postal_code VARCHAR(20),
    street_address VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    session_id BIGINT,
    FOREIGN KEY (user_id) REFERENCES public.user(id),
    FOREIGN KEY (session_id) REFERENCES public.session(id)
);

CREATE INDEX idx_user_location_country ON public.user_location(country);
CREATE INDEX idx_user_location_city ON public.user_location(city);
CREATE INDEX idx_user_location_session_id ON public.user_location(session_id);

CREATE TABLE public.user_notification_setting (
    user_id BIGINT PRIMARY KEY,
    receive_news BOOLEAN DEFAULT TRUE NOT NULL,
    receive_private_messages BOOLEAN DEFAULT TRUE NOT NULL,
    marketing_consent_given_at TIMESTAMP,
    session_id BIGINT,
    FOREIGN KEY (user_id) REFERENCES public.user(id),
    FOREIGN KEY (session_id) REFERENCES public.session(id)
);

CREATE INDEX idx_user_notification_session_id ON public.user_notification_setting(session_id);

CREATE TABLE public.user_security (
    user_id BIGINT PRIMARY KEY,
    two_factor_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    recovery_email VARCHAR(255),
    failed_login_attempts INTEGER DEFAULT 0 NOT NULL,
    password_last_changed_at TIMESTAMP,
    last_login_ip VARCHAR(45),
    password_hash VARCHAR(255),
    session_id BIGINT,
    FOREIGN KEY (user_id) REFERENCES public.user(id),
    FOREIGN KEY (session_id) REFERENCES public.session(id)
);

CREATE INDEX idx_user_security_session_id ON public.user_security(session_id);

CREATE TABLE public.role (
    id BIGSERIAL PRIMARY KEY,
    creator_user_id BIGINT NOT NULL,
    role_name VARCHAR(255) CHECK (role_name IN ('admin', 'user', 'marketer', 'educator', 'customer')) DEFAULT 'user' NOT NULL,
    role_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMP,
    deleted_by BIGINT,
    FOREIGN KEY (creator_user_id) REFERENCES public.user(id),
    FOREIGN KEY (deleted_by) REFERENCES public.user(id)
);

CREATE INDEX idx_role_deleted ON public.role(deleted);

CREATE TABLE public.permission (
    id BIGSERIAL PRIMARY KEY,
    creator_user_id BIGINT NOT NULL,
    resource_type VARCHAR(255) CHECK (resource_type IN ('user', 'user_setting', 'user_location', 'user_notification_setting', 'user_security', 'file', 'user_file', 'role', 'permission', 'device', 'login_history', 'two_factor_auth_log', 'system_log', 'two_factor_auth_method', 'password_history', 'oauth_account', 'two_factor_auth_backup_code', 'user_role', 'role_permission', 'session', 'follower', 'badge', 'user_badge', 'notification', 'news', 'news_delivery', 'education_mode', 'tool', 'education_step', 'dictionary', 'manual', 'manual_step', 'manual_progress', 'manual_purchase', 'user_manual_interaction', 'comment')) NOT NULL,
    action_type VARCHAR(255) CHECK (action_type IN ('read', 'write', 'delete', 'update')) NOT NULL,
    permission_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMP,
    deleted_by BIGINT,
    UNIQUE (resource_type, action_type),
    FOREIGN KEY (creator_user_id) REFERENCES public.user(id),
    FOREIGN KEY (deleted_by) REFERENCES public.user(id)
);

CREATE INDEX idx_permission_deleted ON public.permission(deleted);

CREATE TABLE public.user_role (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES public.user(id),
    FOREIGN KEY (role_id) REFERENCES public.role(id),
    UNIQUE (user_id, role_id)
);

CREATE INDEX idx_user_role_user_id ON public.user_role(user_id);
CREATE INDEX idx_user_role_role_id ON public.user_role(role_id);

CREATE TABLE public.role_permission (
    id BIGSERIAL PRIMARY KEY,
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    FOREIGN KEY (role_id) REFERENCES public.role(id),
    FOREIGN KEY (permission_id) REFERENCES public.permission(id),
    UNIQUE (role_id, permission_id)
);

CREATE INDEX idx_role_permission_role_id ON public.role_permission(role_id);
CREATE INDEX idx_role_permission_permission_id ON public.role_permission(permission_id);

CREATE TABLE public.login_history (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    login_status VARCHAR(255) CHECK (login_status IN ('success', 'failure', 'pending_2fa')) NOT NULL,
    failure_reason VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    session_id BIGINT,
    FOREIGN KEY (user_id) REFERENCES public.user(id),
    FOREIGN KEY (session_id) REFERENCES public.session(id)
);

CREATE INDEX idx_login_history_user_id ON public.login_history(user_id);
CREATE INDEX idx_login_history_session_id ON public.login_history(session_id);

CREATE TABLE public.two_factor_auth_log (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    two_factor_auth_log_method_type VARCHAR(255) CHECK (two_factor_auth_log_method_type IN ('email', 'TOTP', 'biometric', 'U2F', 'backup_code')) NOT NULL,
    success BOOLEAN NOT NULL,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ip_address VARCHAR(45),
    session_id BIGINT,
    FOREIGN KEY (user_id) REFERENCES public.user(id),
    FOREIGN KEY (session_id) REFERENCES public.session(id)
);

CREATE INDEX idx_2fa_log_user_id ON public.two_factor_auth_log(user_id);
CREATE INDEX idx_2fa_log_session_id ON public.two_factor_auth_log(session_id);

CREATE TABLE public.system_log (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    system_log_type VARCHAR(255) CHECK (system_log_type IN ('authentication', 'data_access', 'error', 'system_event')) NOT NULL,
    system_log_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    system_action VARCHAR(255) CHECK (system_action IN ('create', 'read', 'update', 'delete', 'login', 'logout', 'error')) NOT NULL,
    resource_id VARCHAR(255),
    system_severity VARCHAR(255) CHECK (system_severity IN ('info', 'warning', 'error', 'debug', 'critical')) NOT NULL,
    details TEXT,
    metadata JSON,
    session_id BIGINT,
    FOREIGN KEY (user_id) REFERENCES public.user(id),
    FOREIGN KEY (session_id) REFERENCES public.session(id)
);

CREATE INDEX idx_system_log_user_id ON public.system_log(user_id);
CREATE INDEX idx_system_system_log_type ON public.system_log(system_log_type);
CREATE INDEX idx_system_log_system_severity ON public.system_log(system_severity);
CREATE INDEX idx_system_log_session_id ON public.system_log(session_id);

CREATE TABLE public.two_factor_auth_method (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    two_factor_auth_method_type VARCHAR(255) CHECK (two_factor_auth_method_type IN ('email', 'TOTP', 'biometric', 'U2F')) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE NOT NULL,
    two_factor_auth_method_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    verified BOOLEAN DEFAULT FALSE NOT NULL,
    secret_data TEXT,
    session_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES public.user(id),
    FOREIGN KEY (session_id) REFERENCES public.session(id),
    UNIQUE (user_id, two_factor_auth_method_type)
);

CREATE INDEX idx_2fa_method_user_id ON public.two_factor_auth_method(user_id);
CREATE INDEX idx_2fa_method_session_id ON public.two_factor_auth_method(session_id);

CREATE TABLE public.password_history (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    session_id BIGINT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES public.user(id),
    FOREIGN KEY (session_id) REFERENCES public.session(id)
);

CREATE INDEX idx_password_history_user_id ON public.password_history(user_id);
CREATE INDEX idx_password_history_session_id ON public.password_history(session_id);

CREATE TABLE public.oauth_account (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    oauth_provider VARCHAR(255) CHECK (oauth_provider IN ('google', 'apple', 'github', 'facebook', 'microsoft', 'linkedin')) NOT NULL,
    provider_user_id VARCHAR(255) UNIQUE NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_expires_at TIMESTAMP,
    session_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES public.user(id),
    FOREIGN KEY (session_id) REFERENCES public.session(id),
    UNIQUE (user_id, oauth_provider)
);

CREATE INDEX idx_oauth_user_id ON public.oauth_account(user_id);
CREATE INDEX idx_oauth_provider_user_id ON public.oauth_account(provider_user_id);
CREATE INDEX idx_oauth_session_id ON public.oauth_account(session_id);

CREATE TABLE public.two_factor_auth_backup_code (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    code_hash VARCHAR(255) UNIQUE NOT NULL,
    used_at TIMESTAMP,
    session_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    batch_id VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES public.user(id),
    FOREIGN KEY (session_id) REFERENCES public.session(id)
);

CREATE INDEX idx_2fa_backup_code_user_id ON public.two_factor_auth_backup_code(user_id);
CREATE INDEX idx_2fa_backup_code_session_id ON public.two_factor_auth_backup_code(session_id);

CREATE TABLE public.follower (
    id BIGSERIAL PRIMARY KEY,
    follower_id BIGINT NOT NULL,
    followed_id BIGINT NOT NULL,
    followed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    FOREIGN KEY (follower_id) REFERENCES public.user(id) ON DELETE CASCADE,
    FOREIGN KEY (followed_id) REFERENCES public.user(id) ON DELETE CASCADE,
    UNIQUE (follower_id, followed_id)
);

CREATE INDEX idx_follower_follower_id ON public.follower(follower_id);
CREATE INDEX idx_follower_followed_id ON public.follower(followed_id);

CREATE TABLE public.badge (
    id BIGSERIAL PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    creator_user_id BIGINT NOT NULL,
    image_file_id BIGINT,
    badge_name VARCHAR(255) UNIQUE NOT NULL,
    badge_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMP,
    deleted_by BIGINT,
    FOREIGN KEY (image_file_id) REFERENCES public.file(id),
    FOREIGN KEY (creator_user_id) REFERENCES public.user(id),
    FOREIGN KEY (deleted_by) REFERENCES public.user(id)
);

CREATE INDEX idx_badge_uuid ON public.badge(uuid);
CREATE INDEX idx_badge_deleted ON public.badge(deleted);

CREATE TABLE public.user_badge (
    id BIGSERIAL PRIMARY KEY,
    badge_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    visible_on_profile BOOLEAN DEFAULT TRUE NOT NULL,
    FOREIGN KEY (badge_id) REFERENCES public.badge(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES public.user(id) ON DELETE CASCADE,
    UNIQUE (badge_id, user_id)
);

CREATE INDEX idx_user_badge_badge_id ON public.user_badge(badge_id);
CREATE INDEX idx_user_badge_user_id ON public.user_badge(user_id);

CREATE TABLE public.notification (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    creator_user_id BIGINT NOT NULL,
    audience_type VARCHAR(50) DEFAULT 'user' NOT NULL CHECK (audience_type IN ('user', 'group', 'broadcast')),
    title VARCHAR(255) NOT NULL,
    notification_message TEXT NOT NULL,
    notification_type VARCHAR(255) CHECK (notification_type IN ('info', 'warning', 'error', 'success', 'promotion', 'activity')) NOT NULL,
    image_url VARCHAR(2048),
    action_url VARCHAR(2048),
    extra_data JSON,
    read_at TIMESTAMP,
    session_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMP,
    deleted_by BIGINT,
    FOREIGN KEY (user_id) REFERENCES public.user(id) ON DELETE CASCADE,
    FOREIGN KEY (creator_user_id) REFERENCES public.user(id),
    FOREIGN KEY (deleted_by) REFERENCES public.user(id),
    FOREIGN KEY (session_id) REFERENCES public.session(id)
);

CREATE INDEX idx_notification_user_id ON public.notification(user_id);
CREATE INDEX idx_notification_creator_user_id ON public.notification(creator_user_id);
CREATE INDEX idx_notification_created_at ON public.notification(created_at);
CREATE INDEX idx_notification_read_at ON public.notification(read_at);
CREATE INDEX idx_notification_deleted ON public.notification(deleted);
CREATE INDEX idx_notification_session_id ON public.notification(session_id);

CREATE TABLE public.news (
    id BIGSERIAL PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    creator_user_id BIGINT NOT NULL,
    image_file_id BIGINT,
    title_cz VARCHAR(255) NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    content_cz TEXT NOT NULL,
    content_en TEXT NOT NULL,
    published_at TIMESTAMP,
    news_status VARCHAR(255) CHECK (news_status IN ('active', 'draft', 'archived')) DEFAULT 'draft' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMP,
    deleted_by BIGINT,
    FOREIGN KEY (creator_user_id) REFERENCES public.user(id) ON DELETE RESTRICT,
    FOREIGN KEY (image_file_id) REFERENCES public.file(id),
    FOREIGN KEY (deleted_by) REFERENCES public.user(id)
);

CREATE INDEX idx_news_creator_user_id ON public.news(creator_user_id);
CREATE INDEX idx_news_published_at ON public.news(published_at);
CREATE INDEX idx_news_news_status ON public.news(news_status);
CREATE INDEX idx_news_uuid ON public.news(uuid);
CREATE INDEX idx_news_deleted ON public.news(deleted);

CREATE TABLE public.news_delivery (
    id BIGSERIAL PRIMARY KEY,
    news_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    device_id BIGINT,
    news_delivery_language VARCHAR(255) CHECK (news_delivery_language IN ('cz', 'en')) DEFAULT 'cz' NOT NULL,
    sent_as_push BOOLEAN DEFAULT FALSE NOT NULL,
    delivered_as_in_app BOOLEAN DEFAULT FALSE NOT NULL,
    read_at TIMESTAMP,
    session_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (news_id) REFERENCES public.news(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES public.user(id) ON DELETE CASCADE,
    FOREIGN KEY (device_id) REFERENCES public.device(id),
    FOREIGN KEY (session_id) REFERENCES public.session(id),
    UNIQUE (news_id, user_id, device_id)
);

CREATE INDEX idx_news_delivery_news_id ON public.news_delivery(news_id);
CREATE INDEX idx_news_delivery_user_id ON public.news_delivery(user_id);
CREATE INDEX idx_news_delivery_read_at ON public.news_delivery(read_at);
CREATE INDEX idx_news_delivery_session_id ON public.news_delivery(session_id);

CREATE TABLE public.tool (
    id BIGSERIAL PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    creator_user_id BIGINT NOT NULL,
    image_file_id BIGINT,
    title_cz VARCHAR(255) NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    description_cz TEXT,
    description_en TEXT,
    video_url VARCHAR(2048),
    tool_status VARCHAR(255) CHECK (tool_status IN ('active', 'draft', 'archived')) DEFAULT 'draft' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMP,
    deleted_by BIGINT,
    FOREIGN KEY (creator_user_id) REFERENCES public.user(id),
    FOREIGN KEY (image_file_id) REFERENCES public.file(id),
    FOREIGN KEY (deleted_by) REFERENCES public.user(id)
);

CREATE INDEX idx_tool_creator_user_id ON public.tool(creator_user_id);
CREATE INDEX idx_tool_uuid ON public.tool(uuid);
CREATE INDEX idx_tool_deleted ON public.tool(deleted);
CREATE INDEX idx_tool_status ON public.tool(tool_status);
CREATE INDEX idx_tool_created_at ON public.tool(created_at);
CREATE INDEX idx_tool_creator_status_deleted ON public.tool(creator_user_id, tool_status, deleted);

CREATE TABLE public.dictionary (
    id BIGSERIAL PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    creator_user_id BIGINT NOT NULL,
    image_file_id BIGINT,
    animation_file_id BIGINT,
    mark_file_id BIGINT,
    title_cz VARCHAR(255) NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    description_cz TEXT,
    description_en TEXT,
    abbrevation_cz VARCHAR(50),
    abbrevation_en VARCHAR(50),
    dictionary_status VARCHAR(255) CHECK (dictionary_status IN ('active', 'draft', 'archived')) DEFAULT 'draft' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMP,
    deleted_by BIGINT,
    FOREIGN KEY (creator_user_id) REFERENCES public.user(id),
    FOREIGN KEY (image_file_id) REFERENCES public.file(id),
    FOREIGN KEY (animation_file_id) REFERENCES public.file(id),
    FOREIGN KEY (mark_file_id) REFERENCES public.file(id),
    FOREIGN KEY (deleted_by) REFERENCES public.user(id)
);

CREATE INDEX idx_dictionary_creator_user_id ON public.dictionary(creator_user_id);
CREATE INDEX idx_dictionary_uuid ON public.dictionary(uuid);
CREATE INDEX idx_dictionary_deleted ON public.dictionary(deleted);
CREATE INDEX idx_dictionary_status ON public.dictionary(dictionary_status);
CREATE INDEX idx_dictionary_created_at ON public.dictionary(created_at);
CREATE INDEX idx_dictionary_creator_status_deleted ON public.dictionary(creator_user_id, dictionary_status, deleted);

CREATE TABLE public.education_mode (
    id BIGSERIAL PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    creator_user_id BIGINT NOT NULL,
    image_file_id BIGINT,
    title_cz VARCHAR(255) NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    description_cz TEXT,
    description_en TEXT,
    tool VARCHAR(255),
    education_mode_status VARCHAR(255) CHECK (education_mode_status IN ('active', 'draft', 'archived')) DEFAULT 'draft' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMP,
    deleted_by BIGINT,
    FOREIGN KEY (creator_user_id) REFERENCES public.user(id),
    FOREIGN KEY (image_file_id) REFERENCES public.file(id),
    FOREIGN KEY (deleted_by) REFERENCES public.user(id)
);

CREATE INDEX idx_education_mode_creator_user_id ON public.education_mode(creator_user_id);
CREATE INDEX idx_education_mode_uuid ON public.education_mode(uuid);
CREATE INDEX idx_education_mode_deleted ON public.education_mode(deleted);
CREATE INDEX idx_education_mode_status ON public.education_mode(education_mode_status);
CREATE INDEX idx_education_mode_created_at ON public.education_mode(created_at);
CREATE INDEX idx_education_mode_creator_status_deleted ON public.education_mode(creator_user_id, education_mode_status, deleted);

CREATE TABLE public.education_step (
    id BIGSERIAL PRIMARY KEY,
    education_mode_id BIGINT NOT NULL,
    description_cz TEXT,
    description_en TEXT,
    video_url VARCHAR(2048),
    tool VARCHAR(255),
    step_order INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMP,
    deleted_by BIGINT,
    FOREIGN KEY (education_mode_id) REFERENCES public.education_mode(id) ON DELETE CASCADE,
    FOREIGN KEY (deleted_by) REFERENCES public.user(id),
    UNIQUE (education_mode_id, step_order)
);

CREATE INDEX idx_education_step_education_mode_id ON public.education_step(education_mode_id);
CREATE INDEX idx_education_step_deleted ON public.education_step(deleted);
CREATE INDEX idx_education_step_mode_order_deleted ON public.education_step(education_mode_id, step_order, deleted);

CREATE TABLE public.manual (
    id BIGSERIAL PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    creator_user_id BIGINT NOT NULL,
    image_file_id BIGINT,
    title VARCHAR(255) NOT NULL,
    manual_difficulty VARCHAR(255) CHECK (manual_difficulty IN ('beginner', 'intermediate', 'advanced')) NOT NULL,
    price DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
    manual_language VARCHAR(50) CHECK (manual_language IN ('cz', 'en')) DEFAULT 'cz' NOT NULL,
    crochet_abbreviation VARCHAR(50),
    crochet_tool VARCHAR(255),
    manual_type VARCHAR(255) CHECK (manual_type IN ('assembly', 'repair', 'how_to', 'guide', 'other')),
    manual_status VARCHAR(255) CHECK (manual_status IN ('public', 'private', 'premium', 'draft', 'archived')) DEFAULT 'draft' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMP,
    deleted_by BIGINT,
    FOREIGN KEY (creator_user_id) REFERENCES public.user(id),
    FOREIGN KEY (image_file_id) REFERENCES public.file(id),
    FOREIGN KEY (deleted_by) REFERENCES public.user(id)
);

CREATE INDEX idx_manual_creator_user_id ON public.manual(creator_user_id);
CREATE INDEX idx_manual_uuid ON public.manual(uuid);
CREATE INDEX idx_manual_deleted ON public.manual(deleted);
CREATE INDEX idx_manual_manual_language ON public.manual(manual_language);
CREATE INDEX idx_manual_status ON public.manual(manual_status);
CREATE INDEX idx_manual_type ON public.manual(manual_type);
CREATE INDEX idx_manual_difficulty ON public.manual(manual_difficulty);
CREATE INDEX idx_manual_creator_language_status_deleted ON public.manual(creator_user_id, manual_language, manual_status, deleted);

CREATE TABLE public.manual_step (
    id BIGSERIAL PRIMARY KEY,
    manual_id BIGINT NOT NULL,
    image_file_id BIGINT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    step_order INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMP,
    deleted_by BIGINT,
    FOREIGN KEY (manual_id) REFERENCES public.manual(id) ON DELETE CASCADE,
    FOREIGN KEY (image_file_id) REFERENCES public.file(id),
    FOREIGN KEY (deleted_by) REFERENCES public.user(id),
    UNIQUE (manual_id, step_order)
);

CREATE INDEX idx_manual_step_manual_id ON public.manual_step(manual_id);
CREATE INDEX idx_manual_step_deleted ON public.manual_step(deleted);
CREATE INDEX idx_manual_step_manual_order_deleted ON public.manual_step(manual_id, step_order, deleted);

CREATE TABLE public.manual_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    manual_id BIGINT NOT NULL,
    current_step_id BIGINT,
    total_time_seconds INT DEFAULT 0 NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_finished BOOLEAN DEFAULT FALSE NOT NULL,
    session_id BIGINT,
    deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMP,
    deleted_by BIGINT,
    FOREIGN KEY (current_step_id) REFERENCES public.manual_step(id),
    FOREIGN KEY (user_id) REFERENCES public.user(id) ON DELETE CASCADE,
    FOREIGN KEY (manual_id) REFERENCES public.manual(id) ON DELETE CASCADE,
    FOREIGN KEY (deleted_by) REFERENCES public.user(id),
    FOREIGN KEY (session_id) REFERENCES public.session(id),
    UNIQUE (user_id, manual_id)
);

CREATE INDEX idx_manual_progress_user_id ON public.manual_progress(user_id);
CREATE INDEX idx_manual_progress_manual_id ON public.manual_progress(manual_id);
CREATE INDEX idx_manual_progress_deleted ON public.manual_progress(deleted);
CREATE INDEX idx_manual_progress_session_id ON public.manual_progress(session_id);

CREATE TABLE public.manual_purchase (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    manual_id BIGINT NOT NULL,
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    price_paid DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(255) CHECK (currency IN ('czk', 'eur', 'usd')) DEFAULT 'czk' NOT NULL,
    transaction_id VARCHAR(255) UNIQUE,
    payment_status VARCHAR(255) CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending' NOT NULL,
    session_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMP,
    deleted_by BIGINT,
    FOREIGN KEY (user_id) REFERENCES public.user(id) ON DELETE CASCADE,
    FOREIGN KEY (manual_id) REFERENCES public.manual(id) ON DELETE CASCADE,
    FOREIGN KEY (deleted_by) REFERENCES public.user(id),
    FOREIGN KEY (session_id) REFERENCES public.session(id),
    UNIQUE (user_id, manual_id)
);

CREATE INDEX idx_manual_purchase_user_id ON public.manual_purchase(user_id);
CREATE INDEX idx_manual_purchase_manual_id ON public.manual_purchase(manual_id);
CREATE INDEX idx_manual_purchase_transaction_id ON public.manual_purchase(transaction_id);
CREATE INDEX idx_manual_purchase_deleted ON public.manual_purchase(deleted);
CREATE INDEX idx_manual_purchase_session_id ON public.manual_purchase(session_id);

CREATE TABLE public.user_manual_interaction (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    manual_id BIGINT NOT NULL,
    user_manual_interaction_type VARCHAR(255) CHECK (user_manual_interaction_type IN ('view', 'like', 'share', 'save')) NOT NULL,
    session_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMP,
    deleted_by BIGINT,
    FOREIGN KEY (manual_id) REFERENCES public.manual(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES public.user(id) ON DELETE CASCADE,
    FOREIGN KEY (deleted_by) REFERENCES public.user(id),
    FOREIGN KEY (session_id) REFERENCES public.session(id)
);

CREATE INDEX idx_user_manual_interaction_user_id ON public.user_manual_interaction(user_id);
CREATE INDEX idx_user_manual_interaction_manual_id ON public.user_manual_interaction(manual_id);
CREATE INDEX idx_user_manual_user_manual_interaction_type ON public.user_manual_interaction(user_manual_interaction_type);
CREATE INDEX idx_user_manual_interaction_deleted ON public.user_manual_interaction(deleted);
CREATE INDEX idx_user_manual_interaction_session_id ON public.user_manual_interaction(session_id);

CREATE TABLE public.comment (
    id BIGSERIAL PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    parent_comment_id BIGINT,
    user_id BIGINT NOT NULL,
    manual_id BIGINT,
    education_mode_id BIGINT,
    comment_text TEXT NOT NULL,
    commented_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    comment_on_type VARCHAR(255) CHECK (comment_on_type IN ('manual', 'education_mode')) NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    session_id BIGINT,
    deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMP,
    deleted_by BIGINT,
    FOREIGN KEY (manual_id) REFERENCES public.manual(id) ON DELETE CASCADE,
    FOREIGN KEY (education_mode_id) REFERENCES public.education_mode(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES public.user(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES public.comment(id) ON DELETE CASCADE,
    FOREIGN KEY (deleted_by) REFERENCES public.user(id),
    FOREIGN KEY (session_id) REFERENCES public.session(id)
);

CREATE INDEX idx_comment_user_id ON public.comment(user_id);
CREATE INDEX idx_comment_manual_id ON public.comment(manual_id);
CREATE INDEX idx_comment_education_mode_id ON public.comment(education_mode_id);
CREATE INDEX idx_comment_parent_comment_id ON public.comment(parent_comment_id);
CREATE INDEX idx_comment_on_type ON public.comment(comment_on_type);
CREATE INDEX idx_comment_uuid ON public.comment(uuid);
CREATE INDEX idx_comment_deleted ON public.comment(deleted);
CREATE INDEX idx_comment_session_id ON public.comment(session_id);
