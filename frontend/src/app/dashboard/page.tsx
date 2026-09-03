"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { api } from "@/lib/api";
import { logout } from "@/lib/auth";

type Patient = {
  _id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  isActive: boolean;
};

type Session = {
  _id: string;
  patientId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  deviceId?: string;
  status: "active" | "paused" | "completed" | "error";
  heartRateReadings?: number[];
  averageHeartRate?: number;
  minHeartRate?: number;
  maxHeartRate?: number;
  rmssd?: number;
};

export default function DashboardPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [patientsResponse, sessionsResponse] = await Promise.all([
        api("/patients"),
        api("/sessions"),
      ]);

      if (!patientsResponse.ok || !sessionsResponse.ok) {
        throw new Error("Unable to load dashboard data.");
      }

      const patientsData: Patient[] = await patientsResponse.json();
      const sessionsData: Session[] = await sessionsResponse.json();

      setPatients(patientsData);
      setSessions(sessionsData);
    } catch (err) {
      console.error(err);
      setError("Unable to load dashboard data from the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const activePatients = useMemo(
    () => patients.filter((patient) => patient.isActive),
    [patients],
  );

  const activeSessions = useMemo(
    () => sessions.filter((session) => session.status === "active"),
    [sessions],
  );

  const todayCompletedSessions = useMemo(() => {
    const today = new Date();

    return sessions.filter((session) => {
      if (session.status !== "completed" || !session.endTime) {
        return false;
      }

      const date = new Date(session.endTime);

      return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
      );
    });
  }, [sessions]);

  const latestSession = useMemo(() => {
    if (sessions.length === 0) {
      return null;
    }

    return [...sessions].sort(
      (a, b) =>
        new Date(b.startTime).getTime() -
        new Date(a.startTime).getTime(),
    )[0];
  }, [sessions]);

  const latestHeartRate = latestSession?.heartRateReadings?.length
    ? latestSession.heartRateReadings[
        latestSession.heartRateReadings.length - 1
      ]
    : null;

  const recentPatients = useMemo(
    () => patients.slice(0, 5),
    [patients],
  );

  const patientName = (patientId: string) => {
    const patient = patients.find((item) => item._id === patientId);
    return patient?.name || "Unknown patient";
  };

  const formatDuration = (seconds?: number) => {
    if (seconds === undefined || seconds === null) {
      return "—";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes === 0) {
      return `${remainingSeconds}s`;
    }

    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatDate = (value?: string) => {
    if (!value) {
      return "—";
    }

    return new Date(value).toLocaleString();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-slate-50">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-lg font-bold text-white">
                S
              </div>

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

        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-sky-600">
                Healthcare Dashboard
              </p>

              <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                Welcome back
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Real-time overview of patients and monitoring sessions.
              </p>
            </div>

            <button
              onClick={loadDashboard}
              disabled={loading}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
                  👥
                </div>

                <span className="text-xs font-medium text-slate-400">
                  Database
                </span>
              </div>

              <p className="mt-5 text-3xl font-bold text-slate-900">
                {loading ? "—" : patients.length}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Registered patients
              </p>

              <p className="mt-2 text-xs text-emerald-600">
                {activePatients.length} active
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-xl">
                  ❤️
                </div>

                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                  Live
                </span>
              </div>

              <p className="mt-5 text-3xl font-bold text-slate-900">
                {loading ? "—" : activeSessions.length}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Active sessions
              </p>

              <p className="mt-2 text-xs text-slate-400">
                From session database
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-xl">
                  📊
                </div>

                <span className="text-xs font-medium text-slate-400">
                  Today
                </span>
              </div>

              <p className="mt-5 text-3xl font-bold text-slate-900">
                {loading ? "—" : todayCompletedSessions.length}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Completed sessions
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Completed today
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-xl">
                  ❤️
                </div>

                <span className="text-xs font-medium text-slate-400">
                  Latest
                </span>
              </div>

              <p className="mt-5 text-3xl font-bold text-slate-900">
                {loading
                  ? "—"
                  : latestHeartRate !== null
                    ? `${latestHeartRate} BPM`
                    : "—"}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Latest recorded heart rate
              </p>

              <p className="mt-2 truncate text-xs text-slate-400">
                {latestSession
                  ? patientName(latestSession.patientId)
                  : "No sessions recorded"}
              </p>
            </div>
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Recent Patients
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Patient records loaded directly from MongoDB.
                  </p>
                </div>

                <Link
                  href="/patients"
                  className="text-sm font-semibold text-sky-600 hover:text-sky-700"
                >
                  View all
                </Link>
              </div>

              <div className="mt-6 divide-y divide-slate-100">
                {loading ? (
                  <div className="py-8 text-center text-sm text-slate-500">
                    Loading patients...
                  </div>
                ) : recentPatients.length === 0 ? (
                  <div className="py-8 text-center text-sm text-slate-500">
                    No patients found.
                  </div>
                ) : (
                  recentPatients.map((patient) => (
                    <div
                      key={patient._id}
                      className="flex items-center justify-between gap-4 py-4"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-100 font-semibold text-sky-700">
                          {getInitials(patient.name)}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {patient.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {patient.gender} · Age {patient.age} ·{" "}
                            {patient.isActive ? "Active" : "Inactive"}
                          </p>
                        </div>
                      </div>

                      <Link
                        href="/patients"
                        className="shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        View
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">
                Latest Session
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Most recent monitoring data from the database.
              </p>

              {latestSession ? (
                <div className="mt-6 space-y-4">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">
                      Patient
                    </p>

                    <p className="mt-1 font-semibold text-slate-900">
                      {patientName(latestSession.patientId)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-slate-200 p-3">
                      <p className="text-xs text-slate-500">
                        Average HR
                      </p>

                      <p className="mt-1 text-lg font-bold text-slate-900">
                        {latestSession.averageHeartRate
                          ? `${latestSession.averageHeartRate} BPM`
                          : "—"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-3">
                      <p className="text-xs text-slate-500">
                        Readings
                      </p>

                      <p className="mt-1 text-lg font-bold text-slate-900">
                        {latestSession.heartRateReadings?.length || 0}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-slate-200 p-3">
                      <p className="text-xs text-slate-500">
                        HR Range
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {latestSession.minHeartRate !== undefined &&
                        latestSession.maxHeartRate !== undefined
                          ? `${latestSession.minHeartRate}–${latestSession.maxHeartRate} BPM`
                          : "—"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-3">
                      <p className="text-xs text-slate-500">
                        Duration
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {formatDuration(latestSession.duration)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Started
                    </p>

                    <p className="mt-1 text-sm text-slate-700">
                      {formatDate(latestSession.startTime)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        latestSession.status === "completed"
                          ? "bg-emerald-50 text-emerald-700"
                          : latestSession.status === "active"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {latestSession.status}
                    </span>

                    <Link
                      href={`/sessions/${latestSession._id}`}
                      className="text-sm font-semibold text-sky-600 hover:text-sky-700"
                    >
                      View session
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-xl bg-slate-50 p-6 text-center">
                  <p className="text-sm text-slate-500">
                    No monitoring sessions found.
                  </p>

                  <Link
                    href="/sessions/new"
                    className="mt-3 inline-block text-sm font-semibold text-sky-600"
                  >
                    Start monitoring
                  </Link>
                </div>
              )}
            </div>
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Recent Monitoring Sessions
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Real session records stored in MongoDB.
                  </p>
                </div>

                <Link
                  href="/sessions"
                  className="text-sm font-semibold text-sky-600 hover:text-sky-700"
                >
                  View all
                </Link>
              </div>

              <div className="mt-6 overflow-x-auto">
                {sessions.length === 0 ? (
                  <div className="py-8 text-center text-sm text-slate-500">
                    No sessions found.
                  </div>
                ) : (
                  <table className="w-full min-w-[650px] text-left">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs text-slate-500">
                        <th className="pb-3 font-medium">
                          Patient
                        </th>
                        <th className="pb-3 font-medium">
                          Heart Rate
                        </th>
                        <th className="pb-3 font-medium">
                          Readings
                        </th>
                        <th className="pb-3 font-medium">
                          Duration
                        </th>
                        <th className="pb-3 font-medium">
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {[...sessions]
                        .sort(
                          (a, b) =>
                            new Date(b.startTime).getTime() -
                            new Date(a.startTime).getTime(),
                        )
                        .slice(0, 5)
                        .map((session) => (
                          <tr
                            key={session._id}
                            className="border-b border-slate-100 last:border-0"
                          >
                            <td className="py-4 text-sm font-medium text-slate-900">
                              {patientName(session.patientId)}
                            </td>

                            <td className="py-4 text-sm text-slate-700">
                              {session.averageHeartRate
                                ? `${session.averageHeartRate} BPM`
                                : "—"}
                            </td>

                            <td className="py-4 text-sm text-slate-700">
                              {session.heartRateReadings?.length || 0}
                            </td>

                            <td className="py-4 text-sm text-slate-700">
                              {formatDuration(session.duration)}
                            </td>

                            <td className="py-4">
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-700">
                                {session.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">
                Quick Actions
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Common monitoring tasks.
              </p>

              <div className="mt-6 space-y-3">
                <Link
                  href="/patients"
                  className="flex items-center justify-between rounded-xl border border-slate-200 p-4 transition hover:border-sky-200 hover:bg-sky-50"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Manage Patients
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Add or manage patient records
                    </p>
                  </div>

                  <span className="text-slate-400">→</span>
                </Link>

                <Link
                  href="/sessions"
                  className="flex items-center justify-between rounded-xl border border-slate-200 p-4 transition hover:border-sky-200 hover:bg-sky-50"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Session History
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Review previous sessions
                    </p>
                  </div>

                  <span className="text-slate-400">→</span>
                </Link>

                <Link
                  href="/sessions/new"
                  className="flex items-center justify-between rounded-xl bg-sky-600 p-4 text-white transition hover:bg-sky-700"
                >
                  <div>
                    <p className="text-sm font-semibold">
                      Start Monitoring
                    </p>

                    <p className="mt-1 text-xs text-sky-100">
                      Start a new patient session
                    </p>
                  </div>

                  <span>→</span>
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </ProtectedRoute>
  );
}