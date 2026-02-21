import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID as string,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
});

export const AuthService = {
  async getGoogleCredentialsByCode(code: string) {
    const { tokens } = await googleClient.getToken(code);
    googleClient.setCredentials(tokens);
    return tokens;
  },
  async getGooglePayload(idToken: string) {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID as string,
    });

    return ticket.getPayload();
  },
};
