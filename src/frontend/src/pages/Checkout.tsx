import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/CartContext";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useCreateCheckoutSession } from "@/hooks/useQueries";
import { Link } from "@tanstack/react-router";
import {
  CheckCircle,
  Copy,
  Loader2,
  Lock,
  Package,
  ShoppingBag,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface ShippingForm {
  name: string;
  email: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

const EMPTY_FORM: ShippingForm = {
  name: "",
  email: "",
  phone: "",
  addressLine: "",
  city: "",
  state: "",
  zip: "",
  country: "IN",
};

const UPI_ID = "s9059548@okhdfcbank";
const UPI_NAME = "crochetcomm";
const SHIPPING_CHARGE = 50;

export default function Checkout() {
  const { items, total } = useCart();
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const { actor } = useActor();
  const createSession = useCreateCheckoutSession();

  const [form, setForm] = useState<ShippingForm>(EMPTY_FORM);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState<bigint | null>(null);
  const [isHandlingReturn, setIsHandlingReturn] = useState(false);
  const handlingRef = useRef(false);
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "stripe">("upi");
  const [showUpiButtons, setShowUpiButtons] = useState(false);
  const [upiStep, setUpiStep] = useState<"select" | "confirm">("select");

  const grandTotal = total + SHIPPING_CHARGE;

  const searchParams = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : "",
  );
  const successParam = searchParams.get("success");
  const sessionId = searchParams.get("session_id");
  const pendingOrderRaw =
    typeof window !== "undefined"
      ? sessionStorage.getItem("pending_order")
      : null;

  useEffect(() => {
    if (
      successParam === "true" &&
      sessionId &&
      pendingOrderRaw &&
      actor &&
      !handlingRef.current
    ) {
      handlingRef.current = true;
      setIsHandlingReturn(true);
      const pending = JSON.parse(pendingOrderRaw);
      actor
        .placeOrder(pending)
        .then((orderId) => {
          actor.clearCart();
          sessionStorage.removeItem("pending_order");
          setConfirmedOrderId(orderId);
        })
        .catch(() =>
          toast.error("Could not confirm your order. Please contact support."),
        )
        .finally(() => {
          setIsHandlingReturn(false);
          handlingRef.current = false;
        });
    }
  }, [successParam, sessionId, pendingOrderRaw, actor]);

  const setField =
    (field: keyof ShippingForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleUpiConfirm = async () => {
    if (!actor) return;
    setIsProcessing(true);
    try {
      const orderId = await actor.placeOrder({
        email: form.email,
        shippingAddress: {
          name: form.name,
          addressLine: form.addressLine,
          city: form.city,
          state: form.state,
          zip: form.zip,
          country: form.country,
          phone: form.phone,
        },
        items: items.map((item) => ({
          productId: BigInt(item.product.id),
          quantity: BigInt(item.quantity),
        })),
      });
      await actor.clearCart();
      setConfirmedOrderId(orderId);
    } catch (err: any) {
      toast.error(
        err?.message ?? "Could not place order. Please contact support.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) {
      toast.error("Please log in to checkout.");
      return;
    }
    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    if (paymentMethod === "upi") {
      setShowUpiButtons(true);
      setUpiStep("select");
      return;
    }

    setIsProcessing(true);
    try {
      const shoppingItems = items.map((item) => ({
        productName: item.product.name,
        currency: "usd",
        quantity: BigInt(item.quantity),
        priceInCents: BigInt(Math.round(item.product.price * 100)),
        productDescription: item.product.description ?? item.product.name,
      }));
      const origin = window.location.origin;
      const successUrl = `${origin}/checkout?success=true&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${origin}/checkout`;
      const pendingOrder = {
        email: form.email,
        shippingAddress: {
          name: form.name,
          addressLine: form.addressLine,
          city: form.city,
          state: form.state,
          zip: form.zip,
          country: form.country,
          phone: form.phone,
        },
        items: items.map((item) => ({
          productId: String(item.product.id),
          quantity: String(item.quantity),
        })),
      };
      sessionStorage.setItem("pending_order", JSON.stringify(pendingOrder));
      const stripeUrl = await createSession.mutateAsync({
        items: shoppingItems,
        successUrl,
        cancelUrl,
      });
      window.location.href = stripeUrl;
    } catch (err: any) {
      toast.error(
        err?.message ?? "Failed to create checkout session. Please try again.",
      );
      setIsProcessing(false);
    }
  };

  if (confirmedOrderId !== null) {
    return (
      <main
        className="min-h-screen flex items-center justify-center px-4 py-20"
        data-ocid="checkout.page"
      >
        <Card
          className="max-w-md w-full text-center rounded-3xl shadow-card"
          data-ocid="checkout.success_state"
        >
          <CardContent className="pt-10 pb-10 flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-2xl font-black">Order Confirmed! 🎉</h1>
            <p className="text-muted-foreground">
              Your crochet goodies are on their way! 🧶💕
            </p>
            <div className="bg-muted/50 rounded-xl px-6 py-3 text-sm font-mono">
              Order #{String(confirmedOrderId)}
            </div>
            <p className="text-sm text-muted-foreground">
              We'll send shipping updates to <strong>{form.email}</strong>
            </p>
            <div className="flex gap-3 mt-2">
              <Link to="/shop">
                <Button
                  className="rounded-full font-bold"
                  data-ocid="checkout.primary_button"
                >
                  Continue Shopping
                </Button>
              </Link>
              <Link to="/my-orders">
                <Button
                  variant="outline"
                  className="rounded-full font-bold"
                  data-ocid="checkout.secondary_button"
                >
                  View My Orders
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (isHandlingReturn) {
    return (
      <main
        className="min-h-screen flex items-center justify-center"
        data-ocid="checkout.loading_state"
      >
        <div className="text-center flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="font-semibold text-lg">Confirming your order… 💕</p>
        </div>
      </main>
    );
  }

  if (!identity) {
    return (
      <main
        className="min-h-screen flex items-center justify-center px-4 py-20"
        data-ocid="checkout.page"
      >
        <Card className="max-w-sm w-full text-center rounded-3xl shadow-card">
          <CardHeader>
            <div className="text-5xl mb-2">🔐</div>
            <CardTitle className="text-2xl font-black">
              Login to Checkout
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-muted-foreground">
              Please log in to place your order and track your purchases.
            </p>
            <Button
              className="rounded-full font-bold"
              onClick={login}
              disabled={isLoggingIn}
              data-ocid="checkout.primary_button"
            >
              {isLoggingIn ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Lock className="w-4 h-4 mr-2" />
              )}
              {isLoggingIn ? "Logging in…" : "Login to Continue"}
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main
        className="min-h-screen flex items-center justify-center px-4 py-20"
        data-ocid="checkout.page"
      >
        <Card className="max-w-sm w-full text-center rounded-3xl shadow-card">
          <CardContent className="pt-10 pb-10 flex flex-col items-center gap-4">
            <span className="text-6xl">🧶</span>
            <h2 className="text-xl font-black">Your cart is empty</h2>
            <p className="text-muted-foreground">
              Add some cozy items before checking out!
            </p>
            <Link to="/shop">
              <Button
                className="rounded-full font-bold"
                data-ocid="checkout.primary_button"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Browse Shop
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  const gpayLink = `tez://upi/pay?pa=${UPI_ID}&pn=${UPI_NAME}&am=${grandTotal.toFixed(2)}&cu=INR`;
  const phonepeLink = `phonepe://pay?pa=${UPI_ID}&pn=${UPI_NAME}&am=${grandTotal.toFixed(2)}&cu=INR`;
  const paytmLink = `paytmmp://pay?pa=${UPI_ID}&pn=${UPI_NAME}&am=${grandTotal.toFixed(2)}&cu=INR`;

  return (
    <main className="min-h-screen py-12 px-4" data-ocid="checkout.page">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-widest text-primary mb-1">
            crochetcomm
          </p>
          <h1 className="text-3xl sm:text-4xl font-black">Checkout 🛍️</h1>
          <p className="text-muted-foreground mt-1">
            Almost there! Fill in your details and choose a payment method.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="rounded-3xl shadow-card">
              <CardHeader>
                <CardTitle className="text-xl font-black flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4"
                  data-ocid="checkout.modal"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="Jane Doe"
                        value={form.name}
                        onChange={setField("name")}
                        className="mt-1 rounded-xl"
                        required
                        data-ocid="checkout.input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="jane@example.com"
                        value={form.email}
                        onChange={setField("email")}
                        className="mt-1 rounded-xl"
                        required
                        data-ocid="checkout.input"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={form.phone}
                      onChange={setField("phone")}
                      className="mt-1 rounded-xl"
                      required
                      data-ocid="checkout.input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="addressLine">Street Address</Label>
                    <Input
                      id="addressLine"
                      placeholder="123 Cozy Lane"
                      value={form.addressLine}
                      onChange={setField("addressLine")}
                      className="mt-1 rounded-xl"
                      required
                      data-ocid="checkout.input"
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        placeholder="Mumbai"
                        value={form.city}
                        onChange={setField("city")}
                        className="mt-1 rounded-xl"
                        required
                        data-ocid="checkout.input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State / Province</Label>
                      <Input
                        id="state"
                        placeholder="MH"
                        value={form.state}
                        onChange={setField("state")}
                        className="mt-1 rounded-xl"
                        required
                        data-ocid="checkout.input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="zip">ZIP / Postal Code</Label>
                      <Input
                        id="zip"
                        placeholder="400001"
                        value={form.zip}
                        onChange={setField("zip")}
                        className="mt-1 rounded-xl"
                        required
                        data-ocid="checkout.input"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      placeholder="IN"
                      value={form.country}
                      onChange={setField("country")}
                      className="mt-1 rounded-xl"
                      required
                      data-ocid="checkout.input"
                    />
                  </div>

                  {/* Payment Method Selection */}
                  <div className="pt-2">
                    <Label className="text-base font-bold mb-3 block">
                      💳 Payment Method
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentMethod("upi");
                          setShowUpiButtons(false);
                        }}
                        className={`rounded-2xl border-2 p-4 text-left transition-all ${
                          paymentMethod === "upi"
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-muted bg-muted/20 hover:border-primary/40"
                        }`}
                        data-ocid="checkout.toggle"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">📱</span>
                          <span className="font-bold text-sm">UPI (India)</span>
                          {paymentMethod === "upi" && (
                            <span className="ml-auto text-xs bg-primary text-white rounded-full px-2 py-0.5">
                              Selected
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          GPay, PhonePe, Paytm
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPaymentMethod("stripe");
                          setShowUpiButtons(false);
                        }}
                        className={`rounded-2xl border-2 p-4 text-left transition-all ${
                          paymentMethod === "stripe"
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-muted bg-muted/20 hover:border-primary/40"
                        }`}
                        data-ocid="checkout.toggle"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">🌍</span>
                          <span className="font-bold text-sm">
                            Stripe (International)
                          </span>
                          {paymentMethod === "stripe" && (
                            <span className="ml-auto text-xs bg-primary text-white rounded-full px-2 py-0.5">
                              Selected
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Credit / Debit Card
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* UPI Payment Panel */}
                  {paymentMethod === "upi" && showUpiButtons && (
                    <div
                      className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-5 space-y-4"
                      data-ocid="checkout.panel"
                    >
                      <div className="text-center">
                        <p className="font-bold text-base">
                          Pay via UPI App 🎉
                        </p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          Pay ₹{grandTotal.toFixed(2)} to {UPI_ID}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          (includes ₹{SHIPPING_CHARGE} shipping)
                        </p>
                      </div>

                      {upiStep === "select" && (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <a
                              href={gpayLink}
                              onClick={() => setUpiStep("confirm")}
                              className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-blue-400 bg-white py-4 px-3 font-bold text-blue-600 hover:bg-blue-50 transition-all shadow-sm text-sm"
                              data-ocid="checkout.primary_button"
                            >
                              <span className="text-2xl">🔵</span>
                              <span>G Pay</span>
                            </a>
                            <a
                              href={phonepeLink}
                              onClick={() => setUpiStep("confirm")}
                              className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-purple-600 py-4 px-3 font-bold text-white hover:bg-purple-700 transition-all shadow-sm text-sm"
                              data-ocid="checkout.primary_button"
                            >
                              <span className="text-2xl">💜</span>
                              <span>PhonePe</span>
                            </a>
                            <a
                              href={paytmLink}
                              onClick={() => setUpiStep("confirm")}
                              className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-blue-500 py-4 px-3 font-bold text-white hover:bg-blue-600 transition-all shadow-sm text-sm"
                              data-ocid="checkout.primary_button"
                            >
                              <span className="text-2xl">💙</span>
                              <span>Paytm</span>
                            </a>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground mb-1.5">
                              Or pay directly using UPI ID:
                            </p>
                            <div className="flex items-center gap-2 bg-white border border-muted rounded-xl px-3 py-2">
                              <span className="font-mono text-sm flex-1 select-all">
                                {UPI_ID}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(UPI_ID);
                                  toast.success("UPI ID copied!");
                                }}
                                className="text-muted-foreground hover:text-primary transition-colors p-1 rounded"
                                data-ocid="checkout.secondary_button"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <p className="text-xs text-center text-muted-foreground">
                            After paying in your UPI app, come back and click
                            "I've Completed Payment" below.
                          </p>

                          <Button
                            type="button"
                            variant="outline"
                            className="w-full rounded-full font-bold border-primary text-primary hover:bg-primary/10"
                            onClick={() => setUpiStep("confirm")}
                            data-ocid="checkout.secondary_button"
                          >
                            I've paid – Confirm Order ✅
                          </Button>
                        </>
                      )}

                      {upiStep === "confirm" && (
                        <div className="rounded-2xl bg-green-50 border border-green-200 p-4 flex flex-col items-center gap-3 text-center">
                          <span className="text-3xl">✅</span>
                          <p className="font-bold text-green-800">
                            After completing payment in your UPI app, click the
                            button below to confirm your order.
                          </p>
                          <Button
                            type="button"
                            className="w-full rounded-full font-bold bg-green-600 hover:bg-green-700 text-white mt-1"
                            onClick={handleUpiConfirm}
                            disabled={isProcessing}
                            data-ocid="checkout.confirm_button"
                          >
                            {isProcessing ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : null}
                            {isProcessing
                              ? "Confirming…"
                              : "✅ I've Completed Payment"}
                          </Button>
                          <button
                            type="button"
                            className="text-xs text-muted-foreground underline"
                            onClick={() => setUpiStep("select")}
                          >
                            ← Go back
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Submit / Proceed button */}
                  {paymentMethod === "upi" ? (
                    !showUpiButtons ? (
                      <Button
                        type="submit"
                        className="w-full rounded-full font-bold text-base py-6 mt-2"
                        disabled={isProcessing}
                        data-ocid="checkout.submit_button"
                      >
                        <span className="mr-2">📱</span>
                        Proceed to Pay via UPI – ₹{grandTotal.toFixed(2)}
                      </Button>
                    ) : null
                  ) : (
                    <Button
                      type="submit"
                      className="w-full rounded-full font-bold text-base py-6 mt-2"
                      disabled={isProcessing || createSession.isPending}
                      data-ocid="checkout.submit_button"
                    >
                      {isProcessing || createSession.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Lock className="w-4 h-4 mr-2" />
                      )}
                      {isProcessing || createSession.isPending
                        ? "Redirecting to Stripe…"
                        : `Pay ₹${grandTotal.toFixed(2)} Securely 💳`}
                    </Button>
                  )}

                  <p className="text-xs text-center text-muted-foreground">
                    {paymentMethod === "upi"
                      ? "🔒 UPI payments are processed securely through your bank."
                      : "🔒 Payments processed securely by Stripe. crochetcomm never stores your card details."}
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="rounded-3xl shadow-card sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg font-black">
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item, idx) => (
                  <div
                    key={item.product.id}
                    className="flex items-center gap-3"
                    data-ocid={`checkout.item.${idx + 1}`}
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-black">
                      ₹{(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Subtotal
                  </span>
                  <span className="font-bold">₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Shipping
                  </span>
                  <span className="text-sm font-semibold">
                    ₹{SHIPPING_CHARGE.toFixed(2)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-black">Total</span>
                  <span className="font-black text-xl">
                    ₹{grandTotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-xl p-3">
                  <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                  {paymentMethod === "upi"
                    ? "Secure UPI payment via your bank"
                    : "Secure checkout powered by Stripe"}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
