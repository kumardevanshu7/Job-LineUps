import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "TalentFlow — Recruitment Portal & Live Recruiter Line-Up",
  description:
    "Unified candidate application intake and live recruiter line-up pipeline with native Excel sync and enterprise ATS workflow.",
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
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
