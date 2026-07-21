"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "E-mail é obrigatório")
    .email("E-mail inválido"),
  senha: z.string().min(1, "Senha é obrigatória"),
});

type LoginData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { signIn, isBlocked, attemptCount, blockTimeRemaining } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginData) {
    if (isBlocked) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await signIn(data.email, data.senha);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao autenticar"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          ERP Licitai
        </CardTitle>
        <CardDescription className="text-center">
          Entre com suas credenciais
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div
              data-cy="core-login-error-message"
              className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
              role="alert"
            >
              {error}
            </div>
          )}

          {isBlocked && (
            <div
              data-cy="core-login-blocked-message"
              className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
              role="alert"
            >
              Conta temporariamente bloqueada por excesso de tentativas.
              Tente novamente em {blockTimeRemaining} segundos.
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              data-cy="core-login-input-email"
              disabled={isBlocked}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="senha">Senha</Label>
            <Input
              id="senha"
              type="password"
              placeholder="Sua senha"
              data-cy="core-login-input-senha"
              disabled={isBlocked}
              {...register("senha")}
            />
            {errors.senha && (
              <p className="text-sm text-destructive">
                {errors.senha.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            data-cy="core-login-btn-submit"
            disabled={isSubmitting || isBlocked}
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
          </Button>

          {attemptCount > 0 && !isBlocked && (
            <p className="text-center text-xs text-muted-foreground">
              Tentativas restantes: {5 - attemptCount}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
