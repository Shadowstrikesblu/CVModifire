const CONTRACT_TYPES = [
  { label: 'Alternance', patterns: [/\balternance\b/i, /\bapprentissage\b/i, /\bcontrat d'apprentissage\b/i] },
  { label: 'Stage', patterns: [/\bstage\b/i, /\binternship\b/i, /\bstagiaire\b/i] },
  { label: 'CDI', patterns: [/\bCDI\b/, /\bcontrat à durée indéterminée\b/i, /\bpermanent\b/i] },
  { label: 'CDD', patterns: [/\bCDD\b/, /\bcontrat à durée déterminée\b/i] },
  { label: 'Freelance', patterns: [/\bfreelance\b/i, /\bconsultant\b/i, /\bindépendant\b/i] },
  { label: 'Interim', patterns: [/\bintérim\b/i, /\binterim\b/i] },
]

const ROLES = [
  { label: 'DevOps', patterns: [/\bdevops\b/i, /\bsre\b/i, /\bsite reliability\b/i, /\bci\/cd\b/i, /\bkubernetes\b/i, /\bk8s\b/i] },
  { label: 'FullStack', patterns: [/\bfull.?stack\b/i, /\bfullstack\b/i] },
  { label: 'Frontend', patterns: [/\bfront.?end\b/i, /\bfrontend\b/i, /\bUI developer\b/i] },
  { label: 'Backend', patterns: [/\bback.?end\b/i, /\bbackend\b/i] },
  { label: 'DataEngineer', patterns: [/\bdata engineer\b/i, /\bingénieur data\b/i] },
  { label: 'DataScientist', patterns: [/\bdata scientist\b/i, /\bmachine learning\b/i, /\bML engineer\b/i] },
  { label: 'Mobile', patterns: [/\bmobile developer\b/i, /\biOS\b/, /\bandroid\b/i, /\breact native\b/i, /\bflutter\b/i] },
  { label: 'CloudEngineer', patterns: [/\bcloud engineer\b/i, /\bcloud architect\b/i] },
  { label: 'Cybersecurity', patterns: [/\bcybersécurité\b/i, /\bcybersecurity\b/i, /\bpentester\b/i, /\bsoc analyst\b/i] },
  { label: 'Dev', patterns: [/\bdéveloppeur\b/i, /\bdeveloper\b/i, /\bingénieur logiciel\b/i, /\bsoftware engineer\b/i] },
]

const TECH_KEYWORDS = [
  // Languages
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'Go', 'Rust', 'PHP', 'Ruby', 'Kotlin', 'Swift',
  // Frontend
  'React', 'Vue', 'Vue.js', 'Angular', 'Next.js', 'Nuxt', 'Svelte', 'HTML', 'CSS', 'Sass', 'Tailwind',
  // Backend
  'Node.js', 'Express', 'NestJS', 'FastAPI', 'Django', 'Flask', 'Spring Boot', 'Laravel', 'Rails',
  // DevOps
  'Docker', 'Kubernetes', 'Terraform', 'Ansible', 'Jenkins', 'GitLab CI', 'GitHub Actions', 'ArgoCD',
  'Helm', 'Prometheus', 'Grafana', 'ELK', 'Nginx', 'Linux',
  // Cloud
  'AWS', 'GCP', 'Azure', 'S3', 'EC2', 'Lambda', 'Cloud Run', 'Vercel',
  // DB
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'SQLite', 'Firebase',
  // Tools
  'Git', 'GraphQL', 'REST', 'gRPC', 'Kafka', 'RabbitMQ', 'WebSockets', 'OAuth', 'JWT',
  // Practices
  'Agile', 'Scrum', 'CI/CD', 'TDD', 'Microservices', 'API',
]

export function analyzeJob(text) {
  if (!text.trim()) return { contractType: '', role: '', keywords: [] }

  let contractType = ''
  for (const ct of CONTRACT_TYPES) {
    if (ct.patterns.some(p => p.test(text))) {
      contractType = ct.label
      break
    }
  }

  let role = ''
  for (const r of ROLES) {
    if (r.patterns.some(p => p.test(text))) {
      role = r.label
      break
    }
  }

  const keywords = TECH_KEYWORDS.filter(kw =>
    new RegExp(`\\b${kw.replace(/[.+]/g, '\\$&')}\\b`, 'i').test(text)
  )

  return { contractType, role, keywords }
}

export function generateFilename(contractType, role, firstName, lastName) {
  const clean = s => s.replace(/\s+/g, '').replace(/[^a-zA-ZÀ-ÿ]/g, '')
  const parts = [contractType, role, clean(firstName), clean(lastName)].filter(Boolean)
  return parts.join('') + '.pdf'
}
