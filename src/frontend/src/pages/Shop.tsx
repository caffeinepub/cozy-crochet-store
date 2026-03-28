import ProductCard from "@/components/ProductCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { LocalProduct } from "@/data/products";
import { useGetProducts } from "@/hooks/useQueries";
import { useState } from "react";

const CATEGORIES = ["All", "Toys", "Flowers", "Clothing", "Accessories"];

export default function Shop() {
  const [activeTab, setActiveTab] = useState("All");
  const { data: backendProducts, isLoading } = useGetProducts();

  const allProducts: LocalProduct[] = (backendProducts ?? []).map((p) => ({
    id: Number(p.id),
    name: p.name,
    category: p.category,
    price: p.price,
    rating: 5,
    image: p.image.getDirectURL(),
    description: p.description,
  }));

  const filtered =
    activeTab === "All"
      ? allProducts
      : allProducts.filter((p) => p.category === activeTab);

  return (
    <main className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-sm font-bold uppercase tracking-widest text-primary mb-2">
            Our Collection
          </p>
          <h1 className="text-4xl font-black text-foreground mb-3">
            The Cozy Shop 🛍️
          </h1>
          <p className="text-muted-foreground font-medium max-w-md mx-auto">
            Browse all our handmade crochet treasures — each crafted with love
            and care
          </p>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="text-center py-20" data-ocid="shop.loading_state">
            <span className="text-5xl animate-spin inline-block">🧶</span>
            <p className="mt-4 font-semibold text-muted-foreground">
              Loading our cozy collection...
            </p>
          </div>
        )}

        {/* Filters */}
        {!isLoading && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent justify-center">
              {CATEGORIES.map((cat) => (
                <TabsTrigger
                  key={cat}
                  value={cat}
                  className="rounded-full px-6 py-2 font-bold text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  data-ocid={`shop.${cat.toLowerCase()}.tab`}
                >
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>

            {CATEGORIES.map((cat) => (
              <TabsContent key={cat} value={cat} className="mt-8">
                {allProducts.length === 0 ? (
                  <div
                    className="text-center py-20"
                    data-ocid="shop.empty_state"
                  >
                    <span className="text-5xl">🧶</span>
                    <p className="mt-4 font-semibold text-muted-foreground">
                      No products available yet — check back soon!
                    </p>
                  </div>
                ) : filtered.length === 0 ? (
                  <div
                    className="text-center py-20"
                    data-ocid="shop.empty_state"
                  >
                    <span className="text-5xl">🧶</span>
                    <p className="mt-4 font-semibold text-muted-foreground">
                      No items in this category yet!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {filtered.map((p, i) => (
                      <ProductCard key={p.id} product={p} index={i + 1} />
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </main>
  );
}
