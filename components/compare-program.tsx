import { LoaderIcon } from './icons';
import { Skeleton } from './ui/skeleton';

// Icons (can be moved to a shared icons file if used elsewhere)
// Re-defining or assuming these are available from a shared source like program-research.tsx
function CalendarIcon() {
  return <span role="img" aria-label="calendar">🗓️</span>; // Using a slightly different calendar emoji
}
function DurationIcon() {
  return <span role="img" aria-label="duration">⏳</span>;
}
function MoneyIcon() {
  return <span role="img" aria-label="money">💰</span>;
}
function LocationPinIcon() {
  return <span role="img" aria-label="location">📍</span>;
}
function GraduationCapIcon() {
  return <span role="img" aria-label="gpa">🎓</span>;
}
function TestScoreIcon() {
  return <span role="img" aria-label="test score">📝</span>;
}
function KeyFeatureIcon() {
  return <span role="img" aria-label="key feature">✨</span>;
}
function VersusIcon() {
    return <span role="img" aria-label="versus" className="mx-1 text-xl">🆚</span>;
}


export function CompareProgramCall({ args }: { args: { program1name: string; program1university: string; program2name: string; program2university: string } }) {
  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-4">
      <div className="border rounded-xl shadow-sm bg-background w-full overflow-hidden">
        <div className="px-6 py-4 border-b">
          <Skeleton className="h-7 w-1/2 mb-2" />
          <Skeleton className="h-4 w-1/3" />
        </div>

        <div className="px-6 py-4">
            <Skeleton className="h-5 w-1/4 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-5/6 mb-4" />

            <Skeleton className="h-5 w-1/4 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-5/6 mb-4" />
        </div>

        <div className="px-6 py-4 border-t">
          <div className="grid grid-cols-3 gap-x-4 gap-y-3 text-sm">
            {/* Headers */}
            <div className="font-semibold text-muted-foreground"><Skeleton className="h-5 w-20" /></div>
            <div className="font-semibold text-muted-foreground"><Skeleton className="h-5 w-32" /></div>
            <div className="font-semibold text-muted-foreground"><Skeleton className="h-5 w-32" /></div>

            {/* Rows */}
            {[...Array(7)].map((_, i) => (
              <>
                <div key={`criterion-skel-${i}`} className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div key={`progA-skel-${i}`}><Skeleton className="h-4 w-full" /></div>
                <div key={`progB-skel-${i}`}><Skeleton className="h-4 w-full" /></div>
              </>
            ))}
          </div>
        </div>
        <div className="px-6 py-3 border-t flex flex-row gap-3 items-center bg-muted/50">
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-3 h-3 animate-spin inline-flex items-center justify-center">
              <LoaderIcon size={12} />
            </span>
            Comparing programs...
          </span>
        </div>
      </div>
    </div>
  );
}

interface ProgramDetails {
  programName: string;
  universityName: string;
  overview?: string;
  gpaRequirement?: string;
  greRequirement?: string;
  toeflRequirement?: string;
  ieltsRequirement?: string;
  requirementsSummary?: string;
  deadlineHint?: string;
  duration?: string;
  costHint?: string;
  highlight1?: string;
  highlight2?: string;
  highlight3?: string;
  officialLink?: string;
  imageUrls?: string[];
  matchScore?: number;
  choiceType?: string;
}

interface ComparisonItem {
  comparision: string; // Matches the typo in the tool's schema
  choice: string;
  program1: ProgramDetails;
  program2: ProgramDetails;
}

