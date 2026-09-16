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

    if (webhookUrl) {
      const result = await dispatchToGoogleSheets(candidate, webhookUrl);
      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }

    const { dispatchToAllMatchingWorkspaces } = await import("@/lib/webhook");
    const result = await dispatchToAllMatchingWorkspaces(candidate);
    return NextResponse.json({
      success: true,
      totalDispatched: result.totalDispatched,
      errors: result.errors,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Webhook dispatch API error:", msg);
    return NextResponse.json(
      { success: false, error: "Internal error syncing candidate to Google Sheets." },
      { status: 500 }
    );
  }
}
