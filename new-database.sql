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

CREATE TABLE user_points (
    user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    balance BIGINT NOT NULL DEFAULT 0,
    last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT non_negative_balance CHECK (balance >= 0)
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

CREATE TABLE points_transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    subtype VARCHAR(50) NOT NULL,
    amount BIGINT NOT NULL,
    balance_after_transaction BIGINT NOT NULL,
    is_revenue BOOLEAN NOT NULL,
    transaction_metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE password_history (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
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

CREATE TABLE device (
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

CREATE TABLE session (
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

CREATE TABLE news (
    id BIGSERIAL PRIMARY KEY,
    news_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    file_id BIGINT REFERENCES files(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    author_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    audience_type VARCHAR(50) NOT NULL DEFAULT 'user',
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    notification_message TEXT NOT NULL,
    notification_type VARCHAR(255) CHECK (notification_type IN ('info', 'warning', 'error', 'success', 'promotion', 'activity', 'system')) NOT NULL,
    image_file_id BIGINT REFERENCES files(id) ON DELETE SET NULL,
    action_url VARCHAR(2048),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read_at TIMESTAMPTZ
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

CREATE TABLE forums (
    id BIGSERIAL PRIMARY KEY,
    forum_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    author_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE threads (
    id BIGSERIAL PRIMARY KEY,
    thread_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    forum_id BIGINT REFERENCES forums(id) ON DELETE CASCADE,
    author_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE support_tickets (
    id BIGSERIAL PRIMARY KEY,
    ticket_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed', 'awaiting_reply')),
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    assigned_to_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    resolution_details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    closed_at TIMESTAMPTZ
);

CREATE TABLE tool (
    id BIGSERIAL PRIMARY KEY,
    tool_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    creator_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_file_id BIGINT REFERENCES files(id) ON DELETE SET NULL,
    video_file_id BIGINT REFERENCES files(id) ON DELETE SET NULL,
    status VARCHAR(255) CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft' NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE dictionary (
    id BIGSERIAL PRIMARY KEY,
    dictionary_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    creator_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    abbreviation VARCHAR(50),
    image_file_id BIGINT REFERENCES files(id) ON DELETE SET NULL,
    animation_file_id BIGINT REFERENCES files(id) ON DELETE SET NULL,
    mark_file_id BIGINT REFERENCES files(id) ON DELETE SET NULL,
    status VARCHAR(255) CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft' NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE education_mode (
    id BIGSERIAL PRIMARY KEY,
    education_mode_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    creator_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    image_file_id BIGINT REFERENCES files(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    tool VARCHAR(255) NOT NULL,
    status VARCHAR(255) CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft' NOT NULL,
    points INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE education_step (
    id BIGSERIAL PRIMARY KEY,
    education_mode_id BIGINT REFERENCES education_mode(id) ON DELETE CASCADE,
    description TEXT,
    video_file_id BIGINT REFERENCES files(id) ON DELETE SET NULL,
    tool VARCHAR(255) NOT NULL,
    step_order INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (education_mode_id, step_order)
);

CREATE TABLE manual (
    id BIGSERIAL PRIMARY KEY,
    manual_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    creator_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    manual_difficulty VARCHAR(20) CHECK (manual_difficulty IN ('easy', 'normal', 'hard')) NOT NULL,
    price INT,
    manual_language VARCHAR(50) CHECK (manual_language IN ('cs', 'en')) DEFAULT 'cs' NOT NULL,
    crochet_abbreviation VARCHAR(50),
    crochet_tool_id BIGINT REFERENCES tool(id) ON DELETE SET NULL,
    color VARCHAR(255),
    size VARCHAR(255),
    dimension VARCHAR(255),
    points INT,
    time_consuming INTERVAL,
    manual_form VARCHAR(255) CHECK (manual_form IN ('draw', 'write')),
    manual_type VARCHAR(20) CHECK (manual_type IN ('assembly', 'repair', 'how_to', 'guide', 'other')),
    status VARCHAR(20) CHECK (status IN ('public', 'premium', 'draft', 'archived')) DEFAULT 'draft' NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE manual_step (
    id BIGSERIAL PRIMARY KEY,
    manual_id BIGINT REFERENCES manual(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_file_id BIGINT REFERENCES files(id) ON DELETE SET NULL,
    video_file_id BIGINT REFERENCES files(id) ON DELETE SET NULL,
    step_order INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (manual_id, step_order)
);

CREATE TABLE status_history (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    user_report_id BIGINT REFERENCES user_reports(id) ON DELETE CASCADE,
    manual_id BIGINT REFERENCES manual(id) ON DELETE CASCADE,
    news_id BIGINT REFERENCES news(id) ON DELETE CASCADE,
    support_ticket_id BIGINT REFERENCES support_tickets(id) ON DELETE CASCADE,
    tool_id BIGINT REFERENCES tool(id) ON DELETE CASCADE,
    dictionary_id BIGINT REFERENCES dictionary(id) ON DELETE CASCADE,
    education_mode_id BIGINT REFERENCES education_mode(id) ON DELETE CASCADE,
    old_status VARCHAR(20) NOT NULL,
    new_status VARCHAR(20) NOT NULL,
    changed_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    change_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT one_entity_only CHECK (
        (CASE WHEN user_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN user_report_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN manual_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN news_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN support_ticket_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN tool_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN dictionary_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN education_mode_id IS NOT NULL THEN 1 ELSE 0 END) = 1
    )
);

CREATE TABLE ratings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    manual_id BIGINT REFERENCES manual(id) ON DELETE CASCADE,
    education_mode_id BIGINT REFERENCES education_mode(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES product(id) ON DELETE CASCADE,
    rating_value SMALLINT NOT NULL CHECK (rating_value >= 1 AND rating_value <= 5),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT one_entity_only CHECK (
        (CASE WHEN manual_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN education_mode_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN product_id IS NOT NULL THEN 1 ELSE 0 END) = 1
    ),
    CONSTRAINT unique_rating UNIQUE (user_id, manual_id, education_mode_id, product_id)
);

CREATE TABLE entity_files (
    id BIGSERIAL PRIMARY KEY,
    file_id BIGINT REFERENCES files(id) ON DELETE CASCADE,
    thread_id BIGINT REFERENCES threads(id) ON DELETE CASCADE,
    support_ticket_id BIGINT REFERENCES support_tickets(id) ON DELETE CASCADE,
    news_id BIGINT REFERENCES news(id) ON DELETE CASCADE,
    user_report_id BIGINT REFERENCES user_reports(id) ON DELETE CASCADE,
    tool_id BIGINT REFERENCES tool(id) ON DELETE CASCADE,
    dictionary_id BIGINT REFERENCES dictionary(id) ON DELETE CASCADE,
    manual_id BIGINT REFERENCES manual(id) ON DELETE CASCADE,
    manual_step_id BIGINT REFERENCES manual_step(id) ON DELETE CASCADE,
    education_mode_id BIGINT REFERENCES education_mode(id) ON DELETE CASCADE,
    education_mode_step_id BIGINT REFERENCES education_step(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES product(id) ON DELETE CASCADE,
    author_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT one_entity_only CHECK (
        (CASE WHEN thread_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN support_ticket_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN news_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN user_report_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN tool_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN dictionary_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN manual_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN manual_step_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN education_mode_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN education_mode_step_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN product_id IS NOT NULL THEN 1 ELSE 0 END) = 1
    ),
    CONSTRAINT unique_file_per_entity UNIQUE (file_id, thread_id, support_ticket_id, news_id, user_report_id, tool_id, dictionary_id, manual_id, manual_step_id, education_mode_id, education_mode_step_id, product_id)
);

CREATE TABLE comments (
    id BIGSERIAL PRIMARY KEY,
    comment_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    thread_id BIGINT REFERENCES threads(id) ON DELETE CASCADE,
    support_ticket_id BIGINT REFERENCES support_tickets(id) ON DELETE CASCADE,
    manual_id BIGINT REFERENCES manual(id) ON DELETE CASCADE,
    education_mode_id BIGINT REFERENCES education_mode(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES product(id) ON DELETE CASCADE,
    parent_comment_id BIGINT REFERENCES comments(id) ON DELETE CASCADE,
    author_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT one_entity_only CHECK (
        (CASE WHEN thread_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN support_ticket_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN manual_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN education_mode_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN product_id IS NOT NULL THEN 1 ELSE 0 END) = 1
    )
);

CREATE TABLE reactions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    comment_id BIGINT REFERENCES comments(id) ON DELETE CASCADE,
    reaction_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_comment_reaction UNIQUE (user_id, comment_id, reaction_type)
);

CREATE TABLE progress_tracking (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    manual_id BIGINT REFERENCES manual(id) ON DELETE CASCADE,
    education_mode_id BIGINT REFERENCES education_mode(id) ON DELETE CASCADE,
    current_step_order INT DEFAULT 0 NOT NULL,
    total_time_seconds INT DEFAULT 0 NOT NULL,
    counter SMALLINT DEFAULT 0 NOT NULL CHECK (counter >= 0 AND counter <= 100),
    is_finished BOOLEAN DEFAULT FALSE NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT one_entity_only CHECK (
        (CASE WHEN manual_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN education_mode_id IS NOT NULL THEN 1 ELSE 0 END) = 1
    ),
    CONSTRAINT unique_progress_per_entity UNIQUE (user_id, manual_id, education_mode_id)
);

CREATE TABLE user_manual_interaction (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    manual_id BIGINT REFERENCES manual(id) ON DELETE CASCADE,
    interaction_type VARCHAR(255) CHECK (interaction_type IN ('view', 'like', 'share', 'save')) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE themes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE manual_product_themes (
    id BIGSERIAL PRIMARY KEY,
    manual_id BIGINT REFERENCES manual(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES product(id) ON DELETE CASCADE,
    theme_id BIGINT REFERENCES themes(id) ON DELETE CASCADE,
    CONSTRAINT one_entity_only CHECK (
        (CASE WHEN manual_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN product_id IS NOT NULL THEN 1 ELSE 0 END) = 1
    ),
    CONSTRAINT unique_theme_link UNIQUE (manual_id, product_id, theme_id)
);

CREATE TABLE manual_product_categories (
    id BIGSERIAL PRIMARY KEY,
    manual_id BIGINT REFERENCES manual(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES product(id) ON DELETE CASCADE,
    category_id BIGINT REFERENCES categories(id) ON DELETE CASCADE,
    CONSTRAINT one_entity_only CHECK (
        (CASE WHEN manual_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN product_id IS NOT NULL THEN 1 ELSE 0 END) = 1
    ),
    CONSTRAINT unique_category_link UNIQUE (manual_id, product_id, category_id)
);

CREATE TABLE product (
    id BIGSERIAL PRIMARY KEY,
    product_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    info TEXT,
    price NUMERIC(10, 2) NOT NULL,
    limited BOOLEAN DEFAULT FALSE,
    color VARCHAR(100),
    size VARCHAR(100),
    dimensions VARCHAR(100),
    material VARCHAR(100),
    weight NUMERIC(10, 2),
    type VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE inventory (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT REFERENCES product(id) ON DELETE CASCADE,
    charge_type VARCHAR(50) NOT NULL,
    quantity_change INTEGER NOT NULL,
    reason VARCHAR(255),
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE cart (
    id BIGSERIAL PRIMARY KEY,
    cart_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE cart_item (
    id BIGSERIAL PRIMARY KEY,
    cart_id BIGINT REFERENCES cart(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES product(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (cart_id, product_id)
);

CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    order_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    guest_email VARCHAR(255),
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    cart_id BIGINT REFERENCES cart(id) ON DELETE SET NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    order_status VARCHAR(50) NOT NULL CHECK (order_status IN ('pending', 'processing', 'shipped', 'delivered', 'canceled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    order_number VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE order_item (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES product(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payment (
    id BIGSERIAL PRIMARY KEY,
    payment_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    payment_method VARCHAR(100) NOT NULL,
    payment_status VARCHAR(50) NOT NULL CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    amount_paid NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    transaction_id VARCHAR(255) UNIQUE,
    order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE discount_code (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(50) NOT NULL,
    discount_value NUMERIC(10, 2) NOT NULL,
    min_order_value NUMERIC(10, 2),
    max_uses INTEGER,
    used_count INTEGER DEFAULT 0,
    valid_from TIMESTAMPTZ NOT NULL,
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE order_discount (
    id BIGSERIAL PRIMARY KEY,
    discount_applied NUMERIC(10, 2) NOT NULL,
    discount_id BIGINT REFERENCES discount_code(id) ON DELETE CASCADE,
    order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE refund (
    id BIGSERIAL PRIMARY KEY,
    reason TEXT,
    refund_status VARCHAR(50) NOT NULL CHECK (refund_status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE
);
