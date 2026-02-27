import { motion } from "framer-motion";
import { CreditCard } from "lucide-react";

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

type MissionTripsTabProps = {
  data: MissionTripPayment[];
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const statusStyles: Record<MissionTripPayment["status"], string> = {
  "On track":
    "border border-emerald-300/25 bg-emerald-300/10 text-emerald-200",
  Pending: "border border-yellow-300/25 bg-yellow-300/10 text-yellow-100",
  Overdue: "border border-rose-300/25 bg-rose-300/10 text-rose-100",
};

export default function MissionTripsTab({ data }: MissionTripsTabProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4 text-white"
    >
      {data.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/70">
          You have no active mission trip payment plans yet.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#120626]/40">
          <div className="hidden grid-cols-[minmax(0,1fr)_260px_220px_140px] gap-3 bg-white/5 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 md:grid">
            <span>Mission</span>
            <span>Progress</span>
            <span>Next payment</span>
            <span className="text-right">Status</span>
          </div>
          <div className="divide-y divide-white/10">
            {data.map((trip) => {
              const safeTotal = trip.totalCost > 0 ? trip.totalCost : 0;
              const progress =
                safeTotal > 0
                  ? Math.min(
                      100,
                      Math.round((trip.amountPaid / safeTotal) * 100)
                    )
                  : 0;

              return (
                <div
                  key={trip.id}
                  className="grid gap-4 px-4 py-4 md:grid-cols-[minmax(0,1fr)_260px_220px_140px] md:items-center"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white/90">
                      {trip.missionName}
                    </p>
                    <p className="mt-1 text-xs text-white/60">
                      {trip.destination} · Departs {trip.departureDate}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-white/60">
                      <span>
                        {currency.format(trip.amountPaid)} /{" "}
                        {currency.format(trip.totalCost)}
                      </span>
                      <span className="text-white/70">{progress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-[#ff9c4b]"
                        style={{ width: `${progress}%` }}
                        aria-hidden="true"
                      />
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
                      Next due
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white/85">
                      {trip.nextDueDate
                        ? `${trip.nextDueDate} · ${currency.format(trip.nextDueAmount)}`
                        : "No upcoming payment"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3 md:justify-end">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${statusStyles[trip.status]}`}
                    >
                      {trip.status}
                    </span>
                    <button
                      type="button"
                      className="rounded-full border border-white/15 p-2 text-white/70 transition hover:border-white/30 hover:text-white"
                      aria-label={`Make a payment for ${trip.missionName}`}
                      title="Make a payment"
                    >
                      <CreditCard className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
