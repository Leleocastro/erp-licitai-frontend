import { z } from "zod";

export const usuarioSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no minimo 3 caracteres"),
  email: z.string().email("Email invalido"),
  cpf: z
    .string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/, "CPF invalido"),
  status: z.enum(["ativo", "inativo"]),
  orgaoId: z.string().min(1, "Selecione um orgao"),
});

export type UsuarioFormData = z.infer<typeof usuarioSchema>;

export const orgaoSchema = z.object({
  cnpj: z
    .string()
    .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{14}$/, "CNPJ invalido"),
  razao_social: z
    .string()
    .min(3, "Razao social deve ter no minimo 3 caracteres"),
  nome_fantasia: z.string().optional(),
  esfera: z.enum(["federal", "estadual", "municipal"]),
  status: z.enum(["ativo", "inativo"]),
});

export type OrgaoFormData = z.infer<typeof orgaoSchema>;

export const roleSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no minimo 3 caracteres"),
  descricao: z.string().min(3, "Descricao deve ter no minimo 3 caracteres"),
  permissoesIds: z.array(z.string()).min(1, "Selecione ao menos uma permissao"),
});

export type RoleFormData = z.infer<typeof roleSchema>;
