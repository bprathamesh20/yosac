import { LoaderIcon } from './icons';
import { useState } from 'react';
import { Skeleton } from './ui/skeleton';

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
  // Show 2 skeleton cards as placeholders
  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-4">
        <div className="border rounded-xl shadow-sm bg-background w-full overflow-hidden animate-pulse flex flex-col">
          <div className="px-5 py-4 border-b flex flex-col gap-1">
            <Skeleton className="text-lg font-bold h-6 w-1/2 mb-2" />
            <Skeleton className="text-sm font-medium h-4 w-1/3" />
          </div>
          <div className="px-5 py-4 flex flex-col gap-3">
            <div>
              <span className="font-semibold">Overview: </span>
              <Skeleton className="h-4 w-3/4 inline-block align-middle" />
            </div>
            <div>
              <span className="font-semibold">Key Requirements: </span>
              <div className="flex flex-wrap gap-2 mt-1 mb-1">
                <Skeleton className="h-5 w-16 rounded-md" />
                <Skeleton className="h-5 w-16 rounded-md" />
                <Skeleton className="h-5 w-16 rounded-md" />
              </div>
              <Skeleton className="h-3 w-2/3 mt-1" />
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-xs font-medium">
                <CalendarIcon /> <Skeleton className="h-3 w-16" />
              </span>
              <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-xs font-medium">
                <DurationIcon /> <Skeleton className="h-3 w-16" />
              </span>
              <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-xs font-medium">
                <MoneyIcon /> <Skeleton className="h-3 w-16" />
              </span>
            </div>
            <div className="mt-2">
              <span className="font-semibold">Highlights:</span>
              <ul className="list-disc ml-6 text-muted-foreground text-sm mt-1">
                <li><Skeleton className="h-3 w-32" /></li>
                <li><Skeleton className="h-3 w-28" /></li>
                <li><Skeleton className="h-3 w-24" /></li>
              </ul>
            </div>
          </div>
          <div className="px-5 py-3 border-t flex flex-row gap-3 items-center bg-muted/50">
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-3 h-3 animate-spin inline-flex items-center justify-center">
                <LoaderIcon size={12} />
              </span>
              Loading program details...
            </span>
          </div>
        </div>
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