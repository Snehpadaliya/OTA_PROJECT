import { neon } from '@netlify/neon';

export const handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const sql = neon();

    const { version, firmwareFile, meta } = JSON.parse(event.body || "{}");

    if (!version || !firmwareFile || !meta) {
      return {
        statusCode: 400,
        body: JSON.stringify({ status: "error", message: "Missing fields" }),
      };
    }

    const firmwareBuffer = Buffer.from(firmwareFile, "base64");

    await sql`
      INSERT INTO firmware (version, firmware, meta)
      VALUES (${version}, ${firmwareBuffer}, ${JSON.stringify(meta)});
    `;

    return {
      statusCode: 200,
      body: JSON.stringify({ status: "ok", message: "Saved" }),
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ status: "error", message: error.message, stack: error.stack }),
    };
  }
};
