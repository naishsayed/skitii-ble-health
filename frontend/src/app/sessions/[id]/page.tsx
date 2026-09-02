"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { api } from "@/lib/api";
import { logout } from "@/lib/auth";

type Patient = {
  _id: string;
  name: string;
  age: number;
  gender: string;
  phone?: string;
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

export default function SessionDetailsPage() {
  const params = useParams();

  const sessionId = params.id as string;

  const [session, setSession] =
    useState<Session | null>(null);

  const [patient, setPatient] =
    useState<Patient | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // --------------------------------
  // Load session + patient
  // --------------------------------

  useEffect(() => {
    loadData();
  }, [sessionId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const sessionResponse =
        await api(
          `/sessions/${sessionId}`,
        );

      if (!sessionResponse.ok) {
        throw new Error(
          "Unable to load session",
        );
      }

      const sessionData =
        await sessionResponse.json();

      setSession(sessionData);

      // Load patients so we can
      // display the patient's name.
      const patientsResponse =
        await api("/patients");

      if (patientsResponse.ok) {
        const patients =
          await patientsResponse.json();

        const foundPatient =
          patients.find(
            (item: Patient) =>
              item._id ===
              sessionData.patientId,
          );

        setPatient(
          foundPatient || null,
        );
      }
    } catch (error) {
      console.error(error);

      setError(
        "Unable to load session details.",
      );
    } finally {
      setLoading(false);
    }
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
  // Loading state
  // --------------------------------

  if (loading) {
    return (
      <ProtectedRoute>
        <main className="flex min-h-screen items-center justify-center bg-slate-50">
          <p className="text-sm text-slate-500">
            Loading session details...
          </p>
        </main>
      </ProtectedRoute>
    );
  }

  // --------------------------------
  // Error / missing session
  // --------------------------------

  if (error || !session) {
    return (
      <ProtectedRoute>
        <main className="min-h-screen bg-slate-50">
          <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
              <a
                href="/dashboard"
                className="text-xl font-bold text-sky-600"
              >
                Skitii Health
              </a>

              <button
                onClick={logout}
                className="text-sm text-slate-600 hover:text-slate-900"
              >
                Logout
              </button>
            </div>
          </header>

          <div className="mx-auto max-w-5xl px-6 py-10">
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
              <h1 className="text-lg font-semibold text-red-800">
                Unable to load session
              </h1>

              <p className="mt-2 text-sm text-red-700">
                {error ||
                  "Session not found."}
              </p>

              <a
                href="/sessions"
                className="mt-5 inline-block rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-700"
              >
                Back to Session History
              </a>
            </div>
          </div>
        </main>
      </ProtectedRoute>
    );
  }

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
                href="/sessions"
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Session History
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
            Main content
        -------------------------------- */}

        <div className="mx-auto max-w-7xl px-6 py-8">
          {/* Page heading */}

          <div>
            <p className="text-sm font-medium text-sky-600">
              Monitoring Session
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Session Details
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Detailed physiological data
              recorded during this monitoring
              session.
            </p>
          </div>

          {/* --------------------------------
              Patient + status
          -------------------------------- */}

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {/* Patient */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">
                Patient
              </h2>

              <div className="mt-5">
                <p className="text-xl font-bold text-slate-900">
                  {patient?.name ||
                    "Unknown patient"}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Patient ID:{" "}
                  {session.patientId}
                </p>

                {patient && (
                  <div className="mt-5 grid grid-cols-2 gap-4">
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs text-slate-500">
                        Age
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {patient.age}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs text-slate-500">
                        Gender
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {patient.gender}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Status */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">
                Session Information
              </h2>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">
                    Status
                  </p>

                  <span
                    className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                      session.status ===
                      "completed"
                        ? "bg-emerald-50 text-emerald-700"
                        : session.status ===
                            "error"
                          ? "bg-red-50 text-red-700"
                          : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {session.status}
                  </span>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">
                    Duration
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {formatDuration(
                      session.duration,
                    )}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">
                    Start Time
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {formatDate(
                      session.startTime,
                    )}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">
                    End Time
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {formatDate(
                      session.endTime,
                    )}
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* --------------------------------
              BLE device
          -------------------------------- */}

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Bluetooth Device
            </h2>

            <p className="mt-3 text-sm text-slate-600">
              Device identifier
            </p>

            <p className="mt-1 break-all text-sm font-medium text-slate-900">
              {session.deviceId ||
                "Not available"}
            </p>
          </section>

          {/* --------------------------------
              Physiological summary
          -------------------------------- */}

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Physiological Summary
            </h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {/* Average */}

              <div className="rounded-xl bg-sky-50 p-5 text-center">
                <p className="text-sm text-slate-500">
                  Average HR
                </p>

                <p className="mt-2 text-3xl font-bold text-sky-600">
                  {session.averageHeartRate !==
                  undefined
                    ? session.averageHeartRate
                    : "--"}
                </p>

                <p className="text-xs text-slate-500">
                  BPM
                </p>
              </div>

              {/* Minimum */}

              <div className="rounded-xl bg-slate-50 p-5 text-center">
                <p className="text-sm text-slate-500">
                  Minimum HR
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {session.minHeartRate !==
                  undefined
                    ? session.minHeartRate
                    : "--"}
                </p>

                <p className="text-xs text-slate-500">
                  BPM
                </p>
              </div>

              {/* Maximum */}

              <div className="rounded-xl bg-slate-50 p-5 text-center">
                <p className="text-sm text-slate-500">
                  Maximum HR
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {session.maxHeartRate !==
                  undefined
                    ? session.maxHeartRate
                    : "--"}
                </p>

                <p className="text-xs text-slate-500">
                  BPM
                </p>
              </div>

              {/* RMSSD */}

              <div className="rounded-xl bg-violet-50 p-5 text-center">
                <p className="text-sm text-slate-500">
                  HRV / RMSSD
                </p>

                <p className="mt-2 text-3xl font-bold text-violet-600">
                  {session.rmssd !==
                  undefined
                    ? session.rmssd
                    : "--"}
                </p>

                <p className="text-xs text-slate-500">
                  ms
                </p>
              </div>

              {/* Readings */}

              <div className="rounded-xl bg-slate-50 p-5 text-center">
                <p className="text-sm text-slate-500">
                  Total Readings
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {
                    session
                      .heartRateReadings
                      ?.length
                  }
                </p>

                <p className="text-xs text-slate-500">
                  measurements
                </p>
              </div>
            </div>
          </section>

          {/* --------------------------------
              Heart rate readings
          -------------------------------- */}

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Heart Rate Readings
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Recorded BPM values received
                  from the BLE device.
                </p>
              </div>

              <p className="text-sm font-medium text-slate-600">
                {
                  session
                    .heartRateReadings
                    ?.length || 0
                }{" "}
                readings
              </p>
            </div>

            {session.heartRateReadings
              ?.length > 0 ? (
              <div className="mt-5 flex max-h-64 flex-wrap gap-2 overflow-y-auto">
                {session.heartRateReadings.map(
                  (heartRate, index) => (
                    <span
                      key={index}
                      className="rounded-lg bg-sky-50 px-3 py-2 text-sm font-medium text-sky-700"
                    >
                      {heartRate} BPM
                    </span>
                  ),
                )}
              </div>
            ) : (
              <p className="mt-5 text-sm text-slate-500">
                No heart-rate readings
                recorded.
              </p>
            )}
          </section>

          {/* --------------------------------
              RR intervals
          -------------------------------- */}

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                RR Intervals
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Beat-to-beat intervals received
                from the BLE heart-rate
                measurement characteristic.
              </p>
            </div>

            {session.rrIntervals &&
            session.rrIntervals.length >
              0 ? (
              <div className="mt-5 flex max-h-64 flex-wrap gap-2 overflow-y-auto">
                {session.rrIntervals.map(
                  (rr, index) => (
                    <span
                      key={index}
                      className="rounded-lg bg-violet-50 px-3 py-2 text-sm font-medium text-violet-700"
                    >
                      {rr} ms
                    </span>
                  ),
                )}
              </div>
            ) : (
              <div className="mt-5 rounded-xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">
                  No RR interval data was
                  received during this
                  session.
                </p>
              </div>
            )}
          </section>

          {/* Back */}

          <div className="mt-8">
            <a
              href="/sessions"
              className="inline-block rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-700"
            >
              ← Back to Session History
            </a>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}