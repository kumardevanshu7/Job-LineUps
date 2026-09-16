import { NextRequest, NextResponse } from "next/server";
import { updateCandidate } from "@/lib/data-store";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await req.json();

    const { status, interviewDate, recruiterNotes } = body;

    const updated = await updateCandidate(id, {
      status,
      interviewDate,
      recruiterNotes,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Candidate not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      candidate: updated,
    });
  } catch (error) {
    console.error("Update candidate error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update candidate" },
      { status: 500 }
    );
  }
}
