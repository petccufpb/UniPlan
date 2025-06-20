"use client";
import { StudentStoreProvider } from "@context/store";
import type { ReactNode } from "react";

export interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return <StudentStoreProvider>{children}</StudentStoreProvider>;
}
