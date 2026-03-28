import { ExternalBlob, OrderStatus } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  useAddProduct,
  useGetAllOrders,
  useGetAllReviews,
  useGetProducts,
  useIsCallerAdmin,
  useIsStripeConfigured,
  useRemoveProduct,
  useSetStripeConfiguration,
  useUpdateOrderStatus,
} from "@/hooks/useQueries";
import { useQueryClient } from "@tanstack/react-query";
import {
  CreditCard,
  Loader2,
  Lock,
  Package,
  ShoppingBag,
  Star,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const ADMIN_PASSWORD = "3753";

const STATUS_STYLES: Record<string, string> = {
  [OrderStatus.pending]: "bg-amber-100 text-amber-700 border-amber-200",
  [OrderStatus.paid]: "bg-blue-100 text-blue-700 border-blue-200",
  [OrderStatus.shipped]: "bg-purple-100 text-purple-700 border-purple-200",
  [OrderStatus.delivered]: "bg-green-100 text-green-700 border-green-200",
};

function formatDate(nanoTimestamp: bigint) {
  const ms = Number(nanoTimestamp) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function Admin() {
  const { login, identity, isLoggingIn } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const qc = useQueryClient();

  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: products = [], isLoading: productsLoading } = useGetProducts();
  const { data: reviews = [], isLoading: reviewsLoading } = useGetAllReviews();
  const { data: orders = [], isLoading: ordersLoading } = useGetAllOrders();
  const { data: stripeConfigured } = useIsStripeConfigured();

  const addProduct = useAddProduct();
  const removeProduct = useRemoveProduct();
  const updateOrderStatus = useUpdateOrderStatus();
  const setStripeConfig = useSetStripeConfiguration();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [autoSettingAdmin, setAutoSettingAdmin] = useState(false);
  const [claimingAdmin, setClaimingAdmin] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [stripeKey, setStripeKey] = useState("");
  const [stripeSaving, setStripeSaving] = useState(false);

  // Password gate
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [passwordUnlocked, setPasswordUnlocked] = useState(
    () => sessionStorage.getItem("adminUnlocked") === "yes",
  );

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      sessionStorage.setItem("adminUnlocked", "yes");
      setPasswordUnlocked(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
      setPasswordInput("");
    }
  };

  // After password unlocked + identity available, claim admin by password
  useEffect(() => {
    if (
      !identity ||
      !passwordUnlocked ||
      !actor ||
      actorFetching ||
      isAdmin ||
      adminLoading ||
      claimingAdmin
    )
      return;
    setClaimingAdmin(true);
    actor
      .claimAdminByPassword(ADMIN_PASSWORD)
      .then(() => qc.invalidateQueries({ queryKey: ["isAdmin"] }))
      .catch(() => {})
      .finally(() => setClaimingAdmin(false));
  }, [
    identity,
    passwordUnlocked,
    actor,
    actorFetching,
    isAdmin,
    adminLoading,
    claimingAdmin,
    qc,
  ]);

  // Legacy: auto-set admin via token in URL
  useEffect(() => {
    if (
      !actor ||
      !identity ||
      isAdmin ||
      adminLoading ||
      autoSettingAdmin ||
      claimingAdmin
    )
      return;
    // Only attempt if no password flow is active
    if (passwordUnlocked) return;
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get("caffeineAdminToken");
    if (!token) return;
    setAutoSettingAdmin(true);
    actor
      ._initializeAccessControlWithSecret(token)
      .then(() => qc.invalidateQueries({ queryKey: ["isAdmin"] }))
      .catch(() => {})
      .finally(() => setAutoSettingAdmin(false));
  }, [
    actor,
    identity,
    isAdmin,
    adminLoading,
    autoSettingAdmin,
    claimingAdmin,
    passwordUnlocked,
    qc,
  ]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      toast.error("Please select an image.");
      return;
    }
    try {
      const bytes = new Uint8Array(await imageFile.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((p) =>
        setUploadProgress(p),
      );
      await addProduct.mutateAsync({
        name,
        description,
        price: Number.parseFloat(price),
        category,
        image: blob,
      });
      toast.success("Product added! 🧶");
      setName("");
      setDescription("");
      setPrice("");
      setCategory("");
      setImageFile(null);
      setImagePreview(null);
      setUploadProgress(0);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err: any) {
      toast.error(`Failed: ${err?.message ?? "Unknown error"}`);
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await removeProduct.mutateAsync(id);
      toast.success("Product removed.");
    } catch {
      toast.error("Could not remove product.");
    }
  };

  const handleSaveStripe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripeKey.trim()) {
      toast.error("Enter a Stripe secret key.");
      return;
    }
    setStripeSaving(true);
    try {
      await setStripeConfig.mutateAsync({
        secretKey: stripeKey.trim(),
        allowedCountries: ["US", "CA", "GB", "AU", "PH"],
      });
      toast.success("Stripe configured! Payments are now enabled. 💳");
      setStripeKey("");
    } catch (err: any) {
      toast.error(`Failed: ${err?.message ?? "Unknown error"}`);
    } finally {
      setStripeSaving(false);
    }
  };

  // Step 1: Password gate
  if (!passwordUnlocked) {
    return (
      <main
        className="min-h-screen flex items-center justify-center px-4 py-20"
        data-ocid="admin.page"
      >
        <Card className="max-w-sm w-full text-center rounded-3xl shadow-card">
          <CardHeader>
            <div className="text-5xl mb-2">🔐</div>
            <CardTitle className="text-2xl font-black">Admin Panel</CardTitle>
            <p className="text-sm text-muted-foreground font-medium mt-1">
              Enter your password to continue
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError(false);
                  }}
                  className={`pl-9 rounded-xl text-center tracking-widest text-lg font-bold ${
                    passwordError ? "border-red-400 bg-red-50" : ""
                  }`}
                  autoFocus
                  data-ocid="admin.password_input"
                />
              </div>
              {passwordError && (
                <p className="text-sm text-red-500 font-medium">
                  Wrong password. Try again.
                </p>
              )}
              <Button
                type="submit"
                className="rounded-full font-bold w-full"
                data-ocid="admin.password_submit"
              >
                Open Admin Panel 🗝️
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    );
  }

  // Step 2: Wait for Internet Identity login
  if (!identity) {
    return (
      <main
        className="min-h-screen flex items-center justify-center px-4 py-20"
        data-ocid="admin.page"
      >
        <Card className="max-w-sm w-full text-center rounded-3xl shadow-card">
          <CardHeader>
            <div className="text-5xl mb-2">✅</div>
            <CardTitle className="text-2xl font-black">
              Password Correct!
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-muted-foreground font-medium">
              One more tap to verify it's you and open the panel.
            </p>
            <Button
              className="rounded-full font-bold"
              onClick={login}
              disabled={isLoggingIn}
              data-ocid="admin.primary_button"
            >
              {isLoggingIn ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {isLoggingIn ? "Opening…" : "Open My Admin Panel 🚀"}
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  // Step 3: Claiming admin / loading
  if (adminLoading || autoSettingAdmin || claimingAdmin) {
    return (
      <main
        className="min-h-screen flex flex-col items-center justify-center gap-3"
        data-ocid="admin.loading_state"
      >
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">
          Opening your admin panel…
        </p>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main
        className="min-h-screen flex items-center justify-center px-4 py-20"
        data-ocid="admin.page"
      >
        <Card className="max-w-sm w-full text-center rounded-3xl shadow-card">
          <CardHeader>
            <div className="text-5xl mb-2">🔒</div>
            <CardTitle className="text-2xl font-black">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground font-medium">
              You don't have admin access. Only the store owner can access this
              panel.
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-12 px-4" data-ocid="admin.page">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <p className="text-sm font-bold uppercase tracking-widest text-primary mb-1">
            Store Management
          </p>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground">
            Admin Panel 🛠️
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, store owner! ✨
          </p>
        </div>

        <Tabs defaultValue="products">
          <TabsList className="rounded-full mb-8 bg-muted p-1 flex-wrap h-auto gap-1">
            <TabsTrigger
              value="products"
              className="rounded-full font-bold px-5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              data-ocid="admin.products.tab"
            >
              <Package className="w-4 h-4 mr-2" />
              Products
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="rounded-full font-bold px-5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              data-ocid="admin.orders.tab"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="rounded-full font-bold px-5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              data-ocid="admin.reviews.tab"
            >
              <Star className="w-4 h-4 mr-2" />
              Reviews
            </TabsTrigger>
            <TabsTrigger
              value="stripe"
              className="rounded-full font-bold px-5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              data-ocid="admin.stripe.tab"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Payments
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-8">
            <Card className="rounded-3xl shadow-card">
              <CardHeader>
                <CardTitle className="text-xl font-black">
                  Add New Product 🧶
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddProduct} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="p-name">Product Name</Label>
                      <Input
                        id="p-name"
                        placeholder="e.g. Bunny Amigurumi"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 rounded-xl"
                        required
                        data-ocid="admin.products.input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="p-price">Price (₹)</Label>
                      <Input
                        id="p-price"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="e.g. 18.99"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="mt-1 rounded-xl"
                        required
                        data-ocid="admin.products.input"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="p-description">Description</Label>
                    <Textarea
                      id="p-description"
                      placeholder="Describe your product..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="mt-1 rounded-xl resize-none"
                      rows={2}
                      required
                      data-ocid="admin.products.textarea"
                    />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select
                      value={category}
                      onValueChange={setCategory}
                      required
                    >
                      <SelectTrigger
                        className="mt-1 rounded-xl"
                        data-ocid="admin.products.select"
                      >
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {["Toys", "Flowers", "Clothing", "Accessories"].map(
                          (c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="p-image">Product Image</Label>
                    <div className="mt-1 flex items-start gap-4">
                      <label
                        htmlFor="p-image"
                        className="flex-1 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:border-primary transition-colors"
                        data-ocid="admin.products.dropzone"
                      >
                        <Upload className="w-6 h-6 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground font-medium">
                          {imageFile ? imageFile.name : "Click to upload image"}
                        </span>
                        <input
                          id="p-image"
                          ref={fileRef}
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={handleFileChange}
                          data-ocid="admin.products.upload_button"
                        />
                      </label>
                      {imagePreview && (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-20 h-20 object-cover rounded-xl border border-border"
                        />
                      )}
                    </div>
                    {addProduct.isPending && uploadProgress > 0 && (
                      <div className="mt-2">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all rounded-full"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Uploading image… {uploadProgress}%
                        </p>
                      </div>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="rounded-full font-bold w-full"
                    disabled={addProduct.isPending}
                    data-ocid="admin.products.submit_button"
                  >
                    {addProduct.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    {addProduct.isPending
                      ? "Adding Product…"
                      : "Add Product 🌸"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="rounded-3xl shadow-card">
              <CardHeader>
                <CardTitle className="text-xl font-black">
                  Current Products ({products.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {productsLoading ? (
                  <div
                    className="flex justify-center py-8"
                    data-ocid="admin.products.loading_state"
                  >
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : products.length === 0 ? (
                  <div
                    className="text-center py-10 text-muted-foreground"
                    data-ocid="admin.products.empty_state"
                  >
                    <span className="text-4xl block mb-2">🧶</span>
                    No products yet. Add your first one above!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {products.map((p, i) => (
                      <div
                        key={String(p.id)}
                        className="flex items-center gap-4 p-3 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors"
                        data-ocid={`admin.products.item.${i + 1}`}
                      >
                        <img
                          src={p.image.getDirectURL()}
                          alt={p.name}
                          className="w-14 h-14 object-cover rounded-lg border border-border flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "/assets/generated/product-bunny.dim_400x400.jpg";
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold truncate">{p.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {p.category} · ₹{p.price.toFixed(2)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                          onClick={() => handleDelete(p.id)}
                          disabled={removeProduct.isPending}
                          data-ocid={`admin.products.delete_button.${i + 1}`}
                          aria-label={`Delete ${p.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card className="rounded-3xl shadow-card">
              <CardHeader>
                <CardTitle className="text-xl font-black">
                  All Orders ({orders.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div
                    className="flex justify-center py-8"
                    data-ocid="admin.orders.loading_state"
                  >
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : orders.length === 0 ? (
                  <div
                    className="text-center py-10 text-muted-foreground"
                    data-ocid="admin.orders.empty_state"
                  >
                    <span className="text-4xl block mb-2">📦</span>
                    No orders yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order, i) => (
                      <div
                        key={String(order.id)}
                        className="p-4 rounded-xl bg-muted/40 space-y-3"
                        data-ocid={`admin.orders.item.${i + 1}`}
                      >
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div>
                            <p className="font-mono text-xs text-muted-foreground">
                              #{String(order.id)}
                            </p>
                            <p className="font-bold">
                              {order.shippingAddress.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {order.email}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(order.createdAt)} ·{" "}
                              {order.items.length} item(s)
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge
                              className={`rounded-full font-bold text-xs px-3 py-1 border ${STATUS_STYLES[order.status] ?? ""}`}
                              variant="outline"
                            >
                              {order.status.charAt(0).toUpperCase() +
                                order.status.slice(1)}
                            </Badge>
                            <Select
                              value={order.status}
                              onValueChange={async (val) => {
                                try {
                                  await updateOrderStatus.mutateAsync({
                                    orderId: order.id,
                                    status: val as OrderStatus,
                                  });
                                  toast.success("Order status updated.");
                                } catch {
                                  toast.error("Failed to update status.");
                                }
                              }}
                            >
                              <SelectTrigger
                                className="w-36 h-8 text-xs rounded-lg"
                                data-ocid={`admin.orders.select.${i + 1}`}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={OrderStatus.pending}>
                                  Pending
                                </SelectItem>
                                <SelectItem value={OrderStatus.paid}>
                                  Paid
                                </SelectItem>
                                <SelectItem value={OrderStatus.shipped}>
                                  Shipped
                                </SelectItem>
                                <SelectItem value={OrderStatus.delivered}>
                                  Delivered
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <Separator />
                        <div className="text-xs text-muted-foreground">
                          📍 {order.shippingAddress.addressLine},{" "}
                          {order.shippingAddress.city},{" "}
                          {order.shippingAddress.state}{" "}
                          {order.shippingAddress.zip},{" "}
                          {order.shippingAddress.country}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <Card className="rounded-3xl shadow-card">
              <CardHeader>
                <CardTitle className="text-xl font-black">
                  All Reviews ({reviews.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reviewsLoading ? (
                  <div
                    className="flex justify-center py-8"
                    data-ocid="admin.reviews.loading_state"
                  >
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : reviews.length === 0 ? (
                  <div
                    className="text-center py-10 text-muted-foreground"
                    data-ocid="admin.reviews.empty_state"
                  >
                    <span className="text-4xl block mb-2">💬</span>
                    No reviews yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((r, i) => (
                      <div
                        key={String(r.id)}
                        className="p-4 rounded-xl bg-muted/40"
                        data-ocid={`admin.reviews.item.${i + 1}`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-9 h-9 rounded-full bg-primary/20 text-primary font-black flex items-center justify-center text-sm flex-shrink-0">
                            {r.customerName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-sm">
                              {r.customerName}
                            </p>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((si) => (
                                <span
                                  key={si}
                                  className={`text-sm ${si <= Number(r.rating) ? "text-amber-400" : "text-muted-foreground/30"}`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          &ldquo;{r.comment}&rdquo;
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stripe Tab */}
          <TabsContent value="stripe">
            <Card className="rounded-3xl shadow-card">
              <CardHeader>
                <CardTitle className="text-xl font-black flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Stripe Payment Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div
                  className={`flex items-center gap-3 p-4 rounded-xl border ${
                    stripeConfigured
                      ? "bg-green-50 border-green-200"
                      : "bg-amber-50 border-amber-200"
                  }`}
                  data-ocid="admin.stripe.panel"
                >
                  <span className="text-2xl">
                    {stripeConfigured ? "✅" : "⚠️"}
                  </span>
                  <div>
                    <p className="font-bold text-sm">
                      {stripeConfigured
                        ? "Stripe is configured"
                        : "Stripe not configured"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stripeConfigured
                        ? "Customers can pay with credit/debit cards."
                        : "Add your Stripe secret key to enable payments."}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSaveStripe} className="space-y-4">
                  <div>
                    <Label htmlFor="stripe-key">Stripe Secret Key</Label>
                    <Input
                      id="stripe-key"
                      type="password"
                      placeholder="sk_live_… or sk_test_…"
                      value={stripeKey}
                      onChange={(e) => setStripeKey(e.target.value)}
                      className="mt-1 rounded-xl font-mono text-sm"
                      data-ocid="admin.stripe.input"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Find your secret key in the{" "}
                      <a
                        href="https://dashboard.stripe.com/apikeys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-foreground"
                      >
                        Stripe Dashboard
                      </a>
                      . Use a test key (sk_test_…) while testing.
                    </p>
                  </div>

                  <div className="bg-muted/40 rounded-xl p-4 text-sm space-y-1">
                    <p className="font-bold">Allowed shipping countries:</p>
                    <p className="text-muted-foreground">
                      🇺🇸 United States · 🇨🇦 Canada · 🇬🇧 United Kingdom · 🇦🇺
                      Australia · 🇵🇭 Philippines
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="rounded-full font-bold"
                    disabled={stripeSaving || setStripeConfig.isPending}
                    data-ocid="admin.stripe.save_button"
                  >
                    {stripeSaving || setStripeConfig.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CreditCard className="w-4 h-4 mr-2" />
                    )}
                    {stripeSaving || setStripeConfig.isPending
                      ? "Saving…"
                      : "Save Stripe Configuration"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
