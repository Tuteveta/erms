"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import {
  Lock,
  Mail,
  Loader2,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  MailCheck,
} from "lucide-react";

type Step = "login" | "new-password" | "forgot-password" | "reset-password";

/** Map Cognito / Amplify error names to user-friendly messages. */
function friendlyError(err: any): string {
  const name: string = err?.name ?? err?.code ?? "";
  switch (name) {
    case "NotAuthorizedException":
      return "Incorrect email or password. Please try again.";
    case "UserNotFoundException":
      return "Incorrect email or password. Please try again.";
    case "UserNotConfirmedException":
      return "Your account has not been confirmed. Please contact your administrator.";
    case "PasswordResetRequiredException":
      return "A password reset is required. Please use \"Forgot password\" below.";
    case "LimitExceededException":
      return "Too many attempts. Please wait a moment and try again.";
    case "CodeMismatchException":
      return "Invalid verification code. Please check and try again.";
    case "ExpiredCodeException":
      return "Verification code has expired. Please request a new one.";
    case "InvalidPasswordException":
      return err.message ?? "Password does not meet the requirements.";
    case "UserAlreadyAuthenticatedException":
      return "You are already signed in. Redirecting…";
    default:
      return err?.message || "Something went wrong. Please try again.";
  }
}

export default function LoginPage() {
  const { signIn, completeNewPassword, forgotPassword, confirmForgotPassword } = useAuth();

  const [step, setStep] = useState<Step>("login");

  // Login step
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // New-password step (first-login forced change)
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Forgot / reset-password step
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [resetPassword_, setResetPassword] = useState("");
  const [resetConfirm, setResetConfirm] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* ── Helpers ──────────────────────────────────────────── */

  const goBack = (to: Step) => {
    setError("");
    setStep(to);
  };

  /* ── Handlers ─────────────────────────────────────────── */

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await signIn(email, password);
    } catch (err: any) {
      if (err.code === "NEW_PASSWORD_REQUIRED") {
        setStep("new-password");
        setError("");
      } else {
        setError(friendlyError(err));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setError("Please fill in both password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await completeNewPassword(newPassword);
    } catch (err: any) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await forgotPassword(resetEmail);
    } catch {
      // Intentionally swallow — don't reveal whether the account exists
    } finally {
      setLoading(false);
      // Always advance to the code entry step
      setStep("reset-password");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetCode || !resetPassword_ || !resetConfirm) {
      setError("Please fill in all fields.");
      return;
    }
    if (resetPassword_ !== resetConfirm) {
      setError("Passwords do not match.");
      return;
    }
    if (resetPassword_.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await confirmForgotPassword(resetEmail, resetCode, resetPassword_);
      goBack("login");
    } catch (err: any) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  /* ── Render ───────────────────────────────────────────── */

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <Image
              src="/ict-logo.png"
              alt="ICT Logo"
              width={160}
              height={48}
              className="h-12 object-contain"
              style={{ width: "auto" }}
              priority
            />
          </Link>
          <Button asChild variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm space-y-5">

          {/* ── Step: login ── */}
          {step === "login" && (
            <>
              <div className="text-center space-y-1">
                <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
                <p className="text-sm text-muted-foreground">
                  Sign in to access the HR portal
                </p>
              </div>

              <Card className="shadow-lg border-gray-200">
                <CardContent className="pt-6">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@org.gov"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-9"
                          autoComplete="username"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <button
                          type="button"
                          onClick={() => { setResetEmail(email); goBack("forgot-password"); }}
                          className="text-xs text-primary hover:text-primary/80 transition-colors"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-9"
                          autoComplete="current-password"
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2.5">
                        <p className="text-sm text-destructive">{error}</p>
                      </div>
                    )}

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</>
                      ) : "Sign In"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </>
          )}

          {/* ── Step: new-password (first-login forced change) ── */}
          {step === "new-password" && (
            <>
              <div className="text-center space-y-1">
                <div className="flex justify-center mb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <KeyRound className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Set your password</h1>
                <p className="text-sm text-muted-foreground">
                  Your account requires a new password before you can continue.
                </p>
              </div>

              <Card className="shadow-lg border-gray-200">
                <CardContent className="pt-6">
                  <form onSubmit={handleNewPassword} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="new-password">New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="new-password"
                          type="password"
                          placeholder="Min. 8 characters"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="pl-9"
                          autoComplete="new-password"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <div className="relative">
                        <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirm-password"
                          type="password"
                          placeholder="Re-enter your password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-9"
                          autoComplete="new-password"
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2.5">
                        <p className="text-sm text-destructive">{error}</p>
                      </div>
                    )}

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Setting password...</>
                      ) : "Set Password & Sign In"}
                    </Button>

                    <button
                      type="button"
                      onClick={() => goBack("login")}
                      className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors text-center"
                    >
                      Back to sign in
                    </button>
                  </form>
                </CardContent>
              </Card>
            </>
          )}

          {/* ── Step: forgot-password (enter email) ── */}
          {step === "forgot-password" && (
            <>
              <div className="text-center space-y-1">
                <div className="flex justify-center mb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Forgot password?</h1>
                <p className="text-sm text-muted-foreground">
                  Enter your email and we&apos;ll send you a verification code.
                </p>
              </div>

              <Card className="shadow-lg border-gray-200">
                <CardContent className="pt-6">
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="reset-email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="reset-email"
                          type="email"
                          placeholder="you@org.gov"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          className="pl-9"
                          autoComplete="username"
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2.5">
                        <p className="text-sm text-destructive">{error}</p>
                      </div>
                    )}

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending code...</>
                      ) : "Send Verification Code"}
                    </Button>

                    <button
                      type="button"
                      onClick={() => goBack("login")}
                      className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors text-center"
                    >
                      Back to sign in
                    </button>
                  </form>
                </CardContent>
              </Card>
            </>
          )}

          {/* ── Step: reset-password (enter code + new password) ── */}
          {step === "reset-password" && (
            <>
              <div className="text-center space-y-1">
                <div className="flex justify-center mb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <MailCheck className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Check your email</h1>
                <p className="text-sm text-muted-foreground">
                  Enter the verification code sent to{" "}
                  <span className="font-medium text-gray-700">{resetEmail}</span> and set a new
                  password.
                </p>
              </div>

              <Card className="shadow-lg border-gray-200">
                <CardContent className="pt-6">
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="reset-code">Verification Code</Label>
                      <Input
                        id="reset-code"
                        type="text"
                        inputMode="numeric"
                        placeholder="Enter code from your email"
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value.trim())}
                        autoComplete="one-time-code"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="rp-new">New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="rp-new"
                          type="password"
                          placeholder="Min. 8 characters"
                          value={resetPassword_}
                          onChange={(e) => setResetPassword(e.target.value)}
                          className="pl-9"
                          autoComplete="new-password"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="rp-confirm">Confirm Password</Label>
                      <div className="relative">
                        <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="rp-confirm"
                          type="password"
                          placeholder="Re-enter your password"
                          value={resetConfirm}
                          onChange={(e) => setResetConfirm(e.target.value)}
                          className="pl-9"
                          autoComplete="new-password"
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2.5">
                        <p className="text-sm text-destructive">{error}</p>
                      </div>
                    )}

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Resetting password...</>
                      ) : "Reset Password"}
                    </Button>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <button
                        type="button"
                        onClick={() => goBack("forgot-password")}
                        className="hover:text-foreground transition-colors"
                      >
                        Resend code
                      </button>
                      <button
                        type="button"
                        onClick={() => goBack("login")}
                        className="hover:text-foreground transition-colors"
                      >
                        Back to sign in
                      </button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </>
          )}

        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground text-center">
            © 2026 Employee Record Management System. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">Secure · Compliant · Cloud-Native</p>
        </div>
      </footer>
    </div>
  );
}
