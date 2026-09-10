import { NextResponse } from "next/server";
import pool from "@/lib/db";


// =====================================================
// UPDATE
// =====================================================

export async function PUT(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await params;

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

    // Check duplicate number excluding current record

    const [existing]: any = await pool.query(
      `
      SELECT goal_id
      FROM sdg_goals
      WHERE goal_number = ?
        AND goal_id <> ?
      `,
      [
        number,
        id,
      ]
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
      UPDATE sdg_goals
      SET
        goal_number = ?,
        goal_name = ?
      WHERE goal_id = ?
      `,
      [
        number,
        goal_name.trim(),
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        {
          error: "SDG goal not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "SDG goal updated successfully",
    });

  } catch (error: any) {
    console.error("MYSQL ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to update SDG goal",
        message: error.message,
        code: error.code,
        sqlMessage: error.sqlMessage,
      },
      { status: 500 }
    );
  }
}


// =====================================================
// DELETE
// =====================================================

export async function DELETE(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await params;

    // Check whether this goal is being used
    // by SDG scores

    const [scores]: any = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM sdg_scores
      WHERE goal_id = ?
      `,
      [id]
    );

    if (Number(scores[0].total) > 0) {
      return NextResponse.json(
        {
          error:
            "This SDG goal cannot be deleted because it has existing scores.",
        },
        { status: 409 }
      );
    }

    const [result]: any = await pool.query(
      `
      DELETE FROM sdg_goals
      WHERE goal_id = ?
      `,
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        {
          error: "SDG goal not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "SDG goal deleted successfully",
    });

  } catch (error: any) {
    console.error("MYSQL ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to delete SDG goal",
        message: error.message,
        code: error.code,
        sqlMessage: error.sqlMessage,
      },
      { status: 500 }
    );
  }
}