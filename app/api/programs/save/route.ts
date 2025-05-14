import { NextRequest, NextResponse } from 'next/server';  
import { saveUserProgram } from '@/lib/db/queries';  
import { auth } from '@/app/(auth)/auth';  
  
export async function POST(req: NextRequest) {  
  const session = await auth();  
    
  if (!session || !session.user) {  
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });  
  }  
    
  try {  
    const { program } = await req.json();  
    const userId = session.user.id;  
      
    await saveUserProgram({ userId, program });  
      
    return NextResponse.json({ success: true });  
  } catch (error) {  
    console.error('Error saving program:', error);  
    return NextResponse.json(  
      { error: 'Failed to save program' },  
      { status: 500 }  
    );  
  }  
} 