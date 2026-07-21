export interface Usuario {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  status: "ativo" | "inativo";
  orgao: string;
  orgaoId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Orgao {
  id: string;
  cnpj: string;
  razao_social: string;
  nome_fantasia?: string;
  esfera: "federal" | "estadual" | "municipal";
  status: "ativo" | "inativo";
  createdAt: string;
  updatedAt: string;
}

export interface Permissao {
  id: string;
  nome: string;
  descricao: string;
  modulo: string;
}

export interface Role {
  id: string;
  nome: string;
  descricao: string;
  permissoes: Permissao[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
