<template>
  <div class="editor">
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tab"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >{{ tab.label }}</button>
    </div>

    <div class="tab-content">

      <!-- ── Infos personnelles ── -->
      <div v-if="activeTab === 'personal'" class="section">
        <div class="field-grid">
          <div class="field">
            <label>Prénom(s)</label>
            <input v-model="resume.personal.firstName" placeholder="Harvey Kereth" />
          </div>
          <div class="field">
            <label>Nom de famille</label>
            <input v-model="resume.personal.lastName" placeholder="MOULOUNDOU" />
          </div>
        </div>
        <div class="field-grid">
          <div class="field">
            <label>Titre du poste</label>
            <input v-model="resume.personal.title" placeholder="Développeur Full Stack" />
          </div>
          <div class="field">
            <label>Disponibilité</label>
            <input v-model="resume.availability" placeholder="Immédiate" />
          </div>
        </div>
        <label class="checkbox-row">
          <input type="checkbox" v-model="resume.alternanceNote" />
          <span>
            Alternance
            <span class="checkbox-hint">— ajoute « 33h de e-learning modulable / 1 vendredi sur 3 à l'ETNA »</span>
          </span>
        </label>
        <div class="field-grid">
          <div class="field">
            <label>Email</label>
            <input v-model="resume.personal.email" type="email" placeholder="email@example.com" />
          </div>
          <div class="field">
            <label>Téléphone</label>
            <input v-model="resume.personal.phone" placeholder="+33 7 00 00 00 00" />
          </div>
        </div>
        <div class="field">
          <label>Ville / Localisation</label>
          <input v-model="resume.personal.location" placeholder="Paris, France" />
        </div>
        <div class="field-grid">
          <div class="field">
            <label>LinkedIn</label>
            <input v-model="resume.personal.linkedin" placeholder="/in/votre-profil/" />
          </div>
          <div class="field">
            <label>GitHub</label>
            <input v-model="resume.personal.github" placeholder="github.com/votre-pseudo" />
          </div>
        </div>
      </div>

      <!-- ── Accroche ── -->
      <div v-if="activeTab === 'summary'" class="section">
        <button
          class="btn-claude"
          :class="{ loading: rewriteLoading }"
          :disabled="rewriteLoading"
          @click="$emit('rewrite-summary')"
        >
          <svg v-if="!rewriteLoading" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
          <svg v-else class="spin-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
          <span v-if="rewriteLoading">Réécriture en cours…</span>
          <span v-else-if="hasApiKey">✨ Réécrire avec Claude pour ce poste</span>
          <span v-else>✨ Réécrire avec Claude — configurer la clé API ⚙️</span>
        </button>

        <div class="field">
          <label>
            Résumé / Accroche
            <span v-if="jobKeywords.length" class="kw-hint">
              Mots-clés offre :
              <span v-for="kw in jobKeywords.slice(0, 6)" :key="kw" class="kw-tag">{{ kw }}</span>
            </span>
          </label>
          <textarea
            v-model="resume.summary"
            rows="8"
            placeholder="Deux paragraphes séparés par une ligne vide..."
          />
        </div>
        <p class="hint">Séparez les paragraphes par une ligne vide. Le texte apparaîtra en italique dans le CV.</p>
      </div>

      <!-- ── Soft Skills ── -->
      <div v-if="activeTab === 'softskills'" class="section">
        <p class="hint">Un soft skill par ligne.</p>
        <div class="field">
          <label>Soft Skills</label>
          <textarea
            :value="resume.softSkills?.join('\n')"
            @input="resume.softSkills = $event.target.value.split('\n').map(s => s.trim()).filter(Boolean)"
            rows="8"
            placeholder="Autonomie&#10;Curiosité technique&#10;Résolution de problèmes&#10;Travail en équipe"
          />
        </div>
      </div>

      <!-- ── Compétences techniques ── -->
      <div v-if="activeTab === 'skills'" class="section">

        <!-- Job match summary -->
        <div v-if="jobKeywords.length" class="match-summary">
          <span class="match-summary-dot" />
          <span>
            <strong>{{ totalMatches }}</strong> compétence{{ totalMatches !== 1 ? 's' : '' }}
            correspondent à cette offre —
            cliquez sur un tag pour le masquer dans le CV
          </span>
        </div>
        <p v-else class="hint">
          Collez une offre d'emploi pour voir quelles compétences sont demandées.
          Cliquez sur un tag pour le masquer du CV.
        </p>

        <!-- Chip legend -->
        <div class="chip-legend">
          <span class="chip chip-match chip-demo">Tag en offre</span>
          <span class="chip chip-demo">Tag normal</span>
          <span class="chip chip-hidden chip-demo">Tag masqué (clic)</span>
        </div>

        <!-- One row per category (predefined + custom) -->
        <div v-for="cat in allSkillCats" :key="cat.key" class="skill-cat-block">
          <div class="skill-cat-header">
            <span class="skill-cat-label">{{ cat.label }}</span>
            <span v-if="matchedCount(cat.key)" class="match-badge">
              {{ matchedCount(cat.key) }} match
            </span>
            <button
              v-if="cat.isCustom"
              class="delete-cat-btn"
              @click="removeCustomCat(cat.key)"
              title="Supprimer ce domaine"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14H6L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4h6v2"/>
              </svg>
            </button>
          </div>

          <!-- Chips -->
          <div class="chips-row">
            <template v-for="skill in getSkillsArr(cat.key)" :key="skill">
              <span
                class="chip"
                :class="{
                  'chip-match':  isMatch(skill) && !isHidden(cat.key, skill),
                  'chip-hidden': isHidden(cat.key, skill),
                }"
                :title="isHidden(cat.key, skill)
                  ? 'Cliquer pour réafficher dans le CV'
                  : isMatch(skill)
                    ? 'Requis dans l\'offre — cliquer pour masquer'
                    : 'Cliquer pour masquer du CV'"
                @click="toggleHide(cat.key, skill)"
              >
                <span class="chip-match-dot" v-if="isMatch(skill) && !isHidden(cat.key, skill)" />
                {{ skill }}
                <button class="chip-x" @click.stop="removeSkill(cat.key, skill)" title="Supprimer">✕</button>
              </span>
            </template>
          </div>

          <!-- Add skill row -->
          <div class="add-skill-row">
            <input
              class="add-skill-input"
              v-model="newSkill[cat.key]"
              :placeholder="`+ Ajouter : ${cat.addHint}`"
              @keydown.enter.prevent="addSkill(cat.key)"
              @keydown.188.prevent="addSkill(cat.key)"
            />
            <button
              class="add-skill-btn"
              @click="addSkill(cat.key)"
              :disabled="!newSkill[cat.key]?.trim()"
            >Ajouter</button>
          </div>
        </div>

        <button v-if="hasHidden" class="reset-btn" @click="resetHidden">
          ↺ Réafficher toutes les compétences masquées
        </button>

        <!-- Add new category -->
        <div class="new-cat-block">
          <p class="new-cat-title">Ajouter un domaine personnalisé</p>
          <div class="add-skill-row">
            <input
              class="add-skill-input"
              v-model="newCatName"
              placeholder="Ex : Certifications, Outils métier, IA / LLM…"
              @keydown.enter.prevent="addCustomCat"
            />
            <button
              class="add-skill-btn"
              @click="addCustomCat"
              :disabled="!newCatName.trim()"
            >Créer</button>
          </div>
        </div>
      </div>

      <!-- ── Expériences ── -->
      <div v-if="activeTab === 'experience'" class="section">
        <div v-for="(exp, i) in resume.experiences" :key="exp.id" class="card">
          <div class="card-header">
            <span class="card-num">{{ i + 1 }}</span>
            <div class="card-actions">
              <button class="move-btn" :disabled="i === 0" @click="moveExp(i, -1)" title="Monter">↑</button>
              <button class="move-btn" :disabled="i === resume.experiences.length - 1" @click="moveExp(i, 1)" title="Descendre">↓</button>
              <button class="remove-btn" @click="resume.experiences.splice(i, 1)" v-if="resume.experiences.length > 1">✕</button>
            </div>
          </div>
          <div class="field-grid">
            <div class="field">
              <label>Poste</label>
              <input v-model="exp.position" placeholder="Ingénieur DevOps" />
            </div>
            <div class="field">
              <label>Entreprise</label>
              <input v-model="exp.company" placeholder="Nom de l'entreprise" />
            </div>
          </div>
          <div class="field">
            <label>Période</label>
            <input v-model="exp.period" placeholder="janvier 2024 – Présent" />
          </div>
          <div class="field">
            <label>Points clés (une ligne par point, sans tiret)</label>
            <textarea v-model="exp.bullets" rows="4"
              placeholder="Déploiement d'applications sur VPS Windows via IIS&#10;Mise en place de tests automatisés (Jest, Cypress)&#10;Tests de sécurité avec Burp Suite" />
          </div>
        </div>
        <button class="add-btn" @click="addExp">+ Ajouter une expérience</button>
      </div>

      <!-- ── Formation ── -->
      <div v-if="activeTab === 'education'" class="section">
        <div v-for="(edu, i) in resume.education" :key="edu.id" class="card">
          <div class="card-header">
            <span class="card-num">{{ i + 1 }}</span>
            <button class="remove-btn" @click="resume.education.splice(i, 1)" v-if="resume.education.length > 1">✕</button>
          </div>
          <div class="field-grid">
            <div class="field">
              <label>Diplôme</label>
              <input v-model="edu.degree" placeholder="Master 1 Cloud DevOps" />
            </div>
            <div class="field">
              <label>Période</label>
              <input v-model="edu.period" placeholder="2022 – 2024 (en cours)" />
            </div>
          </div>
          <div class="field">
            <label>École / Université</label>
            <input v-model="edu.school" placeholder="ETNA – École des Technologies Numériques Avancées" />
          </div>
          <div class="field">
            <label>Description (optionnel)</label>
            <input v-model="edu.description" placeholder="Spécialisation, mentions..." />
          </div>
        </div>
        <button class="add-btn" @click="addEdu">+ Ajouter une formation</button>
      </div>

      <!-- ── Projets ── -->
      <div v-if="activeTab === 'projects'" class="section">
        <div v-for="(proj, i) in resume.projects" :key="proj.id" class="card">
          <div class="card-header">
            <span class="card-num">{{ i + 1 }}</span>
            <button class="remove-btn" @click="resume.projects.splice(i, 1)">✕</button>
          </div>
          <div class="field-grid">
            <div class="field">
              <label>Nom du projet</label>
              <input v-model="proj.name" placeholder="Site web Portfolio" />
            </div>
            <div class="field">
              <label>Technologies</label>
              <input v-model="proj.tech" placeholder="TypeScript, OVHCLOUD" />
            </div>
          </div>
          <div class="field">
            <label>Lien (optionnel)</label>
            <input v-model="proj.link" placeholder="vparfait.com" />
          </div>
          <div class="field">
            <label>Description (une ligne par point)</label>
            <textarea v-model="proj.description" rows="3"
              placeholder="Réalisé en TypeScript&#10;Hébergé avec OVHCLOUD&#10;Accessible sur vparfait.com" />
          </div>
        </div>
        <button class="add-btn" @click="addProj">+ Ajouter un projet</button>
      </div>

      <!-- ── Langues ── -->
      <div v-if="activeTab === 'languages'" class="section">
        <p class="hint">
          Code pays ISO pour le drapeau : FR, GB, DE, ES, IT, PT, CN, JP, AR, RU…
        </p>
        <div v-for="(lang, i) in resume.languages" :key="i" class="lang-row">
          <input v-model="lang.name" placeholder="Anglais" class="lang-name" />
          <select v-model="lang.level">
            <option value="">Niveau</option>
            <option>Langue maternelle</option>
            <option>Courant (C1/C2)</option>
            <option>C1</option>
            <option>C2</option>
            <option>Avancé (B2)</option>
            <option>B2</option>
            <option>Intermédiaire (B1)</option>
            <option>B1</option>
            <option>Débutant (A2)</option>
            <option>A1</option>
          </select>
          <input v-model="lang.countryCode" placeholder="GB" maxlength="2" class="lang-code" />
          <button class="remove-btn sm" @click="resume.languages.splice(i, 1)">✕</button>
        </div>
        <button class="add-btn" @click="resume.languages.push({ name: '', level: '', countryCode: '' })">
          + Ajouter une langue
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { skillMatchesKeyword } from '../utils/keywords.js'

