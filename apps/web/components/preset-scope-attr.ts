export const PRESET_SCOPE_ATTR = "data-preset-scope";

/**
 * Fired on `window` after the customizer writes the preset. A `storage` event only reaches other
 * documents, so same-page previews listen for this one too.
 */
export const PRESET_CHANGE_EVENT = "sevenui:preset-change";
