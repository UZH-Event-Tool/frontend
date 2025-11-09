"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { API_BASE_URL } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";

type Profile = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  universityEmail: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  about: string | null;
  age: number | null;
  location: string | null;
  fieldOfStudies: string | null;
  interests: string[];
  profileImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

type FormState = {
  firstName: string;
  lastName: string;
  universityEmail: string;
  dateOfBirth: string;
  gender: string;
  about: string;
  age: string;
  location: string;
  fieldOfStudies: string;
  interestsText: string;
};

const formDefaults: FormState = {
  firstName: "",
  lastName: "",
  universityEmail: "",
  dateOfBirth: "",
  gender: "",
  about: "",
  age: "",
  location: "",
  fieldOfStudies: "",
  interestsText: "",
};

function buildImageUrl(pathname: string | null) {
  if (!pathname) {
    return null;
  }
  if (pathname.startsWith("http")) {
    return pathname;
  }
  return `${API_BASE_URL}${pathname}`;
}

export function ProfileClient() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState<FormState>(formDefaults);
  const [interestInput, setInterestInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"created" | "attending" | "history">(
    "created",
  );

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const populateForm = useCallback((data: Profile) => {
    setForm({
      firstName: data.firstName ?? "",
      lastName: data.lastName ?? "",
      universityEmail: data.universityEmail ?? "",
      dateOfBirth: data.dateOfBirth
        ? new Date(data.dateOfBirth).toISOString().slice(0, 10)
        : "",
      gender: data.gender ?? "",
      about: data.about ?? "",
      age: data.age != null ? String(data.age) : "",
      location: data.location ?? "",
      fieldOfStudies: data.fieldOfStudies ?? "",
      interestsText: data.interests.join(", "),
    });
    setInterestInput(data.interests.join(", "));
    setSelectedFile(null);
    setPreviewUrl(null);
  }, []);

  useEffect(() => {
    async function fetchProfile() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const token = getAuthToken();
        if (!token) {
          setLoadError("You need to sign in to view your profile.");
          setIsLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.message ?? "Failed to load profile.");
        }

        const user = payload.user as Profile;
        setProfile(user);
        populateForm(user);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load profile.";
        setLoadError(message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [populateForm]);

  const currentImage = useMemo(() => {
    if (previewUrl) {
      return previewUrl;
    }
    return buildImageUrl(profile?.profileImageUrl ?? null);
  }, [previewUrl, profile]);

  const handleInputChange = (field: keyof FormState) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "interestsText") {
      setInterestInput(value);
    }
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setSaveError(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (file) {
      if (!["image/png", "image/jpeg"].includes(file.type)) {
        setSaveError("Profile picture must be a PNG or JPEG image.");
        setSelectedFile(null);
        return;
      }
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (
    event,
  ) => {
    event.preventDefault();
    setSaveError(null);

    if (!form.age.trim()) {
      setSaveError("Age is required.");
      return;
    }

    const ageNumber = Number.parseInt(form.age, 10);
    if (Number.isNaN(ageNumber) || ageNumber < 16) {
      setSaveError("Age must be a number greater than or equal to 16.");
      return;
    }

    if (!form.universityEmail.trim()) {
      setSaveError("University email is required.");
      return;
    }

    if (selectedFile && !["image/png", "image/jpeg"].includes(selectedFile.type)) {
      setSaveError("Profile picture must be a PNG or JPEG image.");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setSaveError("You need to sign in again before updating your profile.");
      return;
    }

    const formData = new FormData();
    formData.set("firstName", form.firstName.trim());
    formData.set("lastName", form.lastName.trim());
    formData.set("universityEmail", form.universityEmail.trim());
    formData.set("age", String(ageNumber));
    formData.set("location", form.location.trim());
    formData.set("fieldOfStudies", form.fieldOfStudies.trim());

    if (form.dateOfBirth) {
      formData.set("dateOfBirth", form.dateOfBirth);
    }
    if (form.gender) {
      formData.set("gender", form.gender.trim());
    }
    if (form.about) {
      formData.set("about", form.about.trim());
    }
    if (interestInput.trim()) {
      formData.set("interests", interestInput.trim());
    }
    if (selectedFile) {
      formData.set("profileImage", selectedFile);
    }

    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message ?? "Failed to update profile.");
      }

      const user = payload.user as Profile;
      setProfile(user);
      populateForm(user);
      setIsEditing(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update profile.";
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      populateForm(profile);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setSaveError(null);
    setIsEditing(false);
  };

  useEffect(() => {
    if (!isEditing) {
      return;
    }
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isEditing]);

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-transparent bg-white/90 p-10 text-center shadow-[0_20px_50px_rgba(90,84,255,0.12)]">
        <p className="text-sm text-gray-500">Loading your profile…</p>
      </div>
    );
  }

  if (loadError || !profile) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-indigo-200 bg-white/95 p-10 text-center shadow-[0_20px_50px_rgba(90,84,255,0.08)]">
        <p className="text-sm text-gray-600">{loadError}</p>
        <Link
          href="/login"
          className="rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-600"
        >
          Go to login
        </Link>
      </div>
    );
  }

  const universityEmailFallback = profile.universityEmail ?? "";
  const displayName =
    [profile.firstName, profile.lastName].filter(Boolean).join(" ") ||
    universityEmailFallback;
  const initials = (() => {
    const first = profile.firstName?.[0];
    const last = profile.lastName?.[0];
    if (first || last) {
      return `${first ?? ""}${last ?? ""}`.toUpperCase();
    }
    return universityEmailFallback.slice(0, 2).toUpperCase();
  })();
  const ageLabel =
    profile.age != null ? `${profile.age} years old` : "Age not provided";
  const detailItems = [
    { icon: "📍", value: profile.location ?? "Location not provided" },
    {
      icon: "🎓",
      value: profile.fieldOfStudies ?? "Field of studies not provided",
    },
    {
      icon: "✉️",
      value:
        profile.universityEmail ?? "University email not provided",
    },
  ];
  const tabItems = [
    {
      id: "created" as const,
      label: "Created",
      emptyTitle: "No events created yet",
      emptyDescription: "Share your first event with the campus community.",
      ctaHref: "/events/new",
      ctaLabel: "Create Your First Event",
    },
    {
      id: "attending" as const,
      label: "Attending",
      emptyTitle: "You are not attending any events yet",
      emptyDescription: "Discover events that align with your interests.",
      ctaHref: "/dashboard",
      ctaLabel: "Browse Events",
    },
    {
      id: "history" as const,
      label: "History",
      emptyTitle: "No past events yet",
      emptyDescription: "Once you attend events, you will see them here.",
      ctaHref: "/dashboard",
      ctaLabel: "Discover More Events",
    },
  ];
  const activeTabConfig =
    tabItems.find((tab) => tab.id === activeTab) ?? tabItems[0];

  return (
    <div className="space-y-8">
      <section className="rounded-[34px] bg-gradient-to-br from-[#f4f3ff] via-[#f7f5ff] to-[#fefcff] p-[1px] shadow-[0_25px_70px_rgba(90,84,255,0.12)]">
        <div className="rounded-[32px] bg-white/95 p-6 md:p-8">
          <header className="flex flex-col gap-3">
            <h1 className="text-xl font-semibold text-gray-900 md:text-2xl">
              My Profile
            </h1>
            <p className="text-sm text-gray-500">
              Keep your information up to date
            </p>
          </header>

          <div className="mt-6 flex flex-col gap-6">
            <div className="flex items-start gap-4 md:items-center md:gap-6">
              <div className="relative h-20 w-20 overflow-hidden rounded-full bg-gradient-to-br from-[#5a54ff] to-[#7a74ff] text-xl font-semibold text-white shadow-xl md:h-24 md:w-24">
                {currentImage ? (
                  <Image
                    src={currentImage}
                    alt={displayName}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    {initials}
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xl font-semibold text-gray-900 md:text-2xl">
                      {displayName}
                    </p>
                    <p className="text-sm text-gray-500">{ageLabel}</p>
                  </div>
                  {!isEditing ? (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-[#d7dcf2] bg-white text-gray-700 transition hover:bg-indigo-50 hover:text-indigo-600"
                      aria-label="Edit profile"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="9.25"
                          stroke="#D7DCF2"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M13.75 7.75L16.25 10.25M8.5 15.5L9.25 12.75L14.25 7.75L16.75 10.25L11.75 15.25L9 16L8.5 15.5Z"
                          stroke="#1F2937"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  ) : null}
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  {detailItems.map((item) => (
                    <div
                      key={item.icon}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <span className="text-base">{item.icon}</span>
                      <span>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[34px] border border-transparent bg-white/95 p-6 shadow-[0_25px_70px_rgba(90,84,255,0.08)]">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
          <div className="flex justify-center">
            <div className="flex gap-2 rounded-full bg-[#eef0ff] p-1">
              {tabItems.map((tab) => {
                const isActive = tab.id === activeTab;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-full px-6 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-white text-indigo-600 shadow-[0_10px_30px_rgba(90,84,255,0.18)]"
                        : "text-gray-500 hover:text-indigo-600"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-indigo-100 bg-white/80 px-8 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-3xl text-indigo-400">
              📅
            </div>
            <h3 className="text-lg font-semibold text-gray-700">
              {activeTabConfig.emptyTitle}
            </h3>
            <p className="max-w-md text-sm text-gray-500">
              {activeTabConfig.emptyDescription}
            </p>
            <Link
              href={activeTabConfig.ctaHref}
              className="rounded-full bg-indigo-500 px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-indigo-600"
            >
              {activeTabConfig.ctaLabel}
            </Link>
          </div>
        </div>
      </section>

      {isEditing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
          <div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-3xl rounded-[32px] bg-white p-6 shadow-[0_22px_70px_rgba(15,23,42,0.18)] md:p-8"
          >
            <button
              type="button"
              onClick={handleCancelEdit}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 hover:text-gray-700"
              aria-label="Close edit profile"
            >
              <svg
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
              >
                <path
                  d="M6 6L14 14M14 6L6 14"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            <form
              className="flex max-h-[80vh] flex-col overflow-y-auto pr-1"
              onSubmit={handleSubmit}
            >
              <div className="flex flex-col gap-2 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Edit profile
                  </h2>
                  <p className="text-sm text-gray-500">
                    Update your details to keep your profile fresh.
                  </p>
                </div>
              </div>

              {saveError ? (
                <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                  {saveError}
                </p>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-xs font-medium text-gray-600">
                  First Name
                  <input
                    className="rounded-full border border-transparent bg-white px-4 py-2 text-sm text-gray-700 shadow-inner focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    value={form.firstName}
                    onChange={(event) =>
                      handleInputChange("firstName")(event.target.value)
                    }
                    required
                  />
                </label>
                <label className="flex flex-col gap-2 text-xs font-medium text-gray-600">
                  Last Name
                  <input
                    className="rounded-full border border-transparent bg-white px-4 py-2 text-sm text-gray-700 shadow-inner focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    value={form.lastName}
                    onChange={(event) =>
                      handleInputChange("lastName")(event.target.value)
                    }
                    required
                  />
                </label>
                <label className="flex flex-col gap-2 text-xs font-medium text-gray-600">
                  University Email
                  <input
                    type="email"
                    className="rounded-full border border-transparent bg-white px-4 py-2 text-sm text-gray-700 shadow-inner focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    value={form.universityEmail}
                    onChange={(event) =>
                      handleInputChange("universityEmail")(event.target.value)
                    }
                    required
                  />
                </label>
                <label className="flex flex-col gap-2 text-xs font-medium text-gray-600">
                  Date of Birth
                  <input
                    type="date"
                    className="rounded-full border border-transparent bg-white px-4 py-2 text-sm text-gray-700 shadow-inner focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    value={form.dateOfBirth}
                    onChange={(event) =>
                      handleInputChange("dateOfBirth")(event.target.value)
                    }
                  />
                </label>
                <label className="flex flex-col gap-2 text-xs font-medium text-gray-600">
                  Gender
                  <input
                    className="rounded-full border border-transparent bg-white px-4 py-2 text-sm text-gray-700 shadow-inner focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    value={form.gender}
                    onChange={(event) =>
                      handleInputChange("gender")(event.target.value)
                    }
                  />
                </label>
                <label className="flex flex-col gap-2 text-xs font-medium text-gray-600">
                  Age
                  <input
                    type="number"
                    min={16}
                    className="rounded-full border border-transparent bg-white px-4 py-2 text-sm text-gray-700 shadow-inner focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    value={form.age}
                    onChange={(event) =>
                      handleInputChange("age")(event.target.value)
                    }
                    required
                  />
                </label>
                <label className="flex flex-col gap-2 text-xs font-medium text-gray-600">
                  Location
                  <input
                    className="rounded-full border border-transparent bg-white px-4 py-2 text-sm text-gray-700 shadow-inner focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    value={form.location}
                    onChange={(event) =>
                      handleInputChange("location")(event.target.value)
                    }
                    required
                  />
                </label>
                <label className="sm:col-span-2 flex flex-col gap-2 text-xs font-medium text-gray-600">
                  Field of Studies
                  <input
                    className="rounded-full border border-transparent bg-white px-4 py-2 text-sm text-gray-700 shadow-inner focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    value={form.fieldOfStudies}
                    onChange={(event) =>
                      handleInputChange("fieldOfStudies")(event.target.value)
                    }
                    required
                  />
                </label>
                <label className="sm:col-span-2 flex flex-col gap-2 text-xs font-medium text-gray-600">
                  About
                  <textarea
                    className="rounded-3xl border border-transparent bg-white px-4 py-3 text-sm text-gray-700 shadow-inner focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    value={form.about}
                    rows={4}
                    onChange={(event) =>
                      handleInputChange("about")(event.target.value)
                    }
                  />
                </label>
                <label className="sm:col-span-2 flex flex-col gap-2 text-xs font-medium text-gray-600">
                  Interests{" "}
                  <span className="text-[11px] text-gray-400">
                    Separate with commas (e.g. Hiking, Networking)
                  </span>
                  <textarea
                    className="rounded-3xl border border-transparent bg-white px-4 py-3 text-sm text-gray-700 shadow-inner focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    value={form.interestsText}
                    rows={3}
                    onChange={(event) =>
                      handleInputChange("interestsText")(event.target.value)
                    }
                  />
                </label>
                <label className="sm:col-span-2 flex flex-col gap-2 text-xs font-medium text-gray-600">
                  Profile Picture
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    className="rounded-full border border-transparent bg-white px-4 py-2 text-sm text-gray-700 shadow-inner file:mr-3 file:rounded-full file:border-0 file:bg-indigo-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-indigo-600"
                    onChange={handleFileChange}
                  />
                  <span className="text-[11px] text-gray-400">
                    Accepted formats: PNG or JPEG up to 5MB.
                  </span>
                </label>
              </div>

              <div className="sticky bottom-0 mt-6 flex flex-col gap-3 rounded-3xl bg-white py-4 sm:flex-row sm:justify-end sm:gap-4">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="w-full rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-semibold text-gray-600 shadow-sm transition hover:bg-gray-100 sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full rounded-full bg-indigo-500 px-6 py-2 text-sm font-semibold text-white shadow transition hover:bg-indigo-600 disabled:bg-indigo-300 sm:w-auto"
                >
                  {isSaving ? "Saving…" : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
