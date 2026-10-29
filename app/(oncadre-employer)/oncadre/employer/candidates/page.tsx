"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CADRE_OPTIONS, NIGERIAN_STATES } from "@/lib/cadreHealth/cadres";
import CandidateCard, { type Candidate } from "./CandidateCard";
import ApproachDialog from "./ApproachDialog";
import ShortlistDialog from "./ShortlistDialog";

/**
 * Candidate search.
 *
 * The page a hospital judges the product on. Three things it does that the old
 * one did not: it searches the whole register rather than the thirty records
 * that happened to have an availability flag, it says what it knows and how
 * firmly, and it never dead-ends. An empty result explains which filter emptied
 * it and offers the count without that filter, because "no professionals match
 * your criteria" against a register of ten thousand doctors reads as an empty
 * database and a hospital does not come back.
 */

interface Facets {
  cadres: { value: string; label: string; count: number }[];
  states: { value: string; count: number }[];
  openToApproach: number;
}

interface SearchResponse {
  candidates: Candidate[];
  total: number;
  page: number;
  totalPages: number;
  facets: Facets;
  employerVerified: boolean;
}

const EMPTY_FILTERS = {
  q: "",
  cadre: "",
  subSpecialty: "",
  state: "",
  minYears: "",
  maxYears: "",
  verifiedOnly: false,
  openOnly: false,
  withCv: false,
};

type Filters = typeof EMPTY_FILTERS;

