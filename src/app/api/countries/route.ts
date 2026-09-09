import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT
        c.country_id,
        c.iso3,
        c.country_name,
        r.region_name,
        AVG(s.score) AS score
      FROM countries c
      LEFT JOIN regions r
        ON c.region_id = r.region_id
      LEFT JOIN sdg_scores s
        ON c.country_id = s.country_id
      GROUP BY
        c.country_id,
        c.iso3,
        c.country_name,
        r.region_name
      ORDER BY score DESC
    `);

    return NextResponse.json(rows);

  } catch (error: any) {
    console.error("MYSQL ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to load countries",
        message: error.message,
        code: error.code,
        sqlMessage: error.sqlMessage,
      },
      { status: 500 }
    );
  }
}