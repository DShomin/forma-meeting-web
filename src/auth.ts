import NextAuth from "next-auth";

const ALLOWED_SITE_URL = process.env.ALLOWED_CONFLUENCE_SITE_URL!;

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    {
      id: "atlassian",
      name: "Atlassian",
      type: "oidc",
      issuer: "https://auth.atlassian.com",
      clientId: process.env.AUTH_ATLASSIAN_ID,
      clientSecret: process.env.AUTH_ATLASSIAN_SECRET,
      authorization: {
        params: {
          scope: "openid email profile read:me read:confluence-content.summary offline_access",
          audience: "api.atlassian.com",
          prompt: "consent",
        },
      },
      checks: ["state"],
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name ?? profile.nickname,
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
