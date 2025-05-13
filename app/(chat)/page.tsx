import { cookies } from 'next/headers';

import { Chat } from '@/components/chat';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { generateUUID } from '@/lib/utils';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { auth } from '@/app/(auth)/auth';
import { redirect } from 'next/navigation';
import { isStudentProfileComplete } from '@/app/(auth)/actions';

export const metadata = {
  title: 'Next.js Chatbot Template',
};

export default async function Page() {
  const id = generateUUID();
  console.log("Generated ID in app/(chat)/page.tsx:", id);
  const session = await auth();

  if (!session) {
    redirect('/api/auth/guest');
  }

  if (!session?.user?.id) {
    redirect('/login');
  }

  if (!session.user.email?.startsWith('guest-')) {
    const isComplete = await isStudentProfileComplete(session.user.id);
    if (!isComplete) {
      redirect('/onboarding');
    }
  }

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('chat-model');

  if (!modelIdFromCookie) {
    return (
      <>
        <Chat
          key={id}
          id={id}
          initialMessages={[]}
          initialChatModel={DEFAULT_CHAT_MODEL}
          initialVisibilityType="private"
          isReadonly={false}
          session={session}
          autoResume={false}
        />
        <DataStreamHandler id={id} />
      </>
    );
  }

  return (
    <>
      <Chat
        key={id}
        id={id}
        initialMessages={[]}
        initialChatModel={modelIdFromCookie.value}
        initialVisibilityType="private"
        isReadonly={false}
        session={session}
        autoResume={false}
      />
      <DataStreamHandler id={id} />
    </>
  );
}