const props = defineProps({
  resume: Object,
  jobKeywords: { type: Array, default: () => [] },
  hasApiKey: { type: Boolean, default: false },
  rewriteLoading: { type: Boolean, default: false },
})
defineEmits(['rewrite-summary'])

const activeTab = ref('personal')

const tabs = [
  { id: 'personal',   label: 'Infos' },
  { id: 'summary',    label: 'Accroche' },
  { id: 'softskills', label: 'Soft Skills' },
  { id: 'skills',     label: 'Compétences' },
  { id: 'experience', label: 'Expériences' },
  { id: 'education',  label: 'Formation' },
  { id: 'projects',   label: 'Projets' },
  { id: 'languages',  label: 'Langues' },
]

const skillCats = [
  { key: 'frontend',  label: 'FrontEnd',                   addHint: 'React, Vue...' },
  { key: 'backend',   label: 'Backend',                    addHint: 'Node.js, Java...' },
  { key: 'databases', label: 'Bases de données',           addHint: 'PostgreSQL...' },
  { key: 'devops',    label: 'DevOps & Déploiement',       addHint: 'Docker, K8s...' },
  { key: 'tests',     label: 'Tests & Qualité',            addHint: 'Jest, Cypress...' },
  { key: 'cloud',     label: 'Cloud & Infrastructure',     addHint: 'AWS, Azure...' },
  { key: 'scripting', label: 'Scripting & Automatisation', addHint: 'Python, Bash...' },
  { key: 'methods',   label: 'Méthodes de travail',        addHint: 'Scrum, TDD...' },
]

