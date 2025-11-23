import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, Grid3X3, LayoutList } from "lucide-react";
import { useState } from "react";
import { products as allProducts } from "@/data/products";

const categories = ["Todos", "Redondo", "Retangular", "Oval"];

const Collection = () => {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredProducts = selectedCategory === "Todos" 
    ? allProducts 
    : allProducts.filter(product => product.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Page Header */}
      <section className="bg-gradient-subtle py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Nossa Coleção Completa
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore todos os nossos tapetes artesanais. Cada peça é única e feita com amor, 
              perfeita para transformar qualquer ambiente em um espaço acolhedor.
            </p>
          </div>
        </div>
      </section>

      {/* Filters and Controls */}
      <section className="py-8 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className={`cursor-pointer px-4 py-2 ${
                    selectedCategory === category 
                      ? "bg-gradient-warm text-primary-foreground" 
                      : "hover:bg-accent"
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>

            {/* View Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "bg-accent" : ""}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-accent" : ""}
              >
                <LayoutList className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <p className="text-muted-foreground">
              {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
              {selectedCategory !== "Todos" && ` na categoria "${selectedCategory}"`}
            </p>
          </div>

          <div className={`grid gap-6 ${
            viewMode === "grid" 
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
              : "grid-cols-1 md:grid-cols-2"
          }`}>
            {filteredProducts.map((product) => (
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

          {/* Load More */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Carregar Mais Produtos
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Collection;