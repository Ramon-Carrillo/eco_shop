import { Leaf, ShoppingBag, Recycle, Heart } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Nav */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-emerald-600" aria-hidden="true" />
            <span className="text-lg font-semibold tracking-tight">EcoShop</span>
          </div>
          <nav className="hidden gap-8 text-sm text-muted-foreground sm:flex">
            <span className="cursor-default transition-colors hover:text-foreground">Shop</span>
            <span className="cursor-default transition-colors hover:text-foreground">About</span>
            <span className="cursor-default transition-colors hover:text-foreground">Sustainability</span>
          </nav>
          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label="Shopping bag (demo, no items)"
              className="rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            >
              <ShoppingBag className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main id="main" className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <Leaf className="h-4 w-4" aria-hidden="true" />
            Sustainable shopping, simplified
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Good for you.
            <br />
            <span className="text-emerald-600">Great for the planet.</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Discover eco-friendly products for your home, wardrobe, garden, and
            family. Every purchase makes a difference.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <button className="inline-flex h-12 items-center gap-2 rounded-full bg-emerald-600 px-8 text-sm font-medium text-white transition-colors hover:bg-emerald-700">
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              Shop Now
            </button>
            <button className="inline-flex h-12 items-center gap-2 rounded-full border border-border px-8 text-sm font-medium transition-colors hover:bg-muted">
              Our Mission
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="mx-auto mt-24 grid max-w-4xl gap-8 sm:grid-cols-3">
          {[
            {
              icon: Leaf,
              title: "Eco-Rated Products",
              desc: "Every product rated 1-5 on sustainability so you can shop with confidence.",
            },
            {
              icon: Recycle,
              title: "Circular Economy",
              desc: "Easy returns and recycling programs to minimize waste.",
            },
            {
              icon: Heart,
              title: "AI-Powered Support",
              desc: "Intelligent chat support that knows your orders and helps instantly.",
            },
          ].map((feature) => (
            <div key={feature.title} className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950">
                <feature.icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              </div>
              <h3 className="text-sm font-semibold">{feature.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        <p>&copy; 2026 EcoShop. Built with Next.js, Vercel AI SDK &amp; Claude.</p>
      </footer>
    </div>
  );
}
