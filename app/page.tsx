"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onRecruiterAuthStateChanged } from "@/lib/firebase";
import PublicNavbar from "@/components/PublicNavbar";
import HeroMesh from "@/components/HeroMesh";
import DashboardPreviewMockup from "@/components/DashboardPreviewMockup";
import FeaturesSection from "@/components/FeaturesSection";
import Footer from "@/components/Footer";

export default function HomePage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const unsub = onRecruiterAuthStateChanged((user) => {
      if (user) {
        // Recruiter is already logged in — redirect to command center immediately
        router.replace("/admin");
      } else {
        // Not logged in — show public landing page
        setIsCheckingAuth(false);
      }
    });
    return () => unsub();
  }, [router]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-canvas">
      <PublicNavbar />
      <HeroMesh />
      <DashboardPreviewMockup />
      <FeaturesSection />
      <Footer />
    </main>
  );
}
