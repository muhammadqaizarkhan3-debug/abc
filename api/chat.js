require("dotenv").config();

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server is missing GEMINI_API_KEY" });
  }

  const { systemPrompt, contents } = req.body || {};
  if (!contents) {
    return res.status(400).json({ error: "Missing 'contents' in request body" });
  }

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt || "" }] },
          contents
        })
      }
    );

    const text = await geminiRes.text();
    if (!text) {
      return res.status(502).json({ error: "Empty response from Gemini API" });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(502).json({ error: "Invalid JSON from Gemini API" });
    }

    if (!geminiRes.ok) {
      return res.status(geminiRes.status).json({
        error: (data.error && data.error.message) || "Gemini API request failed"
      });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};