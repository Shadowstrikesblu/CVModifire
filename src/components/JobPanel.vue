<template>
  <div class="panel">
    <div class="panel-header">
      <h2 class="panel-title">Offre d'emploi</h2>
      <button v-if="modelValue" class="clear-btn" @click="$emit('update:modelValue', '')">Effacer</button>
    </div>

    <textarea
      class="job-textarea"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      placeholder="Collez l'offre d'emploi ici...&#10;&#10;L'application va détecter :&#10;• Type de contrat (CDI, Alternance, Stage…)&#10;• Poste (DevOps, FullStack, Support…)&#10;• Technologies et compétences requises&#10;• Générer le nom du fichier PDF"
      spellcheck="false"
    />

    <!-- ── Analysis ── -->
    <div v-if="analysis.contractType || analysis.role || analysis.keywords.length" class="analysis">

      <div class="analysis-header">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        Analyse de l'offre
      </div>

      <!-- Contract + Role -->
      <div class="meta-row">
        <span v-if="analysis.contractType" class="tag tag-blue">{{ analysis.contractType }}</span>
        <span v-if="analysis.role" class="tag tag-purple">{{ analysis.role }}</span>
        <span v-if="!analysis.contractType && !analysis.role" class="tag tag-gray">Contrat non précisé</span>
      </div>

      <!-- Profile mismatch warning -->
      <div v-if="mismatch" class="mismatch-banner">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span>
          Ce poste de <strong>{{ analysis.role }}</strong> ne correspond pas à votre profil actuel.
          Adaptez l'onglet <em>Compétences</em> et votre <em>Accroche</em>.
        </span>
      </div>

      <!-- Skills you already have -->
      <div v-if="skillMatches.length" class="skill-block">
        <div class="skill-block-label skill-block-label--green">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Vous avez ({{ skillMatches.length }})
        </div>
        <div class="tag-list">
          <span v-for="kw in skillMatches" :key="kw" class="tag tag-green">{{ kw }}</span>
        </div>
      </div>

      <!-- Skills required but missing -->
      <div v-if="skillGaps.length" class="skill-block">
        <div class="skill-block-label skill-block-label--orange">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          À ajouter ({{ skillGaps.length }})
        </div>
        <div class="tag-list">
          <span
            v-for="kw in skillGaps"
            :key="kw"
            class="tag tag-orange tag-clickable"
            title="Cliquer pour ajouter à vos compétences"
            @click="$emit('add-skill', kw)"
          >{{ kw }} +</span>
        </div>
      </div>

      <!-- No keywords at all -->
      <div v-if="!analysis.keywords.length" class="no-keywords">
        Aucune technologie reconnue dans cette offre — vérifiez le texte collé.
      </div>

      <!-- Adapt button -->
      <button class="btn-adapt" @click="$emit('adapt')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
        Adapter le CV à ce poste
      </button>

    </div>

    <!-- Not enough text yet -->
    <div v-else-if="modelValue && modelValue.length > 30" class="analysis-empty">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      Ni contrat, ni poste, ni technologie détectés dans ce texte.
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { analyzeJob, skillMatchesKeyword } from '../utils/keywords.js'

const props = defineProps({
  modelValue: String,
  userSkills: { type: Array, default: () => [] },
})

defineEmits(['update:modelValue', 'add-skill', 'adapt'])

const analysis = computed(() => analyzeJob(props.modelValue || ''))

// Job keywords split into: ones user already has vs ones they're missing
const skillMatches = computed(() =>
  analysis.value.keywords.filter(kw =>
    props.userSkills.some(s => skillMatchesKeyword(s, kw))
  )
)

const skillGaps = computed(() =>
  analysis.value.keywords.filter(kw =>
    !props.userSkills.some(s => skillMatchesKeyword(s, kw))
  )
)

// Mismatch = role detected + keywords found + zero matches
const mismatch = computed(() =>
  !!analysis.value.role &&
  analysis.value.keywords.length > 0 &&
  skillMatches.value.length === 0
)

defineExpose({ analysis })
</script>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 12px;
  flex-shrink: 0;
}

.panel-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.clear-btn {
  font-size: 12px;
  color: var(--text-3);
  background: none;
  padding: 2px 6px;
  border-radius: 4px;
  cursor: pointer;
  border: none;
  transition: all 0.15s;
}
.clear-btn:hover { background: var(--bg); color: var(--text-2); }

.job-textarea {
  flex: 1;
  resize: none;
  border: none;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  padding: 16px 20px;
  background: var(--surface-2);
  font-size: 13px;
  line-height: 1.7;
  color: var(--text);
  min-height: 0;
  font-family: inherit;
}
.job-textarea::placeholder { color: var(--text-3); line-height: 1.8; }
.job-textarea:focus { background: var(--surface); outline: none; }

/* ── Analysis panel ─────────────────────────────────────────── */
.analysis {
  padding: 14px 20px;
  display: flex;
  flex-direction: column;
  gap: 11px;
  background: var(--surface);
  border-top: 1px solid var(--border);
  flex-shrink: 0;
  overflow-y: auto;
  max-height: 55%;
}

.analysis-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.meta-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

/* ── Mismatch banner ────────────────────────────────────────── */
.mismatch-banner {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  background: #fff7ed;
  border: 1px solid #fdba74;
  border-radius: var(--radius);
  font-size: 12px;
  color: #9a3412;
  line-height: 1.5;
}

.mismatch-banner svg { flex-shrink: 0; margin-top: 1px; }

/* ── Skill blocks ───────────────────────────────────────────── */
.skill-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.skill-block-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.skill-block-label--green { color: var(--success); }
.skill-block-label--orange { color: #c2410c; }

.tag-list { display: flex; flex-wrap: wrap; gap: 5px; }

.tag {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 20px;
}

.tag-blue   { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }
.tag-purple { background: #f5f3ff; color: #7c3aed; border: 1px solid #ddd6fe; }
.tag-gray   { background: var(--bg); color: var(--text-3); border: 1px solid var(--border); }
.tag-green  { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
.tag-orange { background: #fff7ed; color: #c2410c; border: 1px solid #fdba74; }

.tag-clickable {
  cursor: pointer;
  transition: all 0.15s;
}
.tag-clickable:hover {
  background: #ffedd5;
  border-color: #fb923c;
}

.no-keywords {
  font-size: 12px;
  color: var(--text-3);
  font-style: italic;
}

.btn-adapt {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  width: 100%;
  padding: 10px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
  margin-top: 2px;
}
.btn-adapt:hover { background: var(--primary-hover); }

/* ── Empty state ────────────────────────────────────────────── */
.analysis-empty {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 20px;
  font-size: 12px;
  color: var(--text-3);
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}
</style>
