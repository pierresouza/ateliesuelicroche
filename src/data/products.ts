export interface ProductColor {
  name: string;
  hex: string;
  image: string;
}

export interface ProductSize {
  label: string;
  dimensions: string;
  priceDelta: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  pixDiscountPercent: number;
  image: string;
  rating: number;
  reviews: number;
  category:
    | "Retangular"
    | "Oval"
    | "Passadeira"
    | "Jogo de Banheiro"
    | "Capas & Cozinha"
    | "Mesa Posta";
  room: "Sala" | "Quarto" | "Cozinha" | "Banheiro" | "Mesa Posta";
  description: string;
  dimensions: string;
  material: string;
  colors: ProductColor[];
  sizes: ProductSize[];
  careInstructions: string;
  stockQuantity: number;
  isMadeToOrder: boolean;
  productionDays: number;
  weightKg: number;
  pkgHeightCm: number;
  pkgWidthCm: number;
  pkgLengthCm: number;
  bestseller?: boolean;
  featured?: boolean;
}

export const SUELI_IMAGES = {
  tapeteSalaCoracoes: "/images/products/sueli-tapete-sala-coracoes-cinza-branco.jpg",
  jogoQuartoAreiaMarinho: "/images/products/sueli-jogo-quarto-oval-areia-marinho.jpg",
  jogoQuartoPink: "/images/products/sueli-jogo-quarto-passadeira-pink.jpg",
  jogoPassadeiraCinzaRosa: "/images/products/sueli-jogo-passadeira-cinza-rosa.jpg",
  passadeiraCorredorCinzaPreto: "/images/products/sueli-passadeira-corredor-cinza-preto.jpg",
  jogoBanheiro5PecasVermelho: "/images/products/sueli-jogo-banheiro-5-pecas-vermelho.jpg",
  jogoBanheiroLavanda: "/images/products/sueli-jogo-banheiro-lavanda-lilas.jpg",
  kitCapasEletros: "/images/products/sueli-kit-capas-liquidificador-batedeira.jpg",
  capaBotijaoPretoCru: "/images/products/sueli-capa-botijao-preto-cru.jpg",
  kitSousplatVermelhoVerde: "/images/products/sueli-kit-sousplat-vermelho-verde.jpg",
} as const;

export const ROOM_CATEGORIES = [
  {
    slug: "Sala",
    title: "Sala & Corredor",
    subtitle: "Tapetes em relevo com corações e passadeiras firmes que não enrolam",
    image: SUELI_IMAGES.tapeteSalaCoracoes,
    badge: "Assinatura Sueli",
  },
  {
    slug: "Quarto",
    title: "Jogos de Quarto",
    subtitle: "Conjuntos de 3 peças ovais e passadeiras macias para lateral de cama",
    image: SUELI_IMAGES.jogoQuartoAreiaMarinho,
    badge: "Toque 100% Algodão",
  },
  {
    slug: "Cozinha",
    title: "Cozinha, Capas & Passadeiras",
    subtitle: "Jogos de passadeira, capa de botijão e capas de liquidificador e batedeira",
    image: SUELI_IMAGES.kitCapasEletros,
    badge: "Exclusivo do Ateliê",
  },
  {
    slug: "Banheiro",
    title: "Jogos de Banheiro",
    subtitle: "Kits de 2 a 5 peças com tampa do vaso, pé do vaso e caixa acoplada",
    image: SUELI_IMAGES.jogoBanheiro5PecasVermelho,
    badge: "Mais Vendidos",
  },
] as const;

