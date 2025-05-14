import { generateObject, generateText, tool } from 'ai';
import { z } from 'zod';
import { perplexity } from '@ai-sdk/perplexity';
import { google } from '@ai-sdk/google';
import { auth, type UserType } from '@/app/(auth)/auth';
import { getProgramByUniversityAndProgramName, savePublicProgram, getStudentProfileByUserId } from '@/lib/db/queries';
import type { StudentProfile } from '@/lib/db/schema';


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
    let student: StudentProfile | undefined = undefined;

    if (!userId) {
      if (dataStream) {
        dataStream.writeData({
          type: 'error',
          content: 'User not authenticated. Cannot save program research.'
        });
      }
      return { text: 'Error: User not authenticated. Please log in to save program research.' };
    }

    student = await getStudentProfileByUserId({ userId });

    console.log(`[ProgramResearch] User ${userId} searching for: ${program} at ${university}`);
    if (student) {
      console.log(`[ProgramResearch] Using student profile:`, JSON.stringify(student, null, 2));
    } else {
      console.log(`[ProgramResearch] No student profile found for user ${userId}.`);
    }

    // Check if the program already exists in the database
    try {
      const existingProgram = await getProgramByUniversityAndProgramName({
        universityName: university,
        programName: program,
      });

      if (existingProgram) {
        console.log(`[ProgramResearch] Found existing program in DB for ${program} at ${university}. Serving from DB.`);
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


        const { object: researchedProgramData } = await generateObject({
          model: google('gemini-2.0-flash'),
          output: 'object',
          schema: z.object({
            matchScore: z.number().describe("Match score of the program for the student between 0 and 100"),
            choiceType: z.string().optional().describe("Type of choice could be 'safe', 'ambitious', 'target'"),
          }),
          prompt: `Give a match score of the program for the student between 0 and 100 and a type of choice could be 'safe', 'ambitious', 'target' based on comparison of the program and the student profile.
          Program: ${existingProgram}
          Student: ${student}
          
          `,
        });



        return { 
          object: {
            ...responseObject,
            ...researchedProgramData
          }
        };
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

Following is the student profile:
- CGPA: ${student?.cgpa ?? 'N/A'}
- GRE Quant Score: ${student?.greQuantScore ?? 'N/A'}
- GRE Verbal Score: ${student?.greVerbalScore ?? 'N/A'}
- GRE AWA Score: ${student?.greAwaScore ?? 'N/A'}
- TOEFL Score: ${student?.toeflScore ?? 'N/A'}
- IELTS: ${student?.ielts ?? 'N/A'}
- Work Experience (Months): ${student?.workExpMonths ?? 'N/A'}
- Publications: ${student?.publications ?? 'N/A'}

Based on the student profile and the program, provide the following:
- Match score of the program for the student between 0 and 100
- Type of choice could be 'safe', 'ambitious', 'target'

Format as a readable list.`;

    const { text } = await generateText({
      model: perplexity('sonar-deep-research'),
      prompt,
    });

    console.log(`[ProgramResearch] Perplexity research completed for ${program} at ${university}. Extracting details with Gemini.`);

    try {
      const { object: researchedProgramData } = await generateObject({
        model: google('gemini-2.0-flash'),
        output: 'object',
        schema: z.object({
          programName: z.string().describe("Name of the program"),
          universityName: z.string().describe("Name of the university"),
          overview: z.string().describe("Overview of the program"),
          gpaRequirement: z.string().describe("GPA requirement of the program in floating point out of 4 return as 'x/4', if not stated return 'N/A'"),
          greRequirement: z.string().describe("GRE requirement of the program in floating point out of 170 return as 'x/320', if not stated return 'N/A'"),
          toeflRequirement: z.string().describe("TOEFL requirement of the program in floating point out of 120 return as 'x/120', if not stated return 'N/A'"),
          ieltsRequirement: z.string().describe("IELTS requirement of the program in floating point out of 9 return as 'x/9', if not stated return 'N/A'"),
          requirementsSummary: z.string().describe("Summary of the requirements of the program"),
          deadlineHint: z.string().describe("Deadline of the program in 'MM/DD/YYYY' format"),
          duration: z.string().describe("Duration of the program in 'x months' format"),
          costHint: z.string().describe("Cost of the program in 'currency mark x' format"),
          highlight1: z.string().describe("Highlight 1 of the program"),
          highlight2: z.string().describe("Highlight 2 of the program"),
          highlight3: z.string().describe("Highlight 3 of the program").optional(),
          matchScore: z.number().describe("Match score of the program for the student between 0 and 100"),
          choiceType: z.string().optional().describe("Type of choice could be 'safe', 'ambitious', 'target'"),
          imageUrls: z.array(z.string()), // This will be overwritten
          officialLink: z.string().describe("Official link of the program"),
        }),
        prompt: `(dont inculde citations to sources) Extract the following fields as a JSON object from this info about the program at the university.\nFields: programName, universityName, overview, gpaRequirement, greRequirement, toeflRequirement, ieltsRequirement, requirementsSummary, deadlineHint, duration, costHint, highlight1, highlight2, highlight3, officialLink, matchScore, choiceType\nText:\n${text}`,
      });


      const imageUrls = await fetchUniversityImageUrls(university);
      researchedProgramData.imageUrls = imageUrls; // Assign fetched image URLs

      // Prepare data for public program table (excluding fields like matchScore, choiceType if present)
      const { 
        matchScore, 
        choiceType, 
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ...publicProgramPayload 
      } = researchedProgramData;

      // Save the newly researched program to the public database
      try {
        await savePublicProgram(publicProgramPayload); // Call savePublicProgram
        console.log(`[ProgramResearch] Successfully saved new program ${publicProgramPayload.programName} at ${publicProgramPayload.universityName} to public DB.`);
        if (dataStream) {
          dataStream.writeData({
            type: 'status',
            content: 'Saved new program to public database.' // Updated status message
          });
        }
      } catch (dbError) {
        console.error('Failed to save program to public DB:', dbError);
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