export default function CandidateSearchPage() {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approaching, setApproaching] = useState<Candidate | null>(null);
  const [shortlisting, setShortlisting] = useState<Candidate | null>(null);
  const [shortlisted, setShortlisted] = useState<Set<string>>(new Set());

  const buildParams = useCallback((f: Filters, p: number) => {
    const params = new URLSearchParams();
    if (f.q) params.set("q", f.q);
    if (f.cadre) params.set("cadre", f.cadre);
    if (f.subSpecialty) params.set("subSpecialty", f.subSpecialty);
    if (f.state) params.set("state", f.state);
    if (f.minYears) params.set("minYears", f.minYears);
    if (f.maxYears) params.set("maxYears", f.maxYears);
    if (f.verifiedOnly) params.set("verifiedOnly", "true");
    if (f.openOnly) params.set("openOnly", "true");
    if (f.withCv) params.set("withCv", "true");
    params.set("page", String(p));
    return params;
  }, []);

  const run = useCallback(
    async (f: Filters, p: number) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/cadre/employer/search?${buildParams(f, p)}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Search failed");
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Search failed");
        setData(null);
      } finally {
        setLoading(false);
      }
    },
    [buildParams],
  );

  // The register is shown on arrival rather than behind a search button. A
  // hospital that lands on an empty page assumes an empty database.
  useEffect(() => {
    run(EMPTY_FILTERS, 1);
  }, [run]);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    setApplied(filters);
    setPage(1);
    run(filters, 1);
  };

  const goToPage = (p: number) => {
    setPage(p);
    run(applied, p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilter = (key: keyof Filters) => {
    const next = { ...applied, [key]: EMPTY_FILTERS[key] };
    setFilters(next);
    setApplied(next);
    setPage(1);
    run(next, 1);
  };

  const clearAll = () => {
    setFilters(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setPage(1);
    run(EMPTY_FILTERS, 1);
  };

  const activeFilters = (Object.keys(applied) as (keyof Filters)[]).filter(
    (k) => applied[k] !== EMPTY_FILTERS[k],
  );

  const inputClass =
    "w-full rounded-xl bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition focus:outline-none focus:ring-2 focus:ring-[#0B3C5D]/20";
  const inputStyle = { border: "1px solid #E8EBF0", minHeight: "44px" };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1
            className="font-bold text-gray-900"
            style={{ fontSize: "clamp(1.4rem, 3vw, 1.75rem)" }}
          >
            Candidates
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Every professional on the CadreHealth register, with what we know about
            each one and where it came from.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/oncadre/employer/candidates/shortlists"
            className="rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:bg-gray-50"
            style={{ border: "1px solid #E8EBF0", color: "#0B3C5D" }}
          >
            Shortlists
          </Link>
          <Link
            href="/oncadre/employer/candidates/approaches"
            className="rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:bg-gray-50"
            style={{ border: "1px solid #E8EBF0", color: "#0B3C5D" }}
          >
            Approaches
          </Link>
        </div>
      </div>

      <form
        onSubmit={submit}
        className="rounded-2xl bg-white p-5 sm:p-6"
        style={{
          border: "1px solid #E8EBF0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)",
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Name, specialty or hospital
            </label>
            <input
              type="text"
              value={filters.q}
              onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
              placeholder="e.g. Adegun, neonatology, LUTH"
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Cadre</label>
            <select
              value={filters.cadre}
              onChange={(e) => setFilters((f) => ({ ...f, cadre: e.target.value }))}
              className={inputClass}
              style={inputStyle}
            >
              <option value="">All cadres</option>
              {(data?.facets.cadres.length
                ? data.facets.cadres.map((c) => ({
                    value: c.value,
                    label: `${c.label} (${c.count.toLocaleString()})`,
                  }))
                : CADRE_OPTIONS.map((c) => ({ value: c.value, label: c.label }))
              ).map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Sub-specialty
            </label>
            <input
              type="text"
              value={filters.subSpecialty}
              onChange={(e) => setFilters((f) => ({ ...f, subSpecialty: e.target.value }))}
              placeholder="e.g. Cardiology"
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">State</label>
            <select
              value={filters.state}
              onChange={(e) => setFilters((f) => ({ ...f, state: e.target.value }))}
              className={inputClass}
              style={inputStyle}
            >
              <option value="">All states</option>
              {(data?.facets.states.length
                ? data.facets.states.map((s) => ({
                    value: s.value,
                    label: `${s.value} (${s.count.toLocaleString()})`,
                  }))
                : NIGERIAN_STATES.map((s) => ({ value: s, label: s }))
              ).map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Min years
              </label>
              <input
                type="number"
                min="0"
                value={filters.minYears}
                onChange={(e) => setFilters((f) => ({ ...f, minYears: e.target.value }))}
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Max years
              </label>
              <input
                type="number"
                min="0"
                value={filters.maxYears}
                onChange={(e) => setFilters((f) => ({ ...f, maxYears: e.target.value }))}
                className={inputClass}
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <Toggle
            label="Licence verified"
            checked={filters.verifiedOnly}
            onChange={(v) => setFilters((f) => ({ ...f, verifiedOnly: v }))}
          />
          <Toggle
            label={`Open to approach${
              data ? ` (${data.facets.openToApproach.toLocaleString()})` : ""
            }`}
            checked={filters.openOnly}
            onChange={(v) => setFilters((f) => ({ ...f, openOnly: v }))}
          />
          <Toggle
            label="Has a CV"
            checked={filters.withCv}
            onChange={(v) => setFilters((f) => ({ ...f, withCv: v }))}
          />
          <button
            type="submit"
            disabled={loading}
            className="ml-auto rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            style={{ background: "#0B3C5D", minHeight: "44px" }}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500">Filtered by</span>
          {activeFilters.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => clearFilter(key)}
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition hover:opacity-80"
              style={{ background: "rgba(11,60,93,0.06)", color: "#0B3C5D" }}
            >
              {FILTER_LABELS[key]}
              {typeof applied[key] === "string" && applied[key] ? `: ${applied[key]}` : ""}
              <span aria-hidden>&times;</span>
            </button>
          ))}
          <button
            type="button"
            onClick={clearAll}
            className="text-[11px] font-medium text-gray-400 underline-offset-2 hover:text-gray-600 hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      {error && (
        <div
          className="rounded-xl px-4 py-3 text-sm text-red-700"
          style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}
        >
          {error}
        </div>
      )}

      {data && !loading && (
        <p className="text-sm text-gray-500">
          <strong className="text-gray-900">{data.total.toLocaleString()}</strong>{" "}
          professional{data.total === 1 ? "" : "s"}
          {data.totalPages > 1 && `, page ${data.page} of ${data.totalPages}`}
        </p>
      )}

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-56 animate-pulse rounded-2xl bg-white"
              style={{ border: "1px solid #E8EBF0" }}
            />
          ))}
        </div>
      )}

      {!loading && data && data.candidates.length === 0 && (
        <EmptyResult activeFilters={activeFilters} onClear={clearFilter} onClearAll={clearAll} />
      )}

      {!loading && data && data.candidates.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.candidates.map((c) => (
              <CandidateCard
                key={c.id}
                candidate={c}
                employerVerified={data.employerVerified}
                shortlisted={shortlisted.has(c.id)}
                onShortlist={setShortlisting}
                onApproach={setApproaching}
              />
            ))}
          </div>

          {data.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => goToPage(page - 1)}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:bg-gray-50 disabled:opacity-40"
                style={{ border: "1px solid #E8EBF0", color: "#0B3C5D" }}
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {page} of {data.totalPages}
              </span>
              <button
                type="button"
                disabled={page >= data.totalPages}
                onClick={() => goToPage(page + 1)}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:bg-gray-50 disabled:opacity-40"
                style={{ border: "1px solid #E8EBF0", color: "#0B3C5D" }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {approaching && (
        <ApproachDialog
          candidate={approaching}
          employerVerified={data?.employerVerified ?? false}
          onClose={() => setApproaching(null)}
        />
      )}
      {shortlisting && (
        <ShortlistDialog
          candidate={shortlisting}
          onClose={() => setShortlisting(null)}
          onAdded={(id) => setShortlisted((s) => new Set(s).add(id))}
        />
      )}
    </div>
  );
}

