"use client";

import type { SavedProgram } from '@/lib/db/schema';
import { CheckSquare, ChevronDown, MapPinIcon, TrashIcon, ChevronUp } from 'lucide-react'; // Added ChevronUp
import { Button } from './ui/button';
import Link from 'next/link';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Image from 'next/image'; // Added for university logo
import { useState, useEffect } from 'react'; // Added useState, useEffect

// Placeholder for program tag type
type ProgramTag = 'Ambitious' | 'Target' | 'Safe' | string; // Allow string for choiceType

const DEFAULT_LOGO_URL = "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Morgan_Hall_of_Williams_College_in_the_fall_%2827_October_2010%29.jpg/330px-Morgan_Hall_of_Williams_College_in_the_fall_%2827_October_2010%29.jpg";

interface ProgramCardProps {
  program: SavedProgram;
  isSelected?: boolean;
  onSelectProgram?: (isSelected: boolean) => void;
  canSelectMore?: boolean;
}

export function ProgramCard({ program, isSelected, onSelectProgram, canSelectMore = true }: ProgramCardProps) {
  const router = useRouter();
  const [logoUrl, setLogoUrl] = useState<string>(DEFAULT_LOGO_URL);
  const [showCoreRequirements, setShowCoreRequirements] = useState(false); // New state for visibility

  useEffect(() => {
    const fetchLogo = async () => {
      if (!program.universityName) {
        setLogoUrl(DEFAULT_LOGO_URL);
        return;
      }
      try {
        const cleanedName = program.universityName.replace(/\s*\(.?\)\s*/g, '').trim();
        const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanedName)}`;
        const response = await fetch(apiUrl);
        if (!response.ok) {
          console.warn(`Failed to fetch logo for ${program.universityName} from Wikipedia, status: ${response.status}`);
          setLogoUrl(DEFAULT_LOGO_URL); // Use default if fetch fails (e.g., 404)
          return;
        }
        const data = await response.json();
        const fetchedLogoUrl = data?.thumbnail?.source;
        if (fetchedLogoUrl) {
          setLogoUrl(fetchedLogoUrl);
        } else {
          console.warn(`No thumbnail found for ${program.universityName} on Wikipedia.`);
          setLogoUrl(DEFAULT_LOGO_URL); // Use default if no thumbnail source
        }
      } catch (error) {
        console.error("Error fetching university logo:", error);
        setLogoUrl(DEFAULT_LOGO_URL); // Use default on any other error
      }
    };

    fetchLogo();
  }, [program.universityName]);

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/programs/delete?id=${program.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete program');
      }

      toast.success("Program deleted", {
        description: "The program has been removed from your saved list.",
      });

      router.refresh();
    } catch (error) {
      toast.error("Error", {
        description: "Failed to delete program. Please try again later.",
      });
    }
  };

  const getTagColor = (tag: ProgramTag) => {
    switch (tag?.toLowerCase()) { // Use toLowerCase for case-insensitive matching
      case 'ambitious':
        return 'bg-yellow-100 text-yellow-700';
      case 'target':
        return 'bg-green-100 text-green-700';
      case 'safe':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="border rounded-lg shadow-md overflow-hidden bg-white flex flex-col"> {/* Changed shadow and bg, added flex flex-col */}
      {/* Header Section */}
      <div className="p-4 border-b flex items-start space-x-3"> {/* items-start for vertical alignment */}
        <div className="flex-shrink-0">
          {/* University Logo */}
          <Image src={logoUrl} alt={`${program.universityName} logo`} width={40} height={40} className="rounded object-cover" /> {/* Added object-cover */}
        </div>
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{program.universityName}</h2>
              <p className="text-xs text-gray-500 flex items-center">
                <MapPinIcon size={12} className="mr-1" />
                {program.universityName.split(',').pop()?.trim() || 'N/A'} {/* Basic location extraction */}
              </p>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTagColor(program.choiceType || 'N/A')}`}>
              {program.choiceType || 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Body Section */}
      <div className="p-4 space-y-3 flex-grow"> {/* Added flex-grow */}
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Programs:</p>
          <p className="text-sm text-gray-700">{program.programName}</p>
        </div>

        <div className="bg-blue-50 p-3 rounded-md">
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">Match Assessment:</p>
            <p className="text-lg font-bold text-blue-600">{program.matchScore || 'N/A'}%</p>
          </div>
          <p className="text-xs text-gray-600 mt-0.5">Based on your profile and program data.</p>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-0.5">Estimated Tuition:</p>
          <p className="text-sm text-gray-700 font-semibold">{program.costHint || '$0 / year'}</p>
        </div>

        <div>
          <div 
            className="text-xs text-blue-600 hover:underline flex items-center cursor-pointer" 
            onClick={() => setShowCoreRequirements(!showCoreRequirements)} // Toggle visibility
            aria-expanded={showCoreRequirements}
            aria-controls={`core-reqs-${program.id}`}
          >
            Core Requirements {showCoreRequirements ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />}
          </div>
          {showCoreRequirements && (
            <div id={`core-reqs-${program.id}`} className="mt-2 p-3 bg-gray-50 rounded-md text-xs text-gray-700 space-y-1">
              <p><strong>GPA:</strong> {program.gpaRequirement || 'N/A'}</p>
              <p><strong>GRE:</strong> {program.greRequirement || 'N/A'}</p>
              <p><strong>TOEFL:</strong> {program.toeflRequirement || 'N/A'}</p>
              <p><strong>IELTS:</strong> {program.ieltsRequirement || 'N/A'}</p>
              {program.requirementsSummary && <p><strong>Summary:</strong> {program.requirementsSummary}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Footer Section */}
      <div className="p-3 border-t bg-gray-50 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <input 
            type="checkbox" 
            id={`compare-${program.id}`} 
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50" 
            checked={isSelected}
            onChange={(e) => {
              if (onSelectProgram) {
                onSelectProgram(e.target.checked);
              }
            }}
            disabled={!isSelected && !canSelectMore} // Disable if trying to select more than allowed
          />
          <label 
            htmlFor={`compare-${program.id}`} 
            className={`text-xs text-gray-600 cursor-pointer ${(!isSelected && !canSelectMore) ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            Compare
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon" // Changed size to icon for a smaller button
            onClick={handleDelete}
            className="text-gray-500 hover:text-red-600 hover:bg-red-50 p-1" // Adjusted hover colors
            aria-label="Delete program"
          >
            <TrashIcon size={18} /> {/* Increased icon size slightly */}
          </Button>
          {/* Placeholder View Details Button - Link to a program detail page if exists */}
          <Button asChild size="sm" className="bg-gray-800 hover:bg-gray-900 text-white text-xs px-3 py-1.5">
            <Link href={program.officialLink || "#"} target={program.officialLink ? "_blank" : "_self"} rel="noopener noreferrer">
              View Details
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 