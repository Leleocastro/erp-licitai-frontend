import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.API_URL || "http://localhost:3333";

async function tryRefresh(
  refreshToken: string
): Promise<{ access_token: string } | null> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get("access_token")?.value;
    const refreshToken = request.cookies.get("refresh_token")?.value;

    if (!accessToken) {
      if (!refreshToken) {
        return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
      }

      const refreshed = await tryRefresh(refreshToken);
      if (!refreshed) {
        const resp = NextResponse.json(
          { message: "Sessão expirada" },
          { status: 401 }
        );
        resp.cookies.set("refresh_token", "", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 0,
        });
        return resp;
      }

      const meRes = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${refreshed.access_token}` },
      });

      if (!meRes.ok) {
        return NextResponse.json({ message: "Sessão expirada" }, { status: 401 });
      }

      const userData = await meRes.json();
      const response = NextResponse.json(userData);

      response.cookies.set("access_token", refreshed.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 15,
      });

      return response;
    }

    const meRes = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (meRes.status === 401 && refreshToken) {
      const refreshed = await tryRefresh(refreshToken);
      if (refreshed) {
        const meRes2 = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${refreshed.access_token}` },
        });

        if (meRes2.ok) {
          const userData = await meRes2.json();
          const response = NextResponse.json(userData);

          response.cookies.set("access_token", refreshed.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 15,
          });

          return response;
        }
      }

      const resp = NextResponse.json(
        { message: "Sessão expirada" },
        { status: 401 }
      );
      resp.cookies.set("refresh_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });
      resp.cookies.set("access_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });
      return resp;
    }

    if (!meRes.ok) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const userData = await meRes.json();
    return NextResponse.json(userData);
  } catch {
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
