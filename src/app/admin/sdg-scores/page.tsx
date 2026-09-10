"use client";

import { useEffect, useMemo, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';

interface Country {
  country_id: number;
  iso3: string;
  country_name: string;
}

interface SDGScore {
  score_id: number;
  country_id: number;
  goal_id: number;
  year: number;
  score: number;
  rank_position: number | null;
  trend: "improving" | "stable" | "declining";

  iso3: string;
  country_name: string;

  goal_number: number;
  goal_name: string;

  indicator_count: number;
}

export default function SDGScoresPage() {

  const [countries, setCountries] = useState<Country[]>([]);
  const [scores, setScores] = useState<SDGScore[]>([]);

  const [selectedCountry, setSelectedCountry] =
    useState("");

  const [selectedYear, setSelectedYear] =
    useState(new Date().getFullYear().toString());

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [calculating, setCalculating] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  // --------------------------------------------------
  // LOAD COUNTRIES
  // --------------------------------------------------

  const loadCountries = async () => {

    try {

      const response =
        await fetch("/api/countries");

      if (!response.ok) {
        throw new Error("Failed to load countries");
      }

      const data = await response.json();

      setCountries(data);

    } catch (err: any) {

      setError(err.message);

    }
  };

  // --------------------------------------------------
  // LOAD SCORES
  // --------------------------------------------------

  const loadScores = async () => {

    try {

      setLoading(true);
      setError("");

      const params =
        new URLSearchParams();

      if (selectedCountry) {
        params.append(
          "country_id",
          selectedCountry
        );
      }

      if (selectedYear) {
        params.append(
          "year",
          selectedYear
        );
      }

      const response =
        await fetch(
          `/api/sdg-scores?${params.toString()}`
        );

      if (!response.ok) {
        throw new Error(
          "Failed to load SDG scores"
        );
      }

      const data =
        await response.json();

      setScores(data);

    } catch (err: any) {

      setError(err.message);

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {

    loadCountries();

  }, []);

  useEffect(() => {

    loadScores();

  }, [
    selectedCountry,
    selectedYear
  ]);

  // --------------------------------------------------
  // CALCULATE SCORES
  // --------------------------------------------------

  const calculateScores = async () => {

    try {

      setCalculating(true);
      setMessage("");
      setError("");

      const response =
        await fetch(
          "/api/sdg-scores/calculate",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              country_id:
                selectedCountry
                  ? Number(selectedCountry)
                  : null,

              year:
                selectedYear
                  ? Number(selectedYear)
                  : null
            })
          }
        );

      const data =
        await response.json();

      if (!response.ok) {

        throw new Error(
          data.error ||
          "Failed to calculate scores"
        );

      }

      setMessage(
        `${data.sdg_scores_generated} SDG scores generated successfully.`
      );

      await loadScores();

    } catch (err: any) {

      setError(err.message);

    } finally {

      setCalculating(false);

    }
  };

  // --------------------------------------------------
  // FILTER
  // --------------------------------------------------

  const filteredScores =
    useMemo(() => {

      const keyword =
        search.toLowerCase().trim();

      if (!keyword) {
        return scores;
      }

      return scores.filter(
        (item) =>
          item.country_name
            .toLowerCase()
            .includes(keyword) ||

          item.iso3
            .toLowerCase()
            .includes(keyword) ||

          item.goal_name
            .toLowerCase()
            .includes(keyword)
      );

    }, [scores, search]);

  // --------------------------------------------------
  // STATISTICS
  // --------------------------------------------------

  const averageScore =
    scores.length > 0
      ? scores.reduce(
          (sum, item) =>
            sum + Number(item.score),
          0
        ) / scores.length
      : 0;

  const improving =
    scores.filter(
      item => item.trend === "improving"
    ).length;

  const stable =
    scores.filter(
      item => item.trend === "stable"
    ).length;

  const declining =
    scores.filter(
      item => item.trend === "declining"
    ).length;

  // --------------------------------------------------
  // SCORE BADGE
  // --------------------------------------------------

  const getScoreClass =
    (score: number) => {

      if (score >= 80)
        return "bg-success";

      if (score >= 60)
        return "bg-primary";

      if (score >= 40)
        return "bg-warning text-dark";

      return "bg-danger";
    };

  // --------------------------------------------------
  // TREND BADGE
  // --------------------------------------------------

  const getTrendBadge =
    (trend: string) => {

      if (trend === "improving") {

        return (
          <span className="badge bg-success">
            ↑ Improving
          </span>
        );

      }

      if (trend === "declining") {

        return (
          <span className="badge bg-danger">
            ↓ Declining
          </span>
        );

      }

      return (
        <span className="badge bg-secondary">
          → Stable
        </span>
      );
    };

  return (

    <div className="container-fluid py-4">

      {/* ------------------------------------------- */}
      {/* HEADER */}
      {/* ------------------------------------------- */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <h2 className="fw-bold mb-1">
            SDG Scores
          </h2>

          <p className="text-muted mb-0">
            Calculate and monitor Sustainable
            Development Goal performance.
          </p>

        </div>

        <button
          className="btn btn-primary"
          onClick={calculateScores}
          disabled={calculating}
        >

          {calculating ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
              />
              Calculating...
            </>
          ) : (
            <>
              <span className="me-2">
                ↻
              </span>
              Calculate Scores
            </>
          )}

        </button>

      </div>


      {/* ------------------------------------------- */}
      {/* ALERTS */}
      {/* ------------------------------------------- */}

      {message && (

        <div
          className="alert alert-success alert-dismissible"
        >

          {message}

          <button
            className="btn-close"
            onClick={() =>
              setMessage("")
            }
          />

        </div>

      )}

      {error && (

        <div
          className="alert alert-danger alert-dismissible"
        >

          {error}

          <button
            className="btn-close"
            onClick={() =>
              setError("")
            }
          />

        </div>

      )}


      {/* ------------------------------------------- */}
      {/* FILTER CARD */}
      {/* ------------------------------------------- */}

      <div className="card border-0 shadow-sm mb-4">

        <div className="card-body">

          <div className="row g-3">

            {/* COUNTRY */}

            <div className="col-md-4">

              <label className="form-label fw-semibold">
                Country
              </label>

              <select
                className="form-select"
                value={selectedCountry}
                onChange={(e) =>
                  setSelectedCountry(
                    e.target.value
                  )
                }
              >

                <option value="">
                  All Countries
                </option>

                {countries.map(
                  (country) => (

                    <option
                      key={
                        country.country_id
                      }
                      value={
                        country.country_id
                      }
                    >

                      {country.iso3} -
                      {" "}
                      {country.country_name}

                    </option>

                  )
                )}

              </select>

            </div>


            {/* YEAR */}

            <div className="col-md-3">

              <label className="form-label fw-semibold">
                Year
              </label>

              <select
                className="form-select"
                value={selectedYear}
                onChange={(e) =>
                  setSelectedYear(
                    e.target.value
                  )
                }
              >

                {Array.from(
                  { length: 11 },
                  (_, index) =>
                    new Date().getFullYear()
                    - index
                ).map(year => (

                  <option
                    key={year}
                    value={year}
                  >
                    {year}
                  </option>

                ))}

              </select>

            </div>


            {/* SEARCH */}

            <div className="col-md-5">

              <label className="form-label fw-semibold">
                Search
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Search country or SDG..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
              />

            </div>

          </div>

        </div>

      </div>


      {/* ------------------------------------------- */}
      {/* STATISTICS */}
      {/* ------------------------------------------- */}

      <div className="row g-3 mb-4">

        <div className="col-md-3">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <div className="text-muted small">
                Total Scores
              </div>

              <div className="fs-3 fw-bold">
                {scores.length}
              </div>

            </div>

          </div>

        </div>


        <div className="col-md-3">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <div className="text-muted small">
                Average Score
              </div>

              <div className="fs-3 fw-bold">
                {averageScore.toFixed(2)}
              </div>

            </div>

          </div>

        </div>


        <div className="col-md-2">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <div className="text-muted small">
                Improving
              </div>

              <div className="fs-3 fw-bold text-success">
                {improving}
              </div>

            </div>

          </div>

        </div>


        <div className="col-md-2">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <div className="text-muted small">
                Stable
              </div>

              <div className="fs-3 fw-bold text-secondary">
                {stable}
              </div>

            </div>

          </div>

        </div>


        <div className="col-md-2">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <div className="text-muted small">
                Declining
              </div>

              <div className="fs-3 fw-bold text-danger">
                {declining}
              </div>

            </div>

          </div>

        </div>

      </div>


      {/* ------------------------------------------- */}
      {/* TABLE */}
      {/* ------------------------------------------- */}

      <div className="card border-0 shadow-sm">

        <div className="card-body p-0">

          <div className="table-responsive">

            <table className="table table-hover align-middle mb-0">

              <thead className="table-light">

                <tr>

                  <th className="px-4">
                    Country
                  </th>

                  <th>
                    SDG
                  </th>

                  <th>
                    Score
                  </th>

                  <th>
                    Indicators
                  </th>

                  <th>
                    Trend
                  </th>

                  <th>
                    Year
                  </th>

                </tr>

              </thead>

              <tbody>

                {loading ? (

                  <tr>

                    <td
                      colSpan={6}
                      className="text-center py-5"
                    >

                      <div className="spinner-border text-primary" />

                      <div className="text-muted mt-2">
                        Loading scores...
                      </div>

                    </td>

                  </tr>

                ) : filteredScores.length === 0 ? (

                  <tr>

                    <td
                      colSpan={6}
                      className="text-center py-5"
                    >

                      <div className="fs-1 mb-2">
                        📊
                      </div>

                      <h6>
                        No SDG scores found
                      </h6>

                      <p className="text-muted mb-0">
                        Add indicator values and
                        calculate scores first.
                      </p>

                    </td>

                  </tr>

                ) : (

                  filteredScores.map(
                    (item) => (

                      <tr
                        key={
                          item.score_id
                        }
                      >

                        <td className="px-4">

                          <div className="fw-semibold">
                            {item.country_name}
                          </div>

                          <small className="text-muted">
                            {item.iso3}
                          </small>

                        </td>


                        <td>

                          <span className="badge bg-primary me-2">
                            SDG {item.goal_number}
                          </span>

                          <span>
                            {item.goal_name}
                          </span>

                        </td>


                        <td>

                          <span
                            className={`badge ${getScoreClass(
                              Number(item.score)
                            )} fs-6`}
                          >

                            {Number(
                              item.score
                            ).toFixed(2)}

                          </span>

                        </td>


                        <td>

                          <span className="text-muted">
                            {item.indicator_count}
                            {" "}
                            indicators
                          </span>

                        </td>


                        <td>
                          {getTrendBadge(
                            item.trend
                          )}
                        </td>


                        <td>
                          {item.year}
                        </td>

                      </tr>

                    )
                  )

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>


      {/* ------------------------------------------- */}
      {/* EXPLANATION */}
      {/* ------------------------------------------- */}

      <div className="alert alert-info mt-4">

        <strong>
          How scores are calculated:
        </strong>

        <div className="mt-2">

          Each indicator is normalized against
          its target value. Indicator scores are
          then averaged to produce the SDG score
          for each country and year.

        </div>

      </div>

    </div>
  );
}