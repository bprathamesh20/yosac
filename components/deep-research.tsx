import { useState } from 'react';  
import { GlobeIcon, PaperclipIcon, LoaderIcon } from './icons'; // Updated icons
  
export function DeepResearchCall({ args }: { args: { query: string } }) {  
  return (  
    <div className="border py-2 px-3 rounded-xl flex flex-row items-start justify-between gap-3">  
      <div className="flex flex-row gap-3 items-start">  
        <div className="text-zinc-500 mt-1">  
          <GlobeIcon /> {/* Replaced SearchIcon with GlobeIcon */} 
        </div>  
        <div className="text-left">  
          Researching: "{args.query}"  
        </div>  
      </div>  
      <div className="animate-spin mt-1"><LoaderIcon /></div>  
    </div>  
  );  
}  
  
export function DeepResearchResult({   
  result   
}: {   
  result: { text: string; sources: Array<{ title?: string; url: string }> } // Made title optional 
}) {  
  const [expanded, setExpanded] = useState(false);  

  const getDisplayTitle = (source: { title?: string; url: string }) => {
    if (source.title && source.title.trim() !== '') {
      return source.title;
    }
    try {
      const url = new URL(source.url);
      // Remove www. for cleaner display if present
      return url.hostname.replace(/^www\./, '');
    } catch (e) {
      // If URL parsing fails, return the original URL (or a segment of it)
      return source.url;
    }
  };
    
  return (  
    <div className="border py-2 px-3 rounded-xl w-full">  
      <div className="flex flex-row gap-3 items-start">  
        <div className="text-muted-foreground mt-1">  
          <GlobeIcon /> {/* Replaced SearchIcon with GlobeIcon */} 
        </div>  
        <div className="flex flex-col gap-2 w-full">  
          <div className="font-medium">Deep Research</div>  
            
          {result.sources && result.sources.length > 0 && (  
            <div className="mt-2">  
              <div className="flex flex-wrap gap-2"> 
                {result.sources.slice(0, expanded ? undefined : 3).map((source, i) => (  
                  <a 
                    key={i} 
                    href={source.url} 
                    target="_blank" 
                    rel="noopener noreferrer"   
                    className="flex items-center gap-1 bg-muted hover:bg-muted/80 text-muted-foreground text-xs px-2 py-1 rounded-md transition-colors truncate"
                  >  
                    <PaperclipIcon size={12} /> {/* Replaced LinkIcon with PaperclipIcon */} 
                    <span className="truncate">{getDisplayTitle(source)}</span> {/* Use helper function for title */} 
                  </a>  
                ))}  
              </div>  
            </div>  
          )}  
            
          <button   
            onClick={() => setExpanded(!expanded)}  
            className="text-xs text-primary hover:underline mt-2 self-start"  
          >  
            {expanded ? 'Show less' : 'Show more'}  
          </button>  
        </div>  
      </div>  
    </div>  
  );
} 