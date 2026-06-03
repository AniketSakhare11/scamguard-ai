import {
  AlertTriangle,
  CheckCircle2,
  Clipboard,
  ExternalLink,
  Mail,
  Phone,
  ShieldCheck,
  Siren,
} from "lucide-react";

const riskStyles = {
  Minimal: {
    bar: "bg-emerald-500",
    badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
    icon: CheckCircle2,
  },
  Low: {
    bar: "bg-sky-500",
    badge: "border-sky-500/30 bg-sky-500/10 text-sky-200",
    icon: ShieldCheck,
  },
  Medium: {
    bar: "bg-amber-500",
    badge: "border-amber-500/30 bg-amber-500/10 text-amber-100",
    icon: AlertTriangle,
  },
  High: {
    bar: "bg-rose-500",
    badge: "border-rose-500/30 bg-rose-500/10 text-rose-100",
    icon: Siren,
  },
};

function EmptyState() {
  return (
    <div className="flex h-full min-h-80 flex-col items-center justify-center rounded-lg border border-dashed border-slate-700 bg-slate-950/50 p-8 text-center">
      <ShieldCheck className="mb-4 h-10 w-10 text-slate-500" />
      <h2 className="text-lg font-semibold text-white">No analysis yet</h2>
      <p className="mt-2 max-w-sm text-sm text-slate-400">
        Paste a suspicious message to see its risk score, red flags, links, and next steps.
      </p>
    </div>
  );
}

function IndicatorList({ title, icon: Icon, items }) {
  if (!items.length) return null;

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-200">
        <Icon className="h-4 w-4 text-slate-400" />
        {title}
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item}
            className="break-all rounded-md bg-slate-900 px-3 py-2 text-sm text-slate-300"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ResultPanel({ analysis, error, copied, onCopy }) {
  if (!analysis && !error) {
    return (
      <section className="rounded-lg border border-slate-800 bg-slate-900 p-5">
        <EmptyState />
      </section>
    );
  }

  const level = analysis?.riskLevel || "Minimal";
  const style = riskStyles[level] || riskStyles.Minimal;
  const RiskIcon = style.icon;
  const indicators = analysis?.indicators || { urls: [], emails: [], phones: [], signals: [] };

  return (
    <section className="space-y-4 rounded-lg border border-slate-800 bg-slate-900 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-normal text-slate-400">Result</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Scam risk assessment</h2>
        </div>

        {analysis && (
          <span
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold ${style.badge}`}
          >
            <RiskIcon className="h-4 w-4" />
            {level} risk
          </span>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100">
          {error}
        </div>
      )}

      {analysis && (
        <>
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400">Risk score</p>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">{analysis.score}</span>
                  <span className="text-sm text-slate-400">/ 100</span>
                </div>
              </div>
              <p className="text-right text-xs font-medium uppercase tracking-normal text-slate-500">
                {analysis.source}
              </p>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-full rounded-full ${style.bar}`}
                style={{ width: `${analysis.score}%` }}
              />
            </div>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
            <h3 className="text-sm font-semibold text-white">Summary</h3>
            <p className="mt-2 text-sm leading-6 text-slate-300">{analysis.summary}</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
              <h3 className="text-sm font-semibold text-white">Red flags</h3>
              <ul className="mt-3 space-y-2">
                {(analysis.redFlags.length ? analysis.redFlags : ["No strong red flags found."]).map(
                  (flag) => (
                    <li key={flag} className="flex gap-2 text-sm text-slate-300">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                      <span>{flag}</span>
                    </li>
                  ),
                )}
              </ul>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
              <h3 className="text-sm font-semibold text-white">Recommended actions</h3>
              <ul className="mt-3 space-y-2">
                {analysis.recommendedActions.map((action) => (
                  <li key={action} className="flex gap-2 text-sm text-slate-300">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {(indicators.urls.length || indicators.emails.length || indicators.phones.length) && (
            <div className="grid gap-4 lg:grid-cols-3">
              <IndicatorList title="Links found" icon={ExternalLink} items={indicators.urls} />
              <IndicatorList title="Emails found" icon={Mail} items={indicators.emails} />
              <IndicatorList title="Phones found" icon={Phone} items={indicators.phones} />
            </div>
          )}

          {analysis.safeReply && (
            <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">Safer reply</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{analysis.safeReply}</p>
                </div>
                <button
                  type="button"
                  onClick={onCopy}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:border-slate-500 hover:bg-slate-800"
                >
                  <Clipboard className="h-4 w-4" />
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
