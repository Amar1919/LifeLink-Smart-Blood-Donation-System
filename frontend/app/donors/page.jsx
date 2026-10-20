
"use client";

import Link from "next/link";
import { useState } from "react";

export default function DonorRegistration() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    bloodGroup: "",
    age: "",
    city: "",
    lastDonation: "",
    available: true,
  });

  const [message, setMessage] = useState("");

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    setMessage(
      "Form validated successfully! Database integration will be added later."
    );
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-4 focus:ring-red-100";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-2xl text-white">
              ♥
            </span>
            <span className="text-2xl font-black">
              Life<span className="text-red-600">Link</span>
            </span>
          </Link>

          <Link
            href="/"
            className="text-sm font-semibold text-slate-600 transition hover:text-red-600"
          >
            ← Back to Home
          </Link>
        </div>
      </nav>

      <section className="bg-linear-to-br from-red-600 to-rose-800 px-6 py-12 text-white md:py-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-100">
            Become a lifesaver
          </p>

          <h1 className="mt-3 text-4xl font-black md:text-5xl">
            Register as a donor
          </h1>

          <p className="mt-4 max-w-2xl leading-7 text-red-50">
            Join our donor community and help connect people with potential
            blood donors when they need support.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-3">
        <aside className="space-y-6">
          <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-2xl">
              🩸
            </div>

            <h2 className="mt-4 text-xl font-extrabold">
              One registration. A chance to help.
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Share accurate information so the platform can identify
              potential matches for blood requests.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900 p-6 text-white">
            <h3 className="font-bold">Before you register</h3>

            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
              <li>✓ Provide a reachable contact number.</li>
              <li>✓ Select your correct blood group.</li>
              <li>✓ Keep your availability up to date.</li>
              <li>✓ Confirm donation eligibility with a qualified professional.</li>
            </ul>
          </div>
        </aside>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:col-span-2">
          <div className="border-b border-slate-100 pb-5">
            <h2 className="text-2xl font-extrabold">Your donor details</h2>
            <p className="mt-2 text-sm text-slate-500">
              Fill in the information below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="fullName" className="text-sm font-bold">
                  Full name *
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="text-sm font-bold">
                  Email address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="text-sm font-bold">
                  Phone number *
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Enter your phone number"
                  autoComplete="tel"
                  required
                />
              </div>

              <div>
                <label htmlFor="bloodGroup" className="text-sm font-bold">
                  Blood group *
                </label>
                <select
                  id="bloodGroup"
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className={inputClass}
                  required
                >
                  <option value="">Select blood group</option>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                    (group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label htmlFor="age" className="text-sm font-bold">
                  Age *
                </label>
                <input
                  id="age"
                  name="age"
                  type="number"
                  min="18"
                  max="100"
                  value={formData.age}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Enter your age"
                  required
                />
              </div>

              <div>
                <label htmlFor="city" className="text-sm font-bold">
                  City *
                </label>
                <input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Enter your city"
                  autoComplete="address-level2"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="lastDonation" className="text-sm font-bold">
                  Last blood donation date (optional)
                </label>
                <input
                  id="lastDonation"
                  name="lastDonation"
                  type="date"
                  value={formData.lastDonation}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-red-50 p-4">
              <input
                type="checkbox"
                name="available"
                checked={formData.available}
                onChange={handleChange}
                className="mt-1 h-4 w-4 accent-red-600"
              />
              <span>
                <span className="block text-sm font-bold text-slate-800">
                  Available to be contacted
                </span>
                <span className="mt-1 block text-sm leading-6 text-slate-600">
                  I agree to be contacted about potential blood donation
                  requests. Availability does not guarantee medical eligibility.
                </span>
              </span>
            </label>

            {message && (
              <div
                role="status"
                className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-red-600 px-6 py-4 font-bold text-white shadow-lg shadow-red-100 transition hover:bg-red-700 sm:w-auto"
            >
              Register as Donor →
            </button>

            <p className="text-xs leading-5 text-slate-500">
              This is currently a frontend demonstration. Your information
              is not saved to a database yet.
            </p>
          </form>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white px-6 py-6 text-center text-sm text-slate-500">
        © 2026 LifeLink — Smart Blood Donation System
      </footer>
    </main>
  );
}
