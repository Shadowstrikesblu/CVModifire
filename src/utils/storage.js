const KEY = 'cvmodifire_resume'
const VERSION = 3

export function loadResume() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (data._version !== VERSION) return null
    // Fill fields added in later versions
    if (!data.hiddenSkills)          data.hiddenSkills = {}
    if (!data.availability)          data.availability = ''
    if (!data.softSkills)            data.softSkills = []
    if (!data.customSkillCats)       data.customSkillCats = []
    if (data.alternanceNote == null) data.alternanceNote = false
    return data
  } catch {
    return null
  }
}

export function saveResume(data) {
  localStorage.setItem(KEY, JSON.stringify({ ...data, _version: VERSION }))
}

export function defaultResume() {
  return {
    _version: VERSION,
    personal: {
      firstName: 'Harvey Kereth',
      lastName: 'MOULOUNDOU',
      title: 'Développeur Full Stack',
      email: 'moulou_h@etna-alternance.net',
      phone: '+33 7 68 72 70 43',
      location: 'Alfortville, France',
      linkedin: '/in/harvey-mouloundou/',
      github: 'github.com/Shadowstrikesblu',
    },
    availability: 'Disponible dès avril 2026',
    alternanceNote: false,
    summary: "En Master 1 Cloud DevOps à l'ETNA et titulaire d'un Master 2 en Cybersécurité, je cible une alternance DevOps / Cloud (Azure, AWS) axée sur l'automatisation et l'infrastructure.\n\n3 ans d'expérience en déploiement d'applications, mise en place de pipelines CI/CD et scripting (Python, Bash, PowerShell). A l'aise avec Docker, les environnements VPS Windows/IIS et les tests automatisés. Force de proposition, curieux des pratiques IaC (Terraform, Ansible) et des architectures cloud modernes.",
    softSkills: ["Autonomie", "Force de proposition", "Curiosité technique", "Rigueur analytique", "Résolution de problèmes", "Travail en équipe", "Adaptabilité"],
    skills: {
      frontend:  ['React.js', 'Vue.js', 'JavaScript', 'TypeScript', 'HTML', 'CSS'],
      backend:   ['Node.js', '.NET', 'Java', 'API REST', 'AdonisJS'],
      databases: ['PostgreSQL', 'MySQL', 'gestion et manipulation de données'],
      devops:    ['Git', 'GitHub', 'GitLab CI/CD', 'Docker', 'CI/CD', 'Terraform', 'Ansible', 'VPS Windows/IIS'],
      tests:     ['Jest', 'Cypress', 'Postman', 'Burp Suite', 'ZAP'],
      cloud:     ['AWS', 'Azure (bases)', 'OVHcloud', 'supervision applicative'],
      scripting: ['Python', 'Bash', 'PowerShell'],
      methods:   ['Agile/Scrum', 'IaC', 'amélioration continue'],
    },
    experiences: [
      {
        id: 1,
        position: 'Ingénieur DevOps (Alternance)',
        company: 'Congo Digital - mission client WYMEE, France',
        period: 'sept. 2025 - mars 2026',
        bullets: "Déploiement et mise en production d'applications .NET (backend) et NodeJS (frontend) sur VPS Windows/IIS\nConstruction de pipelines de tests automatisés (Jest, Cypress) et tests API (Postman)\nAudit de sécurité applicatif (Burp Suite, ZAP) et suivi des correctifs\nMise en place d'alertes de supervision et optimisation des temps de réponse\nDocumentation des procédures de déploiement et de maintenance",
      },
      {
        id: 2,
        position: 'Consultant Dev Junior',
        company: 'IPASYS, Garches',
        period: 'fév. 2025 - juin 2025',
        bullets: "Création et maintenance de sites web en Ruby via FAVEOD Designer\nSupport applicatif et amélioration continue des solutions livrées",
      },
      {
        id: 3,
        position: 'Analyste Cybersécurité (Alternance)',
        company: 'Schneider Electric',
        period: 'sept. 2023 - août 2024',
        bullets: "Développement de scripts Python de détection de machines exposées sur Internet\nAnalyse et classification de données de sécurité (logs, alertes SIEM)\nGestion des espaces de stockage et automatisation de rapports de veille",
      },
      {
        id: 4,
        position: 'Développeur Web Full Stack (Alternance)',
        company: 'WYMEE, Reims',
        period: 'sept. 2021 - août 2023',
        bullets: "Recherche et développement d'un parseur de CV en Java\nDéveloppement full-stack (backend Java/AdonisJS, frontend Vue.js)\nConception d'outils de visualisation et traitement de données JSON\nDéploiement sur VPS et intégration d'APIs tierces\nParticipation aux mises en production et maintenance applicative",
      },
      {
        id: 5,
        position: 'Stagiaire Développeur',
        company: 'SONEC AFRICA, Abidjan',
        period: 'mars - juil. 2021',
        bullets: "Développement de plateformes collaboratives pour institutions gouvernementales\nTests fonctionnels d'un système de gestion des permis de conduire",
      },
    ],
    education: [
      {
        id: 1,
        degree: 'Master 1 Cloud DevOps',
        period: 'Mars 2026 (en cours)',
        school: 'ETNA – École des Technologies Numériques Avancées',
        description: '',
      },
      {
        id: 2,
        degree: 'Master 2 Cybersécurité – Campus EuraTechnologies',
        period: '2022 – 2024',
        school: 'Institut Catholique de Lille',
        description: '',
      },
      {
        id: 3,
        degree: 'Licence 3 Sciences du Numérique',
        period: '2019 – 2022',
        school: 'Institut Catholique de Lille',
        description: '',
      },
    ],
    projects: [
      {
        id: 1,
        name: 'Site web Portfolio',
        tech: 'TypeScript, OVHCLOUD',
        link: 'vparfait.com',
        description: "Réalisé en TypeScript\nHébergé avec l'outil OVHCLOUD\nAccessible avec l'adresse vparfait.com",
      },
      {
        id: 2,
        name: 'Lecteur musical',
        tech: 'EXPO GO',
        link: '',
        description: "Lecteur de vidéos réalisé avec EXPO GO\nGestion de comptes et de vidéos « aimées »\nPublications de commentaires",
      },
    ],
    languages: [
      { name: 'Français',  level: 'Langue maternelle', countryCode: 'FR' },
      { name: 'Anglais',   level: 'C1',                countryCode: 'GB' },
      { name: 'Allemand',  level: 'B1',                countryCode: 'DE' },
    ],
    hiddenSkills: {},
    customSkillCats: [],
  }
}
