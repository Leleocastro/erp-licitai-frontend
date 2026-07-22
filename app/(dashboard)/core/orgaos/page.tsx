"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { api } from "@/lib/api";
import { Orgao, PaginatedResponse } from "@/lib/types";
import { orgaoSchema, OrgaoFormData } from "@/lib/validations";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";

const LIMIT = 10;

const esferaLabels: Record<string, string> = {
  federal: "Federal",
  estadual: "Estadual",
  municipal: "Municipal",
};

const esferaVariants: Record<string, "default" | "secondary" | "warning"> = {
  federal: "default",
  estadual: "secondary",
  municipal: "warning",
};

function formatCNPJ(cnpj: string): string {
  const digits = cnpj.replace(/\D/g, "");
  if (digits.length !== 14) return cnpj;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
}

export default function OrgaosPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    razao_social: "",
    esfera: "",
    status: "",
  });
  const [search, setSearch] = useState(filters);

  const [open, setOpen] = useState(false);
  const [editingOrgao, setEditingOrgao] = useState<Orgao | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingOrgao, setDeletingOrgao] = useState<Orgao | null>(null);

  const form = useForm<OrgaoFormData>({
    resolver: zodResolver(orgaoSchema),
    defaultValues: {
      cnpj: "",
      razao_social: "",
      nome_fantasia: "",
      esfera: "federal",
      status: "ativo",
    },
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["orgaos", page, search],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(LIMIT));
      if (search.razao_social) params.set("razao_social", search.razao_social);
      if (search.esfera) params.set("esfera", search.esfera);
      if (search.status) params.set("status", search.status);
      return api.get<PaginatedResponse<Orgao>>(`/core/orgaos?${params}`);
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: OrgaoFormData) =>
      api.post<Orgao>("/core/orgaos", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orgaos"] });
      toast({ title: "Órgão criado com sucesso" });
      handleClose();
    },
    onError: () => {
      toast({ title: "Erro ao criar órgão", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: OrgaoFormData }) =>
      api.put<Orgao>(`/core/orgaos/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orgaos"] });
      toast({ title: "Órgão atualizado com sucesso" });
      handleClose();
    },
    onError: () => {
      toast({ title: "Erro ao atualizar órgão", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/core/orgaos/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orgaos"] });
      toast({ title: "Órgão excluído com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao excluir órgão", variant: "destructive" });
    },
  });

  function handleOpenCreate() {
    setEditingOrgao(null);
    form.reset({
      cnpj: "",
      razao_social: "",
      nome_fantasia: "",
      esfera: "federal",
      status: "ativo",
    });
    setOpen(true);
  }

  function handleOpenEdit(orgao: Orgao) {
    setEditingOrgao(orgao);
    form.reset({
      cnpj: orgao.cnpj,
      razao_social: orgao.razao_social,
      nome_fantasia: orgao.nome_fantasia || "",
      esfera: orgao.esfera,
      status: orgao.status,
    });
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
    setEditingOrgao(null);
    form.reset();
  }

  function handleOpenDelete(orgao: Orgao) {
    setDeletingOrgao(orgao);
    setDeleteOpen(true);
  }

  function handleDeleteClose() {
    setDeleteOpen(false);
    setDeletingOrgao(null);
  }

  function handleConfirmDelete() {
    if (deletingOrgao) {
      deleteMutation.mutate(deletingOrgao.id);
      setDeleteOpen(false);
      setDeletingOrgao(null);
    }
  }

  function onSubmit(data: OrgaoFormData) {
    if (editingOrgao) {
      updateMutation.mutate({ id: editingOrgao.id, data });
    } else {
      createMutation.mutate(data);
    }
  }

  function handleSearch() {
    setPage(1);
    setFilters(search);
  }

  function handleClearFilters() {
    setSearch({ razao_social: "", esfera: "", status: "" });
    setFilters({ razao_social: "", esfera: "", status: "" });
    setPage(1);
  }

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 0;
  const isPending = createMutation.isPending || updateMutation.isPending;

  const hasActiveFilters =
    filters.razao_social || filters.esfera || filters.status;

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Órgãos</CardTitle>
          <CardDescription>Gerencie os órgãos do sistema</CardDescription>
        </div>
        <Button onClick={handleOpenCreate} data-cy="core-orgaos-btn-novo">
          <Plus className="mr-2 h-4 w-4" />
          Novo
        </Button>
      </CardHeader>
      <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="filter-razao-social">Razão Social</Label>
              <Input
                id="filter-razao-social"
                data-cy="core-orgaos-input-filtro-razao-social"
                placeholder="Buscar por razão social..."
                value={search.razao_social}
                onChange={(e) =>
                  setSearch((prev) => ({
                    ...prev,
                    razao_social: e.target.value,
                  }))
                }
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div className="w-full space-y-2 sm:w-48">
              <Label htmlFor="filter-esfera">Esfera</Label>
              <Select
                value={search.esfera}
                onValueChange={(value) =>
                  setSearch((prev) => ({ ...prev, esfera: value }))
                }
              >
                <SelectTrigger id="filter-esfera" data-cy="core-orgaos-select-filtro-esfera" aria-label="Filtrar por esfera">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  <SelectItem value="federal">Federal</SelectItem>
                  <SelectItem value="estadual">Estadual</SelectItem>
                  <SelectItem value="municipal">Municipal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full space-y-2 sm:w-48">
              <Label htmlFor="filter-status">Status</Label>
              <Select
                value={search.status}
                onValueChange={(value) =>
                  setSearch((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger id="filter-status" data-cy="core-orgaos-select-filtro-status" aria-label="Filtrar por status">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button data-cy="core-orgaos-btn-filtrar" onClick={handleSearch}>Filtrar</Button>
              {hasActiveFilters && (
                <Button variant="outline" data-cy="core-orgaos-btn-limpar" onClick={handleClearFilters}>
                  Limpar
                </Button>
              )}
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <Table data-cy="core-orgaos-table-lista">
              <TableHeader>
                <TableRow>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Razão Social</TableHead>
                  <TableHead>Esfera</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={`skeleton-${i}`}>
                      <TableCell>
                        <Skeleton className="h-4 w-36" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-48" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-20" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <p className="text-sm text-muted-foreground">
                          Erro ao carregar órgãos
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => refetch()}
                        >
                          Tentar novamente
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : data && data.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <p className="text-sm text-muted-foreground">
                          {hasActiveFilters
                            ? "Nenhum órgão encontrado com os filtros aplicados"
                            : "Nenhum órgão cadastrado"}
                        </p>
                        {hasActiveFilters && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClearFilters}
                          >
                            Limpar filtros
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.data.map((orgao) => (
                    <TableRow key={orgao.id}>
                      <TableCell className="font-mono text-sm">
                        {formatCNPJ(orgao.cnpj)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {orgao.razao_social}
                      </TableCell>
                      <TableCell>
                        <Badge variant={esferaVariants[orgao.esfera]}>
                          {esferaLabels[orgao.esfera]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            orgao.status === "ativo" ? "success" : "destructive"
                          }
                        >
                          {orgao.status === "ativo" ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(orgao)}
                            data-cy="core-orgaos-btn-editar"
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDelete(orgao)}
                            data-cy="core-orgaos-btn-excluir"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">Excluir</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {page} de {totalPages} ({data?.total} registros)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              data-cy="core-orgaos-btn-anterior"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 ||
                  p === totalPages ||
                  Math.abs(p - page) <= 1,
              )
              .map((p, idx, arr) => (
                <span key={p} className="flex items-center gap-1">
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span className="px-1 text-muted-foreground">...</span>
                  )}
                  <Button
                    variant={p === page ? "default" : "outline"}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                </span>
              ))}
            <Button
              variant="outline"
              size="sm"
              data-cy="core-orgaos-btn-proxima"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent data-cy="core-orgaos-modal-form">
          <DialogHeader>
            <DialogTitle>
              {editingOrgao ? "Editar Órgão" : "Novo Órgão"}
            </DialogTitle>
            <DialogDescription>
              {editingOrgao
                ? "Altere os dados do órgão"
                : "Preencha os dados para cadastrar um novo órgão"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Controller
                  name="cnpj"
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      id="cnpj"
                      placeholder="00.000.000/0000-00"
                      data-cy="core-orgaos-input-cnpj"
                      {...field}
                    />
                  )}
                />
                {form.formState.errors.cnpj && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.cnpj.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="razao_social">Razão Social</Label>
                <Controller
                  name="razao_social"
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      id="razao_social"
                      placeholder="Razão social do órgão"
                      data-cy="core-orgaos-input-razao-social"
                      {...field}
                    />
                  )}
                />
                {form.formState.errors.razao_social && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.razao_social.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
                <Controller
                  name="nome_fantasia"
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      id="nome_fantasia"
                      placeholder="Nome fantasia (opcional)"
                      {...field}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="esfera">Esfera</Label>
                <Controller
                  name="esfera"
                  control={form.control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger
                        id="esfera"
                        data-cy="core-orgaos-select-esfera"
                        aria-label="Esfera"
                      >
                        <SelectValue placeholder="Selecione a esfera" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="federal">Federal</SelectItem>
                        <SelectItem value="estadual">Estadual</SelectItem>
                        <SelectItem value="municipal">Municipal</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.esfera && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.esfera.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Controller
                  name="status"
                  control={form.control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger id="status" data-cy="core-orgaos-select-status" aria-label="Status">
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="inativo">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.status && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.status.message}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                data-cy="core-orgaos-btn-cancelar"
                onClick={handleClose}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                data-cy="core-orgaos-btn-salvar"
                disabled={isPending}
              >
                {isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={(open) => !open && handleDeleteClose()}>
        <DialogContent data-cy="core-orgaos-modal-delete">
          <DialogHeader>
            <DialogTitle>Excluir Órgão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o órgão{" "}
              <strong>{deletingOrgao?.razao_social}</strong>? Esta ação não pode ser
              desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" data-cy="core-orgaos-btn-cancelar-delete" onClick={handleDeleteClose}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              data-cy="core-orgaos-btn-confirmar-delete"
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
