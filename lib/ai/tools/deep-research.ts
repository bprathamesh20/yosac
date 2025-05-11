import { generateText, tool } from 'ai';
import { z } from 'zod';
import { perplexity } from '@ai-sdk/perplexity';

export const deepResearch = ({ dataStream }: { dataStream?: any }) => tool({
  description:
    'Perform a deep research on a given query, use when getting info on colleges, scholarships, etc.',
  parameters: z.object({
    query: z.string(),
  }),
  execute: async ({ query }) => {
    console.log('[DEEP-RESEARCH] Tool called with query:', query);
    
    // Notify that research has started
    if (dataStream) {
      dataStream.writeData({
        type: 'status',
        content: 'Researching...',
      });
    }
    
    try {
      const { text, sources } = await generateText({
        model: perplexity('sonar-pro'),
        prompt: query,
      });
      
      console.log('[DEEP-RESEARCH] Successfully generated response');
      
      // Notify that research is complete
      if (dataStream) {
        dataStream.writeData({
          type: 'finish',
          content: '',
        });
      }
      
      return {
        text,
        sources,
      };
    } catch (error) {
      console.error('[DEEP-RESEARCH] Error:', error);
      throw error;
    }
  },
});
