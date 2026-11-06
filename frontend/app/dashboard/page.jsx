
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";

function normalizeMatch(match) {
  return {
    id: match.match_id,
    requestId: match.request_id,
    patient: match.patient_name || "Patient",
    bloodGroup: match.required_blood_group || "Not specified",
    units: Number(match.units_required || 0),
    city: match.city || "Not specified",
    urgency: String(match.urgency_level || "NORMAL").toUpperCase(),
    matchScore: Number(match.match_score || 0),
    matchStatus: String(match.match_status || "SUGGESTED").toUpperCase(),
    responseStatus: String(
      match.response_status || "PENDING"
    ).toUpperCase(),
    matchedAt: match.matched_at,
  };
}

function formatDate(value) {
  if (!value) return "Not specified";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not specified";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const urgencyStyles = {
  CRITICAL: "bg-red-100 text-red-700",
  HIGH: "bg-orange-100 text-orange-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  LOW: "bg-green-100 text-green-700",
  NORMAL: "bg-gray-100 text-gray-700",
};

export default function DashboardPage() {
  const [profile, setProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [processingMatchId, setProcessingMatchId] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ----------------------------------------------------------
  // LOAD DONOR PROFILE AND MATCHES
  // ----------------------------------------------------------

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const [profileResponse, matchesResponse] = await Promise.all([
          apiRequest("/donors/my-profile"),
          apiRequest("/matches/my-matches"),
        ]);

        if (!active) return;

        setProfile(profileResponse.data);

        const matchData = Array.isArray(matchesResponse.data)
          ? matchesResponse.data
          : [];

        setMatches(matchData.map(normalizeMatch));
        setError("");
      } catch (err) {
        if (active) {
          setError(
            err.message || "Unable to load your donor dashboard."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  // ----------------------------------------------------------
  // REFRESH DASHBOARD
  // ----------------------------------------------------------

  async function refreshDashboard() {
    try {
      setRefreshing(true);
      setError("");

      const [profileResponse, matchesResponse] = await Promise.all([
        apiRequest("/donors/my-profile"),
        apiRequest("/matches/my-matches"),
      ]);

      setProfile(profileResponse.data);

      const matchData = Array.isArray(matchesResponse.data)
        ? matchesResponse.data
        : [];

      setMatches(matchData.map(normalizeMatch));
    } catch (err) {
      setError(err.message || "Unable to refresh dashboard.");
    } finally {
      setRefreshing(false);
    }
  }

  // ----------------------------------------------------------
  // UPDATE DONOR AVAILABILITY
  // ----------------------------------------------------------

  async function toggleAvailability() {
    if (!profile) return;

    const newAvailability = !profile.available;

    try {
      setAvailabilityLoading(true);
      setMessage("");
      setError("");

      const response = await apiRequest("/donors/availability", {
        method: "PATCH",
        body: JSON.stringify({
          available: newAvailability,
        }),
      });

      setProfile((previous) => ({
        ...previous,
        available: response.availability,
      }));

      setMessage(
        response.neo4jSynced
          ? "Availability updated successfully in MySQL and Neo4j."
          : "Availability updated in MySQL. Neo4j synchronization is pending."
      );
    } catch (err) {
      setError(err.message || "Unable to update availability.");
    } finally {
      setAvailabilityLoading(false);
    }
  }

  // ----------------------------------------------------------
  // ACCEPT OR REJECT MATCH
  // ----------------------------------------------------------

  async function respondToMatch(matchId, response) {
    const confirmed = window.confirm(
      `Are you sure you want to ${response.toLowerCase()} this blood request?`
    );

    if (!confirmed) return;

    try {
      setProcessingMatchId(matchId);
      setMessage("");
      setError("");

      const result = await apiRequest(
        `/matches/${matchId}/respond`,
        {
          method: "PATCH",
          body: JSON.stringify({ response }),
        }
      );

      setMatches((previous) =>
        previous.map((match) =>
          match.id === matchId
            ? {
                ...match,
                matchStatus: result.matchStatus,
                responseStatus: result.responseStatus,
              }
            : match
        )
      );

      setMessage(result.message || `Match ${response.toLowerCase()} successfully.`);
    } catch (err) {
      setError(err.message || "Unable to update match response.");
    } finally {
      setProcessingMatchId(null);
    }
  }

  // ----------------------------------------------------------
  // STATISTICS
  // ----------------------------------------------------------

  const totalMatches = matches.length;

  const pendingMatches = matches.filter(
    (match) => match.responseStatus === "PENDING"
  ).length;

  const acceptedMatches = matches.filter(
    (match) => match.responseStatus === "ACCEPTED"
  ).length;

  const rejectedMatches = matches.filter(
    (match) => match.responseStatus === "REJECTED"
  ).length;

  const statistics = [
    {
      label: "Total Matches",
      value: totalMatches,
      icon: "🤝",
      color: "text-gray-900",
    },
    {
      label: "Pending Responses",
      value: pendingMatches,
      icon: "📋",
      color: "text-orange-600",
    },
    {
      label: "Accepted",
      value: acceptedMatches,
      icon: "❤️",
      color: "text-green-600",
    },
    {
      label: "Rejected",
      value: rejectedMatches,
      icon: "↩️",
      color: "text-gray-600",
    },
  ];

  const filteredMatches =
    filter === "ALL"
      ? matches
      : matches.filter(
          (match) => match.responseStatus === filter
        );

  // ----------------------------------------------------------
  // LOADING STATE
  // ----------------------------------------------------------

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-red-100 border-t-red-600" />

          <p className="mt-5 font-semibold text-gray-700">
            Loading your LifeLink dashboard...
          </p>
        </div>
      </main>
    );
  }

  // ----------------------------------------------------------
  // MAIN DASHBOARD
  // ----------------------------------------------------------

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <Link href="/" className="text-2xl font-extrabold text-red-600">
            ❤️ LifeLink
          </Link>

          <div className="flex flex-wrap items-center gap-5 text-sm font-semibold text-gray-600">
            <Link href="/" className="hover:text-red-600">
              Home
            </Link>

            <Link href="/profile" className="hover:text-red-600">
              My Profile
            </Link>

            <Link href="/inventory" className="hover:text-red-600">
              Inventory
            </Link>

            <button
              type="button"
              onClick={refreshDashboard}
              disabled={refreshing}
              className="text-red-600 hover:text-red-700 disabled:opacity-50"
            >
              {refreshing ? "Refreshing..." : "↻ Refresh"}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-linear-to-br from-red-600 to-rose-500 px-6 py-12 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-red-100">
            Donor Dashboard
          </p>

          <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl">
            Welcome, {profile?.firstName || "Donor"}!
          </h1>

          <p className="mt-3 text-red-50">
            Manage your donor profile, availability and blood donation matches.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* Success */}
        {message && (
          <div
            role="status"
            className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
          >
            {message}
          </div>
        )}

        {/* Donor Profile */}
        {profile ? (
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-red-600">
                  Your donor profile
                </p>

                <h2 className="mt-2 text-2xl font-extrabold text-gray-900">
                  {profile.fullName}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Donor ID: {profile.donorId}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {profile.email}
                </p>
              </div>

              <div
                className={`rounded-full px-4 py-2 text-sm font-bold ${
                  profile.available
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {profile.available ? "Available" : "Not Available"}
              </div>
            </div>

            <div className="mt-7 grid gap-5 border-t border-gray-100 pt-6 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-sm text-gray-500">Blood Group</p>
                <p className="mt-1 text-2xl font-extrabold text-red-600">
                  {profile.bloodGroup}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="mt-1 font-bold text-gray-900">
                  {profile.city}, {profile.state}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Pincode</p>
                <p className="mt-1 font-bold text-gray-900">
                  {profile.pincode || "Not specified"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Date of Birth</p>
                <p className="mt-1 font-bold text-gray-900">
                  {formatDate(profile.dateOfBirth)}
                </p>
              </div>
            </div>

            {/* Availability Toggle */}
            <div className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-gray-50 p-5">
              <div>
                <h3 className="font-bold text-gray-900">
                  Donor Availability
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Control whether you appear as an available donor for matching.
                </p>
              </div>

              <button
                type="button"
                onClick={toggleAvailability}
                disabled={availabilityLoading}
                className={`rounded-xl px-5 py-3 text-sm font-bold text-white transition disabled:opacity-50 ${
                  profile.available
                    ? "bg-gray-700 hover:bg-gray-800"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {availabilityLoading
                  ? "Updating..."
                  : profile.available
                    ? "Mark Unavailable"
                    : "Mark Available"}
              </button>
            </div>
          </section>
        ) : (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <h2 className="font-bold text-amber-900">
              Donor profile not found
            </h2>

            <p className="mt-2 text-sm text-amber-800">
              Please register as a donor before using the donor dashboard.
            </p>

            <Link
              href="/donors"
              className="mt-4 inline-block rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-700"
            >
              Register as Donor →
            </Link>
          </section>
        )}

        {/* Statistics */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {statistics.map((stat) => (
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

              <p className={`mt-4 text-4xl font-extrabold ${stat.color}`}>
                {stat.value}
              </p>
            </article>
          ))}
        </div>

        {/* Quick Actions */}
        <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">
            Quick Actions
          </h2>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/profile"
              className="rounded-xl bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
            >
              My Profile →
            </Link>

            <Link
              href="/matching"
              className="rounded-xl bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
            >
              Find Matches →
            </Link>

            <Link
              href="/inventory"
              className="rounded-xl bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
            >
              Blood Inventory →
            </Link>

            <Link
              href="/"
              className="rounded-xl bg-gray-100 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-200"
            >
              Home →
            </Link>
          </div>
        </section>

        {/* Matching Requests */}
        <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Your Matching Requests
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Actual blood requests matched with your donor profile.
              </p>
            </div>

            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm outline-none focus:border-red-500"
              aria-label="Filter matching requests"
            >
              <option value="ALL">All matches</option>
              <option value="PENDING">Pending</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div className="mt-6 space-y-4">
            {filteredMatches.length > 0 ? (
              filteredMatches.map((match) => (
                <article
                  key={match.id}
                  className="rounded-xl border border-gray-100 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {match.patient}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        Request ID: {match.requestId} · Match ID: {match.id}
                      </p>

                      <p className="mt-2 text-sm text-gray-600">
                        {match.city} · Required blood group: {match.bloodGroup}
                      </p>

                      <p className="mt-1 text-sm text-gray-600">
                        Units required: {match.units}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          urgencyStyles[match.urgency] ||
                          urgencyStyles.NORMAL
                        }`}
                      >
                        {match.urgency}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          match.responseStatus === "ACCEPTED"
                            ? "bg-green-100 text-green-700"
                            : match.responseStatus === "REJECTED"
                              ? "bg-gray-100 text-gray-700"
                              : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {match.responseStatus}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
                    <div>
                      <p className="text-xs text-gray-500">
                        Match score
                      </p>

                      <p className="font-bold text-gray-900">
                        {match.matchScore} / 100
                      </p>
                    </div>

                    {match.responseStatus === "PENDING" ? (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            respondToMatch(match.id, "ACCEPTED")
                          }
                          disabled={processingMatchId === match.id}
                          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                        >
                          {processingMatchId === match.id
                            ? "Processing..."
                            : "Accept"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            respondToMatch(match.id, "REJECTED")
                          }
                          disabled={processingMatchId === match.id}
                          className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm font-semibold text-gray-500">
                        Response recorded: {match.responseStatus}
                      </span>
                    )}
                  </div>

                  <p className="mt-3 text-xs text-gray-400">
                    Matched on: {formatDate(match.matchedAt)}
                  </p>
                </article>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 px-5 py-12 text-center">
                <p className="font-semibold text-gray-700">
                  No matching requests found.
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  New matching requests will appear here when they are
                  discovered for your donor profile.
                </p>
              </div>
            )}
          </div>
        </section>
      </section>

      <footer className="border-t border-gray-100 bg-white px-6 py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} LifeLink. Connecting donors, saving lives.
      </footer>
    </main>
  );
}
