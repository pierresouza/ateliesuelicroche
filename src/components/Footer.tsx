import { Heart, Mail, Phone, MapPin, Instagram, Facebook, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-warm rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">TC</span>
              </div>
              <h3 className="text-xl font-bold text-foreground">Tapetes Crochê</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Criando beleza e conforto para seu lar com tapetes artesanais únicos, 
              feitos com amor e dedicação há mais de 15 anos.
            </p>
            <div className="flex space-x-3">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Twitter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground">Links Rápidos</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Sobre Nós</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Nossa História</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Como Compramos</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Cuidados com o Produto</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Política de Troca</a></li>
            </ul>
          </div>

          {/* Categorias */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground">Categorias</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Tapetes Redondos</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Tapetes Retangulares</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Tapetes Ovais</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Passadeiras</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Jogos de Tapetes</a></li>
            </ul>
          </div>

          {/* Contato */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground">Contato</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>(11) 99999-9999</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>contato@tapetescroche.com.br</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>São Paulo, SP</span>
              </div>
            </div>

            {/* Newsletter */}
            <div className="space-y-2">
              <h5 className="font-medium text-foreground">Newsletter</h5>
              <div className="flex space-x-2">
                <Input 
                  placeholder="Seu e-mail" 
                  className="text-xs h-8"
                />
                <Button size="sm" className="bg-gradient-warm">
                  <Mail className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-muted-foreground flex items-center">
              © 2024 Tapetes Crochê. Feito com 
              <Heart className="h-3 w-3 mx-1 text-primary fill-current" />
              no Brasil.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Termos de Uso
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Privacidade
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};