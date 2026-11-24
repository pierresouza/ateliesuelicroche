"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  LogOut,
  MapPin,
  Search,
  ShoppingBag,
  CheckCircle2,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrderTimelineCard } from "@/components/orders/OrderTimelineCard";
import {
  lookupOrderTrackingAction,
  updateCustomerProfileAction,
  type TrackedOrderData,
} from "@/app/actions/tracking";
import { FadeIn } from "@/components/motion/MotionPrimitives";

export const LOCAL_RECENT_ORDERS_KEY = "asc_my_orders_v1";

interface CustomerProfileInfo {
  fullName: string;
  email: string;
  phone: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

export function CustomerAccountClient({
  initialOrders,
  profile,
}: {
  initialOrders: TrackedOrderData[];
  profile: CustomerProfileInfo;
}) {
  const router = useRouter();
  const [orders, setOrders] = useState<TrackedOrderData[]>(initialOrders);

  // Busca manual de pedido para vincular/visualizar
  const [searchCode, setSearchCode] = useState("");
  const [searchContact, setSearchContact] = useState(profile.phone || profile.email);
  const [searchMsg, setSearchMsg] = useState<string | null>(null);

  // Dados cadastrais de entrega
  const [fullName, setFullName] = useState(profile.fullName);
  const [phone, setPhone] = useState(profile.phone);
  const [cep, setCep] = useState(profile.cep);
  const [street, setStreet] = useState(profile.street);
  const [number, setNumber] = useState(profile.number);
  const [complement, setComplement] = useState(profile.complement);
  const [neighborhood, setNeighborhood] = useState(profile.neighborhood);
  const [city, setCity] = useState(profile.city);
  const [stateUf, setStateUf] = useState(profile.state);
  const [profileFeedback, setProfileFeedback] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  // Mescla eventuais pedidos recentes salvos no navegador
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(LOCAL_RECENT_ORDERS_KEY);
      if (!raw) return;
      const localOrders = JSON.parse(raw) as TrackedOrderData[];
      setOrders((prev) => {
        const existingCodes = new Set(prev.map((o) => o.order_code));
        const extras = localOrders.filter((lo) => !existingCodes.has(lo.order_code));
        return [...extras, ...prev];
      });
    } catch {
      // Ignore storage errors
    }
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const handleLookupOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchMsg(null);
    startTransition(async () => {
      const res = await lookupOrderTrackingAction(searchCode, searchContact);
      if (!res.found || !res.data) {
        setSearchMsg(res.message || "Pedido não encontrado.");
      } else {
        setOrders((prev) => {
          const filtered = prev.filter((o) => o.order_code !== res.data!.order_code);
          return [res.data!, ...filtered];
        });
        setSearchCode("");
        setSearchMsg(`Pedido #${res.data.order_code} localizado e exibido na aba Meus Pedidos!`);
      }
    });
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateCustomerProfileAction({
        fullName,
        phone,
        cep,
        street,
        number,
        complement,
        neighborhood,
        city,
        state: stateUf,
      });
      setProfileFeedback(res.message);
    });
  };

  const firstName = fullName.split(" ")[0] || profile.email.split("@")[0] || "Cliente";

  return (
    <div className="container mx-auto py-10 max-w-5xl space-y-8">
      {/* Cabeçalho de Boas-Vindas */}
      <FadeIn className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl bg-gradient-subtle border border-border p-6 sm:p-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Minha Conta Artesanal
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mt-1">
            Olá, {firstName}! Acompanhe suas Entregas
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Conectada como <strong className="text-foreground">{profile.email}</strong>
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          className="rounded-full self-start sm:self-center"
        >
          <LogOut className="h-4 w-4 mr-1.5" />
          Sair da Conta
        </Button>
      </FadeIn>

      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList className="rounded-full p-1">
          <TabsTrigger value="orders" className="rounded-full text-xs sm:text-sm px-4">
            <Package className="h-4 w-4 mr-1.5" />
            Meus Pedidos & Rastreio ({orders.length})
          </TabsTrigger>
          <TabsTrigger value="find" className="rounded-full text-xs sm:text-sm px-4">
            <Search className="h-4 w-4 mr-1.5" />
            Localizar outro Pedido
          </TabsTrigger>
          <TabsTrigger value="address" className="rounded-full text-xs sm:text-sm px-4">
            <MapPin className="h-4 w-4 mr-1.5" />
            Meu Endereço Salvo
          </TabsTrigger>
        </TabsList>

        {/* Aba 1: Lista de Pedidos com Linha do Tempo */}
        <TabsContent value="orders" className="space-y-6">
          {orders.length === 0 ? (
            <Card className="rounded-3xl border-border p-10 text-center space-y-4">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto" />
              <h2 className="font-serif text-2xl font-bold">
                Você ainda não possui pedidos vinculados a este e-mail
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Já fez uma compra usando outro contato? Use a aba{" "}
                <strong>&ldquo;Localizar outro Pedido&rdquo;</strong> informando seu código{" "}
                <strong>#ASC-XXXX</strong>, ou conheça nossa vitrine!
              </p>
              <Button asChild className="bg-gradient-warm rounded-full px-7">
                <Link href="/colecao">Explorar Coleção da Sueli</Link>
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <OrderTimelineCard key={order.order_code} order={order} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Aba 2: Localizar Pedido por Código */}
        <TabsContent value="find">
          <Card className="rounded-3xl border-border max-w-xl">
            <CardContent className="p-6 sm:p-8 space-y-4">
              <h2 className="font-serif text-xl font-bold">
                Buscar Pedido pelo Código (#ASC-XXXX)
              </h2>
              <p className="text-xs text-muted-foreground">
                Comprou antes de criar sua conta? Informe o código do pedido e o WhatsApp usado na compra para visualizar a entrega aqui:
              </p>
              <form onSubmit={handleLookupOrder} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="f-code">Código do Pedido</Label>
                  <Input
                    id="f-code"
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value)}
                    placeholder="Ex: ASC-4821"
                    className="uppercase"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="f-contact">WhatsApp ou E-mail usado no pedido</Label>
                  <Input
                    id="f-contact"
                    value={searchContact}
                    onChange={(e) => setSearchContact(e.target.value)}
                    placeholder="(11) 99999-9999 ou seu e-mail"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-gradient-warm rounded-full px-6 font-semibold"
                >
                  {isPending ? "Buscando..." : "Localizar Minha Entrega"}
                </Button>
              </form>
              {searchMsg && (
                <p className="text-xs font-medium text-primary pt-1">{searchMsg}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba 3: Endereço Padrão para agilizar compras futuras */}
        <TabsContent value="address">
          <Card className="rounded-3xl border-border max-w-2xl">
            <CardContent className="p-6 sm:p-8">
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <h2 className="font-serif text-xl font-bold">
                  Dados e Endereço Padrão de Entrega
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="p-name">Nome Completo</Label>
                    <Input
                      id="p-name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="p-phone">WhatsApp</Label>
                    <Input
                      id="p-phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="p-cep">CEP</Label>
                    <Input
                      id="p-cep"
                      value={cep}
                      onChange={(e) => setCep(e.target.value)}
                      onBlur={async () => {
                        const d = cep.replace(/\D/g, "");
                        if (d.length === 8) {
                          try {
                            const r = await fetch(`https://viacep.com.br/ws/${d}/json/`);
                            const data = await r.json();
                            if (!data.erro) {
                              setStreet(data.logradouro || "");
                              setNeighborhood(data.bairro || "");
                              setCity(data.localidade || "");
                              setStateUf(data.uf || "");
                            }
                          } catch {
                            // Ignore
                          }
                        }
                      }}
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label htmlFor="p-street">Rua / Avenida</Label>
                    <Input
                      id="p-street"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="p-num">Número</Label>
                    <Input
                      id="p-num"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label htmlFor="p-comp">Complemento</Label>
                    <Input
                      id="p-comp"
                      value={complement}
                      onChange={(e) => setComplement(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="p-neigh">Bairro</Label>
                    <Input
                      id="p-neigh"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="p-city">Cidade</Label>
                    <Input
                      id="p-city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="p-uf">UF</Label>
                    <Input
                      id="p-uf"
                      maxLength={2}
                      value={stateUf}
                      onChange={(e) => setStateUf(e.target.value)}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-gradient-warm rounded-full px-6 font-semibold"
                >
                  {isPending ? "Salvando..." : "Salvar Endereço"}
                </Button>

                {profileFeedback && (
                  <p className="text-xs font-semibold text-pix flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    {profileFeedback}
                  </p>
                )}
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
