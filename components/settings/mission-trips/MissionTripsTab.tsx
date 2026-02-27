"use client";

import { motion } from "framer-motion";
import { Calendar, CreditCard } from "lucide-react";

type MissionTripPayment = {
  id: string;
  missionName: string;
  destination: string;
  departureDate: string;
  totalCost: number;
  amountPaid: number;
  nextDueDate: string;
  nextDueAmount: number;
  status: "On track" | "Pending" | "Overdue";
};

type PaymentActivity = {
  id: string;
  amount: number;
  date: string;
  status: string;
  project?: string;
};

type MissionTripsTabProps = {
  trips: MissionTripPayment[];
  payments: PaymentActivity[];
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const tripStatusTone: Record<MissionTripPayment["status"], string> = {
  "On track": "border border-emerald-300/25 bg-emerald-300/10 text-emerald-200",
  Pending: "border border-yellow-300/25 bg-yellow-300/10 text-yellow-100",
  Overdue: "border border-rose-300/25 bg-rose-300/10 text-rose-100",
};

const paymentStatusTone = (status: string) => {
  const normalized = status.trim().toLowerCase();
  if (normalized === "completed" || normalized === "paid") {
    return "border border-emerald-300/25 bg-emerald-300/10 text-emerald-200";
  }
  if (normalized === "pending") {
    return "border border-yellow-300/25 bg-yellow-300/10 text-yellow-100";
  }
  if (normalized === "failed" || normalized === "overdue") {
    return "border border-rose-300/25 bg-rose-300/10 text-rose-100";
  }
  return "border border-white/15 bg-white/5 text-white/70";
};

export default function MissionTripsTab({ trips, payments }: MissionTripsTabProps) {
  const missionNameSet = new Set(
    trips.map((trip) => trip.missionName.trim().toLowerCase()).filter(Boolean)
  );
  const relevantPayments = payments.filter((payment) => {
    const name = payment.project?.trim().toLowerCase();
    if (!name) return false;
    return missionNameSet.has(name);
  });

  return (
    <motion.div
      key="missionTrips"
      id="settings-panel-missionTrips"
      role="tabpanel"
      aria-labelledby="settings-tab-missionTrips"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <section className="rounded-3xl border border-white/10 bg-white/5 p-5 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Calendar className="h-4 w-4 text-[#4fa5ff]" aria-hidden="true" />
              Mission trips
            </div>
            <p className="mt-1 text-xs text-white/60">
              Track trips you follow and their payment progress.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {trips.length === 0 ? (
            <p className="rounded-xl border border-white/10 bg-[#120626]/40 px-4 py-3 text-xs text-white/60">
              No mission trips yet.
            </p>
          ) : (
            trips.map((trip) => {
              const progress = trip.totalCost > 0
                ? Math.min(100, Math.round((trip.amountPaid / trip.totalCost) * 100))
                : 0;

              return (
                <div
                  key={trip.id}
                  className="rounded-2xl border border-white/10 bg-[#120626]/40 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white/90">
                        {trip.missionName}
                      </p>
                      <p className="mt-1 text-xs text-white/60">
                        {trip.destination} · Departs {trip.departureDate}
                      </p>
                    </div>
                    <span
                      className={`inline-flex w-fit rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${tripStatusTone[trip.status]}`}
                    >
                      {trip.status}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between text-xs text-white/60">
                      <span>
                        {currency.format(trip.amountPaid)} / {currency.format(trip.totalCost)}
                      </span>
                      <span className="text-white/70">{progress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-[#ff9c4b]"
                        style={{ width: `${progress}%` }}
                        aria-hidden="true"
                      />
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-white/60">
                      <span>
                        Next due:{" "}
                        <span className="font-semibold text-white/80">
                          {trip.nextDueDate
                            ? `${trip.nextDueDate} · ${currency.format(trip.nextDueAmount)}`
                            : "TBD"}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-5 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <CreditCard className="h-4 w-4 text-[#4fa5ff]" aria-hidden="true" />
              Payment history
            </div>
            <p className="mt-1 text-xs text-white/60">
              Payments linked to your mission trips.
            </p>
          </div>
        </div>

        <div className="mt-5">
          {relevantPayments.length === 0 ? (
            <p className="rounded-xl border border-white/10 bg-[#120626]/40 px-4 py-3 text-xs text-white/60">
              No mission trip payments yet.
            </p>
          ) : (
            <div className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-[#120626]/40">
              {relevantPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white/90">
                      {payment.project ?? "Mission trip"}
                    </p>
                    <p className="mt-1 text-xs text-white/60">{payment.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">
                      {currency.format(payment.amount)}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${paymentStatusTone(payment.status)}`}
                    >
                      {payment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </motion.div>
  );
}
