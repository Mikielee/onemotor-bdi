<script setup>
/**
 * BD select with a bottom-sheet option list.
 *
 * Closed field: outlined select with a chevron-down, BD styling.
 * Open: a BOTTOM SHEET slides up from the foot of the screen — a dimmed
 * backdrop covers the sticky price bar, and the option list scrolls inside
 * the sheet. Ported from the DA prototype's DaSearchSelect, which replaced
 * the anchored dropdown panel after it kept overflowing the viewport (and
 * colliding with the sticky bar) when a field sat near the bottom of a
 * mobile page. Behavior is identical; the skin is BD (green accents,
 * 8px radius, Museo Sans).
 */
import { ref, computed, nextTick, watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  modelValue: { default: null },
  // Flat [{label,value}] or grouped [{label, items:[{label,value}]}].
  options: { type: Array, default: () => [] },
  grouped: { type: Boolean, default: false },
  searchable: { type: Boolean, default: false },
  placeholder: { type: String, default: 'Select' },
  // Optional floating notch label. When set and a value is selected, the
  // label floats onto the top outline (matches the input float pattern).
  label: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  invalid: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])

const open = ref(false)
const query = ref('')
const searchInput = ref(null)

const allItems = computed(() =>
  props.grouped ? props.options.flatMap((g) => g.items) : props.options
)
const selectedLabel = computed(() => {
  const found = allItems.value.find((o) => o.value === props.modelValue)
  return found ? found.label : ''
})

const filteredGroups = computed(() => {
  const q = query.value.trim().toLowerCase()
  const match = (o) => String(o.label).toLowerCase().includes(q)
  if (props.grouped) {
    return props.options
      .map((g) => ({ label: g.label, items: g.items.filter(match) }))
      .filter((g) => g.items.length)
  }
  const items = props.options.filter(match)
  return items.length ? [{ label: null, items }] : []
})

async function openSheet() {
  if (props.disabled) return
  query.value = ''
  open.value = true
  if (props.searchable) {
    await nextTick()
    searchInput.value?.focus()
  }
}
function close() { open.value = false }
function pick(o) {
  emit('update:modelValue', o.value)
  open.value = false
}

// Lock background scroll while the sheet is up. The shell scrolls in
// .bdi-scroll (not body); the backdrop + overscroll-behavior contain the
// gesture, and this belt-and-braces body lock matches the DA port.
watch(open, (v) => { document.body.style.overflow = v ? 'hidden' : '' })
onBeforeUnmount(() => { document.body.style.overflow = '' })
</script>

<template>
  <div
    class="bdi-ss"
    :class="{ 'is-open': open, 'is-disabled': disabled, 'is-invalid': invalid, 'is-filled': !!selectedLabel, 'has-label': !!label }"
  >
    <button type="button" class="bdi-ss-field" :disabled="disabled" @click="openSheet">
      <span v-if="label && selectedLabel" class="bdi-ss-flabel">{{ label }}</span>
      <span class="bdi-ss-value" :class="{ 'is-placeholder': !selectedLabel }">
        {{ selectedLabel || placeholder }}
      </span>
      <span class="bdi-ss-chev" aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 15.4L6 9.4L7.4 8L12 12.6L16.6 8L18 9.4L12 15.4Z" fill="currentColor" />
        </svg>
      </span>
    </button>

    <Teleport to="body">
      <Transition name="bss">
        <div v-if="open" class="bdi-ss-overlay">
          <div class="bdi-ss-backdrop" @click="close" />
          <div class="bdi-ss-sheet" role="dialog" aria-modal="true">
            <span class="bdi-ss-grip" aria-hidden="true" />

            <div v-if="searchable" class="bdi-ss-search">
              <i class="pi pi-search bdi-ss-search-ic" aria-hidden="true"></i>
              <input
                ref="searchInput"
                v-model="query"
                type="text"
                class="bdi-ss-search-input"
                placeholder="Search"
              />
              <button v-if="query" type="button" class="bdi-ss-clear" aria-label="Clear search" @click="query = ''">
                <i class="pi pi-times" aria-hidden="true"></i>
              </button>
            </div>

            <ul class="bdi-ss-list">
              <template v-for="(g, gi) in filteredGroups" :key="gi">
                <li v-if="g.label" class="bdi-ss-group">{{ g.label }}</li>
                <li
                  v-for="o in g.items"
                  :key="o.value"
                  class="bdi-ss-item"
                  :class="{ 'is-sel': o.value === modelValue }"
                  @click="pick(o)"
                >
                  {{ o.label }}
                </li>
              </template>
              <li v-if="!filteredGroups.length" class="bdi-ss-empty">No matches</li>
            </ul>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.bdi-ss { position: relative; width: 100%; }

