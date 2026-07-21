"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
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
  email: z.string().email("E-mail invalido"),
  password: z.string().min(6, "Senha deve ter no minimo 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [globalError, setGlobalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginFormData) =>
      api.post<{ token: string }>("/auth/login", data),
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      router.push("/core/usuarios");
    },
    onError: () => {
      setGlobalError("Credenciais invalidas. Tente novamente.");
    },
  });

  const onSubmit = (data: LoginFormData) => {
    setGlobalError(null);
    loginMutation.mutate(data);
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-background p-4"
      data-cy="auth-login-page"
    >
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight" data-cy="auth-login-title">
            ERP Licitai
          </h1>
          <p className="text-muted-foreground text-sm">
            Sistema de gestao governamental
          </p>
        </div>

        <Card data-cy="auth-login-card">
          <CardHeader>
            <CardTitle data-cy="auth-login-card-title">Entrar</CardTitle>
            <CardDescription data-cy="auth-login-card-description">
              Entre com suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" data-cy="auth-login-label-email">
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  data-cy="auth-login-input-email"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-destructive" data-cy="auth-login-error-email">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" data-cy="auth-login-label-password">
                  Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••"
                  data-cy="auth-login-input-password"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-sm text-destructive" data-cy="auth-login-error-password">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {globalError && (
                <p className="text-sm text-destructive" data-cy="auth-login-error-global">
                  {globalError}
                </p>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
                data-cy="auth-login-btn-submit"
              >
                {loginMutation.isPending ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
