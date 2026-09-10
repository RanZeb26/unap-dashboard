"use client";

import { useEffect, useMemo, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
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

interface Indicator {
  indicator_id: number;
  goal_id: number;
  indicator_code: string;
  indicator_name: string;
  unit: string | null;
  direction: "higher_better" | "lower_better";
}

interface Source {
  source_id: number;
  source_name: string;
  organization: string | null;
}

interface IndicatorValue {
  value_id: number;

  country_id: number;
  indicator_id: number;

  year: number;
  value: number;
  target_value: number | null;

  source_id: number | null;

  data_status:
    | "official"
    | "estimated"
    | "modeled"
    | "missing";

  iso3: string;
  country_name: string;

  indicator_code: string;
  indicator_name: string;

  unit: string | null;
  direction:
    | "higher_better"
    | "lower_better";

  goal_id: number;
  goal_number: number;
  goal_name: string;

  source_name: string | null;
  organization: string | null;
}

interface FormData {
  country_id: string;
  goal_id: string;
  indicator_id: string;

  year: string;
  value: string;
  target_value: string;

  source_id: string;

  data_status:
    | "official"
    | "estimated"
    | "modeled"
    | "missing";
}

export default function IndicatorValuesPage() {

  const [values, setValues] =
    useState<IndicatorValue[]>([]);

  const [countries, setCountries] =
    useState<Country[]>([]);

  const [sdgs, setSdgs] =
    useState<SDG[]>([]);

  const [indicators, setIndicators] =
    useState<Indicator[]>([]);

  const [sources, setSources] =
    useState<Source[]>([]);


  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);


  const [search, setSearch] =
    useState("");

  const [yearFilter, setYearFilter] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("");


  const [showModal, setShowModal] =
    useState(false);

  const [editingValue, setEditingValue] =
    useState<IndicatorValue | null>(null);


  const [form, setForm] =
    useState<FormData>({
      country_id: "",
      goal_id: "",
      indicator_id: "",
      year: "",
      value: "",
      target_value: "",
      source_id: "",
      data_status: "official",
    });


  // =====================================================
  // LOAD VALUES
  // =====================================================

  const loadValues = async () => {

    try {

      setLoading(true);

      const response =
        await fetch(
          "/api/indicator-values",
          {
            cache: "no-store",
          }
        );

      if (!response.ok) {
        throw new Error(
          "Failed to load indicator values"
        );
      }

      const data =
        await response.json();

      setValues(data);

    } catch (error) {

      console.error(error);

      alert(
        "Unable to load indicator values."
      );

    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // LOAD COUNTRIES
  // =====================================================

  const loadCountries = async () => {

    try {

      const response =
        await fetch(
          "/api/countries",
          {
            cache: "no-store",
          }
        );

      const data =
        await response.json();

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

      const response =
        await fetch(
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


  // =====================================================
  // LOAD INDICATORS
  // =====================================================

  const loadIndicators = async () => {

    try {

      const response =
        await fetch(
          "/api/indicators",
          {
            cache: "no-store",
          }
        );

      const data =
        await response.json();

      setIndicators(data);

    } catch (error) {

      console.error(error);

    }

  };


  // =====================================================
  // LOAD SOURCES
  // =====================================================

  const loadSources = async () => {

    try {

      const response =
        await fetch(
          "/api/sources",
          {
            cache: "no-store",
          }
        );

      const data =
        await response.json();

      setSources(data);

    } catch (error) {

      console.error(error);

    }

  };


  useEffect(() => {

    loadValues();
    loadCountries();
    loadSDGs();
    loadIndicators();
    loadSources();

  }, []);


  // =====================================================
  // FILTERED INDICATORS
  // =====================================================

  const formIndicators =
    useMemo(() => {

      if (!form.goal_id) {
        return indicators;
      }

      return indicators.filter(
        (item) =>
          String(item.goal_id) ===
          form.goal_id
      );

    }, [
      indicators,
      form.goal_id,
    ]);


  // =====================================================
  // FILTER VALUES
  // =====================================================

  const filteredValues =
    useMemo(() => {

      const searchValue =
        search
          .toLowerCase()
          .trim();

      return values.filter(
        (item) => {

          const matchesSearch =
            !searchValue ||

            item.country_name
              .toLowerCase()
              .includes(searchValue) ||

            item.iso3
              .toLowerCase()
              .includes(searchValue) ||

            item.indicator_code
              .toLowerCase()
              .includes(searchValue) ||

            item.indicator_name
              .toLowerCase()
              .includes(searchValue) ||

            item.goal_name
              .toLowerCase()
              .includes(searchValue);


          const matchesYear =
            !yearFilter ||
            String(item.year) ===
              yearFilter;


          const matchesStatus =
            !statusFilter ||
            item.data_status ===
              statusFilter;


          return (
            matchesSearch &&
            matchesYear &&
            matchesStatus
          );

        }
      );

    }, [
      values,
      search,
      yearFilter,
      statusFilter,
    ]);


  // =====================================================
  // OPEN ADD
  // =====================================================

  const openAddModal = () => {

    setEditingValue(null);

    setForm({
      country_id: "",
      goal_id: "",
      indicator_id: "",
      year: new Date()
        .getFullYear()
        .toString(),
      value: "",
      target_value: "",
      source_id: "",
      data_status: "official",
    });

    setShowModal(true);

  };


  // =====================================================
  // OPEN EDIT
  // =====================================================

  const openEditModal = (
    item: IndicatorValue
  ) => {

    setEditingValue(item);

    setForm({
      country_id:
        String(item.country_id),

      goal_id:
        String(item.goal_id),

      indicator_id:
        String(item.indicator_id),

      year:
        String(item.year),

      value:
        String(item.value),

      target_value:
        item.target_value === null
          ? ""
          : String(item.target_value),

      source_id:
        item.source_id === null
          ? ""
          : String(item.source_id),

      data_status:
        item.data_status,
    });

    setShowModal(true);

  };


  // =====================================================
  // CLOSE
  // =====================================================

  const closeModal = () => {

    if (saving) return;

    setShowModal(false);

    setEditingValue(null);

  };


  // =====================================================
  // CHANGE
  // =====================================================

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLSelectElement
    >
  ) => {

    const {
      name,
      value,
    } = e.target;


    setForm(
      (previous) => {

        const next = {
          ...previous,
          [name]: value,
        };


        // If SDG changes,
        // reset indicator

        if (
          name === "goal_id"
        ) {

          next.indicator_id =
            "";

        }


        return next;

      }
    );

  };


  // =====================================================
  // SAVE
  // =====================================================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();


    if (!form.country_id) {

      alert(
        "Please select a country."
      );

      return;

    }


    if (!form.goal_id) {

      alert(
        "Please select an SDG."
      );

      return;

    }


    if (!form.indicator_id) {

      alert(
        "Please select an indicator."
      );

      return;

    }


    if (!form.year) {

      alert(
        "Please enter a year."
      );

      return;

    }


    if (form.value === "") {

      alert(
        "Please enter a value."
      );

      return;

    }


    try {

      setSaving(true);


      const isEdit =
        Boolean(editingValue);


      const url = isEdit
        ? `/api/indicator-values/${editingValue?.value_id}`
        : "/api/indicator-values";


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

              country_id:
                Number(
                  form.country_id
                ),

              indicator_id:
                Number(
                  form.indicator_id
                ),

              year:
                Number(form.year),

              value:
                Number(form.value),

              target_value:
                form.target_value === ""
                  ? null
                  : Number(
                      form.target_value
                    ),

              source_id:
                form.source_id === ""
                  ? null
                  : Number(
                      form.source_id
                    ),

              data_status:
                form.data_status,

            }),
          }
        );


      const result =
        await response.json();


      if (!response.ok) {

        throw new Error(
          result.error ||
          result.message ||
          "Failed to save data"
        );

      }


      closeModal();

      await loadValues();


    } catch (error: any) {

      console.error(error);

      alert(
        error.message ||
        "Unable to save indicator value."
      );


    } finally {

      setSaving(false);

    }

  };


  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async (
    item: IndicatorValue
  ) => {

    const confirmed =
      window.confirm(
        `Delete ${item.country_name} / ${item.indicator_code} / ${item.year}?`
      );


    if (!confirmed) return;


    try {

      const response =
        await fetch(
          `/api/indicator-values/${item.value_id}`,
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
          "Failed to delete data"
        );

      }


      await loadValues();


    } catch (error: any) {

      console.error(error);

      alert(
        error.message ||
        "Unable to delete data."
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
                Indicator Values
              </h2>

              <p className="text-muted mb-0">
                Enter and manage country-level
                SDG indicator data.
              </p>

            </div>


            <button
              className="btn btn-primary px-4"
              onClick={openAddModal}
            >
              + Add Data
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
                  TOTAL VALUES
                </div>

                <div className="fs-2 fw-bold">
                  {values.length}
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
                  OFFICIAL DATA
                </div>

                <div className="fs-2 fw-bold">
                  {
                    values.filter(
                      (x) =>
                        x.data_status ===
                        "official"
                    ).length
                  }
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
                    filteredValues.length
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
                    placeholder="Search country, indicator or SDG..."
                    value={search}
                    onChange={(e) =>
                      setSearch(
                        e.target.value
                      )
                    }
                  />

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


                <div className="col-lg-3">

                  <select
                    className="form-select"
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(
                        e.target.value
                      )
                    }
                  >

                    <option value="">
                      All Status
                    </option>

                    <option value="official">
                      Official
                    </option>

                    <option value="estimated">
                      Estimated
                    </option>

                    <option value="modeled">
                      Modeled
                    </option>

                    <option value="missing">
                      Missing
                    </option>

                  </select>

                </div>


                <div className="col-lg-2">

                  <button
                    className="btn btn-light w-100"
                    onClick={() => {

                      setSearch("");
                      setYearFilter("");
                      setStatusFilter("");

                    }}
                  >
                    Clear
                  </button>

                </div>

              </div>

            </div>


            {/* DATA */}

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
                  Loading indicator data...
                </div>

              </div>

            ) : filteredValues.length === 0 ? (

              <div
                className="text-center py-5"
              >

                <div
                  style={{
                    fontSize: "42px",
                  }}
                >
                  📊
                </div>

                <h5 className="mt-3">
                  No indicator data
                </h5>

                <p className="text-muted">
                  Add your first country
                  indicator value.
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
                        Country
                      </th>

                      <th>
                        SDG
                      </th>

                      <th>
                        Indicator
                      </th>

                      <th>
                        Year
                      </th>

                      <th>
                        Value
                      </th>

                      <th>
                        Target
                      </th>

                      <th>
                        Status
                      </th>

                      <th className="text-end px-4">
                        Actions
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {filteredValues.map(
                      (item) => (

                        <tr
                          key={
                            item.value_id
                          }
                        >

                          <td className="px-4">

                            <div
                              className="fw-semibold"
                            >
                              {
                                item.country_name
                              }
                            </div>

                            <small
                              className="text-muted"
                            >
                              {
                                item.iso3
                              }
                            </small>

                          </td>


                          <td>

                            <span
                              className="fw-semibold"
                            >
                              SDG{" "}
                              {
                                item.goal_number
                              }
                            </span>

                            <small
                              className="d-block text-muted"
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
                                item.indicator_code
                              }
                            </div>

                            <small
                              className="text-muted"
                            >
                              {
                                item.indicator_name
                              }
                            </small>

                          </td>


                          <td>

                            {
                              item.year
                            }

                          </td>


                          <td>

                            <span
                              className="fw-bold"
                            >
                              {
                                item.value
                              }
                            </span>

                            {item.unit && (

                              <small
                                className="text-muted ms-1"
                              >
                                {
                                  item.unit
                                }
                              </small>

                            )}

                          </td>


                          <td>

                            {
                              item.target_value ??
                              "—"
                            }

                          </td>


                          <td>

                            <StatusBadge
                              status={
                                item.data_status
                              }
                            />

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
                    {editingValue
                      ? "Edit Indicator Value"
                      : "Add Indicator Value"}
                  </h5>

                  <small
                    className="text-muted"
                  >
                    Enter country-level SDG
                    indicator data.
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

                    {/* COUNTRY */}

                    <div className="col-md-6">

                      <label
                        className="form-label fw-semibold"
                      >
                        Country
                      </label>

                      <select
                        name="country_id"
                        className="form-select"
                        value={
                          form.country_id
                        }
                        onChange={
                          handleChange
                        }
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

                              {
                                country.country_name
                              }
                              {" ("}
                              {
                                country.iso3
                              }
                              {")"}

                            </option>

                          )
                        )}

                      </select>

                    </div>


                    {/* YEAR */}

                    <div className="col-md-6">

                      <label
                        className="form-label fw-semibold"
                      >
                        Year
                      </label>

                      <input
                        type="number"
                        name="year"
                        className="form-control"
                        min="1900"
                        max="2100"
                        value={
                          form.year
                        }
                        onChange={
                          handleChange
                        }
                        required
                      />

                    </div>


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


                    {/* INDICATOR */}

                    <div className="col-md-6">

                      <label
                        className="form-label fw-semibold"
                      >
                        Indicator
                      </label>

                      <select
                        name="indicator_id"
                        className="form-select"
                        value={
                          form.indicator_id
                        }
                        onChange={
                          handleChange
                        }
                        disabled={
                          !form.goal_id
                        }
                        required
                      >

                        <option value="">
                          {form.goal_id
                            ? "Select indicator"
                            : "Select SDG first"}
                        </option>

                        {formIndicators.map(
                          (indicator) => (

                            <option
                              key={
                                indicator.indicator_id
                              }
                              value={
                                indicator.indicator_id
                              }
                            >

                              {
                                indicator.indicator_code
                              }
                              {" - "}
                              {
                                indicator.indicator_name
                              }

                            </option>

                          )
                        )}

                      </select>

                    </div>


                    {/* VALUE */}

                    <div className="col-md-6">

                      <label
                        className="form-label fw-semibold"
                      >
                        Value
                      </label>

                      <input
                        type="number"
                        step="any"
                        name="value"
                        className="form-control"
                        placeholder="Enter value"
                        value={
                          form.value
                        }
                        onChange={
                          handleChange
                        }
                        required
                      />

                    </div>


                    {/* TARGET */}

                    <div className="col-md-6">

                      <label
                        className="form-label fw-semibold"
                      >
                        Target Value
                      </label>

                      <input
                        type="number"
                        step="any"
                        name="target_value"
                        className="form-control"
                        placeholder="Optional"
                        value={
                          form.target_value
                        }
                        onChange={
                          handleChange
                        }
                      />

                    </div>


                    {/* SOURCE */}

                    <div className="col-md-6">

                      <label
                        className="form-label fw-semibold"
                      >
                        Data Source
                      </label>

                      <select
                        name="source_id"
                        className="form-select"
                        value={
                          form.source_id
                        }
                        onChange={
                          handleChange
                        }
                      >

                        <option value="">
                          Select source
                        </option>

                        {sources.map(
                          (source) => (

                            <option
                              key={
                                source.source_id
                              }
                              value={
                                source.source_id
                              }
                            >

                              {
                                source.source_name
                              }

                              {source.organization
                                ? ` — ${source.organization}`
                                : ""}

                            </option>

                          )
                        )}

                      </select>

                    </div>


                    {/* STATUS */}

                    <div className="col-md-6">

                      <label
                        className="form-label fw-semibold"
                      >
                        Data Status
                      </label>

                      <select
                        name="data_status"
                        className="form-select"
                        value={
                          form.data_status
                        }
                        onChange={
                          handleChange
                        }
                      >

                        <option value="official">
                          Official
                        </option>

                        <option value="estimated">
                          Estimated
                        </option>

                        <option value="modeled">
                          Modeled
                        </option>

                        <option value="missing">
                          Missing
                        </option>

                      </select>

                    </div>

                  </div>


                  {/* INFO */}

                  <div
                    className="alert alert-light border mt-4 mb-0"
                  >

                    <div className="fw-semibold">
                      Data status
                    </div>

                    <small
                      className="text-muted"
                    >

                      <strong>Official</strong>
                      {" "}
                      — reported or published
                      official statistics.

                      <br />

                      <strong>Estimated</strong>
                      {" "}
                      — estimated from available
                      information.

                      <br />

                      <strong>Modeled</strong>
                      {" "}
                      — produced using a statistical
                      model.

                      <br />

                      <strong>Missing</strong>
                      {" "}
                      — no reliable value available.

                    </small>

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

                      editingValue
                        ? "Update Data"
                        : "Save Data"

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


// =====================================================
// STATUS BADGE
// =====================================================

function StatusBadge({
  status,
}: {
  status:
    | "official"
    | "estimated"
    | "modeled"
    | "missing";
}) {

  const classes = {

    official:
      "bg-success-subtle text-success",

    estimated:
      "bg-warning-subtle text-warning-emphasis",

    modeled:
      "bg-info-subtle text-info-emphasis",

    missing:
      "bg-secondary-subtle text-secondary",

  };


  return (

    <span
      className={`badge ${classes[status]}`}
    >
      {status
        .charAt(0)
        .toUpperCase() +
        status.slice(1)}
    </span>

  );

}