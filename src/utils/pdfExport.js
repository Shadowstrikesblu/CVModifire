async function getPdfMake() {
  const [{ default: pdfMake }, pdfFonts] = await Promise.all([
    import('pdfmake/build/pdfmake'),
    import('pdfmake/build/vfs_fonts'),
  ])
  pdfMake.vfs = pdfFonts?.default?.pdfMake?.vfs ?? pdfFonts?.default?.vfs ?? pdfFonts?.vfs
  return pdfMake
}

const C = {
  navy:    '#132248',
  sideTxt: '#b8cce0',
  sideDim: '#8aaac8',
  white:   '#ffffff',
  blue:    '#2563eb',
  dark:    '#111827',
  body:    '#374151',
  muted:   '#6b7280',
  navDark: '#1e3a5f',
}

// 61 mm in PDF points (1 mm = 72/25.4 pt)
const SIDEBAR_PT = 172.91

const BASE_SKILL_CATS = [
  { key: 'frontend',  label: 'FrontEnd' },
  { key: 'backend',   label: 'Backend' },
  { key: 'databases', label: 'Bases de données' },
  { key: 'devops',    label: 'DevOps & Déploiement' },
  { key: 'tests',     label: 'Tests & Qualité' },
  { key: 'cloud',     label: 'Cloud & Infrastructure' },
  { key: 'scripting', label: 'Scripting & Automatisation' },
  { key: 'methods',   label: 'Méthodes de travail' },
]

function parseBullets(text) {
  if (!text) return []
  return text.split('\n').map(l => l.trim().replace(/^[-–•]\s*/, '')).filter(Boolean)
}

function visibleSkills(resume, cat) {
  const all    = resume.skills?.[cat] || []
  const hidden = resume.hiddenSkills?.[cat] || []
  return hidden.length ? all.filter(s => !hidden.includes(s)) : all
}

// ── Sidebar helpers ─────────────────────────────────────────────

function sbRule() {
  return {
    canvas: [{ type: 'line', x1: 0, y1: 0, x2: 130, y2: 0, lineWidth: 0.5, lineColor: '#3a5a7a' }],
    margin: [0, 0, 0, 5],
  }
}

function sbHead(text) {
  return {
    text: text.toUpperCase(),
    fontSize: 7.5, bold: true, color: C.white, characterSpacing: 0.9,
    margin: [0, 0, 0, 6],
  }
}

function sbSection(title, items) {
  return [sbRule(), sbHead(title), ...items, { text: '', margin: [0, 6, 0, 0] }]
}

// ── Build sidebar ───────────────────────────────────────────────

function buildSidebar(resume) {
  const out = []
  const p = resume.personal

  out.push({ text: p.firstName || '', fontSize: 13, bold: true, color: C.white, lineHeight: 1.15 })
  out.push({ text: (p.lastName || '').toUpperCase(), fontSize: 13, bold: true, color: C.white, lineHeight: 1.15, characterSpacing: 0.5 })
  out.push({ text: p.title || '', fontSize: 8.5, italics: true, color: C.sideDim, margin: [0, 5, 0, 14] })

  // Contact — plain text, no emoji (font limitation)
  const contactItems = [
    p.location && p.location,
    p.phone    && p.phone,
    p.linkedin && p.linkedin,
    p.email    && p.email,
    p.github   && p.github,
  ].filter(Boolean).map(txt => ({ text: txt, fontSize: 8, color: C.sideTxt, margin: [0, 0, 0, 3] }))
  if (contactItems.length) out.push(...sbSection('Contact', contactItems))

  // Availability
  if (resume.availability) {
    const av = [{ text: resume.availability, fontSize: 8.5, bold: true, color: C.sideTxt }]
    if (resume.alternanceNote) {
      av.push({ text: "33h e-learning / 1 ven. sur 3 à l'ETNA", fontSize: 7.5, italics: true, color: C.sideDim, margin: [0, 3, 0, 0] })
    }
    out.push(...sbSection('Disponibilité', av))
  }

  // Soft skills
  const soft = (resume.softSkills || []).filter(Boolean)
  if (soft.length) {
    out.push(...sbSection('Soft Skills', soft.map(s => ({ text: '· ' + s, fontSize: 8, color: C.sideTxt, margin: [0, 0, 0, 2] }))))
  }

  // Languages
  const langs = (resume.languages || []).filter(l => l.name)
  if (langs.length) {
    out.push(...sbSection('Langues', langs.map(l => ({
      text: (l.countryCode ? '[' + l.countryCode + '] ' : '') + l.name + (l.level ? ' — ' + l.level : ''),
      fontSize: 8, color: C.sideTxt, margin: [0, 0, 0, 3],
    }))))
  }

  // Technical skills
  const cats = [...BASE_SKILL_CATS, ...(resume.customSkillCats || [])]
  const skillRows = cats
    .map(cat => ({ cat, skills: visibleSkills(resume, cat.key) }))
    .filter(({ skills }) => skills.length)
    .map(({ cat, skills }) => ({
      text: [
        { text: cat.label + ' : ', bold: true, color: C.white },
        { text: skills.join(', ') + '.', color: C.sideTxt },
      ],
      fontSize: 8, lineHeight: 1.45, margin: [0, 0, 0, 4],
    }))
  if (skillRows.length) out.push(...sbSection('Compétences Techniques', skillRows))

  return out
}

