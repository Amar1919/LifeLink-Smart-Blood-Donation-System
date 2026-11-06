
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";

const statusStyles = {
  PENDING: "bg-blue-50 text-blue-700",
  MATCHED: "bg-blue-50 text-blue-700",
  ACCEPTED: "bg-purple-50 text-purple-700",
  FULFILLED: "bg-green-50 text-green-700",
  CANCELLED: "bg-gray-100 text-gray-600",
};

const urgencyStyles = {
  CRITICAL: "bg-red-100 text-red-700",
  HIGH: "bg-orange-100 text-orange-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  LOW: "bg-green-100 text-green-700",
  NORMAL: "bg-green-100 text-green-700",
};

function getValue(object, keys, fallback = "") {
  for (const key of keys) {
    if (object[key] !== undefined && object[key] !== null) {
      return object[key];
    }
  }
  return fallback;
}

function normalizeRequest(request) {
  const acceptedResponses = Number(
    getValue(request, ["accepted_responses", "acceptedResponses"], 0)
  );

  const pendingResponses = Number(
    getValue(request, ["pending_responses", "pendingResponses"], 0)
  );

  const totalMatches = Number(
    getValue(request, ["total_matches", "totalMatches"], 0)
  );

  const rawStatus = String(
    getValue(request, ["status"], "PENDING")
  ).toUpperCase();

  const displayStatus =
    ["PENDING", "MATCHED"].includes(rawStatus) && acceptedResponses > 0
      ? "ACCEPTED"
      : rawStatus;

  return {
    id: getValue(request, ["request_id", "requestId", "id"]),
    patient: getValue(request, ["patient_name", "patientName"], "Patient"),
    bloodGroup: getValue(
      request,
      ["required_blood_group", "blood_group", "bloodGroup"],
      "Not specified"
    ),
    units: Number(
      getValue(request, ["units_required", "unitsRequired", "units"], 0)
    ),
    hospital: getValue(
      request,
      ["hospital_name", "hospitalName"],
      "Hospital not specified"
    ),
    city: getValue(request, ["city"], "Not specified"),
    urgency: String(
      getValue(request, ["urgency", "priority", "urgency_level"], "NORMAL")
    ).toUpperCase(),
    date: getValue(
      request,
      ["required_by", "requiredBy", "request_date", "created_at"],
      null
    ),
    status: displayStatus,
    databaseStatus: rawStatus,
    totalMatches,
    acceptedResponses,
    pendingResponses,
    rejectedResponses: Number(
      getValue(request, ["rejected_responses", "rejectedResponses"], 0)
    ),
  };
}