/* Closed field — BD outlined select with chevron-down. */
.bdi-ss-field {
  width: 100%;
  min-height: var(--bdi-field-height);
  display: flex;
  align-items: center;
  gap: 4px;
  background: #fff;
  border: 1px solid var(--bdi-grey-300);
  border-radius: var(--bdi-radius-card);
  padding: 0 8px 0 16px;
  cursor: pointer;
  text-align: left;
}
.bdi-ss-value {
  flex: 1 1 auto;
  font-family: var(--bdi-font);
  font-size: 16px;
  font-weight: 400;
  line-height: 1.4;
  color: var(--bdi-carbon);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.bdi-ss-value.is-placeholder { color: var(--bdi-grey-600); }
.bdi-ss-chev {
  flex: 0 0 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--bdi-grey-600);
  transition: transform 160ms ease;
}

/* Floating notch label (when `label` set and a value is chosen). */
.bdi-ss-flabel {
  position: absolute;
  left: 12px;
  top: -8px;
  padding: 0 4px;
  background: #fff;
  font-family: var(--bdi-font);
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  color: var(--bdi-grey-600);
  pointer-events: none;
}

.bdi-ss.is-open .bdi-ss-field { border-color: var(--bdi-green); }
.bdi-ss.is-open .bdi-ss-chev { transform: rotate(180deg); }
.bdi-ss.is-filled .bdi-ss-field { border-color: var(--bdi-green); }
.bdi-ss.is-invalid .bdi-ss-field { border-color: var(--bdi-red); }

.bdi-ss.is-disabled .bdi-ss-field {
  background: var(--bdi-grey-200);
  border-color: var(--bdi-grey-300);
  cursor: not-allowed;
}
.bdi-ss.is-disabled .bdi-ss-value.is-placeholder { color: var(--bdi-grey-600); }

/* ---- Bottom sheet ---- */
.bdi-ss-overlay { position: fixed; inset: 0; z-index: 1000; }
.bdi-ss-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(51, 63, 72, 0.45);
}
.bdi-ss-sheet {
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: min(420px, 100vw);
  max-height: 78vh;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -10px 32px rgba(0, 0, 0, 0.22);
  padding: 8px 13px max(16px, env(safe-area-inset-bottom));
}
.bdi-ss-grip {
  flex: 0 0 auto;
  width: 36px;
  height: 4px;
  border-radius: 2px;
  background: var(--bdi-grey-300);
  margin: 4px auto 12px;
}

/* In-sheet search field. */
.bdi-ss-search {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  height: 56px;
  border: 1px solid var(--bdi-grey-300);
  border-radius: var(--bdi-radius-card);
  padding: 0 8px 0 14px;
  margin-bottom: 8px;
}
.bdi-ss-search:focus-within { border-color: var(--bdi-green); }
.bdi-ss-search-ic { flex: 0 0 24px; font-size: 18px; color: var(--bdi-grey-600); }
.bdi-ss-search-input {
  flex: 1 1 auto;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  font-family: var(--bdi-font);
  font-size: 16px;
  color: var(--bdi-carbon);
  padding: 0 8px 0 12px;
  height: 100%;
}
.bdi-ss-search-input::placeholder { color: var(--bdi-grey-600); }
.bdi-ss-clear {
  flex: 0 0 40px;
  height: 40px;
  background: transparent;
  border: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--bdi-grey-600);
}

.bdi-ss-list {
  flex: 1 1 auto;
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}
.bdi-ss-group {
  font-family: var(--bdi-font);
  font-size: 12px;
  font-weight: 700;
  color: var(--bdi-grey-600);
  line-height: 24px;
  padding: 8px 16px 4px;
}
.bdi-ss-item {
  min-height: 56px;
  display: flex;
  align-items: center;
  padding: 8px 16px;
  font-family: var(--bdi-font);
  font-size: 16px;
  font-weight: 400;
  color: var(--bdi-carbon);
  line-height: 1.4;
  cursor: pointer;
  border-radius: 4px;
}
.bdi-ss-item:active { background: var(--bdi-grey-100); }
@media (hover: hover) { .bdi-ss-item:hover { background: var(--bdi-grey-100); } }
.bdi-ss-item.is-sel { color: var(--bdi-green); font-weight: 700; }
.bdi-ss-empty {
  padding: 16px;
  font-family: var(--bdi-font);
  font-size: 14px;
  color: var(--bdi-grey-600);
}

/* Sheet motion — backdrop fades, sheet rises (ease-out). */
.bss-enter-active .bdi-ss-backdrop,
.bss-leave-active .bdi-ss-backdrop { transition: opacity 200ms ease-out; }
.bss-enter-from .bdi-ss-backdrop,
.bss-leave-to .bdi-ss-backdrop { opacity: 0; }
.bss-enter-active .bdi-ss-sheet,
.bss-leave-active .bdi-ss-sheet { transition: transform 280ms cubic-bezier(0.22, 1, 0.36, 1); }
.bss-enter-from .bdi-ss-sheet,
.bss-leave-to .bdi-ss-sheet { transform: translate(-50%, 100%); }
</style>
