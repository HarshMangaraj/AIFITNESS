import dotenv from "dotenv";
dotenv.config();

async function testGemini() {
  const geminiApiKey = "AIzaSyCXqIeauE9JKP1LFjHOqqiLvzrvkZcpEpY";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: "Just reply 'Hello world' if you receive this." }
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("FAILED:", response.status, errorText);
  } else {
    const data = await response.json();
    console.log("SUCCESS");
  }
}

testGemini();
