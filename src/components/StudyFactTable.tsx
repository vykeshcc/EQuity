import { cn } from "@/lib/utils/cn";

/**
 * StudyFactTable — the canonical "standardized fact sheet" for a single study.
 * Every study page uses this so layout is identical across the corpus.
 */

export interface StudyFactTableProps {
  study: {
    id: string;
    title: string;
    authors: string[];
    year: number | null;
    journal: string | null;
    doi: string | null;
    source: string;
    source_id: string;
    source_url: string | null;
    study_type: string | null;
    species: string | null;
    n_subjects: number | null;
    design: Record<string, any> | null;
    dose: unknown;
    duration_days: number | null;
    route: string | null;
    primary_outcomes: unknown;
    secondary_outcomes: unknown;
    adverse_events: unknown;
    conclusion: string | null;
    risk_of_bias: Record<string, any> | null;
    quality_score: number | null;
    highlights: { tldr?: string[]; one_liner?: string } | null;
  };
  className?: string;
}

const FIELDS: Array<{
  key: keyof StudyFactTableProps["study"] | "source-ref";
  label: string;
  render: (s: StudyFactTableProps["study"]) => React.ReactNode;
}> = [
  { key: "study_type", label: "Study type", render: (s) => s.study_type ?? "—" },
  { key: "species", label: "Species", render: (s) => s.species ?? "—" },
  { key: "n_subjects", label: "N", render: (s) => (s.n_subjects ?? "—").toString() },
  {
    key: "design",
    label: "Design",
    render: (s) => {
      if (!s.design) return "—";
      const d = s.design;
      const parts: string[] = [];
      if (d.randomized) parts.push("randomized");
      if (d.controlled) parts.push("controlled");
      if (d.placebo_controlled) parts.push("placebo-controlled");
      if (d.blinded && d.blinded !== "none") parts.push(`${d.blinded}-blind`);
      if (d.crossover) parts.push("crossover");
      if (d.arms) parts.push(`${d.arms} arms`);
      return parts.length ? parts.join(", ") : "—";
    },
  },
  { key: "duration_days", label: "Duration", render: (s) => (s.duration_days ? `${s.duration_days} days` : "—") },
  { key: "route", label: "Route", render: (s) => s.route ?? "—" },
  {
    key: "dose",
    label: "Dose",
    render: (s) => <DoseList dose={s.dose} />,
  },
  {
    key: "primary_outcomes",
    label: "Primary outcomes",
    render: (s) => <OutcomeList outcomes={s.primary_outcomes} />,
  },
  {
    key: "secondary_outcomes",
    label: "Secondary outcomes",
    render: (s) => <OutcomeList outcomes={s.secondary_outcomes} />,
  },
  {
    key: "adverse_events",
    label: "Adverse events",
    render: (s) => <AELine ae={s.adverse_events} />,
  },
  {
    key: "risk_of_bias",
    label: "Risk of bias",
    render: (s) =>
      s.risk_of_bias?.overall ? (
        <span className={cn("rounded px-2 py-0.5 text-xs", robColor(s.risk_of_bias.overall))}>
          {s.risk_of_bias.overall}
        </span>
      ) : (
        "—"
      ),
  },
  {
    key: "conclusion",
    label: "Conclusion",
    render: (s) => <p className="text-sm leading-relaxed text-slate-700">{s.conclusion ?? "—"}</p>,
  },
  {
    key: "source-ref",
    label: "Source",
    render: (s) => (
      <a
        href={s.source_url ?? (s.doi ? `https://doi.org/${s.doi}` : "#")}
        target="_blank"
        rel="noreferrer"
        className="text-brand-700 hover:underline"
      >
        {s.source} / {s.source_id}
      </a>
    ),
  },
];

export function StudyFactTable({ study, className }: StudyFactTableProps) {
  return (
    <dl className={cn("grid grid-cols-1 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white", className)}>
      {FIELDS.map((f) => (
        <div key={String(f.key)} className="grid grid-cols-[140px_1fr] gap-4 px-4 py-3">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{f.label}</dt>
          <dd className="text-sm text-slate-900">{f.render(study)}</dd>
        </div>
      ))}
    </dl>
  );
}

function robColor(r: string): string {
  switch (r) {
    case "low":
      return "bg-green-100 text-green-900";
    case "some-concerns":
      return "bg-amber-100 text-amber-900";
    case "high":
      return "bg-red-100 text-red-900";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function DoseList({ dose }: { dose: unknown }) {
  const arr = Array.isArray(dose) ? dose : [];
  if (!arr.length) return <>—</>;
  return (
    <ul className="space-y-1 text-sm">
      {arr.map((d: any, i: number) => (
        <li key={i} className="text-slate-800">
          {d.peptide ? <span className="font-medium">{d.peptide}</span> : null}
          {d.amount_mg != null ? ` ${d.amount_mg} mg` : d.amount_raw ? ` ${d.amount_raw}` : ""}
          {d.route ? `, ${d.route}` : ""}
          {d.frequency ? `, ${d.frequency}` : ""}
          {d.total_days ? `, ${d.total_days}d` : ""}
        </li>
      ))}
    </ul>
  );
}

function OutcomeList({ outcomes }: { outcomes: unknown }) {
  const arr = Array.isArray(outcomes) ? outcomes : [];
  if (!arr.length) return <>—</>;
  return (
    <ul className="space-y-1">
      {arr.map((o: any, i: number) => (
        <li key={i} className="text-sm text-slate-800">
          <span className="font-medium">{o.name}</span>
          {o.direction ? <span className={cn("ml-2 rounded px-1.5 py-0.5 text-xs", directionColor(o.direction))}>{o.direction}</span> : null}
          {o.effect_size ? <span className="ml-2 text-slate-600">Δ {o.effect_size}</span> : null}
          {o.p_value ? <span className="ml-2 text-slate-600">p={o.p_value}</span> : null}
          {o.ci ? <span className="ml-2 text-slate-600">CI {o.ci}</span> : null}
        </li>
      ))}
    </ul>
  );
}

function directionColor(d: string): string {
  if (d === "improved") return "bg-green-100 text-green-900";
  if (d === "worsened") return "bg-red-100 text-red-900";
  if (d === "no-change") return "bg-slate-100 text-slate-700";
  return "bg-amber-100 text-amber-900";
}

function AELine({ ae }: { ae: unknown }) {
  const arr = Array.isArray(ae) ? ae : [];
  if (!arr.length) return <span className="text-slate-500">None reported</span>;
  return (
    <ul className="space-y-1 text-sm text-slate-800">
      {arr.map((e: any, i: number) => (
        <li key={i}>
          {e.event}
          {e.count != null ? ` (n=${e.count})` : ""}
          {e.severity ? `, ${e.severity}` : ""}
        </li>
      ))}
    </ul>
  );
}
