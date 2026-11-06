
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";

function getArray(response) {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.matches)) return response.matches;
  if (Array.isArray(response?.data?.matches)) {
    return response.data.matches;
  }
  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }
  return [];
}

function normalizeMatch(match, index) {
  const firstName =
    match.donor_first_name ||
    match.first_name ||
    "";

  const lastName =
    match.donor_last_name ||
    match.last_name ||
    "";

  const name =
    match.donor_name ||
    match.name ||
    `${firstName} ${lastName}`.trim();

  return {
    id: match.match_id || match.id || index,
    donorId: match.donor_id || match.donorId || "Not available",
    name: name || "Donor",
    bloodGroup:
      match.donor_blood_group ||
      match.blood_group ||
      match.bloodGroup ||
      "Not specified",
    city: match.donor_city || match.city || "Not specified",
    state: match.donor_state || match.state || "",
    available:
      match.availability_status === "AVAILABLE" ||
      match.availability_status === "true" ||
      match.available === true ||
      match.available === 1,
    score: Number(match.match_score || match.score || 0),
    status: String(
      match.response_status ||
      match.match_status ||
      match.status ||
      "SUGGESTED"
    ).toUpperCase(),
    matchedAt: match.matched_at || match.created_at || null,
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

export default function MatchingPage() {
  const [requestId, setRequestId] = useState("");
  const [matches, setMatches] = useState([]);
  const [discoveryInfo, setDiscoveryInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const loadMatches = useCallback(async (id, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      // Discover actual donors through the backend
      const discoveryResponse = await apiRequest(
        `/matches/discover/${id}`,
        {
          method: "POST",
        }
      );

      setDiscoveryInfo(discoveryResponse);

      // Retrieve the actual matching records for this request
      const matchesResponse = await apiRequest(
        `/requests/${id}/matches`
      );

      const matchData = getArray(matchesResponse);

      setMatches(matchData.map(normalizeMatch));
    } catch (err) {
      setError(
        err.message || "Unable to discover matching donors."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Read requestId from the URL and load actual backend matches
  useEffect(() => {
    let active = true;

    async function initializeMatching() {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("requestId");

      if (!id || !/^\d+$/.test(id) || Number(id) <= 0) {
        setError(
          "A valid blood request ID is required. Open this page from My Requests."
        );
        setLoading(false);
        return;
      }

      if (active) {
        setRequestId(id);
      }

      await loadMatches(id);
    }

    initializeMatching();

    return () => {
      active = false;
    };
  }, [loadMatches]);

  const totalMatches = matches.length;

  const acceptedMatches = matches.filter(
    (match) => match.status === "ACCEPTED"
  ).length;

  const pendingMatches = matches.filter(
    (match) =>
      match.status === "PENDING" ||
      match.status === "SUGGESTED" ||
      match.status === "MATCHED"
  ).length;

  const rejectedMatches = matches.filter(
    (match) => match.status === "REJECTED"
  ).length;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-2xl font-extrabold text-red-600"
          >
            ❤️ LifeLink
          </Link>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/my-requests"
              className="text-sm font-semibold text-gray-600 hover:text-red-600"
            >
              My Requests
            </Link>

            <Link
              href="/"
              className="text-sm font-semibold text-gray-600 hover:text-red-600"
            >
              Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-linear-to-br from-red-600 to-rose-500 px-6 py-12 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <span className="rounded-full bg-white/20 px-4 py-2 text-sm font-medium">
            Smart Donor Discovery
          </span>

          <h1 className="mt-5 text-4xl font-extrabold sm:text-5xl">
            Matching Donors
          </h1>

          <p className="mt-3 text-red-50">
            Discover real donor matches for your blood request.
          </p>

          {requestId && (
            <p className="mt-3 text-sm font-semibold text-white">
              Blood Request ID: #{requestId}
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-red-100 border-t-red-600" />

            <h2 className="mt-5 font-bold text-gray-800">
              Discovering donors...
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Connecting to the LifeLink matching backend.
            </p>
          </div>
        )}

        {!loading && requestId && (
          <>
            {/* Statistics */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">
                  Total Matches
                </p>
                <p className="mt-2 text-3xl font-extrabold text-gray-900">
                  {totalMatches}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">
                  Pending
                </p>
                <p className="mt-2 text-3xl font-extrabold text-orange-600">
                  {pendingMatches}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">
                  Accepted
                </p>
                <p className="mt-2 text-3xl font-extrabold text-green-600">
                  {acceptedMatches}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">
                  Rejected
                </p>
                <p className="mt-2 text-3xl font-extrabold text-gray-600">
                  {rejectedMatches}
                </p>
              </div>
            </div>

            {/* Discovery information */}
            {discoveryInfo && (
              <div className="mt-6 rounded-2xl border border-green-100 bg-green-50 p-5">
                <h2 className="font-bold text-green-800">
                  Donor discovery completed
                </h2>

                <p className="mt-2 text-sm text-green-700">
                  {discoveryInfo.message ||
                    "The backend donor discovery process has completed."}
                </p>

                {discoveryInfo.totalGraphCandidates !== undefined && (
                  <p className="mt-1 text-sm text-green-700">
                    Graph candidates: {discoveryInfo.totalGraphCandidates}
                  </p>
                )}

                {discoveryInfo.validCandidates !== undefined && (
                  <p className="mt-1 text-sm text-green-700">
                    Valid candidates: {discoveryInfo.validCandidates}
                  </p>
                )}
              </div>
            )}

            {/* Results heading */}
            <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900">
                  Actual Matching Donors
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Matching records retrieved from your backend.
                </p>
              </div>

              <button
                type="button"
                onClick={() => loadMatches(requestId, true)}
                disabled={refreshing}
                className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                {refreshing ? "Refreshing..." : "↻ Refresh Matches"}
              </button>
            </div>

            {/* Match cards */}
            {matches.length > 0 ? (
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {matches.map((match) => (
                  <article
                    key={match.id}
                    className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-xl">
                            👤
                          </div>

                          <div>
                            <h3 className="font-bold text-gray-900">
                              {match.name}
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                              Donor ID: {match.donorId}
                            </p>
                          </div>
                        </div>
                      </div>

                      <span className="rounded-xl bg-red-50 px-3 py-2 font-extrabold text-red-600">
                        {match.bloodGroup}
                      </span>
                    </div>

                    <div className="mt-5 space-y-2 text-sm text-gray-600">
                      <p>
                        <strong>Location:</strong> {match.city}
                        {match.state ? `, ${match.state}` : ""}
                      </p>

                      <p>
                        <strong>Match score:</strong> {match.score}
                      </p>

                      <p>
                        <strong>Match status:</strong>{" "}
                        <span
                          className={`font-bold ${
                            match.status === "ACCEPTED"
                              ? "text-green-600"
                              : match.status === "REJECTED"
                                ? "text-red-600"
                                : "text-orange-600"
                          }`}
                        >
                          {match.status}
                        </span>
                      </p>

                      <p>
                        <strong>Matched on:</strong>{" "}
                        {formatDate(match.matchedAt)}
                      </p>
                    </div>

                    <div className="mt-5 border-t border-gray-100 pt-4">
                      <span className="text-xs font-semibold text-green-700">
                        <span className="mr-2 inline-block h-2 w-2 rounded-full bg-green-500" />
                        Backend matching record
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
                <div className="text-4xl">🔎</div>

                <h3 className="mt-4 text-lg font-bold text-gray-900">
                  No matching records found
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  The backend did not return any matching records for this
                  request.
                </p>
              </div>
            )}
          </>
        )}

        {/* Important note */}
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
          <strong>Important:</strong> These are software-generated matching
          suggestions. Actual blood transfusion compatibility and donor
          eligibility must be confirmed by qualified medical professionals.
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/my-requests"
            className="inline-block rounded-xl bg-red-600 px-6 py-3 font-bold text-white transition hover:bg-red-700"
          >
            ← Back to My Requests
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-100 bg-white px-6 py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} LifeLink. Connecting donors, saving lives.
      </footer>
    </main>
  );
}
