import { motion } from "framer-motion";

type PaymentActivity = {
  id: string;
  amount: number;
  date: string;
  status: string;
  project?: string;
};

type DonationsTabProps = {
  data: PaymentActivity[];
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const statusBadge: Record<string, string> = {
  Completed: "bg-emerald-300/10 text-emerald-300",
  Pending: "bg-yellow-300/10 text-yellow-300",
  Failed: "bg-red-400/10 text-red-400",
};

export default function DonationsTab({ data }: DonationsTabProps) {
  const totals = data.reduce(
    (acc, payment) => {
      if (payment.status === "Completed") {
        acc.completed += payment.amount;
      }
      if (payment.status === "Pending") {
        acc.pending += payment.amount;
      }
      return acc;
    },
    { completed: 0, pending: 0 }
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4 text-white"
    >
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <motion.div
          whileHover={{ translateY: -2 }}
          className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">
              Donation History
            </p>
            <button className="rounded-full bg-[#ff9c4b] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#080313] transition hover:bg-[#ffb877]">
              New donation
            </button>
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-white/5">
            <div className="grid grid-cols-4 gap-3 bg-white/5 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">
              <span>Date</span>
              <span>Project</span>
              <span className="text-right">Amount</span>
              <span className="text-right">Status</span>
            </div>

            {data.length === 0 ? (
              <p className="px-4 py-5 text-center text-sm text-white/70">
                You haven&apos;t recorded donations yet.
              </p>
            ) : (
              <div className="divide-y divide-white/5">
                {data.map((donation) => (
                  <div
                    key={donation.id}
                    className="grid grid-cols-4 items-center gap-3 px-4 py-3 text-sm text-white/80"
                  >
                    <span>{donation.date}</span>
                    <span className="text-white">
                      {donation.project ?? "Mission Impact Fund"}
                    </span>
                    <span className="text-right font-semibold">
                      {currency.format(donation.amount)}
                    </span>
                    <span className="text-right">
                      <span
                        className={`inline-flex items-center justify-end rounded-full px-3 py-1 text-xs font-semibold ${
                          statusBadge[donation.status] ??
                          "bg-white/10 text-white/70"
                        }`}
                      >
                        {donation.status}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          whileHover={{ translateY: -2 }}
          className="space-y-4 rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">
            Donation Summary
          </p>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-white/70">Total Donated</p>
              <p className="text-3xl font-bold text-white">
                {currency.format(totals.completed)}
              </p>
            </div>
            <div>
              <p className="text-sm text-white/70">Pending Amount</p>
              <p className="text-2xl font-semibold text-yellow-300">
                {currency.format(totals.pending)}
              </p>
            </div>
          </div>
          <div className="rounded-2xl bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">
              Giving Streak
            </p>
            <p className="mt-2 text-sm text-white/70">
              Keep your generosity on track—set up automated gifts soon.
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