// ── Skill categories (predefined + custom) ────────────────────
const allSkillCats = computed(() => [
  ...skillCats,
  ...(props.resume.customSkillCats || []).map(c => ({
    key: c.key,
    label: c.label,
    addHint: c.label + '…',
    isCustom: true,
  })),
])

// ── Custom category management ────────────────────────────────
const newCatName = ref('')

function addCustomCat() {
  const label = newCatName.value.trim()
  if (!label) return
  const key = 'custom_' + label.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_')
  if (!props.resume.customSkillCats) props.resume.customSkillCats = []
  if (props.resume.customSkillCats.some(c => c.key === key)) return
  props.resume.customSkillCats.push({ key, label })
  if (!props.resume.skills) props.resume.skills = {}
  props.resume.skills[key] = []
  newCatName.value = ''
}

function removeCustomCat(key) {
  const idx = (props.resume.customSkillCats || []).findIndex(c => c.key === key)
  if (idx !== -1) props.resume.customSkillCats.splice(idx, 1)
  if (props.resume.skills?.[key]) delete props.resume.skills[key]
  if (props.resume.hiddenSkills?.[key]) delete props.resume.hiddenSkills[key]
}

// ── Chip helpers ──────────────────────────────────────────────
const newSkill = reactive({})

function getSkillsArr(cat) {
  return props.resume.skills?.[cat] || []
}

