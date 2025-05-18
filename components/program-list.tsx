"use client";

import React, { useState } from 'react';
import type { SavedProgram } from '@/lib/db/schema';
import { ProgramCard } from '@/components/program-card';
import { Button } from '@/components/ui/button';
import { MessageSquareText, XCircle, Loader2 } from 'lucide-react'; // Removed RowsIcon, kept Loader2
import { useRouter } from 'next/navigation';

interface ProgramListProps {
  programs: SavedProgram[];
  append?: (content: string) => Promise<void>;
  chatId?: string;
}

const ProgramList: React.FC<ProgramListProps> = ({ programs, append, chatId }) => {
  const [selectedPrograms, setSelectedPrograms] = useState<SavedProgram[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSelectProgram = (program: SavedProgram, isSelected: boolean) => {
    setSelectedPrograms(prevSelected => {
      if (isSelected) {
        if (prevSelected.length < 2 && !prevSelected.find(p => p.id === program.id)) {
          return [...prevSelected, program];
        }
        // Enforce max 2 selection, return current if trying to select more or already selected
        // The card should ideally prevent re-selecting if already selected, but double check here
        return prevSelected;
      } else {
        return prevSelected.filter(p => p.id !== program.id);
      }
    });
  };

  const handleClearSelection = () => {
    setSelectedPrograms([]);
    setIsLoading(false); // Reset loading state if selection is cleared
  };

  const handleDiscussWithAI = async () => {
    if (selectedPrograms.length === 0) {
      alert('Please select at least one program to discuss with AI.');
      return;
    }
    if (!append) {
      console.log('Discussing with AI about (fallback):', selectedPrograms.map(p => p.universityName));
      alert(`Discussing with AI about: ${selectedPrograms.map(p => p.programName).join(' and ')}`);
      return;
    }

    setIsLoading(true);
    let message = '';
    if (selectedPrograms.length === 1) {
      const program = selectedPrograms[0];
      message = `Tell me about ${program.programName} at ${program.universityName}`;
    } else if (selectedPrograms.length === 2) {
      const program1 = selectedPrograms[0];
      const program2 = selectedPrograms[1];
      message = `Compare ${program1.programName} at ${program1.universityName} with ${program2.programName} at ${program2.universityName}`;
    }

    try {
      await append(message);
    } catch (error) {
      console.error("Error in handleDiscussWithAI:", error);
      alert("Failed to discuss with AI. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {programs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>You haven't saved any programs yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-24"> {/* Added pb-24 for footer space */}
          {programs.map((program) => (
            <ProgramCard
              key={program.id}
              program={program}
              isSelected={selectedPrograms.some(p => p.id === program.id)}
              onSelectProgram={(isSelected) => handleSelectProgram(program, isSelected)}
              canSelectMore={selectedPrograms.length < 2 || selectedPrograms.some(p => p.id === program.id)}
            />
          ))}
        </div>
      )}

      {selectedPrograms.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
          <div className="container mx-auto flex items-center justify-between">
            <div className="text-sm text-gray-700">
              {selectedPrograms.length} university{selectedPrograms.length === 1 ? '' : 's'} selected
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" onClick={handleClearSelection} className="flex items-center" disabled={isLoading}>
                <XCircle size={16} className="mr-1.5" />
                Clear Selection
              </Button>
              <Button variant="outline" size="sm" onClick={handleDiscussWithAI} className="flex items-center" disabled={isLoading || selectedPrograms.length === 0}>
                {isLoading ? (
                  <Loader2 size={16} className="mr-1.5 animate-spin" />
                ) : (
                  <MessageSquareText size={16} className="mr-1.5" />
                )}
                {isLoading ? 'Processing...' : 'Discuss with AI'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { ProgramList }; 