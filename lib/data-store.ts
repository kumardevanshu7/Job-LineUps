import { JobItem, CandidateItem, CandidateStats } from "./types";
import { prisma } from "./prisma";

// Default initial job listings as specified in PRD
export const INITIAL_JOBS: JobItem[] = [
  {
    id: "job-1",
    title: "Documentation Specialist",
    department: "Operations & Compliance",
    location: "Sector 59, Noida",
    experienceBracket: "1–3 Years",
    type: "Full-Time (On-site)",
    salaryRange: "₹4.5L – ₹6.5L LPA",
    description:
      "Responsible for vetting enterprise candidate records, managing document verification workflows, maintaining client compliance dossiers, and ensuring audit-ready applicant files.",
    requirements: [
      "1+ years of experience in document verification, KYC, or BPO/KPO compliance",
      "Strong proficiency in MS Office, Google Workspace, and digital archiving systems",
      "Meticulous attention to detail with zero tolerance for record mismatches",
      "Excellent written and spoken English communication skills",
    ],
  },
  {
    id: "job-2",
    title: "Operations Executive",
    department: "Supply Chain & Fulfilment",
    location: "Sector 59, Noida",
    experienceBracket: "2–4 Years",
    type: "Full-Time (Hybrid)",
    salaryRange: "₹6.0L – ₹8.5L LPA",
    description:
      "Drive daily operational workflows, coordinate cross-functional logistics across partner hubs, track SLAs, and streamline frontline talent supply chain pipelines.",
    requirements: [
      "2-4 years in operational coordination, vendor management, or rapid logistics",
      "Analytical mindset with strong grasp of Excel formulas (VLOOKUP, Pivot tables)",
      "Proactive problem solver comfortable in high-velocity operating environments",
      "Graduate in any discipline; Operations/Supply Chain background preferred",
    ],
  },
  {
    id: "job-3",
    title: "HR Trainee",
    department: "People Operations & TA",
    location: "Sector 59, Noida",
    experienceBracket: "0–1 Years",
    type: "Full-Time (On-site)",
    salaryRange: "₹3.2L – ₹4.2L LPA",
    description:
      "Learn and execute core talent acquisition workflows: candidate sourcing, telephone screening, interview line-up coordination, and maintaining live ATS spreadsheets.",
    requirements: [
      "Recent MBA/BBA in Human Resources or Graduate with strong enthusiasm for HR",
      "Dynamic interpersonal skills and high telephone conversational confidence",
      "Basic familiarity with LinkedIn, job boards, and spreadsheet tracking",
      "Willingness to learn end-to-end recruitment lifecycle and candidate management",
    ],
  },
];

// Clean candidate store - ready for real recruiter entries
export const INITIAL_CANDIDATES: CandidateItem[] = [];

// In-memory store fallback for zero-downtime resilience
let memoryCandidates: CandidateItem[] = [];
let memoryJobs: JobItem[] = [...INITIAL_JOBS];

export async function getJobs(): Promise<JobItem[]> {
  try {
    const jobs = await prisma.job.findMany({
      where: { active: true },
      orderBy: { createdAt: "asc" },
    });
    if (jobs && jobs.length > 0) {
      return jobs.map((j) => ({
        id: j.id,
        title: j.title,
        department: j.department,
        location: j.location,
        experienceBracket: j.experienceBracket,
        type: j.type,
        salaryRange: j.salaryRange,
        description: j.description,
        requirements: JSON.parse(j.requirements || "[]"),
        active: j.active,
      }));
    }
  } catch (error) {
    // Fall back smoothly to in-memory store
  }
  return memoryJobs;
}

