"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, Trash2 } from "lucide-react";

import { api } from "@/lib/api";
import type { Usuario, Orgao, PaginatedResponse } from "@/lib/types";
import { usuarioSchema, type UsuarioFormData } from "@/lib/validations";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";

function formatCpf(cpf: string): string {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return cpf;
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

const ITEMS_PER_PAGE = 10;

export default function UsuariosPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [page, setPage] = useState(1);
  const [nomeFilter, setNomeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [orgaoFilter, setOrgaoFilter] = useState("");

  const [nomeInput, setNomeInput] = useState("");
  const [orgaoInput, setOrgaoInput] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<Usuario | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["usuarios", page, nomeFilter, statusFilter, orgaoFilter],
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(ITEMS_PER_PAGE),
        nome: nomeFilter,
        status: statusFilter,
        orgao: orgaoFilter,
      });
      return api.get<PaginatedResponse<Usuario>>(`/core/usuarios?${params}`);
    },
  });

  const { data: orgaosData } = useQuery({
    queryKey: ["orgaos-list"],
    queryFn: () => api.get<PaginatedResponse<Orgao>>("/core/orgaos?limit=100"),
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<UsuarioFormData>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: { nome: "", email: "", cpf: "", status: "ativo", orgaoId: "" },
  });

  const createMutation = useMutation({
    mutationFn: (formData: UsuarioFormData) =>
      api.post<Usuario>("/core/usuarios", formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      setFormOpen(false);
      setEditingUser(null);
      toast({ title: "Usuário criado com sucesso" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao criar usuário", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: UsuarioFormData }) =>
      api.put<Usuario>(`/core/usuarios/${id}`, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      setFormOpen(false);
      setEditingUser(null);
      toast({ title: "Usuário atualizado com sucesso" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao atualizar usuário", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/core/usuarios/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      setDeleteOpen(false);
      setDeletingUser(null);
      toast({ title: "Usuário excluído com sucesso" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao excluir usuário", description: error.message, variant: "destructive" });
    },
  });

  const totalPages = Math.ceil((data?.total ?? 0) / ITEMS_PER_PAGE);

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  function handleOpenCreate() {
    setEditingUser(null);
    reset({ nome: "", email: "", cpf: "", status: "ativo", orgaoId: "" });
    setFormOpen(true);
  }

  function handleOpenEdit(user: Usuario) {
    setEditingUser(user);
    reset({
      nome: user.nome,
      email: user.email,
      cpf: user.cpf,
      status: user.status,
      orgaoId: user.orgaoId,
    });
    setFormOpen(true);
  }

  function handleOpenDelete(user: Usuario) {
    setDeletingUser(user);
    setDeleteOpen(true);
  }

  function onSubmit(formData: UsuarioFormData) {
    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, formData });
    } else {
      createMutation.mutate(formData);
    }
  }

  function handleConfirmDelete() {
    if (deletingUser) {
      deleteMutation.mutate(deletingUser.id);
    }
  }

  function applyFilters() {
    setNomeFilter(nomeInput);
    setOrgaoFilter(orgaoInput);
    setPage(1);
  }

  function handleStatusFilterChange(value: string) {
    setStatusFilter(value === "all" ? "" : value);
    setPage(1);
  }

  function handleFormClose() {
    setFormOpen(false);
    setEditingUser(null);
  }

  function handleDeleteClose() {
    setDeleteOpen(false);
    setDeletingUser(null);
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Usuários</CardTitle>
          <CardDescription>Gerencie os usuários do sistema</CardDescription>
        </div>
        <Button data-cy="core-usuarios-btn-novo" onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Novo
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row">
          <Input
            placeholder="Nome"
            data-cy="core-usuarios-input-filtro-nome"
            value={nomeInput}
            onChange={(e) => setNomeInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            className="sm:max-w-[200px]"
          />
          <Select
            value={statusFilter || "all"}
            onValueChange={handleStatusFilterChange}
          >
            <SelectTrigger data-cy="core-usuarios-select-filtro-status" className="sm:max-w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="inativo">Inativo</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Órgão"
            data-cy="core-usuarios-input-filtro-orgao"
            value={orgaoInput}
            onChange={(e) => setOrgaoInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            className="sm:max-w-[200px]"
          />
          <Button variant="secondary" data-cy="core-usuarios-btn-filtrar" onClick={applyFilters}>
            Filtrar
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="mb-4 text-muted-foreground">Erro ao carregar usuários</p>
            <Button variant="outline" onClick={() => refetch()}>
              Tentar novamente
            </Button>
          </div>
        ) : data?.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground">Nenhum usuário encontrado</p>
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table data-cy="core-usuarios-table-lista">
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Órgão</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.nome}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{formatCpf(user.cpf)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.status === "ativo" ? "success" : "destructive"
                          }
                        >
                          {user.status === "ativo" ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.orgao}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            data-cy="core-usuarios-btn-editar"
                            onClick={() => handleOpenEdit(user)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            data-cy="core-usuarios-btn-excluir"
                            onClick={() => handleOpenDelete(user)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando {data?.data.length ?? 0} de {data?.total ?? 0}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  data-cy="core-usuarios-btn-anterior"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {page} de {totalPages || 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  data-cy="core-usuarios-btn-proximo"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Próximo
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>

      <Dialog open={formOpen} onOpenChange={(open) => !open && handleFormClose()}>
        <DialogContent data-cy="core-usuarios-modal-form">
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>
                {editingUser ? "Editar Usuário" : "Novo Usuário"}
              </DialogTitle>
              <DialogDescription>
                {editingUser
                  ? "Edite os dados do usuário"
                  : "Preencha os dados do novo usuário"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  data-cy="core-usuarios-input-nome"
                  {...register("nome")}
                />
                {errors.nome && (
                  <p className="text-sm text-destructive">
                    {errors.nome.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  data-cy="core-usuarios-input-email"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  data-cy="core-usuarios-input-cpf"
                  {...register("cpf")}
                />
                {errors.cpf && (
                  <p className="text-sm text-destructive">
                    {errors.cpf.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger data-cy="core-usuarios-select-status">
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="inativo">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.status && (
                  <p className="text-sm text-destructive">
                    {errors.status.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="orgaoId">Órgão</Label>
                <Controller
                  name="orgaoId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger data-cy="core-usuarios-select-orgao">
                        <SelectValue placeholder="Selecione o órgão" />
                      </SelectTrigger>
                      <SelectContent>
                        {orgaosData?.data.map((orgao) => (
                          <SelectItem key={orgao.id} value={orgao.id}>
                            {orgao.razao_social}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.orgaoId && (
                  <p className="text-sm text-destructive">
                    {errors.orgaoId.message}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                data-cy="core-usuarios-btn-cancelar-form"
                onClick={handleFormClose}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                data-cy="core-usuarios-btn-salvar"
                disabled={isSaving}
              >
                {isSaving ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => !open && handleDeleteClose()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Usuário</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o usuário{" "}
              <strong>{deletingUser?.nome}</strong>? Esta ação não pode ser
              desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" data-cy="core-usuarios-btn-cancelar-delete" onClick={handleDeleteClose}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
