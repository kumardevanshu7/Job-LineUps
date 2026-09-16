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

// Clean candidate store - no demo data, only real recruiter entries
const CANDIDATES = [];

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
