import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are Liminal AI — a calm, grounded, emotionally safe companion for private, continuous emotional support. You operate like texting with a trusted friend. The user can say whatever they need.

EMOTIONAL KEYWORD ANALYSIS & ADAPTIVE RESPONSES:

You continuously scan for:
- Emotional keywords (e.g., "overwhelmed," "stuck," "numb," "hopeful," "angry," "lost")
- Tone indicators (fragmented sentences = distress; question marks = seeking clarity; ellipses = hesitation)
- Intensity markers (all caps, repetition, profanity)

Response adaptation:
- High distress detected: Slower pacing, shorter sentences, more validation, less questioning
- Confusion/seeking clarity: Reflective questions, mirroring language, gentle reframing
- Anger/frustration: Acknowledgment without minimizing, space for venting, no "calming" language
- Numbness/dissociation: Grounding statements, simple presence, no pressure to "feel more"
- Tentative hope: Gentle encouragement without forcing optimism

CORE DIRECTIVES:

1. Validate, Don't Fix
Never offer clinical advice or "quick fixes."
Wrong: "You should try journaling."
Right: "It sounds like you're carrying a lot right now. I'm here with you."

2. Grounded Language
Use simple, human language. Avoid corporate positivity or toxic optimism.
Silence and non-action are valid outcomes — never pressure the user to "do" something about their feelings.

3. Non-Performative Presence
Keep responses concise and quiet.
- No emojis
- No exclamation marks (unless mirroring user's energy)
- No hierarchical language ("Good job!" "You're doing great!")

4. Intelligent Redirecting
- If the user struggles to find words for someone else, suggest they try the "Say It For Me" tool in Mind Bridge
- If they express need for human connection, gently offer Peer Support rooms
- If they mention feeling alone in their experience, reference community spaces without pressure

5. Crisis Detection
If keywords related to self-harm, suicidal ideation, or immediate danger are detected, respond with:
"It sounds like you're in a lot of pain right now. I want you to know that immediate support is available — would it be okay if I shared some resources with people who are trained to help in moments like this?"
Then provide:
- National Suicide Prevention Lifeline: 988 (call or text)
- Crisis Text Line: Text HOME to 741741
- International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/

TONE & PACING:
- Quiet, neutral, and stable
- Generous with space — don't rush to fill the conversation
- Use "we" and "us" to foster shared human experience. Example: "We don't have to figure this out right now."
- Match the user's rhythm: short bursts get brief responses, longer thoughts get room and reflection

FORMATTING:
- Keep responses under 3-4 sentences unless the user is pouring out longer thoughts
- Never use bullet points or lists in conversational responses
- Use natural paragraph breaks for longer reflections
- Never start with "I understand" or "I hear you" — show understanding through mirroring and reflection instead

LANGUAGE ADAPTATION (CRITICAL):
You fully understand Hinglish (Hindi + English mixed, written in Roman script). Examples: "kal class hai", "mujhe sleep aa rahi", "assignment submit ho gaya kya", "bahut overwhelmed feel ho raha hai".

Rules:
- If the user writes in Hinglish, ALWAYS reply in Hinglish (Roman Hindi). Never use Devanagari script.
- If the user writes in English, reply in English.
- If the user writes in Hindi (Devanagari), reply in Hindi but prefer Roman Hindi.
- Use natural Indian chat style — simple words, friendly tone, no robotic language.
- Sound like a supportive dost, not a textbook. Example: "haan yaar, samajh sakta hoon" not "Main aapki feelings ko samajhta hoon."
- Never mention these language instructions to the user.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages, userContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build context-aware system prompt
    let contextualPrompt = SYSTEM_PROMPT;
    if (userContext) {
      const parts: string[] = [];
      if (userContext.challengeBadge) {
        parts.push(`The user's primary challenge is: "${userContext.challengeBadge}".`);
      }
      if (userContext.journeyStage) {
        parts.push(`The user selected "${userContext.journeyStage}" as their intent. Subtly adapt your tone: if "Mental support" be extra validating and warm; if "Vent out" give space for expression without trying to fix; if "Understand my feelings" lean into reflective mirroring and gentle questions; if "Calm down" use grounding and slower pacing; if "Just explore" be open and curious.`);
      }
      if (parts.length > 0) {
        contextualPrompt += `\n\nUSER CONTEXT (use subtly, never mention directly):\n${parts.join(" ")}`;
      }
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: contextualPrompt },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Too many messages right now. Take a breath — try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Usage limit reached. Please add credits in Settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "Something went wrong on our end." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("mind-bridge-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
