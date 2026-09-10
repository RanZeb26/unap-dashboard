"use client";

import { useEffect, useMemo, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';

interface Indicator {
  indicator_id: number;
  goal_id: number;
  indicator_code: string;
  indicator_name: string;
  description: string | null;
  unit: string | null;
  direction: "higher_better" | "lower_better";
  created_at: string;

  goal_number: number;
  goal_name: string;
}

interface SDG {
  goal_id: number;
  goal_number: number;
  goal_name: string;
}

interface FormData {
  goal_id: string;
  indicator_code: string;
  indicator_name: string;
  description: string;
  unit: string;
  direction: "higher_better" | "lower_better";
}

export default function IndicatorsAdminPage() {

  const [indicators, setIndicators] =
    useState<Indicator[]>([]);

  const [sdgs, setSdgs] =
    useState<SDG[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [goalFilter, setGoalFilter] =
    useState("");

  const [directionFilter, setDirectionFilter] =
    useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [editingIndicator, setEditingIndicator] =
    useState<Indicator | null>(null);

  const [form, setForm] =
    useState<FormData>({
      goal_id: "",
      indicator_code: "",
      indicator_name: "",
      description: "",
      unit: "",
      direction: "higher_better",
    });


  // =====================================================
  // LOAD INDICATORS
  // =====================================================

  const loadIndicators = async () => {

    try {

      setLoading(true);

      const response = await fetch(
        "/api/indicators",
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load indicators"
        );
      }

      const data =
        await response.json();

      setIndicators(data);

    } catch (error) {

      console.error(error);

      alert(
        "Unable to load indicators."
      );

    } finally {

      setLoading(false);

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
          cache: "no-store",
        }
      );

      const data =
        await response.json();

      setSdgs(data);

    } catch (error) {

      console.error(error);

    }

  };


  useEffect(() => {

    loadIndicators();
    loadSDGs();

  }, []);


  // =====================================================
  // FILTER
  // =====================================================

  const filteredIndicators =
    useMemo(() => {

      const value =
        search
          .toLowerCase()
          .trim();

      return indicators.filter(
        (item) => {

          const matchesSearch =
            !value ||

            item.indicator_code
              .toLowerCase()
              .includes(value) ||

            item.indicator_name
              .toLowerCase()
              .includes(value) ||

            item.goal_name
              .toLowerCase()
              .includes(value);

          const matchesGoal =
            !goalFilter ||
            String(item.goal_id) ===
              goalFilter;

          const matchesDirection =
            !directionFilter ||
            item.direction ===
              directionFilter;

          return (
            matchesSearch &&
            matchesGoal &&
            matchesDirection
          );

        }
      );

    }, [
      indicators,
      search,
      goalFilter,
      directionFilter,
    ]);


  // =====================================================
  // ADD
  // =====================================================

  const openAddModal = () => {

    setEditingIndicator(null);

    setForm({
      goal_id: "",
      indicator_code: "",
      indicator_name: "",
      description: "",
      unit: "",
      direction: "higher_better",
    });

    setShowModal(true);

  };


  // =====================================================
  // EDIT
  // =====================================================

  const openEditModal = (
    indicator: Indicator
  ) => {

    setEditingIndicator(
      indicator
    );

    setForm({
      goal_id:
        String(indicator.goal_id),

      indicator_code:
        indicator.indicator_code,

      indicator_name:
        indicator.indicator_name,

      description:
        indicator.description || "",

      unit:
        indicator.unit || "",

      direction:
        indicator.direction,
    });

    setShowModal(true);

  };


  // =====================================================
  // CLOSE
  // =====================================================

  const closeModal = () => {

    if (saving) return;

    setShowModal(false);

    setEditingIndicator(null);

  };


  // =====================================================
  // CHANGE
  // =====================================================

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement |
      HTMLSelectElement
    >
  ) => {

    const {
      name,
      value,
    } = e.target;

    setForm(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );

  };


  // =====================================================
  // SAVE
  // =====================================================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    if (!form.goal_id) {

      alert(
        "Please select an SDG goal."
      );

      return;

    }

    if (!form.indicator_code.trim()) {

      alert(
        "Please enter an indicator code."
      );

      return;

    }

    if (!form.indicator_name.trim()) {

      alert(
        "Please enter an indicator name."
      );

      return;

    }

    try {

      setSaving(true);

      const isEdit =
        Boolean(editingIndicator);

      const url = isEdit
        ? `/api/indicators/${editingIndicator?.indicator_id}`
        : "/api/indicators";

      const response =
        await fetch(
          url,
          {
            method: isEdit
              ? "PUT"
              : "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({

              goal_id:
                Number(form.goal_id),

              indicator_code:
                form.indicator_code.trim(),

              indicator_name:
                form.indicator_name.trim(),

              description:
                form.description.trim(),

              unit:
                form.unit.trim(),

              direction:
                form.direction,

            }),
          }
        );

      const result =
        await response.json();

      if (!response.ok) {

        throw new Error(
          result.error ||
          result.message ||
          "Failed to save indicator"
        );

      }

      closeModal();

      await loadIndicators();

    } catch (error: any) {

      console.error(error);

      alert(
        error.message ||
        "Unable to save indicator."
      );

    } finally {

      setSaving(false);

    }

  };


  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async (
    indicator: Indicator
  ) => {

    const confirmed =
      window.confirm(
        `Delete ${indicator.indicator_code} - ${indicator.indicator_name}?`
      );

    if (!confirmed) return;

    try {

      const response =
        await fetch(
          `/api/indicators/${indicator.indicator_id}`,
          {
            method: "DELETE",
          }
        );

      const result =
        await response.json();

      if (!response.ok) {

        throw new Error(
          result.error ||
          result.message ||
          "Failed to delete indicator"
        );

      }

      await loadIndicators();

    } catch (error: any) {

      console.error(error);

      alert(
        error.message ||
        "Unable to delete indicator."
      );

    }

  };


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fa",
      }}
    >

      {/* HEADER */}

      <div className="bg-white border-bottom">

        <div
          className="container-fluid px-4 py-4"
        >

          <div
            className="d-flex justify-content-between align-items-center"
          >

            <div>

              <div
                className="text-muted small mb-1"
              >
                SDG TRACKER / ADMIN
              </div>

              <h2 className="fw-bold mb-1">
                Indicators
              </h2>

              <p className="text-muted mb-0">
                Manage measurable indicators
                for each SDG.
              </p>

            </div>

            <button
              className="btn btn-primary px-4"
              onClick={openAddModal}
            >
              + Add Indicator
            </button>

          </div>

        </div>

      </div>


      {/* CONTENT */}

      <div
        className="container-fluid px-4 py-4"
      >

        {/* STATISTICS */}

        <div className="row g-3 mb-4">

          <div className="col-md-4">

            <div
              className="card border-0 shadow-sm"
            >

              <div className="card-body">

                <div className="text-muted small">
                  TOTAL INDICATORS
                </div>

                <div className="fs-2 fw-bold">
                  {indicators.length}
                </div>

              </div>

            </div>

          </div>


          <div className="col-md-4">

            <div
              className="card border-0 shadow-sm"
            >

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


          <div className="col-md-4">

            <div
              className="card border-0 shadow-sm"
            >

              <div className="card-body">

                <div className="text-muted small">
                  DISPLAYED
                </div>

                <div className="fs-2 fw-bold">
                  {
                    filteredIndicators.length
                  }
                </div>

              </div>

            </div>

          </div>

        </div>


        {/* TABLE */}

        <div
          className="card border-0 shadow-sm"
        >

          <div className="card-body p-0">

            {/* FILTERS */}

            <div
              className="p-3 border-bottom"
            >

              <div className="row g-2">

                <div className="col-lg-5">

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search code, indicator or SDG..."
                    value={search}
                    onChange={(e) =>
                      setSearch(
                        e.target.value
                      )
                    }
                  />

                </div>


                <div className="col-lg-3">

                  <select
                    className="form-select"
                    value={goalFilter}
                    onChange={(e) =>
                      setGoalFilter(
                        e.target.value
                      )
                    }
                  >

                    <option value="">
                      All SDGs
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
                          {
                            sdg.goal_number
                          }
                          {" - "}
                          {
                            sdg.goal_name
                          }

                        </option>

                      )
                    )}

                  </select>

                </div>


                <div className="col-lg-2">

                  <select
                    className="form-select"
                    value={
                      directionFilter
                    }
                    onChange={(e) =>
                      setDirectionFilter(
                        e.target.value
                      )
                    }
                  >

                    <option value="">
                      All Directions
                    </option>

                    <option value="higher_better">
                      Higher is Better
                    </option>

                    <option value="lower_better">
                      Lower is Better
                    </option>

                  </select>

                </div>


                <div className="col-lg-2">

                  <button
                    className="btn btn-light w-100"
                    onClick={() => {

                      setSearch("");
                      setGoalFilter("");
                      setDirectionFilter("");

                    }}
                  >
                    Clear
                  </button>

                </div>

              </div>

            </div>


            {/* TABLE */}

            {loading ? (

              <div
                className="text-center py-5"
              >

                <div
                  className="spinner-border text-primary"
                />

                <div
                  className="text-muted mt-3"
                >
                  Loading indicators...
                </div>

              </div>

            ) : filteredIndicators.length === 0 ? (

              <div
                className="text-center py-5"
              >

                <div
                  style={{
                    fontSize: "42px",
                  }}
                >
                  📈
                </div>

                <h5 className="mt-3">
                  No indicators found
                </h5>

                <p className="text-muted">
                  Add an indicator to begin
                  collecting SDG data.
                </p>

              </div>

            ) : (

              <div
                className="table-responsive"
              >

                <table
                  className="table table-hover align-middle mb-0"
                >

                  <thead
                    style={{
                      background:
                        "#f8fafc",
                    }}
                  >

                    <tr>

                      <th className="px-4">
                        Code
                      </th>

                      <th>
                        SDG
                      </th>

                      <th>
                        Indicator
                      </th>

                      <th>
                        Unit
                      </th>

                      <th>
                        Direction
                      </th>

                      <th className="text-end px-4">
                        Actions
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {filteredIndicators.map(
                      (item) => (

                        <tr
                          key={
                            item.indicator_id
                          }
                        >

                          <td className="px-4">

                            <span
                              className="badge bg-light text-dark border"
                            >
                              {
                                item.indicator_code
                              }
                            </span>

                          </td>


                          <td>

                            <div
                              className="fw-semibold"
                            >
                              SDG{" "}
                              {
                                item.goal_number
                              }
                            </div>

                            <small
                              className="text-muted"
                            >
                              {
                                item.goal_name
                              }
                            </small>

                          </td>


                          <td>

                            <div
                              className="fw-semibold"
                            >
                              {
                                item.indicator_name
                              }
                            </div>

                            {item.description && (

                              <small
                                className="text-muted d-block"
                                style={{
                                  maxWidth:
                                    "350px",
                                }}
                              >
                                {
                                  item.description
                                }
                              </small>

                            )}

                          </td>


                          <td>

                            {item.unit || "—"}

                          </td>


                          <td>

                            {item.direction ===
                            "higher_better" ? (

                              <span
                                className="badge bg-success-subtle text-success"
                              >
                                ↑ Higher
                              </span>

                            ) : (

                              <span
                                className="badge bg-warning-subtle text-warning-emphasis"
                              >
                                ↓ Lower
                              </span>

                            )}

                          </td>


                          <td
                            className="text-end px-4"
                          >

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

      </div>


      {/* =================================================
          MODAL
      ================================================= */}

      {showModal && (

        <div
          className="modal d-block"
          style={{
            background:
              "rgba(0,0,0,.45)",
          }}
        >

          <div
            className="modal-dialog modal-dialog-centered modal-lg"
          >

            <div
              className="modal-content border-0 shadow"
            >

              <div className="modal-header">

                <div>

                  <h5
                    className="modal-title fw-bold"
                  >
                    {editingIndicator
                      ? "Edit Indicator"
                      : "Add Indicator"}
                  </h5>

                  <small
                    className="text-muted"
                  >
                    Define an indicator used
                    to measure an SDG.
                  </small>

                </div>

                <button
                  className="btn-close"
                  onClick={closeModal}
                />

              </div>


              <form
                onSubmit={handleSubmit}
              >

                <div className="modal-body">

                  <div className="row g-3">

                    {/* SDG */}

                    <div className="col-md-6">

                      <label
                        className="form-label fw-semibold"
                      >
                        SDG Goal
                      </label>

                      <select
                        name="goal_id"
                        className="form-select"
                        value={
                          form.goal_id
                        }
                        onChange={
                          handleChange
                        }
                        required
                      >

                        <option value="">
                          Select SDG
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
                              {
                                sdg.goal_number
                              }
                              {" - "}
                              {
                                sdg.goal_name
                              }

                            </option>

                          )
                        )}

                      </select>

                    </div>


                    {/* CODE */}

                    <div className="col-md-6">

                      <label
                        className="form-label fw-semibold"
                      >
                        Indicator Code
                      </label>

                      <input
                        type="text"
                        name="indicator_code"
                        className="form-control"
                        placeholder="e.g. SH_DYN_MORT"
                        value={
                          form.indicator_code
                        }
                        onChange={
                          handleChange
                        }
                        required
                      />

                    </div>


                    {/* NAME */}

                    <div className="col-12">

                      <label
                        className="form-label fw-semibold"
                      >
                        Indicator Name
                      </label>

                      <input
                        type="text"
                        name="indicator_name"
                        className="form-control"
                        placeholder="Enter indicator name"
                        value={
                          form.indicator_name
                        }
                        onChange={
                          handleChange
                        }
                        required
                      />

                    </div>


                    {/* DESCRIPTION */}

                    <div className="col-12">

                      <label
                        className="form-label fw-semibold"
                      >
                        Description
                      </label>

                      <textarea
                        name="description"
                        className="form-control"
                        rows={3}
                        placeholder="Describe what this indicator measures..."
                        value={
                          form.description
                        }
                        onChange={
                          handleChange
                        }
                      />

                    </div>


                    {/* UNIT */}

                    <div className="col-md-6">

                      <label
                        className="form-label fw-semibold"
                      >
                        Unit
                      </label>

                      <input
                        type="text"
                        name="unit"
                        className="form-control"
                        placeholder="%, years, per 100,000..."
                        value={
                          form.unit
                        }
                        onChange={
                          handleChange
                        }
                      />

                    </div>


                    {/* DIRECTION */}

                    <div className="col-md-6">

                      <label
                        className="form-label fw-semibold"
                      >
                        Performance Direction
                      </label>

                      <select
                        name="direction"
                        className="form-select"
                        value={
                          form.direction
                        }
                        onChange={
                          handleChange
                        }
                      >

                        <option value="higher_better">
                          Higher is Better
                        </option>

                        <option value="lower_better">
                          Lower is Better
                        </option>

                      </select>

                    </div>

                  </div>


                  {/* INFORMATION */}

                  <div
                    className="alert alert-light border mt-4 mb-0"
                  >

                    <div className="fw-semibold small">
                      Why is direction important?
                    </div>

                    <div className="small text-muted mt-1">

                      <strong>
                        Higher is Better
                      </strong>
                      {" "}
                      means a higher value
                      represents better performance.

                      <br />

                      <strong>
                        Lower is Better
                      </strong>
                      {" "}
                      means a lower value
                      represents better performance.

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

                      editingIndicator
                        ? "Update Indicator"
                        : "Save Indicator"

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