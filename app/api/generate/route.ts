import { NextRequest, NextResponse } from 'next/server';
import { routeOrSynthesizeProject } from '@/lib/ai/universalPlanner';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, provider, apiKey, model } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // If Gemini key is provided, attempt live LLM structured planning
    if (provider === 'gemini' && apiKey) {
      try {
        const targetModel = model || 'gemini-1.5-flash';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;

        const systemPrompt = `You are Nirmaan, an expert AI software developer and programming tutor.
The user wants to build: "${prompt}".
Generate a complete working React 18 + TypeScript + Tailwind CSS application structured as JSON with:
1. "project": { "id", "name", "description", "techStack": {"frontend":"React 18","language":"TypeScript","styling":"Tailwind CSS"}, "files": [{"id", "path", "name", "language", "content", "version": 1, "contributions": []}] }
2. "checkpoints": array of learning tasks for the user with: "id", "stepNumber", "title", "conceptId", "conceptName", "taskType" ("COMPLETE_CODE"|"WRITE_SCRATCH"|"FIX_BUG"|"EXPLAIN_CODE"|"PREDICT_OUTPUT"), "prompt", "contextExplanation", "targetFileId", "initialCode", "solutionCode", "testCases": [{"id", "description", "assertionFn"}], "hints": [{"level": 1, "type": "conceptual", "title": "...", "content": "..."}]
3. "milestones": [{"id", "stepNumber", "title", "description", "conceptName", "completed": false}]
Return ONLY raw JSON matching this structure.`;

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        });

        if (res.ok) {
          const json = await res.json();
          const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            if (parsed.project && parsed.checkpoints) {
              return NextResponse.json(parsed);
            }
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini live call error, using local synthesis:', geminiErr);
      }
    }

    // Default: use the robust offline Universal Planner
    const localProject = routeOrSynthesizeProject(prompt);
    return NextResponse.json(localProject);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
