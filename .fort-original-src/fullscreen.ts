/** Cleanup is best-effort: navigation, Escape, or unmount may already end fullscreen. */
export async function leaveFullscreen(target: Element | null, doc: Pick<Document, 'fullscreenElement' | 'exitFullscreen'> = document): Promise<void> {
  if (!target || doc.fullscreenElement !== target) return;
  try {
    await doc.exitFullscreen();
  } catch {
    // The document can become inactive between checking its state and exiting.
  }
}
