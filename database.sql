CREATE TABLE public.user (
    id BIGSERIAL PRIMARY KEY,
    user_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    username VARCHAR(30) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(35) UNIQUE,
    password_hash VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login TIMESTAMPTZ,
    account_status VARCHAR(20) NOT NULL DEFAULT 'active',
    client_since TIMESTAMPTZ,
    CONSTRAINT check_username_length CHECK (LENGTH(username) >= 3 AND LENGTH(username) <= 30),
    CONSTRAINT check_email_format CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$')
);

CREATE TABLE public.language (
    id SERIAL PRIMARY KEY,
    language_code VARCHAR(10) UNIQUE NOT NULL,
    language_name VARCHAR(100) NOT NULL
);

CREATE TABLE public.device (
    id BIGSERIAL PRIMARY KEY,
    device_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    user_id BIGINT REFERENCES public.user(id) ON DELETE CASCADE,
    device_name VARCHAR(255) NOT NULL,
    last_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_trusted BOOLEAN DEFAULT FALSE NOT NULL,
    biometric_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    language_id INTEGER REFERENCES public.language(id) ON DELETE SET NULL,
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
    user_id BIGINT REFERENCES public.user(id) ON DELETE CASCADE,
    device_id BIGINT REFERENCES public.device(id) ON DELETE CASCADE,
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

CREATE TABLE public.file (
    id BIGSERIAL PRIMARY KEY,
    file_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    uploader_user_id BIGINT REFERENCES public.user(id) ON DELETE SET NULL,
    uploader_session_id BIGINT REFERENCES public.session(id) ON DELETE SET NULL,
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
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by_user_id BIGINT REFERENCES public.user(id) ON DELETE SET NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT has_uploader CHECK (uploader_user_id IS NOT NULL OR uploader_session_id IS NOT NULL)
);

CREATE TABLE public.user_profile (
    user_id BIGINT PRIMARY KEY REFERENCES public.user(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    bio TEXT,
    profile_picture_file_id BIGINT REFERENCES public.file(id) ON DELETE SET NULL,
    location VARCHAR(100),
    date_of_birth DATE,
    birth_number VARCHAR(11) UNIQUE,
    is_private BOOLEAN NOT NULL DEFAULT FALSE,
    policy_number VARCHAR(50),
    insurance_company_name VARCHAR(255),
    insurance_company_code VARCHAR(10),
    company_name VARCHAR(255),
    company_id VARCHAR(8),
    post_count INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'offline',
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_status CHECK (status IN ('online', 'away', 'busy', 'offline'))
);

CREATE TABLE public.user_setting (
    user_id BIGINT PRIMARY KEY REFERENCES public.user(id) ON DELETE CASCADE,
    theme VARCHAR(50) DEFAULT 'light',
    language_id INTEGER REFERENCES public.language(id) ON DELETE SET NULL,
    timezone VARCHAR(50) DEFAULT 'UTC',
    email_verified BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE public.user_consent (
    user_id BIGINT PRIMARY KEY REFERENCES public.user(id) ON DELETE CASCADE,
    terms_of_service_accepted_at TIMESTAMPTZ NOT NULL,
    tos_version VARCHAR(20) NOT NULL,
    privacy_policy_accepted_at TIMESTAMPTZ NOT NULL,
    pp_version VARCHAR(20) NOT NULL,
    marketing_consent_given_at TIMESTAMPTZ,
    marketing_consent_revoked_at TIMESTAMPTZ,
    data_processing_consent_given_at TIMESTAMPTZ,
    CONSTRAINT check_tos_accepted CHECK (terms_of_service_accepted_at IS NOT NULL),
    CONSTRAINT check_pp_accepted CHECK (privacy_policy_accepted_at IS NOT NULL)
);

CREATE TABLE public.user_notification_preference (
    user_id BIGINT PRIMARY KEY REFERENCES public.user(id) ON DELETE CASCADE,
    email_new_follower BOOLEAN NOT NULL DEFAULT TRUE,
    email_post_likes BOOLEAN NOT NULL DEFAULT TRUE,
    email_mentions BOOLEAN NOT NULL DEFAULT TRUE,
    email_promotional BOOLEAN NOT NULL DEFAULT TRUE,
    push_new_follower BOOLEAN NOT NULL DEFAULT TRUE,
    push_post_likes BOOLEAN NOT NULL DEFAULT TRUE,
    push_mentions BOOLEAN NOT NULL DEFAULT TRUE,
    push_promotional BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE public.user_auth (
    user_id BIGINT PRIMARY KEY REFERENCES public.user(id) ON DELETE CASCADE,
    recovery_email VARCHAR(255) UNIQUE,
    phone_number VARCHAR(20) UNIQUE,
    last_password_change TIMESTAMPTZ,
    CONSTRAINT check_recovery_email_format CHECK (recovery_email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$')
);

CREATE TABLE public.user_metadata (
    user_id BIGINT PRIMARY KEY REFERENCES public.user(id) ON DELETE CASCADE,
    sign_up_ip INET NOT NULL,
    last_login_ip INET,
    user_agent_info VARCHAR(255),
    referral_source VARCHAR(100),
    is_bot BOOLEAN NOT NULL DEFAULT FALSE,
    custom_data JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE public.password_history (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES public.user(id) ON DELETE CASCADE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.user_activity_log (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES public.user(id) ON DELETE CASCADE,
    session_id BIGINT REFERENCES public.session(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL,
    event_description TEXT,
    ip_address INET,
    user_agent TEXT,
    device_info JSONB,
    location_info JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by_user_id BIGINT REFERENCES public.user(id) ON DELETE SET NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT has_actor CHECK (
        (user_id IS NOT NULL AND session_id IS NULL) OR
        (user_id IS NULL AND session_id IS NOT NULL) OR
        (user_id IS NOT NULL AND session_id IS NOT NULL)
    )
);

CREATE TABLE public.oauth_provider (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.user_oauth_account (
    user_id BIGINT REFERENCES public.user(id) ON DELETE CASCADE,
    provider_id INTEGER REFERENCES public.oauth_provider(id) ON DELETE CASCADE,
    provider_user_id VARCHAR(255) NOT NULL,
    access_token VARCHAR(255) NOT NULL,
    refresh_token VARCHAR(255),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, provider_id),
    UNIQUE (provider_id, provider_user_id)
);

CREATE TABLE public.user_2fa_method (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES public.user(id) ON DELETE CASCADE,
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

CREATE TABLE public.user_2fa_backup_code (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES public.user(id) ON DELETE CASCADE,
    batch_id UUID NOT NULL,
    code_hash VARCHAR(255) UNIQUE NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.user_login_history (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES public.user(id) ON DELETE CASCADE,
    session_id BIGINT REFERENCES public.session(id) ON DELETE SET NULL,
    login_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address INET NOT NULL,
    user_agent TEXT,
    is_successful BOOLEAN NOT NULL,
    fail_reason VARCHAR(50),
    country VARCHAR(100),
    deleted_at TIMESTAMPTZ,
    deleted_by_user_id BIGINT REFERENCES public.user(id) ON DELETE SET NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE public.user_2fa_login_log (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES public.user(id) ON DELETE CASCADE,
    session_id BIGINT REFERENCES public.session(id) ON DELETE SET NULL,
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_successful BOOLEAN NOT NULL,
    method_used VARCHAR(20) NOT NULL,
    ip_address INET NOT NULL,
    fail_reason VARCHAR(50),
    deleted_at TIMESTAMPTZ,
    deleted_by_user_id BIGINT REFERENCES public.user(id) ON DELETE SET NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE public.user_report (
    id BIGSERIAL PRIMARY KEY,
    reporter_user_id BIGINT REFERENCES public.user(id) ON DELETE SET NULL,
    session_id BIGINT REFERENCES public.session(id) ON DELETE SET NULL,
    reported_user_id BIGINT REFERENCES public.user(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    moderator_user_id BIGINT REFERENCES public.user(id) ON DELETE SET NULL,
    moderated_at TIMESTAMPTZ,
    report_details JSONB,
    attached_file_id BIGINT REFERENCES public.file(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by_user_id BIGINT REFERENCES public.user(id) ON DELETE SET NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT has_submitter CHECK (reporter_user_id IS NOT NULL OR session_id IS NOT NULL)
);

CREATE TABLE public.user_file_access (
    user_id BIGINT REFERENCES public.user(id) ON DELETE CASCADE,
    file_id BIGINT REFERENCES public.file(id) ON DELETE CASCADE,
    access_granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, file_id)
);

CREATE TABLE public.user_webauthn_credential (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
  credential_id BYTEA NOT NULL,
  credential_id_b64 TEXT GENERATED ALWAYS AS (encode(credential_id, 'base64')) STORED,
  public_key BYTEA NOT NULL,
  sign_count BIGINT NOT NULL DEFAULT 0,
  transports TEXT[],
  attestation_type VARCHAR(50),
  aaguid UUID,
  rp_id TEXT,
  credential_name VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
  attestation_statement JSONB,
  authenticator_meta JSONB,
  UNIQUE (user_id, credential_id)
);

CREATE TABLE public.news (
    id BIGSERIAL PRIMARY KEY,
    translation_group_id UUID NOT NULL DEFAULT gen_random_uuid(),
    language_id INTEGER REFERENCES public.language(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    file_id BIGINT REFERENCES public.file(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by_user_id BIGINT REFERENCES public.user(id) ON DELETE SET NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    author_user_id BIGINT REFERENCES public.user(id) ON DELETE SET NULL
);

CREATE TABLE public.notification (
    id BIGSERIAL PRIMARY KEY,
    translation_group_id UUID NOT NULL DEFAULT gen_random_uuid(),
    language_id INTEGER REFERENCES public.language(id) ON DELETE SET NULL,
    audience_type VARCHAR(50) NOT NULL DEFAULT 'user',
    user_id BIGINT REFERENCES public.user(id) ON DELETE SET NULL,
    fcm_token VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    notification_message TEXT NOT NULL,
    notification_type VARCHAR(255) CHECK (notification_type IN ('info', 'warning', 'error', 'success', 'promotion', 'activity', 'system')) NOT NULL,
    image_url VARCHAR(2048),
    action_url VARCHAR(2048),
    data_payload JSONB,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read_at TIMESTAMPTZ
);

CREATE TABLE public.role (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.permission (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.role_permission (
    role_id INTEGER REFERENCES public.role(id) ON DELETE CASCADE,
    permission_id INTEGER REFERENCES public.permission(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE public.user_role (
    user_id BIGINT REFERENCES public.user(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES public.role(id) ON DELETE CASCADE,
    changed_by_user_id BIGINT REFERENCES public.user(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE public.forum (
    id BIGSERIAL PRIMARY KEY,
    forum_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    author_user_id BIGINT REFERENCES public.user(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by_user_id BIGINT REFERENCES public.user(id) ON DELETE SET NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE public.thread (
    id BIGSERIAL PRIMARY KEY,
    thread_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    forum_id BIGINT REFERENCES forum(id) ON DELETE CASCADE,
    author_user_id BIGINT REFERENCES public.user(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by_user_id BIGINT REFERENCES public.user(id) ON DELETE SET NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE public.support_ticket (
    id BIGSERIAL PRIMARY KEY,
    ticket_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    user_id BIGINT REFERENCES public.user(id) ON DELETE SET NULL,
    session_id BIGINT REFERENCES session(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed', 'awaiting_reply')),
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    assigned_to_user_id BIGINT REFERENCES public.user(id) ON DELETE SET NULL,
    resolution_details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    deleted_by_user_id BIGINT REFERENCES public.user(id) ON DELETE SET NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT has_submitter CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

CREATE TABLE public.tool (
    id BIGSERIAL PRIMARY KEY,
    translation_group_id UUID NOT NULL DEFAULT gen_random_uuid(),
    language_id INTEGER REFERENCES public.language(id) ON DELETE SET NULL,
    creator_user_id BIGINT REFERENCES public.user(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(255) CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft' NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by_user_id BIGINT REFERENCES public.user(id) ON DELETE SET NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE public.dictionary (
    id BIGSERIAL PRIMARY KEY,
    translation_group_id UUID NOT NULL DEFAULT gen_random_uuid(),
    language_id INTEGER REFERENCES public.language(id) ON DELETE SET NULL,
    creator_user_id BIGINT REFERENCES public.user(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    abbreviation VARCHAR(50),
    image_file_id BIGINT REFERENCES public.file(id) ON DELETE SET NULL,
    animation_file_id BIGINT REFERENCES public.file(id) ON DELETE SET NULL,
    mark_file_id BIGINT REFERENCES public.file(id) ON DELETE SET NULL,
    status VARCHAR(255) CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft' NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by_user_id BIGINT REFERENCES public.user(id) ON DELETE SET NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE public.education_mode (
    id BIGSERIAL PRIMARY KEY,
    translation_group_id UUID NOT NULL DEFAULT gen_random_uuid(),
    language_id INTEGER REFERENCES public.language(id) ON DELETE SET NULL,
    creator_user_id BIGINT REFERENCES public.user(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    tool VARCHAR(255) NOT NULL,
    status VARCHAR(255) CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft' NOT NULL,
    points INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by_user_id BIGINT REFERENCES public.user(id) ON DELETE SET NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE public.education_step (
    id BIGSERIAL PRIMARY KEY,
    translation_group_id UUID NOT NULL DEFAULT gen_random_uuid(),
    language_id INTEGER REFERENCES public.language(id) ON DELETE SET NULL,
    education_mode_id BIGINT REFERENCES education_mode(id) ON DELETE SET NULL,
    description TEXT,
    video_url VARCHAR(2048),
    image_file_id BIGINT REFERENCES public.file(id) ON DELETE SET NULL,
    tool VARCHAR(255) NOT NULL,
    step_order INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (education_mode_id, step_order),
    CHECK (video_url IS NOT NULL OR image_file_id IS NOT NULL)
);

CREATE TABLE public.manual (
    id BIGSERIAL PRIMARY KEY,
    translation_group_id UUID NOT NULL DEFAULT gen_random_uuid(),
    language_id INTEGER REFERENCES public.language(id) ON DELETE SET NULL,
    creator_user_id BIGINT REFERENCES public.user(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    manual_difficulty VARCHAR(20) CHECK (manual_difficulty IN ('easy', 'normal', 'hard')) NOT NULL,
    price INT,
    crochet_abbreviation VARCHAR(50),
    crochet_tool  VARCHAR(255),
    color VARCHAR(255),
    size VARCHAR(255),
    dimension VARCHAR(255),
    points INT,
    time_consuming INTERVAL,
    manual_form VARCHAR(255) CHECK (manual_form IN ('draw', 'write')),
    manual_type VARCHAR(20) CHECK (manual_type IN ('assembly', 'repair', 'how_to', 'guide', 'other')),
    status VARCHAR(20) CHECK (status IN ('public', 'premium', 'draft', 'archived')) DEFAULT 'draft' NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by_user_id BIGINT REFERENCES public.user(id) ON DELETE SET NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE public.manual_step (
    id BIGSERIAL PRIMARY KEY,
    translation_group_id UUID NOT NULL DEFAULT gen_random_uuid(),
    language_id INTEGER REFERENCES public.language(id) ON DELETE SET NULL,
    manual_id BIGINT REFERENCES public.manual(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_file_id BIGINT REFERENCES public.file(id) ON DELETE SET NULL,
    step_order INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (manual_id, step_order)
);

CREATE TABLE public.product_type (
    id SERIAL PRIMARY KEY,
    translation_group_id UUID NOT NULL DEFAULT gen_random_uuid(),
    language_id INTEGER REFERENCES public.language(id) ON DELETE SET NULL,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.product (
    id BIGSERIAL PRIMARY KEY,
    translation_group_id UUID NOT NULL DEFAULT gen_random_uuid(),
    language_id INTEGER REFERENCES public.language(id) ON DELETE SET NULL,
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
    product_type_id INTEGER REFERENCES product_type(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by_user_id BIGINT REFERENCES public.user(id) ON DELETE SET NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE public.comment (
    id BIGSERIAL PRIMARY KEY,
    comment_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    thread_id BIGINT REFERENCES public.thread(id) ON DELETE CASCADE,
    support_ticket_id BIGINT REFERENCES support_ticket(id) ON DELETE CASCADE,
    manual_id BIGINT REFERENCES public.manual(id) ON DELETE CASCADE,
    education_mode_id BIGINT REFERENCES education_mode(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES public.product(id) ON DELETE CASCADE,
    parent_comment_id BIGINT REFERENCES public.comment(id) ON DELETE CASCADE,
    author_user_id BIGINT REFERENCES public.user(id) ON DELETE SET NULL,
    body TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'moderated', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by_user_id BIGINT REFERENCES public.user(id) ON DELETE SET NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT one_entity_only CHECK (
        (CASE WHEN thread_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN support_ticket_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN manual_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN education_mode_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN product_id IS NOT NULL THEN 1 ELSE 0 END) = 1
    )
);

CREATE TABLE public.status_history (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES public.user(id) ON DELETE CASCADE,
    user_report_id BIGINT REFERENCES public.user_report(id) ON DELETE CASCADE,
    manual_id BIGINT REFERENCES public.manual(id) ON DELETE CASCADE,
    news_id BIGINT REFERENCES public.news(id) ON DELETE CASCADE,
    support_ticket_id BIGINT REFERENCES support_ticket(id) ON DELETE CASCADE,
    tool_id BIGINT REFERENCES public.tool(id) ON DELETE CASCADE,
    dictionary_id BIGINT REFERENCES public.dictionary(id) ON DELETE CASCADE,
    education_mode_id BIGINT REFERENCES public.education_mode(id) ON DELETE CASCADE,
    comment_id BIGINT REFERENCES public.comment(id) ON DELETE CASCADE,
    old_status VARCHAR(20) NOT NULL,
    new_status VARCHAR(20) NOT NULL,
    changed_by_user_id BIGINT REFERENCES public.user(id) ON DELETE SET NULL,
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
         CASE WHEN education_mode_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN comment_id IS NOT NULL THEN 1 ELSE 0 END) = 1
    )
);

CREATE TABLE public.rating (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES public.user(id) ON DELETE CASCADE,
    manual_id BIGINT REFERENCES public.manual(id) ON DELETE CASCADE,
    education_mode_id BIGINT REFERENCES education_mode(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES public.product(id) ON DELETE CASCADE,
    rating_value SMALLINT NOT NULL CHECK (rating_value >= 1 AND rating_value <= 5),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by_user_id BIGINT REFERENCES public.user(id) ON DELETE SET NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT one_entity_only CHECK (
        (CASE WHEN manual_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN education_mode_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN product_id IS NOT NULL THEN 1 ELSE 0 END) = 1
    ),
    CONSTRAINT unique_rating UNIQUE (user_id, manual_id, education_mode_id, product_id)
);

CREATE TABLE public.entity_file (
    id BIGSERIAL PRIMARY KEY,
    file_id BIGINT REFERENCES public.file(id) ON DELETE CASCADE,
    user_report_id BIGINT REFERENCES public.user_report(id) ON DELETE CASCADE,
    tool_id BIGINT REFERENCES public.tool(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES public.product(id) ON DELETE CASCADE,
    comment_id BIGINT REFERENCES public.comment(id) ON DELETE CASCADE,
    author_user_id BIGINT REFERENCES public.user(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by_user_id BIGINT REFERENCES public.user(id) ON DELETE SET NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT one_entity_only CHECK (
         (CASE WHEN user_report_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN tool_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN product_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN comment_id IS NOT NULL THEN 1 ELSE 0 END) = 1
    ),
    CONSTRAINT unique_file_per_entity UNIQUE (user_report_id, tool_id, product_id, comment_id)
);

CREATE TABLE public.reaction (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES public.user(id) ON DELETE CASCADE,
    comment_id BIGINT REFERENCES public.comment(id) ON DELETE CASCADE,
    reaction_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by_user_id BIGINT REFERENCES public.user(id) ON DELETE SET NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT unique_comment_reaction UNIQUE (user_id, comment_id, reaction_type)
);

CREATE TABLE public.progress_tracking (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES public.user(id) ON DELETE CASCADE,
    manual_id BIGINT REFERENCES public.manual(id) ON DELETE CASCADE,
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

CREATE TABLE public.user_manual_interaction (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES public.user(id) ON DELETE CASCADE,
    manual_id BIGINT REFERENCES public.manual(id) ON DELETE CASCADE,
    interaction_type VARCHAR(255) CHECK (interaction_type IN ('view', 'like', 'share', 'save')) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.theme (
    id SERIAL PRIMARY KEY,
    translation_group_id UUID NOT NULL DEFAULT gen_random_uuid(),
    language_id INTEGER REFERENCES public.language(id) ON DELETE SET NULL,
    name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE public.category (
    id SERIAL PRIMARY KEY,
    translation_group_id UUID NOT NULL DEFAULT gen_random_uuid(),
    language_id INTEGER REFERENCES public.language(id) ON DELETE SET NULL,
    name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE public.manual_product_theme (
    id BIGSERIAL PRIMARY KEY,
    manual_id BIGINT REFERENCES public.manual(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES public.product(id) ON DELETE CASCADE,
    theme_id BIGINT REFERENCES theme(id) ON DELETE CASCADE,
    CONSTRAINT one_entity_only CHECK (
        (CASE WHEN manual_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN product_id IS NOT NULL THEN 1 ELSE 0 END) = 1
    ),
    CONSTRAINT unique_theme_link UNIQUE (manual_id, product_id, theme_id)
);

CREATE TABLE public.manual_product_category (
    id BIGSERIAL PRIMARY KEY,
    manual_id BIGINT REFERENCES public.manual(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES public.product(id) ON DELETE CASCADE,
    category_id BIGINT REFERENCES category(id) ON DELETE CASCADE,
    CONSTRAINT one_entity_only CHECK (
        (CASE WHEN manual_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN product_id IS NOT NULL THEN 1 ELSE 0 END) = 1
    ),
    CONSTRAINT unique_category_link UNIQUE (manual_id, product_id, category_id)
);

CREATE TABLE public.inventory (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT REFERENCES public.product(id) ON DELETE CASCADE,
    charge_type VARCHAR(50) NOT NULL,
    quantity_change INTEGER NOT NULL,
    reason VARCHAR(255),
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.cart (
    id BIGSERIAL PRIMARY KEY,
    cart_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    user_id BIGINT REFERENCES public.user(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by_user_id BIGINT REFERENCES public.user(id) ON DELETE SET NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE public.cart_item (
    id BIGSERIAL PRIMARY KEY,
    cart_id BIGINT REFERENCES cart(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES public.product(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (cart_id, product_id)
);

CREATE TABLE public.saved_cart (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES public.user(id),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by_user_id BIGINT REFERENCES public.user(id) ON DELETE SET NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT unique_saved_cart UNIQUE (user_id, name)
);

CREATE TABLE public.wishlist (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES public.user(id),
    product_id BIGINT REFERENCES public.product(id) ON DELETE CASCADE,
    deleted_at TIMESTAMPTZ,
    deleted_by_user_id BIGINT REFERENCES public.user(id) ON DELETE SET NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT unique_wishlist_item UNIQUE (user_id, product_id)
);

CREATE TABLE public.order (
    id BIGSERIAL PRIMARY KEY,
    order_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    guest_email VARCHAR(255),
    user_id BIGINT REFERENCES public.user(id) ON DELETE SET NULL,
    cart_id BIGINT REFERENCES cart(id) ON DELETE SET NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    order_status VARCHAR(50) NOT NULL CHECK (order_status IN ('pending', 'processing', 'shipped', 'delivered', 'canceled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    order_number VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE public.order_item (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES public.order(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES public.product(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.payment (
    id BIGSERIAL PRIMARY KEY,
    payment_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    payment_method VARCHAR(100) NOT NULL,
    payment_status VARCHAR(50) NOT NULL CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    amount_paid NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    transaction_id VARCHAR(255) UNIQUE,
    order_id BIGINT REFERENCES public.order(id) ON DELETE CASCADE
);

CREATE TABLE public.discount_code (
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

CREATE TABLE public.order_discount (
    id BIGSERIAL PRIMARY KEY,
    discount_applied NUMERIC(10, 2) NOT NULL,
    discount_id BIGINT REFERENCES discount_code(id) ON DELETE CASCADE,
    order_id BIGINT REFERENCES public.order(id) ON DELETE CASCADE
);

CREATE TABLE public.refund (
    id BIGSERIAL PRIMARY KEY,
    reason TEXT,
    refund_status VARCHAR(50) NOT NULL CHECK (refund_status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    order_id BIGINT REFERENCES public.order(id) ON DELETE CASCADE
);
