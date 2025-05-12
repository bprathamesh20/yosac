import { useState } from 'react';
import { LoaderIcon } from './icons';
import { Skeleton } from './ui/skeleton';

function TrophyIcon() {
  return <span role="img" aria-label="trophy">🏆</span>;
}


export function UniversityResearchCall({ args }: { args: { country: string } }) {
  // Show 3 skeleton cards as placeholders
  return (
    <div className="flex flex-row gap-4 w-full overflow-x-auto pb-2">
      {[1, 2, 3].map((_, i) => (
        <div key={i} className="bg-background border rounded-xl shadow-sm min-w-[260px] max-w-[300px] flex flex-col p-4 gap-2 animate-pulse">
          <div className="h-28 w-full bg-muted rounded-lg mb-2 flex items-center justify-center text-4xl">
            {/* Placeholder for image */}
            <TrophyIcon />
          </div>
          <Skeleton className="font-semibold text-lg leading-tight w-2/3 h-6 mb-1" />
          <Skeleton className="text-muted-foreground text-sm mb-1 w-full h-4" />
          <div className="flex flex-row gap-2 mt-auto">
            <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-xs font-medium">
              <span className="w-3 h-3 animate-spin inline-flex items-center justify-center">
                <LoaderIcon size={12} />
              </span>
              <span className="text-xs">Global</span>
            </span>
          </div> 
        </div>
      ))}
    </div>
  );
}

export function UniversityResearchResult({ result }: {
  result: {
    object?: Array<{
      name: string;
      rank?: number;
      description?: string;
      photo: string;
    }>;
    text?: string;
  }
}) {
  const [expanded, setExpanded] = useState(false);
  const universities = result.object || [];

  if (!universities.length) {
    // fallback: show text
    return (
      <div className="border py-2 px-3 rounded-xl w-full">
        <div className="font-medium mb-2">Top Universities</div>
        <div className="text-muted-foreground text-sm">{result.text}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-row gap-4 w-full overflow-x-auto pb-2">
      {universities.map((u, i) => (
        <div key={i} className="bg-background border rounded-xl shadow-sm min-w-[260px] max-w-[300px] flex flex-col p-4 gap-2">
          <div className="h-28 w-full bg-muted rounded-lg mb-2 flex items-center justify-center text-4xl">
            <img src={u.photo} alt={u.name} className="object-cover h-full rounded-lg"/>
          </div>
          <div className="font-semibold text-lg leading-tight">{u.name}</div>
          <div className="text-muted-foreground text-sm mb-1">
            {u.description || 'Highly ranked university.'}
          </div>
          <div className="flex flex-row gap-2 mt-auto">
            {typeof u.rank === 'number' && u.rank !== 0 && (
              <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-xs font-medium">
                <TrophyIcon />
                {u.rank}
                <span className="text-xs">Global</span>
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
} 