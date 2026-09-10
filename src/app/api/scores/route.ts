import { NextResponse } from "next/server";
import pool from "@/lib/db";

// =====================================================
// GET SCORES
// =====================================================

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT
        ss.score_id,
        ss.country_id,
        ss.goal_id,
        ss.year,
        ss.score,
        ss.rank_position,
        ss.trend,
        ss.created_at,

        c.iso3,
        c.country_name,

        g.goal_number,
        g.goal_name

      FROM sdg_scores ss

      INNER JOIN countries c
        ON ss.country_id = c.country_id

      INNER JOIN sdg_goals g
        ON ss.goal_id = g.goal_id

      ORDER BY
        ss.year DESC,
        c.country_name ASC,
        g.goal_number ASC
    `);

    return NextResponse.json(rows);

  } catch (error: any) {

    console.error("MYSQL ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to load scores",
        message: error.message,
        code: error.code,
        sqlMessage: error.sqlMessage,
      },
      { status: 500 }
    );
  }
}


// =====================================================
// ADD SCORE
// =====================================================

export async function POST(request: Request) {

  try {

    const body = await request.json();

    const {
      country_id,
      goal_id,
      year,
      score
    } = body;

    // -----------------------------------------------
    // VALIDATION
    // -----------------------------------------------

    if (!country_id || !goal_id || !year || score === undefined) {

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
    // CHECK DUPLICATE
    // -----------------------------------------------

    const [existing]: any = await pool.query(
      `
      SELECT score_id
      FROM sdg_scores
      WHERE country_id = ?
        AND goal_id = ?
        AND year = ?
      `,
      [
        country_id,
        goal_id,
        year
      ]
    );

    if (existing.length > 0) {

      return NextResponse.json(
        {
          error:
            "A score already exists for this country, SDG and year"
        },
        { status: 409 }
      );

    }

    // -----------------------------------------------
    // GET PREVIOUS YEAR SCORE
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

    // -----------------------------------------------
    // CALCULATE TREND
    // -----------------------------------------------

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
    // INSERT
    // -----------------------------------------------

    const [result]: any = await pool.query(
      `
      INSERT INTO sdg_scores
      (
        country_id,
        goal_id,
        year,
        score,
        rank_position,
        trend
      )
      VALUES (?, ?, ?, ?, NULL, ?)
      `,
      [
        country_id,
        goal_id,
        year,
        numericScore,
        trend
      ]
    );

    // -----------------------------------------------
    // RECALCULATE RANK
    // -----------------------------------------------

    await recalculateRanks(
      Number(goal_id),
      Number(year)
    );

    return NextResponse.json(
      {
        success: true,
        message: "SDG score added successfully",
        score_id: result.insertId
      },
      {
        status: 201
      }
    );

  } catch (error: any) {

    console.error("MYSQL ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to add score",
        message: error.message,
        code: error.code,
        sqlMessage: error.sqlMessage,
      },
      {
        status: 500
      }
    );
  }
}


// =====================================================
// RECALCULATE RANKS
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