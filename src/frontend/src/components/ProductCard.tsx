import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import type { LocalProduct } from "@/data/products";
import { ShoppingBag, Star } from "lucide-react";
import { useState } from "react";

interface ProductCardProps {
  product: LocalProduct;
  index?: number;
}

export default function ProductCard({ product, index = 1 }: ProductCardProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div
      className="product-card bg-card rounded-2xl overflow-hidden shadow-card flex flex-col"
      data-ocid={`shop.item.${index}`}
    >
      <div className="relative overflow-hidden aspect-square">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1">
          <Star className="w-3 h-3 fill-star text-star" />
          <span className="text-xs font-bold">{product.rating.toFixed(1)}</span>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {product.category}
        </span>
        <h3 className="font-bold text-base text-foreground leading-tight">
          {product.name}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed flex-1">
          {product.description}
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className="font-black text-lg text-foreground">
            ₹{product.price.toFixed(2)}
          </span>
          <Button
            size="sm"
            onClick={handleAdd}
            className={`add-to-cart-btn rounded-full font-bold text-xs gap-1.5 transition-all ${
              added ? "bg-accent text-foreground" : ""
            }`}
            data-ocid={`shop.item.${index}.button`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="cart-heart">
              {added ? "Added! 💖" : "Add to Cart"}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
