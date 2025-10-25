const profile = {
  firstName: "Lina",
  lastName: "Hofmann",
  email: "lina.hofmann@uzh.ch",
  fieldOfStudies: "Computer Science",
  interests: ["Tech Meetups", "Board Games", "Hiking"],
  location: "Zürich",
  about:
    "Master student eager to meet fellow UZH newcomers and explore the city together.",
};

const pastEvents = [
  { id: "10", name: "Campus Orientation Tour", date: "2025-09-12" },
  { id: "11", name: "Chocolate Fondue Night", date: "2025-09-25" },
];

const upcomingEvents = [
  { id: "21", name: "UZH Coding Jam", date: "2025-10-19" },
  { id: "22", name: "Autumn Lake Walk", date: "2025-10-30" },
];

const organizedEvents = [
  { id: "31", name: "Board Game Sunday", date: "2025-11-02" },
];

function formatProfileName() {
  return `${profile.firstName} ${profile.lastName}`;
}

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-gray-900">
          {formatProfileName()}
        </h1>
        <p className="text-sm text-gray-500">
          {profile.fieldOfStudies} · {profile.location}
        </p>
      </header>

      <section className="grid gap-6 rounded-3xl border border-transparent bg-white/90 p-8 shadow-[0_20px_50px_rgba(90,84,255,0.15)] lg:grid-cols-[1.2fr_2fr]">
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
              About
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {profile.about}
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
              Contact
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {profile.email}
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
              Interests
            </h2>
            <ul className="mt-2 flex flex-wrap gap-2 text-sm text-gray-600">
              {profile.interests.map((interest) => (
                <li
                  key={interest}
                  className="rounded-full bg-[#ece8ff] px-3 py-1 text-xs font-semibold text-indigo-600"
                >
                  {interest}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <section>
            <header className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Upcoming events
              </h2>
              <button className="text-sm text-indigo-600 transition hover:text-indigo-500">
                Manage RSVP
              </button>
            </header>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              {upcomingEvents.map((event) => (
                <li
                  key={event.id}
                  className="flex items-center justify-between rounded-2xl border border-transparent bg-[#f5f5ff] px-4 py-3 shadow-inner"
                >
                  <span>{event.name}</span>
                  <span className="text-xs uppercase tracking-wide text-gray-400">
                    {event.date}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              Past events
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              {pastEvents.map((event) => (
                <li
                  key={event.id}
                  className="flex items-center justify-between rounded-2xl border border-transparent bg-white px-4 py-3 shadow-[inset_0_1px_0_rgba(90,84,255,0.08)]"
                >
                  <span>{event.name}</span>
                  <span className="text-xs uppercase tracking-wide text-gray-400">
                    {event.date}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              Organized events
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              {organizedEvents.map((event) => (
                <li
                  key={event.id}
                  className="flex items-center justify-between rounded-2xl border border-transparent bg-white px-4 py-3 shadow-[inset_0_1px_0_rgba(90,84,255,0.08)]"
                >
                  <span>{event.name}</span>
                  <span className="text-xs uppercase tracking-wide text-gray-400">
                    {event.date}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </section>

      <div className="flex justify-end">
        <button className="rounded-full border border-transparent bg-[#f3f5ff] px-5 py-2 text-sm font-semibold text-indigo-600 shadow-inner transition hover:bg-[#ece8ff]">
          Edit profile
        </button>
      </div>
    </div>
  );
}
