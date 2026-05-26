"use client";

import { useEffect, useState } from "react";
import type { User } from "@/lib/types";

/**
 * Reads the mock session from localStorage.
 * Returns the current user or null if not logged in.
 */
export function useCurrentUser(): User | null {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("zimbio_user");
      if (raw) setUser(JSON.parse(raw) as User);
    } catch {
      // corrupt storage — ignore
    }
  }, []);

  return user;
}
