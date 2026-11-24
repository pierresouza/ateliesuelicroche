"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowLeft } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError("Credenciais inválidas ou usuário ainda não cadastrado no Supabase Auth.");
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch {
      setError("Erro ao conectar ao Supabase Auth.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-md rounded-3xl border-border shadow-warm">
        <CardContent className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-gradient-warm text-primary-foreground flex items-center justify-center mx-auto">
              <Lock className="h-5 w-5" />
            </div>
            <h1 className="font-serif text-2xl font-bold">Painel Ateliê Sueli Crochê</h1>
            <p className="text-xs text-muted-foreground">
              Acesso exclusivo autenticado via Supabase Auth
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="adm-email">E-mail da Sueli</Label>
              <Input
                id="adm-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contato@ateliesuelicroche.com.br"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="adm-pass">Senha</Label>
              <Input
                id="adm-pass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-warm rounded-full font-bold"
            >
              {loading ? "Entrando..." : "Entrar no Painel"}
            </Button>
          </form>

          <div className="text-center">
            <Link href="/" className="inline-flex items-center text-xs text-muted-foreground hover:text-primary">
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              Voltar para a Loja
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
