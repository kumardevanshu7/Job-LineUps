import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import PWARegistration from "@/components/PWARegistration";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#533afd",
};

export const metadata: Metadata = {
  title: "TalentFlow — Recruitment Portal & Live Recruiter Line-Up",
  description:
    "Unified candidate application intake and live recruiter line-up pipeline with native Excel sync and enterprise ATS workflow.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TalentFlow",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-canvas text-ink antialiased selection:bg-primary-subdued selection:text-ink">
        {children}
        <PWARegistration />
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
