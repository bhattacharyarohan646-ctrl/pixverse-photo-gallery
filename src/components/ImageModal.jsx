import { useEffect } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import 'yet-another-react-lightbox/styles.css';

/**
 * Wrapper around yet-another-react-lightbox
 * @param {boolean} open
 * @param {Function} close
 * @param {object[]} slides - Array of { src, alt }
 * @param {number} index - initial index
 */
export default function ImageModal({ open, close, slides, index = 0 }) {
  // Prevent body scroll when open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <Lightbox
      open={open}
      close={close}
      index={index}
      slides={slides}
      plugins={[Zoom, Fullscreen]}
      animation={{ fade: 250 }}
      styles={{
        container: { backgroundColor: 'rgba(0,0,0,0.95)' },
        icon: { filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' },
      }}
    />
  );
}
