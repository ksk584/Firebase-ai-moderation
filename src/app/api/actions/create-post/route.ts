
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
  const {content, imageUrl} = await req.json();

  if (!content || !content.trim()) {
    return NextResponse.json({error: 'Content cannot be empty.'}, {status: 400});
  }

  try {
    const moderationResult = await moderatePost({ content });

    if (moderationResult.offensive) {
      // Store the offensive post and reason in a separate collection
      await db.collection('flagged_posts').add({
        content,
        imageUrl: imageUrl || null,
        authorId: uid,
        authorEmail: email || 'Anonymous',
        flaggedAt: new Date(),
        reason: moderationResult.reason,
      });

      return NextResponse.json({error: `Post rejected: ${moderationResult.reason}`}, {status: 400});
    }

    const docRef = await db.collection('posts').add({
      content,
      imageUrl: imageUrl || null,
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
