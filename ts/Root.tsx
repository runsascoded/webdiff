import React, {useMemo, useCallback} from 'react';
import {useNavigate, useParams} from 'react-router';
import {useSearchParams} from 'react-router-dom';
import {useAction, useActions, useHotkeysContext, Omnibar, ShortcutsModal, SequenceModal} from 'use-kbd';
import {FilePair} from './CodeDiffContainer';
import {DiffView, PerceptualDiffMode} from './DiffView';
import {FileSelector, FileSelectorMode} from './FileSelector';
import {ImageDiffMode} from './ImageDiffModeSelector';
import {filePairDisplayName} from './utils';
import {DiffOptionsControl} from './DiffOptions';
import {GitConfig, useDiffOptions} from './options';
import {NormalizeJSONOption} from './codediff/NormalizeJSONOption';
import {useSessionState} from './useSessionState';
import {useTheme} from './useTheme';
import {FloatingActions} from './FloatingActions';

declare const pairs: FilePair[];
declare const initialIdx: number;
declare const GIT_CONFIG: GitConfig;

// Webdiff application root.
export function Root() {
  const [pdiffMode, setPDiffMode] = useSessionState<PerceptualDiffMode>('pdiffMode', 'off');
  const [imageDiffMode, setImageDiffMode] = useSessionState<ImageDiffMode>('imageDiffMode', 'side-by-side');
  const [showOptions, setShowOptions] = React.useState(false);

  // An explicit list is better, unless there are a ton of files.
  const [fileSelectorMode, setFileSelectorMode] = React.useState<FileSelectorMode>(
    pairs.length <= 6 ? 'list' : 'dropdown',
  );

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectIndex = useCallback(
    (idx: number) => {
      const search = searchParams.toString();
      const url = `/${idx}` + (search ? `?${search}` : '');
      navigate(url);
    },
    [navigate, searchParams],
  );

  const params = useParams();
  const idx = Number(params.index ?? initialIdx);
  const filePair = pairs[idx];
  React.useEffect(() => {
    const fileName = filePairDisplayName(filePair);
    const diffType = filePair.type;
    document.title = `Diff: ${fileName} (${diffType})`;
  }, [filePair]);

  const {options, updateOptions, maxDiffWidth, normalizeJSON} = useDiffOptions();
  const {theme, cycleTheme} = useTheme();
  const {openModal} = useHotkeysContext();

  // Register global actions
  useAction('nav:next-file', {
    label: 'Next file',
    group: 'Navigation',
    defaultBindings: ['j'],
    handler: useCallback(() => {
      if (idx < pairs.length - 1) selectIndex(idx + 1);
    }, [idx, selectIndex]),
  });

  useAction('nav:prev-file', {
    label: 'Previous file',
    group: 'Navigation',
    defaultBindings: ['k'],
    handler: useCallback(() => {
      if (idx > 0) selectIndex(idx - 1);
    }, [idx, selectIndex]),
  });

  useAction('view:toggle-file-selector', {
    label: 'Toggle file list/dropdown',
    group: 'View',
    defaultBindings: ['v'],
    handler: useCallback(() => {
      setFileSelectorMode(mode => mode === 'dropdown' ? 'list' : 'dropdown');
    }, []),
  });

  useAction('view:show-options', {
    label: 'Show diff options',
    group: 'View',
    defaultBindings: ['.'],
    handler: useCallback(() => setShowOptions(val => !val), []),
  });

  useAction('diff:toggle-normalize-json', {
    label: 'Toggle JSON normalization',
    group: 'Diff',
    defaultBindings: ['z'],
    handler: useCallback(() => {
      updateOptions(o => ({normalizeJSON: !o.normalizeJSON}));
    }, [updateOptions]),
  });

  useAction('view:cycle-theme', {
    label: 'Cycle theme (light/dark/system)',
    group: 'View',
    defaultBindings: ['t'],
    handler: cycleTheme,
  });

  useAction('nav:close-modals', {
    label: 'Close modals',
    group: 'Navigation',
    defaultBindings: ['escape'],
    handler: useCallback(() => setShowOptions(false), []),
    hideFromModal: true,
  });

  // Register file navigation actions
  const fileActions = useMemo(() => {
    const actions: Record<string, {
      label: string;
      group: string;
      keywords: string[];
      handler: () => void;
      hideFromModal: boolean;
    }> = {};
    pairs.forEach((pair, i) => {
      const name = filePairDisplayName(pair);
      actions[`file:${i}`] = {
        label: name,
        group: 'Files',
        keywords: [pair.type, `${i + 1}`, name],
        handler: () => selectIndex(i),
        hideFromModal: true,
      };
    });
    return actions;
  }, [selectIndex]);

  useActions(fileActions);

  const inlineStyle = `
  td.code {
    width: ${1 + maxDiffWidth}ch;
  }`;

  return (
    <>
      <style>{inlineStyle}</style>
      <div>
        <DiffOptionsControl
          options={options}
          updateOptions={updateOptions}
          defaultMaxDiffWidth={GIT_CONFIG.webdiff.maxDiffWidth}
          isVisible={showOptions}
          setIsVisible={setShowOptions}
        />
        <FileSelector
          selectedFileIndex={idx}
          filePairs={pairs}
          fileChangeHandler={selectIndex}
          mode={fileSelectorMode}
          onChangeMode={setFileSelectorMode}
        />
        <NormalizeJSONOption
          normalizeJSON={normalizeJSON}
          setNormalizeJSON={v => {
            updateOptions({normalizeJSON: v});
          }}
          filePair={filePair}
        />
        <ShortcutsModal />
        <Omnibar placeholder="Search files or actions..." />
        <SequenceModal />
        <DiffView
          key={`diff-${idx}`}
          thinFilePair={filePair}
          imageDiffMode={imageDiffMode}
          pdiffMode={pdiffMode}
          diffOptions={options}
          changeImageDiffMode={setImageDiffMode}
          changePDiffMode={setPDiffMode}
          changeDiffOptions={updateOptions}
          normalizeJSON={normalizeJSON}
        />
        <FloatingActions
          theme={theme}
          onCycleTheme={cycleTheme}
          onShowHelp={openModal}
        />
      </div>
    </>
  );
}
