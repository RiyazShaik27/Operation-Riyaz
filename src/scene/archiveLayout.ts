/** React owns the elements; the scene owns only the four projection CSS variables.
 * Registrations are removed by each button's ref cleanup. No cloned UI or event layer. */
export const archiveElements = new Map<number, HTMLButtonElement>();
export const archiveMotion = { position: 3, opening: false };
export const identityProjection = { left: 0, top: 0, width: 0, ready: false };
