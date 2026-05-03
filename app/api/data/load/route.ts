import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("uid");

    if (!uid) {
      return NextResponse.json(
        { error: "Missing uid parameter" },
        { status: 400 }
      );
    }

    // Fetch from Supabase
    const { data, error } = await supabase
      .from("recon_user_data")
      .select("data")
      .eq("uid", uid)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows found (expected for first login)
      console.error("Supabase load error:", error);
      return NextResponse.json(
        { error: "Failed to load data" },
        { status: 500 }
      );
    }

    // Return null if no data (first login), otherwise return the blob
    return NextResponse.json({ data: data?.data || null });
  } catch (error) {
    console.error("Load route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
