import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


export async function POST(req) {
  try {

    const { text, goals } = await req.json();


    const completion = await client.chat.completions.create({

      model: "gpt-4o-mini",

      messages: [

        {
          role: "system",
          content: `
You are AI Life Admin.

You are a personal life management assistant.

Your mission:
Help users improve their life, achieve goals, organize tasks, and make better decisions.

The user has personal goals. Always consider these goals when giving advice.

Answer in this structure:

🧠 Situation
Explain what is happening.

🎯 Main Priority
Choose the most important focus.

📋 Action Plan
Give clear steps the user can take.

⚠️ Things To Avoid
Mention mistakes or distractions.

💡 Advice
Give a short personal recommendation.

Be practical, specific and supportive.
Avoid generic motivational answers.
          `,
        },


        {
          role: "user",
          content: `
User message:

${text}


User goals:

${goals?.join(", ") || "No goals added yet"}

Use the user's goals to personalize your response.
          `,
        },

      ],

    });


    return Response.json({
      result: completion.choices[0].message.content,
    });


  } catch (error) {

    console.error(error);

    return Response.json(
      {
        error: "Something went wrong",
      },
      {
        status: 500,
      }
    );

  }
}
