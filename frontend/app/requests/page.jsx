
"use client";

import { useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";

const hospitals = [
  {
    hospitalId: 1,
    hospitalName: "Manipal Hospital",
    city: "Bangalore",
    state: "Karnataka",
  },
  {
    hospitalId: 2,
    hospitalName: "Apollo Hospital",
    city: "Bangalore",
    state: "Karnataka",
  },
];

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

// Values match the MySQL ENUM:
// ENUM('LOW', 'MEDIUM', 'HIGH')
const urgencyOptions = [
  { label: "Normal", value: "LOW" },
  { label: "Urgent", value: "MEDIUM" },
  { label: "Critical", value: "HIGH" },
];

export default function BloodRequestPage() {
  const [form, setForm] = useState({
    patientName: "",
    hospitalId: "",
    bloodGroup: "",
    units: "1",
    urgency: "HIGH",
    pincode: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdRequestId, setCreatedRequestId] = useState(null);

  const selectedHospital = hospitals.find(
    (hospital) => String(hospital.hospitalId) === form.hospitalId
  );

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
    setError("");
    setCreatedRequestId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setError("");
    setCreatedRequestId(null);

    const patientName = form.patientName.trim();
    const units = Number(form.units);
    const pincode = form.pincode.trim();

    if (patientName.length < 2) {
      setError("Please enter a valid patient name.");
      return;
    }

    if (!selectedHospital) {
      setError("Please select a hospital.");
      return;
    }

    if (!bloodGroups.includes(form.bloodGroup)) {
      setError("Please select a valid blood group.");
      return;
    }

    if (!Number.isInteger(units) || units < 1 || units > 20) {
      setError("Please enter between 1 and 20 units.");
      return;
    }

    if (pincode && !/^\d{6}$/.test(pincode)) {
      setError("Please enter a valid 6-digit pincode.");
      return;
    }

    if (!["LOW", "MEDIUM", "HIGH"].includes(form.urgency)) {
      setError("Please select a valid urgency level.");
      return;
    }

    try {
      setLoading(true);

      const response = await apiRequest("/requests", {
        method: "POST",
        body: JSON.stringify({
          hospitalId: selectedHospital.hospitalId,
          patientName,
          requiredBloodGroup: form.bloodGroup,
          unitsRequired: units,
          urgencyLevel: form.urgency,
          city: selectedHospital.city,
          state: selectedHospital.state,
          pincode: pincode || null,
        }),
      });

      setCreatedRequestId(response.requestId);

      setMessage(
        response.message || "Blood request created successfully."
      );

      if (response.mysqlSynced && response.neo4jSynced) {
        setMessage(
          "Blood request created successfully and synchronized with MySQL and Neo4j."
        );
      } else if (response.mysqlSynced) {
        setMessage(
          "Blood request saved in MySQL, but Neo4j synchronization needs attention."
        );
      }

      setForm({
        patientName: "",
        hospitalId: "",
        bloodGroup: "",
        units: "1",
        urgency: "HIGH",
        pincode: "",
      });
    } catch (err) {
      setError(err.message || "Unable to create blood request.");
    } finally {
      setLoading(false);
    }
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

          <div className="flex items-center gap-5">
            <Link
              href="/my-requests"
              className="text-sm font-semibold text-gray-600 transition hover:text-red-600"
            >
              My Requests
            </Link>

            <Link
              href="/"
              className="text-sm font-semibold text-gray-600 transition hover:text-red-600"
            >
              ← Back to Home
            </Link>
          </div>
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
                Patient & Request Details
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Enter the patient&apos;s information and blood requirements.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {/* Patient Name */}
              <div className="sm:col-span-2">
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

              {/* Blood Group */}
              <div>
                <label htmlFor="bloodGroup" className={labelClass}>
                  Required Blood Group *
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

                  {bloodGroups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
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
                  {urgencyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Hospital */}
              <div>
                <label htmlFor="hospitalId" className={labelClass}>
                  Hospital *
                </label>

                <select
                  id="hospitalId"
                  className={inputClass}
                  name="hospitalId"
                  value={form.hospitalId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select hospital</option>

                  {hospitals.map((hospital) => (
                    <option
                      key={hospital.hospitalId}
                      value={hospital.hospitalId}
                    >
                      {hospital.hospitalName}
                    </option>
                  ))}
                </select>
              </div>

              {/* City */}
              <div>
                <label htmlFor="city" className={labelClass}>
                  City
                </label>

                <input
                  id="city"
                  className={inputClass}
                  type="text"
                  value={selectedHospital?.city || ""}
                  placeholder="Select a hospital first"
                  readOnly
                />
              </div>

              {/* State */}
              <div>
                <label htmlFor="state" className={labelClass}>
                  State
                </label>

                <input
                  id="state"
                  className={inputClass}
                  type="text"
                  value={selectedHospital?.state || ""}
                  placeholder="Select a hospital first"
                  readOnly
                />
              </div>

              {/* Pincode */}
              <div>
                <label htmlFor="pincode" className={labelClass}>
                  Pincode (Optional)
                </label>

                <input
                  id="pincode"
                  className={inputClass}
                  type="text"
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  placeholder="Enter 6-digit pincode"
                  inputMode="numeric"
                  maxLength={6}
                />
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

                {createdRequestId && (
                  <div className="mt-3">
                    <p className="font-semibold">
                      Request ID: {createdRequestId}
                    </p>

                    <Link
                      href="/my-requests"
                      className="mt-2 inline-block font-bold text-red-600 hover:underline"
                    >
                      View My Requests →
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-8 w-full rounded-xl bg-red-600 px-6 py-4 font-bold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-200 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {loading ? "Submitting Request..." : "Submit Blood Request →"}
            </button>

            <p className="mt-4 text-xs leading-5 text-gray-500">
              Your request will be saved in MySQL and synchronized with Neo4j.
              Your logged-in account will be associated with this request.
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
