import { NextRequest, NextResponse } from "next/server";
import { getCandidates } from "@/lib/data-store";
import { generateLineUpWorkbook } from "@/lib/excel";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role") || undefined;
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const candidates = await getCandidates({ role, status, search });
    const buffer = generateLineUpWorkbook(candidates);

    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `TalentFlow_LineUp_${dateStr}.xlsx`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (error) {
    console.error("Export Line-Up error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate Excel Line-Up" },
      { status: 500 }
    );
  }
}