function formatDate(dateString) {
  if (!dateString) return "Not specified";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatusLabel(status) {
  const labels = {
    PENDING: "Searching",
    MATCHED: "Searching",
    ACCEPTED: "Donor Accepted",
    FULFILLED: "Fulfilled",
    CANCELLED: "Cancelled",
  };

  return labels[status] || status;
}

export default function MyRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Initial loading: state updates happen after the API request resolves.
  useEffect(() => {
    let isMounted = true;

    async function loadInitialRequests() {
      try {
        const response = await apiRequest("/requests/my-requests");

        const requestData = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.requests)
            ? response.requests
            : [];

        if (isMounted) {
          setRequests(requestData.map(normalizeRequest));
          setMessage("");
        }
      } catch (error) {
        if (isMounted) {
          setMessage(error.message || "Unable to load your requests.");
          setMessageType("error");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadInitialRequests();

    return () => {
      isMounted = false;
    };
  }, []);

  // Used by the Refresh button and after cancellation.
  const fetchRequests = useCallback(async () => {
    try {
      const response = await apiRequest("/requests/my-requests");

      const requestData = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.requests)
          ? response.requests
          : [];

      setRequests(requestData.map(normalizeRequest));
      setMessage("");
    } catch (error) {
      setMessage(error.message || "Unable to load your requests.");
      setMessageType("error");
    }
  }, []);

  const filteredRequests = requests.filter((request) => {
    let matchesFilter = true;

    if (filter === "Searching") {
      matchesFilter = ["PENDING", "MATCHED"].includes(request.status);
    } else if (filter === "Donor Accepted") {
      matchesFilter = request.status === "ACCEPTED";
    } else if (filter === "Fulfilled") {
      matchesFilter = request.status === "FULFILLED";
    } else if (filter === "Cancelled") {
      matchesFilter = request.status === "CANCELLED";
    }

    const searchText = search.trim().toLowerCase();

    const matchesSearch = [
      String(request.id),
      request.patient,
      request.bloodGroup,
      request.city,
      request.hospital,
      request.urgency,
      getStatusLabel(request.status),
    ].some((value) =>
      String(value).toLowerCase().includes(searchText)
    );

    return matchesFilter && matchesSearch;
  });

  async function handleRefresh() {
    setRefreshing(true);
    await fetchRequests();
    setRefreshing(false);
  }

  async function cancelRequest(id) {
    const request = requests.find(
      (item) => String(item.id) === String(id)
    );

    if (!request) {
      setMessageType("error");
      setMessage("Request could not be found.");
      return;
    }

    if (!["PENDING", "MATCHED"].includes(request.status)) {
      setMessageType("error");
      setMessage("This request cannot be cancelled.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to cancel request ${id}?`
    );

    if (!confirmed) return;

    try {
      setCancellingId(id);
      setMessage("");

      const response = await apiRequest(`/requests/${id}/cancel`, {
        method: "PATCH",
      });

      setMessage(
        response.message ||
          `Request ${id} has been cancelled successfully.`
      );
      setMessageType("success");

      await fetchRequests();
    } catch (error) {
      setMessage(error.message || "Unable to cancel this request.");
      setMessageType("error");
    } finally {
      setCancellingId(null);
    }
  }

  const totalRequests = requests.length;

  const searchingCount = requests.filter((request) =>
    ["PENDING", "MATCHED"].includes(request.status)
  ).length;

  const acceptedCount = requests.filter(
    (request) => request.status === "ACCEPTED"
  ).length;

  const fulfilledCount = requests.filter(
    (request) => request.status === "FULFILLED"
  ).length;

  const cancelledCount = requests.filter(
    (request) => request.status === "CANCELLED"
  ).length;

  const statistics = [
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
      label: "Donor Accepted",
      value: acceptedCount,
      color: "text-purple-600",
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
  ];

  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">
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

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              {refreshing ? "Refreshing..." : "↻ Refresh"}
            </button>

            <Link
              href="/requests"
              className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              + Create Request
            </Link>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {statistics.map((stat) => (
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

        <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-bold">All Requests</h2>
              <p className="mt-1 text-sm text-gray-500">
                Search by request ID, hospital, blood group, or city.
              </p>
            </div>

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search requests..."
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 md:max-w-xs"
              aria-label="Search blood requests"
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {[
              "All",
              "Searching",
              "Donor Accepted",
              "Fulfilled",
              "Cancelled",
            ].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => {
                  setFilter(status);
                  setMessage("");
                }}
                aria-pressed={filter === status}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  filter === status
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600"
                }`}
              >
                {status}
                {status === "All" ? ` (${totalRequests})` : ""}
              </button>
            ))}
          </div>
        </section>

        {message && (
          <div
            role="status"
            aria-live="polite"
            className={`mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm ${
              messageType === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
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

        <section className="mt-6 space-y-5">
          {loading ? (
            <div className="rounded-2xl border border-gray-100 bg-white px-5 py-16 text-center shadow-sm">
              <p className="font-semibold text-gray-700">
                Loading your blood requests...
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Fetching your latest information from LifeLink.
              </p>
            </div>
          ) : filteredRequests.length > 0 ? (
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
                        urgencyStyles[request.urgency] ||
                        urgencyStyles.NORMAL
                      }`}
                    >
                      {request.urgency}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                        statusStyles[request.status] ||
                        "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {getStatusLabel(request.status)}
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
                    <p className="text-xs text-gray-500">Request Date</p>
                    <p className="mt-1 font-semibold">
                      {formatDate(request.date)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Current Status</p>
                    <p className="mt-1 font-semibold">
                      {getStatusLabel(request.status)}
                    </p>
                  </div>
                </div>

                {request.totalMatches > 0 && (
                  <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-gray-50 p-4 sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-gray-500">Total Matches</p>
                      <p className="mt-1 text-lg font-bold">
                        {request.totalMatches}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Donors Accepted</p>
                      <p className="mt-1 text-lg font-bold text-purple-700">
                        {request.acceptedResponses}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Pending Responses</p>
                      <p className="mt-1 text-lg font-bold text-blue-700">
                        {request.pendingResponses}
                      </p>
                    </div>
                  </div>
                )}

                {["PENDING", "MATCHED"].includes(request.status) && (
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      href={`/matching?requestId=${request.id}`}
                      className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                    >
                      Find Matching Donors
                    </Link>

                    <button
                      type="button"
                      onClick={() => cancelRequest(request.id)}
                      disabled={cancellingId === request.id}
                      className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {cancellingId === request.id
                        ? "Cancelling..."
                        : "Cancel Request"}
                    </button>
                  </div>
                )}

                {request.status === "ACCEPTED" && (
                  <div className="mt-5 rounded-xl bg-purple-50 px-4 py-3 text-sm font-medium text-purple-700">
                    <p>
                      {request.acceptedResponses} donor
                      {request.acceptedResponses === 1 ? "" : "s"} accepted
                      this request.
                    </p>

                    <Link
                      href={`/matching?requestId=${request.id}`}
                      className="mt-2 inline-block font-bold underline"
                    >
                      View Matching Donors
                    </Link>
                  </div>
                )}

                {request.status === "FULFILLED" && (
                  <p className="mt-5 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                    This request has been fulfilled.
                  </p>
                )}

                {request.status === "CANCELLED" && (
                  <p className="mt-5 rounded-xl bg-gray-50 px-4 py-3 text-sm font-medium text-gray-600">
                    This request has been cancelled.
                  </p>
                )}
              </article>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-12 text-center">
              <h3 className="text-lg font-bold">No requests found</h3>

              <p className="mt-2 text-sm text-gray-500">
                {requests.length === 0
                  ? "You haven't created any blood requests yet."
                  : "Try another search term or filter."}
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setFilter("All");
                }}
                className="mt-5 rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Clear Search and Filters
              </button>

              <div>
                <Link
                  href="/requests"
                  className="mt-4 inline-block rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Create Blood Request
                </Link>
              </div>
            </div>
          )}
        </section>

        <p className="mt-8 text-center text-xs leading-5 text-gray-400">
          Your blood request information is retrieved from the LifeLink
          backend.
        </p>
      </section>

      <footer className="mt-8 border-t border-gray-200 bg-white px-5 py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} LifeLink. Every drop counts.
      </footer>
    </main>
  );
}
