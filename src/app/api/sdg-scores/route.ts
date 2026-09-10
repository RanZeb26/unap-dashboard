import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const countryId = searchParams.get("country_id");
    const year = searchParams.get("year");

    let sql = `
      SELECT
        ss.score_id,
        ss.country_id,
        ss.goal_id,
        ss.year,
        ss.score,
        ss.rank_position,
        ss.trend,

        c.iso3,
        c.country_name,

        g.goal_number,
        g.goal_name,

        COUNT(sis.indicator_score_id) AS indicator_count

      FROM sdg_scores ss

      INNER JOIN countries c
        ON ss.country_id = c.country_id

      INNER JOIN sdg_goals g
        ON ss.goal_id = g.goal_id

      LEFT JOIN sdg_indicator_scores sis
        ON ss.country_id = sis.country_id
        AND ss.goal_id = (
          SELECT i.goal_id
          FROM indicators i
          WHERE i.indicator_id = sis.indicator_id
        )
        AND ss.year = sis.year

      WHERE 1 = 1
    `;

    const params: any[] = [];

    if (countryId) {
      sql += ` AND ss.country_id = ? `;
      params.push(Number(countryId));
    }

    if (year) {
      sql += ` AND ss.year = ? `;
      params.push(Number(year));
    }

    sql += `
      GROUP BY
        ss.score_id,
        ss.country_id,
        ss.goal_id,
        ss.year,
        ss.score,
        ss.rank_position,
        ss.trend,
        c.iso3,
        c.country_name,
        g.goal_number,
        g.goal_name

      ORDER BY
        ss.year DESC,
        c.country_name ASC,
        g.goal_number ASC
    `;

    const [rows] = await pool.query(sql, params);

    return NextResponse.json(rows);

  } catch (error: any) {
    console.error("MYSQL ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to load SDG scores",
        message: error.message,
        code: error.code,
        sqlMessage: error.sqlMessage,
      },
      { status: 500 }
    );
  }
}