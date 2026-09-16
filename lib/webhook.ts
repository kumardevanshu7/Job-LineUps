import { CandidateItem } from "./types";
import { getSettingsFromFirestore } from "./firebase";

export const GOOGLE_APPS_SCRIPT_TEMPLATE = `// ===============================================================
// TalentFlow Google Sheets Live Sync & Auto-Styling Webhook
// Instructions:
// 1. Open your Google Sheet -> Extensions -> Apps Script
// 2. Replace the code with this updated script and Save (Ctrl+S)
// 3. Click 'Deploy' -> 'Manage deployments' -> Edit (pencil)
// 4. Set Version to 'New version' and click Deploy!
// 
// TIP: To format your existing rows right now, select the 
// function 'formatMyEntireSheet' in the top bar and click 'Run'!
// ===============================================================

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Auto-create header row if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "S.No",
        "Candidate ID",
        "Timestamp",
        "Full Name",
        "Phone",
        "Email",
        "Location",
        "Applied Role",
        "Exp (Yrs)",
        "Notice (Days)",
        "Current CTC",
        "Expected CTC",
        "Resume URL",
        "Pipeline Status",
        "Recruiter Notes"
      ]);
      applyHeaderStyling(sheet);
    }

    var contents = (e && e.postData && e.postData.contents) ? e.postData.contents : "{}";
    var data = JSON.parse(contents);

    // Calculate sequential Serial Number
    var nextSerialNo = Math.max(1, sheet.getLastRow());

    // Candidate sequential ID fallback
    var candidateId = data.id || ("TF-2026-" + ("000" + nextSerialNo).slice(-4));

    // Append Candidate Row
    sheet.appendRow([
      nextSerialNo,
      candidateId,
      new Date(),
      data.fullName || "",
      "'" + (data.phone || ""),
      data.email || "",
      data.location || "",
      data.appliedRole || "",
      data.experienceYears != null ? data.experienceYears : 0,
      data.noticePeriodDays != null ? data.noticePeriodDays : 0,
      data.currentCtc || "N/A",
      data.expectedCtc || "N/A",
      data.resumeUrl || "",
      data.status || "New Applied",
      data.recruiterNotes || ""
    ]);

    var lastRow = sheet.getLastRow();
    styleCandidateRow(sheet, lastRow, data.status, data.resumeUrl);

    return ContentService.createTextOutput(
      JSON.stringify({ status: "success", message: "Candidate synced successfully" })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", error: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// Health check responder
function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({ status: "active", message: "TalentFlow Webhook is Live & Ready!" })
  ).setMimeType(ContentService.MimeType.JSON);
}

// Helper: Style the header row with deep navy background & bold white text
function applyHeaderStyling(sheet) {
  sheet.setFrozenRows(1);
  sheet.setRowHeight(1, 38);
  var header = sheet.getRange(1, 1, 1, 15);
  header.setBackground("#1e293b"); // Deep Slate Navy
  header.setFontColor("#ffffff");
  header.setFontWeight("bold");
  header.setFontSize(10);
  header.setHorizontalAlignment("center");
  header.setVerticalAlignment("middle");
  header.setWrap(false);
}

// Helper: Style candidate row with zebra striping and colorful pastel status badges
function styleCandidateRow(sheet, rowNum, status, resumeUrl) {
  sheet.setRowHeight(rowNum, 32);
  var rowRange = sheet.getRange(rowNum, 1, 1, 15);
  rowRange.setVerticalAlignment("middle");
  rowRange.setFontSize(10);

  // Alternating zebra striping
  if (rowNum % 2 === 0) {
    rowRange.setBackground("#ffffff");
  } else {
    rowRange.setBackground("#f8fafc"); // Clean soft gray
  }

  // S.No & ID column styling
  sheet.getRange(rowNum, 1).setHorizontalAlignment("center").setFontWeight("bold").setFontColor("#475569");
  sheet.getRange(rowNum, 2).setHorizontalAlignment("center").setFontWeight("bold").setFontColor("#0284c7");
  sheet.getRange(rowNum, 3).setHorizontalAlignment("center").setFontColor("#64748b");
  sheet.getRange(rowNum, 5).setHorizontalAlignment("center");
  sheet.getRange(rowNum, 9).setHorizontalAlignment("center");
  sheet.getRange(rowNum, 10).setHorizontalAlignment("center");

  // Color-coded Status Badge in Column 14 (Pipeline Status)
  var statusCell = sheet.getRange(rowNum, 14);
  statusCell.setHorizontalAlignment("center").setFontWeight("bold");
  var st = (status || "New Applied").toLowerCase();

  if (st.indexOf("selected") !== -1) {
    statusCell.setBackground("#dcfce7").setFontColor("#15803d"); // Pastel Emerald Green
  } else if (st.indexOf("scheduled") !== -1) {
    statusCell.setBackground("#f3e8ff").setFontColor("#7e22ce"); // Pastel Purple
  } else if (st.indexOf("shortlisted") !== -1) {
    statusCell.setBackground("#dbeafe").setFontColor("#1d4ed8"); // Pastel Blue
  } else if (st.indexOf("done") !== -1) {
    statusCell.setBackground("#fef3c7").setFontColor("#b45309"); // Pastel Amber
  } else if (st.indexOf("rejected") !== -1) {
    statusCell.setBackground("#ffe4e6").setFontColor("#be123c"); // Pastel Rose
  } else {
    statusCell.setBackground("#f1f5f9").setFontColor("#475569"); // Soft Slate
  }

  // Resume link clickable styling
  if (resumeUrl && resumeUrl.indexOf("http") === 0) {
    sheet.getRange(rowNum, 13).setFontColor("#2563eb").setFontUnderline(true);
  }

  // Clean subtle borders
  rowRange.setBorder(true, true, true, true, true, true, "#e2e8f0", SpreadsheetApp.BorderStyle.SOLID);
}

// 1-Click Formatter: Run this function directly inside Apps Script to format entire sheet
function formatMyEntireSheet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow === 0) return;

  applyHeaderStyling(sheet);

  for (var r = 2; r <= lastRow; r++) {
    var status = sheet.getRange(r, 14).getValue();
    var resumeUrl = sheet.getRange(r, 13).getValue();
    styleCandidateRow(sheet, r, status, resumeUrl);
  }
}`;

