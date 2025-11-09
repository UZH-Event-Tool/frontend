"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EventForm } from "../EventForm";

export default function CreateEventPage() {
  const router = useRouter();
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const handleCloseSuccessModal = () => {
    setIsSuccessModalOpen(false);
  };

  const handleViewFeed = () => {
    setIsSuccessModalOpen(false);
    router.push("/dashboard");
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-gray-900">Create event</h1>
        <p className="text-sm text-gray-500">
          Fill in the details below. You can update them later from the event
          page.
        </p>
      </header>

      <EventForm mode="create" onSuccess={() => setIsSuccessModalOpen(true)} />

      {isSuccessModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-[32px] bg-white p-8 text-center shadow-[0_24px_60px_rgba(27,18,66,0.18)]">
            <div className="relative mb-6 flex justify-end">
              <button
                type="button"
                className="text-gray-400 transition hover:text-gray-600"
                onClick={handleCloseSuccessModal}
                aria-label="Close success modal"
              >
                &times;
              </button>
            </div>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-3xl">
              🎉
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Event Created Successfully!
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Your event has been published and is now visible to other students.
            </p>
            <button
              type="button"
              className="mt-6 w-full rounded-full bg-gradient-to-r from-[#5a54ff] to-[#6f6aff] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(90,84,255,0.28)] transition hover:shadow-[0_16px_34px_rgba(90,84,255,0.35)]"
              onClick={handleViewFeed}
            >
              View in Feed
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
