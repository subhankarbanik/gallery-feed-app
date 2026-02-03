import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import type { GalleryDetail, Tag } from "@/lib/types";

type Params = {
  params: {
    id: string;
  };
};

export async function GET(_req: Request, { params }: Params) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const db = getDb();

    const [rows] = await db.query(
      `
      SELECT
        pmg.id,
        pmg.media_url,
        pmg.created_at,
        dp.profile_name,
        dp.profile_picture,
        dp.total_photo_uploaded
      FROM project_media_galleries pmg
      JOIN digital_profiles dp
        ON pmg.created_by_user_id = dp.contractor_uuid
      WHERE pmg.id = ?
      LIMIT 1
    `,
      [id]
    );

    const rowArray = rows as any[];
    if (!rowArray || rowArray.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const base = rowArray[0];

    const [tagRows] = await db.query(
      `
      SELECT
        t.id,
        t.tag,
        t.tag_display_name
      FROM project_gallery_tags t
      JOIN project_media_galleries_tag_id_links l
        ON l.project_gallery_tag_id = t.id
      WHERE l.project_media_gallery_id = ?
      ORDER BY t.tag_display_name ASC
    `,
      [id]
    );

    const tags = (tagRows as any[]).map(
      (t): Tag => ({
        id: t.id,
        tag: t.tag,
        tag_display_name: t.tag_display_name,
      })
    );

    const detail: GalleryDetail = {
      id: base.id,
      media_url: base.media_url,
      created_at: base.created_at,
      profile_name: base.profile_name,
      profile_picture: base.profile_picture,
      total_photo_uploaded: base.total_photo_uploaded,
      tags,
    };

    return NextResponse.json(detail);
  } catch (error) {
    console.error("Error fetching gallery detail", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery" },
      { status: 500 }
    );
  }
}


