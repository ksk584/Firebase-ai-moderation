
import {NextRequest, NextResponse} from 'next/server';
import {initializeApp, getApp, getApps, App, ServiceAccount, cert} from 'firebase-admin/app';
import {getAuth as getAdminAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';

// Note: This is a server-side only file.
// Do not use client-side firebase imports here.

function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApp();
  }
  
  // This will use the service account credentials from the environment variables
  // which are automatically set in App Hosting.
  // When running locally, you will need to set GOOGLE_APPLICATION_CREDENTIALS
  // to point to your service account key file.
  const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS ? 
    JSON.parse(Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'base64').toString('utf-8')) :
    undefined;

  if (serviceAccount) {
    return initializeApp({
      credential: cert(serviceAccount),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }

  // Fallback for environments where GOOGLE_APPLICATION_CREDENTIALS is not set as base64
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
    const docRef = await db.collection('posts').add({
      content,
      createdAt: new Date(),
      authorId: uid,
      authorEmail: email || 'Anonymous',
    });

    // Revalidation is handled on the client-side after a successful post.
    return NextResponse.json({success: true, id: docRef.id});
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({error: 'Failed to create post.'}, {status: 500});
  }
}
