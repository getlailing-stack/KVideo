import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

// ✅ 你的公网IP（替换成你自己的，百度搜“我的IP”就能看到）
const ADMIN_IPS = ["111.111.111.111"];

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [
    // 1. 管理员免密模式（仅你的IP可用）
    Credentials({
      id: "admin-auto",
      name: "Admin Auto",
      async authorize(_, req) {
        // 从请求头获取真实IP
        const userIp = req?.headers?.["x-forwarded-for"]?.split(",")[0] || "";

        if (ADMIN_IPS.includes(userIp)) {
          return {
            id: "admin",
            name: "超级管理员",
            email: "admin@tiger.com",
            role: "admin",
          };
        }
        return null;
      },
    }),

    // 2. 普通用户登录（保持项目原有逻辑不变）
    Credentials({
      id: "user-password",
      name: "User Login",
      credentials: {
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        // 这里直接用项目原来的用户校验逻辑，不用改！
        return await originalUserAuth(credentials);
      },
    }),
  ],

  // 把角色信息存到session里
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.role = token.role;
      return session;
    },
  },
});
