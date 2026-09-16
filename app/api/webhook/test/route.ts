import { NextRequest, NextResponse } from "next/server";
import { dispatchToGoogleSheets, getActiveWebhookUrl } from "@/lib/webhook";
import { CandidateItem } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const targetUrl = await getActiveWebhookUrl(body?.webhookUrl);

    if (!targetUrl) {
      return NextResponse.json(
        { success: false, error: "Please enter or save a valid Google Apps Script Web App URL first." },
        { status: 400 }
      );
    }

    const testCandidate: CandidateItem = {
      id: "TF-TEST-" + Math.floor(1000 + Math.random() * 9000),
      fullName: "Test Ping Candidate",
      phone: "9999999999",
      email: "test.webhook@talentflow.internal",
      location: "Sector 59, Noida",
      appliedRole: "Documentation Specialist",
      experienceYears: 1.0,
      noticePeriodDays: 0,
      currentCtc: "₹5,00,000",
      expectedCtc: "₹6,00,000",
      resumeUrl: "https://drive.google.com/file/d/sample_test/view",
      status: "New Applied",
      recruiterNotes: "Automated webhook connectivity verification ping",
      createdAt: new Date().toISOString(),
    };

    const result = await dispatchToGoogleSheets(testCandidate, targetUrl);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Google Sheets Webhook test successful! Test row appended.",
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error:
            result.error ||
            "Failed to reach Webhook. Make sure deployment is set to 'Anyone'.",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Webhook connectivity check failed" },
      { status: 500 }
    );
  }
}
