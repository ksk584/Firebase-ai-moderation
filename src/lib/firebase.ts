import type { FirebaseOptions } from "firebase/app";
import { firebaseConfig as config } from "@/lib/config";

// This file bridges the configuration from /lib/config.ts
// to the rest of the application.
//
// Client-side app initialization is handled in `components/auth-provider.tsx`

export const firebaseConfig: FirebaseOptions = config;
