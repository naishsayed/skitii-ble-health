"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { logout } from "@/lib/auth";

type Patient = {
  _id: string;
  name: string;
  age: number;
  gender: string;
};

type Reading = {
  bpm: number;
  rrIntervals: number[];
  time: string;
};

const HEART_RATE_SERVICE =
  "0000180d-0000-1000-8000-00805f9b34fb";

const HEART_RATE_CHARACTERISTIC =
  "00002a37-0000-1000-8000-00805f9b34fb";

const OPTIONAL_BLE_SERVICES = [
  HEART_RATE_SERVICE,
  "00001800-0000-1000-8000-00805f9b34fb",
  "0000180a-0000-1000-8000-00805f9b34fb",
  "0000180f-0000-1000-8000-00805f9b34fb",
  "0000feea-0000-1000-8000-00805f9b34fb",
  "0000fee7-0000-1000-8000-00805f9b34fb",
];

export default function NewSessionPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientId, setPatientId] = useState("");

  const [device, setDevice] = useState<any>(null);

  const [status, setStatus] =
    useState("Disconnected");

  const [bpm, setBpm] =
    useState<number | null>(null);

  const [rmssd, setRmssd] =
    useState<number | null>(null);

  const [readings, setReadings] =
    useState<Reading[]>([]);

  const [running, setRunning] =
    useState(false);

  const [seconds, setSeconds] =
    useState(0);

  const [error, setError] =
    useState("");

  const startTime =
    useRef<Date | null>(null);

  const deviceRef =
    useRef<any>(null);

  const calculateRMSSD = (
    rrIntervals: number[],
  ) => {
    if (rrIntervals.length < 2) {
      return undefined;
    }

    let sum = 0;

    for (
      let i = 1;
      i < rrIntervals.length;
      i++
    ) {
      const difference =
        rrIntervals[i] -
        rrIntervals[i - 1];

      sum +=
        difference * difference;
    }

    const mean =
      sum /
      (rrIntervals.length - 1);

    return Math.round(
      Math.sqrt(mean),
    );
  };

  useEffect(() => {
    api("/patients")
      .then(async (response) => {
        if (!response.ok) {
          setError(
            "Unable to load patients.",
          );
          return;
        }

        const data =
          await response.json();

        setPatients(data);
      })
      .catch(() => {
        setError(
          "Unable to load patients.",
        );
      });
  }, []);

  useEffect(() => {
    if (!running) {
      return;
    }

    const timer = setInterval(() => {
      setSeconds(
        (value) => value + 1,
      );
    }, 1000);

    return () =>
      clearInterval(timer);
  }, [running]);

  const formatTime = (
    value: number,
  ) => {
    const minutes =
      Math.floor(value / 60)
        .toString()
        .padStart(2, "0");

    const seconds =
      (value % 60)
        .toString()
        .padStart(2, "0");

    return `${minutes}:${seconds}`;
  };

  const handleHeartRate = (
    event: Event,
  ) => {
    const characteristic =
      event.target as any;

    if (!characteristic.value) {
      return;
    }

    const data =
      characteristic.value;

    const flags =
      data.getUint8(0);

    const is16Bit =
      flags & 0x01;

    let index = 1;

    const heartRate = is16Bit
      ? data.getUint16(
          index,
          true,
        )
      : data.getUint8(index);

    index +=
      is16Bit ? 2 : 1;

    const hasRR =
      flags & 0x10;

    const rrIntervals: number[] =
      [];

    if (hasRR) {
      while (
        index + 1 <
        data.byteLength
      ) {
        const rr =
          data.getUint16(
            index,
            true,
          );

        rrIntervals.push(
          Math.round(
            (rr / 1024) * 1000,
          ),
        );

        index += 2;
      }
    }

    console.log(
      "REAL BLE HEART RATE:",
      heartRate,
    );

    console.log(
      "REAL BLE RR INTERVALS:",
      rrIntervals,
    );

    const reading: Reading = {
      bpm: heartRate,
      rrIntervals,
      time:
        new Date().toISOString(),
    };

    setBpm(heartRate);

    setReadings((current) => {
      const updatedReadings = [
        ...current,
        reading,
      ];

      const allRR =
        updatedReadings.flatMap(
          (item) =>
            item.rrIntervals,
        );

      const currentRMSSD =
        calculateRMSSD(allRR);

      if (
        currentRMSSD !==
        undefined
      ) {
        setRmssd(currentRMSSD);
      }

      return updatedReadings;
    });
  };

  const discoverBLEServices = async (
    server: any,
  ) => {
    console.log(
      "================================",
    );

    console.log(
      "STARTING BLE SERVICE DISCOVERY",
    );

    console.log(
      "================================",
    );

    const services =
      await server.getPrimaryServices();

    console.log(
      "ALL BLE SERVICES:",
      services,
    );

    let heartRateCharacteristic:
      any = null;

    for (const service of services) {
      console.log(
        "--------------------------------",
      );

      console.log(
        "SERVICE UUID:",
        service.uuid,
      );

      let characteristics: any[] =
        [];

      try {
        characteristics =
          await service.getCharacteristics();
      } catch (error) {
        console.error(
          "CHARACTERISTIC DISCOVERY ERROR:",
          error,
        );

        continue;
      }

      console.log(
        "CHARACTERISTICS:",
        characteristics,
      );

      for (
        const characteristic of characteristics
      ) {
        console.log(
          "CHARACTERISTIC UUID:",
          characteristic.uuid,
        );

        console.log(
          "PROPERTIES:",
          characteristic.properties,
        );

        const properties =
          characteristic.properties;

        if (
          properties.write ||
          properties.writeWithoutResponse
        ) {
          console.log(
            "WRITABLE CHARACTERISTIC FOUND:",
            characteristic.uuid,
          );
        }

        if (
          properties.notify ||
          properties.indicate
        ) {
          console.log(
            "NOTIFICATION CHARACTERISTIC FOUND:",
            characteristic.uuid,
          );
        }

        if (
          properties.read
        ) {
          console.log(
            "READABLE CHARACTERISTIC FOUND:",
            characteristic.uuid,
          );
        }

        if (
          characteristic.uuid.toLowerCase() ===
          HEART_RATE_CHARACTERISTIC.toLowerCase()
        ) {
          heartRateCharacteristic =
            characteristic;
        }
      }
    }

    console.log(
      "================================",
    );

    console.log(
      "BLE SERVICE DISCOVERY COMPLETE",
    );

    console.log(
      "================================",
    );

    return heartRateCharacteristic;
  };

  const handleDisconnect =
    async () => {
      console.log(
        "BLE DEVICE DISCONNECTED",
      );

      setStatus("Reconnecting");

      try {
        const currentDevice =
          deviceRef.current;

        if (
          !currentDevice?.gatt
        ) {
          setStatus(
            "Disconnected",
          );

          setRunning(false);

          return;
        }

        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              2000,
            ),
        );

        const server =
          await currentDevice.gatt.connect();

        console.log(
          "BLE RECONNECTED",
        );

        const heartRateCharacteristic =
          await discoverBLEServices(
            server,
          );

        if (
          !heartRateCharacteristic
        ) {
          throw new Error(
            "Standard Heart Rate Measurement characteristic not found.",
          );
        }

        heartRateCharacteristic.addEventListener(
          "characteristicvaluechanged",
          handleHeartRate,
        );

        await heartRateCharacteristic.startNotifications();

        setStatus("Connected");

        setError("");
      } catch (error) {
        console.error(
          "BLE reconnect failed:",
          error,
        );

        setStatus(
          "Disconnected",
        );

        setRunning(false);

        setError(
          "BLE device disconnected and could not reconnect.",
        );
      }
    };

  const connectDevice =
    async () => {
      try {
        setError("");

        if (
          !navigator.bluetooth
        ) {
          setError(
            "Web Bluetooth is not supported in this browser.",
          );

          return;
        }

        setStatus("Scanning");

        const selectedDevice =
          await navigator.bluetooth.requestDevice(
            {
              acceptAllDevices: true,
              optionalServices:
                OPTIONAL_BLE_SERVICES,
            },
          );

        console.log(
          "SELECTED BLE DEVICE:",
          selectedDevice,
        );

        console.log(
          "DEVICE NAME:",
          selectedDevice.name,
        );

        console.log(
          "DEVICE ID:",
          selectedDevice.id,
        );

        setDevice(
          selectedDevice,
        );

        deviceRef.current =
          selectedDevice;

        selectedDevice.addEventListener(
          "gattserverdisconnected",
          handleDisconnect,
        );

        setStatus("Connecting");

        const server =
          await selectedDevice.gatt?.connect();

        if (!server) {
          throw new Error(
            "Unable to connect.",
          );
        }

        console.log(
          "GATT SERVER CONNECTED:",
          server,
        );

        const heartRateCharacteristic =
          await discoverBLEServices(
            server,
          );

        if (
          heartRateCharacteristic
        ) {
          console.log(
            "STANDARD HEART RATE CHARACTERISTIC FOUND.",
          );

          heartRateCharacteristic.addEventListener(
            "characteristicvaluechanged",
            handleHeartRate,
          );

          await heartRateCharacteristic.startNotifications();

          console.log(
            "HEART RATE NOTIFICATIONS STARTED.",
          );

          setStatus("Connected");

          setError("");
        } else {
          console.warn(
            "STANDARD HEART RATE CHARACTERISTIC NOT FOUND.",
          );

          setStatus("Connected");

          setError(
            "Device connected, but no standard BLE Heart Rate characteristic was found.",
          );
        }
      } catch (err: any) {
        console.error(
          "BLE CONNECTION ERROR:",
          err,
        );

        if (
          err?.name ===
          "NotFoundError"
        ) {
          setStatus(
            "Disconnected",
          );

          setError(
            "Bluetooth device selection was cancelled.",
          );

          return;
        }

        setStatus("Error");

        setError(
          "Unable to connect to the BLE device.",
        );
      }
    };

  const startSession = () => {
    if (!patientId) {
      setError(
        "Please select a patient.",
      );

      return;
    }

    if (
      !device ||
      status !== "Connected"
    ) {
      setError(
        "Please connect a BLE device first.",
      );

      return;
    }

    setError("");

    if (!startTime.current) {
      startTime.current =
        new Date();
    }

    setRunning(true);
  };

  const pauseSession = () => {
    setRunning(false);
  };

  const endSession =
    async () => {
      setRunning(false);

      if (
        !startTime.current ||
        !patientId
      ) {
        return;
      }

      const endTime =
        new Date();

      const allBpm =
        readings.map(
          (reading) =>
            reading.bpm,
        );

      const allRR =
        readings.flatMap(
          (reading) =>
            reading.rrIntervals,
        );

      const finalRMSSD =
        calculateRMSSD(allRR);

      const averageHeartRate =
        allBpm.length > 0
          ? Math.round(
              allBpm.reduce(
                (sum, value) =>
                  sum + value,
                0,
              ) /
                allBpm.length,
            )
          : undefined;

      const minHeartRate =
        allBpm.length > 0
          ? Math.min(...allBpm)
          : undefined;

      const maxHeartRate =
        allBpm.length > 0
          ? Math.max(...allBpm)
          : undefined;

      try {
        const response =
          await api(
            "/sessions",
            {
              method: "POST",
              body: JSON.stringify({
                patientId,
                startTime:
                  startTime.current,
                endTime,
                duration:
                  seconds,
                deviceId:
                  device?.id ||
                  device?.name,
                status:
                  "completed",
                heartRateReadings:
                  allBpm,
                rrIntervals:
                  allRR,
                averageHeartRate,
                minHeartRate,
                maxHeartRate,
                rmssd:
                  finalRMSSD,
              }),
            },
          );

        if (!response.ok) {
          setError(
            "Unable to save session.",
          );

          return;
        }

        alert(
          "Session saved successfully.",
        );

        setReadings([]);

        setBpm(null);

        setRmssd(null);

        setSeconds(0);

        startTime.current =
          null;

        setRunning(false);
      } catch (error) {
        console.error(error);

        setError(
          "Unable to save session.",
        );
      }
    };

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-slate-50">
        <header className="border-b bg-white">
          <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
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

        <div className="mx-auto max-w-5xl px-6 py-8">
          <h1 className="text-3xl font-bold text-slate-900">
            New Monitoring Session
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Connect a BLE heart-rate
            monitor and start
            monitoring.
          </p>

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <section className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              1. Select Patient
            </h2>

            <select
              value={patientId}
              onChange={(e) =>
                setPatientId(
                  e.target.value,
                )
              }
              className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            >
              <option value="">
                Select patient
              </option>

              {patients.map(
                (patient) => (
                  <option
                    key={
                      patient._id
                    }
                    value={
                      patient._id
                    }
                  >
                    {patient.name} —{" "}
                    {patient.age} years
                  </option>
                ),
              )}
            </select>
          </section>

          <section className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              2. Bluetooth Device
            </h2>

            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Connection status
                </p>

                <p className="mt-1 font-semibold text-slate-900">
                  {status}
                </p>

                {device && (
                  <p className="mt-1 text-sm text-slate-500">
                    {device.name ||
                      "Unknown device"}
                  </p>
                )}
              </div>

              <button
                onClick={
                  connectDevice
                }
                disabled={
                  status ===
                    "Scanning" ||
                  status ===
                    "Connecting" ||
                  status ===
                    "Connected"
                }
                className="rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-50"
              >
                {status ===
                "Connected"
                  ? "Connected"
                  : status ===
                      "Scanning"
                    ? "Scanning..."
                    : status ===
                        "Connecting"
                      ? "Connecting..."
                      : "Scan & Connect"}
              </button>
            </div>
          </section>

          <section className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              3. Live Monitoring
            </h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-4">
              <div className="rounded-xl bg-slate-50 p-6 text-center">
                <p className="text-sm text-slate-500">
                  Heart Rate
                </p>

                <p className="mt-2 text-4xl font-bold text-sky-600">
                  {bpm ?? "--"}
                </p>

                <p className="text-sm text-slate-500">
                  BPM
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-6 text-center">
                <p className="text-sm text-slate-500">
                  Session Time
                </p>

                <p className="mt-2 text-4xl font-bold text-slate-900">
                  {formatTime(
                    seconds,
                  )}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-6 text-center">
                <p className="text-sm text-slate-500">
                  Readings
                </p>

                <p className="mt-2 text-4xl font-bold text-slate-900">
                  {readings.length}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-6 text-center">
                <p className="text-sm text-slate-500">
                  HRV / RMSSD
                </p>

                <p className="mt-2 text-4xl font-bold text-violet-600">
                  {rmssd ?? "--"}
                </p>

                <p className="text-sm text-slate-500">
                  ms
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              {!running ? (
                <button
                  onClick={
                    startSession
                  }
                  className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
                >
                  Start Session
                </button>
              ) : (
                <button
                  onClick={
                    pauseSession
                  }
                  className="rounded-xl bg-amber-500 px-5 py-3 font-semibold text-white hover:bg-amber-600"
                >
                  Pause
                </button>
              )}

              <button
                onClick={
                  endSession
                }
                disabled={
                  readings.length ===
                  0
                }
                className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                End Session
              </button>
            </div>
          </section>

          <section className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              RR Intervals
            </h2>

            {readings.length ===
            0 ? (
              <p className="mt-3 text-sm text-slate-500">
                No RR interval data
                received.
              </p>
            ) : (
              <div className="mt-3 max-h-40 overflow-y-auto">
                {readings
                  .flatMap(
                    (reading) =>
                      reading.rrIntervals,
                  )
                  .slice(-20)
                  .map(
                    (
                      rr,
                      index,
                    ) => (
                      <span
                        key={index}
                        className="mr-2 inline-block rounded-lg bg-slate-100 px-3 py-1 text-sm text-slate-700"
                      >
                        {rr} ms
                      </span>
                    ),
                  )}
              </div>
            )}
          </section>
        </div>
      </main>
    </ProtectedRoute>
  );
}