"use client";

import { useState } from "react";
import Link from "next/link";

export default function BloodRequestPage() {
  const [form, setForm] = useState({
    patientName: "",
    contactName: "",
    phone: "",
    bloodGroup: "",
    units: "1",
    hospital: "",
    city: "",
    urgency: "Urgent",
    requiredDate: "",
    details: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
    setError("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setError("");

    const patientName = form.patientName.trim();
    const contactName = form.contactName.trim();
    const phone = form.phone.trim();
    const hospital = form.hospital.trim();
    const city = form.city.trim();
    const units = Number(form.units);

    if (patientName.length < 2) {
      setError("Please enter a valid patient name.");
      return;
    }

    if (contactName.length < 2) {
      setError("Please enter a valid contact person's name.");
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    const validBloodGroups = [
      "A+",
      "A-",
      "B+",
      "B-",
      "AB+",
      "AB-",
      "O+",
      "O-",
    ];

    if (!validBloodGroups.includes(form.bloodGroup)) {
      setError("Please select a valid blood group.");
      return;
    }

    if (!Number.isInteger(units) || units < 1 || units > 20) {
      setError("Please enter a number of units between 1 and 20.");
      return;
    }

    if (!["Normal", "Urgent", "Critical"].includes(form.urgency)) {
      setError("Please select a valid urgency level.");
      return;
    }

    if (hospital.length < 2) {
      setError("Please enter a valid hospital name.");
      return;
    }

    if (city.length < 2) {
      setError("Please enter a valid city.");
      return;
    }

    if (!form.requiredDate) {
      setError("Please select the required date.");
      return;
    }

    if (form.requiredDate < getTodayDate()) {
      setError("Required date cannot be in the past.");
      return;
    }

    setLoading(true);

    // Frontend demo only. Backend integration will be added later.
    setTimeout(() => {
      setLoading(false);
      setMessage(
        "Blood request validated successfully! Database integration will be added later."
      );
    }, 700);
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100";

  const labelClass = "text-sm font-semibold text-gray-700";

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-2xl font-extrabold text-red-600">
            ❤️ LifeLink
          </Link>

          <Link
            href="/"
            className="text-sm font-semibold text-gray-600 transition hover:text-red-600"
          >
            ← Back to Home
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-linear-to-br from-red-600 to-rose-500 px-6 py-14 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <span className="rounded-full bg-white/20 px-4 py-2 text-sm font-medium">
            Every Drop Counts
          </span>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Request Blood
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-red-50 sm:text-lg">
            Tell us what you need. LifeLink helps connect blood requests with
            potential donors.
          </p>
        </div>
      </section>

      {/* Request Form */}
      <section className="px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-4xl">
          {/* Important Information */}
          <div className="mb-8 rounded-2xl border border-red-100 bg-red-50 p-5">
            <h2 className="font-bold text-red-800">
              Important information
            </h2>

            <p className="mt-2 text-sm leading-6 text-red-700">
              Submitting this form does not guarantee blood availability.
              For a medical emergency, contact the hospital or local emergency
              services immediately.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-10"
          >
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900">
                Patient & Contact Details
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Enter the patient&apos;s information and a contact number.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {/* Patient Name */}
              <div>
                <label htmlFor="patientName" className={labelClass}>
                  Patient Name *
                </label>

                <input
                  id="patientName"
                  className={inputClass}
                  type="text"
                  name="patientName"
                  value={form.patientName}
                  onChange={handleChange}
                  placeholder="Enter patient name"
                  autoComplete="name"
                  minLength={2}
                  maxLength={100}
                  required
                />
              </div>

              {/* Contact Person */}
              <div>
                <label htmlFor="contactName" className={labelClass}>
                  Contact Person *
                </label>

                <input
                  id="contactName"
                  className={inputClass}
                  type="text"
                  name="contactName"
                  value={form.contactName}
                  onChange={handleChange}
                  placeholder="Enter contact person's name"
                  minLength={2}
                  maxLength={100}
                  required
                />
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phone" className={labelClass}>
                  Contact Number *
                </label>

                <input
                  id="phone"
                  className={inputClass}
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter 10-digit phone number"
                  inputMode="numeric"
                  maxLength={10}
                  pattern="[0-9]{10}"
                  title="Enter a 10-digit phone number"
                  autoComplete="tel"
                  required
                />
              </div>

              {/* Blood Group */}
              <div>
                <label htmlFor="bloodGroup" className={labelClass}>
                  Blood Group *
                </label>

                <select
                  id="bloodGroup"
                  className={inputClass}
                  name="bloodGroup"
                  value={form.bloodGroup}
                  onChange={handleChange}
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

              {/* Units Required */}
              <div>
                <label htmlFor="units" className={labelClass}>
                  Units Required *
                </label>

                <input
                  id="units"
                  className={inputClass}
                  type="number"
                  name="units"
                  min="1"
                  max="20"
                  step="1"
                  value={form.units}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Urgency */}
              <div>
                <label htmlFor="urgency" className={labelClass}>
                  Urgency Level *
                </label>

                <select
                  id="urgency"
                  className={inputClass}
                  name="urgency"
                  value={form.urgency}
                  onChange={handleChange}
                  required
                >
                  <option value="Normal">Normal</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              {/* Hospital */}
              <div className="sm:col-span-2">
                <label htmlFor="hospital" className={labelClass}>
                  Hospital / Medical Center *
                </label>

                <input
                  id="hospital"
                  className={inputClass}
                  type="text"
                  name="hospital"
                  value={form.hospital}
                  onChange={handleChange}
                  placeholder="Enter hospital name and location"
                  minLength={2}
                  maxLength={200}
                  required
                />
              </div>

              {/* City */}
              <div>
                <label htmlFor="city" className={labelClass}>
                  City *
                </label>

                <input
                  id="city"
                  className={inputClass}
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Enter city"
                  minLength={2}
                  maxLength={100}
                  required
                />
              </div>

              {/* Required Date */}
              <div>
                <label htmlFor="requiredDate" className={labelClass}>
                  Required By *
                </label>

                <input
                  id="requiredDate"
                  className={inputClass}
                  type="date"
                  name="requiredDate"
                  value={form.requiredDate}
                  onChange={handleChange}
                  min={getTodayDate()}
                  required
                />
              </div>

              {/* Additional Details */}
              <div className="sm:col-span-2">
                <label htmlFor="details" className={labelClass}>
                  Additional Details (Optional)
                </label>

                <textarea
                  id="details"
                  className={inputClass}
                  name="details"
                  value={form.details}
                  onChange={handleChange}
                  rows={4}
                  maxLength={1000}
                  placeholder="Add any relevant information..."
                />

                <p className="mt-1 text-right text-xs text-gray-400">
                  {form.details.length}/1000 characters
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div
                role="alert"
                className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
              >
                {error}
              </div>
            )}

            {/* Success Message */}
            {message && (
              <div
                role="status"
                className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-800"
              >
                {message}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-8 w-full rounded-xl bg-red-600 px-6 py-4 font-bold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-200 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {loading ? "Validating Request..." : "Submit Blood Request →"}
            </button>

            <p className="mt-4 text-xs leading-5 text-gray-500">
              This demo validates the form in your browser. It does not send
              data to a server or save a real blood request.
            </p>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white px-6 py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} LifeLink. Connecting donors, saving lives.
      </footer>
    </main>
  );
}