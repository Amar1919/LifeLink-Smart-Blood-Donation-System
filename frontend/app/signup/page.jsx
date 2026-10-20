"use client";

import { useState } from "react";
import Link from "next/link";

export default function SignupPage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "Donor",
    password: "",
    confirmPassword: "",
    agree: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setMessage("");
    setError("");
  }

  function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match. Please check them.");
      return;
    }

    if (!form.agree) {
      setError("Please accept the Terms and Privacy Policy to continue.");
      return;
    }

    setMessage(
      "Signup form validated successfully! Account creation will be connected to the backend later."
    );
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-100";

  const labelClass = "text-sm font-semibold text-gray-700";

  return (
    <main className="flex min-h-screen bg-white">
      <section className="hidden w-5/12 flex-col justify-between bg-linear-to-br from-red-600 via-red-600 to-rose-500 p-12 text-white lg:flex">
        <Link href="/" className="text-3xl font-extrabold">
          ❤️ LifeLink
        </Link>

        <div className="max-w-lg">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/15 text-5xl">
            🤝
          </div>
          <h1 className="text-5xl font-extrabold leading-tight">
            Be someone's reason to smile.
          </h1>
          <p className="mt-6 text-lg leading-8 text-red-50">
            Join a community that brings blood donors and people in need closer
            together.
          </p>

          <div className="mt-10 space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                ✓
              </span>
              <span>Register as a blood donor</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                ✓
              </span>
              <span>Find potential donor matches</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                ✓
              </span>
              <span>Help connect people in need</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-red-100">
          © {new Date().getFullYear()} LifeLink
        </p>
      </section>

      <section className="flex w-full items-center justify-center px-5 py-12 sm:px-10 lg:w-7/12">
        <div className="w-full max-w-xl">
          <Link
            href="/"
            className="mb-8 inline-block text-xl font-extrabold text-red-600 lg:hidden"
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
              Join the community
            </p>
            <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-gray-900">
              Create your account
            </h2>
            <p className="mt-3 leading-7 text-gray-500">
              Sign up to get started with LifeLink.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="fullName" className={labelClass}>
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                autoComplete="name"
                className={inputClass}
                required
                minLength={2}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="email" className={labelClass}>
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className={labelClass}>
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="10-digit number"
                  autoComplete="tel"
                  pattern="[0-9]{10}"
                  title="Enter a 10-digit phone number"
                  className={inputClass}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="role" className={labelClass}>
                I want to join as
              </label>
              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="Donor">Blood Donor</option>
                <option value="Requester">Blood Requester</option>
                <option value="Both">Both Donor and Requester</option>
              </select>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="password" className={labelClass}>
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    minLength={8}
                    className={`${inputClass} pr-16`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500 hover:text-red-600"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className={labelClass}>
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  minLength={8}
                  className={inputClass}
                  required
                />
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input
                id="agree"
                name="agree"
                type="checkbox"
                checked={form.agree}
                onChange={handleChange}
                className="mt-1 h-4 w-4 accent-red-600"
                required
              />
              <label htmlFor="agree" className="text-sm leading-6 text-gray-600">
                I agree to the{" "}
                <Link href="/about" className="font-semibold text-red-600 hover:underline">
                  Terms of Use
                </Link>{" "}
                and Privacy Policy.
              </label>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            {message && (
              <div
                role="status"
                className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-800"
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-red-600 px-5 py-4 font-bold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-200"
            >
              Create Account →
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-red-600 hover:text-red-700"
            >
              Login
            </Link>
          </p>

          <p className="mt-6 text-center text-xs leading-5 text-gray-400">
            Frontend demo only. No account or password is saved or sent to a server.
          </p>
        </div>
      </section>
    </main>
  );
}