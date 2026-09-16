import { NextRequest, NextResponse } from "next/server";
import { createCandidate } from "@/lib/data-store";
import { dispatchToGoogleSheets } from "@/lib/webhook";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      fullName,
      phone,
      email,
      location,
      appliedRole,
      experienceYears,
      noticePeriodDays,
      currentCtc,
      expectedCtc,
      resumeUrl,
    } = body;

    // Validation
    if (!fullName || typeof fullName !== "string" || fullName.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid full name." },
        { status: 400 }
      );
    }

    const cleanPhone = String(phone || "").replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (!location || !location.trim()) {
      return NextResponse.json(
        { success: false, error: "Please specify your current city/location." },
        { status: 400 }
      );
    }

    if (!appliedRole || !appliedRole.trim()) {
      return NextResponse.json(
        { success: false, error: "Applied role is required." },
        { status: 400 }
      );
    }

    if (!resumeUrl || !resumeUrl.startsWith("http")) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Please provide an accessible Google Drive, Dropbox, or Cloud resume link.",
        },
        { status: 400 }
      );
    }

    // Commit candidate to database / store
    const candidate = await createCandidate({
      fullName: fullName.trim(),
      phone: cleanPhone,
      email: email.trim().toLowerCase(),
      location: location.trim(),
      appliedRole: appliedRole.trim(),
      experienceYears: Number(experienceYears) || 0,
      noticePeriodDays: Number(noticePeriodDays) || 0,
      currentCtc: currentCtc?.trim() || null,
      expectedCtc: expectedCtc?.trim() || null,
      resumeUrl: resumeUrl.trim(),
    });

    // Asynchronously dispatch to Google Sheets webhook if configured
    dispatchToGoogleSheets(candidate).catch((err) =>
      console.warn("Background webhook error:", err)
    );

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully!",
      candidate: {
        id: candidate.id,
        fullName: candidate.fullName,
        appliedRole: candidate.appliedRole,
        createdAt: candidate.createdAt,
      },
    });
  } catch (error) {
    console.error("Application submission error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}
