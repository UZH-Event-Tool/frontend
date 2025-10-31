"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { getAuthToken, clearAuthToken } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/api";

const navLinks = [
  { href: "/dashboard", label: "Discover Events" },
  { href: "/events/new", label: "Create Event" },
  { href: "/profile", label: "My Profile" },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState<"checking" | "authorized">(
    "checking",
  );

  useEffect(() => {
    let isActive = true;

    const verifySession = async () => {
      const token = getAuthToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Session expired");
        }

        if (!isActive) {
          return;
        }

        setAuthStatus("authorized");
      } catch (error) {
        console.warn("Auth check failed", error);
        clearAuthToken();
        router.replace("/login");
      }
    };

    void verifySession();

    return () => {
      isActive = false;
    };
  }, [router]);

  if (authStatus === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] text-sm text-gray-500">
        Checking your session…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#fafafa] text-gray-900">
      <aside className="hidden w-[260px] flex-col justify-between border-r border-transparent bg-white/90 px-6 py-8 shadow-[8px_0_40px_rgba(90,84,255,0.12)] backdrop-blur-xl lg:flex">
        <div className="space-y-10">
          <div>
            <Link href="/dashboard" className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#5a54ff] to-[#7c77ff] text-2xl text-white shadow-lg">
                🎓
              </span>
              <div>
                <p className="text-sm font-medium text-indigo-600">
                  Campus Events
                </p>
                <p className="text-xs text-gray-400">
                  Gather, connect, celebrate
                </p>
              </div>
            </Link>
          </div>
          <nav className="space-y-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-indigo-500 text-white shadow-[0_12px_30px_rgba(90,84,255,0.35)]"
                      : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-3 rounded-2xl border border-transparent bg-[#fafafa] p-4 shadow-inner">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-600">
              JD
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">john doe</p>
              <p className="text-xs text-gray-400">john.doe@uzh.ch</p>
            </div>
          </div>
          <button className="w-full rounded-full border border-transparent bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-indigo-50 hover:text-indigo-600">
            Logout
          </button>
        </div>
      </aside>

      <main className="flex w-full flex-1 flex-col">
        <header className="border-b border-transparent bg-white/80 px-6 py-6 shadow-[0_10px_40px_rgba(90,84,255,0.12)] backdrop-blur-xl lg:hidden">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="text-base font-semibold text-indigo-600"
            >
              Campus Events
            </Link>
            <nav className="flex items-center gap-3 text-sm text-gray-600">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-full px-3 py-2 transition ${
                      isActive
                        ? "bg-indigo-500 text-white"
                        : "hover:bg-indigo-50 hover:text-indigo-600"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </header>
        <div className="flex-1 px-6 py-10 lg:px-12 lg:py-12">{children}</div>
      </main>
    </div>
  );
}