export async function getCandidates(filters?: {
  role?: string;
  status?: string;
  search?: string;
}): Promise<CandidateItem[]> {
  try {
    const whereClause: Record<string, unknown> = {};
    if (filters?.role && filters.role !== "ALL") {
      whereClause.appliedRole = filters.role;
    }
    if (filters?.status && filters.status !== "ALL") {
      whereClause.status = filters.status;
    }
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim();
      whereClause.OR = [
        { fullName: { contains: q } },
        { phone: { contains: q } },
        { email: { contains: q } },
      ];
    }

    const candidates = await prisma.candidate.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    if (candidates && candidates.length > 0) {
      return candidates.map((c) => ({
        id: c.id,
        fullName: c.fullName,
        phone: c.phone,
        email: c.email,
        location: c.location,
        appliedRole: c.appliedRole,
        experienceYears: c.experienceYears,
        noticePeriodDays: c.noticePeriodDays,
        currentCtc: c.currentCtc,
        expectedCtc: c.expectedCtc,
        resumeUrl: c.resumeUrl,
        status: c.status,
        interviewDate: c.interviewDate ? c.interviewDate.toISOString() : null,
        recruiterNotes: c.recruiterNotes,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      }));
    }
  } catch (error) {
    // Fall back to memory store
  }

  // Filter in memory
  return memoryCandidates
    .filter((c) => {
      if (filters?.role && filters.role !== "ALL" && c.appliedRole !== filters.role) {
        return false;
      }
      if (filters?.status && filters.status !== "ALL" && c.status !== filters.status) {
        return false;
      }
      if (filters?.search && filters.search.trim()) {
        const q = filters.search.trim().toLowerCase();
        const matchesName = c.fullName.toLowerCase().includes(q);
        const matchesPhone = c.phone.toLowerCase().includes(q);
        const matchesEmail = c.email.toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesEmail) return false;
      }
      return true;
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export async function createCandidate(
  data: Omit<CandidateItem, "id" | "createdAt" | "status"> & {
    id?: string;
    status?: string;
  }
): Promise<CandidateItem> {
  const generatedId =
    data.id || `TF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const candidateRecord: CandidateItem = {
    id: generatedId,
    fullName: data.fullName,
    phone: data.phone,
    email: data.email,
    location: data.location,
    appliedRole: data.appliedRole,
    experienceYears: Number(data.experienceYears),
    noticePeriodDays: Number(data.noticePeriodDays),
    currentCtc: data.currentCtc || "Not Disclosed",
    expectedCtc: data.expectedCtc || "As per company standards",
    resumeUrl: data.resumeUrl,
    status: data.status || "New Applied",
    interviewDate: null,
    recruiterNotes: null,
    createdAt: new Date().toISOString(),
  };

  try {
    const created = await prisma.candidate.create({
      data: {
        id: candidateRecord.id,
        fullName: candidateRecord.fullName,
        phone: candidateRecord.phone,
        email: candidateRecord.email,
        location: candidateRecord.location,
        appliedRole: candidateRecord.appliedRole,
        experienceYears: candidateRecord.experienceYears,
        noticePeriodDays: candidateRecord.noticePeriodDays,
        currentCtc: candidateRecord.currentCtc,
        expectedCtc: candidateRecord.expectedCtc,
        resumeUrl: candidateRecord.resumeUrl,
        status: candidateRecord.status,
      },
    });
    return {
      ...candidateRecord,
      createdAt: created.createdAt.toISOString(),
    };
  } catch (err) {
    // If Prisma write fails (e.g. SQLite read-only on Vercel), save in memory
    memoryCandidates.unshift(candidateRecord);
    return candidateRecord;
  }
}

export async function updateCandidate(
  id: string,
  data: Partial<Pick<CandidateItem, "status" | "interviewDate" | "recruiterNotes">>
): Promise<CandidateItem | null> {
  try {
    const updated = await prisma.candidate.update({
      where: { id },
      data: {
        ...(data.status ? { status: data.status } : {}),
        ...(data.interviewDate !== undefined
          ? { interviewDate: data.interviewDate ? new Date(data.interviewDate) : null }
          : {}),
        ...(data.recruiterNotes !== undefined
          ? { recruiterNotes: data.recruiterNotes }
          : {}),
      },
    });
    return {
      id: updated.id,
      fullName: updated.fullName,
      phone: updated.phone,
      email: updated.email,
      location: updated.location,
      appliedRole: updated.appliedRole,
      experienceYears: updated.experienceYears,
      noticePeriodDays: updated.noticePeriodDays,
      currentCtc: updated.currentCtc,
      expectedCtc: updated.expectedCtc,
      resumeUrl: updated.resumeUrl,
      status: updated.status,
      interviewDate: updated.interviewDate ? updated.interviewDate.toISOString() : null,
      recruiterNotes: updated.recruiterNotes,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  } catch (err) {
    // Memory fallback
    const index = memoryCandidates.findIndex((c) => c.id === id);
    if (index !== -1) {
      memoryCandidates[index] = {
        ...memoryCandidates[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      return memoryCandidates[index];
    }
    return null;
  }
}

export async function getCandidateStats(): Promise<CandidateStats> {
  const all = await getCandidates();
  return {
    total: all.length,
    newApplied: all.filter((c) => c.status === "New Applied").length,
    shortlisted: all.filter((c) => c.status === "Screening Shortlisted").length,
    scheduled: all.filter((c) => c.status === "Line-Up Scheduled").length,
    interviewDone: all.filter((c) => c.status === "Interview Done").length,
    selected: all.filter((c) => c.status === "Selected").length,
    rejected: all.filter((c) => c.status === "Rejected").length,
  };
}
