
import "./globals.css";

export const metadata = {
  title: "LifeLink | Smart Blood Donation",
  description:
    "Connect blood donors with people in need through LifeLink's smart blood donation platform.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
