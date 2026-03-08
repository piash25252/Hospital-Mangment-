import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { symptoms } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a medical triage assistant for a Bangladeshi hospital called MediCare BD. Analyze symptoms and suggest which type of doctor to see. 

IMPORTANT RULES:
1. Always respond in BOTH Bangla and English.
2. Classify urgency as one of: "normal", "urgent", or "emergency"
3. Always add a disclaimer that this is a suggestion only, not a medical diagnosis.
4. Suggest the most appropriate doctor specialty from: Medicine (মেডিসিন), Gynecology (স্ত্রীরোগ), Orthopedics (অর্থোপেডিক্স), ENT (নাক-কান-গলা), Cardiology (হৃদরোগ), Neurology (স্নায়ুরোগ), Dermatology (চর্মরোগ), Pediatrics (শিশুরোগ), or General (সাধারণ).

Format your response as JSON with these fields:
{
  "urgency": "normal" | "urgent" | "emergency",
  "recommended_doctor": "specialty name in English",
  "recommended_doctor_bn": "specialty name in Bangla", 
  "explanation_en": "English explanation",
  "explanation_bn": "Bangla explanation",
  "disclaimer_en": "English disclaimer",
  "disclaimer_bn": "Bangla disclaimer"
}

Return ONLY valid JSON, no markdown or extra text.`
          },
          {
            role: "user",
            content: `Patient symptoms: ${symptoms}`
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Try to parse as JSON, handle if model wraps in markdown
    let parsed;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {
        urgency: "normal",
        recommended_doctor: "General",
        recommended_doctor_bn: "সাধারণ",
        explanation_en: content,
        explanation_bn: "",
        disclaimer_en: "This is a suggestion only, not a medical diagnosis.",
        disclaimer_bn: "এটি শুধুমাত্র একটি পরামর্শ, চিকিৎসা নির্ণয় নয়।",
      };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("symptom-checker error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
