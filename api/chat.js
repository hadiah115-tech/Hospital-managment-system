
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const response = await fetch(
      "https://chattermate.ai/api/chat/stream",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.CHATTERMATE_API_KEY
        },
        body: JSON.stringify({
          prompt: prompt,
          models: ["auto"],
          conversation_id: null,
          web_search: false
        })
      }
    );

    res.statusCode = response.status;
    res.setHeader(
      "Content-Type",
      "text/event-stream"
    );
    res.setHeader("Cache-Control", "no-cache");

    if (!response.body) {
      return res.end();
    }

    const reader = response.body.getReader();

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      res.write(Buffer.from(value));
    }

    res.end();

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI service error" });
  }
}
