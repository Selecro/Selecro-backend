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
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    bio TEXT,
    profile_picture_url VARCHAR(255),
    website_url VARCHAR(255),
    location VARCHAR(100),
    date_of_birth DATE,
    is_private BOOLEAN NOT NULL DEFAULT FALSE,
    follower_count INTEGER NOT NULL DEFAULT 0,
    following_count INTEGER NOT NULL DEFAULT 0,
    post_count INTEGER NOT NULL DEFAULT 0
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
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    recovery_email VARCHAR(255) UNIQUE,
    phone_number VARCHAR(20) UNIQUE,
    two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    last_password_change TIMESTAMPTZ,
    CONSTRAINT check_recovery_email_format CHECK (recovery_email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$')
);

CREATE TABLE user_metadata (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    sign_up_ip INET NOT NULL,
    last_login_ip INET,
    user_agent_info VARCHAR(255),
    referral_source VARCHAR(100),
    is_bot BOOLEAN NOT NULL DEFAULT FALSE,
    custom_data JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE user_history (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB NOT NULL,
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

CREATE TABLE user_failed_logins (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    ip_address INET NOT NULL,
    user_agent VARCHAR(255),
    attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
