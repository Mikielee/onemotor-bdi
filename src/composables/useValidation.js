import { ref, nextTick } from 'vue'

/**
 * Global step-validation helper.
 *
 * Every step uses the same pattern: the Next button stays "grey" until the
 * step is valid, but it is still clickable. When the user clicks it while the
 * step is incomplete, we flip `showErrors` on so each empty / invalid field
 * paints its error state, then we smooth-scroll to the top-most field that is
 * in error.
 *
 * A field opts in to scroll targeting by rendering `data-error="true"` on its
 * wrapper while it is invalid. The first such element in DOM order (i.e. the
 * top-most) is the scroll target.
 */
export function useValidation() {
  const showErrors = ref(false)

  function scrollToFirstError() {
    const el = document.querySelector('[data-error="true"]')
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    // Move focus to the first focusable control inside the erroring field so
    // keyboard + screen-reader users land on the problem too.
    const focusable = el.matches('input, select, button, [tabindex]')
      ? el
      : el.querySelector('input, select, button, [tabindex]')
    if (focusable) focusable.focus({ preventScroll: true })
  }

  /**
   * Called when the user clicks Next while the step is still invalid.
   * Reveals every field error, then scrolls to the first one.
   */
  async function reveal() {
    showErrors.value = true
    await nextTick()
    scrollToFirstError()
  }

  return { showErrors, reveal, scrollToFirstError }
}
