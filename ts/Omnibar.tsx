import React, {useEffect, useRef, useMemo} from 'react';
import {useOmnibar, ActionRegistry} from '@rdub/use-hotkeys';
import {FilePair} from './CodeDiffContainer';
import {filePairDisplayName} from './utils';
import {
  GLOBAL_KEYMAP,
  CODE_DIFF_KEYMAP,
  IMAGE_DIFF_KEYMAP,
  DIFF_OPTIONS_KEYMAP,
  SHORTCUT_DESCRIPTIONS,
} from './hotkeys';
import {PageCover} from './codediff/PageCover';

// Combine all keymaps for display in omnibar results
const ALL_KEYMAPS = {
  ...GLOBAL_KEYMAP,
  ...CODE_DIFF_KEYMAP,
  ...IMAGE_DIFF_KEYMAP,
  ...DIFF_OPTIONS_KEYMAP,
};

interface Props {
  filePairs: FilePair[];
  currentIndex: number;
  onSelectFile: (index: number) => void;
  handlers: Record<string, () => void>;
}

export function Omnibar({filePairs, currentIndex, onSelectFile, handlers}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Build actions registry: hotkey actions + file navigation
  const actions = useMemo<ActionRegistry>(() => {
    const registry: ActionRegistry = {};

    // Add hotkey actions
    for (const [actionId, description] of Object.entries(SHORTCUT_DESCRIPTIONS)) {
      registry[actionId] = {
        label: description,
        category: 'Actions',
      };
    }

    // Add file navigation actions
    filePairs.forEach((pair, idx) => {
      const name = filePairDisplayName(pair);
      registry[`file:${idx}`] = {
        label: name,
        category: 'Files',
        description: `${pair.type} - Go to file ${idx + 1} of ${filePairs.length}`,
        keywords: [pair.type, `${idx + 1}`],
      };
    });

    return registry;
  }, [filePairs]);

  // Combined handlers: hotkey handlers + file selection
  const allHandlers = useMemo(() => {
    const fileHandlers: Record<string, () => void> = {};
    filePairs.forEach((_, idx) => {
      fileHandlers[`file:${idx}`] = () => onSelectFile(idx);
    });
    return {...handlers, ...fileHandlers};
  }, [handlers, filePairs, onSelectFile]);

  const {
    isOpen,
    close,
    query,
    setQuery,
    results,
    selectedIndex,
    selectNext,
    selectPrev,
    execute,
  } = useOmnibar({
    actions,
    handlers: allHandlers,
    keymap: ALL_KEYMAPS,
    openKey: 'meta+k',
    maxResults: 15,
  });

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Scroll selected item into view
  useEffect(() => {
    if (isOpen) {
      const selected = document.querySelector('.omnibar-result.selected');
      selected?.scrollIntoView({block: 'nearest'});
    }
  }, [isOpen, selectedIndex]);

  if (!isOpen) return null;

  return (
    <>
      <PageCover onClick={close} />
      <div className="omnibar-container">
        <input
          ref={inputRef}
          className="omnibar-input"
          type="text"
          placeholder="Search files or actions..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              selectNext();
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              selectPrev();
            } else if (e.key === 'Enter') {
              e.preventDefault();
              execute();
            } else if (e.key === 'Escape') {
              e.preventDefault();
              close();
            }
          }}
        />
        <div className="omnibar-results">
          {results.length === 0 && query && (
            <div className="omnibar-empty">No matches found</div>
          )}
          {results.map((result, i) => {
            const isFile = result.id.startsWith('file:');
            const isCurrent = isFile && parseInt(result.id.split(':')[1]) === currentIndex;
            return (
              <div
                key={result.id}
                className={`omnibar-result ${i === selectedIndex ? 'selected' : ''} ${isCurrent ? 'current' : ''}`}
                onClick={() => execute(result.id)}
              >
                <span className="omnibar-result-icon">
                  {isFile ? '📄' : '⌨'}
                </span>
                <span className="omnibar-result-label">
                  {result.action.label}
                </span>
                {result.action.category && (
                  <span className="omnibar-result-category">
                    {result.action.category}
                  </span>
                )}
                {result.bindings.length > 0 && (
                  <kbd className="omnibar-result-binding">
                    {result.bindings[0]}
                  </kbd>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
