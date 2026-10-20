
"use client";

import { useState } from "react";
import Link from "next/link";

const initialRequests = [
  {
    id: "LL-1001",
    patient: "Rahul Sharma",
    bloodGroup: "O+",
    units: 2,
    hospital: "City General Hospital",
    city: "Bengaluru",
    urgency: "Urgent",
    date: "2026-10-25",
    status: "Searching",
  },
  {
    id: "LL-1002",
    patient: "Priya Kumar",
    bloodGroup: "B+",
    units: 1,
    hospital: "Apollo Hospital",
    city: "Mysuru",
    urgency: "Normal",
    date: "2026-10-28",
    status: "Fulfilled",
  },
  {
    id: "LL-1003",
    patient: "Anil Patil",
    bloodGroup: "AB+",
    units: 3,
    hospital: "District Hospital",
    city: "Hubballi",
    urgency: "Critical",
    date: "2026-10-22",
    status: "Searching",
  },
];

const statusStyles = {
  Searching: "bg-blue-50 text-blue-700",
  Fulfilled: "bg-green-50 text-green-700",
  Cancelled: "bg-gray-100 text-gray-600",
};

const urgencyStyles = {
  Critical: "bg-red-100 text-red-700",
  Urgent: "bg-orange-100 text-orange-700",
  Normal: "bg-green-100 text-green-700",
};

export default function MyRequestsPage() {
  const [requests, setRequests] = useState(initialRequests);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  const filteredRequests = requests.filter((request) => {
    const matchesFilter =
      filter === "All" || request.status === filter;

    const searchText = search.toLowerCase();

    const matchesSearch =
      request.id.toLowerCase().includes(searchText) ||
      request.patient.toLowerCase().includes(searchText) ||
      request.bloodGroup.toLowerCase().includes(searchText) ||
      request.city.toLowerCase().includes(searchText);

    return matchesFilter && matchesSearch;
  });

  function cancelRequest(id) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this blood request?"
    );

    if (!confirmed) return;

    setRequests((previous) =>
      previous.map((request) =>
        request.id === id
          ? { ...request, status: "Cancelled" }
          : request
      )
    );

    setMessage(`Request ${id} has been cancelled.`);
  }

  const totalRequests = requests.length;
  const searchingCount = requests.filter(
    (request) => request.status === "Searching"
  ).length;
  const fulfilledCount = requests.filter(
    (request) => request.status === "Fulfilled"
  ).length;
  const cancelledCount = requests.filter(
    (request) => request.status === "Cancelled"
  ).length;

  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">
      {/* Navigation */}
      <nav className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <Link href="/" className="text-2xl font-extrabold text-red-600">
            LifeLink<span className="text-gray-800">.</span>
          </Link>

          <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
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
              href="/profile"
              className="text-gray-600 hover:text-red-600"
            >
              My Profile
            </Link>
            <Link
              href="/requests"
              className="text-gray-600 hover:text-red-600"
            >
              New Request
            </Link>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-5 py-10">
        {/* Heading */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-red-600">
              Request Management
            </p>
            <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
              My Blood Requests
            </h1>
            <p className="mt-2 text-gray-500">
              View and manage your blood requests in one place.
            </p>
          </div>

          <Link
            href="/requests"
            className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            + Create Request
          </Link>
        </div>

        {/* Statistics */}
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            {
              label: "Total Requests",
              value: totalRequests,
              color: "text-gray-800",
            },
            {
              label: "Searching",
              value: searchingCount,
              color: "text-blue-600",
            },
            {
              label: "Fulfilled",
              value: fulfilledCount,
              color: "text-green-600",
            },
            {
              label: "Cancelled",
              value: cancelledCount,
              color: "text-gray-500",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className={`mt-2 text-3xl font-extrabold ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Search and filters */}
        <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-bold">All Requests</h2>
              <p className="mt-1 text-sm text-gray-500">
                Search by patient, request ID, blood group, or city.
              </p>
            </div>

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search requests..."
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 md:max-w-xs"
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {["All", "Searching", "Fulfilled", "Cancelled"].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilter(status)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  filter === status
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </section>

        {/* Feedback */}
        {message && (
          <div
            role="status"
            className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700"
          >
            <span>{message}</span>
            <button
              type="button"
              onClick={() => setMessage("")}
              className="font-semibold hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Request cards */}
        <section className="mt-6 space-y-5">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((request) => (
              <article
                key={request.id}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-lg font-extrabold text-red-600">
                      {request.bloodGroup}
                    </div>

                    <div>
                      <h3 className="text-lg font-bold">
                        {request.patient}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Request ID: {request.id}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        {request.hospital}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                        urgencyStyles[request.urgency]
                      }`}
                    >
                      {request.urgency}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                        statusStyles[request.status]
                      }`}
                    >
                      {request.status}
                    </span>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 border-t border-gray-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-xs text-gray-500">Blood Units</p>
                    <p className="mt-1 font-semibold">
                      {request.units} {request.units === 1 ? "unit" : "units"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">City</p>
                    <p className="mt-1 font-semibold">{request.city}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Required By</p>
                    <p className="mt-1 font-semibold">{request.date}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Current Status</p>
                    <p className="mt-1 font-semibold">{request.status}</p>
                  </div>
                </div>

                {request.status === "Searching" && (
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      href="/matching"
                      className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                    >
                      Find Matching Donors
                    </Link>

                    <button
                      type="button"
                      onClick={() => cancelRequest(request.id)}
                      className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    >
                      Cancel Request
                    </button>
                  </div>
                )}
              </article>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-12 text-center">
              <h3 className="text-lg font-bold">No requests found</h3>
              <p className="mt-2 text-sm text-gray-500">
                Try another search term or filter, or create a new request.
              </p>
              <Link
                href="/requests"
                className="mt-5 inline-block rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700"
              >
                Create Blood Request
              </Link>
            </div>
          )}
        </section>

        <p className="mt-8 text-center text-xs leading-5 text-gray-400">
          Demonstration data only. Request changes are temporary and reset
          when this page is refreshed.
        </p>
      </section>

      {/* Footer */}
      <footer className="mt-8 border-t border-gray-200 bg-white px-5 py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} LifeLink. Every drop counts.
      </footer>
    </main>
  );
}
