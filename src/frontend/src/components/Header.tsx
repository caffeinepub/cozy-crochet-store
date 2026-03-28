import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { Link, useLocation } from "@tanstack/react-router";
import { Menu, Package, Settings, ShoppingCart, X } from "lucide-react";
import { useState } from "react";
import { SiInstagram } from "react-icons/si";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  { label: "Custom Orders", to: "/custom-orders" },
  { label: "About Us", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export default function Header() {
  const { count, openCart } = useCart();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { identity } = useInternetIdentity();

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-2xl">🧶</span>
            <span className="font-black text-xl text-foreground tracking-tight">
              crochetcomm
            </span>
          </Link>

          {/* Desktop nav */}
          <nav
            className="hidden md:flex items-center gap-1"
            data-ocid="nav.section"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                data-ocid={`nav.${link.label.toLowerCase().replace(/ /g, "_")}.link`}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  location.pathname === link.to
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-2">
            <a
              href="https://instagram.com/crochet.comm_"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="hidden md:flex items-center justify-center w-8 h-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
            >
              <SiInstagram className="w-4 h-4" />
            </a>

            {identity && (
              <Link
                to="/my-orders"
                data-ocid="nav.my_orders.link"
                className={`hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  location.pathname === "/my-orders"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                My Orders
              </Link>
            )}

            <Link
              to="/admin"
              data-ocid="nav.admin.link"
              className={`hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                location.pathname === "/admin"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              }`}
              aria-label="Admin panel"
            >
              <Settings className="w-3.5 h-3.5" />
              Admin
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={openCart}
              data-ocid="cart.open_modal_button"
              aria-label="Open cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {count}
                </span>
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden bg-card border-t border-border px-4 py-4 flex flex-col gap-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              data-ocid={`nav.${link.label.toLowerCase().replace(/ /g, "_")}.link`}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                location.pathname === link.to
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {identity && (
            <Link
              to="/my-orders"
              onClick={() => setMobileOpen(false)}
              data-ocid="nav.my_orders.link"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                location.pathname === "/my-orders"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              }`}
            >
              <Package className="w-4 h-4" />
              My Orders
            </Link>
          )}
          <Link
            to="/admin"
            onClick={() => setMobileOpen(false)}
            data-ocid="nav.admin.link"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              location.pathname === "/admin"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
            }`}
          >
            <Settings className="w-4 h-4" />
            Admin
          </Link>
          <a
            href="https://instagram.com/crochet.comm_"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
          >
            <SiInstagram className="w-4 h-4" />
            Instagram
          </a>
        </div>
      )}
    </header>
  );
}
