"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

const mockEvent = {
  id: "1",
  name: "Welcome Mixer @ Campus",
  description:
    "Kick off the semester with fellow UZH students. Expect music, snacks, and speed networking rounds to meet new friends quickly.",
  location: "UZH Zentrum, Main Hall",
  startsAt: "2025-10-21T18:00:00Z",
  endsAt: "2025-10-21T21:00:00Z",
  slotsTotal: 50,
  slotsTaken: 38,
  organizer: {
    name: "Lara Meier",
    email: "lara.meier@uzh.ch",
  },
  images: ["/events/welcome-mixer.jpg"],
};

function formatDate(datetime: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(datetime));
}

export default function EventDetailPage() {
  const params = useParams<{ eventId: string }>();
  const { eventId } = params;
  const remainingSlots = mockEvent.slotsTotal - mockEvent.slotsTaken;

  return (
    <div className="flex flex-col gap-6">
      <nav className="text-sm text-indigo-600">
        <Link className="font-medium hover:text-indigo-500" href="/dashboard">
          ← Back to events
        </Link>
      </nav>

      <header className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-wide text-gray-400">
          Event #{eventId}
        </span>
        <h1 className="text-3xl font-semibold text-gray-900">
          {mockEvent.name}
        </h1>
        <p className="text-sm text-gray-500">
          Organized by {mockEvent.organizer.name} ·
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <article className="space-y-4 rounded-3xl border border-transparent bg-white/90 p-6 shadow-[0_20px_50px_rgba(90,84,255,0.15)]">
          <h2 className="text-lg font-semibold text-gray-900">Overview</h2>
          <p className="text-sm text-gray-600">{mockEvent.description}</p>
          <dl className="grid gap-3 text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <dt className="font-medium">Starts</dt>
              <dd>{formatDate(mockEvent.startsAt)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="font-medium">Ends</dt>
              <dd>{formatDate(mockEvent.endsAt)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="font-medium">Location</dt>
              <dd>{mockEvent.location}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="font-medium">Slots</dt>
              <dd>
                {mockEvent.slotsTaken}/{mockEvent.slotsTotal} filled
              </dd>
            </div>
          </dl>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-full bg-gradient-to-r from-[#5a54ff] to-[#6f6aff] px-5 py-2 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(90,84,255,0.28)] transition hover:shadow-[0_16px_34px_rgba(90,84,255,0.35)]">
              Join Event
            </button>
            <button className="rounded-full border border-transparent bg-[#fafafa] px-5 py-2 text-sm font-semibold text-indigo-600 shadow-inner transition hover:bg-[#ece8ff]">
              Message Organizer
            </button>
          </div>
        </article>

        <aside className="space-y-4 rounded-3xl border border-transparent bg-white/90 p-6 shadow-[0_20px_50px_rgba(90,84,255,0.15)]">
          <h2 className="text-lg font-semibold text-gray-900">Attendance</h2>
          <p className="text-sm text-gray-600">
            {remainingSlots > 0
              ? `${remainingSlots} slots available`
              : "This event is currently full. Join the waitlist to get notified."}
          </p>
          <div className="rounded-2xl border border-dashed border-[#dcd9ff] bg-[#fafafa] p-4 text-sm text-gray-500">
            RSVP graph or attendee list will appear here once the data layer is
            connected.
          </div>
          <Link
            href={`/events/${eventId}/edit`}
            className="inline-flex items-center justify-center rounded-full border border-transparent bg-[#fafafa] px-5 py-2 text-sm font-semibold text-indigo-600 shadow-inner transition hover:bg-[#ece8ff]"
          >
            Edit Event
          </Link>
        </aside>
      </section>
    </div>
  );
}
