import { NextResponse } from "next/server";
import pool from "@/lib/db";

// =====================================================
// GET SDG GOALS
// =====================================================

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT
        goal_id,
        goal_number,
        goal_name
      FROM sdg_goals
      ORDER BY goal_number ASC
    `);

    return NextResponse.json(rows);

  } catch (error: any) {
    console.error("MYSQL ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to load SDG goals",
        message: error.message,
        code: error.code,
        sqlMessage: error.sqlMessage,
      },
      { status: 500 }
    );
  }
}


// =====================================================
// CREATE SDG GOAL
// =====================================================

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      goal_number,
      goal_name,
    } = body;

    if (
      goal_number === undefined ||
      !goal_name ||
      !goal_name.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "Goal number and goal name are required",
        },
        { status: 400 }
      );
    }

    const number = Number(goal_number);

    if (
      Number.isNaN(number) ||
      number < 1 ||
      number > 17
    ) {
      return NextResponse.json(
        {
          error:
            "Goal number must be between 1 and 17",
        },
        { status: 400 }
      );
    }

    // Check duplicate goal number

    const [existing]: any = await pool.query(
      `
      SELECT goal_id
      FROM sdg_goals
      WHERE goal_number = ?
      `,
      [number]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        {
          error:
            "This SDG goal number already exists",
        },
        { status: 409 }
      );
    }

    const [result]: any = await pool.query(
      `
      INSERT INTO sdg_goals
      (
        goal_number,
        goal_name
      )
      VALUES (?, ?)
      `,
      [
        number,
        goal_name.trim(),
      ]
    );

    return NextResponse.json(
      {
        success: true,
        message: "SDG goal created successfully",
        goal_id: result.insertId,
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("MYSQL ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to create SDG goal",
        message: error.message,
        code: error.code,
        sqlMessage: error.sqlMessage,
      },
      { status: 500 }
    );
  }
}