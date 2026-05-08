import { signIn, auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  // 已经登录，直接进首页
  if (session?.user) {
    return (
      <div>
        <h1>Tiger影视</h1>
        <p>当前角色：{session.user.role === "admin" ? "超级管理员" : "普通用户"}</p>
      </div>
    );
  }

  // 未登录时，尝试用管理员模式自动登录
  await signIn("admin-auto", { redirect: false });
  redirect("/");
}
