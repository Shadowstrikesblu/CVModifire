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
        <p class="hint">Séparez les compétences par des virgules.</p>
        <div v-for="cat in skillCats" :key="cat.key" class="field">
          <label>
            {{ cat.label }}
            <span v-if="matchedCount(cat.key)" class="match-badge">
              {{ matchedCount(cat.key) }} match
            </span>
          </label>
          <input
            :value="getSkills(cat.key)"
            @input="setSkills(cat.key, $event.target.value)"
            :placeholder="cat.placeholder"
          />
        </div>
      </div>

      <!-- ── Expériences ── -->
      <div v-if="activeTab === 'experience'" class="section">
        <div v-for="(exp, i) in resume.experiences" :key="exp.id" class="card">
          <div class="card-header">
            <span class="card-num">{{ i + 1 }}</span>
            <button class="remove-btn" @click="resume.experiences.splice(i, 1)" v-if="resume.experiences.length > 1">✕</button>
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
import { ref } from 'vue'

const props = defineProps({
  resume: Object,
  jobKeywords: { type: Array, default: () => [] },
})

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
  { key: 'frontend',  label: 'FrontEnd',                  placeholder: 'React.js, Vue.js, TypeScript, HTML, CSS...' },
  { key: 'backend',   label: 'Backend',                   placeholder: 'Node.js, Java, .NET, API REST...' },
  { key: 'databases', label: 'Bases de données',          placeholder: 'PostgreSQL, MySQL, MongoDB...' },
  { key: 'devops',    label: 'DevOps & Déploiement',      placeholder: 'Docker, Kubernetes, CI/CD, Git...' },
  { key: 'tests',     label: 'Tests & Qualité',           placeholder: 'Jest, Cypress, Postman...' },
  { key: 'cloud',     label: 'Cloud & Infrastructure',    placeholder: 'AWS, Azure, GCP...' },
  { key: 'scripting', label: 'Scripting & Automatisation',placeholder: 'Python, Bash, PowerShell...' },
  { key: 'methods',   label: 'Méthodes de travail',       placeholder: 'Agile/Scrum, TDD...' },
]

function getSkills(cat) {
  return (props.resume.skills?.[cat] || []).join(', ')
}

function setSkills(cat, text) {
  if (!props.resume.skills) props.resume.skills = {}
  props.resume.skills[cat] = text.split(',').map(s => s.trim()).filter(Boolean)
}

function matchedCount(cat) {
  const skills = (props.resume.skills?.[cat] || []).join(' ').toLowerCase()
  return props.jobKeywords.filter(kw => skills.includes(kw.toLowerCase())).length
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
</style>
