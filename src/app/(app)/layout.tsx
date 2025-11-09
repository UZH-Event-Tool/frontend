"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { getAuthToken, clearAuthToken, logout } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/api";

type CurrentUser = {
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  universityEmail: string | null;
};

type NavLink = {
  href: string;
  label: string;
  icon: ReactNode;
  mobileLabel: string;
};

const navLinks: NavLink[] = [
  {
    href: "/dashboard",
    label: "Discover Events",
    mobileLabel: "Feed",
    icon: (
      <svg
        aria-hidden="true"
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 12 12 3l9.75 9M4.5 9.75v10.5a.75.75 0 0 0 .75.75h4.5v-6h4.5v6h4.5a.75.75 0 0 0 .75-.75V9.75"
        />
      </svg>
    ),
  },
  {
    href: "/events/new",
    label: "Create Event",
    mobileLabel: "Create",
    icon: (
      <svg
        aria-hidden="true"
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "My Profile",
    mobileLabel: "Profile",
    icon: (
      <svg
        aria-hidden="true"
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 7.5a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.5 19.5a8.25 8.25 0 0 1 15 0"
        />
      </svg>
    ),
  },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState<"checking" | "authorized">(
    "checking",
  );
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

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

        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          const message =
            payload && typeof payload === "object" && "message" in payload
              ? ((payload as { message?: string }).message ?? "Session expired")
              : "Session expired";
          throw new Error(message);
        }

        if (!isActive) {
          return;
        }

        if (
          payload &&
          typeof payload === "object" &&
          "user" in payload &&
          payload.user &&
          typeof payload.user === "object"
        ) {
          const userPayload = payload.user as CurrentUser;
          setCurrentUser({
            firstName: userPayload.firstName ?? null,
            lastName: userPayload.lastName ?? null,
            fullName: userPayload.fullName ?? null,
            universityEmail: userPayload.universityEmail ?? null,
          });
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

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.warn("Unable to complete logout", error);
    } finally {
      setIsLoggingOut(false);
      router.replace("/login");
    }
  };

  const isProfileRoute = pathname === "/profile";
  const displayName =
    currentUser?.fullName ||
    [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(" ") ||
    currentUser?.universityEmail ||
    "Student";

  const displayEmail = currentUser?.universityEmail ?? "";

  const initials = (() => {
    if (currentUser?.firstName || currentUser?.lastName) {
      const firstInitial = currentUser?.firstName?.charAt(0) ?? "";
      const lastInitial = currentUser?.lastName?.charAt(0) ?? "";
      return `${firstInitial}${lastInitial}`.toUpperCase() || "U";
    }
    if (currentUser?.fullName) {
      return currentUser.fullName
        .split(" ")
        .map((part) => part.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase();
    }
    if (displayEmail) {
      return displayEmail.charAt(0).toUpperCase();
    }
    return "U";
  })();

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
              {initials}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">{displayName}</p>
              {displayEmail ? (
                <p className="text-xs text-gray-400">{displayEmail}</p>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              void handleLogout();
            }}
            disabled={isLoggingOut}
            className="w-full rounded-full border border-transparent bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoggingOut ? "Logging out…" : "Logout"}
          </button>
        </div>
      </aside>

      <main className="flex w-full flex-1 flex-col pb-24 lg:pb-0">
        <header className="flex items-center justify-between border-b border-transparent bg-white/80 px-6 py-6 shadow-[0_10px_40px_rgba(90,84,255,0.12)] backdrop-blur-xl lg:hidden">
          <Link href="/dashboard" className="text-base font-semibold text-indigo-600">
            Campus Events
          </Link>
          {isProfileRoute ? (
            <button
              type="button"
              onClick={() => {
                void handleLogout();
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d7dcf2] bg-white text-gray-700 transition hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-60"
              disabled={isLoggingOut}
              aria-label="Logout"
            >
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 5H9a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h1.5"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 12h6m0 0-2-2m2 2-2 2"
                />
              </svg>
            </button>
          ) : null}
        </header>
        <div className="flex-1 px-6 py-10 lg:px-12 lg:py-12">{children}</div>
        <nav
          className="fixed inset-x-0 bottom-0 z-40 border-t border-indigo-100 bg-white/95 px-6 pt-3 shadow-[0_-16px_30px_rgba(90,84,255,0.12)] backdrop-blur lg:hidden"
          aria-label="Primary"
          style={{
            paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)",
          }}
        >
          <div className="mx-auto flex max-w-3xl items-center justify-around gap-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex flex-1 flex-col items-center rounded-full px-3 py-2 text-xs font-medium transition ${
                    isActive
                      ? "text-indigo-600"
                      : "text-gray-500 hover:text-indigo-500"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
                      isActive
                        ? "bg-indigo-50 text-indigo-600 shadow-inner"
                        : "bg-[#f8fafc] text-gray-500"
                    }`}
                  >
                    {link.icon}
                  </span>
                  <span className="mt-1">{link.mobileLabel}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </main>
    </div>
  );
}
