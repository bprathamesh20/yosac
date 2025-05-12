import { NextRequest, NextResponse } from 'next/server';  
import { deleteSavedProgram } from '@/lib/db/queries';  
import { auth } from '@/app/(auth)/auth';  
  
export async function DELETE(req: NextRequest) {  
  const session = await auth();  
    
  if (!session || !session.user) {  
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });  
  }  
    
  try {  
    const { searchParams } = new URL(req.url);  
    const id = searchParams.get('id');  
      
    if (!id) {  
      return NextResponse.json(  
        { error: 'Program ID is required' },  
        { status: 400 }  
      );  
    }  
      
    await deleteSavedProgram({ id, userId: session.user.id });  
      
    return NextResponse.json({ success: true });  
  } catch (error) {  
    console.error('Error deleting program:', error);  
    return NextResponse.json(  
      { error: 'Failed to delete program' },  
      { status: 500 }  
    );  
  }  
} 