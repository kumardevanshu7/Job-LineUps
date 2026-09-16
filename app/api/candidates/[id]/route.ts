import { NextRequest, NextResponse } from "next/server";
import { updateCandidate, deleteCandidate } from "@/lib/data-store";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await req.json();

    const updated = await updateCandidate(id, body);

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

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const deleted = await deleteCandidate(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Candidate not found or could not be deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Candidate ${id} deleted successfully`,
    });
  } catch (error) {
    console.error("Delete candidate error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete candidate" },
      { status: 500 }
    );
  }
}
