const KEY = 'cvmodifire_resume'
const VERSION = 3

export function loadResume() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    return data._version === VERSION ? data : null
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
    availability: 'Immédiate',
    summary: "Étudiant en Master Cloud DevOps à l'Ecole des Technologies Numériques Avancées (ETNA) et titulaire d'un Master 2 en Cybersécurité, je recherche une alternance orientée DevOps, Cloud Azure et automatisation.\n\nJe possède 3 ans d'expérience cumulée en développement frontend et backend, intégration d'API, déploiement d'applications et automatisation. Curieux et autonome, j'apprécie les environnements techniques dynamiques nécessitant collaboration, résolution de problèmes et amélioration continue.",
    softSkills: ["Autonomie", "Curiosité technique", "Résolution de problèmes", "Travail en équipe", "Adaptabilité", "Esprit d'analyse"],
    skills: {
      frontend:  ['React.js', 'Vue.js', 'JavaScript', 'TypeScript', 'HTML', 'CSS'],
      backend:   ['Node.js', '.NET', 'Java', 'API REST', 'AdonisJS'],
      databases: ['PostgreSQL', 'MySQL', 'manipulation et gestion des données'],
      devops:    ['Git', 'GitHub', 'Docker', 'CI/CD', 'VPS Windows/IIS'],
      tests:     ['Jest', 'Cypress', 'Postman', 'tests automatisés et debugging'],
      cloud:     ['AWS (bases)', 'supervision et maintenance applicative'],
      scripting: ['Python', 'Bash', 'PowerShell'],
      methods:   ['Agile/Scrum', 'travail en équipe et amélioration continue'],
    },
    experiences: [
      {
        id: 1,
        position: 'Ingénieur DevOps',
        company: 'Congo Digital (pour WYMEE, France)',
        period: 'septembre 2025 – Mars 2026',
        bullets: "Déploiement d'applications backend .NET et frontend NodeJS sur VPS Windows via IIS\nMise en place de tests automatisés (Jest, Cypress) et tests API (Postman)\nTests de sécurité (Burp Suite, ZAP)\nMaintenance, supervision et optimisation des performances applicatives\nSupervision, maintenance et suivi de l'environnement.",
      },
      {
        id: 2,
        position: 'Consultant Dev Junior',
        company: 'IPASYS, Garches (France)',
        period: 'février 2025 – Juin 2025',
        bullets: "Création et maintenance de sites web en Ruby via la technologie FAVEOD Designer\nSupport applicatif et amélioration continue des solutions développées",
      },
      {
        id: 3,
        position: 'Analyste de données en Cybersécurité (Alternance)',
        company: 'Schneider Electric',
        period: '2023 – 2024',
        bullets: "Développement de scripts de détection de machines exposées sur Internet\nGestion d'espaces de stockage de données\nAnalyse avancée de données de cybersécurité",
      },
      {
        id: 4,
        position: 'Web Developer (Alternance)',
        company: 'WYMEE, Reims',
        period: '2021 – 2023',
        bullets: "Recherche et développement d'un parseur de CV en Java\nDéveloppement full-stack (Backend Java / Adonis – Frontend Vue.js)\nConception d'outils de visualisation et traitement de données JSON\nDéploiement sur environnements VPS et intégration d'APIs\nParticipation aux mises en production et maintenance applicative",
      },
      {
        id: 5,
        position: 'Stage',
        company: 'SONEC AFRICA, Abidjan',
        period: '2021',
        bullets: "Développement de plateformes collaboratives gouvernementales\nVérification fonctionnelle d'un système de gestion des permis de conduire",
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
  }
}
