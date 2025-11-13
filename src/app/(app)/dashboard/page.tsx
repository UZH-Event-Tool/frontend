"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL, fetchJson } from "@/lib/api";
import { getAuthToken, getTokenPayload } from "@/lib/auth";

type Event = {
  id: string;
  name: string;
  description: string;
  location: string;
  startsAt: string;
  images?: string[];
  category: string;
  ownerId: string;
  attendanceLimit: number;
  registrationDeadline: string;
  createdAt: string;
  updatedAt: string;
  attendeesCount?: number;
  isRegistered?: boolean;
};

const FALLBACK_GRADIENT =
  "bg-[radial-gradient(circle_at_top,_#c7d2ff,_#8da2fb,_#5a54ff)]";

const DEFAULT_CATEGORIES = [
  "All",
  "Sports",
  "Study",
  "Party",
  "Networking",
  "Workshop",
  "Social",
];

function formatDateTime(dateIso: string) {
  const date = new Date(dateIso);
  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
  }).format(date);
  const formattedTime = new Intl.DateTimeFormat("en-GB", {
    timeStyle: "short",
  }).format(date);
  return `${formattedDate} at ${formattedTime}`;
}

export default function DashboardPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategories, setActiveCategories] = useState<string[]>(["All"]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [registrationCounts, setRegistrationCounts] = useState<
    Record<string, number>
  >({});
  const [registeredEvents, setRegisteredEvents] = useState<
    Record<string, boolean>
  >({});
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [eventPendingDeletion, setEventPendingDeletion] = useState<Event | null>(
    null,
  );

  useEffect(() => {
    const payload = getTokenPayload();
    if (payload?.sub) {
      setCurrentUserId(payload.sub);
    }
  }, []);

  useEffect(() => {
    async function loadEvents() {
      setIsLoading(true);
      setError(null);
      const token = getAuthToken();

      if (!token) {
        setError("You need to sign in again to view events.");
        setIsLoading(false);
        return;
      }

      try {
        const { data } = await fetchJson<{ events: Event[] }>("/events", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setEvents(data.events);
        const counts: Record<string, number> = {};
        const registrations: Record<string, boolean> = {};
        data.events.forEach((event) => {
          counts[event.id] = event.attendeesCount ?? 0;
          if (event.isRegistered) {
            registrations[event.id] = true;
          }
        });
        setRegistrationCounts(counts);
        setRegisteredEvents(registrations);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unable to load events.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    }

    void loadEvents();
  }, []);

  const categories = useMemo(() => {
    const unique = new Set(
      events.map((event) => event.category).filter(Boolean)
    );
    const ordered = [...DEFAULT_CATEGORIES];
    unique.forEach((category) => {
      if (!ordered.includes(category)) {
        ordered.push(category);
      }
    });
    return ordered;
  }, [events]);

  const filteredEvents = useMemo(() => {
    if (!events.length) {
      return [];
    }

    const normalizedSearch = searchTerm.trim().toLowerCase();

    return events.filter((event) => {
      const matchesCategory =
        activeCategories.includes("All") ||
        activeCategories.includes(event.category);
      const matchesSearch =
        !normalizedSearch ||
        [event.name, event.description, event.location, event.ownerName ?? ""]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedSearch));
      return matchesCategory && matchesSearch;
    });
  }, [events, searchTerm, activeCategories]);

  const showEmptyState =
    !isLoading && !error && events.length > 0 && filteredEvents.length === 0;

  const handleToggleRegistration = (event: Event) => {
    setActionError(null);
    const isRegistered = Boolean(registeredEvents[event.id]);
    const filled = registrationCounts[event.id] ?? 0;
    const hasLimit = (event.attendanceLimit ?? 0) > 0;

    if (!isRegistered && hasLimit && filled >= event.attendanceLimit) {
      setActionError("This event is already full.");
      return;
    }

    setRegisteredEvents((prev) => {
      const next = { ...prev };
      if (isRegistered) {
        delete next[event.id];
      } else {
        next[event.id] = true;
      }
      return next;
    });

    setRegistrationCounts((counts) => {
      const current = counts[event.id] ?? 0;
      if (isRegistered) {
        return { ...counts, [event.id]: Math.max(current - 1, 0) };
      }
      return { ...counts, [event.id]: current + 1 };
    });
  };

  const handleDeleteEvent = async (event: Event) => {
    setActionError(null);
    const token = getAuthToken();
    if (!token) {
      setActionError("You need to sign in again to delete this event.");
      return;
    }

    setPendingDeleteId(event.id);
    try {
      const response = await fetch(`${API_BASE_URL}/events/${event.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const message =
          payload && typeof payload === "object" && "message" in payload
            ? (payload as { message?: string }).message ??
              "Unable to delete event."
            : "Unable to delete event.";
        throw new Error(message);
      }

      setEvents((prev) => prev.filter((item) => item.id !== event.id));
      setRegistrationCounts((prev) => {
        const next = { ...prev };
        delete next[event.id];
        return next;
      });
      setRegisteredEvents((prev) => {
        const next = { ...prev };
        delete next[event.id];
        return next;
      });
      setEventPendingDeletion(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to delete event.";
      setActionError(message);
    } finally {
      setPendingDeleteId(null);
    }
  };

  const requestDeleteEvent = (event: Event) => {
    setActionError(null);
    setEventPendingDeletion(event);
  };

  const handleConfirmDelete = () => {
    if (!eventPendingDeletion) {
      return;
    }
    void handleDeleteEvent(eventPendingDeletion);
  };

  const handleCancelDelete = () => {
    if (pendingDeleteId) {
      return;
    }
    setEventPendingDeletion(null);
  };

  return (
    <>
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6">
        <header>
          <h1 className="text-3xl font-semibold text-gray-900">
            Discover Events
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Find the perfect event to meet, learn, or celebrate with fellow
            students.
          </p>
        </header>

        <div className="flex flex-col gap-4 rounded-3xl border border-transparent bg-white/80 p-5 shadow-[0_18px_45px_rgba(90,84,255,0.12)]">
          <label className="flex w-full items-center gap-3 rounded-full border border-transparent bg-[#fafafa] px-5 py-3 text-sm text-gray-600 shadow-inner">
            <svg
              aria-hidden
              viewBox="0 0 20 20"
              className="h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m19 19-4-4m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
              />
            </svg>
            <input
              aria-label="Search events"
              className="flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
              placeholder="Search events, locations..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const isActive = activeCategories.includes(category);
              return (
                <button
                  key={category}
                  type="button"
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                    isActive
                      ? "bg-indigo-500 text-white shadow-[0_10px_25px_rgba(90,84,255,0.3)]"
                      : "bg-[#fafafa] text-gray-600 hover:bg-[#ece8ff]"
                  }`}
                  onClick={() => {
                    setActiveCategories((prev) => {
                      if (category === "All") {
                        return ["All"];
                      }
                      const withoutAll = prev.filter((item) => item !== "All");
                      if (withoutAll.includes(category)) {
                        const next = withoutAll.filter((item) => item !== category);
                        return next.length ? next : ["All"];
                      }
                      return [...withoutAll, category];
                    });
                  }}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {actionError ? (
        <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600 shadow-[0_18px_45px_rgba(90,84,255,0.08)]">
          {actionError}
        </div>
      ) : null}

      {isLoading ? (
        <section className="grid gap-6 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-80 animate-pulse rounded-3xl bg-gradient-to-br from-[#f0f0ff] to-[#fafaff]"
            />
          ))}
        </section>
      ) : error ? (
        <div className="rounded-3xl border border-dashed border-red-200 bg-white/90 p-6 text-center text-sm text-red-600 shadow-[0_18px_45px_rgba(90,84,255,0.08)]">
          {error}
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-indigo-200 bg-white/90 p-10 text-center shadow-[0_18px_45px_rgba(90,84,255,0.08)]">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-2xl text-indigo-400">
            ✨
          </div>
          <h2 className="text-lg font-semibold text-gray-900">No events yet</h2>
          <p className="text-sm text-gray-500">
            Be the first to organize an event and bring students together.
          </p>
          <Link
            href="/events/new"
            className="rounded-full bg-indigo-500 px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-indigo-600"
          >
            Create an event
          </Link>
        </div>
      ) : (
        <>
          {showEmptyState ? (
            <div className="rounded-3xl border border-dashed border-indigo-100 bg-white/95 p-8 text-center text-sm text-gray-500 shadow-[0_18px_45px_rgba(90,84,255,0.08)]">
              No events match your filters. Try a different search or category.
            </div>
          ) : null}
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredEvents.map((event) => {
              const coverImage = event.images[0] ?? null;
              const resolvedCoverImage =
                coverImage && coverImage.startsWith("/")
                  ? `${API_BASE_URL}${coverImage}`
                  : coverImage;
              const isDataImage =
                typeof resolvedCoverImage === "string" &&
                resolvedCoverImage.startsWith("data:");
              const filled = registrationCounts[event.id] ?? 0;
              const hasLimit = (event.attendanceLimit ?? 0) > 0;
              const spotsLeft = hasLimit
                ? Math.max(event.attendanceLimit - filled, 0)
                : null;
              const isFull = hasLimit && spotsLeft === 0;
              const isOwner =
                currentUserId != null && currentUserId === event.ownerId;
              const isRegistered = Boolean(registeredEvents[event.id]);
              const occupancyLabel = hasLimit
                ? `${filled} / ${event.attendanceLimit} spots filled (${spotsLeft} left)`
                : `${filled} attendee${filled === 1 ? "" : "s"}`;

              return (
                <article
                  key={event.id}
                  className="flex h-full flex-col overflow-hidden rounded-[32px] border border-transparent bg-white shadow-[0_22px_55px_rgba(90,84,255,0.14)] transition hover:-translate-y-1 hover:shadow-[0_30px_70px_rgba(90,84,255,0.18)]"
                >
                  <div className="relative h-44 w-full overflow-hidden">
                    {resolvedCoverImage ? (
                      <Image
                        src={resolvedCoverImage}
                        alt={event.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        unoptimized={isDataImage}
                      />
                    ) : (
                      <div
                        className={`flex h-full w-full items-center justify-center text-sm text-white/80 ${FALLBACK_GRADIENT}`}
                      >
                        Image coming soon
                      </div>
                    )}
                    <span className="absolute right-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-gray-800 shadow">
                      {event.category}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col gap-4 p-6">
                    <div className="space-y-1">
                      <h2 className="text-xl font-semibold text-gray-900">
                        {event.name}
                      </h2>
                      <p className="line-clamp-2 text-sm text-gray-500">
                        {event.description}
                      </p>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          className="h-4 w-4 text-indigo-500"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z"
                          />
                        </svg>
                        <span>{formatDateTime(event.startsAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          className="h-4 w-4 text-indigo-500"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0 1 15 0Z"
                          />
                        </svg>
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          className="h-4 w-4 text-indigo-500"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 0c4.142 0 7.5 2.015 7.5 4.5S16.142 21 12 21s-7.5-2.015-7.5-4.5S7.858 12 12 12Z"
                          />
                        </svg>
                        <span>{event.ownerName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          className="h-4 w-4 text-indigo-500"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M7 8h10m-9 4h8m-7 4h6"
                          />
                        </svg>
                        <span>{occupancyLabel}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 border-t border-gray-100 px-6 py-5">
                    {isOwner ? (
                      <>
                        <Link
                          href={`/events/${event.id}/edit`}
                          className="flex-1 rounded-full border border-gray-200 px-5 py-2 text-center text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => requestDeleteEvent(event)}
                          className="flex-1 rounded-full bg-red-500 px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
                          disabled={pendingDeleteId === event.id}
                        >
                          {pendingDeleteId === event.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleToggleRegistration(event)}
                        disabled={isFull && !isRegistered}
                        className={`w-full rounded-full px-5 py-2 text-sm font-semibold transition ${
                          isRegistered
                            ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            : isFull
                            ? "cursor-not-allowed bg-gray-200 text-gray-500"
                            : "bg-gradient-to-r from-[#5a54ff] to-[#6f6aff] text-white shadow-[0_12px_30px_rgba(90,84,255,0.28)] hover:shadow-[0_16px_34px_rgba(90,84,255,0.35)]"
                        }`}
                      >
                        {isRegistered
                          ? "Deregister"
                          : isFull
                          ? "Full"
                          : "Register"}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        </>
      )}
    </div>
      {eventPendingDeletion ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-[32px] bg-white p-8 text-center shadow-[0_24px_60px_rgba(27,18,66,0.18)]">
            <div className="relative mb-6 flex justify-end">
              <button
                type="button"
                onClick={handleCancelDelete}
                className="text-gray-400 transition hover:text-gray-600"
                aria-label="Close delete confirmation"
              >
                &times;
              </button>
            </div>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl">
              🗑️
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Delete event?</h2>
            <p className="mt-2 text-sm text-gray-500">
              “{eventPendingDeletion.name}” will be removed permanently. This action
              cannot be undone.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                className="w-full rounded-full bg-red-500 px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
                onClick={handleConfirmDelete}
                disabled={pendingDeleteId === eventPendingDeletion.id}
              >
                {pendingDeleteId === eventPendingDeletion.id ? "Deleting..." : "Delete"}
              </button>
              <button
                type="button"
                className="w-full rounded-full border border-transparent bg-[#fafafa] px-5 py-2 text-sm font-semibold text-gray-700 shadow-inner transition hover:bg-[#ece8ff]"
                onClick={handleCancelDelete}
                disabled={pendingDeleteId === eventPendingDeletion.id}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
