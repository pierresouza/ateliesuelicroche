import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Award, Users, Clock, Sparkles, ArrowRight } from "lucide-react";
import heroRug from "@/assets/hero-rug.jpg";
import rug1 from "@/assets/rug-1.jpg";
import rug2 from "@/assets/rug-2.jpg";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-subtle py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge className="bg-gradient-warm text-primary-foreground">
                Nossa História
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
                Tradição e Amor em
                <span className="block text-primary">Cada Fio</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Há mais de 15 anos, transformamos fios em obras de arte. 
                Cada tapete conta uma história de dedicação, técnica artesanal 
                e paixão pela criação de peças únicas.
              </p>
            </div>
            <div className="relative">
              <img 
                src={heroRug} 
                alt="Nosso trabalho artesanal" 
                className="rounded-2xl shadow-warm w-full h-[400px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <div className="text-3xl font-bold text-foreground">15+</div>
              <div className="text-muted-foreground">Anos de Experiência</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <div className="text-3xl font-bold text-foreground">500+</div>
              <div className="text-muted-foreground">Clientes Satisfeitos</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <div className="text-3xl font-bold text-foreground">1000+</div>
              <div className="text-muted-foreground">Tapetes Criados</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <div className="text-3xl font-bold text-foreground">100%</div>
              <div className="text-muted-foreground">Feito com Amor</div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Nossa Jornada
              </h2>
              <p className="text-lg text-muted-foreground">
                Uma história de paixão, dedicação e muito amor pelo artesanato brasileiro
              </p>
            </div>

            <div className="space-y-12">
              {/* Timeline Item 1 */}
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <Badge variant="outline" className="text-primary border-primary">
                    2008 - O Início
                  </Badge>
                  <h3 className="text-2xl font-bold text-foreground">
                    Primeiros Passos
                  </h3>
                  <p className="text-muted-foreground">
                    Tudo começou como um hobby. Maria, nossa fundadora, aprendeu a técnica 
                    do crochê com sua avó e decidiu criar seus primeiros tapetes para 
                    decorar a própria casa. A qualidade e beleza das peças chamaram 
                    atenção de amigos e vizinhos.
                  </p>
                </div>
                <div className="order-first lg:order-last">
                  <img 
                    src={rug1} 
                    alt="Primeiros tapetes" 
                    className="rounded-lg shadow-soft w-full h-64 object-cover"
                  />
                </div>
              </div>

              {/* Timeline Item 2 */}
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4 lg:order-last">
                  <Badge variant="outline" className="text-primary border-primary">
                    2012 - Expansão
                  </Badge>
                  <h3 className="text-2xl font-bold text-foreground">
                    Crescimento Natural
                  </h3>
                  <p className="text-muted-foreground">
                    Com o boca a boca positivo, começamos a receber encomendas personalizadas. 
                    Expandimos nossa linha de produtos e começamos a participar de feiras 
                    artesanais locais, sempre mantendo o compromisso com a qualidade.
                  </p>
                </div>
                <div>
                  <img 
                    src={rug2} 
                    alt="Feira artesanal" 
                    className="rounded-lg shadow-soft w-full h-64 object-cover"
                  />
                </div>
              </div>

              {/* Timeline Item 3 */}
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <Badge variant="outline" className="text-primary border-primary">
                    2024 - Digital
                  </Badge>
                  <h3 className="text-2xl font-bold text-foreground">
                    Chegada ao Mundo Digital
                  </h3>
                  <p className="text-muted-foreground">
                    Hoje, nossa loja online permite que pessoas de todo o Brasil 
                    tenham acesso aos nossos tapetes únicos. Mantemos a mesma dedicação 
                    artesanal de sempre, agora com a comodidade da compra online.
                  </p>
                </div>
                <div className="order-first lg:order-last">
                  <img 
                    src={heroRug} 
                    alt="Loja online" 
                    className="rounded-lg shadow-soft w-full h-64 object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Nossos Valores
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Os princípios que nos guiam em cada tapete criado
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center shadow-soft border-border">
              <CardContent className="p-6">
                <div className="flex justify-center mb-4">
                  <Sparkles className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  Qualidade Artesanal
                </h3>
                <p className="text-muted-foreground">
                  Cada ponto é cuidadosamente trabalhado à mão, garantindo 
                  durabilidade e beleza únicos em cada peça.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center shadow-soft border-border">
              <CardContent className="p-6">
                <div className="flex justify-center mb-4">
                  <Heart className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  Feito com Amor
                </h3>
                <p className="text-muted-foreground">
                  Colocamos paixão e dedicação em cada projeto, criando 
                  peças que carregam nossa energia positiva.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center shadow-soft border-border">
              <CardContent className="p-6">
                <div className="flex justify-center mb-4">
                  <Award className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  Tradição Brasileira
                </h3>
                <p className="text-muted-foreground">
                  Preservamos e valorizamos as técnicas tradicionais 
                  do artesanato brasileiro em cada criação.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Pronto para Conhecer Nossa Coleção?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Descubra os tapetes que farão a diferença na decoração da sua casa. 
            Cada peça é única e feita especialmente para você.
          </p>
          <Button size="lg" className="bg-gradient-warm shadow-warm hover:shadow-lg transition-all">
            Ver Todos os Produtos
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;