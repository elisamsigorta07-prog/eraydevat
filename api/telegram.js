export default async function handler(req, res) {
  // CORS ayarları
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST method allowed" });
  }

  const { text } = req.body || {};
  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }

  const TG_BOT_TOKEN = "8826023436:AAFqqHsxSfP8eGEgwCGkmJd1D0pIc1_p7bo";
  const TG_CHAT_ID = "5411477981";

  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TG_CHAT_ID,
        text: text,
        parse_mode: "HTML"
      })
    });

    const data = await tgRes.json();
    return res.status(200).json({ success: true, result: data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
