"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Building2,
  Shield,
  ClipboardCheck,
  Lock,
} from "lucide-react";

const modules = [
  {
    name: "Core",
    active: true,
    links: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        dataCy: "sidebar-link-dashboard",
      },
      {
        label: "Usuários",
        href: "/core/usuarios",
        icon: Users,
        dataCy: "sidebar-link-usuarios",
        disabled: false,
      },
      {
        label: "Órgãos",
        href: "/core/orgaos",
        icon: Building2,
        dataCy: "sidebar-link-orgaos",
        disabled: false,
      },
      {
        label: "Roles",
        href: "/core/roles",
        icon: Shield,
        dataCy: "sidebar-link-roles",
        disabled: false,
      },
      {
        label: "Auditoria",
        href: "/core/auditoria",
        icon: ClipboardCheck,
        dataCy: "sidebar-link-auditoria",
        disabled: false,
      },
    ],
  },
  {
    name: "Gestão",
    active: false,
    links: [
      {
        label: "Portal Transparência",
        href: "#",
        icon: Lock,
        dataCy: "sidebar-link-gestao",
        disabled: true,
      },
    ],
  },
  {
    name: "Contábil",
    active: false,
    links: [
      {
        label: "Contábil",
        href: "#",
        icon: Lock,
        dataCy: "sidebar-link-contabil",
        disabled: true,
      },
    ],
  },
  {
    name: "Compras",
    active: false,
    links: [
      {
        label: "Compras",
        href: "#",
        icon: Lock,
        dataCy: "sidebar-link-compras",
        disabled: true,
      },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex h-14 items-center border-b px-6 font-semibold">
        ERP Licitai
      </div>
      <nav className="flex-1 space-y-4 p-4">
        {modules.map((mod) => (
          <div key={mod.name}>
            <div className="mb-2 flex items-center gap-2">
              <span
                className={cn(
                  "text-xs font-semibold uppercase tracking-wider",
                  mod.active
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {mod.name}
              </span>
              {!mod.active && (
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  EM BREVE
                </span>
              )}
            </div>
            <ul className="space-y-1">
              {mod.links.map((link) => (
                <li key={link.label}>
                  {link.disabled ? (
                    <span
                      data-cy={link.dataCy}
                      className="flex cursor-not-allowed items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground opacity-50"
                    >
                      <link.icon className="h-4 w-4" />
                      {link.label}
                      <Lock className="ml-auto h-3 w-3" />
                    </span>
                  ) : (
                    <Link
                      href={link.href}
                      data-cy={link.dataCy}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        pathname === link.href
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
