const { onRequest } = require("firebase-functions/v2/https");
const OpenAI = require("openai");
const Busboy = require("busboy");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

exports.meme = onRequest(
  { region: "us-central1", cors: true },
  async (req, res) => {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    const busboy = Busboy({ headers: req.headers });
    let buffer;

    busboy.on("file", (_, file) => {
      const chunks = [];
      file.on("data", d => chunks.push(d));
      file.on("end", () => buffer = Buffer.concat(chunks));
    });

    busboy.on("finish", async () => {
      try {
        const vision = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{
            role: "user",
            content: [
              { type: "text", text: "Describe this image briefly." },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/png;base64,${buffer.toString("base64")}`
                }
              }
            ]
          }]
        });

        const desc = vision.choices[0].message.content;

        const caption = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{
            role: "user",
            content: `Create a funny meme caption (max 10 words): ${desc}`
          }]
        });

        res.json({ caption: caption.choices[0].message.content });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "AI failed" });
      }
    });

    busboy.end(req.rawBody);
  }
);
