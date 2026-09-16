import { NextRequest, NextResponse } from "next/server";
import { getCandidates, getCandidateStats } from "@/lib/data-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role") || undefined;
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const [candidates, stats] = await Promise.all([
      getCandidates({ role, status, search }),
      getCandidateStats(),
    ]);

    return NextResponse.json({
      success: true,
      candidates,
      stats,
    });
  } catch (error) {
    console.error("Fetch candidates error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch candidate line-up" },
      { status: 500 }
    );
  }
}
