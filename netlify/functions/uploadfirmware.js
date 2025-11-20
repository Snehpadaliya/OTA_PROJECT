const { neon } = require("@neondatabase/serverless");

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: "Method Not Allowed"
      };
    }

    const sql = neon(process.env.NETLIFY_DATABASE_URL);

    const { version, firmwareFile, meta } = JSON.parse(event.body || "{}");

    if (!version || !firmwareFile || !meta) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          status: "error",
          message: "Missing fields"
        })
      };
    }

    const firmwareBuffer = Buffer.from(firmwareFile, "base64");

    await sql`
      INSERT INTO firmware (version, firmware, meta)
      VALUES (${version}, ${firmwareBuffer}, ${JSON.stringify(meta)});
    `;

    return {
      statusCode: 200,
      body: JSON.stringify({ status: "ok", message: "Saved to DB" })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        status: "error",
        message: err.message,
        stack: err.stack
      })
    };
  }
};