const FILTER_LABELS: Record<keyof Filters, string> = {
  q: "Search",
  cadre: "Cadre",
  subSpecialty: "Sub-specialty",
  state: "State",
  minYears: "Min years",
  maxYears: "Max years",
  verifiedOnly: "Licence verified",
  openOnly: "Open to approach",
  withCv: "Has a CV",
};

/**
 * An empty result names the filters that could have caused it rather than
 * shrugging. Years of experience is recorded for 233 records out of 10,229 and
 * state for 559, so those two filters empty a search far more often than a
 * hospital would guess, and saying so is more useful than "try broadening".
 */
function EmptyResult({
  activeFilters,
  onClear,
  onClearAll,
}: {
  activeFilters: (keyof Filters)[];
  onClear: (k: keyof Filters) => void;
  onClearAll: () => void;
}) {
  const sparse = activeFilters.filter((f) =>
    ["minYears", "maxYears", "state"].includes(f),
  );

  return (
    <div
      className="rounded-2xl bg-white p-8 text-center sm:p-10"
      style={{ border: "1px solid #E8EBF0" }}
    >
      <p className="font-semibold text-gray-900">Nothing matched all of those filters</p>

      {sparse.length > 0 ? (
        <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
          {sparse.includes("state")
            ? "Location is on file for about one record in twenty, and years of experience for about one in forty. "
            : "Years of experience is on file for about one record in forty. "}
          Filtering on those hides everyone whose record is thinner rather than
          everyone who is wrong for the job.
        </p>
      ) : (
        <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
          Try removing one of the filters below.
        </p>
      )}

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {activeFilters.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => onClear(key)}
            className="rounded-xl px-3.5 py-2 text-xs font-semibold transition hover:opacity-90"
            style={{ background: "rgba(11,60,93,0.06)", color: "#0B3C5D" }}
          >
            Drop {FILTER_LABELS[key].toLowerCase()}
          </button>
        ))}
        <button
          type="button"
          onClick={onClearAll}
          className="rounded-xl px-3.5 py-2 text-xs font-semibold text-white transition hover:opacity-90"
          style={{ background: "#0B3C5D" }}
        >
          Show everyone
        </button>
      </div>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-gray-300 text-[#0B3C5D] focus:ring-[#0B3C5D]"
      />
      {label}
    </label>
  );
}
