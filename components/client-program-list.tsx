'use client';

import { ProgramList } from '@/components/program-list';
import type { SavedProgram } from '@/lib/db/schema';
import { useRouter } from 'next/navigation';
import { generateUUID } from '@/lib/utils';

interface ClientProgramListProps {
  programs: SavedProgram[];
  chatId: string;
}

export function ClientProgramList({ programs, chatId }: ClientProgramListProps) {
  const router = useRouter();
  
  const handleAppend = async (content: string) => {
    const messageId = generateUUID();
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: chatId,
          message: {
            id: messageId,
            createdAt: new Date(),
            role: 'user',
            content: content,
            parts: [
              {
                type: 'text',
                text: content,
              }
            ],
          },
          selectedChatModel: 'chat-model',
          selectedVisibilityType: 'private',
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      // Navigate to the chat page after successfully sending the message
      router.push(`/chat/${chatId}`);
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Error sending message to chat. Please try again.');
    }
  };
  
  return (
    <ProgramList 
      programs={programs} 
      chatId={chatId}
      append={handleAppend}
    />
  );
} 