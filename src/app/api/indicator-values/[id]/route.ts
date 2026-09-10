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
          AND value_id <> ?
        `,
        [
          country_id,
          indicator_id,
          numericYear,
          id,
        ]
      );


    if (existing.length > 0) {

      return NextResponse.json(
        {
          error:
            "Another record already exists for this country, indicator and year.",
        },
        { status: 409 }
      );

    }


    // -------------------------------------------------
    // UPDATE
    // -------------------------------------------------

    const [result]: any =
      await pool.query(
        `
        UPDATE indicator_values
        SET
          country_id = ?,
          indicator_id = ?,
          year = ?,
          value = ?,
          target_value = ?,
          source_id = ?,
          data_status = ?
        WHERE value_id = ?
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
          id,
        ]
      );


    if (result.affectedRows === 0) {

      return NextResponse.json(
        {
          error:
            "Indicator value not found",
        },
        { status: 404 }
      );

    }


    return NextResponse.json({
      success: true,
      message:
        "Indicator value updated successfully",
    });


  } catch (error: any) {

    console.error("MYSQL ERROR:", error);

    return NextResponse.json(
      {
        error:
          "Failed to update indicator value",
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


    const [result]: any =
      await pool.query(
        `
        DELETE FROM indicator_values
        WHERE value_id = ?
        `,
        [id]
      );


    if (result.affectedRows === 0) {

      return NextResponse.json(
        {
          error:
            "Indicator value not found",
        },
        { status: 404 }
      );

    }


    return NextResponse.json({
      success: true,
      message:
        "Indicator value deleted successfully",
    });


  } catch (error: any) {

    console.error("MYSQL ERROR:", error);

    return NextResponse.json(
      {
        error:
          "Failed to delete indicator value",
        message: error.message,
        code: error.code,
        sqlMessage: error.sqlMessage,
      },
      { status: 500 }
    );

  }

}