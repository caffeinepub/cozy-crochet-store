export interface LocalProduct {
  id: number;
  name: string;
  category: string;
  price: number;
  rating: number;
  image: string;
  description: string;
}

export const PRODUCTS: LocalProduct[] = [
  {
    id: 1,
    name: "Bunny Amigurumi",
    category: "Toys",
    price: 18.99,
    rating: 4.9,
    image: "/assets/generated/product-bunny.dim_400x400.jpg",
    description: "A soft, cuddly handmade bunny companion",
  },
  {
    id: 2,
    name: "Crochet Flower Bouquet",
    category: "Flowers",
    price: 14.5,
    rating: 5.0,
    image: "/assets/generated/product-flowers.dim_400x400.jpg",
    description: "Everlasting pastel flowers, handcrafted with love",
  },
  {
    id: 3,
    name: "Sage Green Cardigan",
    category: "Clothing",
    price: 45.0,
    rating: 4.8,
    image: "/assets/generated/product-cardigan.dim_400x400.jpg",
    description: "Cozy handmade cardigan, warm and stylish",
  },
  {
    id: 4,
    name: "Crochet Tote Bag",
    category: "Accessories",
    price: 28.0,
    rating: 4.9,
    image: "/assets/generated/product-bag.dim_400x400.jpg",
    description: "Charming everyday tote with flower detail",
  },
  {
    id: 5,
    name: "Octopus Plushie",
    category: "Toys",
    price: 16.5,
    rating: 5.0,
    image: "/assets/generated/product-octopus.dim_400x400.jpg",
    description: "Adorable lavender octopus with cute tentacles",
  },
  {
    id: 6,
    name: "Pink Pompom Beanie",
    category: "Clothing",
    price: 22.0,
    rating: 4.7,
    image: "/assets/generated/product-beanie.dim_400x400.jpg",
    description: "Soft baby pink beanie with a fluffy pompom",
  },
  {
    id: 7,
    name: "Pastel Scrunchies Set",
    category: "Accessories",
    price: 12.0,
    rating: 4.9,
    image: "/assets/generated/product-scrunchies.dim_400x400.jpg",
    description: "Set of 3 adorable crochet hair scrunchies",
  },
  {
    id: 8,
    name: "Strawberry Plushie",
    category: "Toys",
    price: 15.99,
    rating: 5.0,
    image: "/assets/generated/product-strawberry.dim_400x400.jpg",
    description: "Sweet strawberry plushie, perfect gift idea",
  },
];

export const REVIEWS = [
  {
    name: "Sarah M.",
    rating: 5,
    comment:
      "The bunny amigurumi is absolutely adorable! My daughter loves it so much. Will definitely order again!",
    avatar: "S",
  },
  {
    name: "Emma L.",
    rating: 5,
    comment:
      "The flower bouquet is stunning! So much detail and love in each petal. Perfect gift!",
    avatar: "E",
  },
  {
    name: "Lily K.",
    rating: 5,
    comment:
      "The cardigan fits perfectly and is so cozy. You can really feel the handmade quality!",
    avatar: "L",
  },
  {
    name: "Mia R.",
    rating: 5,
    comment:
      "Fast shipping and beautifully packaged. The scrunchies are my new favorites 🌸",
    avatar: "M",
  },
];
