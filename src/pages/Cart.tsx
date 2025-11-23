import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";

const Cart = () => {
  const { items, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();

  const handleCheckout = () => {
    const phoneNumber = "5511986154656";
    const productList = items
      .map((item, index) => `${index + 1}. ${item.name} - ${item.quantity}x - R$ ${(item.price * item.quantity).toFixed(2)}`)
      .join("%0A");
    
    const total = getTotalPrice().toFixed(2);
    const message = `Olá! Gostaria de fazer um pedido:%0A%0A${productList}%0A%0ATotal: R$ ${total}%0A%0AAguardo retorno!`;
    
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto text-center p-8">
            <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Seu carrinho está vazio</h2>
            <p className="text-muted-foreground mb-6">Adicione produtos para começar suas compras!</p>
            <Button asChild className="bg-gradient-warm">
              <Link to="/colecao">Ver Coleção</Link>
            </Button>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-foreground mb-8">Meu Carrinho</h1>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.id} className="border-border">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-foreground">{item.name}</h3>
                            <p className="text-sm text-muted-foreground">{item.category}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => removeFromCart(item.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2 border border-border rounded-md">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-foreground w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-lg font-bold text-foreground">
                            R$ {(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="border-border sticky top-4">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-foreground mb-4">Resumo do Pedido</h2>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>R$ {getTotalPrice().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Frete</span>
                      <span className="text-green-600 font-medium">Grátis</span>
                    </div>
                    <div className="border-t border-border pt-3">
                      <div className="flex justify-between text-foreground font-bold text-lg">
                        <span>Total</span>
                        <span>R$ {getTotalPrice().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-gradient-warm hover:shadow-md transition-all mb-3"
                    onClick={handleCheckout}
                  >
                    Finalizar no WhatsApp
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={clearCart}
                  >
                    Limpar Carrinho
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Cart;
