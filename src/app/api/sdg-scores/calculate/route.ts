import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(request: Request) {
    
  try {
    const body = await request.json();

    const country_id = body.country_id
      ? Number(body.country_id)
      : null;

    const year = body.year
      ? Number(body.year)
      : null;

    if (country_id !== null && Number.isNaN(country_id)) {
      return NextResponse.json(
        { error: "Invalid country" },
        { status: 400 }
      );
    }

    if (year !== null && Number.isNaN(year)) {
      return NextResponse.json(
        { error: "Invalid year" },
        { status: 400 }
      );
    }

    /*
     * Get indicator values together with
     * indicator direction and SDG information.
     */

    let sql = `
      SELECT
        iv.value_id,
        iv.country_id,
        iv.indicator_id,
        iv.year,
        iv.value,
        iv.target_value,

        i.goal_id,
        i.direction,

        g.goal_number,
        g.goal_name

      FROM indicator_values iv

      INNER JOIN indicators i
        ON iv.indicator_id = i.indicator_id

      INNER JOIN sdg_goals g
        ON i.goal_id = g.goal_id

      WHERE iv.target_value IS NOT NULL
        AND iv.data_status <> 'missing'
    `;

    const params: any[] = [];

    if (country_id !== null) {
      sql += ` AND iv.country_id = ? `;
      params.push(country_id);
    }

    if (year !== null) {
      sql += ` AND iv.year = ? `;
      params.push(year);
    }

    const [rows]: any = await pool.query(sql, params);

    if (rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No indicator values available for calculation."
        },
        { status: 202 }
      );
    }

    /*
     * Calculate individual indicator scores.
     */

    for (const row of rows) {

      const value = Number(row.value);
      const target = Number(row.target_value);

      let score = 0;

      if (
        Number.isNaN(value) ||
        Number.isNaN(target) ||
        target === 0 ||
        value < 0
      ) {
        score = 0;
      } else if (row.direction === "higher_better") {

        score = (value / target) * 100;

      } else if (row.direction === "lower_better") {

        if (value === 0) {
          score = 100;
        } else {
          score = (target / value) * 100;
        }

      }

      /*
       * Keep score between 0 and 100.
       */

      score = Math.max(0, Math.min(100, score));

      row.calculated_score = Number(score.toFixed(4));
    }

    /*
     * Save individual indicator scores.
     */

    for (const row of rows) {

      await pool.query(
        `
        INSERT INTO sdg_indicator_scores
        (
          country_id,
          indicator_id,
          year,
          raw_value,
          target_value,
          score
        )
        VALUES (?, ?, ?, ?, ?, ?)

        ON DUPLICATE KEY UPDATE

          raw_value = VALUES(raw_value),
          target_value = VALUES(target_value),
          score = VALUES(score)
        `,
        [
          row.country_id,
          row.indicator_id,
          row.year,
          row.value,
          row.target_value,
          row.calculated_score
        ]
      );
    }

    /*
     * Group scores by:
     *
     * country + SDG + year
     */

    const grouped: Record<string, any> = {};

    for (const row of rows) {

      const key =
        `${row.country_id}_${row.goal_id}_${row.year}`;

      if (!grouped[key]) {

        grouped[key] = {
          country_id: row.country_id,
          goal_id: row.goal_id,
          year: row.year,
          scores: []
        };

      }

      grouped[key].scores.push(
        row.calculated_score
      );
    }

    /*
     * Calculate SDG scores.
     */

    const sdgScores = Object.values(grouped);

    for (const item of sdgScores) {

      const scores = item.scores;

      const average =
        scores.reduce(
          (sum: number, score: number) =>
            sum + score,
          0
        ) / scores.length;

      const finalScore =
        Number(average.toFixed(2));

      /*
       * Determine trend.
       */

      const [previousRows]: any = await pool.query(
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
          item.country_id,
          item.goal_id,
          item.year
        ]
      );

      let trend = "stable";

      if (previousRows.length > 0) {

        const previousScore =
          Number(previousRows[0].score);

        if (finalScore > previousScore + 1) {
          trend = "improving";
        } else if (finalScore < previousScore - 1) {
          trend = "declining";
        }

      }

      /*
       * Save SDG score.
       */

      await pool.query(
        `
        INSERT INTO sdg_scores
        (
          country_id,
          goal_id,
          year,
          score,
          trend
        )
        VALUES (?, ?, ?, ?, ?)

        ON DUPLICATE KEY UPDATE

          score = VALUES(score),
          trend = VALUES(trend)
        `,
        [
          item.country_id,
          item.goal_id,
          item.year,
          finalScore,
          trend
        ]
      );
    }

    return NextResponse.json({
      success: true,
      message: "SDG scores calculated successfully.",
      indicators_processed: rows.length,
      sdg_scores_generated: sdgScores.length
    });

  } catch (error: any) {

    console.error(
      "SDG SCORE CALCULATION ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to calculate SDG scores",
        message: error.message,
        code: error.code,
        sqlMessage: error.sqlMessage
      },
      { status: 500 }
    );
  }
}