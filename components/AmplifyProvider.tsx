"use client";

import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";

// Configure Amplify once at module load — runs before any auth/data calls
Amplify.configure(outputs);

export function AmplifyProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
