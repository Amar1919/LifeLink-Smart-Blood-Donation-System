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

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (Number(form.units) < 1) {
      setMessage("Please enter at least one unit of blood.");
      return;
    }

    setMessage(
      "Request form validated successfully! Database integration will be added later."
    );
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100";

  const labelClass = "text-sm font-semibold text-gray-700";

  return (
    <main className="min-h-screen bg-gray-50">
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

      <section className="px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-4xl">
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
                Enter the patient's information and a contact number.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Patient Name *</label>
                <input
                  className={inputClass}
                  name="patientName"
                  value={form.patientName}
                  onChange={handleChange}
                  placeholder="Enter patient name"
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Contact Person *</label>
                <input
                  className={inputClass}
                  name="contactName"
                  value={form.contactName}
                  onChange={handleChange}
                  placeholder="Enter contact person's name"
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Contact Number *</label>
                <input
                  className={inputClass}
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  pattern="[0-9]{10}"
                  title="Enter a 10-digit phone number"
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Blood Group *</label>
                <select
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

              <div>
                <label className={labelClass}>Units Required *</label>
                <input
                  className={inputClass}
                  type="number"
                  name="units"
                  min="1"
                  max="20"
                  value={form.units}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Urgency Level *</label>
                <select
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

              <div className="sm:col-span-2">
                <label className={labelClass}>Hospital / Medical Center *</label>
                <input
                  className={inputClass}
                  name="hospital"
                  value={form.hospital}
                  onChange={handleChange}
                  placeholder="Enter hospital name and location"
                  required
                />
              </div>

              <div>
                <label className={labelClass}>City *</label>
                <input
                  className={inputClass}
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Enter city"
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Required By *</label>
                <input
                  className={inputClass}
                  type="date"
                  name="requiredDate"
                  value={form.requiredDate}
                  onChange={handleChange}
                  min={new Date().toLocaleDateString("en-CA")}
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>
                  Additional Details (Optional)
                </label>
                <textarea
                  className={inputClass}
                  name="details"
                  value={form.details}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Add any relevant information..."
                />
              </div>
            </div>

            {message && (
              <div
                role="status"
                className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-800"
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              className="mt-8 w-full rounded-xl bg-red-600 px-6 py-4 font-bold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-200 sm:w-auto"
            >
              Submit Blood Request →
            </button>

            <p className="mt-4 text-xs leading-5 text-gray-500">
              This demo validates the form in your browser. It does not send
              data to a server or save a real blood request.
            </p>
          </form>
        </div>
      </section>

      <footer className="border-t border-gray-100 bg-white px-6 py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} LifeLink. Connecting donors, saving lives.
      </footer>
    </main>
  );
}