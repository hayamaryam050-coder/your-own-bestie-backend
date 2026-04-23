import OpenAI from "openai";
import { Resend } from "resend";

// Initialize services
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const resend = new Resend(process.env.RESEND_API_KEY);

// Main handler
export default async function handler(req, res) {
  try {
    // ✅ Prevent browser crashes (GET request safety)
    if (req.method !== "POST") {
      return res.status(200).json({
        message: "API is working. Send POST request with data.",
      });
    }

    // ✅ Safe body handling
    const { name, email, description, tone } = req.body || {};

    if (!name || !email) {
      return res.status(400).json({
        error: "Missing name or email",
      });
    }

    // 🧠 Generate AI letter
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a warm, caring best friend writing motivational letters. Be emotional, supportive, and personal.",
        },
        {
          role: "user",
          content: `
Write a ${tone || "kind and encouraging"} motivational letter.

Name: ${name}
About them: ${description || "No description provided"}

Make it feel like a caring best friend is speaking to them.
          `,
        },
      ],
    });

    const letter = aiResponse.choices[0].message.content;

    // 📧 Send email
    await resend.emails.send({
      from: "Your Bestie <onboarding@resend.dev>",
      to: email,
      subject: "💗 Your Bestie Letter Has Arrived",
      html: `
        <div style="font-family: Arial; line-height: 1.6;">
          <h2>Hi ${name} 💗</h2>
          <p>${letter}</p>
          <br/>
          <p>— Your Bestie ✨</p>
        </div>
      `,
    });

    // ✅ Success response
    return res.status(200).json({
      success: true,
      message: "Letter generated and sent successfully!",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.message || "Something went wrong",
    });
  }
}
