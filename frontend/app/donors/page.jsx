
"use client";

import Link from "next/link";
import { useState } from "react";
import { apiRequest } from "@/lib/api";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function calculateAge(dateOfBirth) {
  const birthDate = new Date(`${dateOfBirth}T00:00:00`);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();

  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

export default function DonorRegistration() {
  const [formData, setFormData] = useState({
    bloodGroup: "",
    dateOfBirth: "",
    city: "",
    state: "",
    pincode: "",
    available: true,
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileCreated, setProfileCreated] = useState(false);
  const [donorId, setDonorId] = useState(null);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setMessage("");
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setError("");

    const city = formData.city.trim();
    const state = formData.state.trim();
    const pincode = formData.pincode.trim();

    if (!bloodGroups.includes(formData.bloodGroup)) {
      setError("Please select a valid blood group.");
      return;
    }

    if (!formData.dateOfBirth) {
      setError("Please enter your date of birth.");
      return;
    }

    if (formData.dateOfBirth > getTodayDate()) {
      setError("Date of birth cannot be in the future.");
      return;
    }

    const age = calculateAge(formData.dateOfBirth);

    if (age < 18 || age > 100) {
      setError("Age must be between 18 and 100.");
      return;
    }

    if (city.length < 2) {
      setError("Please enter a valid city.");
      return;
    }

    if (state.length < 2) {
      setError("Please enter a valid state.");
      return;
    }

    if (pincode && !/^\d{6}$/.test(pincode)) {
      setError("Please enter a valid 6-digit pincode.");
      return;
    }

    try {
      setLoading(true);

      // Step 1: Create donor profile in MySQL and synchronize with Neo4j.
      const profileResponse = await apiRequest("/donors", {
        method: "POST",
        body: JSON.stringify({
          bloodGroup: formData.bloodGroup,
          dateOfBirth: formData.dateOfBirth,
          city,
          state,
          pincode: pincode || null,
        }),
      });

      setDonorId(profileResponse.donorId);
      setProfileCreated(true);

      // Step 2: Update donor availability.
      const availabilityResponse = await apiRequest(
        "/donors/availability",
        {
          method: "PATCH",
          body: JSON.stringify({
            available: formData.available,
          }),
        }
      );

      const neo4jSynced =
        availabilityResponse.neo4jSynced === true;

      if (neo4jSynced) {
        setMessage(
          "Donor profile created successfully! MySQL and Neo4j synchronization completed."
        );
      } else {
        setMessage(
          "Donor profile created successfully in MySQL. Neo4j synchronization needs attention."
        );
      }
    } catch (err) {
      if (profileCreated) {
        setError(
          "Donor profile was created, but availability could not be updated: " +
            err.message
        );
      } else {
        setError(err.message || "Donor registration failed.");
      }
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-4 focus:ring-red-100";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Navigation */}
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

      {/* Hero Section */}
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

      {/* Main Content */}
      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-3">
        {/* Information Sidebar */}
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
              <li>✓ Select your correct blood group.</li>
              <li>✓ Enter your correct date of birth.</li>
              <li>✓ Provide your current location.</li>
              <li>✓ Keep your availability up to date.</li>
              <li>✓ Confirm donation eligibility with a qualified professional.</li>
            </ul>
          </div>
        </aside>

        {/* Donor Registration Form */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:col-span-2">
          <div className="border-b border-slate-100 pb-5">
            <h2 className="text-2xl font-extrabold">
              Your donor details
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Fill in the information below to create your donor profile.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              {/* Blood Group */}
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
                  disabled={profileCreated}
                >
                  <option value="">Select blood group</option>

                  {bloodGroups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date of Birth */}
              <div>
                <label htmlFor="dateOfBirth" className="text-sm font-bold">
                  Date of birth *
                </label>

                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  max={getTodayDate()}
                  className={inputClass}
                  required
                  disabled={profileCreated}
                />
              </div>

              {/* City */}
              <div>
                <label htmlFor="city" className="text-sm font-bold">
                  City *
                </label>

                <input
                  id="city"
                  name="city"
                  type="text"
                  value={formData.city}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Enter your city"
                  autoComplete="address-level2"
                  minLength={2}
                  maxLength={100}
                  required
                  disabled={profileCreated}
                />
              </div>

              {/* State */}
              <div>
                <label htmlFor="state" className="text-sm font-bold">
                  State *
                </label>

                <input
                  id="state"
                  name="state"
                  type="text"
                  value={formData.state}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Enter your state"
                  autoComplete="address-level1"
                  minLength={2}
                  maxLength={100}
                  required
                  disabled={profileCreated}
                />
              </div>

              {/* Pincode */}
              <div className="sm:col-span-2">
                <label htmlFor="pincode" className="text-sm font-bold">
                  Pincode (optional)
                </label>

                <input
                  id="pincode"
                  name="pincode"
                  type="text"
                  value={formData.pincode}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Enter your 6-digit pincode"
                  inputMode="numeric"
                  maxLength={6}
                  disabled={profileCreated}
                />
              </div>
            </div>

            {/* Availability */}
            <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-red-50 p-4">
              <input
                type="checkbox"
                name="available"
                checked={formData.available}
                onChange={handleChange}
                className="mt-1 h-4 w-4 accent-red-600"
                disabled={profileCreated}
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

            {/* Error Message */}
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
              >
                {error}
              </div>
            )}

            {/* Success Message */}
            {message && (
              <div
                role="status"
                className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-800"
              >
                {message}

                {donorId && (
                  <p className="mt-2 font-bold">
                    Your Donor ID: {donorId}
                  </p>
                )}

                {profileCreated && (
                  <Link
                    href="/dashboard"
                    className="mt-3 inline-block font-bold text-red-600 hover:underline"
                  >
                    Go to Dashboard →
                  </Link>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || profileCreated}
              className="w-full rounded-xl bg-red-600 px-6 py-4 font-bold text-white shadow-lg shadow-red-100 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {loading
                ? "Registering Donor..."
                : profileCreated
                  ? "Donor Profile Created"
                  : "Register as Donor →"}
            </button>

            <p className="text-xs leading-5 text-slate-500">
              Your donor profile is saved in MySQL and synchronized with
              Neo4j. Your logged-in donor account is associated with this profile.
            </p>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 py-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} LifeLink — Smart Blood Donation System
      </footer>
    </main>
  );
}
