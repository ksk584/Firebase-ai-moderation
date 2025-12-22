
import {NextRequest, NextResponse} from 'next/server';
import {initializeApp, getApp, getApps, App} from 'firebase-admin/app';
import {getAuth as getAdminAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import { moderatePost } from '@/ai/flows/moderate-post';

// Note: This is a server-side only file.
// Do not use client-side firebase imports here.

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
const adminAuth = getAdminAuth(getAdminApp());

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4.5mb',
    },
  },
}

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
  const {content, imageUrl, postId} = await req.json();

  if (!postId) {
    return NextResponse.json({error: 'Post ID is required.'}, {status: 400});
  }

  if (!content || !content.trim()) {
    return NextResponse.json({error: 'Content cannot be empty.'}, {status: 400});
  }

  try {
    const moderationResult = await moderatePost({ content });

    if (moderationResult.offensive) {
      // We are just rejecting it, but you could also store it for review.
      return NextResponse.json({error: `Comment rejected: ${moderationResult.reason}`}, {status: 400});
    }

    const docRef = await db.collection('posts').doc(postId).collection('comments').add({
      content,
      imageUrl: imageUrl || null,
      createdAt: new Date(),
      authorId: uid,
      authorEmail: email || 'Anonymous',
      postId,
    });

    return NextResponse.json({success: true, id: docRef.id});
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({error: 'Failed to create comment.'}, {status: 500});
  }
}
