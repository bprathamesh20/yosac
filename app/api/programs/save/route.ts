import { NextRequest, NextResponse } from 'next/server';  
import { saveUserProgram } from '@/lib/db/queries';  
import { auth } from '@/app/(auth)/auth';  
  
export async function POST(req: NextRequest) {  
  const session = await auth();  
    
  if (!session || !session.user) {  
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });  
  }  
    
  try {  
    const requestBody = await req.json(); // Get the whole body first
    const programDataFromClient = requestBody.program; // Extract the nested program object

    if (!programDataFromClient) {
      return NextResponse.json({ error: 'Program data is missing in request' }, { status: 400 });
    }

    // Now destructure from the actual program data
    const { matchScore, choiceType, ...programDetails } = programDataFromClient;  
    const userId = session.user.id;  
      
    await saveUserProgram({ 
      userId, 
      program: programDetails, 
      matchScore, 
      choiceType 
    });  
      
    return NextResponse.json({ success: true });  
  } catch (error) {  
    console.error('Error saving program:', error);  
    return NextResponse.json(  
      { error: 'Failed to save program' },  
      { status: 500 }  
    );  
  }  
} 