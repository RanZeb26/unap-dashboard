import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT
        region_id,
        region_name
      FROM regions
      ORDER BY region_name ASC
    `);

    return NextResponse.json(rows);

  } catch (error: any) {
    console.error("MYSQL ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to load regions",
        message: error.message,
        code: error.code,
        sqlMessage: error.sqlMessage,
      },
      { status: 500 }
    );
  }
}