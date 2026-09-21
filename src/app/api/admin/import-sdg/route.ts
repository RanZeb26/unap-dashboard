import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

type GeoJsonFeature = {
  type: string;
  id?: number;
  geometry?: {
    type: string;
    coordinates?: number[];
  };
  properties: Record<string, any>;
};

type GeoJsonData = {
  type: string;
  features: GeoJsonFeature[];
};

export async function POST(request: NextRequest) {
  const connection = await pool.getConnection();

  let importId: number | null = null;

  try {
    const body = await request.json();

    const data: GeoJsonData = body.data;

    const sourceId = Number(body.source_id || 1);

    const datasetYear = Number(
      body.dataset_year || 2026
    );

    const sourceName =
      body.source_name ||
      "Sustainable Development Report 2026";

    if (!data || !Array.isArray(data.features)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid GeoJSON format. Expected FeatureCollection.",
        },
        { status: 400 }
      );
    }

    await connection.beginTransaction();

    /*
     * =========================================================
     * 1. CREATE IMPORT RECORD
     * =========================================================
     */

    const [importResult]: any =
      await connection.execute(
        `
        INSERT INTO dataset_imports
        (
          source_name,
          source_url,
          dataset_year,
          file_name,
          status
        )
        VALUES (?, ?, ?, ?, 'processing')
        `,
        [
          sourceName,
          body.source_url || null,
          datasetYear,
          body.file_name || null,
        ]
      );

    importId = importResult.insertId;

    let processed = 0;
    let inserted = 0;
    let updated = 0;

    /*
     * =========================================================
     * 2. PROCESS COUNTRIES
     * =========================================================
     */

    for (const feature of data.features) {
      const properties = feature.properties || {};

      const iso3 = String(
        properties.Country || ""
      )
        .trim()
        .toUpperCase();

      const countryName = String(
        properties.Name || ""
      ).trim();

      const regionName = String(
        properties.Region || ""
      ).trim();

      if (!iso3 || !countryName) {
        console.warn(
          "Skipping feature without ISO3 or country name:",
          properties
        );

        continue;
      }

      /*
       * =======================================================
       * ISO2
       * =======================================================
       */

      const iso2 = getIso2FromIso3(iso3);

      if (!iso2) {
        console.warn(
          `No ISO2 mapping found for ISO3: ${iso3}`
        );

        throw new Error(
          `Missing ISO2 mapping for country ${iso3} (${countryName}).`
        );
      }

      /*
       * =======================================================
       * 3. REGION
       * =======================================================
       */

      let regionId: number | null = null;

      if (regionName) {
        const regionCode =
          createRegionCode(regionName);

        const [regionRows]: any =
          await connection.execute(
            `
            SELECT region_id
            FROM regions
            WHERE region_code = ?
            LIMIT 1
            `,
            [regionCode]
          );

        if (regionRows.length > 0) {
          regionId =
            regionRows[0].region_id;
        } else {
          const [regionInsert]: any =
            await connection.execute(
              `
              INSERT INTO regions
              (
                region_code,
                region_name
              )
              VALUES (?, ?)
              `,
              [
                regionCode,
                regionName,
              ]
            );

          regionId =
            regionInsert.insertId;
        }
      }

      /*
       * =======================================================
       * 4. COUNTRY
       * =======================================================
       */

      const [countryRows]: any =
        await connection.execute(
          `
          SELECT country_id
          FROM countries
          WHERE iso3 = ?
          LIMIT 1
          `,
          [iso3]
        );

      let countryId: number;

      if (countryRows.length > 0) {
        /*
         * Existing country
         */

        countryId =
          countryRows[0].country_id;

        await connection.execute(
          `
          UPDATE countries
          SET
            iso2 = ?,
            country_name = ?,
            region_id = ?
          WHERE country_id = ?
          `,
          [
            iso2,
            countryName,
            regionId,
            countryId,
          ]
        );

        updated++;
      } else {
        /*
         * New country
         */

        const [countryInsert]: any =
          await connection.execute(
            `
            INSERT INTO countries
            (
              iso2,
              iso3,
              country_name,
              region_id
            )
            VALUES (?, ?, ?, ?)
            `,
            [
              iso2,
              iso3,
              countryName,
              regionId,
            ]
          );

        countryId =
          countryInsert.insertId;

        inserted++;
      }

      /*
       * =======================================================
       * 5. OVERALL COUNTRY SCORE
       * =======================================================
       */

      const overallScore =
        toNumber(
          properties.Overall_Score
        );

      const overallRank =
        toInteger(
          properties.Overall_Rank
        );

      const spilloverScore =
        toNumber(
          properties.Spillover_Score
        );

      const progressScore =
        toNumber(
          properties.progress
        );

      await connection.execute(
        `
        INSERT INTO country_scores
        (
          country_id,
          year,
          overall_score,
          rank_position,
          spillover_score,
          progress_score,
          source_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)

        ON DUPLICATE KEY UPDATE

          overall_score =
            VALUES(overall_score),

          rank_position =
            VALUES(rank_position),

          spillover_score =
            VALUES(spillover_score),

          progress_score =
            VALUES(progress_score),

          source_id =
            VALUES(source_id)
        `,
        [
          countryId,
          datasetYear,
          overallScore,
          overallRank,
          spilloverScore,
          progressScore,
          sourceId,
        ]
      );

      /*
       * =======================================================
       * 6. SDG GOAL SCORES 1-17
       * =======================================================
       */

      for (
        let goalNumber = 1;
        goalNumber <= 17;
        goalNumber++
      ) {
        const goalScore =
          toNumber(
            properties[
              `Goal_${goalNumber}_Score`
            ]
          );

        if (goalScore === null) {
          continue;
        }

        const goalId =
          await getGoalId(
            connection,
            goalNumber
          );

        if (!goalId) {
          console.warn(
            `Goal ${goalNumber} not found in sdg_goals`
          );

          continue;
        }

        await connection.execute(
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
          VALUES (?, ?, ?, ?, NULL, NULL)

          ON DUPLICATE KEY UPDATE
            score = VALUES(score)
          `,
          [
            countryId,
            goalId,
            datasetYear,
            goalScore,
          ]
        );
      }

      /*
       * =======================================================
       * 7. INDICATOR DATA
       * =======================================================
       */

      for (
        const key of Object.keys(properties)
      ) {
        if (
          !key.startsWith("Value_sdg")
        ) {
          continue;
        }

        const indicatorValue =
          toNumber(properties[key]);

        if (indicatorValue === null) {
          continue;
        }

        /*
         * Example:
         *
         * Value_sdg1_wpc
         */

        const match =
          key.match(
            /^Value_sdg(\d+)_(.+)$/
          );

        if (!match) {
          continue;
        }

        const goalNumber =
          Number(match[1]);

        const indicatorCode =
          match[2];

        const yearKey =
          `Year_sdg${goalNumber}_${indicatorCode}`;

        const scoreKey =
          `Score_sdg${goalNumber}_${indicatorCode}`;

        const ratingKey =
          `Rating_sdg${goalNumber}_${indicatorCode}`;

        const trendKey =
          `Trend_sdg${goalNumber}_${indicatorCode}`;

        const indicatorYear =
          toInteger(
            properties[yearKey]
          ) || datasetYear;

        const indicatorScore =
          toNumber(
            properties[scoreKey]
          );

        const rating =
          properties[ratingKey] ||
          null;

        const trend =
          properties[trendKey] ||
          null;

        const goalId =
          await getGoalId(
            connection,
            goalNumber
          );

        if (!goalId) {
          continue;
        }

        /*
         * Find existing indicator
         */

        const [indicatorRows]: any =
          await connection.execute(
            `
            SELECT indicator_id
            FROM indicators
            WHERE goal_id = ?
              AND indicator_code = ?
            LIMIT 1
            `,
            [
              goalId,
              indicatorCode,
            ]
          );

        let indicatorId: number;

        if (
          indicatorRows.length > 0
        ) {
          indicatorId =
            indicatorRows[0].indicator_id;
        } else {
          /*
           * Create indicator if missing
           */

          const [indicatorInsert]: any =
            await connection.execute(
              `
              INSERT INTO indicators
              (
                goal_id,
                indicator_code,
                indicator_name,
                description,
                unit,
                direction
              )
              VALUES (?, ?, ?, NULL, NULL, NULL)
              `,
              [
                goalId,
                indicatorCode,
                indicatorCode,
              ]
            );

          indicatorId =
            indicatorInsert.insertId;
        }

        /*
         * =====================================================
         * 8. INDICATOR VALUE
         * =====================================================
         */

        await connection.execute(
          `
          INSERT INTO sdg_values
          (
            country_id,
            indicator_id,
            year,
            value,
            target_value,
            source_id,
            data_status,
            indicator_score,
            rating,
            trend
          )
          VALUES (?, ?, ?, ?, NULL, ?, 'official', ?, ?, ?)

          ON DUPLICATE KEY UPDATE

            value =
              VALUES(value),

            source_id =
              VALUES(source_id),

            data_status =
              VALUES(data_status),

            indicator_score =
              VALUES(indicator_score),

            rating =
              VALUES(rating),

            trend =
              VALUES(trend)
          `,
          [
            countryId,
            indicatorId,
            indicatorYear,
            indicatorValue,
            sourceId,
            indicatorScore,
            rating,
            trend,
          ]
        );
      }

      processed++;
    }

    /*
     * =========================================================
     * 9. COMPLETE IMPORT RECORD
     * =========================================================
     */

    await connection.execute(
      `
      UPDATE dataset_imports
      SET
        records_processed = ?,
        records_inserted = ?,
        records_updated = ?,
        status = 'completed'
      WHERE import_id = ?
      `,
      [
        processed,
        inserted,
        updated,
        importId,
      ]
    );

    await connection.commit();

    return NextResponse.json({
      success: true,

      message:
        "SDG dataset imported successfully.",

      import_id: importId,

      records_processed:
        processed,

      records_inserted:
        inserted,

      records_updated:
        updated,
    });
  } catch (error: any) {
    /*
     * =========================================================
     * ERROR HANDLING
     * =========================================================
     */

    console.error(
      "================================="
    );

    console.error(
      "SDG IMPORT ERROR"
    );

    console.error(
      "Message:",
      error?.message
    );

    console.error(
      "Code:",
      error?.code
    );

    console.error(
      "SQL Message:",
      error?.sqlMessage
    );

    console.error(
      "Stack:",
      error?.stack
    );

    console.error(
      "================================="
    );

    try {
      await connection.rollback();
    } catch (
      rollbackError
    ) {
      console.error(
        "Rollback error:",
        rollbackError
      );
    }

    /*
     * Mark import as failed
     */

    if (importId) {
      try {
        await connection.execute(
          `
          UPDATE dataset_imports
          SET
            status = 'failed',
            error_message = ?
          WHERE import_id = ?
          `,
          [
            error?.message ||
              String(error),

            importId,
          ]
        );
      } catch (
        updateError
      ) {
        console.error(
          "Could not update import status:",
          updateError
        );
      }
    }

    return NextResponse.json(
      {
        success: false,

        message:
          "Failed to import SDG dataset.",

        error:
          error?.message ||
          String(error),

        code:
          error?.code ||
          null,

        sqlMessage:
          error?.sqlMessage ||
          null,
      },
      {
        status: 500,
      }
    );
  } finally {
    connection.release();
  }
}

/*
 * ============================================================
 * NUMBER HELPERS
 * ============================================================
 */

function toNumber(
  value: any
): number | null {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    value === "null"
  ) {
    return null;
  }

  const number =
    Number(value);

  return Number.isNaN(number)
    ? null
    : number;
}

function toInteger(
  value: any
): number | null {
  const number =
    toNumber(value);

  return number === null
    ? null
    : Math.round(number);
}

/*
 * ============================================================
 * GET SDG GOAL ID
 * ============================================================
 */

async function getGoalId(
  connection: any,
  goalNumber: number
): Promise<number | null> {
  const [rows]: any =
    await connection.execute(
      `
      SELECT goal_id
      FROM sdg_goals
      WHERE goal_number = ?
      LIMIT 1
      `,
      [goalNumber]
    );

  if (rows.length === 0) {
    return null;
  }

  return rows[0].goal_id;
}

/*
 * ============================================================
 * REGION CODE
 * ============================================================
 */

function createRegionCode(
  regionName: string
): string {
  return regionName
    .trim()
    .toUpperCase()
    .replace(
      /[^A-Z0-9]+/g,
      "_"
    )
    .replace(
      /^_+|_+$/g,
      ""
    )
    .substring(0, 50);
}

/*
 * ============================================================
 * ISO3 → ISO2
 *
 * Complete ISO country mapping used by the importer.
 * ============================================================
 */
function getIso2FromIso3(
  iso3: string
): string | null {
  const map: Record<string, string> = {
    AFG: "AF",
    ALA: "AX",
    ALB: "AL",
    DZA: "DZ",
    ASM: "AS",
    AND: "AD",
    AGO: "AO",
    AIA: "AI",
    ATA: "AQ",
    ATG: "AG",
    ARG: "AR",
    ARM: "AM",
    ABW: "AW",
    AUS: "AU",
    AUT: "AT",
    AZE: "AZ",

    BHS: "BS",
    BHR: "BH",
    BGD: "BD",
    BRB: "BB",
    BLR: "BY",
    BEL: "BE",
    BLZ: "BZ",
    BEN: "BJ",
    BMU: "BM",
    BTN: "BT",
    BOL: "BO",
    BES: "BQ",
    BIH: "BA",
    BWA: "BW",
    BVT: "BV",
    BRA: "BR",
    IOT: "IO",
    BRN: "BN",
    BGR: "BG",
    BFA: "BF",
    BDI: "BI",

    CPV: "CV",
    KHM: "KH",
    CMR: "CM",
    CAN: "CA",
    CYM: "KY",
    CAF: "CF",
    TCD: "TD",
    CHL: "CL",
    CHN: "CN",
    CXR: "CX",
    CCK: "CC",
    COL: "CO",
    COM: "KM",
    COG: "CG",
    COD: "CD",
    COK: "CK",
    CRI: "CR",
    CIV: "CI",
    HRV: "HR",
    CUB: "CU",
    CUW: "CW",
    CYP: "CY",
    CZE: "CZ",

    DNK: "DK",
    DJI: "DJ",
    DMA: "DM",
    DOM: "DO",

    ECU: "EC",
    EGY: "EG",
    SLV: "SV",
    GNQ: "GQ",
    ERI: "ER",
    EST: "EE",
    SWZ: "SZ",
    ETH: "ET",

    FLK: "FK",
    FRO: "FO",
    FJI: "FJ",
    FIN: "FI",
    FRA: "FR",
    GUF: "GF",
    PYF: "PF",
    ATF: "TF",

    GAB: "GA",
    GMB: "GM",
    GEO: "GE",
    DEU: "DE",
    GHA: "GH",
    GIB: "GI",
    GRC: "GR",
    GRL: "GL",
    GRD: "GD",
    GLP: "GP",
    GUM: "GU",
    GTM: "GT",
    GGY: "GG",
    GIN: "GN",
    GNB: "GW",
    GUY: "GY",

    HTI: "HT",
    HMD: "HM",
    VAT: "VA",
    HND: "HN",
    HKG: "HK",
    HUN: "HU",

    ISL: "IS",
    IND: "IN",
    IDN: "ID",
    IRN: "IR",
    IRQ: "IQ",
    IRL: "IE",
    IMN: "IM",
    ISR: "IL",
    ITA: "IT",

    JAM: "JM",
    JPN: "JP",
    JEY: "JE",
    JOR: "JO",

    KAZ: "KZ",
    KEN: "KE",
    KIR: "KI",
    PRK: "KP",
    KOR: "KR",
    KWT: "KW",
    KGZ: "KG",

    LAO: "LA",
    LVA: "LV",
    LBN: "LB",
    LSO: "LS",
    LBR: "LR",
    LBY: "LY",
    LIE: "LI",
    LTU: "LT",
    LUX: "LU",

    MAC: "MO",
    MDG: "MG",
    MWI: "MW",
    MYS: "MY",
    MDV: "MV",
    MLI: "ML",
    MLT: "MT",
    MHL: "MH",
    MTQ: "MQ",
    MRT: "MR",
    MUS: "MU",
    MYT: "YT",
    MEX: "MX",
    FSM: "FM",
    MDA: "MD",
    MCO: "MC",
    MNG: "MN",
    MNE: "ME",
    MSR: "MS",
    MAR: "MA",
    MOZ: "MZ",
    MMR: "MM",

    NAM: "NA",
    NRU: "NR",
    NPL: "NP",
    NLD: "NL",
    NCL: "NC",
    NZL: "NZ",
    NIC: "NI",
    NER: "NE",
    NGA: "NG",
    NIU: "NU",
    NFK: "NF",
    MKD: "MK",
    MNP: "MP",
    NOR: "NO",

    OMN: "OM",

    PAK: "PK",
    PLW: "PW",
    PSE: "PS",
    PAN: "PA",
    PNG: "PG",
    PRY: "PY",
    PER: "PE",
    PHL: "PH",
    PCN: "PN",
    POL: "PL",
    PRT: "PT",
    PRI: "PR",

    QAT: "QA",

    REU: "RE",
    ROU: "RO",
    RUS: "RU",
    RWA: "RW",

    BLM: "BL",
    SHN: "SH",
    KNA: "KN",
    LCA: "LC",
    MAF: "MF",
    SPM: "PM",
    VCT: "VC",
    WSM: "WS",
    SMR: "SM",
    STP: "ST",
    SAU: "SA",
    SEN: "SN",
    SRB: "RS",
    SYC: "SC",
    SLE: "SL",
    SGP: "SG",
    SXM: "SX",
    SVK: "SK",
    SVN: "SI",
    SLB: "SB",
    SOM: "SO",
    ZAF: "ZA",
    SGS: "GS",
    SSD: "SS",
    ESP: "ES",
    LKA: "LK",
    SDN: "SD",
    SUR: "SR",
    SJM: "SJ",
    SWE: "SE",
    CHE: "CH",
    SYR: "SY",

    TWN: "TW",
    TJK: "TJ",
    TZA: "TZ",
    THA: "TH",
    TLS: "TL",
    TGO: "TG",
    TKL: "TK",
    TON: "TO",
    TTO: "TT",
    TUN: "TN",
    TUR: "TR",
    TKM: "TM",
    TCA: "TC",
    TUV: "TV",

    UGA: "UG",
    UKR: "UA",
    ARE: "AE",
    GBR: "GB",
    USA: "US",
    UMI: "UM",
    URY: "UY",
    UZB: "UZ",

    VUT: "VU",
    VEN: "VE",
    VNM: "VN",
    VGB: "VG",
    VIR: "VI",

    WLF: "WF",

    ESH: "EH",

    YEM: "YE",

    ZMB: "ZM",
    ZWE: "ZW",
  };

  return map[iso3.trim().toUpperCase()] || null;
}