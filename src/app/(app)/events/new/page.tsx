const formFields = [
  { label: "Event Name", name: "name", type: "text", placeholder: "Karaoke Night" },
  {
    label: "Description",
    name: "description",
    type: "textarea",
    placeholder: "Describe the vibe, agenda, and who should join.",
  },
  { label: "Location", name: "location", type: "text", placeholder: "Campus Zentrum, Room H-132" },
  { label: "Start Time", name: "startsAt", type: "datetime-local" },
  { label: "End Time", name: "endsAt", type: "datetime-local" },
  { label: "Maximum attendees", name: "capacity", type: "number", placeholder: "50" },
  { label: "Event category", name: "category", type: "text", placeholder: "Networking / Culture / Outdoors" },
  { label: "Event theme", name: "theme", type: "text", placeholder: "Welcome Week" },
];

export default function CreateEventPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-gray-900">
          Publish a new event
        </h1>
        <p className="text-sm text-gray-500">
          Fill in the details below. You can update them later from the event page.
        </p>
      </header>

      <form className="space-y-6 rounded-3xl border border-transparent bg-white/90 p-8 shadow-[0_20px_50px_rgba(90,84,255,0.15)]">
        <div className="grid gap-4">
          {formFields.map((field) => (
            <label key={field.name} className="flex flex-col gap-2 text-sm text-gray-600">
              <span className="font-medium text-gray-900">
                {field.label}
              </span>
              {field.type === "textarea" ? (
                <textarea
                  name={field.name}
                  rows={4}
                  className="rounded-2xl border border-transparent bg-[#f8f7ff] px-4 py-3 text-sm text-gray-900 shadow-inner outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
                  placeholder={field.placeholder}
                />
              ) : (
                <input
                  name={field.name}
                  type={field.type}
                  className="rounded-full border border-transparent bg-[#f3f5ff] px-4 py-3 text-sm text-gray-900 shadow-inner outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
                  placeholder={field.placeholder}
                />
              )}
            </label>
          ))}
        </div>

        <fieldset className="space-y-2">
          <span className="text-sm font-medium text-gray-900">
            Images
          </span>
          <p className="text-xs text-gray-500">
            Drag and drop promotional pictures or upload them from your device.
          </p>
          <div className="flex min-h-[140px] items-center justify-center rounded-3xl border border-dashed border-[#dcd9ff] bg-[#f8f7ff] text-sm text-gray-500">
            Upload component TBD
          </div>
        </fieldset>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="rounded-full border border-transparent bg-[#f3f5ff] px-5 py-2 text-sm font-semibold text-indigo-600 shadow-inner transition hover:bg-[#ece8ff]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-full bg-gradient-to-r from-[#5a54ff] to-[#6f6aff] px-5 py-2 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(90,84,255,0.28)] transition hover:shadow-[0_16px_34px_rgba(90,84,255,0.35)]"
          >
            Create Event
          </button>
        </div>
      </form>
    </div>
  );
}
