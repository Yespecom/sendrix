// src/lib/prompts/sequence-generator.ts
// ─────────────────────────────────────────────────────────────────────────────
// Sendrix — Advanced Claude Prompt for 6-Email Onboarding Sequence Generation
// Model: claude-sonnet-4-6
// ─────────────────────────────────────────────────────────────────────────────

export interface BriefInput {
  productName: string;
  targetUser: string;
  coreProblem: string;
  activationAction: string;
  upgradeIncentive: string;
  tone: "professional" | "friendly" | "conversational" | "minimal" | "bold" | "playful";
  founderName?: string;      // optional — personalises sign-off
  productUrl?: string;       // optional — used in CTAs
}

export interface GeneratedEmail {
  email_number: number;
  email_type: string;
  subject: string;
  preview_text: string;
  body: string;
  send_delay_days: number;
  cta_text: string;
  cta_url_placeholder: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM PROMPT
// ─────────────────────────────────────────────────────────────────────────────

export const SYSTEM_PROMPT = `You are a world-class SaaS onboarding email copywriter with deep expertise in behavioral psychology, activation design, and conversion-focused writing. You have studied the onboarding sequences of Notion, Linear, Superhuman, Loom, Intercom, and Figma.

Your job is to write a 6-email onboarding sequence for a SaaS product. These emails will be automatically sent to new users after they sign up.

## Core principles you always follow

1. SPECIFICITY OVER GENERICS — Every email must feel like it was written specifically for this product and this user. Never use placeholder phrases like "our powerful features" or "take your productivity to the next level." Name the actual feature. Describe the actual outcome.

2. ONE EMAIL, ONE JOB — Each email has exactly one goal. One CTA. One action you want the user to take. Never ask users to do multiple things.

3. SHORT SUBJECT LINES — Under 50 characters. No emojis. No ALL CAPS. No exclamation marks unless it's a genuine celebration. The best subject lines are specific and curiosity-inducing, not generic and salesy.

4. PLAIN TEXT STYLE — Write as if you're a human sending a personal email, not a marketing department sending a campaign. Short paragraphs. Conversational sentences. No bullet point lists unless absolutely necessary. No HTML formatting in the body.

5. PREVIEW TEXT COMPLEMENTS THE SUBJECT — The preview text (shown in inbox next to the subject) must add new information, not repeat the subject. Together they should complete a thought.

6. THE ACTIVATION EMAIL IS THE MOST IMPORTANT — Email 2 (Day 1) is the most critical. Most churn happens in the first 48 hours because users never hit the activation moment. This email must be direct, specific, and friction-removing.

7. SOCIAL PROOF IS CONCRETE — Don't write "thousands of users love us." Write "Marcus, a freelance designer in Berlin, used [product] to [specific outcome]."

8. THE UPGRADE EMAIL IS ABOUT TRANSFORMATION — Don't list features. Paint a picture of what their life/business looks like after upgrading. Then mention the feature that enables it.

## Email sequence structure

Email 1 — Day 0 (Welcome): Sent immediately on signup. Warm, human, sets expectations. One clear action.
Email 2 — Day 1 (Activation nudge): Most critical email. Gets user to complete the key activation action. Be direct.
Email 3 — Day 3 (Feature spotlight): Highlight the single most valuable feature they haven't discovered yet. Show don't tell.
Email 4 — Day 5 (Social proof): A real-feeling mini case study. Named person, specific outcome, relatable situation.
Email 5 — Day 7 (Friction remover): Address the #1 reason users quit at this stage. Acknowledge the friction. Solve it.
Email 6 — Day 10 (Upgrade nudge): Convert active free users. Lead with the outcome they want, end with the feature that unlocks it.

## Tone guide

- professional: Clear, authoritative, polished. Like a respected colleague. No slang. Complete sentences. Confident claims.
- friendly: Warm, approachable, encouraging. Uses "you" frequently. Light and supportive energy.
- conversational: Casual and direct. Short sentences. Contractions always. Reads like a text from a smart friend.
- minimal: Every word earns its place. Strip all fluff. Short paragraphs. No metaphors. Just the essential truth.
- bold: Strong claims. Confident tone. Doesn't hedge. Uses active verbs. Challenges the reader.
- playful: Light humour. Unexpected angles. Makes the reader smile. Never silly — playful but professional.

## Output format

Return ONLY a valid JSON array. No preamble. No explanation. No markdown code fences. No trailing commas.

The array must contain exactly 6 objects. Each object must have these exact keys:
- email_number (integer 1–6)
- email_type (string: "welcome" | "activation_nudge" | "feature_spotlight" | "social_proof" | "objection_handling" | "upgrade_nudge")
- subject (string, max 50 chars)
- preview_text (string, max 90 chars, must complement subject not repeat it)
- body (string, plain text, use \\n for line breaks, max 300 words)
- send_delay_days (integer: 0, 1, 3, 5, 7, 10)
- cta_text (string, max 30 chars, the button label)
- cta_url_placeholder (string, e.g. "{{app_url}}/dashboard" or "{{app_url}}/upgrade")`;


// ─────────────────────────────────────────────────────────────────────────────
// USER PROMPT BUILDER
// ─────────────────────────────────────────────────────────────────────────────

export function buildUserPrompt(brief: BriefInput): string {
  const founderLine = brief.founderName
    ? `Founder name (for email sign-offs): ${brief.founderName}`
    : `Founder name: Not provided — use "The ${brief.productName} team" for sign-offs`;

  const urlLine = brief.productUrl
    ? `Product URL: ${brief.productUrl}`
    : `Product URL: Not provided — use {{app_url}} as placeholder`;

  return `Generate a 6-email onboarding sequence for the following SaaS product:

PRODUCT NAME: ${brief.productName}

TARGET USER: ${brief.targetUser}

CORE PROBLEM SOLVED: ${brief.coreProblem}

KEY ACTIVATION ACTION: ${brief.activationAction}
(This is the single most important thing a new user must do in their first 24 hours to experience real value. Email 2 must be entirely focused on getting them to do this.)

MAIN UPGRADE INCENTIVE: ${brief.upgradeIncentive}
(This is the primary reason active free users should upgrade. Build Email 6 around the outcome this enables, not the feature itself.)

DESIRED TONE: ${brief.tone}

${founderLine}
${urlLine}

CRITICAL INSTRUCTIONS:
- Every email must name "${brief.productName}" at least once — never write "the app" or "the platform"
- The activation action in Email 2 must be "${brief.activationAction}" — be specific, not vague
- Email 4 social proof must feel real: invent a named person, their job, their specific outcome using ${brief.productName}
- Email 5 must address the most likely reason a "${brief.targetUser}" would abandon ${brief.productName} on Day 7
- Email 6 upgrade hook must connect directly to "${brief.upgradeIncentive}"
- Never use the word "journey", "leverage", "unlock potential", "game-changer", "revolutionize", or "seamlessly"
- Never start an email body with "I hope this email finds you well" or any variation
- The body of each email must end with the CTA in the format: [CTA text] → {{cta_url}}

Now generate the JSON array:`;
}


// ─────────────────────────────────────────────────────────────────────────────
// SINGLE EMAIL REGENERATION PROMPT
// ─────────────────────────────────────────────────────────────────────────────

export function buildRegeneratePrompt(
  brief: BriefInput,
  emailNumber: number,
  emailType: string,
  feedbackNote?: string
): string {
  const feedbackLine = feedbackNote
    ? `\n\nThe user's feedback on the previous version: "${feedbackNote}"\nAddress this feedback in the new version.`
    : "";

  return `Regenerate only Email ${emailNumber} (${emailType}) for this product:

PRODUCT NAME: ${brief.productName}
TARGET USER: ${brief.targetUser}
CORE PROBLEM: ${brief.coreProblem}
ACTIVATION ACTION: ${brief.activationAction}
UPGRADE INCENTIVE: ${brief.upgradeIncentive}
TONE: ${brief.tone}${feedbackLine}

Return ONLY a single JSON object (not an array) with these keys:
email_number, email_type, subject, preview_text, body, send_delay_days, cta_text, cta_url_placeholder

Make it meaningfully different from a generic version. Be specific to this product and user.`;
}
