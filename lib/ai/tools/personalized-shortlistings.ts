import { generateObject, generateText, tool } from 'ai';
import { z } from 'zod';
import { perplexity } from '@ai-sdk/perplexity';
import { google } from '@ai-sdk/google';
import { auth } from '@/app/(auth)/auth';
import { getStudentProfileByUserId } from '@/lib/db/queries';
import { StudentProfile } from '@/lib/db/schema';

const photoLink = "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Morgan_Hall_of_Williams_College_in_the_fall_%2827_October_2010%29.jpg/330px-Morgan_Hall_of_Williams_College_in_the_fall_%2827_October_2010%29.jpg";

async function fetchUniversityPhoto(universityName: string): Promise<string | null> {
  const cleanedName = universityName.replace(/\s*\(.?\)\s/g, '').trim();

  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanedName)}`;
  const response = await fetch(url);
  if (!response.ok) return null;

  const data = await response.json();
  return data?.thumbnail?.source ?? null;
}

export const personalizedShortlistings = ({ dataStream }: { dataStream?: any }) => tool({
  description:
    'Generate a personalized shortlist of universities for a given student.',
  parameters: z.object({
    country: z.string().describe('Country to research universities for'),
  }),
  execute: async ({ country }) => {

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
    }
    if (userId) {
      student = await getStudentProfileByUserId({ userId });
    }

    if (dataStream) {
      dataStream.writeData({
        type: 'status',
        content: 'Researching universities...'
      });   
    }
    const prompt = `
    Student Profile: ${JSON.stringify(student)}
    Researching universities only for the country: ${country}

    Give me list of universities for ms in computer science in us for the above profile , Divide the results in following groups

    Safe: Very high tos high chance of admission : select 3 universities in this category.
    Target: Good match for your profile : select 2 universities in this category.
    Ambitious: Small to low chance of admission : select 3 universities in this category.

    Give me the following information for each university:
    - Name of the university
    - Highlights of the program
    - Match score of the program for the student between 0 and 100
    - Type of choice could be "safe", "target", "ambitious"
    - Tuition cost
    - website link for program 
    - Duration of the program

    `;
    const { text } = await generateText({
      model: perplexity('sonar-deep-research'),
      prompt,
    });



const { object } = await generateObject({
  model: google('gemini-2.0-flash'),
  output: 'array',
  schema: z.object({
    name: z.string().describe('The name of the university'),
    program: z.string().describe('The name of the program'),
    highlights: z.string().describe('A list of highlights of the program'),
    matchScore: z.number().int().min(0).max(100).describe('The match score of the program for the student between 0 and 100'),
    choiceType: z.string().describe('Type of choice could be "safe", "target", "ambitious"'),
    tuitionCost: z.number().describe('Tuition cost'),
    duration: z.string().describe('Duration of the program'),
    websiteLink: z.string().describe('Link for the program website'),
    photo: z.string().describe('Link for the college Logo'),
  }),
  prompt: 'Generate the json object for universities from the given info ' + text,
});

await Promise.all(
  object.map(async (uni) => {
    const photo = await fetchUniversityPhoto(uni.name);
    uni.photo = photo ?? photoLink;
  })
);

    console.log(object);
    return { object };
  },
}); 