// Dynamically resolve active webhook URL: checks custom arg -> Firestore global_config -> env fallback
export async function getActiveWebhookUrl(customWebhookUrl?: string): Promise<string | undefined> {
  // 1. Explicit parameter passed to function
  if (customWebhookUrl && customWebhookUrl.trim().startsWith("http")) {
    return customWebhookUrl.trim();
  }

  // 2. Cloud Firestore global settings (saved from site Settings Tab)
  try {
    const settings = await getSettingsFromFirestore();
    if (settings?.webhookUrl && settings.webhookUrl.trim().startsWith("http")) {
      return settings.webhookUrl.trim();
    }
  } catch (err) {
    console.warn("Could not retrieve webhookUrl from Firestore:", err);
  }

  // 3. Fallback to process.env if ever provided
  const envUrl =
    process.env.GOOGLE_SHEETS_WEBHOOK_URL ||
    process.env.NEXT_PUBLIC_GOOGLE_SHEETS_WEBHOOK_URL;
  if (envUrl && envUrl.trim().startsWith("http")) {
    return envUrl.trim();
  }

  return undefined;
}

export async function dispatchToGoogleSheets(
  candidate: CandidateItem,
  customWebhookUrl?: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  const webhookUrl = await getActiveWebhookUrl(customWebhookUrl);

  if (!webhookUrl || !webhookUrl.startsWith("http")) {
    return {
      success: false,
      message: "Google Sheets Webhook URL not configured (skipped sync).",
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(candidate),
      signal: controller.signal,
      redirect: "follow",
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      return { success: true, message: "Synced with Google Sheets" };
    } else if (response.status === 403) {
      return {
        success: false,
        error:
          "Webhook returned HTTP 403 Forbidden. Fix: In Google Apps Script, go to Deploy -> Manage deployments -> Edit (pencil) -> Set 'Who has access' to 'Anyone' (not 'Only myself') and click Save.",
      };
    } else {
      return {
        success: false,
        error: `Webhook returned status ${response.status} (${response.statusText || "Check URL"})`,
      };
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.warn("Failed to dispatch to Google Sheets webhook:", errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}
