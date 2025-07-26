import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import heroRug from "@/assets/hero-rug.jpg";

export const Hero = () => {
  return (
    <section className="relative bg-gradient-subtle overflow-hidden">
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 text-primary">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-medium">Feito à mão com amor</span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
              Tapetes de Crochê
              <span className="block text-primary">Únicos & Artesanais</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-lg">
              Descubra nossa coleção exclusiva de tapetes feitos à mão. 
              Cada peça é única, criada com técnicas tradicionais de crochê 
              e materiais de alta qualidade.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-gradient-warm shadow-warm hover:shadow-lg transition-all">
                Ver Coleção
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg">
                Sobre Nosso Trabalho
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-8 pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">100%</div>
                <div className="text-sm text-muted-foreground">Artesanal</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">+500</div>
                <div className="text-sm text-muted-foreground">Clientes Felizes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">15+</div>
                <div className="text-sm text-muted-foreground">Anos de Experiência</div>
              </div>
            </div>
          </div>
          
          {/* Image */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl shadow-warm">
              <img 
                src={heroRug} 
                alt="Tapete de crochê artesanal" 
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
            
            {/* Floating badge */}
            <div className="absolute -top-4 -right-4 bg-card border border-border rounded-full p-4 shadow-soft">
              <div className="text-center">
                <div className="text-sm font-bold text-primary">Frete Grátis</div>
                <div className="text-xs text-muted-foreground">acima de R$ 150</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};