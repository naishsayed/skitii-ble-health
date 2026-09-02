"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { logout } from "@/lib/auth";

type Patient = {
  _id: string;
  name: string;
  age: number;
  gender: string;
};

type Session = {
  _id: string;
  patientId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  deviceId?: string;
  status: string;
  heartRateReadings: number[];
  rrIntervals?: number[];
  averageHeartRate?: number;
  minHeartRate?: number;
  maxHeartRate?: number;
  rmssd?: number;
};

export default function SessionsPage() {
  const [sessions, setSessions] =
    useState<Session[]>([]);

  const [patients, setPatients] =
    useState<Patient[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // --------------------------------
  // Load sessions and patients
  // --------------------------------

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        sessionsResponse,
        patientsResponse,
      ] = await Promise.all([
        api("/sessions"),
        api("/patients"),
      ]);

      if (
        !sessionsResponse.ok ||
        !patientsResponse.ok
      ) {
        throw new Error(
          "Unable to load data",
        );
      }

      const sessionsData =
        await sessionsResponse.json();

      const patientsData =
        await patientsResponse.json();

      setSessions(sessionsData);
      setPatients(patientsData);
    } catch (error) {
      console.error(error);

      setError(
        "Unable to load session history.",
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------
  // Find patient name
  // --------------------------------

  const getPatientName = (
    patientId: string,
  ) => {
    const patient = patients.find(
      (item) =>
        item._id === patientId,
    );

    return patient?.name || "Unknown patient";
  };

  // --------------------------------
  // Format duration
  // --------------------------------

  const formatDuration = (
    seconds?: number,
  ) => {
    if (
      seconds === undefined ||
      seconds === null
    ) {
      return "—";
    }

    const minutes = Math.floor(
      seconds / 60,
    );

    const remainingSeconds =
      seconds % 60;

    if (minutes === 0) {
      return `${remainingSeconds}s`;
    }

    return `${minutes}m ${remainingSeconds}s`;
  };

  // --------------------------------
  // Format date
  // --------------------------------

  const formatDate = (
    date?: string,
  ) => {
    if (!date) {
      return "—";
    }

    return new Date(
      date,
    ).toLocaleString();
  };

  // --------------------------------
  // Format device name
  // --------------------------------

  const formatDevice = (
    deviceId?: string,
  ) => {
    if (!deviceId) {
      return "—";
    }

    // Keep long Bluetooth IDs
    // from making the table too wide.
    if (deviceId.length > 20) {
      return `${deviceId.slice(
        0,
        8,
      )}...`;
    }

    return deviceId;
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-slate-50">
        {/* --------------------------------
            Header
        -------------------------------- */}

        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
            <a
              href="/dashboard"
              className="text-xl font-bold text-sky-600"
            >
              Skitii Health
            </a>

            <div className="flex items-center gap-3">
              <a
                href="/sessions/new"
                className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
              >
                New Session
              </a>

              <button
                onClick={logout}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* --------------------------------
            Page content
        -------------------------------- */}

        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-sky-600">
                Healthcare Monitoring
              </p>

              <h1 className="mt-1 text-3xl font-bold text-slate-900">
                Session History
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Review previous patient
                monitoring sessions and
                physiological readings.
              </p>
            </div>

            <button
              onClick={loadData}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Refresh
            </button>
          </div>

          {/* Error */}

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* --------------------------------
              Session table
          -------------------------------- */}

          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {loading ? (
              <div className="p-10 text-center text-sm text-slate-500">
                Loading session history...
              </div>
            ) : sessions.length === 0 ? (
              <div className="p-10 text-center">
                <p className="font-medium text-slate-700">
                  No sessions yet
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Start a monitoring session
                  to see it here.
                </p>

                <a
                  href="/sessions/new"
                  className="mt-5 inline-block rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-700"
                >
                  Start New Session
                </a>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1200px]">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Patient
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Started
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Duration
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Avg HR
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        HR Range
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        HRV / RMSSD
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Readings
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        BLE Device
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {sessions.map(
                      (session) => (
                        <tr
                          key={
                            session._id
                          }
                          className="transition hover:bg-slate-50"
                        >
                          {/* Patient */}

                          <td className="px-6 py-5">
                        <a
                            href={`/sessions/${session._id}`}
                            className="group"
                        >
                            <p className="text-sm font-semibold text-slate-900 group-hover:text-sky-600">
                            {getPatientName(
                                session.patientId,
                            )}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                            ID: {session.patientId}
                            </p>

                            <p className="mt-1 text-xs font-medium text-sky-600">
                            View details →
                            </p>
                        </a>
                        </td>

                          {/* Started */}

                          <td className="px-6 py-5 text-sm text-slate-600">
                            {formatDate(
                              session.startTime,
                            )}
                          </td>

                          {/* Duration */}

                          <td className="px-6 py-5 text-sm text-slate-600">
                            {formatDuration(
                              session.duration,
                            )}
                          </td>

                          {/* Average HR */}

                          <td className="px-6 py-5">
                            <p className="text-sm font-semibold text-slate-900">
                              {session.averageHeartRate !==
                              undefined
                                ? `${session.averageHeartRate} BPM`
                                : "—"}
                            </p>
                          </td>

                          {/* HR range */}

                          <td className="px-6 py-5 text-sm text-slate-600">
                            {session.minHeartRate !==
                              undefined &&
                            session.maxHeartRate !==
                              undefined
                              ? `${session.minHeartRate} - ${session.maxHeartRate} BPM`
                              : "—"}
                          </td>

                          {/* RMSSD */}

                          <td className="px-6 py-5">
                            <p className="text-sm font-semibold text-violet-600">
                              {session.rmssd !==
                              undefined
                                ? `${session.rmssd} ms`
                                : "—"}
                            </p>
                          </td>

                          {/* Readings */}

                          <td className="px-6 py-5 text-sm text-slate-600">
                            {
                              session
                                .heartRateReadings
                                ?.length
                            }
                          </td>

                          {/* BLE device */}

                          <td className="px-6 py-5 text-sm text-slate-600">
                            {formatDevice(
                              session.deviceId,
                            )}
                          </td>

                          {/* Status */}

                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                                session.status ===
                                "completed"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : session.status ===
                                      "error"
                                    ? "bg-red-50 text-red-700"
                                    : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {
                                session.status
                              }
                            </span>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}