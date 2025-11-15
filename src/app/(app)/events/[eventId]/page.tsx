"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import { getAuthToken, getTokenPayload } from "@/lib/auth";

type EventDetail = {
  id: string;
  name: string;
  description: string;
  location: string;
  startsAt: string;
  category: string;
  ownerId: string;
  ownerName: string;
  images: string[];
  registrationCount: number;
  attendanceLimit: number;
  registrationDeadline: string;
  isRegistered: boolean;
};

function formatDate(datetime: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(datetime));
}

export default function EventDetailPage() {
  const params = useParams<{ eventId: string }>();
  const router = useRouter();
  const { eventId } = params;
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isUnregistering, setIsUnregistering] = useState(false);
  const [registerMessage, setRegisterMessage] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const tokenPayload = useMemo(() => getTokenPayload(), []);
  const isOwner = event && tokenPayload?.sub === event.ownerId;

  const fetchEvent = useCallback(
    async (options?: { silent?: boolean }) => {
      const silent = options?.silent === true;
      if (!silent) {
        setIsLoading(true);
        setError(null);
      }
      const token = getAuthToken();
      if (!token) {
        const message = "You need to sign in again to view this event.";
        if (!silent) {
          setError(message);
          setIsLoading(false);
        }
        return;
      }
      try {
        const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          const message =
            payload && typeof payload === "object" && "message" in payload
              ? (payload as { message?: string }).message ??
                "Unable to load this event."
              : "Unable to load this event.";
          throw new Error(message);
        }

        if (
          payload &&
          typeof payload === "object" &&
          payload.event &&
          typeof payload.event === "object"
        ) {
          const eventData = payload.event as EventDetail;
          setEvent(eventData);
          setIsRegistered(Boolean(eventData.isRegistered));
          setCurrentImageIndex(0);
        } else {
          throw new Error("Event data is missing.");
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unable to load this event.";
        if (!silent) {
          setError(message);
        }
      } finally {
        if (!silent) {
          setIsLoading(false);
        }
      }
    },
    [eventId],
  );

  useEffect(() => {
    void fetchEvent();
  }, [fetchEvent]);

  const handleRegister = async () => {
    if (!event || event.isRegistered) {
      return;
    }
    const isFull =
      event.attendanceLimit > 0 && event.registrationCount >= event.attendanceLimit;
    const registrationDeadlinePassed =
      new Date(event.registrationDeadline).getTime() <= Date.now();

    if (isFull || registrationDeadlinePassed) {
      setRegisterError(
        isFull ? "This event is already full." : "Registration deadline has passed.",
      );
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setRegisterError("You need to sign in again to register for this event.");
      return;
    }

    setRegisterError(null);
    setRegisterMessage(null);
    setIsRegistering(true);
    try {
      const response = await fetch(`${API_BASE_URL}/events/${event.id}/register`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          payload && typeof payload === "object" && "message" in payload
            ? (payload as { message?: string }).message ??
              "Unable to register for this event."
            : "Unable to register for this event.";
        throw new Error(message);
      }

      const registrationCount =
        (payload as { registrationCount?: number })?.registrationCount ??
        event.registrationCount + 1;

      setEvent((prev) =>
        prev
          ? {
              ...prev,
              registrationCount,
              isRegistered: true,
            }
          : prev,
      );
      setIsRegistered(true);
      setRegisterMessage("You're registered for this event.");
      await fetchEvent({ silent: true });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to register for this event.";
      setRegisterError(message);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleUnregister = async () => {
    if (!event || !event.isRegistered) {
      return;
    }

    const registrationDeadlinePassed =
      new Date(event.registrationDeadline).getTime() <= Date.now();

    if (registrationDeadlinePassed) {
      setRegisterError("Registration deadline has passed.");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setRegisterError("You need to sign in again to update registrations.");
      return;
    }

    setRegisterError(null);
    setRegisterMessage(null);
    setIsUnregistering(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/events/${event.id}/unregister`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          payload && typeof payload === "object" && "message" in payload
            ? (payload as { message?: string }).message ??
              "Unable to unregister from this event."
            : "Unable to unregister from this event.";
        throw new Error(message);
      }

      const registrationCount =
        (payload as { registrationCount?: number })?.registrationCount ??
        Math.max(event.registrationCount - 1, 0);

      setEvent((prev) =>
        prev
          ? {
              ...prev,
              registrationCount,
              isRegistered: false,
            }
          : prev,
      );
      setIsRegistered(false);
      setRegisterMessage("You have been removed from this event.");
      await fetchEvent({ silent: true });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to unregister from this event.";
      setRegisterError(message);
    } finally {
      setIsUnregistering(false);
    }
  };

  const handleDelete = async () => {
    if (!event) {
      return;
    }
    const confirmed = window.confirm(
      `Delete "${event.name}"? This action cannot be undone.`,
    );
    if (!confirmed) {
      return;
    }
    const token = getAuthToken();
    if (!token) {
      setError("You need to sign in again to delete this event.");
      return;
    }
    setIsDeleting(true);
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
              "Unable to delete this event."
            : "Unable to delete this event.";
        throw new Error(message);
      }

      router.push("/dashboard");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to delete this event.";
      setError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-dashed border-indigo-100 bg-white/95 p-8 text-center text-sm text-gray-500 shadow-[0_18px_45px_rgba(90,84,255,0.08)]">
        Loading event...
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="rounded-3xl border border-dashed border-red-200 bg-white/95 p-8 text-center text-sm text-red-600 shadow-[0_18px_45px_rgba(90,84,255,0.08)]">
        {error ?? "Event not found."}
      </div>
    );
  }

  const images = event.images && event.images.length ? event.images : [];
  const resolvedImages = images.map((image) =>
    image.startsWith("/") ? `${API_BASE_URL}${image}` : image,
  );

  const currentImage =
    resolvedImages.length > 0
      ? resolvedImages[currentImageIndex % resolvedImages.length]
      : null;
  const isFull =
    event.attendanceLimit > 0 && event.registrationCount >= event.attendanceLimit;
  const registrationDeadlinePassed =
    new Date(event.registrationDeadline).getTime() <= Date.now();

  return (
    <div className="flex flex-col gap-6">
      <nav className="text-sm text-indigo-600">
        <Link className="font-medium hover:text-indigo-500" href="/dashboard">
          ← Back to events
        </Link>
      </nav>

      <header className="flex flex-col gap-2">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">
              {event.name}
            </h1>
            <p className="text-sm text-gray-500">
              Organized by {event.ownerName || "Event host"} · {event.category}
            </p>
          </div>
          <div />
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <article className="space-y-4 rounded-3xl border border-transparent bg-white/90 p-6 shadow-[0_20px_50px_rgba(90,84,255,0.15)]">
          {currentImage ? (
            <div className="relative h-72 overflow-hidden rounded-2xl">
              <Image
                src={currentImage}
                alt={event.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 66vw"
              />
              {resolvedImages.length > 1 ? (
                <div className="absolute inset-0 flex items-center justify-between px-4">
                  <button
                    type="button"
                    className="rounded-full bg-white/80 p-2 text-gray-700 shadow hover:bg-white"
                    onClick={() =>
                      setCurrentImageIndex((index) =>
                        (index - 1 + resolvedImages.length) %
                        resolvedImages.length,
                      )
                    }
                    aria-label="Previous image"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className="rounded-full bg-white/80 p-2 text-gray-700 shadow hover:bg-white"
                    onClick={() =>
                      setCurrentImageIndex(
                        (index) => (index + 1) % resolvedImages.length,
                      )
                    }
                    aria-label="Next image"
                  >
                    ›
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed border-indigo-100 bg-indigo-50 text-sm text-indigo-500">
              Event images will appear here.
            </div>
          )}
          <h2 className="text-lg font-semibold text-gray-900">Overview</h2>
          <p className="text-sm text-gray-600">{event.description}</p>
          <dl className="grid gap-3 text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <dt className="font-medium">Starts</dt>
              <dd>{formatDate(event.startsAt)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="font-medium">Location</dt>
              <dd>{event.location}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="font-medium">Category</dt>
              <dd>{event.category}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="font-medium">Event Owner</dt>
              <dd>{event.ownerName || "Event host"}</dd>
            </div>
          </dl>
        </article>

        <aside className="space-y-4 rounded-3xl border border-transparent bg-white/90 p-6 shadow-[0_20px_50px_rgba(90,84,255,0.15)]">
          <h2 className="text-lg font-semibold text-gray-900">Attendance</h2>
          <p className="text-sm text-gray-600">
            {`${event.registrationCount} / ${event.attendanceLimit} spots filled`}
          </p>
          <p className="text-xs text-gray-500">
            Registration closes: {formatDate(event.registrationDeadline)}
          </p>
          {isOwner ? (
            <div className="flex flex-col gap-3">
              <Link
                href={`/events/${event.id}/edit`}
                className="rounded-full border border-gray-200 px-5 py-2 text-center text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Edit Event
              </Link>
              <button
                type="button"
                className="rounded-full bg-red-500 px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Event"}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {isRegistered ? (
                <button
                  type="button"
                  onClick={handleUnregister}
                  disabled={registrationDeadlinePassed || isUnregistering}
                  className={`w-full rounded-full px-5 py-2 text-sm font-semibold transition ${
                    registrationDeadlinePassed
                      ? "cursor-not-allowed bg-gray-200 text-gray-500"
                      : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {isUnregistering ? "Unregistering..." : "Unregister"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRegister}
                  disabled={isFull || registrationDeadlinePassed || isRegistering}
                  className={`w-full rounded-full px-5 py-2 text-sm font-semibold transition ${
                    isFull || registrationDeadlinePassed
                      ? "cursor-not-allowed bg-gray-200 text-gray-500"
                      : "bg-gradient-to-r from-[#5a54ff] to-[#6f6aff] text-white shadow-[0_12px_30px_rgba(90,84,255,0.28)] hover:shadow-[0_16px_34px_rgba(90,84,255,0.35)]"
                  }`}
                >
                  {isRegistering
                    ? "Registering..."
                    : isFull
                      ? "Event Full"
                      : registrationDeadlinePassed
                        ? "Registration Closed"
                        : "Register"}
                </button>
              )}
              {registerError ? (
                <p className="text-xs text-red-600">{registerError}</p>
              ) : null}
              {registerMessage ? (
                <p className="text-xs text-green-600">{registerMessage}</p>
              ) : null}
              {!registerError && registrationDeadlinePassed ? (
                <p className="text-xs text-gray-500">
                  Registration deadline has passed.
                </p>
              ) : null}
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}
