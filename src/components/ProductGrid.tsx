import { ProductCard } from "./ProductCard";
import rug1 from "@/assets/rug-1.jpg";
import rug2 from "@/assets/rug-2.jpg";
import rug3 from "@/assets/rug-3.jpg";

const products = [
  {
    id: "1",
    name: "Tapete Redondo Mandala",
    price: 89.90,
    originalPrice: 120.00,
    image: rug1,
    rating: 5,
    reviews: 23,
    category: "Redondo",
    isFavorite: false
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
    isFavorite: true
  },
  {
    id: "3",
    name: "Tapete Oval Flores",
    price: 134.90,
    image: rug3,
    rating: 5,
    reviews: 31,
    category: "Oval",
    isFavorite: false
  },
  {
    id: "4",
    name: "Tapete Redondo Clássico",
    price: 78.90,
    originalPrice: 95.00,
    image: rug1,
    rating: 4,
    reviews: 15,
    category: "Redondo",
    isFavorite: false
  },
  {
    id: "5",
    name: "Tapete Geométrico Premium",
    price: 198.90,
    image: rug2,
    rating: 5,
    reviews: 42,
    category: "Retangular",
    isFavorite: true
  },
  {
    id: "6",
    name: "Tapete Oval Vintage",
    price: 145.50,
    originalPrice: 175.00,
    image: rug3,
    rating: 4,
    reviews: 27,
    category: "Oval",
    isFavorite: false
  }
];

export const ProductGrid = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Nossa Coleção
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Cada tapete é uma obra de arte única, criada com dedicação e paixão. 
            Descubra peças que transformarão sua casa em um lar ainda mais acolhedor.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
        
        <div className="text-center mt-12">
          <button className="px-8 py-3 bg-gradient-warm text-primary-foreground rounded-lg hover:shadow-warm transition-all">
            Ver Todos os Produtos
          </button>
        </div>
      </div>
    </section>
  );
};