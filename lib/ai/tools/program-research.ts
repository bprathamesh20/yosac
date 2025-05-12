import { generateObject, generateText, tool } from 'ai';
import { z } from 'zod';
import { perplexity } from '@ai-sdk/perplexity';
import { google } from '@ai-sdk/google';


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

    try {
      const { object } = await generateObject({
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
          imageUrls: z.array(z.string()),
          officialLink: z.string().optional(),
        }),
        prompt: `Extract the following fields as a JSON object from this info about the program at the university.\nFields: programName, universityName, overview, gpaRequirement, greRequirement, toeflRequirement, ieltsRequirement, requirementsSummary, deadlineHint, duration, costHint, highlight1, highlight2, highlight3, officialLink\nText:\n${text}`,
      });


      const imageUrls = await fetchUniversityImageUrls(university);
      object.imageUrls = imageUrls;

      console.log('Gemini object:', object);
      return { object };
    } catch (err) {
      console.error('Gemini extraction failed:', err, '\nPerplexity text:', text);
      // Fallback: return the text so the UI can show something
      return { text };
    }
  },
}); 