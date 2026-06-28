const PROXY      = 'https://api.allorigins.win/get?url='
const MISTRAL_API = 'https://api.mistral.ai/v1/chat/completions'

export async function fetchJobText(url) {
  let res
  try {
    res = await fetch(PROXY + encodeURIComponent(url))
  } catch {
    throw new Error("Impossible de récupérer l'annonce (vérifiez votre connexion).")
  }
  if (!res.ok) throw new Error(`Proxy indisponible (${res.status}).`)

  const data = await res.json()
  const html = data.contents || ''

  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  doc.querySelectorAll('script,style,nav,header,footer,aside,noscript').forEach(el => el.remove())
  const text = (doc.body?.textContent || '').replace(/[ \t]{2,}/g, ' ').replace(/\n{3,}/g, '\n\n').trim()

  if (text.length < 80) {
    throw new Error("Contenu trop court ou annonce protégée. Essayez de coller le texte manuellement.")
  }
  return text.slice(0, 4000)
}

export async function adaptCvWithMistral(jobText, resume, apiKey) {
  const cvContext = {
    title:       resume.personal?.title,
    summary:     resume.summary,
    skills:      resume.skills,
    softSkills:  resume.softSkills,
    experiences: (resume.experiences || []).map(e => ({
      position: e.position, company: e.company, period: e.period,
    })),
    education: (resume.education || []).map(e => ({
      degree: e.degree, school: e.school,
    })),
  }

  const prompt = `Tu es un expert en optimisation de CV pour des candidatures tech en France.

OFFRE D'EMPLOI :
${jobText}

CV ACTUEL (JSON) :
${JSON.stringify(cvContext)}

Retourne UNIQUEMENT un objet JSON valide (sans balise markdown, sans commentaire) avec ces champs :
{
  "title": "titre du poste exact de l'offre (string)",
  "summary": "accroche réécrite en 2 paragraphes séparés par \\n\\n, en français, factuelle, sans tiret em (—) ni formulations IA (string)",
  "hiddenSkills": {},
  "changes": ["changement 1", "changement 2"]
}

Règles impératives :
- title : reprend le titre exact du poste dans l'offre
- summary : met en avant les expériences et compétences les plus pertinentes pour CE poste
- hiddenSkills : mêmes clés que resume.skills ; liste les compétences peu pertinentes à masquer ; {} si tout est pertinent
- changes : 3 à 5 descriptions concises de ce qui a été adapté
- Répondre UNIQUEMENT avec le JSON, sans aucune balise ni texte autour`

  const res = await fetch(MISTRAL_API, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model:       'mistral-small-latest',
      messages:    [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens:  1500,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Erreur Mistral ${res.status}`)
  }

  const data    = await res.json()
  const content = data.choices?.[0]?.message?.content || ''
  const cleaned = content.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()

  try {
    return JSON.parse(cleaned)
  } catch {
    throw new Error('Réponse Mistral invalide (JSON malformé). Réessayez.')
  }
}
