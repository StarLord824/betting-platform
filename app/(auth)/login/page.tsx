"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Smartphone, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return toast.error("Please enter a phone number");

    setIsLoading(true);

    // Supabase handles test phone numbers natively via Dashboard config
    // For testing: use +910000000000 with OTP 123456
    const { error } = await supabase.auth.signInWithOtp({
      phone: phoneNumber,
    });

    setIsLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      setStep("otp");
      toast.success("OTP sent to your phone");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return toast.error("Please enter the OTP");

    setIsLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      phone: phoneNumber,
      token: otp,
      type: "sms",
    });

    setIsLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Logged in successfully!");

      // Check if user is admin and redirect accordingly
      const {
        data: { user: loggedInUser },
      } = await supabase.auth.getUser();
      if (loggedInUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", loggedInUser.id)
          .single();

        if (profile?.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-grid-pattern relative overflow-hidden"
      style={{ backgroundColor: "var(--mykd-bg)" }}
    >
      {/* Decorative background blurs */}
      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-[#45F882]/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-[#45F882]/5 rounded-full blur-[100px]" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1
            className="font-heading text-4xl md:text-5xl tracking-wider"
            style={{
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 800,
              textTransform: "uppercase",
            }}
          >
            <span style={{ color: "#45F882" }}>BET</span>
            <span className="text-white">PLAY</span>
          </h1>
          <p
            className="mt-2 text-sm"
            style={{ color: "var(--mykd-text-muted)" }}
          >
            Premium Gaming Experience
          </p>
        </div>

        {/* Login Card */}
        <div
          className="clip-notch relative"
          style={{
            backgroundColor: "var(--mykd-surface)",
            border: "1px solid var(--mykd-border)",
          }}
        >
          {/* Top accent line */}
          <div
            className="absolute top-0 left-0 right-[14px] h-[2px]"
            style={{
              background: "linear-gradient(90deg, #45F882, transparent)",
            }}
          />

          <div className="p-6 md:p-8">
            {/* Step indicator */}
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 flex items-center justify-center clip-notch-sm"
                style={{
                  backgroundColor:
                    step === "phone" ? "#45F882" : "var(--mykd-surface-2)",
                }}
              >
                <Smartphone
                  className="w-5 h-5"
                  style={{ color: step === "phone" ? "#0F161B" : "#45F882" }}
                />
              </div>
              <div
                className="h-[2px] flex-1"
                style={{ backgroundColor: "var(--mykd-border)" }}
              >
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: step === "otp" ? "100%" : "0%",
                    backgroundColor: "#45F882",
                  }}
                />
              </div>
              <div
                className="w-10 h-10 flex items-center justify-center clip-notch-sm"
                style={{
                  backgroundColor:
                    step === "otp" ? "#45F882" : "var(--mykd-surface-2)",
                }}
              >
                <ShieldCheck
                  className="w-5 h-5"
                  style={{
                    color: step === "otp" ? "#0F161B" : "var(--mykd-text-dim)",
                  }}
                />
              </div>
            </div>

            <h2
              className="text-xl font-bold text-white mb-1"
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              {step === "phone" ? "Enter Your Number" : "Verify OTP"}
            </h2>
            <p
              className="text-sm mb-6"
              style={{ color: "var(--mykd-text-muted)" }}
            >
              {step === "phone"
                ? "We'll send you a verification code"
                : `Code sent to ${phoneNumber}`}
            </p>

            {step === "phone" ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label
                    className="block text-xs font-semibold uppercase tracking-wider mb-2"
                    style={{ color: "var(--mykd-text-muted)" }}
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+919876543210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-4 py-3 text-base text-white placeholder:text-gray-600 outline-none focus:ring-2 focus:ring-[#45F882] transition-all clip-notch-sm"
                    style={{
                      backgroundColor: "var(--mykd-surface-2)",
                      border: "1px solid var(--mykd-border)",
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 font-bold text-sm uppercase tracking-wider clip-notch-sm btn-lift disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: "#45F882",
                    color: "#0F161B",
                    fontFamily: "'Barlow', sans-serif",
                  }}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Send Code"
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label
                    className="block text-xs font-semibold uppercase tracking-wider mb-2"
                    style={{ color: "var(--mykd-text-muted)" }}
                  >
                    Verification Code
                  </label>
                  <input
                    type="text"
                    placeholder="123456"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-4 py-3 text-center text-2xl font-mono tracking-[0.4em] text-white placeholder:text-gray-600 outline-none focus:ring-2 transition-all clip-notch-sm"
                    style={{
                      backgroundColor: "var(--mykd-surface-2)",
                      border: "1px solid var(--mykd-border)",
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 font-bold text-sm uppercase tracking-wider clip-notch-sm btn-lift neon-glow disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: "#45F882",
                    color: "#0F161B",
                    fontFamily: "'Barlow', sans-serif",
                  }}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Verify & Login"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setStep("phone")}
                  disabled={isLoading}
                  className="w-full py-2 text-sm text-center transition-colors"
                  style={{ color: "var(--mykd-text-muted)" }}
                >
                  Use a different number
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 space-y-1">
          <p className="text-[11px]" style={{ color: "var(--mykd-text-dim)" }}>
            Admin: +910000000000 / OTP: 123456
          </p>
          <p className="text-[11px]" style={{ color: "var(--mykd-text-dim)" }}>
            User: +910000000001 / OTP: 123456
          </p>
          <p className="text-[11px]" style={{ color: "var(--mykd-text-dim)" }}>
            User: +910000000002 / OTP: 123456
          </p>
          <a
            href="/admin/login"
            className="inline-block text-xs font-semibold uppercase tracking-wider transition-colors"
            style={{ color: "var(--mykd-text-dim)" }}
          >
            Admin Login →
          </a>
        </div>
      </div>
    </div>
  );
}
