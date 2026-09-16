import { NextResponse } from "next/server";
import { getJobs } from "@/lib/data-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const jobs = await getJobs();
    return NextResponse.json({ success: true, jobs });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
