"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { postJson } from "@/lib/api";
import { setAuthToken } from "@/lib/auth";

const inputClasses =
  "w-full rounded-full border border-transparent bg-[#f8fafc] px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 shadow-inner focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200";

export function RegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [location, setLocation] = useState("");
  const [fieldOfStudies, setFieldOfStudies] = useState("");
  const [universityEmail, setUniversityEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [interestInput, setInterestInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const interests = useMemo(
    () =>
      interestInput
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    [interestInput],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords must match.");
      return;
    }

    const numericAge = Number.parseInt(age, 10);
    if (Number.isNaN(numericAge) || numericAge < 16) {
      setError("Age must be a number greater than or equal to 16.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await postJson<{ token?: string }>("/auth/register", {
        fullName,
        email,
        password,
        age: numericAge,
        location,
        fieldOfStudies,
        universityEmail: universityEmail || undefined,
        interests,
      });

      if (data?.token) {
        setAuthToken(data.token);
      }

      router.push("/dashboard");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to create your account.";
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
          <h1 className="text-2xl font-semibold text-gray-900">Join Us!</h1>
          <p className="mt-2 text-sm text-gray-500">
            Create your account and start connecting
          </p>
        </div>

        <button
          type="button"
          className="mt-8 flex w-full flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-indigo-100 bg-[#f8fafc] px-6 py-6 text-sm font-medium text-indigo-600 transition hover:border-indigo-200 hover:bg-[#e2e8f0]"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl text-indigo-500 shadow-inner">
            ⬆️
          </span>
          Upload Profile Picture
        </button>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {error ? (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          ) : null}
          <label className="flex flex-col gap-2 text-sm font-medium text-gray-600">
            Full Name
            <input
              className={inputClasses}
              placeholder="John Doe"
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              autoComplete="name"
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-gray-600">
            Email
            <input
              className={inputClasses}
              placeholder="john.doe@uzh.ch"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium text-gray-600">
              Age
              <input
                className={inputClasses}
                placeholder="20"
                type="number"
                min={16}
                value={age}
                onChange={(event) => setAge(event.target.value)}
                required
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-gray-600">
              Location
              <input
                className={inputClasses}
                placeholder="Zürich, CH"
                type="text"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                autoComplete="address-level2"
                required
              />
            </label>
          </div>
          <label className="flex flex-col gap-2 text-sm font-medium text-gray-600">
            Field of Studies
            <input
              className={inputClasses}
              placeholder="Computer Science"
              type="text"
              value={fieldOfStudies}
              onChange={(event) => setFieldOfStudies(event.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-gray-600">
            University Email <span className="text-xs text-gray-400">(optional)</span>
            <input
              className={inputClasses}
              placeholder="your.email@university.edu"
              type="email"
              value={universityEmail}
              onChange={(event) => setUniversityEmail(event.target.value)}
              autoComplete="email"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-gray-600">
            Password
            <input
              className={inputClasses}
              placeholder="At least 6 characters"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-gray-600">
            Confirm Password
            <input
              className={inputClasses}
              placeholder="Re-enter your password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-gray-600">
            Interests{" "}
            <span className="text-xs text-gray-400">
              Separate with commas (e.g. Hiking, Networking)
            </span>
            <textarea
              className={`${inputClasses} min-h-[90px] resize-y`}
              placeholder="Hiking, Networking, Language Exchange"
              value={interestInput}
              onChange={(event) => setInterestInput(event.target.value)}
            />
          </label>
          <button
            type="submit"
            className="mt-4 flex h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-[#5a54ff] to-[#6f6aff] text-sm font-semibold text-white shadow-lg transition hover:shadow-[0_12px_30px_rgba(90,84,255,0.35)]"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating your account..." : "Register"}
          </button>
        </form>
      </div>
      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-indigo-600 transition hover:text-indigo-500"
        >
          Sign in here
        </Link>
      </p>
    </div>
  );
}
