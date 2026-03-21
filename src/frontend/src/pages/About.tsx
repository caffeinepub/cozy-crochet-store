export default function About() {
  return (
    <main className="min-h-screen py-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-5xl block mb-4">🌸</span>
          <p className="text-sm font-bold uppercase tracking-widest text-primary mb-2">
            Our Story
          </p>
          <h1 className="text-4xl font-black text-foreground">About Us 💖</h1>
        </div>

        {/* Story */}
        <div className="bg-card rounded-3xl p-8 sm:p-12 shadow-card mb-10">
          <div className="flex flex-col sm:flex-row gap-8 items-start">
            <div className="flex-shrink-0 text-center">
              <div className="w-24 h-24 rounded-full bg-accent/60 flex items-center justify-center text-5xl mx-auto">
                🧶
              </div>
              <p className="mt-3 font-black text-lg">Sophie</p>
              <p className="text-xs text-muted-foreground font-medium">
                Founder & Maker
              </p>
            </div>
            <div>
              <h2 className="font-black text-2xl mb-4">
                Hi, I&apos;m Sophie! 👋
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                I started crocheting during cozy winter evenings and fell in
                love with creating handmade pieces that bring joy to
                people&apos;s lives. Every stitch is made with care and a little
                sprinkle of magic ✨
              </p>
              <p className="text-muted-foreground leading-relaxed">
                What started as a hobby quickly grew into a little shop filled
                with love. I believe that handmade gifts are the most special —
                they carry warmth, intention, and heart in every loop and knot.
              </p>
            </div>
          </div>
        </div>

        {/* Values */}
        <h2 className="text-2xl font-black text-center mb-8">Our Values 🌿</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {[
            {
              emoji: "💖",
              title: "Handmade with Love",
              desc: "Every single item is made by hand, with patience and care. No rush, no shortcuts — just pure craft.",
            },
            {
              emoji: "🌿",
              title: "Sustainable Materials",
              desc: "We use high-quality, eco-friendly yarns that are soft on skin and kind to the planet.",
            },
            {
              emoji: "😊",
              title: "Happy Customers",
              desc: "Your joy is our greatest reward. We're here to make sure every order exceeds your expectations.",
            },
          ].map(({ emoji, title, desc }) => (
            <div
              key={title}
              className="bg-card rounded-2xl p-6 shadow-card text-center"
            >
              <span className="text-4xl block mb-3">{emoji}</span>
              <h3 className="font-black text-base mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          className="rounded-3xl p-10 text-center text-foreground"
          style={{ background: "oklch(var(--lavender))" }}
        >
          <h3 className="font-black text-2xl mb-3">
            Ready to find your cozy? 🧶
          </h3>
          <p className="text-muted-foreground mb-6">
            Browse our collection or request a custom piece — made just for you.
          </p>
          <a
            href="/shop"
            className="inline-block bg-primary text-primary-foreground font-bold px-8 py-3 rounded-full hover:opacity-90 transition-opacity"
          >
            Shop Now 🛍️
          </a>
        </div>
      </div>
    </main>
  );
}
