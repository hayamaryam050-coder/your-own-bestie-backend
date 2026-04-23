import OpenAI from "openai";
import { Resend } from "resend";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // IMPORTANT: prevent browser crash
  if (req.method !== "POST") {
    return res.status(200).json({
      message: "Send POST request to use this API",
    });
  }

  try {
    const { name, email, description, tone } = req.body || {};

    if (!name || !email) {
      return res.status(400).json({
        error: "Missing name or email",
      });
    }

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a warm motivational best friend writing supportive letters.",
        },
        {
          role: "user",
          content: `Write a ${tone || "kind"} motivational letter.

Name: ${name}
About them: ${description || "No description provided"}

Make it personal, encouraging, and comforting.`,
        },
      ],
    });

    const letter = aiResponse.choices[0].message.content;

    await resend.emails.send({
      from: "Your Bestie <onboarding@resend.dev>",
      to: email,
      subject: "💗 Your Bestie Letter",
      html: `<h2>Hi ${name} 💗</h2><p>${letter}</p>`,
    });

    res.status(200).json({
      success: true,
      message: "Letter sent!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: error.message,
    });
  }
}
