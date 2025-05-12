import { redirect } from 'next/navigation';  
import { getSavedProgramsByUserId } from '@/lib/db/queries';  
import { auth } from '@/app/(auth)/auth';  
import { cookies } from 'next/headers';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { ProgramCard } from '@/components/program-card';
  
export default async function ProgramsPage() {  
  const session = await auth();  
    
  if (!session || !session.user) {  
    redirect('/login');  
  }  

  const cookieStore = await cookies();
  const isCollapsed = cookieStore.get('sidebar:state')?.value !== 'true';
    
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">  
              {savedPrograms.map((program) => (  
                <ProgramCard key={program.id} program={program} />  
              ))}  
            </div>  
          )}  
        </div>
      </SidebarInset>
    </SidebarProvider>
  );  
} 