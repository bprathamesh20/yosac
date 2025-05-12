'use client' // Add this directive for client-side hooks

import type { SavedProgram } from '@/lib/db/schema';  
import { CalendarIcon, ClockIcon, DollarSignIcon, TrashIcon } from 'lucide-react';  
import { Button } from './ui/button';  
import Link from 'next/link';  
// import { deleteSavedProgram } from '@/lib/db/queries'; // Remove direct db query import
import { toast } from 'sonner'; // Correct toast import
import { useRouter } from 'next/navigation'; // Import useRouter for refresh
  
export function ProgramCard({ program }: { program: SavedProgram }) {  
  const router = useRouter(); // Initialize router
  
  const handleDelete = async () => {  
    try {  
      const response = await fetch(`/api/programs/delete?id=${program.id}`, { // Use API route 
        method: 'DELETE',
      });  
        
      if (!response.ok) {
        throw new Error('Failed to delete program');
      }

      toast.success("Program deleted", { // Use toast directly
        description: "The program has been removed from your saved list.",  
      });  
        
      // Refresh the page to show updated list using router refresh
      router.refresh(); 
    } catch (error) {  
      toast.error("Error", { // Use toast directly
        description: "Failed to delete program. Please try again later.",  
        // variant: "destructive", // Sonner uses different method for variants
      });  
    }  
  };  
  
  return (  
    <div className="border rounded-lg shadow-sm overflow-hidden bg-background"> {/* Added bg-background for consistency */} 
      <div className="p-4 border-b">  
        <h2 className="text-lg font-semibold">{program.programName}</h2>  
        <p className="text-sm text-muted-foreground">{program.universityName}</p>  
      </div>  
        
      <div className="p-4">  
        {/* Use line-clamp for potentially long overviews */}
        <p className="text-sm mb-3 line-clamp-3">{program.overview}</p>  
          
        <div className="flex flex-wrap gap-2 mb-3">  
          <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-xs">  
            <CalendarIcon size={12} /> {program.deadlineHint}  
          </span>  
          <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-xs">  
            <ClockIcon size={12} /> {program.duration}  
          </span>  
          <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-xs">  
            <DollarSignIcon size={12} /> {program.costHint}  
          </span>  
        </div>  
      </div>  
        
      <div className="p-4 border-t bg-muted/50 flex justify-between items-center"> {/* Added items-center */} 
        {program.officialLink ? (  
          <Link   
            href={program.officialLink}   
            target="_blank"   
            rel="noopener noreferrer" // Added rel attribute
            className="text-primary hover:underline text-sm font-medium" // Added font-medium
          >  
            View Program ↗  
          </Link>  
        ) : (  
          <span></span> // Keep empty span for layout consistency 
        )}  
          
        <Button   
          variant="ghost"   
          size="sm"   
          onClick={handleDelete}  
          className="text-destructive hover:bg-destructive/10 p-1.5 h-auto" // Adjusted padding and height
          aria-label="Delete program" // Added aria-label
        >  
          <TrashIcon size={16} />  
        </Button>  
      </div>  
    </div>  
  );  
} 