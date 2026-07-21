"use client";

import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, Trash2, RotateCcw, Search, ChevronLeft, ChevronRight } from "lucide-react";

import { api } from "@/lib/api";
import type { Role, Permissao, PaginatedResponse } from "@/lib/types";
import { roleSchema, type RoleFormData } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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

const LIMIT = 10;

export default function RolesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [page, setPage] = useState(1);
  const [nome, setNome] = useState("");
  const [searchNome, setSearchNome] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);

  const {
    data: rolesData,
    isLoading: rolesLoading,
    isError: rolesError,
    refetch: refetchRoles,
  } = useQuery<PaginatedResponse<Role>>({
    queryKey: ["roles", page, searchNome],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(LIMIT));
      if (searchNome) params.set("nome", searchNome);
      return api.get(`/core/roles?${params.toString()}`);
    },
  });

  const { data: permissoes = [] } = useQuery<Permissao[]>({
    queryKey: ["permissoes"],
    queryFn: () => api.get("/core/permissoes"),
  });

  const form = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: { nome: "", descricao: "", permissoesIds: [] },
  });

  const resetForm = useCallback(() => {
    form.reset({ nome: "", descricao: "", permissoesIds: [] });
    setEditingRole(null);
  }, [form]);

  useEffect(() => {
    if (!dialogOpen) {
      resetForm();
    }
  }, [dialogOpen, resetForm]);

  const createMutation = useMutation({
    mutationFn: (data: RoleFormData) => api.post("/core/roles", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast({ title: "Role criada com sucesso" });
      setDialogOpen(false);
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao criar role", description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: RoleFormData }) =>
      api.put(`/core/roles/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast({ title: "Role atualizada com sucesso" });
      setDialogOpen(false);
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao atualizar role", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/core/roles/${id}`),
    onSuccess: (_data, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast({ title: "Role excluída com sucesso" });
      if (rolesData && rolesData.data.length === 1 && page > 1) {
        setPage((p) => p - 1);
      }
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao excluir role", description: err.message, variant: "destructive" });
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (role: Role) => {
    setEditingRole(role);
    form.reset({
      nome: role.nome,
      descricao: role.descricao,
      permissoesIds: role.permissoes.map((p) => p.id),
    });
    setDialogOpen(true);
  };

  const handleDelete = (role: Role) => {
    setDeletingRole(role);
    setDeleteOpen(true);
  };

  const handleDeleteClose = () => {
    setDeleteOpen(false);
    setDeletingRole(null);
  };

  const handleConfirmDelete = () => {
    if (deletingRole) {
      deleteMutation.mutate(deletingRole.id);
      setDeleteOpen(false);
      setDeletingRole(null);
    }
  };

  const onSubmit = (data: RoleFormData) => {
    if (editingRole) {
      updateMutation.mutate({ id: editingRole.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearchNome(nome);
  };

  const totalPages = rolesData ? Math.ceil(rolesData.total / LIMIT) : 0;

  const togglePermissao = (permissaoId: string) => {
    const current = form.getValues("permissoesIds");
    if (current.includes(permissaoId)) {
      form.setValue(
        "permissoesIds",
        current.filter((id) => id !== permissaoId),
        { shouldValidate: true }
      );
    } else {
      form.setValue("permissoesIds", [...current, permissaoId], { shouldValidate: true });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Roles</CardTitle>
          <CardDescription>Gerencie as roles e permissoes do sistema</CardDescription>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-cy="core-roles-btn-novo" onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Novo
            </Button>
          </DialogTrigger>
          <DialogContent data-cy="core-roles-modal-form" className="sm:max-w-lg">
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>{editingRole ? "Editar Role" : "Nova Role"}</DialogTitle>
                <DialogDescription>
                  {editingRole
                    ? "Altere os campos abaixo para atualizar a role."
                    : "Preencha os campos abaixo para criar uma nova role."}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    data-cy="core-roles-input-nome"
                    placeholder="Nome da role"
                    {...form.register("nome")}
                  />
                  {form.formState.errors.nome && (
                    <p className="text-sm text-destructive">{form.formState.errors.nome.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descricao</Label>
                  <Input
                    id="descricao"
                    data-cy="core-roles-input-descricao"
                    placeholder="Descricao da role"
                    {...form.register("descricao")}
                  />
                  {form.formState.errors.descricao && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.descricao.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Permissoes</Label>
                  <div className="max-h-60 space-y-2 overflow-y-auto rounded-md border p-3">
                    {permissoes.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Carregando permissoes...</p>
                    ) : (
                      permissoes.map((permissao) => (
                        <label
                          key={permissao.id}
                          className="flex cursor-pointer items-start gap-3 rounded-md p-2 hover:bg-muted"
                        >
                          <input
                            type="checkbox"
                            data-cy={`core-roles-checkbox-permissao-${permissao.id}`}
                            checked={form.watch("permissoesIds").includes(permissao.id)}
                            onChange={() => togglePermissao(permissao.id)}
                            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <div className="space-y-0.5">
                            <p className="text-sm font-medium leading-none">{permissao.nome}</p>
                            <p className="text-xs text-muted-foreground">{permissao.descricao}</p>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                  {form.formState.errors.permissoesIds && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.permissoesIds.message}
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" data-cy="core-roles-btn-cancelar" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" data-cy="core-roles-btn-salvar" disabled={isPending}>
                  {isPending ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
          <form onSubmit={handleSearch} className="mb-4 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome..."
                data-cy="core-roles-input-filtro-nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="secondary" data-cy="core-roles-btn-filtrar">
              Filtrar
            </Button>
          </form>

          {rolesLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : rolesError ? (
            <div className="flex flex-col items-center gap-3 py-12">
              <p className="text-sm text-muted-foreground">Erro ao carregar roles</p>
              <Button variant="outline" onClick={() => refetchRoles()}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Tentar novamente
              </Button>
            </div>
          ) : rolesData && rolesData.data.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground">
                {searchNome
                  ? "Nenhuma role encontrada para essa busca"
                  : "Nenhuma role cadastrada"}
              </p>
              {!searchNome && (
                <Button variant="link" onClick={openCreate} className="mt-2">
                  Criar primeira role
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table data-cy="core-roles-table-lista">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Nome</TableHead>
                      <TableHead className="min-w-[200px]">Descricao</TableHead>
                      <TableHead className="min-w-[250px]">Permissoes</TableHead>
                      <TableHead className="w-[120px] text-right">Acoes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rolesData?.data.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell className="font-medium">{role.nome}</TableCell>
                        <TableCell className="text-muted-foreground">{role.descricao}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {role.permissoes.length === 0 ? (
                              <span className="text-xs text-muted-foreground">Nenhuma</span>
                            ) : (
                              role.permissoes.map((p) => (
                                <Badge key={p.id} variant="secondary" className="whitespace-nowrap">
                                  {p.nome}
                                </Badge>
                              ))
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              data-cy="core-roles-btn-editar"
                              onClick={() => openEdit(role)}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              data-cy="core-roles-btn-excluir"
                              onClick={() => handleDelete(role)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                              <span className="sr-only">Excluir</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-muted-foreground">
                    Pagina {page} de {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      data-cy="core-roles-btn-anterior"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      data-cy="core-roles-btn-proxima"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      Proxima
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>

      <Dialog open={deleteOpen} onOpenChange={(open) => !open && handleDeleteClose()}>
        <DialogContent data-cy="core-roles-modal-delete">
          <DialogHeader>
            <DialogTitle>Excluir Role</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a role{" "}
              <strong>{deletingRole?.nome}</strong>? Esta ação não pode ser
              desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" data-cy="core-roles-btn-cancelar-delete" onClick={handleDeleteClose}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              data-cy="core-roles-btn-confirmar-delete"
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
