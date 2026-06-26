/**
 * Demo autofill — sprint-review helper.
 *
 * The "Car Insurance" chip in the global header doubles as a demo
 * trigger. Each step page registers a fill handler in setup; clicking
 * the chip fires all registered handlers (only the mounted page's
 * handler is in the set at any one time, so only the current step
 * fills).
 *
 * Handlers only set the fields the customer would have typed/picked
 * themselves. Fields that are prefilled by the existing journey logic
 * (e.g. DOB at Step 12 when main driver = policyholder) are left to
 * that logic — the demo handler doesn't override them.
 */
import { onUnmounted } from 'vue'

const handlers = new Set()

export function useDemoAutofill() {
  return {
    trigger() {
      handlers.forEach((fn) => {
        try { fn() } catch (e) { console.error('demo autofill handler failed', e) }
      })
    },
    // Call from setup(). The handler is auto-removed on component unmount,
    // so navigating between steps doesn't leave stale handlers in the set.
    register(fn) {
      handlers.add(fn)
      onUnmounted(() => handlers.delete(fn))
    },
  }
}
