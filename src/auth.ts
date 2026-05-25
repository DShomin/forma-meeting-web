import NextAuth from "next-auth";

const ALLOWED_SITE_URL = process.env.ALLOWED_CONFLUENCE_SITE_URL!;

export const { handlers, signIn, signOut, auth } = NextAuth({
  debug: true,
  providers: [
    {
      id: "atlassian",
      name: "Atlassian",
      type: "oauth",
      authorization: {
        url: "https://auth.atlassian.com/authorize",
        params: {
          audience: "api.atlassian.com",
          scope: "read:me read:confluence-content.summary offline_access",
          prompt: "consent",
          response_type: "code",
        },
      },
      token: {
        url: "https://auth.atlassian.com/oauth/token",
        async request({ params, provider }: any) {
          const res = await fetch("https://auth.atlassian.com/oauth/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              grant_type: "authorization_code",
              client_id: provider.clientId,
              client_secret: provider.clientSecret,
              code: params.code,
              redirect_uri: provider.callbackUrl,
            }),
          });
          const tokens = await res.json();
          return { tokens };
        },
      },
      userinfo: {
        url: "https://api.atlassian.com/me",
        async request({ tokens }: any) {
          const res = await fetch("https://api.atlassian.com/me", {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
          });
          return await res.json();
        },
      },
      clientId: process.env.AUTH_ATLASSIAN_ID,
      clientSecret: process.env.AUTH_ATLASSIAN_SECRET,
      checks: ["state"],
      profile(profile) {
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
});
