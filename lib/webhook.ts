import { CandidateItem } from "./types";

export const GOOGLE_APPS_SCRIPT_TEMPLATE = `// ===============================================================
// TalentFlow Google Sheets Live Sync Webhook
// Instructions:
// 1. Open your Google Sheet
// 2. Click Extensions -> Apps Script
// 3. Delete existing code and paste this script
// 4. Click 'Deploy' -> 'New deployment'
// 5. Select type: 'Web app'
// 6. Set Description: 'TalentFlow Sync'
// 7. Execute as: 'Me'
// 8. Who has access: 'Anyone' (IMPORTANT)
// 9. Click Deploy, Authorize access, and copy the Web App URL!
// ===============================================================

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Auto-create header row if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Candidate ID",
        "Timestamp",
        "Full Name",
        "Phone",
        "Email",
        "Location",
        "Applied Role",
        "Experience (Yrs)",
        "Notice (Days)",
        "Current CTC",
        "Expected CTC",
        "Resume URL",
        "Pipeline Status",
        "Recruiter Notes"
      ]);
      sheet.getRange(1, 1, 1, 14).setFontWeight("bold").setBackground("#f6f9fc");
    }

    var contents = (e && e.postData && e.postData.contents) ? e.postData.contents : "{}";
    var data = JSON.parse(contents);

    sheet.appendRow([
      data.id || ("TF-" + Math.floor(1000 + Math.random() * 9000)),
      new Date(),
      data.fullName || "",
      data.phone || "",
      data.email || "",
      data.location || "",
      data.appliedRole || "",
      data.experienceYears || 0,
      data.noticePeriodDays || 0,
      data.currentCtc || "N/A",
      data.expectedCtc || "N/A",
      data.resumeUrl || "",
      data.status || "New Applied",
      data.recruiterNotes || ""
    ]);

    return ContentService.createTextOutput(
      JSON.stringify({ status: "success", message: "Candidate synced successfully" })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", error: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// Health check responder: confirms Webhook is live when opened in a browser
function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({ status: "active", message: "TalentFlow Webhook is Live & Ready!" })
  ).setMimeType(ContentService.MimeType.JSON);
}`;

export async function dispatchToGoogleSheets(
  candidate: CandidateItem,
  customWebhookUrl?: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  const webhookUrl =
    customWebhookUrl || process.env.GOOGLE_SHEETS_WEBHOOK_URL;

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
