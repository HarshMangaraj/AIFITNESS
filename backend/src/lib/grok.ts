const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_TEXT_MODEL = "llama-3.3-70b-versatile";

export interface UserProfile {
  height: string;
  weight: string;
  age: number;
  activityLevel: string;
  goals: string;
  injuries?: string | null;
  allergies?: string | null;
  equipment?: string | null;
}

export async function generateWorkoutPlan(
  userProfile: UserProfile,
  photoBase64?: string | null
): Promise<object> {
  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey) {
    throw new Error("GROK_API_KEY environment variable is required");
  }

  const systemPrompt = `You are an expert personal trainer and nutritionist. 
Your job is to create personalized workout plans based on user data. 
Always respond with a structured JSON object containing the workout plan.
The plan should be detailed, safe, and tailored to the user's specific needs.
Respond ONLY with valid JSON — no markdown, no extra text.`;

  const userMessageStr = buildUserMessage(userProfile);

  if (photoBase64) {
    const geminiApiKey = process.env.GEMINI_API_KEY?.trim();
    if (!geminiApiKey) throw new Error("GEMINI_API_KEY required for vision");
    
    // Use Gemini for Vision
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: systemPrompt + "\\n\\n" + userMessageStr },
              { inline_data: { mime_type: "image/jpeg", data: photoBase64 } }
            ]
          }
        ],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${errorText}`);
    }

    const data = await response.json() as any;
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) throw new Error("No JSON returned from Gemini");
    return JSON.parse(content);
  }

  // Use Groq for standard text processing
  const messages: any[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessageStr },
  ];

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_TEXT_MODEL, // Groq vision models were decommissioned
      messages,
      temperature: 0.7,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error ${response.status}: ${errorText}`);
  }

  const data = (await response.json()) as any;
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("No content returned from Groq API");
  }

  return JSON.parse(content);
}

function buildUserMessage(profile: UserProfile): string {
  const textContent = `Please create a personalized workout and nutrition plan for me based on the following information:

**Personal Stats:**
- Height: ${profile.height}
- Weight: ${profile.weight}
- Age: ${profile.age} years old
- Activity Level: ${profile.activityLevel.replace(/_/g, " ")}

**Goals:** ${profile.goals}
**Equipment Available:** ${profile.equipment || "Not specified — assume bodyweight or standard gym access"}
${profile.injuries ? `**Injuries/Limitations:** ${profile.injuries}` : ""}
${profile.allergies ? `**Dietary Allergies/Restrictions:** ${profile.allergies}` : ""}

Please respond with a comprehensive JSON workout plan that includes:
1. A weekly workout schedule (days, exercises, sets, reps, rest periods)
2. Exercise descriptions and proper form tips
3. Nutrition guidelines (macros, meal timing, sample meals)
4. Progress tracking milestones
5. Safety considerations based on any injuries
6. Warm-up and cool-down routines

Structure your response as valid JSON with clear section keys.`;

  return textContent;
}

export async function analyzeProgressPhoto(
  photoBase64: string,
  userProfile: any
): Promise<string> {
  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey) {
    throw new Error("GROK_API_KEY environment variable is required");
  }

  const systemPrompt = `You are an expert personal trainer and fitness coach.
Your job is to analyze a user's daily progress photo and provide supportive, constructive, and highly motivating feedback based on their physique and goals.
Identify visible physical attributes (merits) along with areas of improvement (demerits), and be very specific about their physique (e.g. shoulders, core, posture) so they know you are truly looking at the picture!
Keep your response concise, encouraging, and focused on helping them stay consistent.
Do NOT use markdown structuring like headers, just plain text paragraphs.`;

  const promptText = `${systemPrompt}\\n\\nUser stats: Goals: ${userProfile.goals}. Age: ${userProfile.age}. Height: ${userProfile.height}. Weight: ${userProfile.weight}. Provide motivating, detailed physique feedback based on the image:`;

  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    throw new Error("GEMINI_API_KEY is missing for Vision processing.");
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: promptText },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: photoBase64
              }
            }
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errorText}`);
  }

  const data = await response.json() as any;
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) {
    throw new Error("No content returned from Gemini API");
  }

  return content.trim();
}
