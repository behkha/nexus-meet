import { sql } from "bun";

export async function initDB() {
  // Users
  await sql`
    CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    avatar_url TEXT,
    google_id VARCHAR(255) UNIQUE,
    otp_code VARCHAR(6),
    otp_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )
  `;

  // Meetings
  await sql`
    CREATE TABLE IF NOT EXISTS meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    room_name VARCHAR(100) UNIQUE NOT NULL, -- The unique slug for LiveKit
    host_id UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )
  `;

  await sql`
    DO $$ BEGIN
      CREATE TYPE access_level AS ENUM ('open', 'request', 'password');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    ALTER TABLE meetings 
    ADD COLUMN IF NOT EXISTS access_type access_level DEFAULT 'open',
    ADD COLUMN IF NOT EXISTS password_hash TEXT;
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS meeting_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID REFERENCES meetings(id),
    user_id UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'denied'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(meeting_id, user_id)
  );
  `;

  await sql`
    CREATE TYPE sender_type AS ENUM ('user', 'agent');
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL, -- The unique ID of the user/agent
    sender_type sender_type DEFAULT 'user',
    
    -- recipient_id is NULL for public messages. 
    -- It contains a User/Agent ID for private DMs.
    recipient_id UUID DEFAULT NULL, 
    
    -- Your array of blocks: [{type: "text", text: "..."}, {type: "file", file: "..."}]
    content JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);
  `;

  await sql`
    CREATE INDEX idx_public_chat ON messages (meeting_id) WHERE (recipient_id IS NULL);
  `

  await sql`
    CREATE INDEX idx_private_chat ON messages (meeting_id, sender_id, recipient_id) WHERE (recipient_id IS NOT NULL);
  `
}
