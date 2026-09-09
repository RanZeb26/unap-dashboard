import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    // --------------------------------------------------
    // GLOBAL SCORE
    // --------------------------------------------------

    const [globalRows] = await db.query(`
      SELECT
        ROUND(AVG(overall_score), 1) AS globalScore
      FROM country_scores
      WHERE year = YEAR(CURDATE())
    `);

    // --------------------------------------------------
    // COUNTRY RANKINGS
    // --------------------------------------------------

    const [countryRows] = await db.query(`
      SELECT
        c.country_id,
        c.iso2,
        c.iso3,
        c.country_name AS name,
        cs.overall_score AS score,
        cs.rank_position AS rank
      FROM country_scores cs

      INNER JOIN countries c
        ON c.country_id = cs.country_id

      WHERE cs.year = YEAR(CURDATE())

      ORDER BY cs.overall_score DESC

      LIMIT 10
    `);

    // --------------------------------------------------
    // SDG PERFORMANCE
    // --------------------------------------------------

    const [sdgRows] = await db.query(`
      SELECT
        g.goal_number,
        g.goal_name,
        ROUND(AVG(s.score), 1) AS value

      FROM sdg_scores s

      INNER JOIN sdg_goals g
        ON g.goal_id = s.goal_id

      WHERE s.year = YEAR(CURDATE())

      GROUP BY
        g.goal_id,
        g.goal_number,
        g.goal_name

      ORDER BY g.goal_number
    `);

    // --------------------------------------------------
    // REGIONAL PERFORMANCE
    // --------------------------------------------------

    const [regionalRows] = await db.query(`
      SELECT
        r.region_code,
        r.region_name AS name,
        ROUND(AVG(cs.overall_score), 1) AS score

      FROM country_scores cs

      INNER JOIN countries c
        ON c.country_id = cs.country_id

      INNER JOIN regions r
        ON r.region_id = c.region_id

      WHERE cs.year = YEAR(CURDATE())

      GROUP BY
        r.region_id,
        r.region_code,
        r.region_name

      ORDER BY score DESC
    `);

    return NextResponse.json({
      success: true,

      globalScore:
        (globalRows as any[])[0]?.globalScore ?? 0,

      countries: countryRows,

      sdgGoals: sdgRows,

      regions: regionalRows,
    });

  } catch (error) {

    console.error("Dashboard API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve dashboard data",
      },
      {
        status: 500,
      }
    );
  }
}