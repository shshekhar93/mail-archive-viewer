import { useEffect, useRef } from "react";
import { useStore } from "../../lib/state";
import { Modal } from "../layout/modal";

export function EmailViewer() {
  const openedMail = useStore(state => state.openedMail);
  const closeMail = useStore(state => state.closeMail);

  if(openedMail === null) {
    return null;
  }

  return (
    <Modal
      closeable
      onClose={closeMail}
    >
      <EmailContent content={openedMail.content} contentType={openedMail.contentType} />
    </Modal>
  )
}

export function EmailContent({
  content,
  contentType,
}: {
  content: string;
  contentType: string;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if(iframeRef.current === null) {
      return;
    }

    iframeRef.current.contentDocument?.open();
    iframeRef.current.contentDocument?.write(content);
    iframeRef.current.contentDocument?.close();
  }, [content]);
  
  if(contentType === 'text/plain') {
    return (
      <pre style={{ margin: 0 }}>{content}</pre>
    )
  }

  return (
    <iframe title="html-email" ref={iframeRef} style={{ width: '100%', border: 'none', height: 'calc(100vh - 40px)'}}></iframe>
  )
}