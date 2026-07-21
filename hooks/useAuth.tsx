"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  nome: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isBlocked: boolean;
  attemptCount: number;
  blockTimeRemaining: number;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MAX_ATTEMPTS = 5;
const BLOCK_DURATION = 60;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isBlocked: false,
    attemptCount: 0,
    blockTimeRemaining: 0,
  });
  const blockTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Unauthorized");
      })
      .then((user) => setState((prev) => ({ ...prev, user, isLoading: false })))
      .catch(() => setState((prev) => ({ ...prev, isLoading: false })));
  }, []);

  useEffect(() => {
    if (state.isBlocked && state.blockTimeRemaining > 0) {
      blockTimerRef.current = setInterval(() => {
        setState((prev) => {
          const next = prev.blockTimeRemaining - 1;
          if (next <= 0) {
            if (blockTimerRef.current) clearInterval(blockTimerRef.current);
            return { ...prev, isBlocked: false, attemptCount: 0, blockTimeRemaining: 0 };
          }
          return { ...prev, blockTimeRemaining: next };
        });
      }, 1000);
    }
    return () => {
      if (blockTimerRef.current) clearInterval(blockTimerRef.current);
    };
  }, [state.isBlocked, state.blockTimeRemaining]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (state.isBlocked) return;

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha: password }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Erro ao autenticar" }));

        setState((prev) => {
          const newCount = prev.attemptCount + 1;
          if (newCount >= MAX_ATTEMPTS) {
            return {
              ...prev,
              attemptCount: newCount,
              isBlocked: true,
              blockTimeRemaining: BLOCK_DURATION,
            };
          }
          return { ...prev, attemptCount: newCount };
        });

        throw new Error(error.message);
      }

      const data = await res.json();
      setState((prev) => ({
        ...prev,
        user: data.user,
        attemptCount: 0,
        isBlocked: false,
        blockTimeRemaining: 0,
      }));
      router.push("/dashboard");
    },
    [state.isBlocked, router]
  );

  const signOut = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setState({ user: null, isLoading: false, isBlocked: false, attemptCount: 0, blockTimeRemaining: 0 });
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ ...state, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
