import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    // --------------------------------------------------
    // 1. GLOBAL AVERAGE SCORE
    // --------------------------------------------------

    const [globalRows]: any = await pool.query(`
      SELECT
        ROUND(AVG(score), 2) AS global_score
      FROM sdg_scores
    `);

    // --------------------------------------------------
    // 2. TOTAL COUNTRIES
    // --------------------------------------------------

    const [countryRows]: any = await pool.query(`
      SELECT COUNT(*) AS total_countries
      FROM countries
    `);

    // --------------------------------------------------
    // 3. TOTAL SDG SCORES
    // --------------------------------------------------

    const [scoreRows]: any = await pool.query(`
      SELECT COUNT(*) AS total_scores
      FROM sdg_scores
    `);

    // --------------------------------------------------
    // 4. SDG PERFORMANCE
    // --------------------------------------------------

    const [sdgRows]: any = await pool.query(`
      SELECT
        g.goal_id,
        g.goal_number,
        g.goal_name,

        ROUND(
          AVG(ss.score),
          2
        ) AS average_score,

        COUNT(ss.score_id) AS country_count

      FROM sdg_goals g

      LEFT JOIN sdg_scores ss
        ON g.goal_id = ss.goal_id

      GROUP BY
        g.goal_id,
        g.goal_number,
        g.goal_name

      ORDER BY
        g.goal_number ASC
    `);

    // --------------------------------------------------
    // 5. COUNTRY RANKING
    // --------------------------------------------------

    const [rankingRows]: any = await pool.query(`
      SELECT
        c.country_id,
        c.iso3,
        c.country_name,

        r.region_name,

        ROUND(
          AVG(ss.score),
          2
        ) AS score,

        COUNT(ss.score_id) AS sdg_count

      FROM countries c

      LEFT JOIN regions r
        ON c.region_id = r.region_id

      LEFT JOIN sdg_scores ss
        ON c.country_id = ss.country_id

      GROUP BY
        c.country_id,
        c.iso3,
        c.country_name,
        r.region_name

      HAVING score IS NOT NULL

      ORDER BY
        score DESC
    `);

    // --------------------------------------------------
    // 6. TREND SUMMARY
    // --------------------------------------------------

    const [trendRows]: any = await pool.query(`
      SELECT
        trend,
        COUNT(*) AS total
      FROM sdg_scores
      GROUP BY trend
    `);

    // --------------------------------------------------
    // 7. REGIONAL PERFORMANCE
    // --------------------------------------------------

    const [regionalRows]: any = await pool.query(`
      SELECT
        r.region_id,
        r.region_name,

        ROUND(
          AVG(ss.score),
          2
        ) AS average_score,

        COUNT(
          DISTINCT ss.country_id
        ) AS country_count

      FROM regions r

      LEFT JOIN countries c
        ON r.region_id = c.region_id

      LEFT JOIN sdg_scores ss
        ON c.country_id = ss.country_id

      GROUP BY
        r.region_id,
        r.region_name

      HAVING average_score IS NOT NULL

      ORDER BY
        average_score DESC
    `);

    return NextResponse.json({

      global_score:
        globalRows[0]?.global_score || 0,

      total_countries:
        countryRows[0]?.total_countries || 0,

      total_scores:
        scoreRows[0]?.total_scores || 0,

      sdgs:
        sdgRows,

      rankings:
        rankingRows,

      trends:
        trendRows,

      regions:
        regionalRows,

    });

  } catch (error: any) {

    console.error(
      "DASHBOARD MYSQL ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to load dashboard data",
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