export const PROGRESS_SET = 'PROGRESS_SET'

/**
 * set the current progress
 * @param {object} progress has three attributes: sending, processing, receiving
 */
export default function set_progress(progress) {
  return { type: PROGRESS_SET, progress }
}