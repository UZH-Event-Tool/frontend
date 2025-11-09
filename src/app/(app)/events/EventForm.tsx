"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";

export type EventFormInitialData = {
  id: string;
  name: string;
  description: string;
  location: string;
  startsAt: string;
  registrationDeadline: string;
  ownerName: string;
  theme: string;
  category: string;
  attendanceLimit: number;
  images: string[];
};

type EventFormState = {
  name: string;
  description: string;
  location: string;
  startDate: string;
  startTime: string;
  registrationDate: string;
  registrationTime: string;
  eventOwner: string;
  theme: string;
  category: string;
  attendanceLimit: string;
};

type EventFormProps = {
  mode: "create" | "edit";
  eventId?: string;
  initialEvent?: EventFormInitialData;
  onSuccess?: (eventId?: string) => void;
};

const defaultState: EventFormState = {
  name: "",
  description: "",
  location: "",
  startDate: "",
  startTime: "",
  registrationDate: "",
  registrationTime: "",
  eventOwner: "",
  theme: "",
  category: "",
  attendanceLimit: "",
};

function toInputDate(dateIso: string) {
  if (!dateIso) return "";
  const date = new Date(dateIso);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

function toInputTime(dateIso: string) {
  if (!dateIso) return "";
  const date = new Date(dateIso);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
  return local.toISOString().slice(11, 16);
}

function buildInitialState(initialEvent?: EventFormInitialData | null): EventFormState {
  if (!initialEvent) {
    return defaultState;
  }

  return {
    name: initialEvent.name ?? "",
    description: initialEvent.description ?? "",
    location: initialEvent.location ?? "",
    startDate: toInputDate(initialEvent.startsAt),
    startTime: toInputTime(initialEvent.startsAt),
    registrationDate: toInputDate(initialEvent.registrationDeadline),
    registrationTime: toInputTime(initialEvent.registrationDeadline),
    eventOwner: initialEvent.ownerName ?? "",
    theme: initialEvent.theme ?? "",
    category: initialEvent.category ?? "",
    attendanceLimit:
      initialEvent.attendanceLimit != null ? String(initialEvent.attendanceLimit) : "",
  };
}

export function EventForm({ mode, eventId, initialEvent, onSuccess }: EventFormProps) {
  const [form, setForm] = useState<EventFormState>(buildInitialState(initialEvent));
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(initialEvent?.images ?? []);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setForm(buildInitialState(initialEvent));
    setExistingImages(initialEvent?.images ?? []);
    setImageFiles([]);
    setImagePreviews((prev) => {
      prev.forEach((url) => URL.revokeObjectURL(url));
      return [];
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [initialEvent]);

  useEffect(
    () => () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    },
    [imagePreviews],
  );

  const imageCount = useMemo(() => imageFiles.length, [imageFiles]);

  const handleChange =
    (field: keyof EventFormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((previous) => ({ ...previous, [field]: event.target.value }));
    };

  const resetForm = () => {
    setForm(buildInitialState(initialEvent));
    setImageFiles([]);
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setImagePreviews([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageSelection: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const files = Array.from(event.target.files ?? []);
    const validImages = files.filter((file) =>
      ["image/png", "image/jpeg"].includes(file.type),
    );

    if (!validImages.length) {
      setImageFiles([]);
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
      setImagePreviews([]);
      setError("Please upload PNG or JPEG images.");
      return;
    }

    setError(null);
    setImageFiles(validImages);
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setImagePreviews(validImages.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const token = getAuthToken();
    if (!token) {
      setError("You need to sign in again before continuing.");
      return;
    }

    if (mode === "edit" && !eventId) {
      setError("Unable to determine which event to edit.");
      return;
    }

    if (!form.startDate || !form.startTime) {
      setError("Please provide both a start date and time.");
      return;
    }

    if (!form.registrationDate || !form.registrationTime) {
      setError("Please provide a registration deadline date and time.");
      return;
    }

    const parsedTime = new Date(`${form.startDate}T${form.startTime}`);
    if (!parsedTime || Number.isNaN(parsedTime.getTime())) {
      setError("Please provide a valid start time.");
      return;
    }
    if (parsedTime.getTime() <= Date.now()) {
      setError("Event time must be in the future.");
      return;
    }

    const registrationDeadline = new Date(
      `${form.registrationDate}T${form.registrationTime}`,
    );
    if (
      !registrationDeadline ||
      Number.isNaN(registrationDeadline.getTime())
    ) {
      setError("Please provide a valid registration deadline.");
      return;
    }

    if (registrationDeadline.getTime() <= Date.now()) {
      setError("Registration deadline must be in the future.");
      return;
    }
    if (registrationDeadline.getTime() >= parsedTime.getTime()) {
      setError("Registration deadline must be before the event start time.");
      return;
    }

    if (!form.eventOwner.trim() && mode === "create") {
      setError("Please specify who is hosting this event.");
      return;
    }

    const attendanceLimit = Number.parseInt(form.attendanceLimit, 10);
    if (!Number.isInteger(attendanceLimit) || attendanceLimit <= 0) {
      setError("Attendance limit must be a positive whole number.");
      return;
    }

    if (mode === "create" && !imageFiles.length) {
      setError("Please upload at least one event picture.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("name", form.name.trim());
      formData.set("description", form.description.trim());
      formData.set("location", form.location.trim());
      formData.set("time", parsedTime.toISOString());
      if (mode === "create") {
        formData.set("eventOwner", form.eventOwner.trim());
      }
      formData.set("theme", form.theme.trim());
      formData.set("category", form.category.trim());
      formData.set("attendanceLimit", attendanceLimit.toString());
      formData.set("registrationDeadline", registrationDeadline.toISOString());
      imageFiles.forEach((file) => {
        formData.append("images", file);
      });

      const endpoint =
        mode === "edit" && eventId ? `/events/${eventId}` : "/events";
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: mode === "edit" ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          payload && typeof payload === "object" && "message" in payload
            ? (payload as { message?: string }).message ?? "Unable to save the event."
            : "Unable to save the event.";
        throw new Error(message);
      }

      if (mode === "create") {
        resetForm();
      } else {
        const updatedImages =
          (payload as { event?: { images?: string[] } })?.event?.images;
        if (updatedImages?.length) {
          setExistingImages(updatedImages);
        }
      }

      onSuccess?.(
        (payload as { event?: { id?: string } })?.event?.id ??
          (mode === "edit" ? eventId : undefined),
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to save the event.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className="space-y-6 rounded-3xl border border-transparent bg-white/90 p-8 shadow-[0_20px_50px_rgba(90,84,255,0.15)]"
      onSubmit={handleSubmit}
    >
      {error ? (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      ) : null}
      <div className="grid gap-4">
        <label className="flex flex-col gap-2 text-sm text-gray-600">
          <span className="font-medium text-gray-900">Event Name</span>
          <input
            name="name"
            type="text"
            className="rounded-full border border-transparent bg-[#fafafa] px-4 py-3 text-sm text-gray-900 shadow-inner outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
            placeholder="Karaoke Night"
            value={form.name}
            onChange={handleChange("name")}
            required
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-gray-600">
          <span className="font-medium text-gray-900">Description</span>
          <textarea
            name="description"
            rows={4}
            className="rounded-2xl border border-transparent bg-[#fafafa] px-4 py-3 text-sm text-gray-900 shadow-inner outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
            placeholder="Describe the vibe, agenda, and who should join."
            value={form.description}
            onChange={handleChange("description")}
            required
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-gray-600">
          <span className="font-medium text-gray-900">Location</span>
          <input
            name="location"
            type="text"
            className="rounded-full border border-transparent bg-[#fafafa] px-4 py-3 text-sm text-gray-900 shadow-inner outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
            placeholder="Campus Zentrum, Room H-132"
            value={form.location}
            onChange={handleChange("location")}
            required
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-gray-600">
            <span className="font-medium text-gray-900">Start date</span>
            <input
              name="startDate"
              type="date"
              className="rounded-full border border-transparent bg-[#fafafa] px-4 py-3 text-sm text-gray-900 shadow-inner outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
              value={form.startDate}
              onChange={handleChange("startDate")}
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-gray-600">
            <span className="font-medium text-gray-900">Start time</span>
            <input
              name="startTime"
              type="time"
              className="rounded-full border border-transparent bg-[#fafafa] px-4 py-3 text-sm text-gray-900 shadow-inner outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
              value={form.startTime}
              onChange={handleChange("startTime")}
              required
            />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-gray-600">
            <span className="font-medium text-gray-900">
              Registration deadline date
            </span>
            <input
              name="registrationDate"
              type="date"
              className="rounded-full border border-transparent bg-[#fafafa] px-4 py-3 text-sm text-gray-900 shadow-inner outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
              value={form.registrationDate}
              onChange={handleChange("registrationDate")}
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-gray-600">
            <span className="font-medium text-gray-900">
              Registration deadline time
            </span>
            <input
              name="registrationTime"
              type="time"
              className="rounded-full border border-transparent bg-[#fafafa] px-4 py-3 text-sm text-gray-900 shadow-inner outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
              value={form.registrationTime}
              onChange={handleChange("registrationTime")}
              required
            />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-gray-600">
            <span className="font-medium text-gray-900">event owner</span>
            <input
              name="eventOwner"
              type="text"
              className="rounded-full border border-transparent bg-[#fafafa] px-4 py-3 text-sm text-gray-900 shadow-inner outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
              placeholder="UZH Social Club"
              value={form.eventOwner}
              onChange={handleChange("eventOwner")}
              disabled={mode === "edit"}
              required={mode === "create"}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-gray-600">
            <span className="font-medium text-gray-900">Event theme</span>
            <input
              name="theme"
              type="text"
              className="rounded-full border border-transparent bg-[#fafafa] px-4 py-3 text-sm text-gray-900 shadow-inner outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
              placeholder="Welcome Week"
              value={form.theme}
              onChange={handleChange("theme")}
              required
            />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-gray-600">
            <span className="font-medium text-gray-900">Category</span>
            <select
              name="category"
              className="rounded-full border border-transparent bg-[#fafafa] px-4 py-3 text-sm text-gray-900 shadow-inner outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
              value={form.category}
              onChange={handleChange("category")}
              required
            >
              <option value="" disabled>
                Select a category
              </option>
              <option value="Sports">Sports</option>
              <option value="Study">Study</option>
              <option value="Party">Party</option>
              <option value="Networking">Networking</option>
              <option value="Workshop">Workshop</option>
              <option value="Social">Social</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm text-gray-600">
            <span className="font-medium text-gray-900">Attendance limit</span>
            <input
              name="attendanceLimit"
              type="number"
              min={1}
              step={1}
              className="rounded-full border border-transparent bg-[#fafafa] px-4 py-3 text-sm text-gray-900 shadow-inner outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
              placeholder="50"
              value={form.attendanceLimit}
              onChange={handleChange("attendanceLimit")}
              required
            />
          </label>
        </div>
      </div>

      <fieldset className="space-y-3">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-900">
            Event Pictures ({mode === "edit" ? imageCount || existingImages.length : imageCount})
          </span>
          <p className="text-xs text-gray-500">
            Upload PNG or JPEG images. They will appear on the event card.
            {mode === "edit"
              ? " Uploading new images will replace the current gallery."
              : ""}
          </p>
        </div>
        <input
          ref={fileInputRef}
          id="event-images"
          type="file"
          accept="image/png,image/jpeg"
          multiple
          className="sr-only"
          onChange={handleImageSelection}
        />
        <label
          htmlFor="event-images"
          className="flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-[28px] border border-dashed border-[#cfd5e9] bg-[#fafafa] text-center text-sm font-medium text-[#5e6a85] transition hover:border-indigo-300 hover:bg-white"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="mb-3 h-10 w-10 text-[#7c89a9]"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v11.25m0 0 3.75-3.75M12 15.75l-3.75-3.75M6 19.5h12a2.25 2.25 0 0 0 2.25-2.25v-10.5A2.25 2.25 0 0 0 18 4.5H6a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 6 19.5Z"
            />
          </svg>
          Click to upload images
        </label>

        {imagePreviews.length ? (
          <div className="flex flex-wrap gap-3">
            {imagePreviews.map((preview, index) => (
              <div
                key={preview}
                className="flex items-center gap-2 rounded-2xl border border-[#e2e6f5] bg-white/80 px-3 py-2 text-xs text-gray-600 shadow-sm"
              >
                <span className="inline-flex h-10 w-10 overflow-hidden rounded-xl bg-[#f4f6ff]">
                  <Image
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                </span>
                <div className="max-w-[120px] truncate">
                  {imageFiles[index]?.name ?? `Image ${index + 1}`}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {!imagePreviews.length && mode === "edit" && existingImages.length ? (
          <div className="flex flex-wrap gap-3">
            {existingImages.map((image) => (
              <div
                key={image}
                className="flex items-center gap-2 rounded-2xl border border-[#e2e6f5] bg-white/80 px-3 py-2 text-xs text-gray-600 shadow-sm"
              >
                <span className="inline-flex h-10 w-10 overflow-hidden rounded-xl bg-[#f4f6ff]">
                  <Image
                    src={image.startsWith("/") ? `${API_BASE_URL}${image}` : image}
                    alt="Existing event image"
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                </span>
                <div className="max-w-[120px] truncate">{image.split("/").pop()}</div>
              </div>
            ))}
          </div>
        ) : null}
      </fieldset>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          className="rounded-full border border-transparent bg-[#fafafa] px-5 py-2 text-sm font-semibold text-indigo-600 shadow-inner transition hover:bg-[#ece8ff]"
          onClick={resetForm}
          disabled={isSubmitting}
        >
          Reset
        </button>
        <button
          type="submit"
          className="rounded-full bg-gradient-to-r from-[#5a54ff] to-[#6f6aff] px-5 py-2 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(90,84,255,0.28)] transition hover:shadow-[0_16px_34px_rgba(90,84,255,0.35)] disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? mode === "edit"
              ? "Saving..."
              : "Creating..."
            : mode === "edit"
              ? "Save changes"
              : "Create Event"}
        </button>
      </div>
    </form>
  );
}