export function CompareProgramResult({ result }: {
  result: {
    object?: ComparisonItem[];
    text?: string;
  };
}) {
  if (result.text || !result.object || result.object.length === 0) {
    return (
      <div className="border py-3 px-4 rounded-xl w-full max-w-3xl mx-auto bg-background shadow-sm">
        <div className="font-medium mb-2 text-lg text-destructive">Comparison Error</div>
        <div className="text-muted-foreground text-sm">
          {result.text || 'Could not retrieve comparison data.'}
        </div>
      </div>
    );
  }

  const data = result.object[0]; // Assuming the first item is the relevant one

  const getTestScores = (program: ProgramDetails) => {
    const scores = [
      program.greRequirement ? `GRE: ${program.greRequirement}` : null,
      program.toeflRequirement ? `TOEFL: ${program.toeflRequirement}` : null,
      program.ieltsRequirement ? `IELTS: ${program.ieltsRequirement}` : null,
    ].filter(Boolean);
    return scores.length > 0 ? scores.join(' / ') : 'N/A';
  };
  
  const comparisonCriteria = [
    {
      icon: <LocationPinIcon />,
      label: 'Location',
      getValue: (p: ProgramDetails) => p.universityName, // City/Country not available, using Uni name as proxy
    },
    {
      icon: <MoneyIcon />,
      label: 'Est. Tuition/Yr',
      getValue: (p: ProgramDetails) => p.costHint || 'N/A',
    },
    {
      icon: <DurationIcon />,
      label: 'Duration',
      getValue: (p: ProgramDetails) => p.duration || 'N/A',
    },
    {
      icon: <GraduationCapIcon />,
      label: 'GPA (Typical)',
      getValue: (p: ProgramDetails) => p.gpaRequirement || 'N/A',
    },
    {
      icon: <TestScoreIcon />,
      label: 'Test (Focus)',
      getValue: (p: ProgramDetails) => getTestScores(p),
    },
    {
      icon: <KeyFeatureIcon />,
      label: 'Key Feature',
      getValue: (p: ProgramDetails) => p.highlight1 || 'N/A',
    },
    {
      icon: <CalendarIcon />,
      label: 'Deadline (Est.)',
      getValue: (p: ProgramDetails) => p.deadlineHint || 'N/A',
    },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
      <div className="border rounded-xl shadow-sm bg-background w-full overflow-hidden">
        <div className="px-6 py-4 border-b bg-muted/30">
          <h2 className="text-xl font-semibold text-primary flex items-center">
            <VersusIcon /> Program Comparison
          </h2>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div>
            <h3 className="text-md font-semibold text-primary mb-1">🏆 Best Choice for You (AI Suggestion):</h3>
            <p className="text-sm text-muted-foreground bg-green-50 p-3 rounded-md border border-green-200">
              {data.choice || 'No specific choice provided.'}
            </p>
          </div>
          <div>
            <h3 className="text-md font-semibold text-primary mb-1">📊 AI Overall Comparison:</h3>
            <p className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-md border border-blue-200 whitespace-pre-wrap">
              {data.comparision || 'No detailed comparison provided.'}
            </p>
          </div>
        </div>
        
        <div className="px-6 py-4 border-t">
          <div className="grid grid-cols-3 gap-x-6 gap-y-4 text-sm">
            {/* Headers */}
            <div className="font-bold text-primary pb-2 border-b">Criterion</div>
            <div className="font-bold text-primary pb-2 border-b">
              {data.program1.programName}
              <div className="text-xs text-muted-foreground font-normal">{data.program1.universityName}</div>
            </div>
            <div className="font-bold text-primary pb-2 border-b">
              {data.program2.programName}
              <div className="text-xs text-muted-foreground font-normal">{data.program2.universityName}</div>
            </div>

            {/* Rows */}
            {comparisonCriteria.map((criterion, idx) => (
              <>
                <div key={`criterion-${idx}`} className="flex items-center gap-2 font-medium text-gray-700">
                  {criterion.icon}
                  <span>{criterion.label}</span>
                </div>
                <div key={`progA-${idx}`} className="text-muted-foreground">
                  {criterion.getValue(data.program1)}
                </div>
                <div key={`progB-${idx}`} className="text-muted-foreground">
                  {criterion.getValue(data.program2)}
                </div>
              </>
            ))}
          </div>
        </div>
        {(data.program1.officialLink || data.program2.officialLink) && (
          <div className="px-6 py-4 border-t bg-muted/30 flex justify-around">
            {data.program1.officialLink && (
              <a
                href={data.program1.officialLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline text-xs font-medium"
              >
                View {data.program1.programName} Page ↗
              </a>
            )}
            {data.program2.officialLink && (
               <a
                href={data.program2.officialLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline text-xs font-medium"
              >
                View {data.program2.programName} Page ↗
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 