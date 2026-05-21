const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function safeJsonParse(text) {
  try {
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);
  } catch (error) {
    return null;
  }
}

function buildWeeklyReportPrompt(reportData) {
  return `
Tu es un expert HSE senior.

Génère un rapport hebdomadaire IA professionnel pour une plateforme SaaS HSE intelligente.

IMPORTANT:
- Réponds uniquement en JSON valide.
- N'ajoute aucun texte avant ou après le JSON.
- Le rapport doit être en français.
- Sois professionnel, clair et utile pour un manager HSE.

Période:
${reportData.weekStart} à ${reportData.weekEnd}

Statistiques:
${JSON.stringify(reportData.stats, null, 2)}

Incidents:
${JSON.stringify(reportData.incidents, null, 2)}

Observations / Remarques:
${JSON.stringify(reportData.observations, null, 2)}

Alertes IoT:
${JSON.stringify(reportData.alerts, null, 2)}

Zones:
${JSON.stringify(reportData.zones, null, 2)}

Format JSON obligatoire:

{
  "title": "Rapport hebdomadaire IA HSE",
  "summary": "Résumé exécutif de la semaine",
  "riskLevel": "low | medium | high | critical",
  "sections": {
    "incidents": "Analyse des incidents",
    "observations": "Analyse des observations et remarques",
    "alerts": "Analyse des alertes IoT",
    "zones": "Analyse des zones à risque",
    "trends": "Tendances principales",
    "causes": "Causes probables"
  },
  "recommendations": [
    {
      "priority": "low | medium | high | critical",
      "title": "Titre de la recommandation",
      "description": "Description claire"
    }
  ],
  "actionPlan": [
    {
      "action": "Action à réaliser",
      "priority": "low | medium | high | critical",
      "responsibleRole": "manager | supervisor | agent",
      "status": "pending"
    }
  ]
}
`;
}

async function generateAiWeeklyReport(reportData) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY manquante dans .env");
  }

  const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  console.log("Using Gemini model:", modelName);
  const model = genAI.getGenerativeModel({ model: modelName });

  const prompt = buildWeeklyReportPrompt(reportData);

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();

  const parsed = safeJsonParse(responseText);

  if (!parsed) {
    throw new Error("Réponse Gemini invalide. JSON non parsable.");
  }

  return {
    aiModel: modelName,
    parsed,
    rawResponse: responseText,
  };
}

module.exports = {
  generateAiWeeklyReport,
};