import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApp, getApps, App } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApp();
  }

  return initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

const db = getFirestore(getAdminApp());
const adminAuth = getAdminAuth(getAdminApp());

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const authorization = req.headers.get('Authorization');

  if (!authorization?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const idToken = authorization.split('Bearer ')[1];

  let decodedToken;
  try {
    decodedToken = await adminAuth.verifyIdToken(idToken);
  } catch (error) {
    console.error('Error verifying token:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { uid } = decodedToken;

  try {
    const docRef = db.collection('posts').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const postData = docSnap.data();
    if (postData?.authorId !== uid) {
      return NextResponse.json(
        { error: 'Forbidden: You can only delete your own posts.' },
        { status: 403 }
      );
    }

    await docRef.delete();

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Failed to delete post.' }, { status: 500 });
  }
}
