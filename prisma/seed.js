const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const JOBS = [
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
    requirements: JSON.stringify([
      "1+ years of experience in document verification, KYC, or BPO/KPO compliance",
      "Strong proficiency in MS Office, Google Workspace, and digital archiving systems",
      "Meticulous attention to detail with zero tolerance for record mismatches",
      "Excellent written and spoken English communication skills",
    ]),
    active: true,
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
    requirements: JSON.stringify([
      "2-4 years in operational coordination, vendor management, or rapid logistics",
      "Analytical mindset with strong grasp of Excel formulas (VLOOKUP, Pivot tables)",
      "Proactive problem solver comfortable in high-velocity operating environments",
      "Graduate in any discipline; Operations/Supply Chain background preferred",
    ]),
    active: true,
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
    requirements: JSON.stringify([
      "Recent MBA/BBA in Human Resources or Graduate with strong enthusiasm for HR",
      "Dynamic interpersonal skills and high telephone conversational confidence",
      "Basic familiarity with LinkedIn, job boards, and spreadsheet tracking",
      "Willingness to learn end-to-end recruitment lifecycle and candidate management",
    ]),
    active: true,
  },
];

const CANDIDATES = [
  {
    id: "cand-1",
    fullName: "Aarav Sharma",
    phone: "9818234567",
    email: "aarav.sharma@example.com",
    location: "Sector 62, Noida",
    appliedRole: "Documentation Specialist",
    experienceYears: 2.5,
    noticePeriodDays: 15,
    currentCtc: "₹4,80,000",
    expectedCtc: "₹6,00,000",
    resumeUrl: "https://drive.google.com/file/d/1sample_aarav_sharma_resume/view",
    status: "Line-Up Scheduled",
    recruiterNotes: "Strong KYC compliance background at Genpact. Communication is crisp.",
  },
  {
    id: "cand-2",
    fullName: "Pooja Verma",
    phone: "9910456789",
    email: "pooja.verma@example.com",
    location: "Indirapuram, Ghaziabad",
    appliedRole: "Operations Executive",
    experienceYears: 3.2,
    noticePeriodDays: 30,
    currentCtc: "₹6,20,000",
    expectedCtc: "₹7,80,000",
    resumeUrl: "https://drive.google.com/file/d/1sample_pooja_verma_resume/view",
    status: "Screening Shortlisted",
    recruiterNotes: "Managed dispatch operations for Delhivery. Proficient in SLA tracking.",
  },
  {
    id: "cand-3",
    fullName: "Rohan Kulkarni",
    phone: "9723456781",
    email: "rohan.kulkarni@example.com",
    location: "Sector 18, Noida",
    appliedRole: "HR Trainee",
    experienceYears: 0.5,
    noticePeriodDays: 0,
    currentCtc: "₹3,00,000",
    expectedCtc: "₹4,00,000",
    resumeUrl: "https://drive.google.com/file/d/1sample_rohan_kulkarni_resume/view",
    status: "New Applied",
    recruiterNotes: "Immediate joiner, completed 6-month internship at recruitment consultancy.",
  },
  {
    id: "cand-4",
    fullName: "Sneha Mukherjee",
    phone: "9830123456",
    email: "sneha.m@example.com",
    location: "Mayur Vihar, New Delhi",
    appliedRole: "Documentation Specialist",
    experienceYears: 3.0,
    noticePeriodDays: 15,
    currentCtc: "₹5,20,000",
    expectedCtc: "₹6,50,000",
    resumeUrl: "https://drive.google.com/file/d/1sample_sneha_mukherjee_resume/view",
    status: "Selected",
    recruiterNotes: "Final round cleared with Operations Head. Offer letter drafted.",
  },
  {
    id: "cand-5",
    fullName: "Vikas Singhania",
    phone: "9654128901",
    email: "vikas.singhania@example.com",
    location: "Greater Noida West",
    appliedRole: "Operations Executive",
    experienceYears: 4.0,
    noticePeriodDays: 45,
    currentCtc: "₹7,50,000",
    expectedCtc: "₹9,00,000",
    resumeUrl: "https://drive.google.com/file/d/1sample_vikas_singhania_resume/view",
    status: "Interview Done",
    recruiterNotes: "Round 1 interview completed successfully. Awaiting feedback from panel.",
  },
];

async function main() {
  console.log("Seeding jobs...");
  for (const job of JOBS) {
    await prisma.job.upsert({
      where: { id: job.id },
      update: job,
      create: job,
    });
  }

  console.log("Seeding candidates...");
  for (const cand of CANDIDATES) {
    await prisma.candidate.upsert({
      where: { id: cand.id },
      update: cand,
      create: cand,
    });
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
