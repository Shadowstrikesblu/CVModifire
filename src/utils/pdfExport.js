async function getPdfMake() {
  const [{ default: pdfMake }, pdfFonts] = await Promise.all([
    import('pdfmake/build/pdfmake'),
    import('pdfmake/build/vfs_fonts'),
  ])
  pdfMake.vfs = pdfFonts.default ?? pdfFonts
  pdfMake.fonts = {
    Roboto: {
      normal:      'Roboto-Regular.ttf',
      bold:        'Roboto-Medium.ttf',
      italics:     'Roboto-Italic.ttf',
      bolditalics: 'Roboto-MediumItalic.ttf',
    },
  }
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

const SIDEBAR_PT = 172.91  // 61 mm in PDF points

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
    canvas: [{ type: 'line', x1: 0, y1: 0, x2: 128, y2: 0, lineWidth: 0.5, lineColor: '#3a5a7a' }],
    margin: [0, 0, 0, 3],
  }
}

function sbHead(text) {
  return {
    text: text.toUpperCase(),
    fontSize: 7, bold: true, color: C.white, characterSpacing: 0.8,
    margin: [0, 0, 0, 4],
  }
}

function sbSection(title, items) {
  return [sbRule(), sbHead(title), ...items, { text: '', margin: [0, 4, 0, 0] }]
}

// ── Build sidebar ───────────────────────────────────────────────

function buildSidebar(resume) {
  const out = []
  const p = resume.personal

  out.push({ text: p.firstName || '', fontSize: 12, bold: true, color: C.white, lineHeight: 1.1 })
  out.push({ text: (p.lastName || '').toUpperCase(), fontSize: 12, bold: true, color: C.white, lineHeight: 1.1, characterSpacing: 0.5 })
  out.push({ text: p.title || '', fontSize: 8, italics: true, color: C.sideDim, margin: [0, 4, 0, 10] })

  const contactItems = [
    p.location && p.location,
    p.phone    && p.phone,
    p.linkedin && p.linkedin,
    p.email    && p.email,
    p.github   && p.github,
  ].filter(Boolean).map(txt => ({ text: txt, fontSize: 7.5, color: C.sideTxt, margin: [0, 0, 0, 2] }))
  if (contactItems.length) out.push(...sbSection('Contact', contactItems))

  if (resume.availability) {
    const av = [{ text: resume.availability, fontSize: 8, bold: true, color: C.sideTxt }]
    if (resume.alternanceNote) {
      const dur = resume.alternanceDuration === '24' ? '2 ans' : resume.alternanceDuration === '36' ? '3 ans' : '1 an'
      av.push({ text: `33h e-learning / 1 ven. sur 3 à l'ETNA — ${dur}`, fontSize: 7, italics: true, color: C.sideDim, margin: [0, 2, 0, 0] })
    }
    out.push(...sbSection('Disponibilité', av))
  }

  const soft = (resume.softSkills || []).filter(Boolean)
  if (soft.length) {
    out.push(...sbSection('Soft Skills', soft.map(s => ({
      text: '· ' + s, fontSize: 7.5, color: C.sideTxt, margin: [0, 0, 0, 1],
    }))))
  }

  const langs = (resume.languages || []).filter(l => l.name)
  if (langs.length) {
    out.push(...sbSection('Langues', langs.map(l => ({
      text: (l.countryCode ? '[' + l.countryCode + '] ' : '') + l.name + (l.level ? ' - ' + l.level : ''),
      fontSize: 7.5, color: C.sideTxt, margin: [0, 0, 0, 2],
    }))))
  }

  const cats = [...BASE_SKILL_CATS, ...(resume.customSkillCats || [])]
  const skillRows = cats
    .map(cat => ({ cat, skills: visibleSkills(resume, cat.key) }))
    .filter(({ skills }) => skills.length)
    .map(({ cat, skills }) => ({
      text: [
        { text: cat.label + ' : ', bold: true, color: C.white },
        { text: skills.join(', ') + '.', color: C.sideTxt },
      ],
      fontSize: 7.5, lineHeight: 1.35, margin: [0, 0, 0, 3],
    }))
  if (skillRows.length) out.push(...sbSection('Compétences Techniques', skillRows))

  return out
}

