
import {NextRequest, NextResponse} from_ 'next/server';
import {initializeApp, getApp, getApps, App, cert} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';


function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApp();
  }
  
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    throw new Error('Firebase service account key is not set.');
  }

  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);

  return initializeApp({
    credential: cert(serviceAccount),
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
  }

  try {
    const db = getFirestore(getAdminApp());
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
      imageUrl: postData?.imageUrl || null,
      createdAt: postData?.createdAt.toDate().toISOString(),
    };
    
    return NextResponse.json(post);
  } catch (error: any) {
    console.error('Error fetching post:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch post.' }, { status: 500 });
  }
}
