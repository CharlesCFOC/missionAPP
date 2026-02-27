import { motion } from "framer-motion";

const subscription = {
  plan: "Premium",
  price: "$15/month",
  renewal: "Jan 5, 2025",
  card: "**** 4242",
};

const history = [
  { id: "sub-1", date: "Dec 05, 2024", amount: "$15.00", status: "Paid" },
  { id: "sub-2", date: "Nov 05, 2024", amount: "$15.00", status: "Paid" },
  { id: "sub-3", date: "Oct 05, 2024", amount: "$15.00", status: "Paid" },
];

export default function SubscriptionsTab() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4 text-white"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          whileHover={{ translateY: -2 }}
          className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">
            Active Plan
          </p>
          <div className="mt-4 space-y-3">
            <h4 className="text-3xl font-bold text-white">{subscription.plan}</h4>
            <p className="text-lg font-semibold text-[#ff9c4b]">
              {subscription.price}
            </p>
            <div className="grid gap-2 text-sm text-white/80">
              <p>
                Next renewal on{" "}
                <span className="font-semibold text-white">
                  {subscription.renewal}
                </span>
              </p>
              <p>Charged to card {subscription.card}</p>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-3 md:flex-row">
            <button className="flex-1 rounded-xl bg-[#ff9c4b] px-4 py-2 text-sm font-semibold text-[#080313] transition hover:bg-[#ffb877]">
              Manage subscription
            </button>
            <button className="flex-1 rounded-xl border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/60">
              Cancel renewal
            </button>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ translateY: -2 }}
          className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">
            Billing & Security
          </p>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            <li>Instant receipts sent to your email.</li>
            <li>Change payment method anytime.</li>
            <li>Coming soon: Apple Pay + in-app upgrades.</li>
          </ul>
        </motion.div>
      </div>

      <motion.div
        whileHover={{ translateY: -2 }}
        className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur"
      >
        <p className="text-xs uppercase tracking-[0.2em] text-white/60">
          Subscription History
        </p>

        <div className="mt-4 overflow-hidden rounded-2xl border border-white/5">
          <div className="grid grid-cols-3 gap-3 bg-white/5 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">
            <span>Date</span>
            <span className="text-center">Amount</span>
            <span className="text-right">Status</span>
          </div>
          <div className="divide-y divide-white/5">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="grid grid-cols-3 items-center gap-3 px-4 py-3 text-sm text-white/80"
              >
                <span>{entry.date}</span>
                <span className="text-center font-semibold">{entry.amount}</span>
                <span className="text-right text-emerald-300">{entry.status}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
