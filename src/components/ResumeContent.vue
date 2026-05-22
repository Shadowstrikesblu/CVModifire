<template>
  <div class="cv-wrap">

    <!-- ========== SIDEBAR ========== -->
    <aside class="cv-sidebar">

      <div class="sb-name-block">
        <div class="sb-first">{{ resume.personal.firstName }}</div>
        <div class="sb-last">{{ resume.personal.lastName }}</div>
        <div class="sb-title">{{ resume.personal.title }}</div>
      </div>

      <!-- Contact -->
      <div class="sb-section">
        <h3 class="sb-title-section">Contact</h3>
        <ul class="sb-contact">
          <li v-if="resume.personal.location">
            <span class="sb-icon">📍</span>{{ resume.personal.location }}
          </li>
          <li v-if="resume.personal.phone">
            <span class="sb-icon">📞</span>{{ resume.personal.phone }}
          </li>
          <li v-if="resume.personal.linkedin">
            <span class="sb-icon">🔗</span>{{ resume.personal.linkedin }}
          </li>
          <li v-if="resume.personal.email">
            <span class="sb-icon">✉️</span>{{ resume.personal.email }}
          </li>
          <li v-if="resume.personal.github">
            <span class="sb-icon">⚡</span>{{ resume.personal.github }}
          </li>
        </ul>
      </div>

      <!-- Disponibilité -->
      <div v-if="resume.availability" class="sb-section">
        <h3 class="sb-title-section">Disponibilité</h3>
        <p class="sb-avail">✅ {{ resume.availability }}</p>
      </div>

      <!-- Soft Skills -->
      <div v-if="resume.softSkills?.length" class="sb-section">
        <h3 class="sb-title-section">Soft Skills</h3>
        <ul class="sb-soft">
          <li v-for="s in resume.softSkills" :key="s">{{ s }}</li>
        </ul>
      </div>

      <!-- Langues -->
      <div v-if="resume.languages?.some(l => l.name)" class="sb-section">
        <h3 class="sb-title-section">Langues</h3>
        <ul class="sb-langs">
          <li v-for="l in resume.languages.filter(l => l.name)" :key="l.name">
            <span class="sb-flag">{{ toFlag(l.countryCode) }}</span>
            <span>{{ l.name }}</span>
            <span v-if="l.level" class="sb-lang-level"> — {{ l.level }}</span>
          </li>
        </ul>
      </div>

      <!-- Compétences techniques -->
      <div v-if="hasSkills" class="sb-section">
        <h3 class="sb-title-section">Compétences Techniques</h3>
        <div class="sb-skills">
          <template v-for="cat in skillCats" :key="cat.key">

            <div v-if="skillsOf(cat.key).length" class="sb-skill-row">
              <span class="sb-skill-lbl">{{ cat.label }} :</span>
              <span class="sb-skill-val"> {{ skillsOf(cat.key).join(', ') }}.</span>
            </div>
          </template>
        </div>
      </div>

    </aside>

    <!-- ========== MAIN ========== -->
    <main class="cv-main">

      <!-- Summary -->
      <div v-if="resume.summary" class="cv-summary">
        <p
          v-for="(para, i) in resume.summary.split('\n\n').filter(p => p.trim())"
          :key="i"
        >{{ para }}</p>
      </div>

      <!-- Expériences -->
      <section v-if="resume.experiences?.some(e => e.company)" class="cv-section">
        <h2 class="cv-sec-title">Expériences Professionnelles</h2>
        <div
          v-for="exp in resume.experiences.filter(e => e.company)"
          :key="exp.id"
          class="cv-entry"
        >
          <p class="cv-entry-pos">{{ exp.position }}</p>
          <p class="cv-entry-sub">
            <span class="cv-company">{{ exp.company }}</span>
            <span v-if="exp.period" class="cv-period"> | {{ exp.period }}</span>
          </p>
          <div class="cv-bullets">
            <p v-for="line in parseBullets(exp.bullets)" :key="line" class="cv-bullet">
              <span class="bullet-dash">–</span>{{ line }}
            </p>
          </div>
        </div>
      </section>

      <!-- Formation -->
      <section v-if="resume.education?.some(e => e.school)" class="cv-section">
        <h2 class="cv-sec-title">Formation</h2>
        <div
          v-for="edu in resume.education.filter(e => e.school)"
          :key="edu.id"
          class="cv-entry"
        >
          <p class="cv-edu-degree">
            {{ edu.degree }}<span v-if="edu.period"> — {{ edu.period }}</span>
          </p>
          <p class="cv-edu-school">{{ edu.school }}</p>
          <p v-if="edu.description" class="cv-desc">{{ edu.description }}</p>
        </div>
      </section>

      <!-- Projets -->
      <section v-if="resume.projects?.some(p => p.name)" class="cv-section">
        <h2 class="cv-sec-title">Projets</h2>
        <div
          v-for="proj in resume.projects.filter(p => p.name)"
          :key="proj.id"
          class="cv-entry"
        >
          <p class="cv-proj-name">
            {{ proj.name }}
            <span v-if="proj.tech" class="cv-proj-tech"> — {{ proj.tech }}</span>
          </p>
          <div class="cv-proj-bullets">
            <p v-for="line in parseBullets(proj.description)" :key="line" class="cv-proj-bullet">
              • {{ line }}
            </p>
          </div>
        </div>
      </section>

    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ resume: Object })

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