// ── Build main content ──────────────────────────────────────────

function secTitle(label) {
  return {
    stack: [
      { text: label, fontSize: 9.2, bold: true, color: C.navDark, characterSpacing: 0.5 },
      { canvas: [{ type: 'line', x1: 0, y1: 3, x2: 378, y2: 3, lineWidth: 1.5, lineColor: C.blue }] },
    ],
    margin: [0, 0, 0, 9],
  }
}

function buildMain(resume) {
  const out = []

  // Summary
  if (resume.summary?.trim()) {
    out.push({
      stack: resume.summary.split('\n\n').filter(p => p.trim()).map(p => ({
        text: p, fontSize: 8.8, italics: true, color: C.body, lineHeight: 1.55, margin: [0, 0, 0, 6],
      })),
      margin: [0, 0, 0, 12],
    })
  }

  // Experiences
  const exps = (resume.experiences || []).filter(e => e.company)
  if (exps.length) {
    out.push(secTitle('EXPÉRIENCES PROFESSIONNELLES'))
    for (const exp of exps) {
      out.push({
        stack: [
          { text: exp.position, fontSize: 9.2, bold: true, color: C.dark, margin: [0, 0, 0, 1] },
          {
            text: [
              { text: exp.company, color: C.blue, bold: true },
              exp.period ? { text: ' | ' + exp.period, color: C.muted, italics: true } : '',
            ],
            fontSize: 8.2, margin: [0, 0, 0, 3],
          },
          ...parseBullets(exp.bullets).map(b => ({
            columns: [
              { text: '–', width: 8, color: C.muted, fontSize: 8.2 },
              { text: b, fontSize: 8.2, color: C.body, lineHeight: 1.45 },
            ],
            margin: [0, 0, 0, 1],
          })),
        ],
        margin: [0, 0, 0, 9],
      })
    }
  }

  // Education
  const edus = (resume.education || []).filter(e => e.school)
  if (edus.length) {
    out.push(secTitle('FORMATION'))
    for (const edu of edus) {
      out.push({
        stack: [
          { text: edu.degree + (edu.period ? ' — ' + edu.period : ''), fontSize: 9, bold: true, color: C.blue, margin: [0, 0, 0, 1] },
          { text: edu.school, fontSize: 8.5, color: C.body },
          ...(edu.description ? [{ text: edu.description, fontSize: 8, color: C.muted, margin: [0, 2, 0, 0] }] : []),
        ],
        margin: [0, 0, 0, 9],
      })
    }
  }

  // Projects
  const projs = (resume.projects || []).filter(p => p.name)
  if (projs.length) {
    out.push(secTitle('PROJETS'))
    for (const proj of projs) {
      out.push({
        stack: [
          {
            text: [
              { text: proj.name, bold: true },
              proj.tech ? { text: ' — ' + proj.tech, fontSize: 8, color: C.muted, italics: true } : '',
            ],
            fontSize: 9, color: C.blue, margin: [0, 0, 0, 2],
          },
          ...parseBullets(proj.description).map(b => ({
            text: '• ' + b, fontSize: 8.2, color: C.body, lineHeight: 1.45, margin: [8, 0, 0, 1],
          })),
        ],
        margin: [0, 0, 0, 9],
      })
    }
  }

  return out
}

// ── Public export ───────────────────────────────────────────────

export async function exportPdfText(resume, filename) {
  const pdfMake = await getPdfMake()

  const docDef = {
    pageSize: 'A4',
    pageMargins: [0, 0, 0, 0],
    // Draw the full-height navy sidebar as a page background rectangle
    background(currentPage, pageSize) {
      return {
        canvas: [{ type: 'rect', x: 0, y: 0, w: SIDEBAR_PT, h: pageSize.height, color: C.navy }],
      }
    },
    defaultStyle: { font: 'Roboto', fontSize: 9.2, lineHeight: 1.45 },
    content: [{
      columns: [
        { width: SIDEBAR_PT, stack: buildSidebar(resume), margin: [18, 26, 16, 26] },
        { width: '*',        stack: buildMain(resume),    margin: [20, 26, 22, 26] },
      ],
      columnGap: 0,
    }],
  }

  pdfMake.createPdf(docDef).download(filename)
}
