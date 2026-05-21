function esc(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Word-boundary safe for ASCII. For non-ASCII endings (Agilité etc.), only
// checks the left boundary so "l'Agilité" still matches keyword "Agilité".
function wp(kw) {
  return new RegExp(`(?<![a-zA-Z0-9])${esc(kw)}`, 'i')
}

const CONTRACT_TYPES = [
  { label: 'Alternance', patterns: [/alternance/i, /apprentissage/i, /contrat d.apprentissage/i] },
  { label: 'Stage',      patterns: [/\bstage\b/i, /stagiaire/i, /internship/i] },
  { label: 'CDI',        patterns: [/\bcdi\b/i, /durée indéterminée/i, /contrat indéterminé/i, /\bpermanent\b/i] },
  { label: 'CDD',        patterns: [/\bcdd\b/i, /durée déterminée/i] },
  { label: 'Freelance',  patterns: [/freelance/i, /indépendant/i, /prestation/i] },
  { label: 'Interim',    patterns: [/intérim/i, /\binterim\b/i] },
]

const ROLES = [
  { label: 'Support',       patterns: [/technicien support/i, /support logiciel/i, /support technique/i, /helpdesk/i, /help.desk/i, /support informatique/i, /technicien informatique/i, /support n[12]/i, /niveau [12]/i] },
  { label: 'DevOps',        patterns: [/devops/i, /site reliability/i, /\bsre\b/i, /kubernetes/i, /\bk8s\b/i, /intégration continue/i] },
  { label: 'FullStack',     patterns: [/full.?stack/i] },
  { label: 'Frontend',      patterns: [/front.?end/i, /intégrat(eur|rice)/i, /développeur.*front/i] },
  { label: 'Backend',       patterns: [/back.?end/i, /développeur.*back/i] },
  { label: 'DataEngineer',  patterns: [/data engineer/i, /ingénieur.*data/i, /data pipeline/i, /ingénieur données/i] },
  { label: 'DataScientist', patterns: [/data scientist/i, /machine learning/i, /intelligence artificielle/i, /\bIA\b/, /\bMLOps\b/i] },
  { label: 'Mobile',        patterns: [/développeur mobile/i, /mobile developer/i, /\biOS\b/i, /\bandroid\b/i, /react native/i, /flutter/i] },
  { label: 'Cybersecurity', patterns: [/cybersécurité/i, /cybersecurity/i, /pentester/i, /analyste.*sécurité/i, /\bSOC\b/] },
  { label: 'CloudEngineer', patterns: [/cloud engineer/i, /ingénieur cloud/i, /architecte cloud/i] },
  { label: 'Dev',           patterns: [/développeur/i, /developer/i, /ingénieur.*logiciel/i, /software engineer/i, /développement/i, /programmeur/i] },
]

const TECH_KEYWORDS = [
  // ── Languages ──
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'Go', 'Rust', 'PHP', 'Ruby', 'Kotlin', 'Swift', 'Scala',
  // ── Frontend ──
  'React', 'React.js', 'Vue', 'Vue.js', 'Angular', 'Next.js', 'Nuxt', 'Svelte', 'HTML', 'CSS', 'Sass', 'Tailwind', 'Bootstrap',
  // ── Backend ──
  'Node.js', 'Express', 'NestJS', 'FastAPI', 'Django', 'Flask', 'Spring Boot', 'Laravel', 'Rails', 'AdonisJS', '.NET',
  // ── DevOps / Infra ──
  'Docker', 'Kubernetes', 'Terraform', 'Ansible', 'Jenkins', 'GitLab CI', 'GitHub Actions', 'ArgoCD',
  'Helm', 'Prometheus', 'Grafana', 'Nginx', 'Linux', 'IIS', 'VPS',
  // ── Cloud ──
  'AWS', 'GCP', 'Azure', 'S3', 'EC2', 'Lambda', 'Vercel', 'OVHcloud',
  // ── Bases de données ──
  'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'SQLite', 'Firebase', 'Oracle', 'MariaDB',
  // ── Outils / Tests ──
  'Git', 'GitHub', 'GitLab', 'GraphQL', 'REST', 'Kafka', 'RabbitMQ',
  'Jest', 'Cypress', 'Postman', 'Pytest', 'Selenium', 'JMeter',
  // ── Sécurité ──
  'Burp Suite', 'ZAP', 'Wireshark', 'SIEM', 'Splunk',
  // ── Support / ITSM ──
  'ITSM', 'ServiceNow', 'GLPI', 'Active Directory', 'VPN', 'LDAP',
  'Office 365', 'Windows Server', 'PowerShell', 'Bash',
  // ── Pratiques ──
  'Agile', 'Agilité', 'Scrum', 'CI/CD', 'TDD', 'BDD', 'Microservices', 'API',
  'Recette', 'Tickets',
]

// Synonyms for matching user skills to job keywords (handles French variants)
const SYNONYMS = {
  'agilité': 'agile',
  'agilite': 'agile',
  'agility': 'agile',
  'sql':     'sql',  // postgresql / mysql → contain 'sql'
}

export function normalizeSkill(s) {
  const sl = (s || '').toLowerCase()
  return SYNONYMS[sl] || sl
}

// True if a user skill matches a job keyword (bidirectional partial match)
export function skillMatchesKeyword(skill, keyword) {
  const sn = normalizeSkill(skill)
  const kn = normalizeSkill(keyword)
  return sn.includes(kn) || kn.includes(sn)
}

export function analyzeJob(text) {
  if (!text || !text.trim()) return { contractType: '', role: '', keywords: [] }

  let contractType = ''
  for (const ct of CONTRACT_TYPES) {
    if (ct.patterns.some(p => p.test(text))) { contractType = ct.label; break }
  }

  let role = ''
  for (const r of ROLES) {
    if (r.patterns.some(p => p.test(text))) { role = r.label; break }
  }

  const keywords = TECH_KEYWORDS.filter(kw => wp(kw).test(text))

  return { contractType, role, keywords }
}

export function generateFilename(contractType, role, firstName, lastName) {
  const clean = s => (s || '').replace(/\s+/g, '').replace(/[^a-zA-ZÀ-ÿ]/g, '')
  const parts = [contractType, role, clean(firstName), clean(lastName)].filter(Boolean)
  return (parts.length ? parts.join('') : 'MonCV') + '.pdf'
}
