"use client";

import React, { useState, useEffect } from "react";
import PublicNavbar from "@/components/PublicNavbar";
import HeroMesh from "@/components/HeroMesh";
import DashboardPreviewMockup from "@/components/DashboardPreviewMockup";
import JobList from "@/components/JobList";
import FeaturesSection from "@/components/FeaturesSection";
import ApplyModal from "@/components/ApplyModal";
import Footer from "@/components/Footer";
import { JobItem } from "@/lib/types";

export default function HomePage() {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  useEffect(() => {
    async function loadJobs() {
      try {
        const res = await fetch("/api/jobs");
        const data = await res.json();
        if (data.success && data.jobs) {
          setJobs(data.jobs);
        }
      } catch (err) {
        console.error("Failed to load jobs", err);
      }
    }
    loadJobs();
  }, []);

  const handleApplyClick = (job: JobItem) => {
    setSelectedJob(job);
    setIsApplyModalOpen(true);
  };

  return (
    <main className="min-h-screen flex flex-col bg-canvas">
      <PublicNavbar />
      <HeroMesh />
      <DashboardPreviewMockup />
      <JobList jobs={jobs} onApplyClick={handleApplyClick} />
      <FeaturesSection />
      <Footer />

      <ApplyModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        selectedJob={selectedJob}
        allJobs={jobs}
      />
    </main>
  );
}
