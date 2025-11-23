import { ProductCard } from "./ProductCard";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { products } from "@/data/products";

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
          {products.slice(0, 6).map((product) => (
            <ProductCard 
              key={product.id} 
              id={product.id}
              name={product.name}
              price={product.price}
              originalPrice={product.originalPrice}
              image={product.image}
              rating={product.rating}
              reviews={product.reviews}
              category={product.category}
              isFavorite={false}
            />
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button asChild className="px-8 py-3 bg-gradient-warm text-primary-foreground rounded-lg hover:shadow-warm transition-all">
            <Link to="/colecao">Ver Todos os Produtos</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};