"use client";

import { useEffect, useMemo, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
interface SDG {
  goal_id: number;
  goal_number: number;
  goal_name: string;
}

interface SDGForm {
  goal_number: string;
  goal_name: string;
}

export default function SDGsAdminPage() {

  const [sdgs, setSdgs] = useState<SDG[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [editingSDG, setEditingSDG] =
    useState<SDG | null>(null);

  const [form, setForm] =
    useState<SDGForm>({
      goal_number: "",
      goal_name: "",
    });


  // =====================================================
  // LOAD
  // =====================================================

  const loadSDGs = async () => {

    try {

      setLoading(true);

      const response = await fetch(
        "/api/sdgs",
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load SDG goals"
        );
      }

      const data = await response.json();

      setSdgs(data);

    } catch (error) {

      console.error(error);

      alert(
        "Unable to load SDG goals."
      );

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {
    loadSDGs();
  }, []);


  // =====================================================
  // SEARCH
  // =====================================================

  const filteredSDGs = useMemo(() => {

    const value =
      search.toLowerCase().trim();

    if (!value) {
      return sdgs;
    }

    return sdgs.filter(
      (sdg) =>
        String(sdg.goal_number)
          .includes(value) ||

        sdg.goal_name
          .toLowerCase()
          .includes(value)
    );

  }, [
    sdgs,
    search
  ]);


  // =====================================================
  // ADD
  // =====================================================

  const openAddModal = () => {

    setEditingSDG(null);

    setForm({
      goal_number: "",
      goal_name: "",
    });

    setShowModal(true);

  };


  // =====================================================
  // EDIT
  // =====================================================

  const openEditModal = (
    sdg: SDG
  ) => {

    setEditingSDG(sdg);

    setForm({
      goal_number:
        String(sdg.goal_number),

      goal_name:
        sdg.goal_name,
    });

    setShowModal(true);

  };


  // =====================================================
  // CLOSE
  // =====================================================

  const closeModal = () => {

    if (saving) return;

    setShowModal(false);

    setEditingSDG(null);

  };


  // =====================================================
  // FORM
  // =====================================================

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement
    >
  ) => {

    const {
      name,
      value
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

    const number =
      Number(form.goal_number);

    if (
      !number ||
      number < 1 ||
      number > 17
    ) {

      alert(
        "Goal number must be between 1 and 17."
      );

      return;

    }

    if (!form.goal_name.trim()) {

      alert(
        "Please enter the SDG goal name."
      );

      return;

    }

    try {

      setSaving(true);

      const isEdit =
        Boolean(editingSDG);

      const url = isEdit
        ? `/api/sdgs/${editingSDG?.goal_id}`
        : "/api/sdgs";

      const response = await fetch(
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
            goal_number: number,
            goal_name:
              form.goal_name.trim(),
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {

        throw new Error(
          result.error ||
          result.message ||
          "Failed to save SDG"
        );

      }

      closeModal();

      await loadSDGs();

    } catch (error: any) {

      console.error(error);

      alert(
        error.message ||
        "Unable to save SDG goal."
      );

    } finally {

      setSaving(false);

    }

  };


  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async (
    sdg: SDG
  ) => {

    const confirmed =
      window.confirm(
        `Delete SDG ${sdg.goal_number} - ${sdg.goal_name}?`
      );

    if (!confirmed) return;

    try {

      const response =
        await fetch(
          `/api/sdgs/${sdg.goal_id}`,
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
          "Failed to delete SDG"
        );

      }

      await loadSDGs();

    } catch (error: any) {

      console.error(error);

      alert(
        error.message ||
        "Unable to delete SDG goal."
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

      <div
        className="bg-white border-bottom"
      >

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

              <h2
                className="fw-bold mb-1"
              >
                SDG Goals
              </h2>

              <p
                className="text-muted mb-0"
              >
                Manage the 17 Sustainable
                Development Goals.
              </p>

            </div>


            <button
              className="btn btn-primary px-4"
              onClick={openAddModal}
            >
              + Add SDG
            </button>

          </div>

        </div>

      </div>


      {/* CONTENT */}

      <div
        className="container-fluid px-4 py-4"
      >

        {/* STAT */}

        <div
          className="row g-3 mb-4"
        >

          <div className="col-md-4">

            <div
              className="card border-0 shadow-sm"
            >

              <div className="card-body">

                <div className="text-muted small">
                  TOTAL SDG GOALS
                </div>

                <div
                  className="fs-2 fw-bold"
                >
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
                  OFFICIAL GOALS
                </div>

                <div
                  className="fs-2 fw-bold"
                >
                  17
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

                <div
                  className="fs-2 fw-bold"
                >
                  {filteredSDGs.length}
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

            {/* SEARCH */}

            <div
              className="p-3 border-bottom"
            >

              <input
                type="text"
                className="form-control"
                placeholder="Search SDG number or goal name..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
              />

            </div>


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
                  Loading SDG goals...
                </div>

              </div>

            ) : filteredSDGs.length === 0 ? (

              <div
                className="text-center py-5"
              >

                <div
                  style={{
                    fontSize: "42px",
                  }}
                >
                  🎯
                </div>

                <h5 className="mt-3">
                  No SDG goals found
                </h5>

                <p className="text-muted">
                  Add the 17 SDG goals to
                  begin tracking.
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

                      <th
                        className="px-4"
                      >
                        #
                      </th>

                      <th>
                        SDG
                      </th>

                      <th>
                        Goal
                      </th>

                      <th
                        className="text-end px-4"
                      >
                        Actions
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {filteredSDGs.map(
                      (sdg) => (

                        <tr
                          key={
                            sdg.goal_id
                          }
                        >

                          <td
                            className="px-4 text-muted"
                          >
                            {sdg.goal_id}
                          </td>


                          <td>

                            <div
                              className="d-flex align-items-center gap-3"
                            >

                              <div
                                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                                style={{
                                  width: 40,
                                  height: 40,
                                }}
                              >
                                {
                                  sdg.goal_number
                                }
                              </div>

                              <span
                                className="fw-semibold"
                              >
                                SDG{" "}
                                {
                                  sdg.goal_number
                                }
                              </span>

                            </div>

                          </td>


                          <td>

                            <span
                              className="fw-semibold"
                            >
                              {
                                sdg.goal_name
                              }
                            </span>

                          </td>


                          <td
                            className="text-end px-4"
                          >

                            <button
                              className="btn btn-sm btn-outline-primary me-2"
                              onClick={() =>
                                openEditModal(
                                  sdg
                                )
                              }
                            >
                              Edit
                            </button>


                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() =>
                                handleDelete(
                                  sdg
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
            className="modal-dialog modal-dialog-centered"
          >

            <div
              className="modal-content border-0 shadow"
            >

              <div
                className="modal-header"
              >

                <div>

                  <h5
                    className="modal-title fw-bold"
                  >
                    {editingSDG
                      ? "Edit SDG Goal"
                      : "Add SDG Goal"}
                  </h5>

                  <small
                    className="text-muted"
                  >
                    Enter the SDG information.
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

                <div
                  className="modal-body"
                >

                  {/* NUMBER */}

                  <div className="mb-3">

                    <label
                      className="form-label fw-semibold"
                    >
                      Goal Number
                    </label>

                    <input
                      type="number"
                      name="goal_number"
                      className="form-control"
                      min="1"
                      max="17"
                      value={
                        form.goal_number
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="1"
                      required
                    />

                    <div
                      className="form-text"
                    >
                      SDG numbers range from
                      1 to 17.
                    </div>

                  </div>


                  {/* NAME */}

                  <div className="mb-3">

                    <label
                      className="form-label fw-semibold"
                    >
                      Goal Name
                    </label>

                    <input
                      type="text"
                      name="goal_name"
                      className="form-control"
                      value={
                        form.goal_name
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="No Poverty"
                      required
                    />

                  </div>

                </div>


                <div
                  className="modal-footer"
                >

                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={
                      closeModal
                    }
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

                      editingSDG
                        ? "Update SDG"
                        : "Save SDG"

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