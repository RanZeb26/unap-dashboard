"use client";

import { useEffect, useMemo, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
interface Score {
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
}

interface Country {
  country_id: number;
  iso3: string;
  country_name: string;
}

interface SDG {
  goal_id: number;
  goal_number: number;
  goal_name: string;
}

interface FormData {
  country_id: string;
  goal_id: string;
  year: string;
  score: string;
}

export default function ScoresAdminPage() {

  const [scores, setScores] = useState<Score[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [sdgs, setSdgs] = useState<SDG[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingScore, setEditingScore] =
    useState<Score | null>(null);

  const [form, setForm] = useState<FormData>({
    country_id: "",
    goal_id: "",
    year: new Date().getFullYear().toString(),
    score: "",
  });


  // =====================================================
  // LOAD SCORES
  // =====================================================

  const loadScores = async () => {

    try {

      setLoading(true);

      const response = await fetch(
        "/api/scores",
        {
          cache: "no-store"
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load scores");
      }

      const data = await response.json();

      setScores(data);

    } catch (error) {

      console.error(error);

      alert("Unable to load scores.");

    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // LOAD COUNTRIES
  // =====================================================

  const loadCountries = async () => {

    try {

      const response = await fetch(
        "/api/countries",
        {
          cache: "no-store"
        }
      );

      const data = await response.json();

      setCountries(data);

    } catch (error) {

      console.error(error);

    }

  };


  // =====================================================
  // LOAD SDGs
  // =====================================================

  const loadSDGs = async () => {

    try {

      const response = await fetch(
        "/api/sdgs",
        {
          cache: "no-store"
        }
      );

      const data = await response.json();

      setSdgs(data);

    } catch (error) {

      console.error(error);

    }

  };


  useEffect(() => {

    loadScores();
    loadCountries();
    loadSDGs();

  }, []);


  // =====================================================
  // FILTER
  // =====================================================

  const filteredScores = useMemo(() => {

    return scores.filter((item) => {

      const searchValue =
        search.toLowerCase().trim();

      const matchesSearch =
        item.country_name
          .toLowerCase()
          .includes(searchValue) ||

        item.iso3
          .toLowerCase()
          .includes(searchValue) ||

        item.goal_name
          .toLowerCase()
          .includes(searchValue);

      const matchesYear =
        !yearFilter ||
        String(item.year) === yearFilter;

      const matchesCountry =
        !countryFilter ||
        String(item.country_id) === countryFilter;

      return (
        matchesSearch &&
        matchesYear &&
        matchesCountry
      );

    });

  }, [
    scores,
    search,
    yearFilter,
    countryFilter
  ]);


  // =====================================================
  // OPEN ADD
  // =====================================================

  const openAddModal = () => {

    setEditingScore(null);

    setForm({
      country_id: "",
      goal_id: "",
      year: new Date()
        .getFullYear()
        .toString(),
      score: "",
    });

    setShowModal(true);

  };


  // =====================================================
  // OPEN EDIT
  // =====================================================

  const openEditModal = (score: Score) => {

    setEditingScore(score);

    setForm({
      country_id: String(score.country_id),
      goal_id: String(score.goal_id),
      year: String(score.year),
      score: String(score.score),
    });

    setShowModal(true);

  };


  // =====================================================
  // CLOSE
  // =====================================================

  const closeModal = () => {

    if (saving) return;

    setShowModal(false);
    setEditingScore(null);

  };


  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {

    const {
      name,
      value
    } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));

  };


  // =====================================================
  // SAVE
  // =====================================================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    if (!form.country_id) {
      alert("Please select a country.");
      return;
    }

    if (!form.goal_id) {
      alert("Please select an SDG goal.");
      return;
    }

    if (!form.year) {
      alert("Please enter a year.");
      return;
    }

    const numericScore =
      Number(form.score);

    if (
      Number.isNaN(numericScore) ||
      numericScore < 0 ||
      numericScore > 100
    ) {

      alert(
        "Score must be between 0 and 100."
      );

      return;

    }

    try {

      setSaving(true);

      const isEdit =
        Boolean(editingScore);

      const url = isEdit
        ? `/api/scores/${editingScore?.score_id}`
        : "/api/scores";

      const response = await fetch(
        url,
        {
          method: isEdit
            ? "PUT"
            : "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            country_id:
              Number(form.country_id),

            goal_id:
              Number(form.goal_id),

            year:
              Number(form.year),

            score:
              numericScore
          })
        }
      );

      const result =
        await response.json();

      if (!response.ok) {

        throw new Error(
          result.error ||
          result.message ||
          "Failed to save score"
        );

      }

      closeModal();

      await loadScores();

    } catch (error: any) {

      console.error(error);

      alert(
        error.message ||
        "Unable to save score."
      );

    } finally {

      setSaving(false);

    }

  };


  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async (
    score: Score
  ) => {

    const confirmed =
      window.confirm(
        `Delete ${score.country_name} - SDG ${score.goal_number} score?`
      );

    if (!confirmed) return;

    try {

      const response =
        await fetch(
          `/api/scores/${score.score_id}`,
          {
            method: "DELETE"
          }
        );

      const result =
        await response.json();

      if (!response.ok) {

        throw new Error(
          result.error ||
          result.message
        );

      }

      await loadScores();

    } catch (error: any) {

      console.error(error);

      alert(
        error.message ||
        "Unable to delete score."
      );

    }

  };


  // =====================================================
  // TREND BADGE
  // =====================================================

  const trendBadge = (
    trend: string
  ) => {

    if (trend === "improving") {

      return (
        <span className="badge bg-success-subtle text-success">
          ↑ Improving
        </span>
      );

    }

    if (trend === "declining") {

      return (
        <span className="badge bg-danger-subtle text-danger">
          ↓ Declining
        </span>
      );

    }

    return (
      <span className="badge bg-secondary-subtle text-secondary">
        → Stable
      </span>
    );

  };


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div
      className="container-fluid py-4"
      style={{
        background: "#f5f7fa",
        minHeight: "100vh"
      }}
    >

      {/* HEADER */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <div className="text-muted small">
            SDG TRACKER / ADMIN
          </div>

          <h2 className="fw-bold mb-1">
            SDG Scores
          </h2>

          <p className="text-muted mb-0">
            Manage country performance for
            each Sustainable Development Goal.
          </p>

        </div>

        <button
          className="btn btn-primary px-4"
          onClick={openAddModal}
        >
          + Add Score
        </button>

      </div>


      {/* STATISTICS */}

      <div className="row g-3 mb-4">

        <div className="col-md-4">

          <div className="card border-0 shadow-sm">

            <div className="card-body">

              <div className="text-muted small">
                TOTAL SCORES
              </div>

              <div className="fs-2 fw-bold">
                {scores.length}
              </div>

            </div>

          </div>

        </div>


        <div className="col-md-4">

          <div className="card border-0 shadow-sm">

            <div className="card-body">

              <div className="text-muted small">
                COUNTRIES
              </div>

              <div className="fs-2 fw-bold">
                {countries.length}
              </div>

            </div>

          </div>

        </div>


        <div className="col-md-4">

          <div className="card border-0 shadow-sm">

            <div className="card-body">

              <div className="text-muted small">
                SDG GOALS
              </div>

              <div className="fs-2 fw-bold">
                {sdgs.length}
              </div>

            </div>

          </div>

        </div>

      </div>


      {/* TABLE */}

      <div className="card border-0 shadow-sm">

        <div className="card-body p-0">

          {/* FILTERS */}

          <div className="p-3 border-bottom">

            <div className="row g-2">

              <div className="col-lg-5">

                <input
                  type="text"
                  className="form-control"
                  placeholder="Search country, ISO or SDG..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                />

              </div>


              <div className="col-lg-3">

                <select
                  className="form-select"
                  value={countryFilter}
                  onChange={(e) =>
                    setCountryFilter(
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
                        {country.country_name}
                      </option>

                    )
                  )}

                </select>

              </div>


              <div className="col-lg-2">

                <input
                  type="number"
                  className="form-control"
                  placeholder="Year"
                  value={yearFilter}
                  onChange={(e) =>
                    setYearFilter(
                      e.target.value
                    )
                  }
                />

              </div>


              <div className="col-lg-2">

                <button
                  className="btn btn-light w-100"
                  onClick={() => {

                    setSearch("");
                    setCountryFilter("");
                    setYearFilter("");

                  }}
                >
                  Clear
                </button>

              </div>

            </div>

          </div>


          {/* TABLE */}

          {loading ? (

            <div className="text-center py-5">

              <div
                className="spinner-border text-primary"
              />

              <div className="text-muted mt-3">
                Loading scores...
              </div>

            </div>

          ) : filteredScores.length === 0 ? (

            <div className="text-center py-5">

              <div
                style={{
                  fontSize: "42px"
                }}
              >
                📊
              </div>

              <h5 className="mt-3">
                No scores found
              </h5>

              <p className="text-muted">
                Add an SDG score to get started.
              </p>

            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead
                  style={{
                    background: "#f8fafc"
                  }}
                >

                  <tr>

                    <th className="px-4">
                      Rank
                    </th>

                    <th>
                      Country
                    </th>

                    <th>
                      SDG
                    </th>

                    <th>
                      Year
                    </th>

                    <th>
                      Score
                    </th>

                    <th>
                      Trend
                    </th>

                    <th className="text-end px-4">
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredScores.map(
                    (item) => (

                      <tr
                        key={
                          item.score_id
                        }
                      >

                        <td className="px-4">

                          <span className="fw-bold">
                            {item.rank_position || "—"}
                          </span>

                        </td>


                        <td>

                          <div className="fw-semibold">
                            {item.country_name}
                          </div>

                          <small className="text-muted">
                            {item.iso3}
                          </small>

                        </td>


                        <td>

                          <div className="fw-semibold">

                            SDG{" "}
                            {item.goal_number}

                          </div>

                          <small className="text-muted">

                            {item.goal_name}

                          </small>

                        </td>


                        <td>
                          {item.year}
                        </td>


                        <td>

                          <span
                            className="fw-bold"
                            style={{
                              fontSize:
                                "1.05rem"
                            }}
                          >
                            {Number(
                              item.score
                            ).toFixed(1)}
                          </span>

                        </td>


                        <td>
                          {trendBadge(
                            item.trend
                          )}
                        </td>


                        <td className="text-end px-4">

                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() =>
                              openEditModal(
                                item
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                              handleDelete(
                                item
                              )
                            }
                          >
                            Delete
                          </button>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>


      {/* =================================================
          MODAL
      ================================================= */}

      {showModal && (

        <div
          className="modal d-block"
          style={{
            background:
              "rgba(0,0,0,.45)"
          }}
        >

          <div className="modal-dialog modal-dialog-centered">

            <div className="modal-content border-0 shadow">

              <div className="modal-header">

                <div>

                  <h5 className="modal-title fw-bold">
                    {editingScore
                      ? "Edit SDG Score"
                      : "Add SDG Score"}
                  </h5>

                  <small className="text-muted">
                    Enter the country performance data.
                  </small>

                </div>

                <button
                  className="btn-close"
                  onClick={closeModal}
                />

              </div>


              <form onSubmit={handleSubmit}>

                <div className="modal-body">

                  {/* COUNTRY */}

                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      Country
                    </label>

                    <select
                      name="country_id"
                      className="form-select"
                      value={form.country_id}
                      onChange={handleChange}
                      required
                    >

                      <option value="">
                        Select country
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
                            {country.country_name}
                          </option>

                        )
                      )}

                    </select>

                  </div>


                  {/* SDG */}

                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      SDG Goal
                    </label>

                    <select
                      name="goal_id"
                      className="form-select"
                      value={form.goal_id}
                      onChange={handleChange}
                      required
                    >

                      <option value="">
                        Select SDG goal
                      </option>

                      {sdgs.map(
                        (sdg) => (

                          <option
                            key={
                              sdg.goal_id
                            }
                            value={
                              sdg.goal_id
                            }
                          >

                            SDG{" "}
                            {sdg.goal_number}
                            {" - "}
                            {sdg.goal_name}

                          </option>

                        )
                      )}

                    </select>

                  </div>


                  <div className="row g-3">

                    {/* YEAR */}

                    <div className="col-md-6">

                      <label className="form-label fw-semibold">
                        Year
                      </label>

                      <input
                        type="number"
                        name="year"
                        className="form-control"
                        min="2000"
                        max="2100"
                        value={form.year}
                        onChange={handleChange}
                        required
                      />

                    </div>


                    {/* SCORE */}

                    <div className="col-md-6">

                      <label className="form-label fw-semibold">
                        Score
                      </label>

                      <input
                        type="number"
                        name="score"
                        className="form-control"
                        min="0"
                        max="100"
                        step="0.01"
                        placeholder="75.50"
                        value={form.score}
                        onChange={handleChange}
                        required
                      />

                      <div className="form-text">
                        Enter a value from 0 to 100.
                      </div>

                    </div>

                  </div>


                  {/* AUTOMATIC INFO */}

                  <div
                    className="alert alert-light border mt-4 mb-0"
                  >

                    <div className="small fw-semibold">
                      Automatically calculated
                    </div>

                    <div className="small text-muted mt-1">
                      Rank position and performance
                      trend will be calculated by
                      the system.
                    </div>

                  </div>

                </div>


                <div className="modal-footer">

                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={closeModal}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary px-4"
                    disabled={saving}
                  >

                    {saving ? (

                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                        />

                        Saving...
                      </>

                    ) : (

                      editingScore
                        ? "Update Score"
                        : "Save Score"

                    )}

                  </button>

                </div>

              </form>

            </div>

          </div>

        </div>

      )}

    </div>

  );
}