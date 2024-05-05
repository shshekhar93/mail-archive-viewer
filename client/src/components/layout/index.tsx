import React from 'react';
import './layout.css';
import { MailboxHeader } from './header';
import { MailboxLeftNav } from './left-nav';
import { MailboxFooter } from './footer';

export type MailboxPageLayoutPropsT = {
  children: React.ReactNode,
};

export function MailboxPageLayout({
  children
}: MailboxPageLayoutPropsT) {
  return (
    <div className="layout-root">
      <MailboxHeader />
      <MailboxLeftNav />
      <div className="content">
        { children }
      </div>
      <MailboxFooter />
    </div>
  );
}
