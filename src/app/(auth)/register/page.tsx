import Link from "next/link";

export const metadata = {
  title: "Sign Up · UZH Student Socializer",
};

const inputClasses =
  "w-full rounded-full border border-transparent bg-[#f3f5ff] px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 shadow-inner focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200";

export default function RegisterPage() {
  return (
    <div className="relative">
      <div className="overflow-hidden rounded-[32px] bg-white p-10 shadow-[0_25px_70px_rgba(90,84,255,0.18)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-b from-[#5a54ff] to-[#7f78ff] shadow-lg">
          <span className="text-3xl text-white">🎓</span>
        </div>
        <div className="mt-6 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Join Us!</h1>
          <p className="mt-2 text-sm text-gray-500">
            Create your account and start connecting
          </p>
        </div>

        <button
          type="button"
          className="mt-8 flex w-full flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-indigo-100 bg-[#f8f7ff] px-6 py-6 text-sm font-medium text-indigo-600 transition hover:border-indigo-200 hover:bg-[#f2f0ff]"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl text-indigo-500 shadow-inner">
            ⬆️
          </span>
          Upload Profile Picture
        </button>

        <form className="mt-8 space-y-5">
          <label className="flex flex-col gap-2 text-sm font-medium text-gray-600">
            Full Name
            <input
              className={inputClasses}
              placeholder="John Doe"
              type="text"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium text-gray-600">
              Age
              <input
                className={inputClasses}
                placeholder="20"
                type="number"
                min={16}
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-gray-600">
              Location
              <input
                className={inputClasses}
                placeholder="Zürich, CH"
                type="text"
              />
            </label>
          </div>
          <label className="flex flex-col gap-2 text-sm font-medium text-gray-600">
            Field of Studies
            <input
              className={inputClasses}
              placeholder="Computer Science"
              type="text"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-gray-600">
            University Email <span className="text-xs text-gray-400">(optional)</span>
            <input
              className={inputClasses}
              placeholder="your.email@university.edu"
              type="email"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-gray-600">
            Password
            <input
              className={inputClasses}
              placeholder="At least 6 characters"
              type="password"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-gray-600">
            Confirm Password
            <input
              className={inputClasses}
              placeholder="Re-enter your password"
              type="password"
            />
          </label>
          <button
            type="submit"
            className="mt-4 flex h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-[#5a54ff] to-[#6f6aff] text-sm font-semibold text-white shadow-lg transition hover:shadow-[0_12px_30px_rgba(90,84,255,0.35)]"
          >
            Register
          </button>
        </form>
      </div>
      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-indigo-600 transition hover:text-indigo-500"
        >
          Sign in here
        </Link>
      </p>
    </div>
  );
}
