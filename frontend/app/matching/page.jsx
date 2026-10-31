"use client";

import { useState } from "react";
import Link from "next/link";

const sampleDonors = [
  { id: 1, name: "Rahul Sharma", bloodGroup: "O+", city: "Bangalore", available: true },
  { id: 2, name: "Priya Reddy", bloodGroup: "B+", city: "Bangalore", available: true },
  { id: 3, name: "Arjun Kumar", bloodGroup: "A+", city: "Mysore", available: true },
  { id: 4, name: "Sneha Patil", bloodGroup: "O-", city: "Bangalore", available: false },
  { id: 5, name: "Kiran Rao", bloodGroup: "AB+", city: "Mangalore", available: true },
  { id: 6, name: "Ananya Das", bloodGroup: "B+", city: "Bangalore", available: true },
  { id: 7, name: "Vikram Singh", bloodGroup: "A-", city: "Mysore", available: true },
  { id: 8, name: "Meera Nair", bloodGroup: "O+", city: "Mangalore", available: true },
];

export default function MatchingPage() {
  const [bloodGroup, setBloodGroup] = useState("");
  const [city, setCity] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);

  const filteredDonors = sampleDonors.filter((donor) => {
    const matchesBlood =
      !bloodGroup || donor.bloodGroup === bloodGroup;

    const matchesCity =
      !city.trim() ||
      donor.city.toLowerCase().includes(city.trim().toLowerCase());

    return matchesBlood && matchesCity && donor.available;
  });

  function handleSearch(event) {
    event.preventDefault();

    setLoading(true);
    setShowResults(false);

    // Simulates searching sample data.
    // Real matching will be handled by the backend later.
    setTimeout(() => {
      setLoading(false);
      setShowResults(true);
    }, 600);
  }

  function handleClear() {
    setBloodGroup("");
    setCity("");
    setShowResults(false);
    setLoading(false);
  }

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
      <section className="bg-linear-to-br from-red-600 to-rose-500 px-6 py-16 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <span className="rounded-full bg-white/20 px-4 py-2 text-sm font-medium">
            Smart Donor Discovery
          </span>

          <h1 className="mt-6 text-4xl font-extrabold sm:text-5xl">
            Find Blood Donors
          </h1>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-red-50">
            Search potential donors by blood group and city to find a possible
            match for a blood request.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-6xl">
          {/* Search Form */}
          <form
            onSubmit={handleSearch}
            className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8"
          >
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Search Donors
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Select your requirements to view matching sample profiles.
              </p>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-3">
              {/* Blood Group */}
              <div>
                <label
                  htmlFor="bloodGroup"
                  className="text-sm font-semibold text-gray-700"
                >
                  Blood Group
                </label>

                <select
                  id="bloodGroup"
                  value={bloodGroup}
                  onChange={(event) => {
                    setBloodGroup(event.target.value);
                    setShowResults(false);
                  }}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-800 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                >
                  <option value="">All blood groups</option>

                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                    (group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* City */}
              <div>
                <label
                  htmlFor="city"
                  className="text-sm font-semibold text-gray-700"
                >
                  City
                </label>

                <input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(event) => {
                    setCity(event.target.value);
                    setShowResults(false);
                  }}
                  placeholder="e.g. Bangalore"
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-800 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </div>

              {/* Search Button */}
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-red-600 px-6 py-3.5 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Searching..." : "Search Donors →"}
                </button>
              </div>
            </div>
          </form>

          {/* Search Loading */}
          {loading && (
            <div className="mt-10 rounded-2xl bg-white p-10 text-center shadow-sm">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-red-100 border-t-red-600" />

              <p className="mt-4 font-semibold text-gray-700">
                Searching for potential donors...
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Please wait while we check the sample profiles.
              </p>
            </div>
          )}

          {/* Search Results */}
          {showResults && !loading && (
            <section className="mt-10">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Matching Donors
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {filteredDonors.length} available sample profile
                    {filteredDonors.length === 1 ? "" : "s"} found
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleClear}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:border-red-300 hover:text-red-600"
                >
                  Clear Filters
                </button>
              </div>

              {/* Donor Cards */}
              {filteredDonors.length > 0 ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredDonors.map((donor) => (
                    <article
                      key={donor.id}
                      className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-xl">
                            👤
                          </div>

                          <div>
                            <h3 className="font-bold text-gray-900">
                              {donor.name}
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                              📍 {donor.city}
                            </p>
                          </div>
                        </div>

                        <span className="rounded-xl bg-red-50 px-3 py-2 font-extrabold text-red-600">
                          {donor.bloodGroup}
                        </span>
                      </div>

                      <div className="mt-5 flex items-center gap-2 text-sm font-medium text-green-700">
                        <span className="h-2 w-2 rounded-full bg-green-500" />

                        {donor.available
                          ? "Available in sample data"
                          : "Currently unavailable"}
                      </div>

                      <div className="mt-5 border-t border-gray-100 pt-4">
                        <p className="text-xs leading-5 text-gray-400">
                          Sample profile only. Real donor contact details and
                          live availability will be provided through the
                          backend after integration.
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                /* Empty State */
                <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
                  <div className="text-4xl">🔎</div>

                  <h3 className="mt-4 text-lg font-bold text-gray-900">
                    No matching donors found
                  </h3>

                  <p className="mt-2 text-sm text-gray-500">
                    Try selecting another blood group or searching in a
                    different city.
                  </p>

                  <button
                    type="button"
                    onClick={handleClear}
                    className="mt-5 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700"
                  >
                    Reset Search
                  </button>
                </div>
              )}
            </section>
          )}

          {/* Initial Features */}
          {!showResults && !loading && (
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-white p-5 text-center shadow-sm">
                <div className="text-3xl">🩸</div>

                <h3 className="mt-3 font-bold text-gray-900">
                  Blood Group Filter
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Narrow down profiles by blood group.
                </p>
              </div>

              <div className="rounded-2xl bg-white p-5 text-center shadow-sm">
                <div className="text-3xl">📍</div>

                <h3 className="mt-3 font-bold text-gray-900">
                  Location Search
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Search available sample donors by city.
                </p>
              </div>

              <div className="rounded-2xl bg-white p-5 text-center shadow-sm">
                <div className="text-3xl">🤝</div>

                <h3 className="mt-3 font-bold text-gray-900">
                  Potential Matches
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Review available sample profiles.
                </p>
              </div>
            </div>
          )}

          {/* Demo Limitation */}
          <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
            <strong>Demo limitation:</strong> These are fictional sample
            profiles. Blood-group filtering here is a simple exact match, not
            a complete medical compatibility assessment. Confirm compatibility
            and availability with qualified medical staff.
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white px-6 py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} LifeLink. Connecting donors, saving lives.
      </footer>
    </main>
  );
}