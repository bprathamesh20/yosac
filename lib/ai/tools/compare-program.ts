import { generateObject, generateText, tool } from 'ai';
import { z } from 'zod';
import { perplexity } from '@ai-sdk/perplexity';
import { google } from '@ai-sdk/google';
import { getStudentProfileByUserId, getTwoSavedPrograms } from '@/lib/db/queries';
import { auth } from '@/app/(auth)/auth';


export const compareProgram = ({ dataStream }: { dataStream?: any }) => tool({
  description:
    'Compare two programs and return a list of universities that offer both programs.',
  parameters: z.object({
    program1name: z.string().describe('The first program name'),
    program1university: z.string().describe('The first program university'),
    program2name: z.string().describe('The second program name'),
    program2university: z.string().describe('The second program university'),
  }),       
  execute: async ({ program1name, program1university, program2name, program2university }) => {
    console.log('[compareProgram] Input parameters:', { program1name, program1university, program2name, program2university });
    if (dataStream) {
      dataStream.writeData({
        type: 'status',
        content: 'Comparing programs...'
      });   
    }

    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      if (dataStream) {
        dataStream.writeData({
          type: 'error',
          content: 'User not authenticated. Cannot compare programs.'
        });
      }
      console.error('[compareProgram] User not authenticated.');
      return { text: 'Error: User not authenticated. Please log in to compare programs.' };
    }
    const studentProfile = await getStudentProfileByUserId({ userId });
    console.log('[compareProgram] Fetched student profile:', studentProfile);

    const { program1, program2 } = await getTwoSavedPrograms({
      userId,
      program1university,
      program1name,
      program2university,
      program2name,
    });

    console.log('[compareProgram] Fetched programs from DB:', { program1, program2 });

    // Handle cases where one or both programs are not found
    if (!program1 || !program2) {
      let errorMessage = 'Error: Could not find one or both programs in your saved list.';
      if (!program1 && !program2) {
        errorMessage = `Error: Could not find ${program1name} at ${program1university} and ${program2name} at ${program2university} in your saved programs.`;
      } else if (!program1) {
        errorMessage = `Error: Could not find ${program1name} at ${program1university} in your saved programs.`;
      } else {
        errorMessage = `Error: Could not find ${program2name} at ${program2university} in your saved programs.`;
      }
      if (dataStream) {
        dataStream.writeData({
          type: 'error',
          content: errorMessage
        });
      }
      console.error('[compareProgram] Error fetching programs:', errorMessage);
      return { text: errorMessage };
    }

    console.log('[compareProgram] Generating AI comparison for:', { program1, program2, studentProfile });

    let { object } = await generateObject({
    model: google('gemini-2.5-pro-preview-05-06'),
    output: 'array',
    schema: z.object({
       comparision: z.string().describe('The comparision of the two programs'),
       choice: z.string().describe('Best choice between the two programs for the user'),
    }),
    prompt: `Compare the two programs and return the comparision and the best choice between the two programs for the user
    
    program1: ${JSON.stringify(program1)}
    program2: ${JSON.stringify(program2)}
    
    student profile: ${JSON.stringify(studentProfile)}
    ` ,
    });
    // Add program1 and program2 to the response
    const enhancedResponse = object.map(item => ({
      ...item,
      program1: {
        programName: program1.programName,
        universityName: program1.universityName,
        overview: program1.overview,
        gpaRequirement: program1.gpaRequirement,
        greRequirement: program1.greRequirement,
        toeflRequirement: program1.toeflRequirement,
        ieltsRequirement: program1.ieltsRequirement,
        requirementsSummary: program1.requirementsSummary,
        deadlineHint: program1.deadlineHint,
        duration: program1.duration,
        costHint: program1.costHint,
        highlight1: program1.highlight1,
        highlight2: program1.highlight2,
        highlight3: program1.highlight3,
        officialLink: program1.officialLink,
        imageUrls: program1.imageUrls,
        matchScore: program1.matchScore,
        choiceType: program1.choiceType
      },
      program2: {
        programName: program2.programName,
        universityName: program2.universityName,
        overview: program2.overview,
        gpaRequirement: program2.gpaRequirement,
        greRequirement: program2.greRequirement,
        toeflRequirement: program2.toeflRequirement,
        ieltsRequirement: program2.ieltsRequirement,
        requirementsSummary: program2.requirementsSummary,
        deadlineHint: program2.deadlineHint,
        duration: program2.duration,
        costHint: program2.costHint,
        highlight1: program2.highlight1,
        highlight2: program2.highlight2,
        highlight3: program2.highlight3,
        officialLink: program2.officialLink,
        imageUrls: program2.imageUrls,
        matchScore: program2.matchScore,
        choiceType: program2.choiceType
      }
    }));

    // Replace the original object with the enhanced response
    object = enhancedResponse;

    console.log('[compareProgram] Final response object:', object);

    return { object };
  },
}); 