import { KeyboardEvent as ReactKeyboardEvent, ReactNode, useCallback, useEffect, useRef } from "react";
import './modal.css';
import ReactFocusLock from "react-focus-lock";

export type ModalPropsT = {
  children?: ReactNode;
  header?: ReactNode;
  closeable?: boolean;
  onClose?: () => void,
};

export function Modal({
  children = null,
  header = null,
  closeable = false,
  onClose = () => {},
}: ModalPropsT) {
  const modalContentRef = useRef<HTMLDivElement>(null);
  const keyUp = useCallback((e: KeyboardEvent | ReactKeyboardEvent) => {
    if(closeable && e.key === 'Escape') {
      onClose();
    }
  }, [closeable, onClose]);

  useEffect(() => {
    if(modalContentRef.current === null) {
      return;
    }

    const allIframes = [...modalContentRef.current.querySelectorAll('iframe')];
    allIframes.forEach(iframe => 
      iframe.contentWindow?.addEventListener('keyup', keyUp));

    return () => allIframes.forEach(iframe => iframe.contentWindow?.removeEventListener('keyup', keyUp));
  }, []);

  return (
    <div tabIndex={0} className="modal" onKeyUp={keyUp}>
      <ReactFocusLock>
        <div className="modal-header">
          {header ? header : (closeable ? <span></span> : null)}
          {closeable && <button className="modal-close-button" onClick={onClose}>&times;</button>}
        </div>
        <div className="modal-content" ref={modalContentRef}>
          {children}
        </div>
        <div className="modal-footer"></div>
      </ReactFocusLock>
    </div>
  )  
}
