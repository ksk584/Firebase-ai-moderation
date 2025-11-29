
import {NextRequest, NextResponse} from 'next/server';
import {initializeApp, getApp, getApps, App} from 'firebase-admin/app';
import {getAuth as getAdminAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';

// Note: This is a server-side only file.
// Do not use client-side firebase imports here.

function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApp();
  }
  // This will use the GOOGLE_APPLICATION_CREDENTIALS environment variable
  // for authentication, which is automatically set in App Hosting.
  // When running locally, you will need to set this variable yourself.
  return initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

const db = getFirestore(getAdminApp());
const adminAuth = getAdminAuth(getAdminApp());

export async function POST(req: NextRequest) {
  const authorization = req.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }
  const idToken = authorization.split('Bearer ')[1];

  let decodedToken;
  try {
    decodedToken = await adminAuth.verifyIdToken(idToken);
  } catch (error) {
    console.error('Error verifying token:', error);
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  const {uid, email} = decodedToken;
  const {content} = await req.json();

  if (!content || !content.trim()) {
    return NextResponse.json({error: 'Content cannot be empty.'}, {status: 400});
  }

  try {
    await db.collection('posts').add({
      content,
      createdAt: new Date(),
      authorId: uid,
      authorEmail: email,
    });

    // Revalidation is handled on the client-side after a successful post.
    return NextResponse.json({success: true});
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({error: 'Failed to create post.'}, {status: 500});
  }
}
