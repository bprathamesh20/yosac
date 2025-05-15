import { redirect } from 'next/navigation';  
import { getSavedProgramsByUserId } from '@/lib/db/queries';  
import { auth } from '@/app/(auth)/auth';  
import { cookies } from 'next/headers';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { generateUUID } from '@/lib/utils';
import { ClientProgramList } from '@/components/client-program-list';
  
export default async function ProgramsPage() {  
  const session = await auth();  
    
  if (!session || !session.user) {  
    redirect('/login');  
  }  

  const cookieStore = await cookies();
  const isCollapsed = cookieStore.get('sidebar:state')?.value !== 'true';
    
  // Generate a unique chatId for this session
  const chatId = generateUUID();
    
  const savedPrograms = await getSavedProgramsByUserId({  
    userId: session.user.id,  
  });  
    
  return (  
    <SidebarProvider defaultOpen={!isCollapsed}>
      <AppSidebar user={session?.user} />
      <SidebarInset>
        <div className="py-8 px-8">  
          <h1 className="text-2xl font-bold mb-6">My Saved Programs</h1>  
            
          {savedPrograms.length === 0 ? (  
            <div className="text-center py-12 text-muted-foreground">  
              <p>You haven't saved any programs yet.</p>  
            </div>  
          ) : (  
            <ClientProgramList 
              programs={savedPrograms} 
              chatId={chatId}
            />
          )}  
        </div>
      </SidebarInset>
    </SidebarProvider>
  );  
} 