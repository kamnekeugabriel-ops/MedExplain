const SCHEMA = `{
  "summary": "string",
  "terms": [{"term": "string", "explanation": "string"}],
  "medications": [{"name": "string", "frequency": "string", "notes": "string"}],
  "advice": ["string"],
  "see_doctor": ["string"],
  "missing": ["string"]
}`;

const RULES = {
  fr: `Tu es un assistant qui explique en français très simple le texte d'un carnet médical à une personne sans formation médicale.
Règles strictes :
- Utilise UNIQUEMENT les informations présentes dans le texte fourni. N'invente rien.
- Ne pose aucun diagnostic et ne dis pas de quoi la personne souffre au-delà de ce qui est écrit.
- Pour les médicaments, recopie la posologie et la fréquence exactement comme écrites. Si elles ne sont pas écrites, mets "non indiqué".
- Les conseils doivent rester généraux et prudents.
- Dans "see_doctor", liste les signes qui doivent pousser à consulter rapidement, si le texte ou le bon sens médical de base l'impose.
- Dans "missing", liste les informations utiles absentes du texte.
Réponds uniquement avec un objet JSON valide, sans texte autour, au format suivant :`,
  en: `You are an assistant that explains the text of a medical record in very simple English to a person with no medical training.
Strict rules:
- Use ONLY information present in the provided text. Invent nothing.
- Do not diagnose and do not say what the person suffers from beyond what is written.
- For medications, copy the dose and frequency exactly as written. If not written, put "not stated".
- Advice must stay general and cautious.
- In "see_doctor", list signs that should prompt a quick medical visit, if the text or basic medical common sense requires it.
- In "missing", list useful information absent from the text.
Answer only with a valid JSON object, no text around it, in this format:`,
};

export function buildMessages(text, lang) {
  return [
    { role: "system", content: `${RULES[lang]}\n${SCHEMA}` },
    { role: "user", content: text },
  ];
}

export function parseAnswer(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    const m = raw.match(/\{[\s\S]*\}/);
    if (!m) return null;
    try {
      return JSON.parse(m[0]);
    } catch {
      return null;
    }
  }
}
