const alertFeed = [
  {
    id: "KV-201",
    title: "Credential stuffing pattern",
    severity: "High",
    owner: "Identity perimeter",
    time: "2 min ago",
  },
  {
    id: "KV-198",
    title: "Suspicious port sweep",
    severity: "Medium",
    owner: "Edge network",
    time: "8 min ago",
  },
  {
    id: "KV-194",
    title: "Privilege escalation sequence",
    severity: "Critical",
    owner: "Finance host",
    time: "13 min ago",
  },
];

const timeline = [
  "08:41 Anomalous SSH burst detected from 10.20.4.18",
  "08:43 Login success after 14 failures",
  "08:44 New privilege assignment observed",
  "08:46 Lateral connection attempts to 3 internal hosts",
];

export default function DashboardPage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-6 py-8 md:px-10">
      <section className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-surface p-6 backdrop-blur md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-muted">
            Command Center
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
            Analyst dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            Today&apos;s shell focuses on investigation flow: alert queue,
            triage metrics, and incident timeline.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-muted">Open alerts</p>
            <p className="mt-2 text-2xl font-semibold text-white">24</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-muted">Critical</p>
            <p className="mt-2 text-2xl font-semibold text-rose-200">03</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-muted">Investigations</p>
            <p className="mt-2 text-2xl font-semibold text-cyan-200">08</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-muted">Noise reduced</p>
            <p className="mt-2 text-2xl font-semibold text-white">61%</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[1.75rem] border border-white/10 bg-surface p-6 backdrop-blur">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-muted">
                Alert Feed
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Priority queue
              </h2>
            </div>
            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
              Live shell
            </span>
          </div>

          <div className="mt-5 space-y-4">
            {alertFeed.map((alert) => (
              <div
                key={alert.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-cyan-300/25 hover:bg-white/8"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-muted">
                      {alert.id}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-white">
                      {alert.title}
                    </h3>
                  </div>
                  <span className="rounded-full bg-rose-400/12 px-3 py-1 text-xs font-semibold text-rose-100">
                    {alert.severity}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-300">
                  <span>{alert.owner}</span>
                  <span>{alert.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-[1.75rem] border border-white/10 bg-surface p-6 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.35em] text-muted">
              Triage Snapshot
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Incident timeline
            </h2>
            <div className="mt-5 space-y-3">
              {timeline.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300"
                >
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-white/10 bg-surface p-6 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.35em] text-muted">
              Investigator Notes
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Why this shell matters
            </h2>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-300">
              <li>Landing page and command center are now in place.</li>
              <li>Next build will add upload flow and structured alert data.</li>
              <li>After that, we can wire Python-based scoring into this UI.</li>
            </ul>
          </section>
        </div>
      </section>
    </main>
  );
}
