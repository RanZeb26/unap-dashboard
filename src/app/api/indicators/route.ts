import { NextResponse } from "next/server";
import pool from "@/lib/db";

// =====================================================
// GET INDICATORS
// =====================================================

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT
        i.indicator_id,
        i.goal_id,
        i.indicator_code,
        i.indicator_name,
        i.description,
        i.unit,
        i.direction,
        i.created_at,

        g.goal_number,
        g.goal_name

      FROM indicators i

      INNER JOIN sdg_goals g
        ON i.goal_id = g.goal_id

      ORDER BY
        g.goal_number ASC,
        i.indicator_code ASC
    `);

    return NextResponse.json(rows);

  } catch (error: any) {
    console.error("MYSQL ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to load indicators",
        message: error.message,
        code: error.code,
        sqlMessage: error.sqlMessage,
      },
      { status: 500 }
    );
  }
}


// =====================================================
// CREATE INDICATOR
// =====================================================

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      goal_id,
      indicator_code,
      indicator_name,
      description,
      unit,
      direction,
    } = body;

    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

    if (!goal_id) {
      return NextResponse.json(
        {
          error: "SDG goal is required",
        },
        { status: 400 }
      );
    }

    if (!indicator_code?.trim()) {
      return NextResponse.json(
        {
          error: "Indicator code is required",
        },
        { status: 400 }
      );
    }

    if (!indicator_name?.trim()) {
      return NextResponse.json(
        {
          error: "Indicator name is required",
        },
        { status: 400 }
      );
    }

    if (
      direction !== "higher_better" &&
      direction !== "lower_better"
    ) {
      return NextResponse.json(
        {
          error:
            "Direction must be higher_better or lower_better",
        },
        { status: 400 }
      );
    }

    // -------------------------------------------------
    // CHECK GOAL
    // -------------------------------------------------

    const [goalRows]: any = await pool.query(
      `
      SELECT goal_id
      FROM sdg_goals
      WHERE goal_id = ?
      `,
      [goal_id]
    );

    if (goalRows.length === 0) {
      return NextResponse.json(
        {
          error: "SDG goal not found",
        },
        { status: 404 }
      );
    }

    // -------------------------------------------------
    // CHECK DUPLICATE CODE
    // -------------------------------------------------

    const [existing]: any = await pool.query(
      `
      SELECT indicator_id
      FROM indicators
      WHERE indicator_code = ?
      `,
      [indicator_code.trim()]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        {
          error:
            "This indicator code already exists",
        },
        { status: 409 }
      );
    }

    // -------------------------------------------------
    // INSERT
    // -------------------------------------------------

    const [result]: any = await pool.query(
      `
      INSERT INTO indicators
      (
        goal_id,
        indicator_code,
        indicator_name,
        description,
        unit,
        direction
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        Number(goal_id),
        indicator_code.trim(),
        indicator_name.trim(),
        description?.trim() || null,
        unit?.trim() || null,
        direction,
      ]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Indicator created successfully",
        indicator_id: result.insertId,
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("MYSQL ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to create indicator",
        message: error.message,
        code: error.code,
        sqlMessage: error.sqlMessage,
      },
      { status: 500 }
    );
  }
}