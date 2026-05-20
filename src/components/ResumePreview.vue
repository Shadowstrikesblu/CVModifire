<template>
  <!-- Overlay modal -->
  <div v-if="modal" class="overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <span class="modal-title">Aperçu du CV</span>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>
      <div class="modal-body">
        <div class="page-wrap">
          <div class="resume-page" ref="pageRef">
            <ResumeContent :resume="resume" />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Hidden render target for PDF export (always in DOM) -->
  <div class="pdf-target" aria-hidden="true">
    <div class="resume-page" ref="pdfRef">
      <ResumeContent :resume="resume" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ResumeContent from './ResumeContent.vue'

defineProps({
  resume: Object,
  modal: { type: Boolean, default: false },
})
defineEmits(['close'])

const pageRef = ref(null)
const pdfRef = ref(null)

defineExpose({ pdfRef })
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(4px);
}

.modal {
  background: var(--surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  width: 90vw;
  max-width: 820px;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.modal-title {
  font-size: 14px;
  font-weight: 600;
}

.close-btn {
  font-size: 14px;
  color: var(--text-3);
  background: none;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.15s;
}
.close-btn:hover { background: var(--bg); color: var(--text); }

.modal-body {
  overflow-y: auto;
  flex: 1;
  padding: 24px;
  background: #e5e7eb;
}

.page-wrap {
  display: flex;
  justify-content: center;
}

.resume-page {
  width: 210mm;
  min-height: 297mm;
  background: white;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  border-radius: 2px;
}

.pdf-target {
  position: absolute;
  left: -9999px;
  top: 0;
  width: 210mm;
  pointer-events: none;
  visibility: hidden;
}
</style>
