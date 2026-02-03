import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import type { GalleryCard } from "@/lib/types";

const DEFAULT_LIMIT = 20;

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const tag = searchParams.get("tag");
  const page = Number(searchParams.get("page") ?? "1");
  const limit = Number(searchParams.get("limit") ?? DEFAULT_LIMIT);

  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  const safeLimit =
    Number.isFinite(limit) && limit > 0 && limit <= 50 ? limit : DEFAULT_LIMIT;

  const offset = (safePage - 1) * safeLimit;

  try {
    const db = getDb();

    const params: (string | number)[] = [];

    let whereClause = "";
    if (tag && tag.toLowerCase() !== "all") {
      whereClause = "WHERE t.tag = ?";
      params.push(tag);
    }

    params.push(safeLimit, offset);

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
      LEFT JOIN project_media_galleries_tag_id_links l
        ON l.project_media_gallery_id = pmg.id
      LEFT JOIN project_gallery_tags t
        ON t.id = l.project_gallery_tag_id
      ${whereClause}
      GROUP BY pmg.id
      ORDER BY pmg.created_at DESC
      LIMIT ? OFFSET ?
    `,
      params
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

    let totalCount = 0;
    const countParams: (string | number)[] = [];
    if (tag && tag.toLowerCase() !== "all") {
      countParams.push(tag);
    }

    const [countRows] = await db.query(
      `
      SELECT COUNT(DISTINCT pmg.id) AS total
      FROM project_media_galleries pmg
      JOIN digital_profiles dp
        ON pmg.created_by_user_id = dp.contractor_uuid
      LEFT JOIN project_media_galleries_tag_id_links l
        ON l.project_media_gallery_id = pmg.id
      LEFT JOIN project_gallery_tags t
        ON t.id = l.project_gallery_tag_id
      ${tag && tag.toLowerCase() !== "all" ? "WHERE t.tag = ?" : ""}
    `,
      countParams
    );

    if (Array.isArray(countRows) && countRows.length > 0) {
      totalCount = Number((countRows as any)[0].total ?? 0);
    } else if (!Array.isArray(countRows)) {
      totalCount = Number((countRows as any).total ?? 0);
    }

    const hasMore = safePage * safeLimit < totalCount;

    return NextResponse.json({
      items,
      page: safePage,
      limit: safeLimit,
      total: totalCount,
      hasMore,
    });
  } catch (error) {
    console.error("Error fetching galleries", error);
    return NextResponse.json(
      { error: "Failed to fetch galleries" },
      { status: 500 }
    );
  }
}


