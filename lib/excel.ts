import * as XLSX from "xlsx";
import { CandidateItem } from "./types";

export function generateLineUpWorkbook(
  candidates: CandidateItem[],
  reportTitle: string = "Recruiter Candidate Line-Up"
): Buffer {
  const rows = candidates.map((c, index) => {
    let interviewDateStr = "Not Scheduled";
    let interviewTimeStr = "—";

    if (c.interviewDate) {
      const d = new Date(c.interviewDate);
      if (!isNaN(d.getTime())) {
        interviewDateStr = d.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
        interviewTimeStr = d.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      }
    }

    return {
      "S.No": index + 1,
      "Candidate ID": c.id,
      "Interview Date": interviewDateStr,
      "Time Slot": interviewTimeStr,
      "Full Name": c.fullName,
      "Mobile Number": c.phone,
      "Email Address": c.email,
      Location: c.location,
      "Applied Role": c.appliedRole,
      "Exp (Yrs)": c.experienceYears,
      "Notice (Days)":
        c.noticePeriodDays === 0 ? "Immediate" : `${c.noticePeriodDays} Days`,
      "Current CTC": c.currentCtc || "N/A",
      "Expected CTC": c.expectedCtc || "N/A",
      "Resume Link": c.resumeUrl,
      "Pipeline Status": c.status,
      "Recruiter / Feedback Notes": c.recruiterNotes || "Awaiting interview",
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Configure column widths for executive manager review
  worksheet["!cols"] = [
    { wch: 6 }, // S.No
    { wch: 15 }, // ID
    { wch: 16 }, // Interview Date
    { wch: 12 }, // Time Slot
    { wch: 24 }, // Full Name
    { wch: 15 }, // Mobile
    { wch: 28 }, // Email
    { wch: 20 }, // Location
    { wch: 26 }, // Role
    { wch: 11 }, // Exp
    { wch: 14 }, // Notice
    { wch: 14 }, // Current CTC
    { wch: 14 }, // Expected CTC
    { wch: 45 }, // Resume Link
    { wch: 22 }, // Status
    { wch: 45 }, // Notes
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Daily Line-Up");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  return buffer;
}
