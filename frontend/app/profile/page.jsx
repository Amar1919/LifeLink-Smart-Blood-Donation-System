
"use client";

import { useState } from "react";
import Link from "next/link";

const initialProfile = {
  name: "Amar Nawadagi",
  email: "amar@example.com",
  phone: "",
  bloodGroup: "O+",
  age: "",
  city: "",
  lastDonation: "",
  available: true,
  role: "Blood Donor",
};

const inputClass =
  "mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500";

export default function ProfilePage() {
  const [profile, setProfile] = useState(initialProfile);
  const [form, setForm] = useState(initialProfile);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleSave(event) {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim()) {
      setMessageType("error");
      setMessage("Please enter your name and email.");
      return;
    }

    setProfile({ ...form });
    setForm({ ...form });
    setEditing(false);
    setMessageType("success");
    setMessage("Profile updated successfully!");
  }

  function handleCancel() {
    setForm({ ...profile });
    setEditing(false);
    setMessage("");
  }

  const initials =
    profile.name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("") || "U";

  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">
      {/* Navigation */}
      <nav className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link href="/" className="text-2xl font-extrabold text-red-600">
            LifeLink<span className="text-gray-800">.</span>
          </Link>

          <div className="flex items-center gap-4 text-sm font-medium">
            <Link href="/" className="text-gray-600 hover:text-red-600">
              Home
            </Link>

            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-red-600"
            >
              Dashboard
            </Link>

            <Link
              href="/donors"
              className="text-gray-600 hover:text-red-600"
            >
              Donors
            </Link>
          </div>
        </div>
      </nav>

      {/* Page heading */}
      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-red-600">
            Account Settings
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            My Profile
          </h1>

          <p className="mt-2 text-gray-500">
            Manage your personal information and blood donation availability.
          </p>
        </div>

        <div className="grid gap-7 lg:grid-cols-[300px_1fr]">
          {/* Profile summary */}
          <aside className="h-fit rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-100 text-3xl font-bold text-red-600">
                {initials}
              </div>

              <h2 className="mt-4 break-words text-xl font-bold">
                {profile.name}
              </h2>

              <p className="mt-1 text-sm text-gray-500">{profile.role}</p>

              <span className="mt-4 rounded-full bg-red-50 px-4 py-2 text-sm font-bold text-red-600">
                Blood Group: {profile.bloodGroup}
              </span>
            </div>

            <div className="my-6 border-t border-gray-100" />

            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-500">Availability</span>

                <span
                  className={`rounded-full px-3 py-1 font-semibold ${
                    profile.available
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {profile.available ? "Available" : "Unavailable"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-500">Location</span>

                <span className="max-w-36 break-words text-right font-medium">
                  {profile.city || "Not added"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-500">Last Donation</span>

                <span className="text-right font-medium">
                  {profile.lastDonation || "Not added"}
                </span>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-red-50 p-4">
              <p className="font-semibold text-red-700">
                Every donation matters!
              </p>

              <p className="mt-1 text-sm leading-6 text-red-600">
                Keep your information updated so people can find eligible
                donors.
              </p>
            </div>
          </aside>

          {/* Profile form */}
          <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Personal Information</h2>

                <p className="mt-1 text-sm text-gray-500">
                  Update your profile details below.
                </p>
              </div>

              {!editing && (
                <button
                  type="button"
                  onClick={() => {
                    setForm({ ...profile });
                    setEditing(true);
                    setMessage("");
                  }}
                  className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {/* Status message */}
            {message && (
              <div
                role="status"
                className={`mt-5 rounded-xl px-4 py-3 text-sm ${
                  messageType === "success"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {message}
              </div>
            )}

            <form onSubmit={handleSave} className="mt-7">
              <div className="grid gap-5 sm:grid-cols-2">
                {/* Full name */}
                <label className="text-sm font-semibold">
                  Full Name
                  <input
                    className={inputClass}
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    disabled={!editing}
                    required
                    placeholder="Enter your full name"
                  />
                </label>

                {/* Email */}
                <label className="text-sm font-semibold">
                  Email Address
                  <input
                    className={inputClass}
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    disabled={!editing}
                    required
                    placeholder="Enter your email"
                  />
                </label>

                {/* Phone */}
                <label className="text-sm font-semibold">
                  Phone Number
                  <input
                    className={inputClass}
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    disabled={!editing}
                    placeholder="Enter your phone number"
                  />
                </label>

                {/* Blood group */}
                <label className="text-sm font-semibold">
                  Blood Group
                  <select
                    className={inputClass}
                    name="bloodGroup"
                    value={form.bloodGroup}
                    onChange={handleChange}
                    disabled={!editing}
                  >
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                      (group) => (
                        <option key={group} value={group}>
                          {group}
                        </option>
                      )
                    )}
                  </select>
                </label>

                {/* Age */}
                <label className="text-sm font-semibold">
                  Age
                  <input
                    className={inputClass}
                    name="age"
                    type="number"
                    min="18"
                    max="100"
                    value={form.age}
                    onChange={handleChange}
                    disabled={!editing}
                    placeholder="Enter your age"
                  />
                </label>

                {/* City */}
                <label className="text-sm font-semibold">
                  City
                  <input
                    className={inputClass}
                    name="city"
                    type="text"
                    value={form.city}
                    onChange={handleChange}
                    disabled={!editing}
                    placeholder="Enter your city"
                  />
                </label>

                {/* Last donation */}
                <label className="text-sm font-semibold sm:col-span-2">
                  Last Blood Donation Date
                  <input
                    className={inputClass}
                    name="lastDonation"
                    type="date"
                    value={form.lastDonation}
                    onChange={handleChange}
                    disabled={!editing}
                    max={new Date().toLocaleDateString("en-CA")}
                  />
                </label>
              </div>

              {/* Availability toggle */}
              <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 p-5">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    name="available"
                    checked={form.available}
                    onChange={handleChange}
                    disabled={!editing}
                    className="mt-1 h-4 w-4 accent-red-600"
                  />

                  <span>
                    <span className="block font-semibold">
                      Available to Donate Blood
                    </span>

                    <span className="mt-1 block text-sm leading-6 text-gray-500">
                      Let the system know whether you are currently available
                      to be contacted for blood donation.
                    </span>
                  </span>
                </label>
              </div>

              {/* FIXED: Complete editing conditional */}
              {editing && (
                <div className="mt-7 flex flex-wrap gap-3">
                  <button
                    type="submit"
                    className="rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700"
                  >
                    Save Changes
                  </button>

                  <button
                    type="button"
                    onClick={handleCancel}
                    className="rounded-xl border border-gray-200 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </section>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-8 border-t border-gray-200 bg-white px-5 py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} LifeLink. Every drop counts.
      </footer>
    </main>
  );
}
