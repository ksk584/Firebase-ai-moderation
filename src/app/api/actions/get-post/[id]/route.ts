import {NextRequest, NextResponse} from 'next/server';
import {initializeApp, getApp, getApps, App, ServiceAccount} from 'firebase-admin/app';
import {getAuth as getAdminAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';


function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApp();
  }

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (serviceAccount) {
    try {
      const serviceAccountJson = JSON.parse(
        Buffer.from(serviceAccount, 'base64').toString('utf-8')
      );
      return initializeApp({
        credential: {
          projectId: serviceAccountJson.project_id,
          clientEmail: serviceAccountJson.client_email,
          privateKey: serviceAccountJson.private_key,
        },
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    } catch (e: any) {
      console.error('Error parsing FIREBASE_SERVICE_ACCOUNT:', e.message);
    }
  }

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

    const post = { id: docSnap.id, ...docSnap.data() };
    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json({ error: 'Failed to fetch post.' }, { status: 500 });
  }
}
