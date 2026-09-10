
"use client";

import { useEffect, useMemo, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';

interface Country {
  country_id: number;
  iso3: string;
  country_name: string;
  region_id: number | null;
  region_name: string | null;
  score: number | null;
}

interface Region {
  region_id: number;
  region_name: string;
}

interface CountryForm {
  iso3: string;
  country_name: string;
  region_id: string;
}

export default function CountriesAdminPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingCountry, setEditingCountry] =
    useState<Country | null>(null);

  const [error, setError] = useState("");

  const [form, setForm] = useState<CountryForm>({
    iso3: "",
    country_name: "",
    region_id: "",
  });

  // =====================================================
  // LOAD COUNTRIES
  // =====================================================

  const loadCountries = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/countries", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load countries");
      }

      const data = await response.json();

      setCountries(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load countries.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD REGIONS
  // =====================================================

  const loadRegions = async () => {
    try {
      const response = await fetch("/api/regions", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load regions");
      }

      const data = await response.json();

      setRegions(data);
    } catch (err) {
      console.error(err);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadCountries();
    loadRegions();
  }, []);

  // =====================================================
  // FILTER
  // =====================================================

  const filteredCountries = useMemo(() => {
    return countries.filter((country) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        country.country_name
          .toLowerCase()
          .includes(searchText) ||
        country.iso3
          .toLowerCase()
          .includes(searchText) ||
        (country.region_name || "")
          .toLowerCase()
          .includes(searchText);

      const matchesRegion =
        !regionFilter ||
        String(country.region_id) === regionFilter;

      return matchesSearch && matchesRegion;
    });
  }, [countries, search, regionFilter]);

  // =====================================================
  // OPEN ADD MODAL
  // =====================================================

  const openAddModal = () => {
    setEditingCountry(null);

    setForm({
      iso3: "",
      country_name: "",
      region_id: "",
    });

    setShowModal(true);
  };

  // =====================================================
  // OPEN EDIT MODAL
  // =====================================================

  const openEditModal = (country: Country) => {
    setEditingCountry(country);

    setForm({
      iso3: country.iso3,
      country_name: country.country_name,
      region_id: country.region_id
        ? String(country.region_id)
        : "",
    });

    setShowModal(true);
  };

  // =====================================================
  // CLOSE MODAL
  // =====================================================

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingCountry(null);

    setForm({
      iso3: "",
      country_name: "",
      region_id: "",
    });
  };

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // SAVE COUNTRY
  // =====================================================

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!form.iso3.trim()) {
      alert("Please enter the ISO3 code.");
      return;
    }

    if (!form.country_name.trim()) {
      alert("Please enter the country name.");
      return;
    }

    try {
      setSaving(true);

      const isEdit = Boolean(editingCountry);

      const url = isEdit
        ? `/api/countries/${editingCountry?.country_id}`
        : "/api/countries";

      const response = await fetch(url, {
        method: isEdit ? "PUT" : "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          iso3: form.iso3.trim().toUpperCase(),
          country_name: form.country_name.trim(),
          region_id: form.region_id
            ? Number(form.region_id)
            : null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            result.message ||
            "Failed to save country"
        );
      }

      closeModal();

      await loadCountries();

    } catch (err: any) {
      console.error(err);

      alert(
        err.message ||
          "Unable to save country."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE COUNTRY
  // =====================================================

  const handleDelete = async (country: Country) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${country.country_name}?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/countries/${country.country_id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            result.message ||
            "Failed to delete country"
        );
      }

      await loadCountries();

    } catch (err: any) {
      console.error(err);

      alert(
        err.message ||
          "Unable to delete country."
      );
    }
  };

  // =====================================================
  // SCORE FORMAT
  // =====================================================

  const formatScore = (score: number | null) => {
    if (score === null || score === undefined) {
      return "—";
    }

    return `${Number(score).toFixed(1)}%`;
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

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="bg-white border-bottom">
        <div
          className="container-fluid px-4 py-4"
        >
          <div className="d-flex justify-content-between align-items-center">

            <div>
              <div
                className="text-muted small mb-1"
              >
                SDG TRACKER / ADMIN
              </div>

              <h2 className="fw-bold mb-1">
                Countries
              </h2>

              <p className="text-muted mb-0">
                Manage countries used throughout
                the SDG tracking platform.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-primary px-4 py-2 rounded-md shadow-sm bg-[#0aacb8] text-white
               font-semibold hover:bg-[#08817b] transition-colors duration-200"
              onClick={openAddModal}
            >
              <span className="me-2">+</span>
              Add Country
            </button>

          </div>
        </div>
      </div>


      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="container-fluid px-4 py-4">

        {/* =================================================
            STAT CARDS
        ================================================= */}

        <div className="row g-3 mb-4">

          <div className="col-md-4">

            <div
              className="card border-0 shadow-sm h-100"
            >
              <div className="card-body">

                <div className="text-muted small">
                  TOTAL COUNTRIES
                </div>

                <div
                  className="fs-2 fw-bold mt-1"
                  style={{ color: "#172033" }}
                >
                  {countries.length}
                </div>

              </div>
            </div>

          </div>


          <div className="col-md-4">

            <div
              className="card border-0 shadow-sm h-100"
            >
              <div className="card-body">

                <div className="text-muted small">
                  REGIONS
                </div>

                <div
                  className="fs-2 fw-bold mt-1"
                  style={{ color: "#172033" }}
                >
                  {regions.length}
                </div>

              </div>
            </div>

          </div>


          <div className="col-md-4">

            <div
              className="card border-0 shadow-sm h-100"
            >
              <div className="card-body">

                <div className="text-muted small">
                  DISPLAYED
                </div>

                <div
                  className="fs-2 fw-bold mt-1"
                  style={{ color: "#172033" }}
                >
                  {filteredCountries.length}
                </div>

              </div>
            </div>

          </div>

        </div>


        {/* =================================================
            TABLE CARD
        ================================================= */}

        <div
          className="card border-0 shadow-sm"
        >

          <div className="card-body p-0">

            {/* =================================================
                FILTER BAR
            ================================================= */}

            <div
              className="p-3 border-bottom"
            >

              <div className="row g-2">

                <div className="col-md-7">

                  <div className="input-group">

                    <span
                      className="input-group-text bg-white"
                    >
                      🔎
                    </span>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search country, ISO code, or region..."
                      value={search}
                      onChange={(e) =>
                        setSearch(e.target.value)
                      }
                    />

                  </div>

                </div>


                <div className="col-md-5">

                  <select
                    className="form-select"
                    value={regionFilter}
                    onChange={(e) =>
                      setRegionFilter(e.target.value)
                    }
                  >

                    <option value="">
                      All Regions
                    </option>

                    {regions.map((region) => (

                      <option
                        key={region.region_id}
                        value={region.region_id}
                      >
                        {region.region_name}
                      </option>

                    ))}

                  </select>

                </div>

              </div>

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

              <div className="alert alert-danger m-3">
                {error}

                <button
                  className="btn btn-sm btn-outline-danger ms-3"
                  onClick={loadCountries}
                >
                  Retry
                </button>
              </div>

            )}


            {/* =================================================
                LOADING
            ================================================= */}

            {loading ? (

              <div
                className="text-center py-5"
              >

                <div
                  className="spinner-border text-primary mb-3"
                  role="status"
                />

                <div className="text-muted">
                  Loading countries...
                </div>

              </div>

            ) : filteredCountries.length === 0 ? (

              /* =================================================
                 EMPTY
              ================================================= */

              <div
                className="text-center py-5 px-3"
              >

                <div
                  style={{
                    fontSize: "42px",
                    opacity: 0.5,
                  }}
                >
                  🌎
                </div>

                <h5 className="mt-3">
                  No countries found
                </h5>

                <p className="text-muted">
                  Try changing your search or
                  region filter.
                </p>

              </div>

            ) : (

              /* =================================================
                 TABLE
              ================================================= */

              <div className="table-responsive">

                <table
                  className="table table-hover align-middle mb-0"
                >

                  <thead
                    style={{
                      background: "#f8fafc",
                    }}
                  >

                    <tr>

                      <th className="px-4 py-3">
                        #
                      </th>

                      <th>
                        ISO3
                      </th>

                      <th>
                        Country
                      </th>

                      <th>
                        Region
                      </th>

                      <th>
                        SDG Score
                      </th>

                      <th className="text-end px-4">
                        Actions
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {filteredCountries.map(
                      (country, index) => (

                        <tr key={country.country_id}>

                          <td className="px-4">
                            {index + 1}
                          </td>


                          <td>

                            <span
                              className="badge border bg-light text-dark px-3 py-2"
                            >
                              {country.iso3}
                            </span>

                          </td>


                          <td>

                            <div
                              className="fw-semibold"
                              style={{
                                color: "#172033",
                              }}
                            >
                              {country.country_name}
                            </div>

                          </td>


                          <td>

                            {country.region_name ? (

                              <span>
                                {country.region_name}
                              </span>

                            ) : (

                              <span className="text-muted">
                                —
                              </span>

                            )}

                          </td>


                          <td>

                            {country.score !== null ? (

                              <span
                                className="fw-semibold"
                              >
                                {formatScore(
                                  country.score
                                )}
                              </span>

                            ) : (

                              <span className="text-muted">
                                No data
                              </span>

                            )}

                          </td>


                          <td className="text-end px-4">

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary me-2"
                              onClick={() =>
                                openEditModal(country)
                              }
                            >
                              Edit
                            </button>


                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() =>
                                handleDelete(country)
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


      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      {showModal && (

        <div
          className="modal fade show d-block"
          style={{backgroundColor: "rgba(0, 0, 0, 0.5)"}}
        >

          <div
            className="modal-dialog modal-dialog-centered"
          >

            <div className="modal-content border-0 shadow">

              {/* HEADER */}

              <div className="modal-header">

                <div>

                  <h5 className="modal-title fw-bold">
                    {editingCountry
                      ? "Edit Country"
                      : "Add Country"}
                  </h5>

                  <div className="text-muted small">
                    Enter the country information below.
                  </div>

                </div>

                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                />

              </div>


              {/* FORM */}

              <form onSubmit={handleSubmit}>

                <div className="modal-body">

                  {/* ISO3 */}

                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      ISO3 Code
                    </label>

                    <input
                      type="text"
                      name="iso3"
                      className="form-control text-uppercase"
                      maxLength={3}
                      placeholder="PHL"
                      value={form.iso3}
                      onChange={handleChange}
                      required
                    />

                    <div className="form-text">
                      Three-letter ISO country code.
                    </div>

                  </div>


                  {/* COUNTRY */}

                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      Country Name
                    </label>

                    <input
                      type="text"
                      name="country_name"
                      className="form-control"
                      placeholder="Philippines"
                      value={form.country_name}
                      onChange={handleChange}
                      required
                    />

                  </div>


                  {/* REGION */}

                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      Region
                    </label>

                    <select
                      name="region_id"
                      className="form-select"
                      value={form.region_id}
                      onChange={handleChange}
                    >

                      <option value="">
                        Select region
                      </option>

                      {regions.map((region) => (

                        <option
                          key={region.region_id}
                          value={region.region_id}
                        >
                          {region.region_name}
                        </option>

                      ))}

                    </select>

                  </div>  

                </div>


                {/* FOOTER */}

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

                      editingCountry
                        ? "Update Country"
                        : "Save Country"

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