import { LoaderIcon } from './icons';
import { useState } from 'react';

function CalendarIcon() {
  return <span role="img" aria-label="calendar">📅</span>;
}
function DurationIcon() {
  return <span role="img" aria-label="duration">⏳</span>;
}
function MoneyIcon() {
  return <span role="img" aria-label="money">💰</span>;
}
function StarIcon() {
  return <span role="img" aria-label="star">⭐</span>;
}

export function ProgramResearchCall({ args }: { args: { program: string; university: string } }) {
  return (
    <div className="border py-2 px-3 rounded-xl flex flex-row items-start justify-between gap-3">
      <div className="flex flex-row gap-3 items-start">
        <div className="text-zinc-500 mt-1">
          <StarIcon />
        </div>
        <div className="text-left">
          Researching <b>{args.program}</b> at <b>{args.university}</b>
        </div>
      </div>
      <div className="animate-spin mt-1"><LoaderIcon /></div>
    </div>
  );
}

export function ProgramResearchResult({ result }: {
  result: {
    object?: {
      programName: string;
      universityName: string;
      overview: string;
      gpaRequirement?: string;
      greRequirement?: string;
      toeflRequirement?: string;
      ieltsRequirement?: string;
      requirementsSummary?: string;
      deadlineHint: string;
      duration: string;
      costHint: string;
      highlight1: string;
      highlight2: string;
      highlight3?: string;
      officialLink?: string;
    };
    text?: string;
  }
}) {
  const data = result.object;
  const [expanded, setExpanded] = useState(false);
  const SUMMARY_LIMIT = 120;

  if (!data) {
    return (
      <div className="border py-2 px-3 rounded-xl w-full">
        <div className="font-medium mb-2">Program Details</div>
        <div className="text-muted-foreground text-sm">{result.text}</div>
      </div>
    );
  }
  return (
    <div className="border rounded-xl shadow-sm bg-background w-full max-w-2xl mx-auto overflow-hidden">
      <div className="px-5 py-4 border-b flex flex-col gap-1">
        <div className="text-lg font-bold text-primary">{data.programName}</div>
        <div className="text-sm text-muted-foreground font-medium">{data.universityName}</div>
      </div>
      <div className="px-5 py-4 flex flex-col gap-3">
        <div>
          <span className="font-semibold">Overview: </span>
          <span className="text-muted-foreground">{data.overview}</span>
        </div>
        <div>
          <span className="font-semibold">Key Requirements: </span>
          <div className="flex flex-wrap gap-2 mt-1 mb-1">
            {data.gpaRequirement && (
              <span className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs font-medium">GPA: {data.gpaRequirement}</span>
            )}
            {data.greRequirement && (
              <span className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs font-medium">GRE: {data.greRequirement}</span>
            )}
            {data.toeflRequirement && (
              <span className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md text-xs font-medium">TOEFL: {data.toeflRequirement}</span>
            )}
            {data.ieltsRequirement && (
              <span className="flex items-center gap-1 bg-pink-100 text-pink-800 px-2 py-1 rounded-md text-xs font-medium">IELTS: {data.ieltsRequirement}</span>
            )}
          </div>
          {data.requirementsSummary && (
            <div className="text-muted-foreground text-xs mt-1">
              {data.requirementsSummary.length > SUMMARY_LIMIT && !expanded
                ? data.requirementsSummary.slice(0, SUMMARY_LIMIT) + '...'
                : data.requirementsSummary}
              {data.requirementsSummary.length > SUMMARY_LIMIT && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="ml-2 text-primary hover:underline text-xs font-medium"
                >
                  {expanded ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-xs font-medium">
            <CalendarIcon /> Deadline: {data.deadlineHint}
          </span>
          <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-xs font-medium">
            <DurationIcon /> Duration: {data.duration}
          </span>
          <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-xs font-medium">
            <MoneyIcon /> Tuition: {data.costHint}
          </span>
        </div>
        <div className="mt-2">
          <span className="font-semibold">Highlights:</span>
          <ul className="list-disc ml-6 text-muted-foreground text-sm mt-1">
            <li>{data.highlight1}</li>
            <li>{data.highlight2}</li>
            {data.highlight3 && <li>{data.highlight3}</li>}
          </ul>
        </div>
      </div>
      <div className="px-5 py-3 border-t flex flex-row gap-3 items-center bg-muted/50">
        {data.officialLink && (
          <a
            href={data.officialLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-medium hover:underline text-sm"
          >
            View Official Program Page ↗
          </a>
        )}
      </div>
    </div>
  );
} 