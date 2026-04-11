# Fit.ai Architecture & AI Explained

This document breaks down exactly how the "magic" in Fit.ai works under the hood, specifically focusing on the AI engines, the Scanner AI, and the data flow.

---

## 1. How the "Scan AI" (Nutrition Scanner) Works

The Nutrition Scanner AI is a powerful combination of frontend image processing and backend multi-modal AI generation. Here is the step-by-step breakdown:

### A. Image Capture (Frontend)
When you open the **Scan AI** page, the application uses a React component called `react-webcam`. 
- When you click "Capture," the component takes a high-resolution snapshot from your camera.
- This image is immediately converted into a **Base64 encoded string** (a way to represent binary image data as text). 
- The React application (`ScanAI.tsx`) sends this Base64 string to the backend endpoint: `POST /api/food/scan`.

### B. Vision Processing (Backend)
When the Express.js backend receives the image:
1. It is routed to the `analyzeFoodImage` function inside `backend/src/lib/grok.ts`.
2. The logic connects to **Google Gemini (Gemini 2.5 Flash)**. *Note: Although the file is named `grok.ts`, Grok's vision models were decommissioned, so Gemini is used for all image-related AI tasks.*
3. A highly specific "System Prompt" is injected alongside the Base64 image payload:
   > *"You are an expert nutritionist. Analyze the image provided and identify the food item. Provide a detailed nutritional breakdown... Structure your response as a valid JSON object."*
4. We instruct the Gemini API (`generationConfig: { responseMimeType: "application/json" }`) to strictly return a JSON object, ensuring no markdown or conversational text is included.

### C. The Result
Gemini analyzes the pixels, identifies the food, estimates the portion size, and calculates macros (Calories, Protein, Carbs, Fats). It returns this JSON to the backend, which parses it, ensures it is valid, and sends it back to the frontend to render the sleek UI cards you see on the screen.

---

## 2. How the "Neural Protocol" (Workout Planner) Works

The workout generation relies on Large Language Models (LLMs) to dynamically construct customized routines. 

### Text-Based Generation (Grok)
If you generate a workout plan *without* a photo:
1. The backend gathers your physical metrics (Height, Weight, Age, Activity Level, Goals) from the PostgreSQL Database via Prisma.
2. It sends this data to the **Grok AI API** (`llama-3.3-70b-versatile` running on Groq's high-speed inference engine).
3. The prompt explicitly demands a strict JSON structure containing weekly schedules, exercise descriptions, and rest times.
4. Grok streams the response back almost instantly (< 2 seconds), and it's saved in your database under the `WorkoutPlan` table.

### Vision-Assisted Generation (Gemini)
If you upload a *physique photo* while requesting a plan:
1. The backend seamlessly switches from Grok to **Gemini Vision**.
2. It feeds Gemini your text stats *and* your body photo.
3. Gemini acts as an expert trainer, looking at your current muscle development and proportions to tweak the workout plan specifically to your bodily needs. 

---

## 3. How the "Daily Progress Tracking" Works

When you log a progress update:
1. The system asks for an optional progress photo.
2. Similar to the food scanner, the image goes to **Gemini Vision** via `analyzeProgressPhoto()`.
3. Gemini analyzes your physique against your stated goals.
4. It returns a paragraph of tailored, highly specific motivational feedback (e.g., *"Your shoulder definition is improving, keep pushing those lateral raises!"*).
5. This progress entry, along with your weight and the AI's feedback, is permanently linked to your specific active `WorkoutPlan` in the PostgreSQL database.

---

## 4. How the Frontend Communicates with the Backend (zod & React Query)

Fit.ai ensures the data is perfectly safe and fast using two core frontend technologies:

- **Zod (Type Safety):** Both the frontend and backend use Zod schemas. Before the frontend sends data (like a login request or a scanner payload), Zod checks it. Before the backend accepts it, Zod checks it again. This prevents crashes and invalid payloads.
- **TanStack React Query:** This library manages fetching data. When you scan a food item, React Query handles the "loading" state, the "success" data caching, and the "error" handling seamlessly, giving the UI that buttery-smooth, un-interrupted feel.
