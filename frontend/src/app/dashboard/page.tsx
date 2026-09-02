"use client";

import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { logout } from "@/lib/auth";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-slate-50">

        {/* Header */}
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600 text-lg font-bold text-white">
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

        {/* Dashboard */}
        <div className="mx-auto max-w-7xl px-6 py-8">

          {/* Welcome */}
          <div className="mb-8">
            <p className="text-sm font-medium text-sky-600">
              Healthcare Dashboard
            </p>

            <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              Welcome back
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Manage patients and monitor live heart-rate sessions.
            </p>
          </div>

          {/* Statistics */}
          <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
                  👥
                </div>

                <span className="text-xs font-medium text-slate-400">
                  Total
                </span>
              </div>

              <p className="mt-5 text-3xl font-bold text-slate-900">
                24
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Registered patients
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
                1
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Active session
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
                8
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Completed sessions
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-xl">
                  🔵
                </div>

                <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-slate-400" />
                  Disconnected
                </span>
              </div>

              <p className="mt-5 text-lg font-bold text-slate-900">
                BLE Monitor
              </p>

              <p className="mt-1 text-sm text-slate-500">
                No device connected
              </p>
            </div>

          </section>

          {/* Main Sections */}
          <section className="mt-8 grid gap-6 lg:grid-cols-3">

            {/* Recent Patients */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">

              <div className="flex items-center justify-between">

                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Recent Patients
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Quickly access patient records and monitoring sessions.
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

                <div className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 font-semibold text-sky-700">
                      RS
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Rahul Sharma
                      </p>

                      <p className="text-xs text-slate-500">
                        Patient ID: PT-001
                      </p>
                    </div>

                  </div>

                  <Link
                    href="/patients"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    View
                  </Link>
                </div>

                <div className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 font-semibold text-violet-700">
                      AP
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Ananya Patel
                      </p>

                      <p className="text-xs text-slate-500">
                        Patient ID: PT-002
                      </p>
                    </div>

                  </div>

                  <Link
                    href="/patients"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    View
                  </Link>
                </div>

                <div className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-700">
                      VK
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Vikram Kumar
                      </p>

                      <p className="text-xs text-slate-500">
                        Patient ID: PT-003
                      </p>
                    </div>

                  </div>

                  <Link
                    href="/patients"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    View
                  </Link>
                </div>

              </div>
            </div>

            {/* Quick Actions */}
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

                  <span className="text-slate-400">
                    →
                  </span>
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

                  <span className="text-slate-400">
                    →
                  </span>
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