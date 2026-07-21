"use client";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-6">
      <div>
        {user && (
          <span
            data-cy="header-user-name"
            className="text-sm font-medium"
          >
            {user.nome}
          </span>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        data-cy="header-btn-logout"
        onClick={signOut}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Sair
      </Button>
    </header>
  );
}
