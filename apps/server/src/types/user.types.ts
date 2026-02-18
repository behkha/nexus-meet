export interface IUser {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  google_id?: string;
  otp_code?: string;
  otp_expires_at?: Date;
}
