"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  UserCheck,
  Mail,
  Sparkles,
  PackageSearch,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EASE_ARTISAN, FadeIn } from "@/components/motion/MotionPrimitives";
import { trackCustomerAuth } from "@/lib/analytics";
import { SITE_CONFIG } from "@/lib/constants";

function CustomerAuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/conta";

  // Estados Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Estados Cadastro
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  // Estados Magic Link
  const [magicEmail, setMagicEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "ok" | "error"; text: string } | null>(
    null
  );

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword,
      });

      if (error) {
        setFeedback({
          type: "error",
          text: "E-mail ou senha incorretos. Se for seu primeiro acesso, clique na aba 'Criar Conta'!",
        });
      } else {
        trackCustomerAuth("login", "password");
        router.push(nextPath);
        router.refresh();
      }
    } catch {
      setFeedback({ type: "error", text: "Não foi possível conectar agora." });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword.length < 6) {
      setFeedback({ type: "error", text: "Escolha uma senha com pelo menos 6 caracteres." });
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: regEmail.trim(),
        password: regPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
            nextPath
          )}`,
          data: {
            full_name: regName.trim(),
            phone: regPhone.trim(),
          },
        },
      });

      if (error) {
        setFeedback({ type: "error", text: error.message });
      } else if (data.session) {
        trackCustomerAuth("sign_up", "password");
        router.push(nextPath);
        router.refresh();
      } else {
        trackCustomerAuth("sign_up", "email_confirmation");
        setFeedback({
          type: "ok",
          text: "Conta criada com carinho! Enviamos um link de confirmação para o seu e-mail para ativar seu acesso.",
        });
      }
    } catch {
      setFeedback({ type: "error", text: "Erro ao criar sua conta." });
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: magicEmail.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
            nextPath
          )}`,
        },
      });

      if (error) {
        setFeedback({ type: "error", text: error.message });
      } else {
        trackCustomerAuth("magic_link", "otp_email");
        setFeedback({
          type: "ok",
          text: "Prontinho! Enviamos um link mágico para seu e-mail. Basta clicar nele para entrar direto nos seus pedidos!",
        });
      }
    } catch {
      setFeedback({ type: "error", text: "Não foi possível enviar o link agora." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-12 max-w-lg">
      <FadeIn className="text-center space-y-2 mb-8">
        <div className="w-12 h-12 rounded-full bg-gradient-warm text-primary-foreground flex items-center justify-center mx-auto shadow-warm">
          <UserCheck className="h-6 w-6" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-foreground">
          Área da Cliente — Acompanhe sua Entrega
        </h1>
        <p className="text-sm text-muted-foreground">
          Entre com o mesmo e-mail usado na compra para acompanhar cada etapa da produção artesanal e o código de rastreio do{" "}
          <strong className="text-foreground">{SITE_CONFIG.name}</strong>.
        </p>
      </FadeIn>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE_ARTISAN }}
      >
        <Card className="rounded-3xl border-border shadow-soft">
          <CardContent className="p-6 sm:p-8 space-y-6">
            <Tabs defaultValue="login" onValueChange={() => setFeedback(null)}>
              <TabsList className="grid grid-cols-3 w-full rounded-full">
                <TabsTrigger value="login" className="rounded-full text-xs">
                  Entrar
                </TabsTrigger>
                <TabsTrigger value="signup" className="rounded-full text-xs">
                  Criar Conta
                </TabsTrigger>
                <TabsTrigger value="magic" className="rounded-full text-xs">
                  Sem Senha
                </TabsTrigger>
              </TabsList>

              {/* Aba 1: Login tradicional */}
              <TabsContent value="login" className="pt-4">
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="l-email">Seu E-mail</Label>
                    <Input
                      id="l-email"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="seuemail@exemplo.com"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="l-pass">Sua Senha</Label>
                    <Input
                      id="l-pass"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-warm text-primary-foreground rounded-full font-bold h-11"
                  >
                    {loading ? "Entrando..." : "Entrar e Ver Meus Pedidos"}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </form>
              </TabsContent>

              {/* Aba 2: Criar Conta */}
              <TabsContent value="signup" className="pt-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="r-name">Nome Completo *</Label>
                      <Input
                        id="r-name"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Ex: Juliana Silva"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="r-phone">WhatsApp *</Label>
                      <Input
                        id="r-phone"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="(11) 99999-9999"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="r-email">Seu E-mail *</Label>
                    <Input
                      id="r-email"
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="Usado nas suas compras para vincular pedidos"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="r-pass">Crie uma Senha (mín. 6 dígitos) *</Label>
                    <Input
                      id="r-pass"
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      minLength={6}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-warm text-primary-foreground rounded-full font-bold h-11"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {loading ? "Criando conta..." : "Criar Minha Conta Grátis"}
                  </Button>
                </form>
              </TabsContent>

              {/* Aba 3: Magic Link no E-mail */}
              <TabsContent value="magic" className="pt-4">
                <form onSubmit={handleMagicLink} className="space-y-4">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Esqueceu a senha ou prefere praticidade? Enviamos um link direto de acesso para o seu e-mail:
                  </p>
                  <div className="space-y-1.5">
                    <Label htmlFor="m-email">Seu E-mail</Label>
                    <Input
                      id="m-email"
                      type="email"
                      value={magicEmail}
                      onChange={(e) => setMagicEmail(e.target.value)}
                      placeholder="seuemail@exemplo.com"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-warm text-primary-foreground rounded-full font-bold h-11"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    {loading ? "Enviando..." : "Receber Link de Acesso no E-mail"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {feedback && (
              <div
                className={`p-3.5 rounded-2xl text-xs font-medium flex items-start gap-2 ${
                  feedback.type === "ok"
                    ? "bg-pix/10 text-pix border border-pix/30"
                    : "bg-destructive/10 text-destructive border border-destructive/30"
                }`}
              >
                {feedback.type === "ok" && <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />}
                <span>{feedback.text}</span>
              </div>
            )}

            {/* Atalho Consulta Rápida por Código */}
            <div className="pt-4 border-t border-border text-center space-y-2">
              <p className="text-xs text-muted-foreground">
                Quer apenas consultar um pedido pelo código <strong>#ASC-XXXX</strong>?
              </p>
              <Button asChild variant="outline" size="sm" className="rounded-full text-xs">
                <Link href="/rastrear">
                  <PackageSearch className="h-3.5 w-3.5 mr-1.5 text-primary" />
                  Rastrear Pedido sem Senha
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function CustomerLoginPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-muted-foreground">Carregando...</div>}>
      <CustomerAuthContent />
    </Suspense>
  );
}
