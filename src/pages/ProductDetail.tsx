import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Heart, ShoppingCart, Star, Truck, Shield, RotateCcw } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { products } from "@/data/products";
import { useState } from "react";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const [selectedColor, setSelectedColor] = useState<string>("");
  
  const product = products.find(p => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Produto não encontrado</h1>
          <Button asChild>
            <Link to="/colecao">Voltar para Coleção</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <Button asChild variant="ghost" className="mb-4">
          <Link to="/colecao">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Coleção
          </Link>
        </Button>
      </div>

      {/* Product Detail */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Image */}
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-2xl shadow-warm">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-[500px] object-cover"
                />
                {discount > 0 && (
                  <Badge variant="destructive" className="absolute top-4 left-4">
                    -{discount}%
                  </Badge>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <Badge variant="outline" className="mb-3">
                  {product.category}
                </Badge>
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                  {product.name}
                </h1>
                
                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${i < product.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">({product.reviews} avaliações)</span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl font-bold text-foreground">
                    R$ {product.price.toFixed(2)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-lg text-muted-foreground line-through">
                      R$ {product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Descrição</h3>
                <p className="text-muted-foreground">{product.description}</p>
              </div>

              {/* Specifications */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-foreground mb-1">Dimensões</h4>
                  <p className="text-sm text-muted-foreground">{product.dimensions}</p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">Material</h4>
                  <p className="text-sm text-muted-foreground">{product.material}</p>
                </div>
              </div>

              {/* Colors */}
              <div>
                <h4 className="font-medium text-foreground mb-3">Cores Disponíveis</h4>
                <RadioGroup value={selectedColor} onValueChange={setSelectedColor} className="flex gap-3">
                  {product.colors.map((color) => (
                    <div key={color.name} className="flex flex-col items-center gap-1">
                      <RadioGroupItem
                        value={color.name}
                        id={color.name}
                        className="sr-only"
                      />
                      <Label
                        htmlFor={color.name}
                        className="cursor-pointer"
                      >
                        <div
                          className={`w-10 h-10 rounded-full border-2 transition-all ${
                            selectedColor === color.name
                              ? 'border-primary scale-110 shadow-lg'
                              : 'border-border hover:border-primary/50'
                          }`}
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        />
                      </Label>
                      <span className="text-xs text-muted-foreground">{color.name}</span>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <Button 
                  size="lg" 
                  className="flex-1 bg-gradient-warm hover:shadow-md transition-all"
                  onClick={() => addToCart({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    category: product.category
                  })}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Adicionar ao Carrinho
                </Button>
                <Button variant="outline" size="lg">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
                <Card className="border-border">
                  <CardContent className="p-4 text-center">
                    <Truck className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground">Frete Grátis</p>
                    <p className="text-xs text-muted-foreground">Acima de R$ 150</p>
                  </CardContent>
                </Card>
                <Card className="border-border">
                  <CardContent className="p-4 text-center">
                    <Shield className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground">Garantia</p>
                    <p className="text-xs text-muted-foreground">90 dias</p>
                  </CardContent>
                </Card>
                <Card className="border-border">
                  <CardContent className="p-4 text-center">
                    <RotateCcw className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground">Troca Fácil</p>
                    <p className="text-xs text-muted-foreground">30 dias</p>
                  </CardContent>
                </Card>
              </div>

              {/* Care Instructions */}
              <div>
                <h4 className="font-medium text-foreground mb-2">Cuidados</h4>
                <p className="text-sm text-muted-foreground">{product.careInstructions}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProductDetail;