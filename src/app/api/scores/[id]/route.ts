import { NextResponse } from "next/server";
import pool from "@/lib/db";


// =====================================================
// UPDATE SCORE
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
      country_id,
      goal_id,
      year,
      score
    } = body;

    if (
      !country_id ||
      !goal_id ||
      !year ||
      score === undefined
    ) {

      return NextResponse.json(
        {
          error:
            "Country, SDG goal, year and score are required"
        },
        { status: 400 }
      );

    }

    const numericScore = Number(score);

    if (
      Number.isNaN(numericScore) ||
      numericScore < 0 ||
      numericScore > 100
    ) {

      return NextResponse.json(
        {
          error: "Score must be between 0 and 100"
        },
        { status: 400 }
      );

    }

    // -----------------------------------------------
    // GET PREVIOUS YEAR
    // -----------------------------------------------

    const [previous]: any = await pool.query(
      `
      SELECT score
      FROM sdg_scores
      WHERE country_id = ?
        AND goal_id = ?
        AND year < ?
      ORDER BY year DESC
      LIMIT 1
      `,
      [
        country_id,
        goal_id,
        year
      ]
    );

    let trend = "stable";

    if (previous.length > 0) {

      const previousScore =
        Number(previous[0].score);

      if (numericScore > previousScore) {
        trend = "improving";
      }

      if (numericScore < previousScore) {
        trend = "declining";
      }
    }

    // -----------------------------------------------
    // UPDATE
    // -----------------------------------------------

    const [result]: any = await pool.query(
      `
      UPDATE sdg_scores
      SET
        country_id = ?,
        goal_id = ?,
        year = ?,
        score = ?,
        trend = ?
      WHERE score_id = ?
      `,
      [
        country_id,
        goal_id,
        year,
        numericScore,
        trend,
        id
      ]
    );

    if (result.affectedRows === 0) {

      return NextResponse.json(
        {
          error: "Score not found"
        },
        { status: 404 }
      );

    }

    // -----------------------------------------------
    // RECALCULATE RANK
    // -----------------------------------------------

    await recalculateRanks(
      Number(goal_id),
      Number(year)
    );

    return NextResponse.json({
      success: true,
      message: "SDG score updated successfully"
    });

  } catch (error: any) {

    console.error("MYSQL ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to update score",
        message: error.message,
        code: error.code,
        sqlMessage: error.sqlMessage,
      },
      { status: 500 }
    );
  }
}


// =====================================================
// DELETE SCORE
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

    // Get information before deleting
    const [rows]: any = await pool.query(
      `
      SELECT
        goal_id,
        year
      FROM sdg_scores
      WHERE score_id = ?
      `,
      [id]
    );

    if (rows.length === 0) {

      return NextResponse.json(
        {
          error: "Score not found"
        },
        { status: 404 }
      );

    }

    const goalId = rows[0].goal_id;
    const year = rows[0].year;

    // Delete
    await pool.query(
      `
      DELETE FROM sdg_scores
      WHERE score_id = ?
      `,
      [id]
    );

    // Recalculate ranks
    await recalculateRanks(
      Number(goalId),
      Number(year)
    );

    return NextResponse.json({
      success: true,
      message: "SDG score deleted successfully"
    });

  } catch (error: any) {

    console.error("MYSQL ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to delete score",
        message: error.message,
        code: error.code,
        sqlMessage: error.sqlMessage,
      },
      { status: 500 }
    );
  }
}


// =====================================================
// RANK CALCULATION
// =====================================================

async function recalculateRanks(
  goalId: number,
  year: number
) {

  const [rows]: any = await pool.query(
    `
    SELECT
      score_id,
      score
    FROM sdg_scores
    WHERE goal_id = ?
      AND year = ?
    ORDER BY score DESC
    `,
    [
      goalId,
      year
    ]
  );

  for (let i = 0; i < rows.length; i++) {

    await pool.query(
      `
      UPDATE sdg_scores
      SET rank_position = ?
      WHERE score_id = ?
      `,
      [
        i + 1,
        rows[i].score_id
      ]
    );

  }
}