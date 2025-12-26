import {useCallback, useMemo} from 'react';
import {useUrlParam, boolParam, intParam, Param} from '@rdub/use-url-params';
import {DiffAlgorithm, GitDiffOptions} from './diff-options';

/** Type of global git_config object */
export interface GitConfig {
  webdiff: WebdiffConfig;
  'webdiff.colors': ColorsConfig;
  diff: {
    algorithm?: DiffAlgorithm;
  };
}

export interface WebdiffConfig {
  unified: number;
  extraDirDiffArgs: string;
  extraFileDiffArgs: string;
  openBrowser: boolean;
  port: number;
  maxDiffWidth: number;
  theme: string;
  maxLinesForSyntax: number;
}

export interface ColorsConfig {
  insert: string;
  delete: string;
  charInsert: string;
  charDelete: string;
}

declare const GIT_CONFIG: GitConfig;

export function injectStylesFromConfig() {
  const colors = GIT_CONFIG['webdiff.colors'];
  document.write(`
  <style>
  .diff .delete, .before.replace {
    background-color: ${colors.delete};
  }
  .diff .insert, .after.replace {
    background-color: ${colors.insert};
  }
  .before .char-replace, .before .char-delete {
    background-color: ${colors.charDelete};
  }
  .after .char-replace, .after .char-insert {
    background-color: ${colors.charInsert};
  }
  </style>
  `);
}

export interface Options extends GitDiffOptions {
  maxDiffWidth: number;
  normalizeJSON: boolean;
}

// Custom param for DiffAlgorithm enum (null = default/myers)
const diffAlgorithmParam: Param<DiffAlgorithm | null> = {
  encode: (v) => (v && v !== 'myers' ? v : undefined),
  decode: (s) => (s as DiffAlgorithm) || null,
};

// Optional int param (null when not present)
const optIntParam: Param<number | null> = {
  encode: (v) => (v != null ? String(v) : undefined),
  decode: (s) => (s != null ? Number(s) : null),
};

export type UpdateOptionsFn = (
  updater: ((oldOptions: Partial<Options>) => Partial<Options>) | Partial<Options>,
) => void;

export function useDiffOptions(): {
  options: Partial<Options>;
  updateOptions: UpdateOptionsFn;
  maxDiffWidth: number;
  normalizeJSON: boolean;
} {
  // Git diff options
  const [ignoreAllSpace, setIgnoreAllSpace] = useUrlParam('w', boolParam);
  const [ignoreSpaceChange, setIgnoreSpaceChange] = useUrlParam('b', boolParam);
  const [functionContext, setFunctionContext] = useUrlParam('W', boolParam);
  const [diffAlgorithm, setDiffAlgorithm] = useUrlParam('algo', diffAlgorithmParam);
  const [unified, setUnified] = useUrlParam('U', optIntParam);
  const [findRenames, setFindRenames] = useUrlParam('renames', optIntParam);
  const [findCopies, setFindCopies] = useUrlParam('copies', optIntParam);

  // Additional options
  const [maxDiffWidth, setMaxDiffWidth] = useUrlParam('width', optIntParam);
  const [normalizeJSON, setNormalizeJSON] = useUrlParam('json', boolParam);

  const effectiveMaxDiffWidth = maxDiffWidth ?? GIT_CONFIG.webdiff.maxDiffWidth;

  const options = useMemo<Partial<Options>>(() => ({
    ignoreAllSpace: ignoreAllSpace || undefined,
    ignoreSpaceChange: ignoreSpaceChange || undefined,
    functionContext: functionContext || undefined,
    diffAlgorithm: diffAlgorithm || undefined,
    unified: unified ?? undefined,
    findRenames: findRenames ?? undefined,
    findCopies: findCopies ?? undefined,
    maxDiffWidth: maxDiffWidth ?? undefined,
    normalizeJSON: normalizeJSON || undefined,
  }), [
    ignoreAllSpace,
    ignoreSpaceChange,
    functionContext,
    diffAlgorithm,
    unified,
    findRenames,
    findCopies,
    maxDiffWidth,
    normalizeJSON,
  ]);

  const updateOptions = useCallback<UpdateOptionsFn>((update) => {
    const newOptions = typeof update === 'function' ? update(options) : update;

    if ('ignoreAllSpace' in newOptions) setIgnoreAllSpace(!!newOptions.ignoreAllSpace);
    if ('ignoreSpaceChange' in newOptions) setIgnoreSpaceChange(!!newOptions.ignoreSpaceChange);
    if ('functionContext' in newOptions) setFunctionContext(!!newOptions.functionContext);
    if ('diffAlgorithm' in newOptions) setDiffAlgorithm(newOptions.diffAlgorithm ?? null);
    if ('unified' in newOptions) setUnified(newOptions.unified ?? null);
    if ('findRenames' in newOptions) setFindRenames(newOptions.findRenames ?? null);
    if ('findCopies' in newOptions) setFindCopies(newOptions.findCopies ?? null);
    if ('maxDiffWidth' in newOptions) setMaxDiffWidth(newOptions.maxDiffWidth ?? null);
    if ('normalizeJSON' in newOptions) setNormalizeJSON(!!newOptions.normalizeJSON);
  }, [
    options,
    setIgnoreAllSpace,
    setIgnoreSpaceChange,
    setFunctionContext,
    setDiffAlgorithm,
    setUnified,
    setFindRenames,
    setFindCopies,
    setMaxDiffWidth,
    setNormalizeJSON,
  ]);

  return {
    options,
    updateOptions,
    maxDiffWidth: effectiveMaxDiffWidth,
    normalizeJSON: !!normalizeJSON,
  };
}