export const STORE_TESTIMONIALS = [
  {
    id: "t1",
    name: "Camila Fernandes",
    city: "São Paulo, SP",
    productName: "Tapete de Sala Corações em Relevo Cinza & Branco",
    rating: 5,
    comment:
      "Chegou super perfumado e com a etiquetinha rosa da Sueli que é a coisa mais linda! Os corações no centro e o bico rendado branco deixaram minha sala outra. Fica retinho no porcelanato!",
    verified: true,
  },
  {
    id: "t2",
    name: "Patrícia Almeida",
    city: "Campinas, SP",
    productName: "Kit Capas para Liquidificador e Batedeira + Capa de Botijão",
    rating: 5,
    comment:
      "Comprei o kit de capas para meus eletros e a capa de botijão preto e cru. Couberam sob medida, o barbante é super encorpado e todo mundo que entra na minha cozinha elogia!",
    verified: true,
  },
  {
    id: "t3",
    name: "Juliana Ribeiro",
    city: "Belo Horizonte, MG",
    productName: "Jogo de Banheiro Completo Rubi & Areia (5 Peças)",
    rating: 5,
    comment:
      "Acompanho o @atelie_sueli_croche e encomendei o jogo de banheiro de 5 peças com capa da caixa acoplada. Dá para ver o capricho artesanal da Sueli em cada ponto!",
    verified: true,
  },
  {
    id: "t4",
    name: "Renata Costa",
    city: "Santo André, SP",
    productName: "Jogo de Quarto 3 Tapetes Ovais Brisa Areia & Azul Marinho",
    rating: 5,
    comment:
      "Coloquei as 3 peças ao redor da cama e ficou idêntico à foto! Super macio de pisar descalça logo cedo e já lavei no ciclo delicado sem deformar nada.",
    verified: true,
  },
];

export const STORE_FAQS = [
  {
    question: "As peças do Ateliê Sueli Crochê podem ir na máquina de lavar?",
    answer:
      "Sim! Todas as peças são confeccionadas pela Sueli com barbante ecológico de alta torção (85% a 100% algodão). Podem ser lavadas na máquina em ciclo delicado, com sabão neutro e sem alvejante. Seque à sombra na horizontal para manter o bico rendado impecável.",
  },
  {
    question: "Como funciona o cálculo de entrega e rastreamento pela SuperFrete?",
    answer:
      "Cotamos em tempo real direto do nosso ateliê em São Paulo (CEP 03968-000) pelas transportadoras parceiras da SuperFrete (PAC, SEDEX, Mini Envios e Jadlog) com desconto especial. Assim que sua caixa é postada, o código de rastreio e cada etapa da entrega atualizam automaticamente dentro de 'Minha Conta' no site!",
  },
  {
    question: "Posso encomendar qualquer modelo das fotos em outras cores ou medidas?",
    answer:
      "Com certeza! Gostou do tapete de corações, das capas de cozinha ou do jogo de banheiro, mas quer nas cores da sua decoração? Basta usar a opção 'Sob Medida' ou chamar a Sueli no WhatsApp (+55 11 92544-1299) para personalizar!",
  },
  {
    question: "Como funciona o desconto de 5% no PIX e o Frete Grátis?",
    answer:
      "Escolhendo PIX no checkout, o site gera na hora um QR Code oficial já com 5% de desconto aplicado, cumulativo com cupons promocionais (como o BEMVINDA10). Compras a partir de R$ 150,00 garantem Frete Grátis na modalidade econômica!",
  },
  {
    question: "As capas de liquidificador, batedeira e botijão servem nos modelos padrão?",
    answer:
      "Sim! A capa de botijão veste com folga ideal o botijão residencial padrão de 13kg (P13), e as capas de eletrodomésticos vestem liquidificadores e batedeiras planetárias/comuns tradicionais. Se tiver medidas específicas, ajustamos sob encomenda!",
  },
];

