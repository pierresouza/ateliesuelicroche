"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Ruler, Palette, MessageCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { submitCustomOrderAction } from "@/app/actions/store";
import { trackCustomRugRequest } from "@/lib/analytics";
import {
  EASE_ARTISAN,
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/motion/MotionPrimitives";

export default function CustomOrderPage() {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [pieceType, setPieceType] = useState("Tapete de Sala Sob Medida");
  const [room, setRoom] = useState("Sala de Estar");
  const [desiredDimensions, setDesiredDimensions] = useState("");
  const [colorPalette, setColorPalette] = useState("");
  const [notes, setNotes] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      trackCustomRugRequest(pieceType, room);
      const res = await submitCustomOrderAction({
        customerName,
        customerPhone,
        customerEmail,
        pieceType,
        room,
        desiredDimensions,
        colorPalette,
        notes,
      });
      if (res.ok) {
        setWhatsappUrl(res.whatsappUrl);
      }
    });
  };

  return (
    <div className="container mx-auto py-12 max-w-4xl">
      <FadeIn className="text-center space-y-3 mb-10">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
          <Sparkles className="h-4 w-4" />
          Encomenda Exclusiva Ateliê Sueli Crochê
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-foreground">
          Seu Crochê nas Cores e Medidas dos Seus Sonhos
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Preencha os detalhes abaixo. Salvamos seu pedido no sistema da Sueli e já abrimos o atendimento direto com ela para confirmar fios, prazo e orçamento!
        </p>
      </FadeIn>

      <StaggerContainer className="grid md:grid-cols-3 gap-4 mb-10">
        <StaggerItem>
          <Card className="bg-card border-border h-full">
            <CardContent className="p-4 flex items-start gap-3">
              <Ruler className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h2 className="text-sm font-bold">Medida Exata</h2>
                <p className="text-xs text-muted-foreground">
                  Passadeiras de 2m, 3m ou tapetes amplos para salas grandes.
                </p>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card className="bg-card border-border h-full">
            <CardContent className="p-4 flex items-start gap-3">
              <Palette className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h2 className="text-sm font-bold">+30 Cores de Algodão</h2>
                <p className="text-xs text-muted-foreground">
                  A Sueli envia fotos das bobinas reais para você aprovar antes de tecer.
                </p>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card className="bg-card border-border h-full">
            <CardContent className="p-4 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-pix shrink-0 mt-0.5" />
              <div>
                <h2 className="text-sm font-bold">5% OFF no PIX ou 6x</h2>
                <p className="text-xs text-muted-foreground">
                  Mesmas vantagens de pagamento e frete grátis acima de R$ 150.
                </p>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerContainer>

      <AnimatePresence mode="wait">
        {whatsappUrl ? (
          <motion.div
            key="custom-confirm"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE_ARTISAN }}
          >
            <Card className="rounded-3xl border-pix/40 bg-pix/5 p-8 text-center space-y-4">
              <CheckCircle2 className="h-12 w-12 text-pix mx-auto" />
              <h2 className="font-serif text-2xl font-bold">
                Solicitação Registrada com Sucesso!
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Os detalhes da sua peça personalizada já foram gravados para a Sueli. Clique abaixo para enviar no WhatsApp dela e receber o orçamento rapidinho:
              </p>
              <Button
                asChild
                size="lg"
                className="bg-[#25D366] hover:bg-[#1ebe5d] text-white rounded-full px-8 font-bold"
              >
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Abrir Conversa com a Sueli Agora
                </a>
              </Button>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="custom-form"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE_ARTISAN }}
          >
            <Card className="rounded-3xl border-border shadow-soft">
              <CardContent className="p-6 sm:p-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="c-name">Seu Nome *</Label>
                      <Input
                        id="c-name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Ex: Ana Paula"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="c-phone">Seu WhatsApp com DDD *</Label>
                      <Input
                        id="c-phone"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="(11) 99999-9999"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="c-type">Qual peça você deseja? *</Label>
                      <select
                        id="c-type"
                        value={pieceType}
                        onChange={(e) => setPieceType(e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option>Tapete Redondo Sob Medida</option>
                        <option>Tapete Retangular Sob Medida</option>
                        <option>Tapete Oval Sob Medida</option>
                        <option>Jogo de Passadeira Cozinha</option>
                        <option>Jogo de Banheiro Personalizado</option>
                        <option>Kit Sousplats / Mesa Posta</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="c-room">Para qual ambiente?</Label>
                      <select
                        id="c-room"
                        value={room}
                        onChange={(e) => setRoom(e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option>Sala de Estar / Jantar</option>
                        <option>Quarto Casal / Solteiro</option>
                        <option>Quarto Infantil / Bebê</option>
                        <option>Cozinha / Área Gourmet</option>
                        <option>Banheiro / Lavabo</option>
                        <option>Corredor / Hall de Entrada</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="c-dim">Medidas aproximadas desejadas *</Label>
                      <Input
                        id="c-dim"
                        value={desiredDimensions}
                        onChange={(e) => setDesiredDimensions(e.target.value)}
                        placeholder="Ex: 1,80m x 1,20m ou Redondo 1,50m"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="c-colors">Cores que você imagina *</Label>
                      <Input
                        id="c-colors"
                        value={colorPalette}
                        onChange={(e) => setColorPalette(e.target.value)}
                        placeholder="Ex: Cru no centro com borda Terracota"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="c-email">E-mail (opcional)</Label>
                    <Input
                      id="c-email"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="seuemail@exemplo.com"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="c-notes">Observações ou modelo de referência</Label>
                    <Textarea
                      id="c-notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Viu algum modelo no @atelie_sueli_croche que amou? Conte aqui para a Sueli!"
                      rows={3}
                    />
                  </div>

                  <motion.div whileTap={{ scale: 0.98 }}>
                    <Button
                      type="submit"
                      size="lg"
                      disabled={isPending}
                      className="w-full bg-gradient-warm text-primary-foreground rounded-full font-bold text-base shadow-warm"
                    >
                      {isPending
                        ? "Registrando seu pedido..."
                        : "Solicitar Orçamento Personalizado com a Sueli"}
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
