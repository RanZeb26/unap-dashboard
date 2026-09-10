import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const countryId = Number(id);

    if (!countryId || Number.isNaN(countryId)) {
      return NextResponse.json(
        { error: "Invalid country ID" },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // COUNTRY
    // --------------------------------------------------

    const [countryRows]: any = await pool.query(
      `
      SELECT
        c.country_id,
        c.iso3,
        c.country_name,
        c.region_id,
        r.region_name
      FROM countries c
      LEFT JOIN regions r
        ON c.region_id = r.region_id
      WHERE c.country_id = ?
      `,
      [countryId]
    );

    if (!countryRows.length) {
      return NextResponse.json(
        { error: "Country not found" },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // OVERALL COUNTRY SCORE
    // --------------------------------------------------

    const [overallRows]: any = await pool.query(
      `
      SELECT
        ROUND(AVG(score), 2) AS overall_score
      FROM sdg_scores
      WHERE country_id = ?
      `,
      [countryId]
    );

    // --------------------------------------------------
    // SDG SCORES
    // --------------------------------------------------

    const [sdgRows]: any = await pool.query(
      `
      SELECT
        ss.score_id,
        ss.goal_id,
        ss.year,
        ss.score,
        ss.rank_position,
        ss.trend,
        g.goal_number,
        g.goal_name
      FROM sdg_scores ss
      INNER JOIN sdg_goals g
        ON ss.goal_id = g.goal_id
      WHERE ss.country_id = ?
      ORDER BY
        ss.year DESC,
        g.goal_number ASC
      `,
      [countryId]
    );

    // --------------------------------------------------
    // INDICATOR VALUES
    // --------------------------------------------------

const [indicatorRows]: any = await pool.query(
  `
  SELECT
    iv.value_id,
    iv.indicator_id,
    iv.year,
    iv.value,
    iv.target_value,
    iv.data_status,

    i.indicator_code,
    i.indicator_name,
    i.description,
    i.unit,
    i.direction,

    g.goal_id,
    g.goal_number,
    g.goal_name,

    s.source_id,
    s.source_name,
    s.organization,
    s.source_url,
    s.publication_date

  FROM indicator_values iv

  INNER JOIN indicators i
    ON iv.indicator_id = i.indicator_id

  INNER JOIN sdg_goals g
    ON i.goal_id = g.goal_id

  LEFT JOIN data_sources s
    ON iv.source_id = s.source_id

  WHERE iv.country_id = ?

  ORDER BY
    iv.year DESC,
    g.goal_number ASC,
    i.indicator_code ASC
  `,
  [countryId]
);

    // --------------------------------------------------
    // HISTORICAL SCORES
    // --------------------------------------------------

    const [historyRows]: any = await pool.query(
      `
      SELECT
        year,
        ROUND(AVG(score), 2) AS score
      FROM sdg_scores
      WHERE country_id = ?
      GROUP BY year
      ORDER BY year ASC
      `,
      [countryId]
    );

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    return NextResponse.json({
      country: countryRows[0],

      overall_score: Number(
        overallRows[0]?.overall_score ?? 0
      ),

      sdgs: sdgRows.map((row: any) => ({
        ...row,
        score: Number(row.score ?? 0),
      })),

      indicators: indicatorRows.map((row: any) => ({
        ...row,
        value:
          row.value !== null
            ? Number(row.value)
            : null,
        target_value:
          row.target_value !== null
            ? Number(row.target_value)
            : null,
      })),

      history: historyRows.map((row: any) => ({
        year: Number(row.year),
        score: Number(row.score ?? 0),
      })),
    });

  } catch (error: any) {
    console.error("COUNTRY API ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to load country data",
        message: error.message,
        code: error.code,
        sqlMessage: error.sqlMessage,
      },
      { status: 500 }
    );
  }
}