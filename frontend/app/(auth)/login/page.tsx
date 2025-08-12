"use client";
import Link from "next/link";
import { linkClasses } from "@/components/Link";
import { AuthPage } from "..";

export default function LoginPage() {
  const lastSignInMethod = typeof window !== "undefined" ? localStorage.getItem("last_sign_in_method") : "Email";

  return (
    <AuthPage
      title="Welcome back"
      description={
        lastSignInMethod ? `You used ${lastSignInMethod} to log in last time.` : "Use your work email to log in."
      }
      sendOtpText="Log in"
      switcher={
        <>
          Don't have an account?{" "}
          <Link href="/signup" className={linkClasses}>
            Sign up
          </Link>
        </>
      }
      sendOtpUrl="/internal/email_otp"
    />
  );
}