// ── Build main content ──────────────────────────────────────────

function secTitle(label) {
  return {
    stack: [
      { text: label, fontSize: 8.5, bold: true, color: C.navDark, characterSpacing: 0.4 },
      { canvas: [{ type: 'line', x1: 0, y1: 3, x2: 375, y2: 3, lineWidth: 1.5, lineColor: C.blue }] },
    ],
    margin: [0, 0, 0, 6],
  }
}

function buildMain(resume) {
  const out = []

  if (resume.summary?.trim()) {
    out.push({
      stack: resume.summary.split('\n\n').filter(p => p.trim()).map(p => ({
        text: p, fontSize: 8, italics: true, color: C.body, lineHeight: 1.4, margin: [0, 0, 0, 4],
      })),
      margin: [0, 0, 0, 8],
    })
  }

  const exps = (resume.experiences || []).filter(e => e.company)
  if (exps.length) {
    out.push(secTitle('EXPÉRIENCES PROFESSIONNELLES'))
    for (const exp of exps) {
      out.push({
        stack: [
          { text: exp.position, fontSize: 8.5, bold: true, color: C.dark, margin: [0, 0, 0, 1] },
          {
            text: [
              { text: exp.company, color: C.blue, bold: true },
              exp.period ? { text: ' | ' + exp.period, color: C.muted, italics: true } : '',
            ],
            fontSize: 7.8, margin: [0, 0, 0, 2],
          },
          ...parseBullets(exp.bullets).map(b => ({
            columns: [
              { text: '–', width: 7, color: C.muted, fontSize: 7.8 },
              { text: b, fontSize: 7.8, color: C.body, lineHeight: 1.3 },
            ],
            margin: [0, 0, 0, 1],
          })),
        ],
        margin: [0, 0, 0, 6],
      })
    }
  }

  const edus = (resume.education || []).filter(e => e.school)
  if (edus.length) {
    out.push(secTitle('FORMATION'))
    for (const edu of edus) {
      out.push({
        stack: [
          { text: edu.degree + (edu.period ? ' - ' + edu.period : ''), fontSize: 8.5, bold: true, color: C.blue, margin: [0, 0, 0, 1] },
          { text: edu.school, fontSize: 7.8, color: C.body },
          ...(edu.description ? [{ text: edu.description, fontSize: 7.5, color: C.muted, margin: [0, 1, 0, 0] }] : []),
        ],
        margin: [0, 0, 0, 5],
      })
    }
  }

  const projs = (resume.projects || []).filter(p => p.name)
  if (projs.length) {
    out.push(secTitle('PROJETS'))
    for (const proj of projs) {
      out.push({
        stack: [
          {
            text: [
              { text: proj.name, bold: true },
              proj.tech ? { text: ' - ' + proj.tech, fontSize: 7.5, color: C.muted, italics: true } : '',
            ],
            fontSize: 8.5, color: C.blue, margin: [0, 0, 0, 1],
          },
          ...parseBullets(proj.description).map(b => ({
            text: '• ' + b, fontSize: 7.8, color: C.body, lineHeight: 1.3, margin: [7, 0, 0, 1],
          })),
        ],
        margin: [0, 0, 0, 5],
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
    background(currentPage, pageSize) {
      return {
        canvas: [{ type: 'rect', x: 0, y: 0, w: SIDEBAR_PT, h: pageSize.height, color: C.navy }],
      }
    },
    defaultStyle: { font: 'Roboto', fontSize: 8.5, lineHeight: 1.35 },
    content: [{
      columns: [
        { width: SIDEBAR_PT, stack: buildSidebar(resume), margin: [16, 20, 14, 20] },
        { width: '*',        stack: buildMain(resume),    margin: [18, 20, 20, 20] },
      ],
      columnGap: 0,
    }],
  }

  const blob = await new Promise((resolve, reject) => {
    try {
      pdfMake.createPdf(docDef).getBlob(resolve)
    } catch (e) {
      reject(e)
    }
  })
  const url = URL.createObjectURL(blob)
  const a   = document.createElement('a')
  a.href     = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
