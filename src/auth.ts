import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";

const ALLOWED_SITE_URL = process.env.ALLOWED_CONFLUENCE_SITE_URL!;

async function atlassianTokenExchange(code: string, redirectUri: string) {
  const res = await fetch("https://auth.atlassian.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "authorization_code",
      client_id: process.env.AUTH_ATLASSIAN_ID,
      client_secret: process.env.AUTH_ATLASSIAN_SECRET,
      code,
      redirect_uri: redirectUri,
    }),
  });
  return res.json();
}

async function atlassianUserInfo(accessToken: string) {
  const res = await fetch("https://api.atlassian.com/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.json();
}

const config: NextAuthConfig = {
  debug: true,
  providers: [
    {
      id: "atlassian",
      name: "Atlassian",
      type: "oauth",
      clientId: process.env.AUTH_ATLASSIAN_ID,
      clientSecret: process.env.AUTH_ATLASSIAN_SECRET,
      authorization: {
        url: "https://auth.atlassian.com/authorize",
        params: {
          audience: "api.atlassian.com",
          scope: "read:me read:confluence-content.summary offline_access",
          prompt: "consent",
        },
      },
      token: "https://auth.atlassian.com/oauth/token",
      userinfo: "https://api.atlassian.com/me",
      profile(profile: any) {
        return {
          id: profile.account_id,
          name: profile.name ?? profile.nickname ?? profile.email,
          email: profile.email,
          image: profile.picture,
        };
      },
    },
  ],
  callbacks: {
    async signIn({ account }) {
      if (!account?.access_token) return false;

      const res = await fetch(
        "https://api.atlassian.com/oauth/token/accessible-resources",
        { headers: { Authorization: `Bearer ${account.access_token}` } },
      );

      if (!res.ok) return false;

      const sites: { url: string }[] = await res.json();
      const hasAccess = sites.some((site) => site.url === ALLOWED_SITE_URL);

      if (!hasAccess) return "/auth/denied";
      return true;
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(config);
