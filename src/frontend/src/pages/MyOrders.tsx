import { OrderStatus } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useGetMyOrders } from "@/hooks/useQueries";
import { Link } from "@tanstack/react-router";
import { Loader2, Lock, Package, ShoppingBag } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  [OrderStatus.pending]: "bg-amber-100 text-amber-700 border-amber-200",
  [OrderStatus.paid]: "bg-blue-100 text-blue-700 border-blue-200",
  [OrderStatus.shipped]: "bg-purple-100 text-purple-700 border-purple-200",
  [OrderStatus.delivered]: "bg-green-100 text-green-700 border-green-200",
};

const STATUS_EMOJI: Record<string, string> = {
  [OrderStatus.pending]: "⏳",
  [OrderStatus.paid]: "💳",
  [OrderStatus.shipped]: "📦",
  [OrderStatus.delivered]: "✅",
};

function formatDate(nanoTimestamp: bigint) {
  const ms = Number(nanoTimestamp) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function MyOrders() {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const { data: orders = [], isLoading } = useGetMyOrders();

  if (!identity) {
    return (
      <main
        className="min-h-screen flex items-center justify-center px-4 py-20"
        data-ocid="my_orders.page"
      >
        <Card className="max-w-sm w-full text-center rounded-3xl shadow-card">
          <CardHeader>
            <div className="text-5xl mb-2">🔐</div>
            <CardTitle className="text-2xl font-black">
              View Your Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-muted-foreground">
              Please log in to see your order history.
            </p>
            <Button
              className="rounded-full font-bold"
              onClick={login}
              disabled={isLoggingIn}
              data-ocid="my_orders.primary_button"
            >
              {isLoggingIn ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Lock className="w-4 h-4 mr-2" />
              )}
              {isLoggingIn ? "Logging in…" : "Login to View Orders"}
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main
        className="min-h-screen flex items-center justify-center"
        data-ocid="my_orders.loading_state"
      >
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium">
            Loading your orders…
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-12 px-4" data-ocid="my_orders.page">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-widest text-primary mb-1">
            crochet.comm_
          </p>
          <h1 className="text-3xl sm:text-4xl font-black flex items-center gap-3">
            <Package className="w-8 h-8" />
            My Orders
          </h1>
          <p className="text-muted-foreground mt-1">
            Track all your cozy crochet purchases 🧶
          </p>
        </div>

        {orders.length === 0 ? (
          <Card
            className="rounded-3xl shadow-card"
            data-ocid="my_orders.empty_state"
          >
            <CardContent className="pt-16 pb-16 flex flex-col items-center gap-4">
              <span className="text-6xl">🧶</span>
              <h2 className="text-xl font-black">No orders yet</h2>
              <p className="text-muted-foreground text-center">
                You haven't placed any orders. Start shopping for something
                cozy!
              </p>
              <Link to="/shop">
                <Button
                  className="rounded-full font-bold"
                  data-ocid="my_orders.primary_button"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Browse Shop
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-6">
            {orders.map((order, idx) => (
              <Card
                key={String(order.id)}
                className="rounded-3xl shadow-card"
                data-ocid={`my_orders.item.${idx + 1}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-xs text-muted-foreground font-mono">
                        Order #{String(order.id)}
                      </p>
                      <p className="font-black text-lg mt-0.5">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <Badge
                      className={`rounded-full font-bold text-xs px-3 py-1 border ${
                        STATUS_STYLES[order.status] ??
                        "bg-muted text-muted-foreground"
                      }`}
                      variant="outline"
                    >
                      {STATUS_EMOJI[order.status] ?? ""}{" "}
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/40 rounded-xl p-4 text-sm">
                    <p className="font-bold mb-1">📍 Shipping to</p>
                    <p className="text-muted-foreground">
                      {order.shippingAddress.name}
                    </p>
                    <p className="text-muted-foreground">
                      {order.shippingAddress.addressLine}
                    </p>
                    <p className="text-muted-foreground">
                      {order.shippingAddress.city},{" "}
                      {order.shippingAddress.state} {order.shippingAddress.zip}
                    </p>
                    <p className="text-muted-foreground">
                      {order.shippingAddress.country}
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <p className="font-bold text-sm mb-2">
                      Items ({order.items.length})
                    </p>
                    <div className="flex flex-col gap-2">
                      {order.items.map((item, iIdx) => (
                        <div
                          key={`${String(order.id)}-${iIdx}`}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-muted-foreground">
                            Product #{String(item.productId)}
                          </span>
                          <span className="font-semibold">
                            × {String(item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    📧 Confirmation sent to {order.email}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
