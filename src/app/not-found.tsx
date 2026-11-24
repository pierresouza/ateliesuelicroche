import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-6">
      <div className="max-w-md text-center bg-card border border-border rounded-3xl p-10 shadow-warm space-y-4">
        <Sparkles className="h-10 w-10 text-primary mx-auto" />
        <h1 className="font-serif text-4xl font-bold text-foreground">Página não encontrada</h1>
        <p className="text-sm text-muted-foreground">
          Parece que este fio escapou da agulha! Que tal voltar para a vitrine do Ateliê Sueli Crochê?
        </p>
        <Button asChild className="bg-gradient-warm rounded-full px-6">
          <Link href="/colecao">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Ver Coleção Artesanal
          </Link>
        </Button>
      </div>
    </div>
  );
}
