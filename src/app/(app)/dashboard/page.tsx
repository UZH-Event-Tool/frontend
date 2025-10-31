import Link from "next/link";

const sampleEvents = [
  {
    id: "1",
    name: "Basketball Tournament Finals",
    description:
      "Cheer for your faculty’s team in the inter-department finals. Music, snacks, and team spirit guaranteed!",
    location: "Campus Sports Center",
    slotsAvailable: 12,
    slotsTotal: 50,
    startsAt: "2025-10-20T18:00:00Z",
    category: "Sports",
    coverClass:
      "bg-[radial-gradient(circle_at_top,_#6a9bff,_#3c62ff,_#1a2a6c)]",
  },
  {
    id: "2",
    name: "Data Structures Study Group",
    description:
      "Weekly problem-solving session covering trees, graphs, and dynamic programming. All levels welcome!",
    location: "Main Library, Room 204",
    slotsAvailable: 3,
    slotsTotal: 15,
    startsAt: "2025-10-15T14:00:00Z",
    category: "Study",
    coverClass:
      "bg-[radial-gradient(circle_at_top,_#ffd9e8,_#f093fb,_#6d2ad4)]",
  },
  {
    id: "3",
    name: "Fall Semester Mixer",
    description:
      "End-of-midterms celebration with live DJ, mocktails, and photobooth. Open to all UZH students!",
    location: "Student Union Hall",
    slotsAvailable: 13,
    slotsTotal: 100,
    startsAt: "2025-10-18T20:00:00Z",
    category: "Party",
    coverClass:
      "bg-[radial-gradient(circle_at_top,_#fdf2a1,_#ffbb70,_#f76b45)]",
  },
];

const filterCategories = [
  "All",
  "Sports",
  "Study",
  "Party",
  "Networking",
  "Workshop",
  "Social",
];

function formatDate(dateIso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateIso));
}

export default function DashboardPage() {
  return (
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
              placeholder="Search events, locations…"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {filterCategories.map((category, index) => (
              <button
                key={category}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  index === 0
                    ? "bg-indigo-500 text-white shadow-[0_10px_25px_rgba(90,84,255,0.3)]"
                    : "bg-[#fafafa] text-gray-600 hover:bg-[#ece8ff]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-3">
        {sampleEvents.map((event) => (
          <article
            key={event.id}
            className="flex flex-col overflow-hidden rounded-3xl border border-transparent bg-white/95 shadow-[0_22px_55px_rgba(90,84,255,0.16)] transition hover:-translate-y-1 hover:shadow-[0_25px_60px_rgba(90,84,255,0.2)]"
          >
            <div
              className={`relative h-40 w-full overflow-hidden ${event.coverClass}`}
            >
              <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-indigo-600 shadow">
                {event.category}
              </span>
            </div>

            <div className="flex flex-1 flex-col gap-4 p-5">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-gray-900">
                  {event.name}
                </h2>
                <p className="line-clamp-2 text-sm text-gray-500">
                  {event.description}
                </p>
              </div>

              <dl className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🗓</span>
                  <div>
                    <dt className="font-medium text-gray-700">When</dt>
                    <dd className="text-gray-500">
                      {formatDate(event.startsAt)}
                    </dd>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">📍</span>
                  <div>
                    <dt className="font-medium text-gray-700">Where</dt>
                    <dd className="text-gray-500">{event.location}</dd>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">👥</span>
                  <div>
                    <dt className="font-medium text-gray-700">Attendance</dt>
                    <dd className="text-gray-500">
                      {event.slotsTotal - event.slotsAvailable} /{" "}
                      {event.slotsTotal} spots filled ({event.slotsAvailable}{" "}
                      left)
                    </dd>
                  </div>
                </div>
              </dl>
            </div>

            <div className="flex flex-col gap-2 p-5 pt-0">
              <Link
                href={`/events/${event.id}`}
                className="inline-flex items-center justify-center rounded-full border border-transparent bg-[#f5f5ff] px-4 py-2 text-sm font-medium text-indigo-600 transition hover:bg-[#ece8ff]"
              >
                View details
              </Link>
              <button
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#5a54ff] to-[#6f6aff] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(90,84,255,0.28)] transition hover:shadow-[0_16px_34px_rgba(90,84,255,0.35)] disabled:bg-gray-300 disabled:text-gray-600 disabled:shadow-none disabled:hover:bg-gray-300"
                disabled={event.slotsAvailable === 0}
              >
                {event.slotsAvailable === 0 ? "Event Full" : "Register"}
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
