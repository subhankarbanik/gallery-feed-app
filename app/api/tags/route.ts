import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import type { Tag } from "@/lib/types";

export async function GET() {
  try {
    const db = getDb();
    const [rows] = await db.query(
      "SELECT id, tag, tag_display_name FROM project_gallery_tags ORDER BY tag_display_name ASC"
    );

    return NextResponse.json({
      tags: rows as Tag[],
    });
  } catch (error) {
    console.error("Error fetching tags", error);
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 }
    );
  }
}


