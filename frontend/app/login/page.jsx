"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
    setMessage("");
  }

  function handleSubmit(event) {
    event.preventDefault();
    setMessage(
      "Login form validated successfully! Backend authentication will be added later."
    );
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-100";

  return (
    <main className="flex min-h-screen bg-white">
      <section className="hidden w-1/2 flex-col justify-between bg-linear-to-br from-red-600 via-red-600 to-rose-500 p-12 text-white lg:flex">
        <Link href="/" className="text-3xl font-extrabold">
          ❤️ LifeLink
        </Link>

        <div className="max-w-lg">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/15 text-5xl">
            🩸
          </div>
          <h1 className="text-5xl font-extrabold leading-tight">
            Every drop can save a life.
          </h1>
          <p className="mt-6 text-lg leading-8 text-red-50">
            Welcome back to LifeLink. Connect with donors and help make blood
            accessible to people who need it.
          </p>

          <div className="mt-10 flex items-center gap-4 rounded-2xl border border-white/20 bg-white/10 p-5">
            <span className="text-3xl">❤️</span>
            <div>
              <p className="font-bold">Together, we save lives.</p>
              <p className="mt-1 text-sm text-red-100">
                A smarter way to connect blood donors.
              </p>
            </div>
          </div>
        </div>

        <p className="text-sm text-red-100">
          © {new Date().getFullYear()} LifeLink
        </p>
      </section>

      <section className="flex w-full items-center justify-center px-5 py-12 sm:px-10 lg:w-1/2">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-10 inline-block text-xl font-extrabold text-red-600 lg:hidden"
          >
            ❤️ LifeLink
          </Link>

          <Link
            href="/"
            className="mb-8 inline-block text-sm font-medium text-gray-500 transition hover:text-red-600"
          >
            ← Back to Home
          </Link>

          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-red-600">
              Welcome back
            </p>
            <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-gray-900">
              Login to LifeLink
            </h2>
            <p className="mt-3 leading-7 text-gray-500">
              Enter your credentials to access your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="text-sm font-semibold text-gray-700"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={inputClass}
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between gap-3">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-gray-700"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setMessage("Password recovery will be added when backend authentication is connected.")}
                  className="text-sm font-semibold text-red-600 hover:text-red-700"
                >
                  Forgot password?
                </button>
              </div>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`${inputClass} pr-20`}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500 hover:text-red-600"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 accent-red-600"
              />
              <label htmlFor="remember" className="text-sm text-gray-600">
                Remember me
              </label>
            </div>

            {message && (
              <div
                role="status"
                className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-800"
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-red-600 px-5 py-4 font-bold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-200"
            >
              Login to Your Account →
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="font-bold text-red-600 hover:text-red-700"
            >
              Create account
            </Link>
          </p>

          <p className="mt-8 text-center text-xs leading-5 text-gray-400">
            This is a frontend demo. Login does not authenticate a real user yet.
          </p>
        </div>
      </section>
    </main>
  );
}