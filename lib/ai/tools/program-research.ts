import { generateObject, generateText, tool } from 'ai';
import { z } from 'zod';
import { perplexity } from '@ai-sdk/perplexity';
import { google } from '@ai-sdk/google';
import { auth, type UserType } from '@/app/(auth)/auth';
import { getSavedProgramByUniversityAndProgramName, saveProgram } from '@/lib/db/queries';
import type { SavedProgram } from '@/lib/db/schema';


async function fetchUniversityImageUrls(universityName: string): Promise<string[]> {
    const endpoint = 'https://api.openverse.org/v1/images/';
    const params = new URLSearchParams({
      q: universityName,
      page_size: '4',
    });
  
    const response = await fetch(`${endpoint}?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Openverse API error: ${response.statusText}`);
    }
  
    const data = await response.json();
    return data.results.map((item: { url: string }) => item.url);
  }

export const programResearch = ({ dataStream }: { dataStream?: any }) => tool({
  description:
    'Research a specific program or course in a given university and return structured details.',
  parameters: z.object({
    program: z.string().describe('The program or course to research'),
    university: z.string().describe('The university to research the program in'),
  }),
  execute: async ({ program, university }) => {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      if (dataStream) {
        dataStream.writeData({
          type: 'error',
          content: 'User not authenticated. Cannot save program research.'
        });
      }
      // It might be better to throw an error or return a specific error structure
      // For now, returning a text message for simplicity, or consider not proceeding.
      return { text: 'Error: User not authenticated. Please log in to save program research.' };
    }

    console.log(`[ProgramResearch] User ${userId} searching for: ${program} at ${university}`);

    // Check if the program already exists in the database
    try {
      const existingProgram = await getSavedProgramByUniversityAndProgramName({
        universityName: university,
        programName: program,
      });

      if (existingProgram) {
        console.log(`[ProgramResearch] Found existing program in DB for ${program} at ${university}. Serving from DB.`);
        // We need to ensure the structure matches the expected output 'object'
        // The existingProgram from DB might have more/different fields (id, userId, createdAt)
        // and lacks the 'object' wrapper.
        // Also, the schema for `saveProgram` expects an array for imageUrls,
        // make sure it's handled correctly if your DB stores it differently (e.g., JSON string).
        // For now, let's assume it's compatible or adapt it.
        const responseObject = {
          programName: existingProgram.programName,
          universityName: existingProgram.universityName,
          overview: existingProgram.overview,
          gpaRequirement: existingProgram.gpaRequirement ?? undefined,
          greRequirement: existingProgram.greRequirement ?? undefined,
          toeflRequirement: existingProgram.toeflRequirement ?? undefined,
          ieltsRequirement: existingProgram.ieltsRequirement ?? undefined,
          requirementsSummary: existingProgram.requirementsSummary ?? undefined,
          deadlineHint: existingProgram.deadlineHint,
          duration: existingProgram.duration,
          costHint: existingProgram.costHint,
          highlight1: existingProgram.highlight1,
          highlight2: existingProgram.highlight2,
          highlight3: existingProgram.highlight3 ?? undefined,
          // Assuming imageUrls is stored as string[] in the DB
          imageUrls: existingProgram.imageUrls as string[],
          officialLink: existingProgram.officialLink ?? undefined,
        };
        return { object: responseObject };
      }
    } catch (error) {
      console.error('[ProgramResearch] Error checking for existing program in DB:', error);
      // Proceed with research if DB check fails
    }

    console.log(`[ProgramResearch] Program not found in DB or error occurred. Proceeding with Perplexity research for ${program} at ${university}.`);

    if (dataStream) {
      dataStream.writeData({
        type: 'status',
        content: 'Researching program...'
      });   
    }
    const prompt = `Research the program "${program}" at "${university}". Provide:
- Program Name
- University Name
- A brief overview (1-2 sentences)
- GPA requirement (if available)
- GRE requirement (if available)
- TOEFL requirement (if available)
- IELTS requirement (if available)
- Any other requirements summary (concise)
- Application deadline (approximate, if available)
- Duration (e.g. 16 months)
- Estimated tuition/cost (annual, if available)
- 2-3 highlights (unique features, capstone, industry, etc.)
- Official program link (if available)
Format as a readable list.`;
    const { text } = await generateText({
      model: perplexity('sonar-pro'),
      prompt,
    });

    console.log(`[ProgramResearch] Perplexity research completed for ${program} at ${university}. Extracting details with Gemini.`);

    try {
      const { object: researchedProgramData } = await generateObject({
        model: google('gemini-2.0-flash'),
        output: 'object',
        schema: z.object({
          programName: z.string(),
          universityName: z.string(),
          overview: z.string(),
          gpaRequirement: z.string().optional(),
          greRequirement: z.string().optional(),
          toeflRequirement: z.string().optional(),
          ieltsRequirement: z.string().optional(),
          requirementsSummary: z.string().optional(),
          deadlineHint: z.string(),
          duration: z.string(),
          costHint: z.string(),
          highlight1: z.string(),
          highlight2: z.string(),
          highlight3: z.string().optional(),
          imageUrls: z.array(z.string()), // This will be overwritten
          officialLink: z.string().optional(),
        }),
        prompt: `(dont inculde citations to sources) Extract the following fields as a JSON object from this info about the program at the university.\nFields: programName, universityName, overview, gpaRequirement, greRequirement, toeflRequirement, ieltsRequirement, requirementsSummary, deadlineHint, duration, costHint, highlight1, highlight2, highlight3, officialLink\nText:\n${text}`,
      });


      const imageUrls = await fetchUniversityImageUrls(university);
      researchedProgramData.imageUrls = imageUrls; // Assign fetched image URLs

      // Save the newly researched program to the database
      try {
        await saveProgram({
          userId,
          program: researchedProgramData, // Pass the full object
        });
        console.log(`[ProgramResearch] Successfully saved new program ${researchedProgramData.programName} at ${researchedProgramData.universityName} to DB for user ${userId}.`);
        if (dataStream) {
          dataStream.writeData({
            type: 'status',
            content: 'Saved new program to database.'
          });
        }
      } catch (dbError) {
        console.error('Failed to save program to DB:', dbError);
        // Continue even if DB save fails, to return results to user
      }

      console.log('[ProgramResearch] Gemini object extraction successful:', researchedProgramData);
      return { object: researchedProgramData };
    } catch (err) {
      console.error('[ProgramResearch] Gemini extraction failed:', err, '\nPerplexity text:', text);
      // Fallback: return the text so the UI can show something
      return { text };
    }
  },
}); 