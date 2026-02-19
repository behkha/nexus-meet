import { sql } from "bun";
import type { IUser } from "#src/types/user.types.ts";

export const UserService = {
  async findByEmail(email: IUser["email"]) {
    const result = await sql<
      IUser[]
    >`SELECT * FROM users WHERE email = ${email}`;
    return result[0] || null;
  },
  async findById(userId: IUser["id"]) {
    const result = await sql<IUser[]>`SELECT * FROM users WHERE id = ${userId}`;
    return result[0] || null;
  },
  async upsertOTP(
    email: IUser["email"],
    otp: IUser["otp_code"],
    expires: Date,
  ) {
    return await sql`
      INSERT INTO users (email, otp_code, otp_expires_at)
      VALUES (${email}, ${otp}, ${expires})
      ON CONFLICT (email) DO UPDATE 
      SET otp_code = EXCLUDED.otp_code, otp_expires_at = EXCLUDED.otp_expires_at
      RETURNING *
    `;
  },
  async upsertGoogleUser(
    email: IUser["email"],
    name: IUser["full_name"],
    avatar: IUser["avatar_url"],
    googleId: IUser["google_id"],
  ) {
    const result = await sql<IUser[]>`
      INSERT INTO users (email, full_name, avatar_url, google_id)
      VALUES (${email}, ${name}, ${avatar}, ${googleId})
      ON CONFLICT (email) DO UPDATE 
      SET google_id = EXCLUDED.google_id, avatar_url = EXCLUDED.avatar_url
      RETURNING *
    `;
    return result[0] || null;
  },
  async updateGoogleId(email: string, googleId: string) {
    return await sql`UPDATE users SET google_id = ${googleId} WHERE email = ${email}`;
  },

  async clearOTP(userId: IUser["id"]) {
    await sql`UPDATE users SET otp_code = NULL, otp_expires_at = NULL WHERE id = ${userId}`;
  },
};
