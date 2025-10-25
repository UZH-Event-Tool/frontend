import Link from "next/link";

export const metadata = {
  title: "Sign In · UZH Student Socializer",
};

const inputClasses =
  "w-full rounded-full border border-transparent bg-[#f3f5ff] px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 shadow-inner focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200";

export default function LoginPage() {
  return (
    <div className="relative">
      <div className="overflow-hidden rounded-[32px] bg-white p-10 shadow-[0_25px_70px_rgba(90,84,255,0.18)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-b from-[#5a54ff] to-[#7f78ff] shadow-lg">
          <span className="text-3xl text-white">🎓</span>
        </div>
        <div className="mt-6 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Welcome Back!</h1>
          <p className="mt-2 text-sm text-gray-500">
            Sign in to discover and join campus events
          </p>
        </div>

        <form className="mt-8 space-y-5">
          <label className="flex flex-col gap-2 text-sm font-medium text-gray-600">
            Email
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
              placeholder="Enter your password"
              type="password"
            />
          </label>
          <div className="text-right text-sm">
            <Link
              href="#"
              className="font-medium text-indigo-600 transition hover:text-indigo-500"
            >
              Forgot password?
            </Link>
          </div>
          <button
            type="submit"
            className="flex h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-[#5a54ff] to-[#6f6aff] text-sm font-semibold text-white shadow-lg transition hover:shadow-[0_12px_30px_rgba(90,84,255,0.35)]"
          >
            Login
          </button>
        </form>
      </div>
      <p className="mt-6 text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-indigo-600 transition hover:text-indigo-500"
        >
          Sign up here
        </Link>
      </p>
    </div>
  );
}
