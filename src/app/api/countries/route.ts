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

export async function POST(request: Request) {
  try {

    const body = await request.json();

    const {
      iso3,
      country_name,
      region_id
    } = body;

    // Validation
    if (!iso3 || !country_name) {
      return NextResponse.json(
        {
          error: "ISO3 and country name are required"
        },
        { status: 400 }
      );
    }

    // Insert
    const [result]: any = await pool.query(
      `
      INSERT INTO countries
      (
        iso3,
        country_name,
        region_id
      )
      VALUES (?, ?, ?)
      `,
      [
        iso3.toUpperCase(),
        country_name,
        region_id || null
      ]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Country added successfully",
        country_id: result.insertId
      },
      { status: 201 }
    );

  } catch (error: any) {

    console.error("MYSQL ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to add country",
        message: error.message,
        code: error.code,
        sqlMessage: error.sqlMessage,
      },
      { status: 500 }
    );
  }
}

