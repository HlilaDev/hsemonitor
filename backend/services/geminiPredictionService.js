const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

exports.predictHseRisk = async ({ readings, alerts, ppeAlerts }) => {
  const prompt = `
Tu es un assistant HSE intelligent pour une plateforme SaaS appelée HSEMonitor.

Analyse ces données IoT, alertes et détections PPE.
Retourne uniquement un JSON valide.

Données capteurs:
${JSON.stringify(readings)}

Alertes:
${JSON.stringify(alerts)}

Alertes PPE:
${JSON.stringify(ppeAlerts)}

Format attendu:
{
  "riskLevel": "low | medium | high | critical",
  "score": 0-100,
  "summary": "résumé court",
  "probableCauses": ["cause1"],
  "recommendations": ["action1"],
  "priorityActions": ["action urgente"]
}
`;
  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });
  return JSON.parse(response.text);
};