function isMatch(skill) {
  if (!props.jobKeywords.length) return false
  return props.jobKeywords.some(kw => skillMatchesKeyword(skill, kw))
}

function isHidden(cat, skill) {
  return (props.resume.hiddenSkills?.[cat] || []).includes(skill)
}

function toggleHide(cat, skill) {
  if (!props.resume.hiddenSkills) props.resume.hiddenSkills = {}
  if (!props.resume.hiddenSkills[cat]) props.resume.hiddenSkills[cat] = []
  const idx = props.resume.hiddenSkills[cat].indexOf(skill)
  if (idx === -1) props.resume.hiddenSkills[cat].push(skill)
  else props.resume.hiddenSkills[cat].splice(idx, 1)
}

function removeSkill(cat, skill) {
  if (!props.resume.skills?.[cat]) return
  const idx = props.resume.skills[cat].indexOf(skill)
  if (idx !== -1) props.resume.skills[cat].splice(idx, 1)
  // also clean from hidden
  if (props.resume.hiddenSkills?.[cat]) {
    const hi = props.resume.hiddenSkills[cat].indexOf(skill)
    if (hi !== -1) props.resume.hiddenSkills[cat].splice(hi, 1)
  }
}

function addSkill(cat) {
  const val = (newSkill[cat] || '').trim().replace(/,+$/, '')
  if (!val) return
  if (!props.resume.skills) props.resume.skills = {}
  if (!props.resume.skills[cat]) props.resume.skills[cat] = []
  if (!props.resume.skills[cat].includes(val)) {
    props.resume.skills[cat].push(val)
  }
  newSkill[cat] = ''
}

