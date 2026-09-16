"use client";

import React from "react";
import PublicNavbar from "@/components/PublicNavbar";
import HeroMesh from "@/components/HeroMesh";
import DashboardPreviewMockup from "@/components/DashboardPreviewMockup";
import FeaturesSection from "@/components/FeaturesSection";
import Footer from "@/components/Footer";

export default function HomePage() {
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
