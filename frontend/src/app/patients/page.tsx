"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

type Patient = {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  status: "Active" | "Inactive";
};

type ApiPatient = {
  _id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  isActive: boolean;
};

const formatPatient = (p: ApiPatient): Patient => ({
  id: p._id,
  name: p.name,
  age: p.age,
  gender: p.gender,
  phone: p.phone,
  status: p.isActive ? "Active" : "Inactive",
});

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);

  const [editingPatient, setEditingPatient] =
    useState<Patient | null>(null);

  const [viewingPatient, setViewingPatient] =
    useState<Patient | null>(null);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // -----------------------------
  // Load patients
  // -----------------------------

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api("/patients");

      if (!response.ok) {
        throw new Error("Failed to fetch patients");
      }

      const data: ApiPatient[] = await response.json();
      setPatients(data.map(formatPatient));
    } catch (err) {
      console.error(err);
      setError("Unable to load patients from the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // -----------------------------
  // Search
  // -----------------------------

  const filteredPatients = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) return patients;

    return patients.filter(
      (patient) =>
        patient.name.toLowerCase().includes(value) ||
        patient.id.toLowerCase().includes(value) ||
        patient.phone.toLowerCase().includes(value),
    );
  }, [patients, search]);

  // -----------------------------
  // Form
  // -----------------------------

  const resetForm = () => {
    setName("");
    setAge("");
    setGender("");
    setPhone("");
    setEditingPatient(null);
    setError("");
  };

  const openAddForm = () => {
    resetForm();
    setSuccess("");
    setShowForm(true);
  };

  const openEditForm = (patient: Patient) => {
    setName(patient.name);
    setAge(String(patient.age));
    setGender(patient.gender);
    setPhone(patient.phone);
    setEditingPatient(patient);
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const closeForm = () => {
    resetForm();
    setShowForm(false);
  };

  // -----------------------------
  // View patient
  // -----------------------------

  const viewPatient = async (id: string) => {
    try {
      setError("");

      const response = await api(`/patients/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch patient");
      }

      const data: ApiPatient = await response.json();

      setViewingPatient(formatPatient(data));
      setShowView(true);
    } catch (err) {
      console.error(err);
      setError("Unable to load patient details.");
    }
  };

  const closeView = () => {
    setViewingPatient(null);
    setShowView(false);
  };

  // -----------------------------
  // Add / Edit patient
  // -----------------------------

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim() || !age || !gender || !phone.trim()) {
      setError("Please fill in all patient details.");
      return;
    }

    const numericAge = Number(age);

    if (numericAge <= 0 || numericAge > 120) {
      setError("Please enter a valid patient age.");
      return;
    }

    const patientData = {
      name: name.trim(),
      age: numericAge,
      gender,
      phone: phone.trim(),
    };

    try {
      setSubmitting(true);

      const response = editingPatient
        ? await api(`/patients/${editingPatient.id}`, {
            method: "PATCH",
            body: JSON.stringify(patientData),
          })
        : await api("/patients", {
            method: "POST",
            body: JSON.stringify(patientData),
          });

      if (!response.ok) {
        throw new Error("Patient request failed");
      }

      await fetchPatients();

      setSuccess(
        editingPatient
          ? "Patient updated successfully."
          : "Patient added successfully.",
      );

      closeForm();
    } catch (err) {
      console.error(err);

      setError(
        editingPatient
          ? "Unable to update patient."
          : "Unable to add patient.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // -----------------------------
  // Deactivate patient
  // -----------------------------

  const togglePatientStatus = async (patient: Patient) => {
    setError("");
    setSuccess("");

    if (patient.status === "Inactive") {
      setError(
        "Inactive patients cannot be activated from this screen.",
      );
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to deactivate ${patient.name}?`,
      )
    ) {
      return;
    }

    try {
      const response = await api(`/patients/${patient.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to deactivate patient");
      }

      await fetchPatients();
      setSuccess("Patient deactivated successfully.");
    } catch (err) {
      console.error(err);
      setError("Unable to deactivate patient.");
    }
  };

  // -----------------------------
  // Logout
  // -----------------------------

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  // -----------------------------
  // UI
  // -----------------------------

  return (
    <ProtectedRoute>
    <main className="min-h-screen bg-slate-50">

      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

          <div className="flex items-center gap-3">
            <a
              href="/dashboard"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600 text-lg font-bold text-white"
            >
              S
            </a>

            <div>
              <h1 className="text-lg font-bold text-slate-900">
                Skitii Health
              </h1>

              <p className="text-xs text-slate-500">
                Patient Monitoring
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-800">
                Healthcare Staff
              </p>

              <p className="text-xs text-slate-500">
                Staff Account
              </p>
            </div>

            <button
              onClick={logout}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Logout
            </button>
          </div>

        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* Heading */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <p className="text-sm font-medium text-sky-600">
              Patient Management
            </p>

            <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              Patients
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Add, search, edit and manage patient records.
            </p>
          </div>

          <button
            onClick={openAddForm}
            className="rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
          >
            + Add Patient
          </button>

        </div>

        {/* Messages */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        {/* Search */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <label
            htmlFor="patient-search"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Search patients
          </label>

          <div className="relative">

            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              🔍
            </span>

            <input
              id="patient-search"
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, patient ID or phone..."
              className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />

          </div>
        </div>

        {/* Table */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[900px]">

              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Patient
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Age
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Gender
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Phone
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center"
                    >
                      <p className="text-sm font-medium text-slate-700">
                        Loading patients...
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Connecting to the patient database.
                      </p>
                    </td>
                  </tr>
                ) : filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <tr
                      key={patient.id}
                      className="transition hover:bg-slate-50"
                    >

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 font-semibold text-sky-700">
                            {patient.name
                              .split(" ")
                              .map((word) => word[0])
                              .join("")
                              .slice(0, 2)}
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {patient.name}
                            </p>

                            <p className="text-xs text-slate-500">
                              {patient.id}
                            </p>
                          </div>

                        </div>
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-700">
                        {patient.age}
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-700">
                        {patient.gender}
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-700">
                        {patient.phone}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                            patient.status === "Active"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {patient.status}
                        </span>
                      </td>

                      <td className="px-6 py-5">

                        <div className="flex justify-end gap-2">

                          <button
                            onClick={() =>
                              viewPatient(patient.id)
                            }
                            className="rounded-lg border border-sky-200 px-3 py-2 text-xs font-medium text-sky-700 transition hover:bg-sky-50"
                          >
                            View
                          </button>

                          <button
                            onClick={() =>
                              openEditForm(patient)
                            }
                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                          >
                            Edit
                          </button>

                          {patient.status === "Active" && (
                            <button
                              onClick={() =>
                                togglePatientStatus(patient)
                              }
                              className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50"
                            >
                              Deactivate
                            </button>
                          )}

                        </div>

                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center"
                    >
                      <p className="text-sm font-medium text-slate-700">
                        No patients found
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Try a different search term or add a new patient.
                      </p>
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>
        </div>

        <p className="mt-4 text-xs text-slate-500">
          Showing {filteredPatients.length} of {patients.length} patients
        </p>

      </div>

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-6 py-8">

          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">

            <div className="flex items-start justify-between">

              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {editingPatient
                    ? "Edit Patient"
                    : "Add Patient"}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {editingPatient
                    ? "Update the patient's information."
                    : "Enter the patient's information."}
                </p>
              </div>

              <button
                onClick={closeForm}
                className="rounded-lg px-2 py-1 text-xl text-slate-400 hover:bg-slate-100"
                aria-label="Close"
              >
                ×
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-5"
            >

              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Full name
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Enter patient's full name"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">

                <div>
                  <label
                    htmlFor="age"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Age
                  </label>

                  <input
                    id="age"
                    type="number"
                    min="1"
                    max="120"
                    value={age}
                    onChange={(event) =>
                      setAge(event.target.value)
                    }
                    placeholder="Age"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="gender"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Gender
                  </label>

                  <select
                    id="gender"
                    value={gender}
                    onChange={(event) =>
                      setGender(event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  >
                    <option value="">
                      Select gender
                    </option>
                    <option value="Male">
                      Male
                    </option>
                    <option value="Female">
                      Female
                    </option>
                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>

              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Phone number
                </label>

                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(event) =>
                    setPhone(event.target.value)
                  }
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={submitting}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
                >
                  {submitting
                    ? "Saving..."
                    : editingPatient
                      ? "Save Changes"
                      : "Add Patient"}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

      {/* View Patient Modal */}
      {showView && viewingPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-6 py-8">

          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-sky-600">
                  Patient Details
                </p>

                <h3 className="mt-1 text-xl font-bold text-slate-900">
                  {viewingPatient.name}
                </h3>
              </div>

              <button
                onClick={closeView}
                className="rounded-lg px-2 py-1 text-xl text-slate-400 hover:bg-slate-100"
                aria-label="Close"
              >
                ×
              </button>

            </div>

            <div className="mt-6 space-y-4">

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Patient ID
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {viewingPatient.id}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs text-slate-500">
                    Age
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {viewingPatient.age}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs text-slate-500">
                    Gender
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {viewingPatient.gender}
                  </p>
                </div>

              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs text-slate-500">
                  Phone
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {viewingPatient.phone}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs text-slate-500">
                  Status
                </p>

                <span
                  className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                    viewingPatient.status === "Active"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {viewingPatient.status}
                </span>
              </div>

            </div>

            <div className="mt-6 flex justify-end">

              <button
                onClick={closeView}
                className="rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-700"
              >
                Close
              </button>

            </div>

          </div>
        </div>
      )}

    </main>
    </ProtectedRoute>
  );
}