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
      placeholder="Collez l'offre d'emploi ici...&#10;&#10;L'application va automatiquement détecter :&#10;• Type de contrat (CDI, Alternance, Stage...)&#10;• Poste (DevOps, FullStack, Frontend...)&#10;• Technologies requises&#10;• Et générer le nom du fichier PDF"
      spellcheck="false"
    />

    <div v-if="analysis.contractType || analysis.role || analysis.keywords.length" class="analysis">
      <div class="analysis-header">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        Analyse détectée
      </div>

      <div class="analysis-row" v-if="analysis.contractType">
        <span class="analysis-label">Contrat</span>
        <span class="tag tag-blue">{{ analysis.contractType }}</span>
      </div>
      <div class="analysis-row" v-if="analysis.role">
        <span class="analysis-label">Poste</span>
        <span class="tag tag-purple">{{ analysis.role }}</span>
      </div>
      <div class="analysis-row" v-if="analysis.keywords.length">
        <span class="analysis-label">Technologies</span>
        <div class="tag-list">
          <span
            v-for="kw in analysis.keywords"
            :key="kw"
            class="tag tag-gray"
          >{{ kw }}</span>
        </div>
      </div>
    </div>

    <div v-else-if="modelValue && modelValue.length > 20" class="analysis-empty">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      Aucune information détectée dans ce texte
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { analyzeJob } from '../utils/keywords.js'

const props = defineProps({
  modelValue: String,
})
defineEmits(['update:modelValue'])

const analysis = computed(() => analyzeJob(props.modelValue || ''))
defineExpose({ analysis })
</script>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  gap: 0;
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
}

.job-textarea::placeholder { color: var(--text-3); line-height: 1.8; }
.job-textarea:focus { background: var(--surface); }

.analysis {
  padding: 14px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: var(--surface);
  border-top: 1px solid var(--border);
  flex-shrink: 0;
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

.analysis-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.analysis-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-3);
  min-width: 72px;
  padding-top: 2px;
}

.tag-list { display: flex; flex-wrap: wrap; gap: 4px; }

.tag {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 20px;
}

.tag-blue { background: #eff6ff; color: #2563eb; }
.tag-purple { background: #f5f3ff; color: #7c3aed; }
.tag-gray { background: var(--bg); color: var(--text-2); border: 1px solid var(--border); }

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
