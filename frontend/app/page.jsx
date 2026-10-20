
import Link from "next/link";

const features = [
  {
    icon: "🩸",
    title: "Find Blood",
    description:
      "Find potential blood donors for urgent blood requirements.",
    href: "/requests",
    number: "01",
  },
  {
    icon: "❤️",
    title: "Become a Donor",
    description:
      "Register as a donor and help someone who needs blood.",
    href: "/donors",
    number: "02",
  },
  {
    icon: "⚡",
    title: "Smart Matching",
    description:
      "Discover potential donor matches for blood requests.",
    href: "/matching",
    number: "03",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-10">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-2xl text-white">
              ♥
            </span>
            <span className="text-2xl font-black tracking-tight">
              Life<span className="text-red-600">Link</span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-semibold text-slate-600 md:flex">
            <a href="#about" className="transition hover:text-red-600">
              About
            </a>
            <a href="#features" className="transition hover:text-red-600">
              Features
            </a>
            <Link
              href="/requests"
              className="transition hover:text-red-600"
            >
              Blood Requests
            </Link>
          </div>

          <Link
            href="/donors"
            className="rounded-full bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-100 transition hover:bg-red-700"
          >
            Become a Donor
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative bg-linear-to-br from-red-50 via-white to-rose-100">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:px-10 md:py-28">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-red-600" />
              Every drop can make a difference
            </div>

            <h1 className="mt-7 text-5xl font-black leading-tight tracking-tight sm:text-6xl md:text-7xl">
              Your blood.
              <br />
              Their <span className="text-red-600">hope.</span>
              <br />
              One connection.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 md:text-lg">
              Connecting people who need blood with potential donors through
              a smart and accessible blood donation platform. Because every
              second matters.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/requests"
                className="rounded-xl bg-red-600 px-7 py-4 font-bold text-white shadow-xl shadow-red-200 transition hover:-translate-y-1 hover:bg-red-700"
              >
                Find Blood <span aria-hidden="true">→</span>
              </Link>

              <Link
                href="/donors"
                className="rounded-xl border border-slate-300 bg-white px-7 py-4 font-bold text-slate-800 transition hover:border-red-400 hover:text-red-600"
              >
                Register as Donor
              </Link>
            </div>

            <div className="mt-8 flex items-center gap-3 text-sm text-slate-500">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600">
                ✓
              </span>
              Built to make donor discovery easier
            </div>
          </div>

          {/* Decorative illustration made with CSS */}
          <div className="flex justify-center py-8">
            <div className="relative flex h-72 w-72 items-center justify-center rounded-full bg-red-100 sm:h-96 sm:w-96">
              <div className="absolute h-60 w-60 rounded-full border border-red-200 sm:h-80 sm:w-80" />

              <div className="absolute h-48 w-48 rounded-full bg-red-200/60 sm:h-64 sm:w-64" />

              <div className="relative flex h-36 w-36 items-center justify-center rounded-[2.5rem] bg-red-600 shadow-2xl shadow-red-300 sm:h-48 sm:w-48">
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-24 w-24 text-white sm:h-32 sm:w-32"
                  aria-label="Heart symbol"
                  role="img"
                >
                  <path d="M12 21.35 10.55 20.03C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09A6 6 0 0 1 16.5 3C19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35Z" />
                </svg>
              </div>

              <div className="absolute right-0 top-8 rounded-2xl bg-white p-4 shadow-xl sm:-right-3 sm:top-12">
                <span className="text-3xl">🩸</span>
                <p className="mt-1 text-xs font-bold text-slate-800">
                  Donate hope
                </p>
              </div>

              <div className="absolute bottom-6 left-0 rounded-2xl bg-white p-4 shadow-xl sm:bottom-12 sm:-left-4">
                <p className="text-sm font-bold text-slate-800">
                  One community
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  One life at a time
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-20 md:px-10 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-600">
              What we offer
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              Every connection counts
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              Simple tools designed to help donors and people requesting blood
              connect more efficiently.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <Link
                key={feature.number}
                href={feature.href}
                className="group rounded-3xl border border-slate-200 bg-white p-8 transition duration-300 hover:-translate-y-2 hover:border-red-200 hover:shadow-xl hover:shadow-red-100"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-3xl">
                    {feature.icon}
                  </div>
                  <span className="text-sm font-bold text-slate-300">
                    {feature.number}
                  </span>
                </div>

                <h3 className="mt-7 text-xl font-extrabold transition group-hover:text-red-600">
                  {feature.title}
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  {feature.description}
                </p>

                <div className="mt-7 font-bold text-red-600">
                  Explore feature <span aria-hidden="true">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="bg-slate-950 px-6 py-20 text-white md:px-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-400">
              About LifeLink
            </p>
            <h2 className="mt-4 text-3xl font-black sm:text-4xl">
              Connecting generosity with urgent needs.
            </h2>
            <p className="mt-5 leading-8 text-slate-300">
              LifeLink aims to simplify donor discovery, blood request
              management, and potential donor matching through one
              user-friendly platform.
            </p>
          </div>

          <Link
            href="/donors"
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-red-600 px-6 py-4 font-bold text-white transition hover:bg-red-700"
          >
            Join LifeLink <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 py-7 md:px-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 text-sm text-slate-500 sm:flex-row">
          <p>
            © 2026 LifeLink. Smart Blood Donation System.
          </p>
          <a href="#about" className="transition hover:text-red-600">
            Made to connect people and save lives.
          </a>
        </div>
      </footer>
    </main>
  );
}
