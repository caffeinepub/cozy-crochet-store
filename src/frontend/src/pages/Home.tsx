import ProductCard from "@/components/ProductCard";
import StarRating from "@/components/StarRating";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { REVIEWS } from "@/data/products";
import type { LocalProduct } from "@/data/products";
import {
  useAddReview,
  useGetAllReviews,
  useGetProducts,
} from "@/hooks/useQueries";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const [reviewName, setReviewName] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [newsletter, setNewsletter] = useState("");
  const addReview = useAddReview();

  const { data: backendProducts } = useGetProducts();
  const { data: backendReviews } = useGetAllReviews();

  const featuredProducts: LocalProduct[] = (backendProducts ?? [])
    .slice(0, 4)
    .map((p) => ({
      id: Number(p.id),
      name: p.name,
      category: p.category,
      price: p.price,
      rating: 5,
      image: p.image.getDirectURL(),
      description: p.description,
    }));

  const hasFeatured = featuredProducts.length > 0;

  const displayReviews =
    backendReviews && backendReviews.length > 0
      ? backendReviews.map((r) => ({
          name: r.customerName,
          rating: Number(r.rating),
          comment: r.comment,
          avatar: r.customerName.charAt(0).toUpperCase(),
        }))
      : REVIEWS;

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName || !reviewComment) return;
    try {
      await addReview.mutateAsync({
        customerName: reviewName,
        comment: reviewComment,
        rating: BigInt(reviewRating),
      });
      toast.success("Thank you for your review! 💕");
      setReviewName("");
      setReviewComment("");
      setReviewRating(5);
    } catch {
      toast.error("Couldn't submit review. Please try again.");
    }
  };

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletter) {
      toast.success("You're in! 🌸 Welcome to our cozy community!");
      setNewsletter("");
    }
  };

  return (
    <main>
      {/* Hero */}
      <section
        className="relative overflow-hidden bg-background py-20 px-4"
        data-ocid="hero.section"
      >
        {/* Floating yarn emojis */}
        <div
          className="absolute inset-0 pointer-events-none select-none"
          aria-hidden="true"
        >
          <span className="absolute top-12 left-[8%] text-4xl animate-float-1">
            🧶
          </span>
          <span className="absolute top-24 right-[12%] text-3xl animate-float-2">
            💖
          </span>
          <span className="absolute bottom-16 left-[18%] text-2xl animate-float-3">
            ✨
          </span>
          <span className="absolute top-32 left-[40%] text-3xl animate-float-4">
            🌸
          </span>
          <span className="absolute bottom-10 right-[20%] text-3xl animate-float-5">
            🧶
          </span>
          <span className="absolute top-8 right-[35%] text-xl animate-float-2">
            💕
          </span>
          <img
            src="/assets/generated/hero-crochet-bg.dim_1200x500.jpg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-15"
            aria-hidden="true"
          />
        </div>

        <div className="relative max-w-3xl mx-auto text-center animate-fade-in-up">
          <p className="text-sm font-bold uppercase tracking-widest text-primary mb-4">
            Handmade with Love 🌿
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-foreground leading-tight mb-6">
            Handmade with Love –{" "}
            <span className="text-primary">Cozy Crochet</span> Creations Just
            for You 🧶💖
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed font-medium">
            Each piece is crafted with care, warmth, and a whole lot of love.
            Every stitch tells a story 🌸
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="rounded-full font-bold text-base px-8 py-6 shadow-cozy"
              asChild
              data-ocid="hero.primary_button"
            >
              <Link to="/shop">Shop Now 🛍️</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full font-bold text-base px-8 py-6"
              asChild
              data-ocid="hero.secondary_button"
            >
              <Link to="/custom-orders">Custom Orders ✨</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <div className="bg-primary text-primary-foreground py-4 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-10 text-sm font-bold text-center">
          <span>Made with care 💕</span>
          <span className="hidden sm:block opacity-50">|</span>
          <span>Easy ordering ✨</span>
          <span className="hidden sm:block opacity-50">|</span>
          <span>Fast response 🌸</span>
        </div>
      </div>

      {/* Featured Products */}
      <section className="py-20 px-4 bg-card" data-ocid="featured.section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-bold uppercase tracking-widest text-primary mb-2">
              Handpicked for You
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground">
              Featured Collection 🌸
            </h2>
            <p className="mt-3 text-muted-foreground font-medium">
              Each piece made to order with premium yarns and big doses of love
            </p>
          </div>

          {hasFeatured ? (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {featuredProducts.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i + 1} />
                ))}
              </div>
              <div className="text-center mt-10">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full font-bold px-10"
                  asChild
                  data-ocid="featured.secondary_button"
                >
                  <Link to="/shop">View All Products →</Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12" data-ocid="featured.empty_state">
              <span className="text-5xl">🧶</span>
              <p className="mt-4 font-semibold text-muted-foreground">
                New products coming soon — stay tuned!
              </p>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full font-bold px-10 mt-6"
                asChild
                data-ocid="featured.secondary_button"
              >
                <Link to="/shop">Visit the Shop →</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Custom Orders band */}
      <section
        className="py-20 px-4 relative overflow-hidden"
        style={{ background: "oklch(var(--lavender))" }}
        data-ocid="custom_orders.section"
      >
        <div
          className="absolute inset-0 pointer-events-none select-none"
          aria-hidden="true"
        >
          <span className="absolute left-[5%] top-1/2 -translate-y-1/2 text-7xl opacity-20">
            🧶
          </span>
          <span className="absolute right-[5%] top-1/2 -translate-y-1/2 text-7xl opacity-20">
            🪡
          </span>
          <span className="absolute left-[15%] top-8 text-4xl opacity-15">
            🌸
          </span>
          <span className="absolute right-[15%] bottom-8 text-4xl opacity-15">
            💕
          </span>
        </div>
        <div className="relative max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-4">
            Something Unique in Mind? ✨
          </h2>
          <p className="text-muted-foreground font-medium mb-3 text-lg">
            Custom Crochet Orders — Made Just for You
          </p>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            From personalized plushies to one-of-a-kind cardigans, we love
            bringing your dream creations to life. Tell us what you have in
            mind!
          </p>
          <Button
            size="lg"
            className="rounded-full font-bold px-10 py-6 text-base shadow-cozy"
            asChild
            data-ocid="custom_orders.primary_button"
          >
            <Link to="/custom-orders">Request Custom Order 💖</Link>
          </Button>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-20 px-4 bg-background" data-ocid="reviews.section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-bold uppercase tracking-widest text-primary mb-2">
              Our Community
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground">
              Happy Hearts 💖
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayReviews.map((r, idx) => (
              <div
                key={`${r.name}-${idx}`}
                className="bg-card rounded-2xl p-6 shadow-card flex flex-col gap-4"
                data-ocid={`reviews.item.${idx + 1}`}
              >
                <StarRating rating={r.rating} />
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                  &ldquo;{r.comment}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-accent text-foreground font-bold">
                      {r.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-sm">{r.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Verified buyer
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Leave a review */}
          <div className="mt-14 max-w-lg mx-auto bg-card rounded-3xl p-8 shadow-card">
            <h3 className="font-black text-xl mb-6 text-center">
              Leave a Review 🌸
            </h3>
            <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
              <div>
                <Label htmlFor="review-name">Your Name</Label>
                <Input
                  id="review-name"
                  placeholder="e.g. Emma K."
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  className="mt-1 rounded-xl"
                  data-ocid="reviews.input"
                  required
                />
              </div>
              <div>
                <Label>Rating</Label>
                <div className="flex gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setReviewRating(s)}
                      className="text-2xl transition-transform hover:scale-125"
                      aria-label={`${s} stars`}
                      data-ocid="reviews.radio"
                    >
                      {s <= reviewRating ? "⭐" : "☆"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="review-comment">Your Review</Label>
                <Textarea
                  id="review-comment"
                  placeholder="Tell us about your experience..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="mt-1 rounded-xl resize-none"
                  rows={3}
                  data-ocid="reviews.textarea"
                  required
                />
              </div>
              <Button
                type="submit"
                className="rounded-full font-bold"
                disabled={addReview.isPending}
                data-ocid="reviews.submit_button"
              >
                {addReview.isPending ? "Submitting..." : "Submit Review 💕"}
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section
        className="py-16 px-4 bg-accent/20"
        data-ocid="newsletter.section"
      >
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-black mb-3">
            Join Our Cozy Community 🧶
          </h2>
          <p className="text-muted-foreground mb-6 font-medium">
            Get new arrivals, exclusive offers, and behind-the-scenes crochet
            peeks!
          </p>
          <form
            onSubmit={handleNewsletter}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Input
              type="email"
              placeholder="your@email.com"
              value={newsletter}
              onChange={(e) => setNewsletter(e.target.value)}
              className="rounded-full max-w-xs"
              data-ocid="newsletter.input"
            />
            <Button
              type="submit"
              className="rounded-full font-bold"
              data-ocid="newsletter.submit_button"
            >
              Subscribe 💌
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
}
