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
  email: string;
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
  email: string;
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
  email: "",
  universityEmail: "",
  dateOfBirth: "",
  gender: "",
  about: "",
  age: "",
  location: "",
  fieldOfStudies: "",
  interestsText: "",
};

function formatDisplayDate(value: string | null) {
  if (!value) return "Not provided";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Not provided";
  }
  return parsed.toLocaleDateString();
}

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
      email: data.email,
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
    formData.set("email", form.email.trim());
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

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-4">
        <div className="relative h-20 w-20 overflow-hidden rounded-full border-4 border-white shadow-lg">
          {currentImage ? (
            <Image
              src={currentImage}
              alt={`${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() ||
                "Profile picture"}
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-indigo-100 text-lg font-semibold text-indigo-600">
              {profile.firstName?.[0]?.toUpperCase()}
              {profile.lastName?.[0]?.toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">
            {[profile.firstName, profile.lastName].filter(Boolean).join(" ") ||
              profile.email}
          </h1>
          <p className="text-sm text-gray-500">
            {[profile.fieldOfStudies, profile.location].filter(Boolean).join(" · ") ||
              "Update your profile to share more about yourself"}
          </p>
        </div>
      </header>

      <section className="grid gap-6 rounded-3xl border border-transparent bg-white/95 p-8 shadow-[0_20px_50px_rgba(90,84,255,0.12)] lg:grid-cols-[1.1fr_1.4fr]">
        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
              Contact
            </h2>
            <dl className="mt-2 space-y-2 text-sm text-gray-600">
              <div>
                <dt className="font-medium text-gray-700">Email</dt>
                <dd>{profile.email}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-700">University Email</dt>
                <dd>{profile.universityEmail ?? "Not provided"}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
              Personal Details
            </h2>
            <dl className="mt-2 space-y-2 text-sm text-gray-600">
              <div>
                <dt className="font-medium text-gray-700">Date of Birth</dt>
                <dd>{formatDisplayDate(profile.dateOfBirth)}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-700">Gender</dt>
                <dd>{profile.gender ?? "Not provided"}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-700">Age</dt>
                <dd>{profile.age ?? "Not provided"}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-700">About</dt>
                <dd>{profile.about ?? "Tell others a bit about yourself"}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
              Interests
            </h2>
            <ul className="mt-2 flex flex-wrap gap-2">
              {profile.interests.length > 0 ? (
                profile.interests.map((interest) => (
                  <li
                    key={interest}
                    className="rounded-full bg-[#ece8ff] px-3 py-1 text-xs font-semibold text-indigo-600"
                  >
                    {interest}
                  </li>
                ))
              ) : (
                <li className="text-sm text-gray-500">
                  Add your interests so others can find you.
                </li>
              )}
            </ul>
          </div>
        </div>

        <form
          className="space-y-4 rounded-3xl border border-indigo-50 bg-[#fafafa] p-6 shadow-inner"
          onSubmit={handleSubmit}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Edit profile</h2>
            {isEditing ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="rounded-full border border-transparent bg-white px-3 py-1 text-xs font-semibold text-gray-600 shadow-sm hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-indigo-500 px-4 py-1.5 text-xs font-semibold text-white shadow hover:bg-indigo-600 disabled:bg-indigo-300"
                  disabled={isSaving}
                >
                  {isSaving ? "Saving…" : "Save changes"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="rounded-full border border-transparent bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-100"
              >
                Edit
              </button>
            )}
          </div>

          {saveError ? (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {saveError}
            </p>
          ) : null}

          <fieldset className="grid gap-3 sm:grid-cols-2" disabled={!isEditing}>
            <label className="flex flex-col gap-2 text-xs font-medium text-gray-600">
              First Name
              <input
                className="rounded-full border border-transparent bg-white px-4 py-2 text-sm text-gray-700 shadow-inner focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-100"
                value={form.firstName}
                onChange={(event) => handleInputChange("firstName")(event.target.value)}
                required
              />
            </label>
            <label className="flex flex-col gap-2 text-xs font-medium text-gray-600">
              Last Name
              <input
                className="rounded-full border border-transparent bg-white px-4 py-2 text-sm text-gray-700 shadow-inner focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-100"
                value={form.lastName}
                onChange={(event) => handleInputChange("lastName")(event.target.value)}
                required
              />
            </label>
            <label className="flex flex-col gap-2 text-xs font-medium text-gray-600">
              Email
              <input
                type="email"
                className="rounded-full border border-transparent bg-white px-4 py-2 text-sm text-gray-700 shadow-inner focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-100"
                value={form.email}
                onChange={(event) => handleInputChange("email")(event.target.value)}
                required
              />
            </label>
            <label className="flex flex-col gap-2 text-xs font-medium text-gray-600">
              University Email
              <input
                type="email"
                className="rounded-full border border-transparent bg-white px-4 py-2 text-sm text-gray-700 shadow-inner focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-100"
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
                className="rounded-full border border-transparent bg-white px-4 py-2 text-sm text-gray-700 shadow-inner focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-100"
                value={form.dateOfBirth}
                onChange={(event) =>
                  handleInputChange("dateOfBirth")(event.target.value)
                }
              />
            </label>
            <label className="flex flex-col gap-2 text-xs font-medium text-gray-600">
              Gender
              <input
                className="rounded-full border border-transparent bg-white px-4 py-2 text-sm text-gray-700 shadow-inner focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-100"
                value={form.gender}
                onChange={(event) => handleInputChange("gender")(event.target.value)}
              />
            </label>
            <label className="flex flex-col gap-2 text-xs font-medium text-gray-600">
              Age
              <input
                type="number"
                min={16}
                className="rounded-full border border-transparent bg-white px-4 py-2 text-sm text-gray-700 shadow-inner focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-100"
                value={form.age}
                onChange={(event) => handleInputChange("age")(event.target.value)}
                required
              />
            </label>
            <label className="flex flex-col gap-2 text-xs font-medium text-gray-600">
              Location
              <input
                className="rounded-full border border-transparent bg-white px-4 py-2 text-sm text-gray-700 shadow-inner focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-100"
                value={form.location}
                onChange={(event) => handleInputChange("location")(event.target.value)}
                required
              />
            </label>
            <label className="sm:col-span-2 flex flex-col gap-2 text-xs font-medium text-gray-600">
              Field of Studies
              <input
                className="rounded-full border border-transparent bg-white px-4 py-2 text-sm text-gray-700 shadow-inner focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-100"
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
                className="rounded-3xl border border-transparent bg-white px-4 py-3 text-sm text-gray-700 shadow-inner focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-100"
                value={form.about}
                rows={4}
                onChange={(event) => handleInputChange("about")(event.target.value)}
              />
            </label>
            <label className="sm:col-span-2 flex flex-col gap-2 text-xs font-medium text-gray-600">
              Interests{" "}
              <span className="text-[11px] text-gray-400">
                Separate with commas (e.g. Hiking, Networking)
              </span>
              <textarea
                className="rounded-3xl border border-transparent bg-white px-4 py-3 text-sm text-gray-700 shadow-inner focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-100"
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
                className="rounded-full border border-transparent bg-white px-4 py-2 text-sm text-gray-700 shadow-inner file:mr-3 file:rounded-full file:border-0 file:bg-indigo-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-indigo-600 disabled:bg-gray-100"
                onChange={handleFileChange}
                disabled={!isEditing}
              />
              <span className="text-[11px] text-gray-400">
                Accepted formats: PNG or JPEG up to 5MB.
              </span>
            </label>
          </fieldset>

          {isEditing ? (
            <p className="text-xs text-gray-400">
              Changes save instantly after clicking “Save changes”.
            </p>
          ) : (
            <p className="text-xs text-gray-400">
              Tap “Edit” to update your profile information.
            </p>
          )}
        </form>
      </section>
    </div>
  );
}
