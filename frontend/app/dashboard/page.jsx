"use client";

import { useState } from "react";
import Link from "next/link";

const initialRequests = [
  {
    id: 1,
    patient: "Sample Patient A",
    bloodGroup: "O+",
    city: "Bangalore",
    urgency: "Critical",
    status: "Pending",
  },
  {
    id: 2,
    patient: "Sample Patient B",
    bloodGroup: "B+",
    city: "Mysore",
    urgency: "Urgent",
    status: "Matched",
  },
  {
    id: 3,
    patient: "Sample Patient C",
    bloodGroup: "AB+",
    city: "Mangalore",
    urgency: "Normal",
    status: "Pending",
  },
];

const stats = [
  { label: "Registered Donors", value: "248", icon: "🩸", note: "Sample statistic" },
  { label: "Blood Requests", value: "76", icon: "📋", note: "Sample statistic" },
  { label: "Potential Matches", value: "42", icon: "🤝", note: "Sample statistic" },
  { label: "Completed Requests", value: "31", icon: "❤️", note: "Sample statistic" },
];

export default function DashboardPage() {
  const [requests, setRequests] = useState(initialRequests);
  const [filter, setFilter] = useState("All");

  const filteredRequests =
    filter === "All"
      ? requests
      : requests.filter((request) => request.status === filter);

  function updateStatus(id, status) {
    setRequests((previous) =>
      previous.map((request) =>
        request.id === id ? { ...request, status } : request
      )
    );
  }

  const statusStyle = {
    Pending: "bg-amber-50 text-amber-700",
    Matched: "bg-blue-50 text-blue-700",
    Completed: "bg-green-50 text-green-700",
  };

  const urgencyStyle = {
    Critical: "bg-red-50 text-red-700",
    Urgent: "bg-orange-50 text-orange-700",
    Normal: "bg-gray-100 text-gray-700",
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-2xl font-extrabold text-red-600">
            ❤️ LifeLink
          </Link>
          <Link
            href="/"
            className="text-sm font-semibold text-gray-600 hover:text-red-600"
          >
            ← Back to Home
          </Link>
        </div>
      </nav>

      <section className="bg-linear-to-br from-red-600 to-rose-500 px-6 py-12 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold text-red-100">
            LIFELINK MANAGEMENT
          </p>
          <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl">
            Dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-red-50">
            An overview of donor activity, blood requests and potential matches.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <article
              key={stat.label}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-500">
                  {stat.label}
                </span>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <p className="mt-4 text-4xl font-extrabold text-gray-900">
                {stat.value}
              </p>
              <p className="mt-2 text-xs text-gray-400">{stat.note}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <article className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">Quick Actions</h2>
            <p className="mt-2 text-sm text-gray-500">
              Navigate to the main LifeLink features.
            </p>

            <div className="mt-6 space-y-3">
              <Link
                href="/donors"
                className="flex items-center justify-between rounded-xl bg-red-50 p-4 font-semibold text-red-700 transition hover:bg-red-100"
              >
                Register as Donor <span>→</span>
              </Link>
              <Link
                href="/requests"
                className="flex items-center justify-between rounded-xl bg-red-50 p-4 font-semibold text-red-700 transition hover:bg-red-100"
              >
                Create Blood Request <span>→</span>
              </Link>
              <Link
                href="/matching"
                className="flex items-center justify-between rounded-xl bg-red-50 p-4 font-semibold text-red-700 transition hover:bg-red-100"
              >
                Find Matching Donors <span>→</span>
              </Link>
            </div>
          </article>

          <article className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Recent Blood Requests
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Manage the sample requests displayed below.
                </p>
              </div>

              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-red-500"
                aria-label="Filter requests by status"
              >
                <option value="All">All statuses</option>
                <option value="Pending">Pending</option>
                <option value="Matched">Matched</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="mt-6 space-y-4">
              {filteredRequests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-xl border border-gray-100 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {request.patient}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {request.city} · {request.bloodGroup}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${urgencyStyle[request.urgency]}`}
                      >
                        {request.urgency}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyle[request.status]}`}
                      >
                        {request.status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {request.status !== "Matched" && (
                      <button
                        onClick={() => updateStatus(request.id, "Matched")}
                        className="rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                      >
                        Mark Matched
                      </button>
                    )}

                    {request.status !== "Completed" && (
                      <button
                        onClick={() => updateStatus(request.id, "Completed")}
                        className="rounded-lg border border-green-200 px-3 py-2 text-xs font-semibold text-green-700 hover:bg-green-50"
                      >
                        Mark Completed
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {filteredRequests.length === 0 && (
                <p className="py-8 text-center text-sm text-gray-500">
                  No requests found for this status.
                </p>
              )}
            </div>
          </article>
        </div>

        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
          <strong>Demo mode:</strong> Dashboard statistics and requests are
          sample data. Status changes remain in the current page state and
          reset on refresh. This dashboard is not connected to a database or
          authentication system yet.
        </div>
      </section>

      <footer className="border-t border-gray-100 bg-white px-6 py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} LifeLink. Connecting donors, saving lives.
      </footer>
    </main>
  );
}