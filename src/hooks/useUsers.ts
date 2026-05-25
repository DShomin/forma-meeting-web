"use client";

import { useEffect, useState } from "react";

export interface UseUsersReturn {
  users: string[];
  isLoading: boolean;
  error: string | null;
}

export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchUsers() {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/users");

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(
            body.error ?? `사용자 목록 요청 실패 (${res.status})`,
          );
        }

        const data: string[] = await res.json();

        if (!cancelled) {
          setUsers(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "사용자 목록을 불러오는 중 오류가 발생했습니다",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchUsers();

    return () => {
      cancelled = true;
    };
  }, []);

  return { users, isLoading, error };
}
