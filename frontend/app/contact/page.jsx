"use client";

import { useState } from "react";
import Link from "next/link";

const initialForm = {
  name: "",
  email: "",
  subject: "General Inquiry",
  message: "",
};

const inputClass =
  "mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-normal text-gray-800 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100";

export default function ContactPage() {
  const [form, setForm] = useState(initialForm);
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState("success");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setFeedback("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim();
    const message = form.message.trim();

    if (name.length < 2) {
      setFeedbackType("error");
      setFeedback("Please enter a valid name with at least 2 characters.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      setFeedbackType("error");
      setFeedback("Please enter a valid email address.");
      return;
    }

    if (!form.subject.trim()) {
      setFeedbackType("error");
      setFeedback("Please select a subject.");
      return;
    }

    if (message.length < 10) {
      setFeedbackType("error");
      setFeedback("Your message must contain at least 10 characters.");
      return;
    }

    if (message.length > 1000) {
      setFeedbackType("error");
      setFeedback("Your message cannot exceed 1000 characters.");
      return;
    }

    setFeedbackType("success");
    setFeedback(
      "Thank you for contacting LifeLink! Your form has been validated. Message delivery will be available after backend integration."
    );

    setForm(initialForm);
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">
      {/* Navigation */}
      <nav className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <Link href="/" className="text-2xl font-extrabold text-red-600">
            LifeLink<span className="text-gray-800">.</span>
          </Link>

          <div className="flex flex-wrap gap-4 text-sm font-medium">
            <Link href="/" className="text-gray-600 hover:text-red-600">
              Home
            </Link>

            <Link href="/about" className="text-gray-600 hover:text-red-600">
              About
            </Link>

            <Link
              href="/my-requests"
              className="text-gray-600 hover:text-red-600"
            >
              My Requests
            </Link>

            <Link
              href="/profile"
              className="text-gray-600 hover:text-red-600"
            >
              My Profile
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-linear-to-br from-red-50 via-white to-rose-100">
        <div className="mx-auto max-w-6xl px-5 py-14 text-center sm:py-20">
          <span className="inline-block rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-700">
            We&apos;re here to help.
          </span>

          <h1 className="mt-6 text-4xl font-extrabold sm:text-5xl">
            Contact <span className="text-red-600">LifeLink</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl leading-8 text-gray-600">
            Have a question about blood donation, donor registration, or blood
            requests? Send us a message using the form below.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-12 lg:grid-cols-[0.8fr_1.2fr]">
        {/* Contact Information */}
        <aside className="rounded-3xl bg-linear-to-br from-red-600 to-rose-700 p-7 text-white sm:p-9">
          <h2 className="text-2xl font-bold">Get in Touch</h2>

          <p className="mt-4 leading-7 text-red-100">
            We&apos;re building a platform to make blood donor discovery and
            request management easier. Use this form to share your questions
            or feedback.
          </p>

          <div className="mt-9 space-y-6">
            <div className="flex gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 text-xl">
                🩸
              </span>

              <div>
                <h3 className="font-semibold">Blood Donation Support</h3>
                <p className="mt-1 text-sm leading-6 text-red-100">
                  Questions about donors and blood requests.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 text-xl">
                💬
              </span>

              <div>
                <h3 className="font-semibold">Feedback and Suggestions</h3>
                <p className="mt-1 text-sm leading-6 text-red-100">
                  Help us improve the LifeLink experience.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 text-xl">
                🤝
              </span>

              <div>
                <h3 className="font-semibold">Project Support</h3>
                <p className="mt-1 text-sm leading-6 text-red-100">
                  Questions about using the platform.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 rounded-2xl border border-white/20 bg-white/10 p-5">
            <p className="font-semibold">Medical emergency?</p>

            <p className="mt-2 text-sm leading-6 text-red-100">
              This contact form is not an emergency service. Contact your
              hospital or local emergency services for urgent medical help.
            </p>
          </div>
        </aside>

        {/* Contact Form */}
        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-9">
          <h2 className="text-2xl font-extrabold">Send Us a Message</h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Fill in the details below. All fields are required.
          </p>

          {feedback && (
            <div
              role="status"
              aria-live="polite"
              className={`mt-6 rounded-xl p-4 text-sm leading-6 ${
                feedbackType === "success"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {feedback}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-semibold">
                Full Name
                <input
                  className={inputClass}
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  autoComplete="name"
                  minLength={2}
                  maxLength={80}
                  required
                />
              </label>

              <label className="text-sm font-semibold">
                Email Address
                <input
                  className={inputClass}
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </label>
            </div>

            <label className="block text-sm font-semibold">
              Subject
              <select
                className={`${inputClass} cursor-pointer`}
                name="subject"
                value={form.subject}
                onChange={handleChange}
                required
              >
                <option>General Inquiry</option>
                <option>Donor Registration</option>
                <option>Blood Request</option>
                <option>Technical Issue</option>
                <option>Feedback and Suggestions</option>
              </select>
            </label>

            <label className="block text-sm font-semibold">
              Message
              <textarea
                className={`${inputClass} resize-y`}
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={6}
                minLength={10}
                maxLength={1000}
                placeholder="How can we help you?"
                required
              />

              <span className="mt-1 block text-right text-xs font-normal text-gray-400">
                {form.message.length}/1000 characters
              </span>
            </label>

            <button
              type="submit"
              className="w-full rounded-xl bg-red-600 px-6 py-3.5 font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
            >
              Send Message →
            </button>

            <p className="text-xs leading-5 text-gray-400">
              Demo form: messages are not delivered or stored yet. Backend
              integration is required to submit them.
            </p>
          </form>
        </section>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white px-5 py-7 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} LifeLink. Every drop counts.

        <div className="mt-3 flex flex-wrap justify-center gap-5">
          <Link href="/" className="hover:text-red-600">
            Home
          </Link>

          <Link href="/about" className="hover:text-red-600">
            About
          </Link>

          <Link href="/donors" className="hover:text-red-600">
            Become a Donor
          </Link>
        </div>
      </footer>
    </main>
  );
}