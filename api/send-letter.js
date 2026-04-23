import OpenAI from "openai";
import { Resend } from "resend";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  try {
    const { name, email, description, tone } = req.body;

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a warm, emotional best friend writing motivational letters.",
        },
        {
          role: "user",
          content: `
Write a ${tone} motivational letter.

Name: ${name}
About them: ${description}

Make it personal, comforting, and encouraging.
          `,
        },
      ],
    });

    const letter = aiResponse.choices[0].message.content;

    await resend.emails.send({
      from: "Your Bestie <onboarding@resend.dev>",
      to: email,
      subject: "💗 Your Bestie Letter Has Arrived",
      html: `<h2>Hi ${name} 💗</h2><p>${letter}</p>`,
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Something went wrong" });
  }
}
