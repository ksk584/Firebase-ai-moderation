import {NextRequest, NextResponse} from 'next/server';
import {initializeApp, getApp, getApps, App} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';


function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApp();
  }
  
  // When running on App Hosting or with GOOGLE_APPLICATION_CREDENTIALS set,
  // the SDK will automatically find the credentials.
  return initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

const db = getFirestore(getAdminApp());

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
  }

  try {
    const docRef = db.collection('posts').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const postData = docSnap.data();
    // The Timestamp object from Firestore isn't directly serializable to JSON for the client.
    // We need to convert it.
    const post = { 
      id: docSnap.id, 
      ...postData,
      createdAt: postData?.createdAt.toDate().toISOString(),
    };
    
    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json({ error: 'Failed to fetch post.' }, { status: 500 });
  }
}
