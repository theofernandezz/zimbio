import { useState, useEffect } from "react";
import type { Group } from "@/lib/types";
import { getAllGroups } from "@/lib/user-groups";

/**
 * Returns all groups (localStorage + mock fallback) only after mount.
 * Starts as [] on both server and client to avoid hydration mismatch.
 */
export function useAllGroups(): Group[] {
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    setGroups(getAllGroups());
  }, []);

  return groups;
}
