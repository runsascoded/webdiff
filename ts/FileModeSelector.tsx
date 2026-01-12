import React from 'react';
import {FileSelectorMode} from './FileSelector';

export interface Props {
  mode: FileSelectorMode;
  changeHandler: (mode: FileSelectorMode) => void;
}

/** A widget for toggling between file selection modes. */
export function FileModeSelector(props: Props) {
  const handleChange = () => {
    const newMode = props.mode == 'list' ? 'dropdown' : 'list';
    props.changeHandler(newMode);
  };

  const isExpanded = props.mode === 'list';
  const title = isExpanded ? 'Collapse file list' : 'Expand file list';

  return (
    <a
      href="#"
      className="file-mode-toggle"
      onClick={e => {
        e.preventDefault();
        handleChange();
      }}
      title={title}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="currentColor"
        style={{transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease'}}
      >
        <path d="M4.427 7.427l3.396 3.396a.25.25 0 00.354 0l3.396-3.396A.25.25 0 0011.396 7H4.604a.25.25 0 00-.177.427z" />
      </svg>
    </a>
  );
}
