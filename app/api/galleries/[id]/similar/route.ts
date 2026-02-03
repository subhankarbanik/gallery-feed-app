import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import type { GalleryCard } from "@/lib/types";

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

    const [tagRows] = await db.query(
      `
      SELECT DISTINCT project_gallery_tag_id AS tag_id
      FROM project_media_galleries_tag_id_links
      WHERE project_media_gallery_id = ?
    `,
      [id]
    );

    const tagIds = (tagRows as any[]).map((r) => r.tag_id);
    if (tagIds.length === 0) {
      return NextResponse.json({
        items: [] as GalleryCard[],
      });
    }

    const placeholders = tagIds.map(() => "?").join(",");
    const paramsList: (number | string)[] = [...tagIds, id, 10];

    const [rows] = await db.query(
      `
      SELECT
        pmg.id,
        pmg.media_url,
        pmg.created_at,
        dp.profile_name,
        dp.profile_picture,
        dp.total_photo_uploaded,
        COALESCE(GROUP_CONCAT(DISTINCT t.tag_display_name ORDER BY t.tag_display_name SEPARATOR ','), '') AS tag_names
      FROM project_media_galleries pmg
      JOIN digital_profiles dp
        ON pmg.created_by_user_id = dp.contractor_uuid
      JOIN project_media_galleries_tag_id_links l
        ON l.project_media_gallery_id = pmg.id
      JOIN project_gallery_tags t
        ON t.id = l.project_gallery_tag_id
      WHERE l.project_gallery_tag_id IN (${placeholders})
        AND pmg.id <> ?
      GROUP BY pmg.id
      ORDER BY pmg.created_at DESC
      LIMIT ?
    `,
      paramsList
    );

    const items: GalleryCard[] = (rows as any[]).map((row) => ({
      id: row.id,
      media_url: row.media_url,
      created_at: row.created_at,
      profile_name: row.profile_name,
      profile_picture: row.profile_picture,
      total_photo_uploaded: row.total_photo_uploaded,
      tags: row.tag_names ? String(row.tag_names).split(",") : [],
    }));

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Error fetching similar galleries", error);
    return NextResponse.json(
      { error: "Failed to fetch similar galleries" },
      { status: 500 }
    );
  }
}


