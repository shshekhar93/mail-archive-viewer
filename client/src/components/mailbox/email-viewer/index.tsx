import { useCallback, useEffect, useRef } from "react";
import { useStore } from "../../../lib/state";
import { Modal } from "../../layout/modal";
import { EmailContactView } from "./contact";
import "./email-viewer.css";

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
      header={<span className="email-subject">{openedMail.subject}</span>}
    >
      <EmailContactView mail={openedMail} />
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

  const adjustIframeHeight = useCallback(() => {
    if(!iframeRef.current?.contentDocument) {
      return null
    }
    
    const documentHeight = iframeRef.current?.contentDocument.documentElement.scrollHeight;
    iframeRef.current.style.height = `${Math.ceil(documentHeight)}px`;
  }, []);

  useEffect(() => {
    if(iframeRef.current === null) {
      return;
    }

    const contentDocument = iframeRef.current.contentDocument;
    if(contentDocument) {
      contentDocument?.open();
      contentDocument?.write(content);
      contentDocument?.close();
      contentDocument.body.style.margin = '0';

      adjustIframeHeight();
    }
  }, [content, adjustIframeHeight]);
  
  if(contentType === 'text/plain') {
    return (
      <pre style={{ margin: 0 }}>{content}</pre>
    )
  }

  return (
    <iframe title="html-email" onLoad={adjustIframeHeight} ref={iframeRef} style={{ width: '100%', border: 'none' }}></iframe>
  )
}