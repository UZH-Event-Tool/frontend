"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";
import { EventForm, type EventFormInitialData } from "../../EventForm";

export default function EditEventPage() {
  const params = useParams<{ eventId: string }>();
  const router = useRouter();
  const { eventId } = params;
  const [eventData, setEventData] = useState<EventFormInitialData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvent() {
      if (!eventId) {
        setError("Missing event id.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      const token = getAuthToken();
      if (!token) {
        setError("You need to sign in to edit this event.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const payload = await response.json().catch(() => null);

        if (!response.ok || !payload || typeof payload !== "object") {
          throw new Error(
            (payload as { message?: string })?.message ?? "Unable to load the event.",
          );
        }

        const event = (payload as { event: EventFormInitialData }).event;
        setEventData(event);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unable to load the event.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEvent();
  }, [eventId]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header className="flex flex-col gap-2">
        <Link
          href="/dashboard"
          className="text-sm font-medium text-indigo-600 transition hover:text-indigo-500"
        >
          ← Back to events
        </Link>
        <h1 className="text-3xl font-semibold text-gray-900">
          {eventData ? `Edit “${eventData.name}”` : "Edit event"}
        </h1>
        <p className="text-sm text-gray-500">
          Update event details. Changes are visible to attendees immediately.
        </p>
      </header>

      {isLoading ? (
        <div className="rounded-3xl border border-dashed border-indigo-100 bg-white/90 p-8 text-center text-sm text-gray-500 shadow-[0_18px_45px_rgba(90,84,255,0.08)]">
          Loading event details...
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-dashed border-red-200 bg-white/90 p-8 text-center text-sm text-red-600 shadow-[0_18px_45px_rgba(90,84,255,0.08)]">
          {error}
        </div>
      ) : eventData ? (
        <EventForm
          mode="edit"
          eventId={eventId}
          initialEvent={eventData}
          onSuccess={() => router.push("/dashboard")}
        />
      ) : null}
    </div>
  );
}
