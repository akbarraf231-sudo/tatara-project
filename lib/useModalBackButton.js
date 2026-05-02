'use client';

import { useEffect, useRef } from 'react';

/**
 * Pushes a history entry when a modal opens so the device's Back button
 * (Android hardware back, browser back, swipe-back) closes the modal
 * instead of leaving the page.
 *
 * Behavior:
 *  - When `isOpen` becomes true: push a sentinel state to history.
 *  - When user navigates back (popstate): call `onClose`.
 *  - When the modal closes through the UI (X button, etc.): pop our
 *    pushed entry off the stack so we don't accumulate history.
 */
export function useModalBackButton(isOpen, onClose) {
  const pushedRef = useRef(false);
  const onCloseRef = useRef(onClose);

  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (isOpen && !pushedRef.current) {
      window.history.pushState({ __modal: true, ts: Date.now() }, '');
      pushedRef.current = true;

      const handlePop = () => {
        pushedRef.current = false;
        onCloseRef.current?.();
      };
      window.addEventListener('popstate', handlePop);

      return () => {
        window.removeEventListener('popstate', handlePop);
        if (pushedRef.current) {
          pushedRef.current = false;
          // Pop our sentinel so the back stack stays clean when the modal
          // is dismissed via the UI (not via the back button).
          if (window.history.state?.__modal) {
            window.history.back();
          }
        }
      };
    }
  }, [isOpen]);
}
