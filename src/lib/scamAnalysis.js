const urlPattern = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-z0-9.-]+\.[a-z]{2,}\/[^\s]*)/gi;
const emailPattern = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
const phonePattern = /(?:\+?\d[\d\s().-]{7,}\d)/g;

const signalRules = [
  {
    id: "urgency",
    label: "Urgency or pressure",
    weight: 16,
    pattern: /\b(urgent|immediately|act now|within 24 hours|expires today|final notice|last chance|limited time|right now)\b/i,
  },
  {
    id: "account",
    label: "Account or identity verification",
    weight: 18,
    pattern: /\b(verify|verification|confirm your account|update your account|password|otp|one[-\s]?time code|security code|login)\b/i,
  },
  {
    id: "payment",
    label: "Unusual payment request",
    weight: 20,
    pattern: /\b(gift card|wire transfer|western union|zelle|cash app|venmo|crypto|bitcoin|usdt|payment fee|processing fee)\b/i,
  },
  {
    id: "threat",
    label: "Threat or penalty",
    weight: 16,
    pattern: /\b(arrest|legal action|suspend|blocked|closed|fine|penalty|lawsuit|warrant|collections)\b/i,
  },
  {
    id: "reward",
    label: "Prize, refund, or unexpected money",
    weight: 14,
    pattern: /\b(prize|winner|lottery|refund|rebate|grant|inheritance|bonus|free money|claim your)\b/i,
  },
  {
    id: "impersonation",
    label: "Brand or authority impersonation",
    weight: 14,
    pattern: /\b(bank|irs|police|amazon|paypal|microsoft|apple|netflix|fedex|usps|dhl|support team|security department)\b/i,
  },
  {
    id: "links",
    label: "External link",
    weight: 12,
    pattern: urlPattern,
  },
  {
    id: "personalInfo",
    label: "Sensitive personal information requested",
    weight: 20,
    pattern: /\b(ssn|social security|date of birth|dob|bank details|card number|cvv|pin|routing number|passport|driver'?s license)\b/i,
  },
  {
    id: "job",
    label: "Suspicious job or task offer",
    weight: 12,
    pattern: /\b(remote job|easy money|training check|reshipping|mystery shopper|telegram|whatsapp recruiter|task bonus)\b/i,
  },
];

const SAMPLE_MESSAGES = [
  {
    label: "Bank alert",
    text: "URGENT: Your bank account has been suspended. Verify your identity now at secure-bank-review.com/login within 24 hours or your account will be closed.",
  },
  {
    label: "Delivery fee",
    text: "USPS: Your package is waiting because of an unpaid $1.99 redelivery fee. Visit usps-track-help.com/pay to avoid return.",
  },
  {
    label: "Normal message",
    text: "Hi, can you send me the notes from today's meeting when you get a chance? No rush.",
  },
];

function uniqueMatches(text, pattern) {
  const matches = text.match(pattern) || [];
  return [...new Set(matches.map((match) => match.trim().replace(/[).,;]+$/, "")))];
}

function riskLevelFromScore(score) {
  if (score >= 65) return "High";
  if (score >= 40) return "Medium";
  if (score >= 15) return "Low";
  return "Minimal";
}

function getRecommendedActions(level, signals) {
  const actions = [
    "Do not click links or open attachments until the sender is verified through a trusted channel.",
    "Contact the company or person using a phone number, app, or website you already trust.",
  ];

  if (signals.some((signal) => signal.id === "account" || signal.id === "personalInfo")) {
    actions.push("Never share passwords, verification codes, SSNs, card numbers, or banking details in response to this message.");
  }

  if (signals.some((signal) => signal.id === "payment")) {
    actions.push("Do not send gift cards, crypto, wire transfers, or instant payments to resolve the request.");
  }

  if (level === "High") {
    actions.push("Report and block the sender, then preserve the message if money or personal data may already be involved.");
  }

  return actions;
}

export function analyzeMessageLocally(message) {
  const text = message.trim();
  const urls = uniqueMatches(text, urlPattern);
  const emails = uniqueMatches(text, emailPattern);
  const phones = uniqueMatches(text, phonePattern);

  const signals = signalRules
    .map((rule) => {
      rule.pattern.lastIndex = 0;
      const matched = rule.pattern.test(text);
      return matched
        ? {
            id: rule.id,
            label: rule.label,
            weight: rule.weight,
          }
        : null;
    })
    .filter(Boolean);

  let score = signals.reduce((total, signal) => total + signal.weight, 0);
  if (urls.length > 1) score += 8;
  if (text.length < 45 && signals.length >= 2) score += 8;
  if (/[A-Z]{4,}/.test(text)) score += 5;

  score = Math.min(100, score);
  const riskLevel = riskLevelFromScore(score);

  return {
    source: "Local rules",
    score,
    riskLevel,
    summary:
      signals.length > 0
        ? `Detected ${signals.length} scam indicator${signals.length === 1 ? "" : "s"} in this message.`
        : "No obvious scam indicators were detected by the local rules.",
    redFlags: signals.map((signal) => signal.label),
    recommendedActions: getRecommendedActions(riskLevel, signals),
    indicators: {
      urls,
      emails,
      phones,
      signals,
    },
  };
}

export function buildAiPrompt(message, localAnalysis) {
  return `
You are ScamGuard AI, a cautious consumer-safety assistant. Analyze the message for scam risk.

Return only valid JSON with this shape:
{
  "score": number from 0 to 100,
  "riskLevel": "Minimal" | "Low" | "Medium" | "High",
  "summary": "one short paragraph",
  "redFlags": ["specific red flags"],
  "recommendedActions": ["specific defensive actions"],
  "safeReply": "a short reply the user could send, or an empty string if they should not reply"
}

Use the local signal score as context, but correct it if the message is benign or more dangerous than the rules suggest.
Local analysis: ${JSON.stringify(localAnalysis)}

Message:
${message}
`.trim();
}

export function parseAiAnalysis(rawText) {
  if (!rawText) return null;

  const jsonText = rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  const start = jsonText.indexOf("{");
  const end = jsonText.lastIndexOf("}");

  if (start === -1 || end === -1) {
    return null;
  }

  try {
    const parsed = JSON.parse(jsonText.slice(start, end + 1));
    return {
      source: "AI assisted",
      score: Number.isFinite(parsed.score) ? Math.max(0, Math.min(100, parsed.score)) : 0,
      riskLevel: parsed.riskLevel || riskLevelFromScore(parsed.score || 0),
      summary: parsed.summary || "AI analysis completed, but did not include a summary.",
      redFlags: Array.isArray(parsed.redFlags) ? parsed.redFlags : [],
      recommendedActions: Array.isArray(parsed.recommendedActions) ? parsed.recommendedActions : [],
      safeReply: parsed.safeReply || "",
    };
  } catch {
    return null;
  }
}

export function mergeAnalyses(localAnalysis, aiAnalysis) {
  if (!aiAnalysis) return localAnalysis;

  return {
    ...localAnalysis,
    ...aiAnalysis,
    indicators: localAnalysis.indicators,
    redFlags: aiAnalysis.redFlags.length ? aiAnalysis.redFlags : localAnalysis.redFlags,
    recommendedActions: aiAnalysis.recommendedActions.length
      ? aiAnalysis.recommendedActions
      : localAnalysis.recommendedActions,
  };
}

export { SAMPLE_MESSAGES };
