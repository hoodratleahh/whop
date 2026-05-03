import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { data, uid } = await request.json();

    if (!uid || !data) {
      return NextResponse.json(
        { error: "Missing uid or data" },
        { status: 400 }
      );
    }

    // Upsert to Supabase (API keys already stripped on client)
    const { error } = await supabase
      .from("recon_user_data")
      .upsert(
        {
          uid,
          data,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "uid" }
      );

    if (error) {
      console.error("Supabase save error:", error);
      return NextResponse.json(
        { error: "Failed to save data" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Save route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
