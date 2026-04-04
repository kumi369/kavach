import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export default function Home() {
  const features = [
    {
      title: "Threat Detection",
      description:
        "Flag suspicious events, anomalous patterns, and high-risk traffic before they disappear in noise.",
    },
    {
      title: "Explainable AI",
      description:
        "See why an alert was raised with readable factors, confidence, and investigation context.",
    },
    {
      title: "Incident Triage",
      description:
        "Move from incoming alert to analyst-ready incident summary with a clean workflow.",
    },
  ];

  const stats = [
    { label: "Alerts triaged", value: "1,284" },
    { label: "High-risk sessions", value: "37" },
    { label: "Mean response time", value: "04m" },
  ];

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-6 py-8 md:px-10">
      <section className="rounded-[2rem] border border-line bg-surface p-6 shadow-[0_25px_80px_var(--shadow)] backdrop-blur xl:p-10">
        <div className="grid gap-10 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">
                  Security Investigation Copilot
                </span>
                <span className="rounded-full border border-rose-400/25 bg-rose-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-rose-200">
                  Day 2 Scaffold
                </span>
              </div>
              <ThemeToggle />
            </div>

            <div className="space-y-5">
              <p className="text-sm uppercase tracking-[0.5em] text-muted">
                KAVACH
              </p>
              <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-foreground md:text-7xl">
                Detect suspicious activity.
                <span className="block text-accent">
                  Explain why it matters.
                </span>
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted md:text-xl">
                KAVACH helps analysts move from noisy alerts to actionable
                investigations with AI-driven triage, risk context, and incident
                timelines.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-full bg-cyan-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
              >
                Open Command Center
              </Link>
              <a
                href="https://github.com/kumi369/kavach"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-line bg-panel px-6 py-3 text-sm font-semibold text-foreground transition hover:border-cyan-300/45 hover:bg-panel-strong"
              >
                View GitHub Repo
              </a>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-line bg-panel p-4"
                >
                  <p className="text-3xl font-semibold text-foreground">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-muted">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-cyan-300/15 bg-panel-strong p-5 shadow-[0_0_60px_rgba(103,232,249,0.08)]">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-muted">
                  Live Triage
                </p>
                <h2 className="mt-2 text-xl font-semibold text-foreground">
                  Incident preview
                </h2>
              </div>
              <span className="rounded-full bg-rose-400/15 px-3 py-1 text-xs font-semibold text-rose-200">
                Critical
              </span>
            </div>

            <div className="space-y-4 py-5">
              <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4">
                <p className="text-sm text-foreground">
                  Lateral movement behavior detected across repeated SSH bursts
                  and privilege escalation attempts.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-line bg-panel p-3">
                  <p className="text-muted">Confidence</p>
                  <p className="mt-2 text-lg font-semibold text-foreground">
                    94%
                  </p>
                </div>
                <div className="rounded-xl border border-line bg-panel p-3">
                  <p className="text-muted">Linked alerts</p>
                  <p className="mt-2 text-lg font-semibold text-foreground">
                    12
                  </p>
                </div>
                <div className="rounded-xl border border-line bg-panel p-3">
                  <p className="text-muted">Top vector</p>
                  <p className="mt-2 text-lg font-semibold text-foreground">
                    SSH
                  </p>
                </div>
                <div className="rounded-xl border border-line bg-panel p-3">
                  <p className="text-muted">Recommended action</p>
                  <p className="mt-2 text-lg font-semibold text-foreground">
                    Isolate host
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-line bg-panel p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-muted">
                  Why flagged
                </p>
                <ul className="mt-3 space-y-2 text-sm text-muted">
                  <li>Repeated authentication failures followed by success</li>
                  <li>Unusual east-west traffic spike in a low-traffic segment</li>
                  <li>Privilege change observed within 90 seconds of access</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {features.map((feature) => (
          <article
            key={feature.title}
            className="rounded-[1.75rem] border border-line bg-surface p-6 backdrop-blur"
          >
            <p className="text-sm uppercase tracking-[0.35em] text-accent">
              Module
            </p>
            <h2 className="mt-4 text-2xl font-semibold text-foreground">
              {feature.title}
            </h2>
            <p className="mt-4 text-base leading-7 text-muted">
              {feature.description}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
