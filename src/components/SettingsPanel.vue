<template>
  <Teleport to="body">
    <div class="overlay" @click.self="$emit('close')">
      <div class="panel">
        <div class="panel-header">
          <h2 class="panel-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            Paramètres
          </h2>
          <button class="close-btn" @click="$emit('close')">✕</button>
        </div>

        <div class="panel-body">
          <div class="section">
            <div class="section-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
              Clé API Anthropic (Claude)
            </div>

            <p class="section-desc">
              Nécessaire pour la réécriture automatique de l'accroche.
              Ta clé reste dans ton navigateur et n'est jamais envoyée ailleurs que vers l'API Anthropic.
            </p>

            <div class="field">
              <label>Clé API</label>
              <div class="key-wrap">
                <input
                  :type="showKey ? 'text' : 'password'"
                  :value="modelValue"
                  @input="$emit('update:modelValue', $event.target.value)"
                  placeholder="sk-ant-api03-..."
                  spellcheck="false"
                  class="key-input"
                />
                <button class="toggle-btn" @click="showKey = !showKey">
                  {{ showKey ? 'Masquer' : 'Afficher' }}
                </button>
              </div>
            </div>

            <div class="status" :class="statusClass">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="12" cy="12" r="10"/>
                <polyline v-if="isValid" points="9 12 11 14 15 10"/>
                <line v-else x1="12" y1="8" x2="12" y2="12"/>
                <line v-if="!isValid" x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {{ statusText }}
            </div>

            <a
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              rel="noopener"
              class="get-key-link"
            >
              Obtenir une clé sur console.anthropic.com →
            </a>
          </div>

          <div class="section">
            <div class="section-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Modèle utilisé
            </div>
            <p class="section-desc">
              <code>claude-haiku-4-5</code> — rapide et économique pour la rédaction d'accroches.
              ~$0.0003 par réécriture.
            </p>
          </div>
        </div>

        <div class="panel-footer">
          <button class="btn-primary" @click="$emit('close')">Fermer</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: String,
})
defineEmits(['update:modelValue', 'close'])

const showKey = ref(false)

const isValid = computed(() =>
  (props.modelValue || '').startsWith('sk-ant-')
)

const statusClass = computed(() =>
  !props.modelValue ? 'status-none'
  : isValid.value ? 'status-ok'
  : 'status-bad'
)

const statusText = computed(() =>
  !props.modelValue ? 'Aucune clé configurée'
  : isValid.value ? 'Clé détectée'
  : 'Format invalide (doit commencer par sk-ant-)'
)
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  backdrop-filter: blur(3px);
}

.panel {
  background: var(--surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  width: 460px;
  max-width: 95vw;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
}

.close-btn {
  font-size: 13px;
  color: var(--text-3);
  background: none;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s;
}
.close-btn:hover { background: var(--bg); color: var(--text); }

.panel-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: var(--text);
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.section-desc {
  font-size: 12.5px;
  color: var(--text-2);
  line-height: 1.6;
}

.section-desc code {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 1px 5px;
  font-size: 11px;
  font-family: monospace;
  color: var(--primary);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.field label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-2);
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.key-wrap {
  display: flex;
  gap: 8px;
}

.key-input {
  flex: 1;
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: 13px;
  font-family: monospace;
  color: var(--text);
  background: var(--surface);
  transition: border-color 0.15s;
}
.key-input:focus { border-color: var(--primary); outline: none; }

.toggle-btn {
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  font-size: 12px;
  color: var(--text-2);
  cursor: pointer;
  white-space: nowrap;
  font-family: inherit;
  transition: all 0.15s;
}
.toggle-btn:hover { border-color: var(--border-hover); }

.status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  padding: 6px 10px;
  border-radius: var(--radius);
}

.status-none { background: var(--bg); color: var(--text-3); }
.status-ok   { background: var(--success-light); color: var(--success); }
.status-bad  { background: #fff1f2; color: #be123c; }

.get-key-link {
  font-size: 12px;
  color: var(--primary);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.get-key-link:hover { text-decoration: underline; }

.panel-footer {
  padding: 14px 20px;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: flex-end;
}

.btn-primary {
  padding: 0 20px;
  height: 34px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}
.btn-primary:hover { background: var(--primary-hover); }
</style>
