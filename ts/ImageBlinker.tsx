import React from 'react';
import {useHotkeys} from '@rdub/use-hotkeys';
import {AnnotatedImage} from './AnnotatedImage';
import {ImageDiffProps} from './ImageDiff';
import {useSessionState} from './useSessionState';
import {IMAGE_BLINK_KEYMAP} from './hotkeys';

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

  useHotkeys(IMAGE_BLINK_KEYMAP, {
    manualBlink: () => {
      setAutoBlink(false);
      setIdx(idx => 1 - idx);
    },
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
      <label htmlFor="autoblink"> Auto-blink (hit ‘b’ to blink manually)</label>
      <table id="imagediff">
        <tbody>
          <tr className="image-diff-content">
            <td>
              <AnnotatedImage side={side} maxWidth={maxWidth} {...props} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
