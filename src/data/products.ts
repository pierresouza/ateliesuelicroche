import rug1 from "@/assets/rug-1.jpg";
import rug2 from "@/assets/rug-2.jpg";
import rug3 from "@/assets/rug-3.jpg";

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  category: string;
  description: string;
  dimensions: string;
  material: string;
  colors: Array<{ name: string; hex: string }>;
  careInstructions: string;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Tapete Redondo Mandala",
    price: 89.90,
    originalPrice: 120.00,
    image: rug1,
    rating: 5,
    reviews: 23,
    category: "Redondo",
    description: "Lindo tapete redondo com padrão mandala, feito com fios de algodão de alta qualidade. Perfeito para salas e quartos, trazendo um toque de elegância e conforto para seu ambiente.",
    dimensions: "120cm de diâmetro",
    material: "100% Algodão",
    colors: [
      { name: "Bege", hex: "#D4C5B9" },
      { name: "Marrom", hex: "#8B7355" },
      { name: "Creme", hex: "#F5F5DC" }
    ],
    careInstructions: "Lavar à mão com água fria. Secar à sombra."
  },
  {
    id: "2", 
    name: "Tapete Geométrico Terracota",
    price: 156.50,
    originalPrice: 189.90,
    image: rug2,
    rating: 4,
    reviews: 18,
    category: "Retangular",
    description: "Tapete retangular com padrão geométrico em tons terrosos. Ideal para espaços modernos e contemporâneos, combinando perfeitamente com decorações minimalistas.",
    dimensions: "150cm x 100cm",
    material: "Algodão e Juta",
    colors: [
      { name: "Terracota", hex: "#E2725B" },
      { name: "Creme", hex: "#F5F5DC" },
      { name: "Marrom", hex: "#8B7355" }
    ],
    careInstructions: "Lavar à máquina em ciclo delicado. Não usar alvejante."
  },
  {
    id: "3",
    name: "Tapete Oval Flores",
    price: 134.90,
    image: rug3,
    rating: 5,
    reviews: 31,
    category: "Oval",
    description: "Encantador tapete oval com delicados motivos florais. Feito à mão com técnicas tradicionais de crochê, perfeito para criar um ambiente acolhedor e romântico.",
    dimensions: "130cm x 80cm",
    material: "100% Algodão",
    colors: [
      { name: "Rosa", hex: "#FFB6C1" },
      { name: "Verde", hex: "#90EE90" },
      { name: "Creme", hex: "#F5F5DC" }
    ],
    careInstructions: "Lavar à mão com sabão neutro. Não torcer."
  },
  {
    id: "4",
    name: "Tapete Redondo Colorido",
    price: 95.00,
    image: rug1,
    rating: 5,
    reviews: 15,
    category: "Redondo",
    description: "Tapete redondo vibrante com cores alegres, ideal para quartos infantis ou áreas de lazer.",
    dimensions: "100cm de diâmetro",
    material: "100% Algodão",
    colors: [
      { name: "Azul", hex: "#87CEEB" },
      { name: "Rosa", hex: "#FFB6C1" },
      { name: "Amarelo", hex: "#FFD700" }
    ],
    careInstructions: "Lavar à mão com sabão neutro."
  },
  {
    id: "5",
    name: "Tapete Retangular Listrado",
    price: 145.00,
    originalPrice: 180.00,
    image: rug2,
    rating: 4,
    reviews: 20,
    category: "Retangular",
    description: "Design listrado moderno, perfeito para salas de estar e corredores.",
    dimensions: "180cm x 120cm",
    material: "Algodão e Juta",
    colors: [
      { name: "Cinza", hex: "#808080" },
      { name: "Branco", hex: "#FFFFFF" },
      { name: "Preto", hex: "#2C2C2C" }
    ],
    careInstructions: "Lavar à máquina em ciclo delicado."
  },
  {
    id: "6",
    name: "Tapete Oval Clássico",
    price: 128.00,
    image: rug3,
    rating: 5,
    reviews: 25,
    category: "Oval",
    description: "Tapete oval com design clássico atemporal, ótimo para sala de jantar.",
    dimensions: "140cm x 90cm",
    material: "100% Algodão",
    colors: [
      { name: "Bege", hex: "#D4C5B9" },
      { name: "Creme", hex: "#F5F5DC" },
      { name: "Marfim", hex: "#FFFFF0" }
    ],
    careInstructions: "Lavar à mão com água fria."
  },
  {
    id: "7",
    name: "Tapete Redondo Nórdico",
    price: 110.00,
    image: rug1,
    rating: 5,
    reviews: 30,
    category: "Redondo",
    description: "Estilo nórdico minimalista, com padrões geométricos sutis.",
    dimensions: "130cm de diâmetro",
    material: "100% Algodão",
    colors: [
      { name: "Cinza Claro", hex: "#D3D3D3" },
      { name: "Branco", hex: "#FFFFFF" },
      { name: "Azul Claro", hex: "#ADD8E6" }
    ],
    careInstructions: "Lavar à máquina em água fria."
  },
  {
    id: "8",
    name: "Tapete Retangular Boho",
    price: 165.00,
    originalPrice: 200.00,
    image: rug2,
    rating: 5,
    reviews: 28,
    category: "Retangular",
    description: "Estilo boho com franjas e padrões étnicos, perfeito para ambientes descontraídos.",
    dimensions: "160cm x 110cm",
    material: "Algodão e Juta",
    colors: [
      { name: "Mostarda", hex: "#FFDB58" },
      { name: "Terracota", hex: "#E2725B" },
      { name: "Verde Oliva", hex: "#808000" }
    ],
    careInstructions: "Lavar à mão com cuidado. Não torcer."
  },
  {
    id: "9",
    name: "Tapete Oval Shabby Chic",
    price: 142.00,
    image: rug3,
    rating: 4,
    reviews: 19,
    category: "Oval",
    description: "Design romântico com acabamento delicado, ideal para quartos.",
    dimensions: "135cm x 85cm",
    material: "100% Algodão",
    colors: [
      { name: "Rosa Claro", hex: "#FFE4E1" },
      { name: "Lavanda", hex: "#E6E6FA" },
      { name: "Creme", hex: "#F5F5DC" }
    ],
    careInstructions: "Lavar à mão com sabão neutro."
  },
  {
    id: "10",
    name: "Tapete Redondo Tropical",
    price: 98.00,
    image: rug1,
    rating: 5,
    reviews: 22,
    category: "Redondo",
    description: "Cores tropicais vibrantes com padrões de folhas e flores.",
    dimensions: "110cm de diâmetro",
    material: "100% Algodão",
    colors: [
      { name: "Verde", hex: "#90EE90" },
      { name: "Coral", hex: "#FF7F50" },
      { name: "Turquesa", hex: "#40E0D0" }
    ],
    careInstructions: "Lavar à mão com água fria."
  },
  {
    id: "11",
    name: "Tapete Retangular Industrial",
    price: 175.00,
    image: rug2,
    rating: 4,
    reviews: 16,
    category: "Retangular",
    description: "Design industrial com tons neutros, perfeito para lofts modernos.",
    dimensions: "200cm x 140cm",
    material: "Algodão e Juta",
    colors: [
      { name: "Cinza Escuro", hex: "#696969" },
      { name: "Preto", hex: "#2C2C2C" },
      { name: "Cru", hex: "#ECE9E6" }
    ],
    careInstructions: "Lavar à máquina em ciclo normal."
  },
  {
    id: "12",
    name: "Tapete Oval Provençal",
    price: 138.00,
    image: rug3,
    rating: 5,
    reviews: 24,
    category: "Oval",
    description: "Estilo provençal francês com flores delicadas e tons pastéis.",
    dimensions: "145cm x 95cm",
    material: "100% Algodão",
    colors: [
      { name: "Lilás", hex: "#DDA0DD" },
      { name: "Verde Menta", hex: "#98FF98" },
      { name: "Amarelo Claro", hex: "#FFFFE0" }
    ],
    careInstructions: "Lavar à mão com cuidado."
  },
  {
    id: "13",
    name: "Tapete Redondo Étnico",
    price: 115.00,
    originalPrice: 145.00,
    image: rug1,
    rating: 5,
    reviews: 27,
    category: "Redondo",
    description: "Padrões étnicos tradicionais, feito à mão com técnica artesanal.",
    dimensions: "125cm de diâmetro",
    material: "100% Algodão",
    colors: [
      { name: "Vermelho", hex: "#DC143C" },
      { name: "Laranja", hex: "#FF8C00" },
      { name: "Marrom", hex: "#8B7355" }
    ],
    careInstructions: "Lavar à mão com água fria."
  },
  {
    id: "14",
    name: "Tapete Retangular Escandinavo",
    price: 152.00,
    image: rug2,
    rating: 5,
    reviews: 21,
    category: "Retangular",
    description: "Design escandinavo clean com formas geométricas simples.",
    dimensions: "170cm x 120cm",
    material: "100% Algodão",
    colors: [
      { name: "Branco Gelo", hex: "#F8F8FF" },
      { name: "Cinza Claro", hex: "#D3D3D3" },
      { name: "Azul Pastel", hex: "#B0E0E6" }
    ],
    careInstructions: "Lavar à máquina em água fria."
  },
  {
    id: "15",
    name: "Tapete Oval Vintage",
    price: 148.00,
    image: rug3,
    rating: 4,
    reviews: 18,
    category: "Oval",
    description: "Design vintage retrô com cores envelhecidas e padrões clássicos.",
    dimensions: "150cm x 100cm",
    material: "Algodão e Juta",
    colors: [
      { name: "Mostarda Queimado", hex: "#CC8800" },
      { name: "Verde Musgo", hex: "#8A9A5B" },
      { name: "Terracota", hex: "#E2725B" }
    ],
    careInstructions: "Lavar à mão com sabão neutro."
  },
  {
    id: "16",
    name: "Tapete Redondo Kids",
    price: 92.00,
    image: rug1,
    rating: 5,
    reviews: 33,
    category: "Redondo",
    description: "Design divertido para quartos infantis, com cores vibrantes e alegres.",
    dimensions: "100cm de diâmetro",
    material: "100% Algodão",
    colors: [
      { name: "Rosa Chiclete", hex: "#FF69B4" },
      { name: "Azul Céu", hex: "#87CEEB" },
      { name: "Verde Limão", hex: "#32CD32" }
    ],
    careInstructions: "Lavar à máquina em ciclo delicado."
  },
  {
    id: "17",
    name: "Tapete Retangular Rústico",
    price: 168.00,
    originalPrice: 210.00,
    image: rug2,
    rating: 5,
    reviews: 26,
    category: "Retangular",
    description: "Estilo rústico com fibras naturais, perfeito para casas de campo.",
    dimensions: "190cm x 130cm",
    material: "Juta e Algodão",
    colors: [
      { name: "Natural", hex: "#D2B48C" },
      { name: "Bege", hex: "#D4C5B9" },
      { name: "Marrom Claro", hex: "#BC9A6C" }
    ],
    careInstructions: "Aspirar regularmente. Não lavar."
  },
  {
    id: "18",
    name: "Tapete Oval Contemporâneo",
    price: 155.00,
    image: rug3,
    rating: 4,
    reviews: 17,
    category: "Oval",
    description: "Design contemporâneo arrojado com cores contrastantes.",
    dimensions: "155cm x 105cm",
    material: "100% Algodão",
    colors: [
      { name: "Preto", hex: "#2C2C2C" },
      { name: "Branco", hex: "#FFFFFF" },
      { name: "Cinza Médio", hex: "#A9A9A9" }
    ],
    careInstructions: "Lavar à máquina em ciclo normal."
  },
  {
    id: "19",
    name: "Tapete Redondo Minimalista",
    price: 105.00,
    image: rug1,
    rating: 5,
    reviews: 29,
    category: "Redondo",
    description: "Design minimalista ultra-clean, ideal para ambientes modernos.",
    dimensions: "115cm de diâmetro",
    material: "100% Algodão",
    colors: [
      { name: "Branco Puro", hex: "#FFFFFF" },
      { name: "Cinza Claro", hex: "#D3D3D3" },
      { name: "Bege", hex: "#D4C5B9" }
    ],
    careInstructions: "Lavar à máquina em água fria."
  },
  {
    id: "20",
    name: "Tapete Retangular Artístico",
    price: 185.00,
    image: rug2,
    rating: 5,
    reviews: 14,
    category: "Retangular",
    description: "Peça artística única com padrões abstratos e cores expressivas.",
    dimensions: "180cm x 130cm",
    material: "100% Algodão",
    colors: [
      { name: "Roxo", hex: "#9370DB" },
      { name: "Dourado", hex: "#DAA520" },
      { name: "Azul Marinho", hex: "#000080" }
    ],
    careInstructions: "Lavar à mão com cuidado especial."
  },
  {
    id: "21",
    name: "Tapete Oval Natural",
    price: 132.00,
    image: rug3,
    rating: 4,
    reviews: 23,
    category: "Oval",
    description: "Tons naturais suaves que complementam qualquer decoração.",
    dimensions: "140cm x 90cm",
    material: "100% Algodão",
    colors: [
      { name: "Cru", hex: "#ECE9E6" },
      { name: "Areia", hex: "#C2B280" },
      { name: "Bege", hex: "#D4C5B9" }
    ],
    careInstructions: "Lavar à mão com água fria."
  },
  {
    id: "22",
    name: "Tapete Redondo Luxo",
    price: 125.00,
    originalPrice: 160.00,
    image: rug1,
    rating: 5,
    reviews: 32,
    category: "Redondo",
    description: "Design luxuoso com acabamento premium e detalhes sofisticados.",
    dimensions: "140cm de diâmetro",
    material: "100% Algodão Premium",
    colors: [
      { name: "Champagne", hex: "#F7E7CE" },
      { name: "Prata", hex: "#C0C0C0" },
      { name: "Dourado", hex: "#DAA520" }
    ],
    careInstructions: "Limpeza profissional recomendada."
  },
  {
    id: "23",
    name: "Tapete Retangular Moderno",
    price: 158.00,
    image: rug2,
    rating: 5,
    reviews: 19,
    category: "Retangular",
    description: "Linhas modernas e clean para ambientes contemporâneos sofisticados.",
    dimensions: "175cm x 125cm",
    material: "Algodão e Juta",
    colors: [
      { name: "Grafite", hex: "#434343" },
      { name: "Cinza Médio", hex: "#A9A9A9" },
      { name: "Branco Off", hex: "#FAF0E6" }
    ],
    careInstructions: "Lavar à máquina em ciclo delicado."
  },
  {
    id: "24",
    name: "Tapete Oval Romântico",
    price: 144.00,
    image: rug3,
    rating: 5,
    reviews: 26,
    category: "Oval",
    description: "Delicado e romântico, perfeito para criar ambientes aconchegantes.",
    dimensions: "148cm x 98cm",
    material: "100% Algodão",
    colors: [
      { name: "Rosa Bebê", hex: "#FFE4E1" },
      { name: "Pêssego", hex: "#FFDAB9" },
      { name: "Creme", hex: "#F5F5DC" }
    ],
    careInstructions: "Lavar à mão com sabão neutro."
  },
  {
    id: "25",
    name: "Tapete Redondo Zen",
    price: 118.00,
    image: rug1,
    rating: 5,
    reviews: 28,
    category: "Redondo",
    description: "Design zen minimalista que traz tranquilidade ao ambiente.",
    dimensions: "135cm de diâmetro",
    material: "100% Algodão",
    colors: [
      { name: "Cinza Pedra", hex: "#B0B0B0" },
      { name: "Bege Neutro", hex: "#D4C5B9" },
      { name: "Branco Natural", hex: "#FAFAFA" }
    ],
    careInstructions: "Lavar à máquina em água fria."
  }
];
