"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { postJson } from "@/lib/api";
import { setAuthToken } from "@/lib/auth";

const inputClasses =
  "w-full rounded-full border border-transparent bg-[#f8fafc] px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 shadow-inner focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200";

type LoginResponse = {
  token?: string;
  user?: {
    id?: string;
    universityEmail?: string;
    fullName?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

export function LoginForm() {
  const router = useRouter();
  const [universityEmail, setUniversityEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { data } = await postJson<LoginResponse>("/auth/login", {
        universityEmail,
        password,
      });

      if (data?.token) {
        setAuthToken(data.token);
      }

      router.push("/dashboard");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to sign in right now.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-[32px] bg-white p-10 shadow-[0_25px_70px_rgba(90,84,255,0.18)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-b from-[#5a54ff] to-[#7f78ff] shadow-lg">
          <span className="text-3xl text-white">🎓</span>
        </div>
        <div className="mt-6 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Welcome Back!</h1>
          <p className="mt-2 text-sm text-gray-500">
            Sign in to discover and join campus events
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {error ? (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          ) : null}
          <label className="flex flex-col gap-2 text-sm font-medium text-gray-600">
            University Email
            <input
              className={inputClasses}
              placeholder="your.email@university.edu"
              type="email"
              autoComplete="email"
              value={universityEmail}
              onChange={(event) => setUniversityEmail(event.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-gray-600">
            Password
            <input
              className={inputClasses}
              placeholder="Enter your password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          <div className="text-right text-sm">
            <Link
              href="#"
              className="font-medium text-indigo-600 transition hover:text-indigo-500"
            >
              Forgot password?
            </Link>
          </div>
          <button
            type="submit"
            className="flex h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-[#5a54ff] to-[#6f6aff] text-sm font-semibold text-white shadow-lg transition hover:shadow-[0_12px_30px_rgba(90,84,255,0.35)]"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
      <p className="mt-6 text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-indigo-600 transition hover:text-indigo-500"
        >
          Sign up here
        </Link>
      </p>
    </div>
  );
}
