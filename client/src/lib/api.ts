import { toQuery } from "./utils";

export const API_ERROR = new Error('API_ERROR');

export async function getMailboxes() {
  const resp = await fetch('/api/mailbox');
  if(!resp.ok) {
    throw API_ERROR;
  }
  return resp.json();
}

type MailsQueryParams = {
  search?: string;
  limit?: string;
  offset?: string;
};

export async function getMails(mailboxId: number, queryParams: MailsQueryParams) {
  const url = `/api/mailbox/${mailboxId}?${(toQuery(queryParams))}`;
  const resp = await fetch(url);
  if(!resp.ok) {
    throw API_ERROR;
  }
  return resp.json();
}

export async function getMail(mailId: string) {
  const resp = await fetch(`/mail/${mailId}`);
  if(!resp.ok) {
    throw API_ERROR;
  }
  return resp.json();
}
