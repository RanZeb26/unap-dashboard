import { NextResponse } from "next/server";
import pool from "@/lib/db";

// =====================================================
// GET INDICATOR VALUES
// =====================================================

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT
        iv.value_id,
        iv.country_id,
        iv.indicator_id,
        iv.year,
        iv.value,
        iv.target_value,
        iv.source_id,
        iv.data_status,
        iv.created_at,

        c.iso3,
        c.country_name,

        i.indicator_code,
        i.indicator_name,
        i.unit,
        i.direction,

        g.goal_id,
        g.goal_number,
        g.goal_name,

        s.source_name,
        s.organization

      FROM indicator_values iv

      INNER JOIN countries c
        ON iv.country_id = c.country_id

      INNER JOIN indicators i
        ON iv.indicator_id = i.indicator_id

      INNER JOIN sdg_goals g
        ON i.goal_id = g.goal_id

      LEFT JOIN data_sources s
        ON iv.source_id = s.source_id

      ORDER BY
        iv.year DESC,
        c.country_name ASC,
        g.goal_number ASC,
        i.indicator_code ASC
    `);

    return NextResponse.json(rows);

  } catch (error: any) {

    console.error("MYSQL ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to load indicator values",
        message: error.message,
        code: error.code,
        sqlMessage: error.sqlMessage,
      },
      { status: 500 }
    );
  }
}


// =====================================================
// CREATE INDICATOR VALUE
// =====================================================

export async function POST(request: Request) {

  try {

    const body = await request.json();

    const {
      country_id,
      indicator_id,
      year,
      value,
      target_value,
      source_id,
      data_status,
    } = body;


    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

    if (!country_id) {

      return NextResponse.json(
        {
          error: "Country is required",
        },
        { status: 400 }
      );

    }


    if (!indicator_id) {

      return NextResponse.json(
        {
          error: "Indicator is required",
        },
        { status: 400 }
      );

    }


    if (!year) {

      return NextResponse.json(
        {
          error: "Year is required",
        },
        { status: 400 }
      );

    }


    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {

      return NextResponse.json(
        {
          error: "Value is required",
        },
        { status: 400 }
      );

    }


    const numericYear = Number(year);
    const numericValue = Number(value);

    const numericTarget =
      target_value === "" ||
      target_value === null ||
      target_value === undefined
        ? null
        : Number(target_value);


    if (
      Number.isNaN(numericYear) ||
      numericYear < 1900 ||
      numericYear > 2100
    ) {

      return NextResponse.json(
        {
          error: "Invalid year",
        },
        { status: 400 }
      );

    }


    if (Number.isNaN(numericValue)) {

      return NextResponse.json(
        {
          error: "Value must be numeric",
        },
        { status: 400 }
      );

    }


    if (
      numericTarget !== null &&
      Number.isNaN(numericTarget)
    ) {

      return NextResponse.json(
        {
          error: "Target value must be numeric",
        },
        { status: 400 }
      );

    }


    // -------------------------------------------------
    // DATA STATUS
    // -------------------------------------------------

    const validStatuses = [
      "official",
      "estimated",
      "modeled",
      "missing",
    ];

    const status =
      data_status || "official";


    if (!validStatuses.includes(status)) {

      return NextResponse.json(
        {
          error: "Invalid data status",
        },
        { status: 400 }
      );

    }


    // -------------------------------------------------
    // CHECK COUNTRY
    // -------------------------------------------------

    const [countryRows]: any =
      await pool.query(
        `
        SELECT country_id
        FROM countries
        WHERE country_id = ?
        `,
        [country_id]
      );


    if (countryRows.length === 0) {

      return NextResponse.json(
        {
          error: "Country not found",
        },
        { status: 404 }
      );

    }


    // -------------------------------------------------
    // CHECK INDICATOR
    // -------------------------------------------------

    const [indicatorRows]: any =
      await pool.query(
        `
        SELECT indicator_id
        FROM indicators
        WHERE indicator_id = ?
        `,
        [indicator_id]
      );


    if (indicatorRows.length === 0) {

      return NextResponse.json(
        {
          error: "Indicator not found",
        },
        { status: 404 }
      );

    }


    // -------------------------------------------------
    // CHECK SOURCE
    // -------------------------------------------------

    if (source_id) {

      const [sourceRows]: any =
        await pool.query(
          `
          SELECT source_id
          FROM sources
          WHERE source_id = ?
          `,
          [source_id]
        );


      if (sourceRows.length === 0) {

        return NextResponse.json(
          {
            error: "Source not found",
          },
          { status: 404 }
        );

      }

    }


    // -------------------------------------------------
    // CHECK DUPLICATE
    // -------------------------------------------------

    const [existing]: any =
      await pool.query(
        `
        SELECT value_id
        FROM indicator_values
        WHERE country_id = ?
          AND indicator_id = ?
          AND year = ?
        `,
        [
          country_id,
          indicator_id,
          numericYear,
        ]
      );


    if (existing.length > 0) {

      return NextResponse.json(
        {
          error:
            "Data already exists for this country, indicator and year.",
        },
        { status: 409 }
      );

    }


    // -------------------------------------------------
    // INSERT
    // -------------------------------------------------

    const [result]: any =
      await pool.query(
        `
        INSERT INTO indicator_values
        (
          country_id,
          indicator_id,
          year,
          value,
          target_value,
          source_id,
          data_status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          Number(country_id),
          Number(indicator_id),
          numericYear,
          numericValue,
          numericTarget,
          source_id
            ? Number(source_id)
            : null,
          status,
        ]
      );


    return NextResponse.json(
      {
        success: true,
        message:
          "Indicator value created successfully",
        value_id: result.insertId,
      },
      { status: 201 }
    );


  } catch (error: any) {

    console.error("MYSQL ERROR:", error);

    return NextResponse.json(
      {
        error:
          "Failed to create indicator value",
        message: error.message,
        code: error.code,
        sqlMessage: error.sqlMessage,
      },
      { status: 500 }
    );

  }

}