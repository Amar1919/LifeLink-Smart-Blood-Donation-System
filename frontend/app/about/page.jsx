
import Link from "next/link";

const features = [
  {
    icon: "🩸",
    title: "Donor Registration",
    description:
      "Allow eligible donors to register their details, blood group, location, and availability.",
  },
  {
    icon: "🔎",
    title: "Smart Donor Matching",
    description:
      "Help identify potential donors based on blood group, location, and availability.",
  },
  {
    icon: "🚨",
    title: "Urgent Blood Requests",
    description:
      "Make it easier to submit blood requests and communicate the urgency of a patient's need.",
  },
  {
    icon: "📊",
    title: "Request Management",
    description:
      "Provide a central place to view blood requests and track their current status.",
  },
];

const steps = [
  {
    number: "01",
    title: "Register",
    description:
      "Donors provide their contact details, blood group, and availability.",
  },
  {
    number: "02",
    title: "Submit a Request",
    description:
      "A requester provides the required blood group, hospital, location, and urgency.",
  },
  {
    number: "03",
    title: "Find Potential Donors",
    description:
      "The system helps identify potential matches using the available donor information.",
  },
  {
    number: "04",
    title: "Coordinate Donation",
    description:
      "The requester can coordinate with potential donors and the relevant healthcare facility.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-gray-800">
      {/* Navigation */}
      <nav className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <Link href="/" className="text-2xl font-extrabold text-red-600">
            LifeLink<span className="text-gray-800">.</span>
          </Link>

          <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
            <Link href="/" className="text-gray-600 hover:text-red-600">
              Home
            </Link>
            <Link
              href="/donors"
              className="text-gray-600 hover:text-red-600"
            >
              Become a Donor
            </Link>
            <Link
              href="/requests"
              className="text-gray-600 hover:text-red-600"
            >
              Blood Requests
            </Link>
            <Link
              href="/matching"
              className="text-gray-600 hover:text-red-600"
            >
              Find Donors
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-linear-to-br from-red-50 via-white to-rose-100">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="inline-flex rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-700">
              About Our Mission
            </span>

            <h1 className="mt-6 text-4xl font-extrabold leading-tight sm:text-5xl">
              Connecting Lives,
              <span className="block text-red-600">One Donation at a Time.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-gray-600">
              LifeLink is a smart blood donation and urgent matching platform
              designed to connect people who need blood with potential donors.
              Our goal is to make donor discovery and blood request management
              simpler, more organized, and accessible.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/donors"
                className="rounded-xl bg-red-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-red-700"
              >
                Become a Donor
              </Link>

              <Link
                href="/requests"
                className="rounded-xl border border-red-200 bg-white px-6 py-3 font-semibold text-red-600 transition hover:bg-red-50"
              >
                Request Blood
              </Link>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="relative flex h-72 w-72 items-center justify-center rounded-full bg-red-100 sm:h-96 sm:w-96">
              <div className="absolute inset-5 rounded-full border-2 border-dashed border-red-200" />
              <div className="text-center">
                <div className="text-8xl">🩸</div>
                <p className="mt-4 text-xl font-extrabold text-red-700">
                  Every Drop Counts
                </p>
                <p className="mt-2 text-sm text-red-500">
                  Together, we can make a difference.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-red-600">
            Why LifeLink?
          </p>

          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
            Making Blood Donor Discovery Easier
          </h2>

          <p className="mt-5 leading-8 text-gray-600">
            Finding a potential blood donor can be difficult when time matters.
            LifeLink brings donor information, blood requests, and matching
            features together in one platform, helping users organize the
            search and coordinate with potential donors.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-3xl">
                {feature.icon}
              </div>

              <h3 className="mt-5 text-lg font-bold">{feature.title}</h3>

              <p className="mt-3 text-sm leading-7 text-gray-600">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-red-600">
              How It Works
            </p>

            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
              Four Simple Steps
            </h2>

            <p className="mt-4 leading-7 text-gray-600">
              LifeLink organizes the process of finding potential blood donors
              and managing requests.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <article
                key={step.number}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                <span className="text-4xl font-extrabold text-red-200">
                  {step.number}
                </span>

                <h3 className="mt-4 text-lg font-bold">{step.title}</h3>

                <p className="mt-3 text-sm leading-7 text-gray-600">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-red-600">
              Our Commitment
            </p>

            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
              Built Around Care, Clarity, and Connection
            </h2>

            <p className="mt-5 leading-8 text-gray-600">
              LifeLink aims to make blood request management more organized
              while encouraging people to participate in voluntary blood
              donation. The platform supports donor discovery; medical
              eligibility and final donation decisions must be confirmed
              through appropriate healthcare professionals.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                title: "Accessibility",
                description:
                  "Bring donor discovery and blood request features together.",
              },
              {
                title: "Organization",
                description:
                  "Help users manage requests and view their status.",
              },
              {
                title: "Responsible Donation",
                description:
                  "Encourage safe donation practices and appropriate medical guidance.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex gap-4 rounded-2xl border border-gray-100 p-5"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-lg text-green-700">
                  ✓
                </span>

                <div>
                  <h3 className="font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="px-5 pb-16">
        <div className="mx-auto max-w-6xl rounded-3xl bg-linear-to-r from-red-600 to-rose-700 px-6 py-12 text-center text-white sm:px-12">
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Be Part of Someone&apos;s Hope
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-red-100">
            Register as a potential donor or submit a blood request to get
            started with LifeLink.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-4">
            <Link
              href="/donors"
              className="rounded-xl bg-white px-6 py-3 font-semibold text-red-600 transition hover:bg-red-50"
            >
              Register as Donor
            </Link>

            <Link
              href="/requests"
              className="rounded-xl border border-white/50 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Submit a Request
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white px-5 py-7 text-center text-sm text-gray-500">
        <p>
          © {new Date().getFullYear()} LifeLink. Every drop counts.
        </p>

        <div className="mt-3 flex flex-wrap justify-center gap-5">
          <Link href="/" className="hover:text-red-600">
            Home
          </Link>
          <Link href="/about" className="hover:text-red-600">
            About
          </Link>
          <Link href="/my-requests" className="hover:text-red-600">
            My Requests
          </Link>
          <Link href="/profile" className="hover:text-red-600">
            My Profile
          </Link>
        </div>
      </footer>
    </main>
  );
}
