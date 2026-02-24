import { redirect } from "next/navigation";

export default function SignupPage() {
  // Regular users sign up via phone OTP on the login page
  redirect("/login");
}