function matchedCount(cat) {
  return getSkillsArr(cat).filter(s => isMatch(s)).length
}

const totalMatches = computed(() =>
  skillCats.reduce((acc, cat) => acc + matchedCount(cat.key), 0)
)

const hasHidden = computed(() =>
  props.resume.hiddenSkills &&
  Object.values(props.resume.hiddenSkills).some(a => a.length > 0)
)

function resetHidden() {
  if (!props.resume.hiddenSkills) return
  Object.keys(props.resume.hiddenSkills).forEach(k => {
    props.resume.hiddenSkills[k] = []
  })
}

function moveExp(i, dir) {
  const j = i + dir
  const arr = props.resume.experiences
  if (j < 0 || j >= arr.length) return
  ;[arr[i], arr[j]] = [arr[j], arr[i]]
}

let nextId = 200
function addExp() {
  props.resume.experiences.push({ id: nextId++, position: '', company: '', period: '', bullets: '' })
}
function addEdu() {
  props.resume.education.push({ id: nextId++, degree: '', period: '', school: '', description: '' })
}
function addProj() {
  props.resume.projects.push({ id: nextId++, name: '', tech: '', link: '', description: '' })
}
</script>

<style scoped>
.editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.tabs {
  display: flex;
  padding: 0 16px;
  border-bottom: 1px solid var(--border);
  overflow-x: auto;
  flex-shrink: 0;
  background: var(--surface);
  gap: 0;
}

.tab {
  padding: 13px 12px 11px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-3);
  background: none;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
  transition: all 0.15s;
  margin-bottom: -1px;
}
.tab:hover { color: var(--text-2); }
.tab.active { color: var(--primary); border-bottom-color: var(--primary); font-weight: 600; }

.tab-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.hint {
  font-size: 12px;
  color: var(--text-3);
  line-height: 1.5;
}

.field-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.field label {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-2);
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.field input,
.field textarea,
.field select {
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  font-size: 13px;
  color: var(--text);
  transition: border-color 0.15s;
  resize: vertical;
  font-family: inherit;
}

.field input:focus,
.field textarea:focus,
.field select:focus { border-color: var(--primary); }
.field input::placeholder,
.field textarea::placeholder { color: var(--text-3); }

.kw-hint {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
  color: var(--text-3);
  font-size: 11px;
}

.kw-tag {
  background: var(--primary-light);
  color: var(--primary);
  padding: 1px 5px;
  border-radius: 3px;
  font-weight: 600;
  font-size: 10px;
}

.match-badge {
  background: var(--success-light);
  color: var(--success);
  padding: 1px 6px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0;
}

.card {
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 16px;
  background: var(--surface);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-num {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--primary-light);
  color: var(--primary);
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.move-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  font-size: 13px;
  color: var(--text-3);
  background: none;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.15s;
  line-height: 1;
}
.move-btn:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); background: var(--primary-light); }
.move-btn:disabled { opacity: 0.25; cursor: not-allowed; }

.remove-btn {
  font-size: 12px;
  color: var(--text-3);
  background: none;
  padding: 4px 6px;
  border-radius: 4px;
  transition: all 0.15s;
  cursor: pointer;
  border: none;
}
.remove-btn:hover { background: #fee2e2; color: var(--danger); }
.remove-btn.sm { padding: 2px 5px; }

.add-btn {
  padding: 9px 14px;
  border: 1px dashed var(--border);
  border-radius: var(--radius);
  background: transparent;
  color: var(--text-3);
  font-size: 13px;
  font-weight: 500;
  text-align: center;
  transition: all 0.15s;
  cursor: pointer;
  font-family: inherit;
}
.add-btn:hover { border-color: var(--primary); color: var(--primary); background: var(--primary-light); }

/* Alternance checkbox */
.checkbox-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: var(--text);
  cursor: pointer;
  user-select: none;
  margin-top: -4px;
}

.checkbox-row input[type="checkbox"] {
  margin-top: 2px;
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  accent-color: var(--primary);
  cursor: pointer;
}

.checkbox-hint {
  font-size: 11.5px;
  color: var(--text-3);
}