const skillCats = computed(() => [
  ...BASE_SKILL_CATS,
  ...(props.resume?.customSkillCats || []),
])

function skillsOf(cat) {
  const all    = props.resume?.skills?.[cat] || []
  const hidden = props.resume?.hiddenSkills?.[cat] || []
  return hidden.length ? all.filter(s => !hidden.includes(s)) : all
}

const hasSkills = computed(() => skillCats.value.some(c => skillsOf(c.key).length))

function toFlag(code) {
  if (!code || code.length !== 2) return ''
  return [...code.toUpperCase()].map(c =>
    String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)
  ).join('')
}

function parseBullets(text) {
  if (!text) return []
  return text.split('\n')
    .map(l => l.trim().replace(/^[-–•]\s*/, ''))
    .filter(Boolean)
}
</script>

<style scoped>
/* ─── Outer wrapper ─────────────────────────────────── */
.cv-wrap {
  display: flex;
  width: 210mm;
  min-height: 297mm;
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 9.2pt;
  line-height: 1.45;
  background: white;
}

/* ─── SIDEBAR ───────────────────────────────────────── */
.cv-sidebar {
  width: 61mm;
  flex-shrink: 0;
  background: #132248;
  color: #cdd8ea;
  padding: 26px 16px 26px 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Name */
.sb-name-block { margin-bottom: 4px; }

.sb-first {
  font-size: 13pt;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.15;
  letter-spacing: -0.2px;
}

.sb-last {
  font-size: 13pt;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.15;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sb-title {
  font-size: 8.5pt;
  color: #8aaac8;
  font-style: italic;
  margin-top: 5px;
}

/* Section inside sidebar */
.sb-section { }

.sb-title-section {
  font-size: 7.8pt;
  font-weight: 700;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.9px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.25);
  padding-bottom: 3px;
  margin-bottom: 7px;
}

/* Contact list */
.sb-contact {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sb-contact li {
  display: flex;
  align-items: flex-start;
  gap: 5px;
  font-size: 8pt;
  color: #b8cce0;
  word-break: break-word;
}

.sb-icon { flex-shrink: 0; font-size: 9pt; }

/* Availability */
.sb-avail { font-size: 8.5pt; color: #b8cce0; font-weight: 500; }

/* Soft skills */
.sb-soft {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.sb-soft li {
  font-size: 8pt;
  color: #b8cce0;
  padding-left: 11px;
  position: relative;
}

.sb-soft li::before {
  content: '·';
  position: absolute;
  left: 2px;
  color: #7a9cbf;
  font-size: 10pt;
  line-height: 1.2;
}

/* Languages */
.sb-langs {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sb-langs li {
  display: flex;
  align-items: center;
  font-size: 8pt;
  color: #b8cce0;
  gap: 4px;
}

.sb-flag { font-size: 10pt; }
.sb-lang-level { color: #8aaac8; }

/* Skills */
.sb-skills {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.sb-skill-row {
  font-size: 8pt;
  color: #b8cce0;
  line-height: 1.45;
}

.sb-skill-lbl {
  font-weight: 700;
  color: #ffffff;
}

/* ─── MAIN CONTENT ──────────────────────────────────── */
.cv-main {
  flex: 1;
  min-width: 0;
  background: white;
  color: #1a1a1a;
  padding: 26px 22px 26px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Summary */
.cv-summary {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.cv-summary p {
  font-size: 8.8pt;
  font-style: italic;
  color: #374151;
  line-height: 1.55;
}

/* Sections */
.cv-section { }

.cv-sec-title {
  font-size: 9.2pt;
  font-weight: 700;
  color: #1e3a5f;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1.5px solid #2563eb;
  padding-bottom: 4px;
  margin-bottom: 9px;
}

/* Entries */
.cv-entry {
  margin-bottom: 10px;
}

.cv-entry:last-child { margin-bottom: 0; }

.cv-entry-pos {
  font-size: 9.2pt;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1px;
}

.cv-entry-sub {
  font-size: 8.2pt;
  margin-bottom: 3px;
}

.cv-company {
  color: #2563eb;
  font-weight: 500;
}

.cv-period {
  color: #6b7280;
  font-style: italic;
}

/* Bullet points */
.cv-bullets { }

.cv-bullet {
  display: flex;
  gap: 6px;
  font-size: 8.2pt;
  color: #374151;
  margin-bottom: 1px;
  line-height: 1.45;
}

.bullet-dash {
  color: #6b7280;
  flex-shrink: 0;
}

/* Education */
.cv-edu-degree {
  font-size: 9pt;
  font-weight: 700;
  color: #2563eb;
  margin-bottom: 1px;
}

.cv-edu-school {
  font-size: 8.5pt;
  color: #374151;
}

.cv-desc {
  font-size: 8pt;
  color: #6b7280;
  margin-top: 2px;
}

/* Projects */
.cv-proj-name {
  font-size: 9pt;
  font-weight: 700;
  color: #2563eb;
  margin-bottom: 2px;
}

.cv-proj-tech {
  font-size: 8pt;
  font-weight: 400;
  color: #6b7280;
  font-style: italic;
}

.cv-proj-bullets { }

.cv-proj-bullet {
  font-size: 8.2pt;
  color: #374151;
  margin-bottom: 1px;
  line-height: 1.45;
  padding-left: 10px;
}
</style>
