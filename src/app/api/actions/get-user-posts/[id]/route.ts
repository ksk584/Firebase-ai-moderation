
import {NextRequest, NextResponse} from 'next/server';
import {initializeApp, getApp, getApps, App, cert} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';

function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApp();
  }

  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);
  
  return initializeApp({
    credential: cert(serviceAccount),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

const db = getFirestore(getAdminApp());

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id: userId } = params;

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const postsQuery = db.collection('posts').where('authorId', '==', userId).orderBy('createdAt', 'desc');
    const querySnapshot = await postsQuery.get();

    const posts = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate().toISOString(),
      };
    });
    
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching user posts:', error);
    return NextResponse.json({ error: 'Failed to fetch user posts.' }, { status: 500 });
  }
}
