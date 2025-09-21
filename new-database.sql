CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    user_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    username VARCHAR(30) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login TIMESTAMPTZ,
    account_status VARCHAR(20) NOT NULL DEFAULT 'active',
    CONSTRAINT check_username_length CHECK (LENGTH(username) >= 3 AND LENGTH(username) <= 30),
    CONSTRAINT check_email_format CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$')
);

CREATE TABLE user_profiles (
    user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    bio TEXT,
    profile_picture_file_id BIGINT REFERENCES files(id) ON DELETE SET NULL,
    website_url VARCHAR(255),
    location VARCHAR(100),
    date_of_birth DATE,
    is_private BOOLEAN NOT NULL DEFAULT FALSE,
    follower_count INTEGER NOT NULL DEFAULT 0,
    following_count INTEGER NOT NULL DEFAULT 0,
    post_count INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'offline',
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_status CHECK (status IN ('online', 'away', 'busy', 'offline'))
);

CREATE TABLE user_settings (
    user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(50) DEFAULT 'light',
    language_code VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    email_verified BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE user_consents (
    user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    terms_of_service_accepted_at TIMESTAMPTZ,
    privacy_policy_accepted_at TIMESTAMPTZ,
    marketing_consent_given_at TIMESTAMPTZ,
    data_processing_consent_given_at TIMESTAMPTZ,
    third_party_data_sharing_consent_given_at TIMESTAMPTZ,
    CONSTRAINT check_tos_accepted CHECK (terms_of_service_accepted_at IS NOT NULL),
    CONSTRAINT check_pp_accepted CHECK (privacy_policy_accepted_at IS NOT NULL)
);

CREATE TABLE user_notification_preferences (
    user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    email_new_followers BOOLEAN NOT NULL DEFAULT TRUE,
    email_post_likes BOOLEAN NOT NULL DEFAULT TRUE,
    email_mentions BOOLEAN NOT NULL DEFAULT TRUE,
    email_promotional BOOLEAN NOT NULL DEFAULT TRUE,
    push_new_followers BOOLEAN NOT NULL DEFAULT TRUE,
    push_post_likes BOOLEAN NOT NULL DEFAULT TRUE,
    push_mentions BOOLEAN NOT NULL DEFAULT TRUE,
    push_promotional BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE user_auth (
    user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    recovery_email VARCHAR(255) UNIQUE,
    phone_number VARCHAR(20) UNIQUE,
    last_password_change TIMESTAMPTZ,
    CONSTRAINT check_recovery_email_format CHECK (recovery_email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$')
);

CREATE TABLE user_metadata (
    user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    sign_up_ip INET NOT NULL,
    last_login_ip INET,
    user_agent_info VARCHAR(255),
    referral_source VARCHAR(100),
    is_bot BOOLEAN NOT NULL DEFAULT FALSE,
    custom_data JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE user_activity_log (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    event_description TEXT,
    ip_address INET,
    user_agent TEXT,
    device_info JSONB,
    location_info JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE oauth_providers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_oauth_accounts (
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    provider_id INTEGER REFERENCES oauth_providers(id) ON DELETE CASCADE,
    provider_user_id VARCHAR(255) NOT NULL,
    access_token VARCHAR(255) NOT NULL,
    refresh_token VARCHAR(255),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, provider_id),
    UNIQUE (provider_id, provider_user_id)
);

CREATE TABLE user_2fa_methods (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    method VARCHAR(20) NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    secret VARCHAR(255),
    phone_number VARCHAR(20),
    email VARCHAR(255),
    last_verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_2fa_method CHECK (method IN ('authenticator', 'sms', 'email', 'security_key'))
);

CREATE TABLE user_2fa_backup_codes (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    batch_id UUID NOT NULL,
    code_hash VARCHAR(255) UNIQUE NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_login_history (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    login_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address INET NOT NULL,
    user_agent TEXT,
    is_successful BOOLEAN NOT NULL,
    fail_reason VARCHAR(50),
    country VARCHAR(100)
);

CREATE TABLE user_2fa_login_log (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_successful BOOLEAN NOT NULL,
    method_used VARCHAR(20) NOT NULL,
    ip_address INET NOT NULL,
    fail_reason VARCHAR(50)
);

CREATE TABLE followers (
    follower_user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    followed_user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(10) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (follower_user_id, followed_user_id),
    CONSTRAINT valid_status CHECK (status IN ('pending', 'approved'))
);

CREATE TABLE user_reports (
    id BIGSERIAL PRIMARY KEY,
    reporter_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    reported_user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    moderator_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    moderated_at TIMESTAMPTZ,
    report_details JSONB,
    attached_file_id BIGINT REFERENCES files(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_report_status CHECK (status IN ('pending', 'approved', 'rejected'))
);

CREATE TABLE files (
    id BIGSERIAL PRIMARY KEY,
    file_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    uploader_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    file_category VARCHAR(255) CHECK (file_category IN ('profile_picture', 'user_document', 'system_document', 'other', 'contract')) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    file_checksum VARCHAR(64),
    storage_url VARCHAR(512) UNIQUE NOT NULL,
    storage_service VARCHAR(100) NOT NULL,
    storage_identifier VARCHAR(255) UNIQUE NOT NULL,
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    is_system_generated BOOLEAN NOT NULL DEFAULT FALSE,
    is_admin_uploaded BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_file_access (
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    file_id BIGINT REFERENCES files(id) ON DELETE CASCADE,
    access_granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, file_id)
);

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE role_permissions (
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE user_roles (
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE public.device (
    id BIGSERIAL PRIMARY KEY,
    device_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    device_name VARCHAR(255) NOT NULL,
    last_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_trusted BOOLEAN DEFAULT FALSE NOT NULL,
    biometric_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    device_language_preference VARCHAR(255) CHECK (device_language_preference IN ('en', 'cs')) DEFAULT 'en' NOT NULL,
    device_os VARCHAR(100),
    device_version VARCHAR(100),
    device_fingerprint TEXT,
    device_token TEXT,
    last_known_ip INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.session (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    device_id BIGINT REFERENCES device(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    login_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_active TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    user_agent TEXT,
    ip_address INET,
    country VARCHAR(100),
    region VARCHAR(100),
    city VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    cookie_consent BOOLEAN DEFAULT FALSE NOT NULL,
    system_version VARCHAR(100),
    public_key TEXT
);
