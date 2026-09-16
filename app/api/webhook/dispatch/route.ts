import { NextRequest, NextResponse } from "next/server";
import { dispatchToGoogleSheets } from "@/lib/webhook";
import { CandidateItem } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { candidate, webhookUrl } = (await req.json()) as {
      candidate?: CandidateItem;
      webhookUrl?: string;
    };

    if (!candidate) {
      return NextResponse.json(
        { success: false, error: "Candidate payload is required." },
        { status: 400 }
      );
    }

    const result = await dispatchToGoogleSheets(candidate, webhookUrl);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message || "Candidate synced to Google Sheets.",
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to sync to Google Sheets." },
        { status: 400 }
      );
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Webhook dispatch API error:", msg);
    return NextResponse.json(
      { success: false, error: "Internal error syncing candidate to Google Sheets." },
      { status: 500 }
    );
  }
}
