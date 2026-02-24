"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

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

    // MOCK OTP FOR ASSIGNMENT EVALUATION
    // If the user enters the test number, we pretend we sent an OTP to bypass SMS limits
    if (phoneNumber === "+910000000000") {
      setIsLoading(false);
      setStep("otp");
      toast.success("Test OTP triggered. Use 123456 to login.");
      return;
    }

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

    // MOCK OTP AWARENESS
    if (phoneNumber === "+910000000000" && otp === "123456") {
      // For the mock login to actually grant a session, we still rely on Supabase's
      // Test OTP feature being enabled in the dashboard. If it's not enabled,
      // this will fail. We'll proceed with the normal verify call which will
      // succeed if the dashboard is configured with "123456" as the test OTP.
      toast.info("Attempting test login...");
    }

    const { error, data } = await supabase.auth.verifyOtp({
      phone: phoneNumber,
      token: otp,
      type: "sms",
    });

    setIsLoading(false);

    if (error) {
      toast.error(error.message + " (Ensure Test OTP is enabled in Supabase)");
    } else {
      toast.success("Logged in successfully");
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-neutral-900 border-neutral-800 text-neutral-100">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight text-white">
            Welcome to BetPlay
          </CardTitle>
          <CardDescription className="text-neutral-400">
            {step === "phone"
              ? "Enter your phone number to continue"
              : `Enter the code sent to ${phoneNumber}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "phone" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="+919876543210"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="bg-neutral-800 border-neutral-700 text-neutral-100"
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Send Code"
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  placeholder="123456"
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="bg-neutral-800 border-neutral-700 text-neutral-100 text-center text-lg tracking-widest"
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Verify & Login"
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full text-neutral-400 hover:text-white mt-2"
                onClick={() => setStep("phone")}
                disabled={isLoading}
              >
                Use a different number
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
