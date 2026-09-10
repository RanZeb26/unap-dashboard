import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {

  try {

    const [rows] = await pool.query(`
      SELECT
        source_id,
        source_name,
        organization,
        source_url,
        publication_date,
        methodology,
        created_at
      FROM data_sources
      ORDER BY source_name ASC
    `);

    return NextResponse.json(rows);

  } catch (error: any) {

    console.error("MYSQL ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to load sources",
        message: error.message,
        code: error.code,
        sqlMessage: error.sqlMessage,
      },
      { status: 500 }
    );

  }

}