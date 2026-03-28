import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/CartContext";
import { useNavigate } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, total, count } =
    useCart();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleCheckout = () => {
    closeCart();
    navigate({ to: "/checkout" });
  };

  return (
    <>
      {/* Overlay */}
      <div
        role="button"
        tabIndex={0}
        className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 cursor-default"
        onClick={closeCart}
        onKeyDown={(e) => e.key === "Escape" && closeCart()}
        aria-label="Close cart"
      />

      {/* Drawer */}
      <div
        className="cart-drawer fixed right-0 top-0 h-full w-full max-w-md bg-card shadow-2xl z-50 flex flex-col"
        data-ocid="cart.modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            <h2 className="font-black text-lg">Your Cart</h2>
            {count > 0 && (
              <span className="bg-accent text-foreground text-xs font-bold rounded-full px-2 py-0.5">
                {count}
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeCart}
            data-ocid="cart.close_button"
            className="rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Items */}
        {items.length === 0 ? (
          <div
            className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground p-8"
            data-ocid="cart.empty_state"
          >
            <span className="text-6xl">🧶</span>
            <p className="font-semibold text-center">Your cart is empty!</p>
            <p className="text-sm text-center">
              Add some cozy items to get started 💕
            </p>
            <Button
              onClick={closeCart}
              className="rounded-full font-bold"
              data-ocid="cart.cancel_button"
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-5 py-4">
              <div className="flex flex-col gap-4">
                {items.map((item, idx) => (
                  <div
                    key={item.product.id}
                    className="flex gap-4 items-center"
                    data-ocid={`cart.item.${idx + 1}`}
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ₹{item.product.price.toFixed(2)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="w-6 h-6 rounded-full"
                          onClick={() => updateQty(item.product.id, -1)}
                          data-ocid={`cart.item.${idx + 1}.toggle`}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="text-sm font-bold w-6 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="w-6 h-6 rounded-full"
                          onClick={() => updateQty(item.product.id, 1)}
                          data-ocid={`cart.item.${idx + 1}.toggle`}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="font-black text-sm">
                        ₹{(item.product.price * item.quantity).toFixed(2)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 rounded-full text-destructive hover:bg-destructive/10"
                        onClick={() => removeItem(item.product.id)}
                        data-ocid={`cart.item.${idx + 1}.delete_button`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-5 border-t border-border flex flex-col gap-4">
              <p className="text-xs text-center text-muted-foreground">
                Made with care 💕 | Secure payment via Stripe ✨ | Fast shipping
                🌸
              </p>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="font-bold">Total</span>
                <span className="font-black text-xl">₹{total.toFixed(2)}</span>
              </div>
              <Button
                className="w-full rounded-full font-bold text-base py-6"
                onClick={handleCheckout}
                data-ocid="cart.confirm_button"
              >
                Proceed to Checkout 💖
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
