import Link from "next/link";

const mockEvent = {
  id: "1",
  name: "Welcome Mixer @ Campus",
  description:
    "Kick off the semester with fellow UZH students. Expect music, snacks, and speed networking rounds to meet new friends quickly.",
  location: "UZH Zentrum, Main Hall",
  startsAt: "2025-10-21T18:00",
  endsAt: "2025-10-21T21:00",
  capacity: 50,
  category: "Networking",
  theme: "Newcomer Week",
};

export default function EditEventPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header className="flex flex-col gap-2">
        <Link
          href={`/events/${mockEvent.id}`}
          className="text-sm font-medium text-indigo-600 transition hover:text-indigo-500"
        >
          ← Back to event
        </Link>
        <h1 className="text-3xl font-semibold text-gray-900">
          Edit “{mockEvent.name}”
        </h1>
        <p className="text-sm text-gray-500">
          Update event details. Changes are visible to attendees immediately.
        </p>
      </header>

      <form className="space-y-6 rounded-3xl border border-transparent bg-white/90 p-8 shadow-[0_20px_50px_rgba(90,84,255,0.15)]">
        <div className="grid gap-4">
          <label className="flex flex-col gap-2 text-sm text-gray-600">
            <span className="font-medium text-gray-900">
              Event Name
            </span>
            <input
              defaultValue={mockEvent.name}
              className="rounded-full border border-transparent bg-[#f3f5ff] px-4 py-3 text-sm text-gray-900 shadow-inner outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-gray-600">
            <span className="font-medium text-gray-900">
              Description
            </span>
            <textarea
              defaultValue={mockEvent.description}
              rows={4}
              className="rounded-2xl border border-transparent bg-[#f8f7ff] px-4 py-3 text-sm text-gray-900 shadow-inner outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-gray-600">
              <span className="font-medium text-gray-900">
                Location
              </span>
              <input
                defaultValue={mockEvent.location}
                className="rounded-full border border-transparent bg-[#f3f5ff] px-4 py-3 text-sm text-gray-900 shadow-inner outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-gray-600">
              <span className="font-medium text-gray-900">
                Maximum attendees
              </span>
              <input
                type="number"
                defaultValue={mockEvent.capacity}
                className="rounded-full border border-transparent bg-[#f3f5ff] px-4 py-3 text-sm text-gray-900 shadow-inner outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
              />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-gray-600">
              <span className="font-medium text-gray-900">
                Start Time
              </span>
              <input
                type="datetime-local"
                defaultValue={mockEvent.startsAt}
                className="rounded-full border border-transparent bg-[#f3f5ff] px-4 py-3 text-sm text-gray-900 shadow-inner outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-gray-600">
              <span className="font-medium text-gray-900">
                End Time
              </span>
              <input
                type="datetime-local"
                defaultValue={mockEvent.endsAt}
                className="rounded-full border border-transparent bg-[#f3f5ff] px-4 py-3 text-sm text-gray-900 shadow-inner outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
              />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-gray-600">
              <span className="font-medium text-gray-900">
                Event Category
              </span>
              <input
                defaultValue={mockEvent.category}
                className="rounded-full border border-transparent bg-[#f3f5ff] px-4 py-3 text-sm text-gray-900 shadow-inner outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-gray-600">
              <span className="font-medium text-gray-900">
                Event Theme
              </span>
              <input
                defaultValue={mockEvent.theme}
                className="rounded-full border border-transparent bg-[#f3f5ff] px-4 py-3 text-sm text-gray-900 shadow-inner outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="rounded-full border border-transparent bg-[#f3f5ff] px-5 py-2 text-sm font-semibold text-indigo-600 shadow-inner transition hover:bg-[#ece8ff]"
          >
            Discard changes
          </button>
          <button
            type="submit"
            className="rounded-full bg-gradient-to-r from-[#5a54ff] to-[#6f6aff] px-5 py-2 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(90,84,255,0.28)] transition hover:shadow-[0_16px_34px_rgba(90,84,255,0.35)]"
          >
            Save updates
          </button>
        </div>
      </form>
    </div>
  );
}
