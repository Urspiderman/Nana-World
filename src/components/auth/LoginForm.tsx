
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Heart,
  LockKeyhole,
  Mail,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();

  const [supabase] = useState(() => createClient());

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    setErrorMessage("");

    try {
      const { error } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (error) {
        setErrorMessage(
          "Email or password is incorrect. Please try again."
        );
        return;
      }

      router.replace("/");
      router.refresh();
    } catch {
      setErrorMessage(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="sw-login-form" onSubmit={handleSubmit}>
      <div className="sw-login-input">
        <Mail size={20} aria-hidden="true" />

        <input
          type="email"
          placeholder="Email address"
          aria-label="Email address"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div className="sw-login-input">
        <LockKeyhole size={20} aria-hidden="true" />

        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          aria-label="Password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <button
          type="button"
          className="sw-login-eye"
          aria-label={
            showPassword ? "Hide password" : "Show password"
          }
          aria-pressed={showPassword}
          onClick={() =>
            setShowPassword((previous) => !previous)
          }
        >
          {showPassword ? (
            <EyeOff size={20} />
          ) : (
            <Eye size={20} />
          )}
        </button>
      </div>

      {errorMessage && (
        <p className="sw-login-error" role="alert">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        className="sw-login-submit"
        disabled={loading}
      >
        {loading ? (
          "Opening your world..."
        ) : (
          <>
            Enter Our World
            <Heart size={19} strokeWidth={1.6} />
          </>
        )}
      </button>
    </form>
  );
}
