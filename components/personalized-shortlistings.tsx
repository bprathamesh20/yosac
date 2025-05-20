"use client";
import { useState, useEffect } from 'react';
import { Skeleton } from './ui/skeleton';
import { Button } from './ui/button';
import { HeartIcon, InfoIcon, Loader2 as LoaderIcon } from 'lucide-react'; // Using lucide-react for icons
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { UseChatHelpers } from '@ai-sdk/react'; // for append and handleSubmit types

// Define props type based on the tool's output schema
interface UniversityShortlist {
  name: string;
  program: string; // This is programName in the image, e.g., "MS in Computer Science (AI Spec.)"
  highlights: string; // Assuming newline-separated string for bullet points
  matchScore: number;
  choiceType: 'safe' | 'target' | 'ambitious' | string; // Allow string for broader compatibility
  tuitionCost: number; // e.g., 52000, will be formatted to ~$52k/yr
  duration: string; // e.g., "2 Years"
  photo: string; 
}

// Icons using emojis as per the visual reference for tags
const AmbitiousTargetSafeIcon = () => <span role="img" aria-label="target">🎯</span>;
const MatchScoreIcon = () => <span role="img" aria-label="star">⭐</span>;

const loadingMessages = [
  "Analyzing your profile...",
  "Scanning thousands of programs...",
  "Curating top university matches...",
  "Matching programs to your preferences...",
  "Finalizing your personalized shortlist..."
];

export function PersonalizedShortlistingsCall({ args }: { args: { program: string } }) {
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setSecondsElapsed(prev => {
        if (prev >= 180) {
          clearInterval(intervalId);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const progress = Math.min((secondsElapsed / 300) * 100, 100);
  const currentMessageIndex = Math.floor(secondsElapsed / 30) % loadingMessages.length;

  return (
    <div className="border rounded-2xl border-gray-200 bg-white p-6 w-2/3">
      <span className="text-gray-800 text-base font-medium mb-4 block">{loadingMessages[currentMessageIndex]}</span>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-2 bg-primary transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function PersonalizedShortlistingsResult({ result, chatId, append, handleSubmit }: {
  result: {
    object?: UniversityShortlist[];
    text?: string; // Fallback text
  };
  chatId?: string; // Added chatId prop
  append: UseChatHelpers['append'];
  handleSubmit: UseChatHelpers['handleSubmit'];
}) {
  const universities = result.object;
  const [savingStates, setSavingStates] = useState<Record<string, boolean>>({});
  const [viewingDetailsStates, setViewingDetailsStates] = useState<Record<string, boolean>>({});
  const currentChatId = chatId; // directly use chatId prop (assumed passed correctly)

  const handleSaveProgram = async (uni: UniversityShortlist) => {
    const uniId = `${uni.name}-${uni.program}`;
    setSavingStates(prev => ({ ...prev, [uniId]: true }));
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.success(`${uni.name} - ${uni.program} has been notionally saved!`); // Placeholder
    setSavingStates(prev => ({ ...prev, [uniId]: false }));
  };

  const handleViewDetailsClick = async (uni: UniversityShortlist) => {
    const uniId = `${uni.name}-${uni.program}`;
    setViewingDetailsStates(prev => ({ ...prev, [uniId]: true }));
    const content = `tell me more about ${uni.program} at ${uni.name}`;
    try {
      append({ role: 'user', content }); // append to chat
      await handleSubmit(undefined); // send the message to server
    } catch (error) {
      console.error('Failed to send message for "View Details":', error);
      toast.error('Error sending message. Please try again.');
    } finally {
      setViewingDetailsStates(prev => ({ ...prev, [uniId]: false }));
    }
  };

  if (!universities || universities.length === 0) {
    return (
      <div className="border py-3 px-4 rounded-xl w-full bg-muted/50">
        <div className="font-medium mb-1 text-base">Personalized Shortlist</div>
        <div className="text-muted-foreground text-sm">
          {result.text || "Sorry, we couldn't generate a shortlist at this time."}
        </div>
      </div>
    );
  }

  const getChoiceTypeClasses = (choiceType: string) => {
    const type = choiceType.toLowerCase();
    // Matching image: Ambitious (Yellow), Target (Green), Safe (Green)
    if (type === 'ambitious') {
      return 'bg-yellow-50 text-yellow-700 border-yellow-300 hover:bg-yellow-100';
    }
    if (type === 'target' || type === 'safe') {
      return 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100';
    }
    return 'bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {universities.map((uni, index) => {
          const uniId = `${uni.name}-${uni.program}-${index}`;
          const isSaving = savingStates[uniId] || false;
          const isViewingDetails = viewingDetailsStates[`${uni.name}-${uni.program}`] || false; // Check loading state for view details
          const highlightsList = uni.highlights.split('\n').map(h => h.trim()).filter(h => h.length > 0);

          return (
            <div key={uniId} className="bg-background border rounded-xl shadow-sm flex flex-col">
              <div className="p-5 flex-grow">
                {/* Header: Logo, University Name, Program Name */}
                <div className="flex items-start gap-4 mb-4">
                  <img 
                    src={uni.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(uni.name)}&background=EBF4FF&color=0D6EFD&bold=true&size=64`} 
                    alt={`${uni.name} logo`}
                    className="h-14 w-14 rounded-full object-cover border bg-gray-100" 
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(uni.name)}&background=EBF4FF&color=0D6EFD&bold=true&size=64`;
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-800 leading-tight">{uni.name}</h3>
                    <p className="text-sm text-gray-600">{uni.program}</p>
                  </div>
                </div>

                {/* Match Score & Choice Type Tags */}
                <div className="flex flex-wrap items-center gap-2 mb-5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-300 hover:bg-purple-100 transition-colors">
                    <MatchScoreIcon />
                    Match Score: {uni.matchScore}%
                  </span>
                  <span 
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors",
                      getChoiceTypeClasses(uni.choiceType)
                    )}
                  >
                    <AmbitiousTargetSafeIcon />
                    {uni.choiceType.charAt(0).toUpperCase() + uni.choiceType.slice(1)}
                  </span>
                </div>

                {/* Key Highlights */}
                <div className="mb-5">
                  <h4 className="font-semibold text-sm text-gray-700 mb-1.5">Key Highlights:</h4>
                  {highlightsList.length > 0 ? (
                    <ul className="list-disc list-outside ml-5 space-y-1 text-sm text-gray-600">
                      {highlightsList.map((highlight, idx) => (
                        <li key={idx}>{highlight}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No specific highlights provided.</p>
                  )}
                </div>
                
                {/* Estimated Tuition & Duration */}
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Est. Tuition: <strong className="text-gray-700">~${Math.round(uni.tuitionCost / 1000)}k/yr</strong></span>
                  <span>Duration: <strong className="text-gray-700">{uni.duration}</strong></span>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="px-5 py-3 border-t flex justify-between items-center bg-gray-50/70 rounded-b-xl">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-sm gap-1.5 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                  onClick={() => handleViewDetailsClick(uni)}
                  disabled={isViewingDetails || !currentChatId}
                >
                  {isViewingDetails ? <LoaderIcon className="animate-spin" size={14} /> : <InfoIcon size={14} />}
                  {isViewingDetails ? 'Loading...' : 'View Details'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-sm gap-1.5 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                  onClick={() => handleSaveProgram(uni)}
                  disabled={isSaving}
                >
                  {isSaving ? <LoaderIcon className="animate-spin" size={14} /> : <HeartIcon size={14} />}
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
  );
} 