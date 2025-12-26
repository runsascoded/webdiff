// Centralized hotkey definitions for webdiff

export const GLOBAL_KEYMAP = {
  'j': 'nextFile',
  'k': 'prevFile',
  'v': 'toggleFileSelector',
  'shift+/': 'showHelp',  // ?
  '.': 'showOptions',
  'z': 'toggleNormalizeJSON',
  't': 'cycleTheme',
  'escape': 'closeModals',
} as const;

export const CODE_DIFF_KEYMAP = {
  'n': 'nextHunk',
  'p': 'prevHunk',
} as const;

export const IMAGE_DIFF_KEYMAP = {
  's': 'sideBySide',
  'b': 'blinkMode',
  'p': 'cyclePdiff',
} as const;

export const IMAGE_BLINK_KEYMAP = {
  'b': 'manualBlink',
} as const;

export const DIFF_OPTIONS_KEYMAP = {
  'w': 'toggleIgnoreAllSpace',
  'b': 'toggleIgnoreSpaceChange',
} as const;

// Descriptions for the shortcuts modal
export const SHORTCUT_DESCRIPTIONS: Record<string, string> = {
  // Global
  nextFile: 'Next file',
  prevFile: 'Previous file',
  toggleFileSelector: 'Toggle file list/dropdown',
  showHelp: 'Show keyboard shortcuts',
  showOptions: 'Show diff options',
  toggleNormalizeJSON: 'Toggle JSON normalization',
  cycleTheme: 'Cycle theme (light/dark/system)',
  closeModals: 'Close modals',

  // Code diff
  nextHunk: 'Next diff hunk',
  prevHunk: 'Previous diff hunk',

  // Image diff
  sideBySide: 'Side-by-side mode',
  blinkMode: 'Blink mode',
  cyclePdiff: 'Cycle perceptual diff mode',
  manualBlink: 'Manual blink (turns off auto)',

  // Diff options
  toggleIgnoreAllSpace: 'Toggle ignore all space (-w)',
  toggleIgnoreSpaceChange: 'Toggle ignore space change (-b)',
};
