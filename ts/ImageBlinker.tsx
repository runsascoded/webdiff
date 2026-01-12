import React, {useCallback} from 'react';
import {useAction} from 'use-kbd';
import {AnnotatedImage} from './AnnotatedImage';
import {ImageDiffProps} from './ImageDiff';
import {useSessionState} from './useSessionState';

/**
 * Two images on top of one another (i.e. "blinked").
 * This component handles toggling between the two images itself.
 */
export function ImageBlinker(props: ImageDiffProps) {
  const [idx, setIdx] = React.useState(0);
  const [autoBlink, setAutoBlink] = useSessionState('autoBlink', true);
  const [blinkInterval] = useSessionState('blinkInterval', 500);

  const autoblinkRef = React.createRef<HTMLInputElement>();

  const toggleAutoBlink = () => {
    if (autoblinkRef.current) {
      setAutoBlink(autoblinkRef.current.checked);
    }
  };

  useAction('image:manual-blink', {
    label: 'Manual blink',
    group: 'Image',
    defaultBindings: ['b'],
    handler: useCallback(() => {
      setAutoBlink(false);
      setIdx(idx => 1 - idx);
    }, [setAutoBlink]),
  });

  React.useEffect(() => {
    if (autoBlink) {
      const interval = setInterval(() => {
        setIdx(idx => 1 - idx);
      }, blinkInterval);
      return () => {
        clearInterval(interval);
      };
    }
  }, [autoBlink, blinkInterval]);

  const side = idx === 0 ? 'a' : 'b';
  const label = idx === 0 ? 'Before' : 'After';
  const maxWidth = props.shrinkToFit ? window.innerWidth - 30 : null;
  return (
    <div>
      <input
        ref={autoblinkRef}
        type="checkbox"
        id="autoblink"
        checked={autoBlink}
        onChange={toggleAutoBlink}
      />
      <label htmlFor="autoblink"> Auto-blink (hit 'b' to blink manually)</label>
      <table id="imagediff">
        <tbody>
          <tr className="image-diff-content">
            <td>
              <div className="blink-label-container">
                <span className={`blink-label blink-label-${side}`}>{label}</span>
                <AnnotatedImage side={side} maxWidth={maxWidth} {...props} />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
