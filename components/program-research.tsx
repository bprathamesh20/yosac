import { LoaderIcon } from './icons';
import { useState } from 'react';
import { Skeleton } from './ui/skeleton';
import { Button } from './ui/button';
import { BookmarkIcon } from 'lucide-react';
import { toast } from 'sonner';

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
      imageUrls: string[];
      matchScore?: number;
      choiceType?: string;
    };
    text?: string;
  },
}) {
  const data = result.object;
  const [expanded, setExpanded] = useState(false);
  const [viewerImg, setViewerImg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);  
  const SUMMARY_LIMIT = 120;

  // Function to save program  
  const saveProgram = async () => {  
    if (!data) return;  
      
    setIsSaving(true);  
    try {  
      const response = await fetch('/api/programs/save', {  
        method: 'POST',  
        headers: {  
          'Content-Type': 'application/json',  
        },  
        body: JSON.stringify({ program: data }),  
      });  
        
      if (response.ok) {  
        toast.success("Program saved", {  
          description: "The program has been saved successfully.",  
        });  
      } else {  
        throw new Error('Failed to save program');  
      }  
    } catch (error) {  
      toast.error("Error", {  
        description: "Failed to save program. Please try again later.",  
      });  
    } finally {  
      setIsSaving(false);  
    }  
  };  

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
      {data.imageUrls && data.imageUrls.length > 0 && (
        <div className="w-full flex flex-row flex-wrap justify-center gap-2 px-5 pt-4 pb-2 md:flex-nowrap md:justify-start md:overflow-x-auto">
          {data.imageUrls.map((url, idx) => (
            <img
              key={idx}
              src={url}
              alt={`Program image ${idx + 1}`}
              className="rounded-md object-cover w-[calc(50%-0.25rem)] h-auto max-h-36 border cursor-pointer md:w-auto md:min-w-[120px] md:max-w-[200px] md:max-h-32"
              onClick={() => setViewerImg(url)}
            />
          ))}
        </div>
      )}
      {viewerImg && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70"
          onClick={() => setViewerImg(null)}
        >
          <div
            className="relative max-w-full max-h-full flex items-center justify-center"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={viewerImg}
              alt="Enlarged program image"
              className="rounded-lg max-h-[80vh] max-w-[90vw] shadow-lg"
            />
            <button
              className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full w-8 h-8 flex items-center justify-center shadow text-xl"
              onClick={() => setViewerImg(null)}
              aria-label="Close photo viewer"
            >
              ×
            </button>
          </div>
        </div>
      )}
      <div className="px-5 py-4 border-b flex flex-col gap-1">
      {(data.matchScore !== undefined || data.choiceType) && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {data.matchScore !== undefined && (
              <span className="flex items-center gap-1 bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-xs font-medium">
                <StarIcon /> Match: {data.matchScore}%
              </span>
            )}
            {data.choiceType && (
              <span 
                className={`px-2 py-1 rounded-md text-xs font-medium 
                  ${data.choiceType.toLowerCase() === 'safe' ? 'bg-green-100 text-green-800' : 
                    data.choiceType.toLowerCase() === 'ambitious' ? 'bg-red-100 text-red-800' : 
                    data.choiceType.toLowerCase() === 'target' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-gray-100 text-gray-800'}
                `}
              >
                {data.choiceType.charAt(0).toUpperCase() + data.choiceType.slice(1)}
              </span>
            )}
          </div>
        )}

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
      <div className="px-5 py-3 border-t flex flex-row gap-3 items-center bg-muted/50 justify-between">  
        <div>  
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
        <Button   
          variant="outline"  
          size="sm"  
          onClick={saveProgram}  
          disabled={isSaving || !data}  
          className="flex items-center gap-2"  
        >  
          <BookmarkIcon size={16} />  
          {isSaving ? 'Saving...' : 'Save Program'}  
        </Button>  
      </div>
    </div>
  );
} 