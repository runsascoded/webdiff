import React, {useMemo} from 'react';
import {useNavigate, useParams} from 'react-router';
import {useSearchParams} from 'react-router-dom';
import {useHotkeys, ShortcutsModal} from '@rdub/use-hotkeys';
import {FilePair} from './CodeDiffContainer';
import {DiffView, PerceptualDiffMode} from './DiffView';
import {FileSelector, FileSelectorMode} from './FileSelector';
import {ImageDiffMode} from './ImageDiffModeSelector';
import {filePairDisplayName} from './utils';
import {DiffOptionsControl} from './DiffOptions';
import {GitConfig, useDiffOptions} from './options';
import {NormalizeJSONOption} from './codediff/NormalizeJSONOption';
import {useSessionState} from './useSessionState';
import {GLOBAL_KEYMAP, SHORTCUT_DESCRIPTIONS} from './hotkeys';
import {useTheme} from './useTheme';
import {Omnibar} from './Omnibar';
import {FloatingActions} from './FloatingActions';

declare const pairs: FilePair[];
declare const initialIdx: number;
declare const GIT_CONFIG: GitConfig;

// Webdiff application root.
export function Root() {
  const [pdiffMode, setPDiffMode] = useSessionState<PerceptualDiffMode>('pdiffMode', 'off');
  const [imageDiffMode, setImageDiffMode] = useSessionState<ImageDiffMode>('imageDiffMode', 'side-by-side');
  const [showKeyboardHelp, setShowKeyboardHelp] = React.useState(false);
  const [showOptions, setShowOptions] = React.useState(false);

  // An explicit list is better, unless there are a ton of files.
  const [fileSelectorMode, setFileSelectorMode] = React.useState<FileSelectorMode>(
    pairs.length <= 6 ? 'list' : 'dropdown',
  );

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectIndex = React.useCallback(
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

  // Handlers shared between useHotkeys and Omnibar
  const handlers = useMemo(() => ({
    nextFile: () => { if (idx < pairs.length - 1) selectIndex(idx + 1); },
    prevFile: () => { if (idx > 0) selectIndex(idx - 1); },
    toggleFileSelector: () => setFileSelectorMode(mode => mode === 'dropdown' ? 'list' : 'dropdown'),
    showHelp: () => setShowKeyboardHelp(val => !val),
    showOptions: () => setShowOptions(val => !val),
    toggleNormalizeJSON: () => updateOptions(o => ({normalizeJSON: !o.normalizeJSON})),
    cycleTheme,
    closeModals: () => {
      setShowKeyboardHelp(false);
      setShowOptions(false);
    },
  }), [idx, selectIndex, setFileSelectorMode, setShowKeyboardHelp, setShowOptions, updateOptions, cycleTheme]);

  useHotkeys(GLOBAL_KEYMAP, handlers);

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
        <ShortcutsModal
          keymap={GLOBAL_KEYMAP}
          descriptions={SHORTCUT_DESCRIPTIONS}
          isOpen={showKeyboardHelp}
          onClose={() => setShowKeyboardHelp(false)}
          autoRegisterOpen={false}
          backdropClassName="shortcuts-backdrop"
          modalClassName="shortcuts-modal"
        />
        <Omnibar
          filePairs={pairs}
          currentIndex={idx}
          onSelectFile={selectIndex}
          handlers={handlers}
        />
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
          onShowHelp={handlers.showHelp}
        />
      </div>
    </>
  );
}
