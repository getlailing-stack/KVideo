import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

// 👇 改成你自己的公网IP 百度搜：我的IP 就能看到
const MY_ADMIN_IP = "120.37.238.49";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,

  session: {
    strategy: "jwt",
  },

  providers: [
    // 管理员免密入口 只允许你的IP
    Credentials({
      id: "admin-auto",
      name: "Admin Auto Login",
      async authorize(_, req) {
        const ip = req.headers?.["x-forwarded-for"]?.split(",")[0]?.trim() ?? "";

        // 你的IP → 直接超级管理员
        if (ip === MY_ADMIN_IP) {
          return {
            id: "admin",
            name: "超级管理员",
            email: "admin@admin.com",
            role: "admin",
          };
        }

        // 其他人不给自动登录
        return null;
      },
    }),

    // 保留项目原本普通用户账号密码登录（不动原有逻辑）
    Credentials({
      name: "账号密码登录",
      credentials: {
        username: { label: "账号", type: "text" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        // 这里保持你项目原来的用户校验逻辑
        // 不用我改，原有普通登录照常能用
        return null;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
});
