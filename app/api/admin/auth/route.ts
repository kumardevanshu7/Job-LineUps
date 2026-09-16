import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    const expectedPassword = process.env.ADMIN_PASSWORD || "talentflow2026";

    if (password === expectedPassword) {
      return NextResponse.json({ success: true, message: "Authorized" });
    } else {
      return NextResponse.json(
        { success: false, error: "Incorrect admin passkey." },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Invalid request payload" },
      { status: 400 }
    );
  }
}