export const products: Product[] = [
  {
    id: "1",
    slug: "tapete-sala-coracoes-relevo-cinza-branco",
    name: "Tapete de Sala Retangular Corações em Relevo Cinza & Branco",
    price: 189.9,
    originalPrice: 229.9,
    pixDiscountPercent: 5,
    image: SUELI_IMAGES.tapeteSalaCoracoes,
    rating: 5,
    reviews: 46,
    category: "Retangular",
    room: "Sala",
    description:
      "Peça protagonista assinada com etiqueta artesanal do Ateliê Sueli Crochê: tapete retangular amplo trabalhado em cinza suave com 3 corações centrais desenhados na própria trama de crochê filê e majestoso barrado rendado branco em bico coroa. Assenta perfeitamente no piso sem levantar as pontas.",
    dimensions: "150cm x 95cm",
    material: "Barbante 100% Algodão nº 8 Encorpado",
    colors: [
      { name: "Cinza & Branco (Foto)", hex: "#9CA3AF", image: SUELI_IMAGES.tapeteSalaCoracoes },
      { name: "Areia & Azul Marinho", hex: "#1E3A5F", image: SUELI_IMAGES.jogoQuartoAreiaMarinho },
      { name: "Cinza & Preto", hex: "#1F2937", image: SUELI_IMAGES.passadeiraCorredorCinzaPreto },
    ],
    sizes: [
      { label: "Sala Padrão (1,50m x 95cm)", dimensions: "150cm x 95cm", priceDelta: 0 },
      { label: "Sala Ampla (1,80m x 1,10m)", dimensions: "180cm x 110cm", priceDelta: 55 },
      { label: "Sala Master (2,00m x 1,30m)", dimensions: "200cm x 130cm", priceDelta: 95 },
    ],
    careInstructions: "Lavar à máquina no ciclo delicado com sabão neutro. Secar à sombra na horizontal.",
    stockQuantity: 3,
    isMadeToOrder: false,
    productionDays: 8,
    weightKg: 1.35,
    pkgHeightCm: 13,
    pkgWidthCm: 30,
    pkgLengthCm: 36,
    bestseller: true,
    featured: true,
  },
  {
    id: "2",
    slug: "jogo-quarto-3-tapetes-ovais-areia-marinho",
    name: "Jogo de Quarto 3 Tapetes Ovais Brisa Areia & Azul Marinho",
    price: 219.9,
    originalPrice: 259.9,
    pixDiscountPercent: 5,
    image: SUELI_IMAGES.jogoQuartoAreiaMarinho,
    rating: 5,
    reviews: 39,
    category: "Oval",
    room: "Quarto",
    description:
      "Conjunto completo com 3 tapetes ovais coordenados para laterais e pé da cama. Centro vazado em espiral na cor areia natural com barrado largo de leques em azul marinho profundo e acabamento rendado cru com tag autoral Sueli. Proporciona toque quentinho e macio ao acordar.",
    dimensions: "1 Oval Maior (115x75cm) + 2 Laterais (90x60cm)",
    material: "Barbante Algodão Macio nº 6 e nº 8",
    colors: [
      { name: "Areia & Azul Marinho (Foto)", hex: "#1E3A5F", image: SUELI_IMAGES.jogoQuartoAreiaMarinho },
      { name: "Pink & Lilás", hex: "#EC4899", image: SUELI_IMAGES.jogoQuartoPink },
      { name: "Lavanda Suave", hex: "#C084FC", image: SUELI_IMAGES.jogoBanheiroLavanda },
    ],
    sizes: [
      { label: "1 Tapete Oval Avulso (90x60cm)", dimensions: "90cm x 60cm", priceDelta: -135 },
      { label: "Jogo Completo 3 Peças (Foto)", dimensions: "1x 115x75cm + 2x 90x60cm", priceDelta: 0 },
      { label: "Jogo Queen/King Ampliado", dimensions: "1x 135x80cm + 2x 105x65cm", priceDelta: 48 },
    ],
    careInstructions: "Lavável na máquina em modo suave com sabão neutro. Não usar alvejante.",
    stockQuantity: 3,
    isMadeToOrder: false,
    productionDays: 8,
    weightKg: 1.45,
    pkgHeightCm: 14,
    pkgWidthCm: 30,
    pkgLengthCm: 36,
    bestseller: true,
    featured: true,
  },
  {
    id: "3",
    slug: "jogo-banheiro-5-pecas-rubi-areia-caixa-acoplada",
    name: "Jogo de Banheiro Completo Rubi & Areia (5 Peças c/ Caixa Acoplada)",
    price: 229.9,
    originalPrice: 274.9,
    pixDiscountPercent: 5,
    image: SUELI_IMAGES.jogoBanheiro5PecasVermelho,
    rating: 5,
    reviews: 52,
    category: "Jogo de Banheiro",
    room: "Banheiro",
    description:
      "Conjunto completo de 5 peças retangulares em ponto blocos vermelho rubi com moldura areia e acabamento rendado vermelho: inclui tapete maior da bancada, tapete da saída do box, encaixe pé do vaso, capa da tampa do vaso com redinha interna e capa estruturada para caixa acoplada.",
    dimensions: "Passadeira pia 95x50cm + Tapete box 68x48cm + Pé vaso + Tampa + Caixa acoplada",
    material: "Barbante 100% Algodão Alta Absorção",
    colors: [
      { name: "Vermelho Rubi & Areia (Foto)", hex: "#DC2626", image: SUELI_IMAGES.jogoBanheiro5PecasVermelho },
      { name: "Lavanda & Branco", hex: "#C084FC", image: SUELI_IMAGES.jogoBanheiroLavanda },
    ],
    sizes: [
      { label: "Jogo 3 Peças (Pia + Pé Vaso + Tampa)", dimensions: "3 peças essenciais", priceDelta: -65 },
      { label: "Jogo Completo 5 Peças c/ Caixa Acoplada (Foto)", dimensions: "5 peças coordenadas", priceDelta: 0 },
    ],
    careInstructions: "Lavar separadamente na primeira lavagem com sabão neutro e secar à sombra.",
    stockQuantity: 4,
    isMadeToOrder: false,
    productionDays: 7,
    weightKg: 1.75,
    pkgHeightCm: 16,
    pkgWidthCm: 32,
    pkgLengthCm: 38,
    bestseller: true,
    featured: true,
  },
  {
    id: "4",
    slug: "kit-6-sousplats-mesa-posta-vermelho-verde",
    name: "Kit 6 Sousplats de Crochê Mesa Posta Imperial (Vermelho & Verde)",
    price: 159.9,
    originalPrice: 189.9,
    pixDiscountPercent: 5,
    image: SUELI_IMAGES.kitSousplatVermelhoVerde,
    rating: 5,
    reviews: 34,
    category: "Mesa Posta",
    room: "Mesa Posta",
    description:
      "Transforme jantares em família, almoços especiais e sua mesa posta de fim de ano! Kit com 6 lugares americanos redondos (38cm de diâmetro cada) confeccionados com base firme para acomodar pratos rasos e fundos e bico rendado clássico da Sueli.",
    dimensions: "38cm de diâmetro cada unidade",
    material: "Fio 100% Algodão nº 6 Macio",
    colors: [
      { name: "Mix Vermelho Rubi & Verde Musgo (Foto)", hex: "#B91C1C", image: SUELI_IMAGES.kitSousplatVermelhoVerde },
      { name: "Todos Vermelho Rubi", hex: "#DC2626", image: SUELI_IMAGES.kitSousplatVermelhoVerde },
      { name: "Todos Verde Musgo", hex: "#1E4D3B", image: SUELI_IMAGES.kitSousplatVermelhoVerde },
    ],
    sizes: [
      { label: "Kit 4 Lugares (38cm)", dimensions: "4 Sousplats 38cm", priceDelta: -45 },
      { label: "Kit 6 Lugares (Foto)", dimensions: "6 Sousplats 38cm", priceDelta: 0 },
      { label: "Kit 8 Lugares + 8 Porta-Copos", dimensions: "8 Sousplats + 8 Porta-copos", priceDelta: 68 },
    ],
    careInstructions: "Lavar à mão com sabão neutro e secar sobre superfície plana.",
    stockQuantity: 5,
    isMadeToOrder: false,
    productionDays: 5,
    weightKg: 0.65,
    pkgHeightCm: 8,
    pkgWidthCm: 26,
    pkgLengthCm: 26,
    bestseller: true,
    featured: true,
  },
  {
    id: "5",
    slug: "kit-capas-liquidificador-batedeira-cafe-areia",
    name: "Kit Capas de Crochê para Liquidificador e Batedeira Café & Areia",
    price: 119.9,
    originalPrice: 145.0,
    pixDiscountPercent: 5,
    image: SUELI_IMAGES.kitCapasEletros,
    rating: 5,
    reviews: 41,
    category: "Capas & Cozinha",
    room: "Cozinha",
    description:
      "Dupla encantadora para vestir e proteger seus eletrodomésticos da poeira com todo o charme artesanal: 1 capa de liquidificador + 1 capa de batedeira tecidas em ponto blocos areia natural e marrom café, finalizadas com bico rendado e etiqueta de madeira Ateliê Sueli.",
    dimensions: "Veste liquidificadores e batedeiras padrão/planetárias",
    material: "Barbante 100% Algodão nº 6",
    colors: [
      { name: "Areia & Café (Foto)", hex: "#6F4E37", image: SUELI_IMAGES.kitCapasEletros },
      { name: "Preto & Cru", hex: "#18181B", image: SUELI_IMAGES.capaBotijaoPretoCru },
    ],
    sizes: [
      { label: "Apenas Capa Liquidificador", dimensions: "1 peça avulsa", priceDelta: -55 },
      { label: "Kit Duplo Liquidificador + Batedeira (Foto)", dimensions: "2 peças coordenadas", priceDelta: 0 },
      { label: "Trio Cozinha (+ Capa Airfryer/Galão)", dimensions: "3 capas coordenadas", priceDelta: 59 },
    ],
    careInstructions: "Lavar à mão ou ciclo delicado. Secar à sombra.",
    stockQuantity: 6,
    isMadeToOrder: false,
    productionDays: 5,
    weightKg: 0.55,
    pkgHeightCm: 8,
    pkgWidthCm: 22,
    pkgLengthCm: 28,
    bestseller: true,
    featured: true,
  },
  {
    id: "6",
    slug: "capa-botijao-gas-croche-chevron-preto-cru",
    name: "Capa para Botijão de Gás 13kg em Crochê Chevron Preto & Cru",
    price: 109.9,
    originalPrice: 134.9,
    pixDiscountPercent: 5,
    image: SUELI_IMAGES.capaBotijaoPretoCru,
    rating: 5,
    reviews: 37,
    category: "Capas & Cozinha",
    room: "Cozinha",
    description:
      "Deixe sua cozinha ou área gourmet impecável! Capa para botijão de 13kg (P13) confeccionada em barbante encorpado preto com saia trabalhada em ponto chevron/leques cru natural, contorno em picô preto, abertura traseira com amarração regulável e plaquinha artesanal Sueli.",
    dimensions: "Padrão Botijão P13 (13kg) com ajuste traseiro",
    material: "Barbante Ecológico nº 6 Alta Firmeza",
    colors: [
      { name: "Preto & Cru (Foto)", hex: "#18181B", image: SUELI_IMAGES.capaBotijaoPretoCru },
      { name: "Areia & Marrom Café", hex: "#6F4E37", image: SUELI_IMAGES.kitCapasEletros },
    ],
    sizes: [
      { label: "Capa Botijão 13kg Avulsa (Foto)", dimensions: "1 Capa P13", priceDelta: 0 },
      { label: "Combo Cozinha (Capa Botijão + Kit Liquidif./Batedeira)", dimensions: "3 peças coordenadas", priceDelta: 98 },
    ],
    careInstructions: "Lavar separadamente com sabão neutro sem alvejante.",
    stockQuantity: 5,
    isMadeToOrder: false,
    productionDays: 5,
    weightKg: 0.75,
    pkgHeightCm: 10,
    pkgWidthCm: 25,
    pkgLengthCm: 30,
    bestseller: true,
    featured: true,
  },
  {
    id: "7",
    slug: "jogo-passadeira-3-pecas-cinza-preto-jardim-rosa",
    name: "Jogo de Passadeira 3 Peças Jardim Cinza, Preto & Rosa",
    price: 199.9,
    originalPrice: 239.9,
    pixDiscountPercent: 5,
    image: SUELI_IMAGES.jogoPassadeiraCinzaRosa,
    rating: 5,
    reviews: 29,
    category: "Passadeira",
    room: "Cozinha",
    description:
      "Conjunto oval de 3 peças super prático e cheio de vida para cozinhas, varandas e corredores: base em cinza mescla (ótimo para disfarçar o uso diário), moldura preta contrastante e trilha central florida em rosa vibrante com folhas verdes.",
    dimensions: "1 Passadeira (145x50cm) + 2 Tapetes Ovais (72x50cm)",
    material: "Barbante Algodão nº 8",
    colors: [
      { name: "Cinza, Preto & Rosa (Foto)", hex: "#EC4899", image: SUELI_IMAGES.jogoPassadeiraCinzaRosa },
      { name: "Cinza Claro & Preto Clássico", hex: "#374151", image: SUELI_IMAGES.passadeiraCorredorCinzaPreto },
    ],
    sizes: [
      { label: "Apenas Passadeira (1,45m)", dimensions: "145cm x 50cm", priceDelta: -80 },
      { label: "Jogo Completo 3 Peças (Foto)", dimensions: "1x 145cm + 2x 72cm", priceDelta: 0 },
      { label: "Jogo Passadeira 1,80m + 2 menores", dimensions: "1x 180cm + 2x 75cm", priceDelta: 45 },
    ],
    careInstructions: "Pode ir à máquina em ciclo delicado. Secar à sombra.",
    stockQuantity: 3,
    isMadeToOrder: false,
    productionDays: 7,
    weightKg: 1.6,
    pkgHeightCm: 15,
    pkgWidthCm: 30,
    pkgLengthCm: 38,
  },
  {
    id: "8",
    slug: "jogo-banheiro-lavanda-real-tranca-tricolor",
    name: "Jogo de Banheiro Lavanda Real com Trança Tricolor",
    price: 149.9,
    originalPrice: 179.9,
    pixDiscountPercent: 5,
    image: SUELI_IMAGES.jogoBanheiroLavanda,
    rating: 5,
    reviews: 33,
    category: "Jogo de Banheiro",
    room: "Banheiro",
    description:
      "Delicadeza e perfume visual para seu banheiro ou lavabo: conjunto oval em lilás lavanda com detalhe artesanal trançado em roxo, lilás e branco e bico rendado em ondas. A tampa do vaso possui redinha interna ajustável.",
    dimensions: "Tapete Oval 75x52cm + Capa Tampa do Vaso",
    material: "Barbante 100% Algodão Macio",
    colors: [
      { name: "Lilás Lavanda (Foto)", hex: "#C084FC", image: SUELI_IMAGES.jogoBanheiroLavanda },
      { name: "Vermelho & Areia", hex: "#DC2626", image: SUELI_IMAGES.jogoBanheiro5PecasVermelho },
    ],
    sizes: [
      { label: "Jogo 2 Peças Lavabo (Tapete + Tampa - Foto)", dimensions: "2 peças ovais", priceDelta: 0 },
      { label: "Jogo 3 Peças (+ Tapete Pé do Vaso)", dimensions: "3 peças ovais", priceDelta: 42 },
    ],
    careInstructions: "Lavar com sabão neutro sem torcer sobre a trança em relevo.",
    stockQuantity: 4,
    isMadeToOrder: false,
    productionDays: 6,
    weightKg: 0.9,
    pkgHeightCm: 10,
    pkgWidthCm: 26,
    pkgLengthCm: 32,
  },
  {
    id: "9",
    slug: "jogo-quarto-passadeira-encanto-pink-lilas",
    name: "Jogo de Quarto 3 Peças Passadeira Encanto Pink & Lilás",
    price: 209.9,
    originalPrice: 249.0,
    pixDiscountPercent: 5,
    image: SUELI_IMAGES.jogoQuartoPink,
    rating: 5,
    reviews: 24,
    category: "Passadeira",
    room: "Quarto",
    description:
      "Conjunto vibrante e acolhedor com 1 passadeira longa e 2 tapetes retangulares de cantos arredondados em rosa pink com moldura em blocos lilás claro e acabamento em bico coroa pontilhado.",
    dimensions: "1 Passadeira (150x55cm) + 2 Tapetes (80x52cm)",
    material: "100% Algodão Hipoalergênico",
    colors: [
      { name: "Pink & Lilás (Foto)", hex: "#EC4899", image: SUELI_IMAGES.jogoQuartoPink },
      { name: "Areia & Azul Marinho", hex: "#1E3A5F", image: SUELI_IMAGES.jogoQuartoAreiaMarinho },
    ],
    sizes: [
      { label: "Jogo Completo 3 Peças (Foto)", dimensions: "1x 150x55cm + 2x 80x52cm", priceDelta: 0 },
      { label: "Apenas Passadeira 1,50m", dimensions: "150cm x 55cm", priceDelta: -85 },
    ],
    careInstructions: "Lavar à máquina em água fria com sabão neutro.",
    stockQuantity: 2,
    isMadeToOrder: false,
    productionDays: 7,
    weightKg: 1.65,
    pkgHeightCm: 15,
    pkgWidthCm: 30,
    pkgLengthCm: 38,
  },
  {
    id: "10",
    slug: "passadeira-corredor-classica-cinza-claro-preto",
    name: "Passadeira de Corredor Clássica Cinza Claro & Preto",
    price: 154.9,
    originalPrice: 184.9,
    pixDiscountPercent: 5,
    image: SUELI_IMAGES.passadeiraCorredorCinzaPreto,
    rating: 5,
    reviews: 31,
    category: "Passadeira",
    room: "Sala",
    description:
      "Elegância neutra e contemporânea para corredores, halls de entrada e laterais de varanda gourmet: centro trabalhado em cinza claro com faixas duplas pretas e bico rendado pontiagudo com etiqueta artesanal Sueli.",
    dimensions: "160cm x 58cm",
    material: "Barbante Algodão nº 8 Firme",
    colors: [
      { name: "Cinza Claro & Preto (Foto)", hex: "#374151", image: SUELI_IMAGES.passadeiraCorredorCinzaPreto },
      { name: "Cinza, Preto & Rosa", hex: "#EC4899", image: SUELI_IMAGES.jogoPassadeiraCinzaRosa },
    ],
    sizes: [
      { label: "1,40m x 55cm", dimensions: "140cm x 55cm", priceDelta: -20 },
      { label: "1,60m x 58cm (Foto)", dimensions: "160cm x 58cm", priceDelta: 0 },
      { label: "2,00m x 60cm", dimensions: "200cm x 60cm", priceDelta: 42 },
    ],
    careInstructions: "Lavar à máquina em ciclo delicado. Secar esticada à sombra.",
    stockQuantity: 4,
    isMadeToOrder: false,
    productionDays: 6,
    weightKg: 1.25,
    pkgHeightCm: 12,
    pkgWidthCm: 28,
    pkgLengthCm: 35,
  },
];

export function getProductBySlugOrId(slugOrId: string): Product | undefined {
  return products.find((p) => p.slug === slugOrId || p.id === slugOrId);
}