/* Languages row */
.lang-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.lang-name {
  flex: 1;
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: 13px;
  color: var(--text);
  background: var(--surface);
  font-family: inherit;
}

.lang-row select {
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: 13px;
  color: var(--text);
  background: var(--surface);
  min-width: 155px;
  font-family: inherit;
  cursor: pointer;
}

.lang-code {
  width: 52px;
  padding: 8px 8px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  background: var(--surface);
  text-align: center;
  text-transform: uppercase;
  font-family: inherit;
}

/* ── Match summary ─────────────────────────────────────────── */
.match-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: var(--primary-light);
  border: 1px solid #bfdbfe;
  border-radius: var(--radius);
  font-size: 12.5px;
  color: var(--primary);
}

.match-summary-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--primary);
  flex-shrink: 0;
}

/* ── Chip legend ───────────────────────────────────────────── */
.chip-legend {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.chip-demo { pointer-events: none; font-size: 11px !important; padding: 3px 8px !important; }

/* ── Skill category block ──────────────────────────────────── */
.skill-cat-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skill-cat-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.skill-cat-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-2);
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

/* ── Chips row ─────────────────────────────────────────────── */
.chips-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 6px 4px 10px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-2);
  cursor: pointer;
  user-select: none;
  transition: all 0.15s;
  position: relative;
}

.chip:hover:not(.chip-demo) {
  border-color: var(--border-hover);
  color: var(--text);
}

/* Job-match chip */
.chip-match {
  background: #eff6ff;
  border-color: #93c5fd;
  color: #1d4ed8;
  font-weight: 600;
}

/* Hidden chip */
.chip-hidden {
  background: var(--bg) !important;
  border-color: var(--border) !important;
  color: var(--text-3) !important;
  text-decoration: line-through;
  opacity: 0.55;
  font-weight: 400 !important;
}

.chip-match-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #3b82f6;
  flex-shrink: 0;
  margin-right: 2px;
}

.chip-x {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  font-size: 9px;
  color: var(--text-3);
  background: none;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  padding: 0;
  margin-left: 2px;
  line-height: 1;
  transition: all 0.1s;
}
.chip-x:hover { background: #fee2e2; color: var(--danger); }

/* Add skill row */
.add-skill-row {
  display: flex;
  gap: 6px;
  margin-top: 6px;
}

.add-skill-input {
  flex: 1;
  padding: 7px 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: 12.5px;
  color: var(--text);
  background: var(--surface-2);
  font-family: inherit;
  transition: border-color 0.15s, background 0.15s;
}
.add-skill-input:focus {
  border-color: var(--primary);
  background: var(--surface);
  outline: none;
}
.add-skill-input::placeholder { color: var(--text-3); }

.add-skill-btn {
  padding: 0 14px;
  background: var(--primary-light);
  color: var(--primary);
  border: 1px solid #bfdbfe;
  border-radius: var(--radius);
  font-size: 12px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}
.add-skill-btn:hover:not(:disabled) {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}
.add-skill-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* Reset button */
.reset-btn {
  align-self: flex-start;
  padding: 7px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  color: var(--text-2);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}
.reset-btn:hover { border-color: var(--warning); color: var(--warning); background: var(--warning-light); }

/* ── Delete custom category ────────────────────────────────── */
.delete-cat-btn {
  display: flex;
  align-items: center;
  margin-left: auto;
  padding: 3px 5px;
  background: none;
  border: none;
  border-radius: 4px;
  color: var(--text-3);
  cursor: pointer;
  transition: all 0.15s;
}
.delete-cat-btn:hover { background: #fee2e2; color: var(--danger); }

/* ── New category block ─────────────────────────────────────── */
.new-cat-block {
  border: 1px dashed var(--border);
  border-radius: var(--radius-lg);
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.new-cat-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

/* ── Claude rewrite button ─────────────────────────────────── */
.btn-claude {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 11px 16px;
  background: linear-gradient(135deg, #7c3aed, #2563eb);
  color: white;
  border: none;
  border-radius: var(--radius);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.15s;
}
.btn-claude:hover:not(:disabled) { opacity: 0.9; }
.btn-claude:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-claude.loading { background: #6b7280; }

@keyframes spin { to { transform: rotate(360deg); } }
.spin-icon { animation: spin 0.8s linear infinite; }
</style>
