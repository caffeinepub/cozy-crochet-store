import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useState } from "react";
import { SiFacebook, SiInstagram, SiPinterest } from "react-icons/si";
import { toast } from "sonner";

export default function Footer() {
  const [email, setEmail] = useState("");
  const year = new Date().getFullYear();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success(
        "You're subscribed! 💖 Thank you for joining our cozy community!",
      );
      setEmail("");
    }
  };

  return (
    <footer className="bg-secondary/40 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Newsletter */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🧶</span>
              <span className="font-black text-lg">crochet.comm_</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Stay cozy with new arrivals, behind-the-scenes peeks, and special
              offers.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-full text-sm"
                data-ocid="newsletter.input"
              />
              <Button
                type="submit"
                size="sm"
                className="rounded-full font-semibold"
                data-ocid="newsletter.submit_button"
              >
                Subscribe
              </Button>
            </form>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-4">
              Explore
            </h4>
            <ul className="flex flex-col gap-2">
              {[
                { label: "Home", to: "/" },
                { label: "Shop", to: "/shop" },
                { label: "Custom Orders", to: "/custom-orders" },
                { label: "About Us", to: "/about" },
                { label: "Contact", to: "/contact" },
                { label: "My Orders", to: "/my-orders" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
                    data-ocid={`footer.${link.label.toLowerCase().replace(/ /g, "_")}.link`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-4">
              Customer Care
            </h4>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <li className="font-medium">📦 Ships in 3–5 business days</li>
              <li className="font-medium">💌 crochetcomm1@gmail.com</li>
              <li className="font-medium">🔄 Easy returns within 14 days</li>
              <li className="font-medium">🛡️ Secure checkout via Stripe</li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-4">
              Follow Along
            </h4>
            <div className="flex gap-3 mb-4">
              <a
                href="https://instagram.com/crochet.comm_"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full bg-accent/50 flex items-center justify-center hover:bg-accent transition-colors"
              >
                <SiInstagram className="w-4 h-4" />
              </a>
              <a
                href="https://pinterest.com/crochetcomm"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pinterest"
                className="w-10 h-10 rounded-full bg-accent/50 flex items-center justify-center hover:bg-accent transition-colors"
              >
                <SiPinterest className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com/crochetcomm"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-10 h-10 rounded-full bg-accent/50 flex items-center justify-center hover:bg-accent transition-colors"
              >
                <SiFacebook className="w-4 h-4" />
              </a>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Share your orders using{" "}
              <span className="font-bold text-foreground">#crochetcomm</span> 🌸
            </p>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground text-center">
            Thank you for supporting handmade 💖
          </p>
          <p className="text-center">
            © {year}. Built with{" "}
            <Heart className="inline w-3.5 h-3.5 text-accent-foreground" />{" "}
            using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
