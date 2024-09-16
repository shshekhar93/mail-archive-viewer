import { StoreApi, create } from "zustand";
import { useShallow } from 'zustand/react/shallow';
import { getMail, getMailboxes, getMails } from "./api";
import { mailMapper } from "./mappers";

export type FiltersT = {
  mailboxId: number; // Selected mailbox;
  label: number; // Label / folder
  search: string; // space seperated keywords
  from: string; // sender email
  to: string; // recipient email
  subject: string; // subject, partial search supported
  limit: number; // Number of mail per page
  offset: number; // Number of mails to skip
}

export type LabelT = {
  id: number;
  label: string;
}

export type MailBoxT = {
  id: number;
  name: string;
  displayName?: string;
  labels: LabelT[];
};

export type ContactT = {
  name: string;
  email: string;
};

export type MailT = {
  id: number;
  messageTime: Date;
  subject: string;
  senderName: string;
  senderEmail: string;
  isSentEmail: boolean;
  recipients: ContactT[];
  labels: string[];
}

export type AttachmentT = {
  contentType: string;
  content: string;
  filename: string;
};

export type MailWithContent = MailT & {
  content: string;
  contentType: string;
  attachments: AttachmentT[];
}

export type SettingsT = {
  darkMode: boolean;
  contentLengthForKeywords: number;
  maxKeywordsCount: number;
};

export type StateT = {
  bootstrapComplete: boolean;
  filters: FiltersT;
  settings: SettingsT;
  mailboxes: MailBoxT[];
  mails: MailT[];
  totalCount: number;
  openedMail: MailWithContent | null;

  bootstrap: () => Promise<void>;
  filter: (filters: Partial<FiltersT>) => Promise<void>;
  openMail: (mail: MailT) => Promise<void>;
  closeMail: () => Promise<void>;
}

type SetState = StoreApi<StateT>['setState'];
type GetState = StoreApi<StateT>['getState'];

const createFilter = (filters: Partial<FiltersT>): FiltersT => ({
  mailboxId: filters.mailboxId ?? 0,
  label: filters.label ?? 0,
  search: filters.search ?? '',
  from: filters.from ?? '',
  to: filters.to ?? '',
  subject: filters.subject ?? '',
  limit: filters.limit ?? 25,
  offset: filters.offset ?? 0,
});

const defaultState = {
  bootstrapComplete: false,
  filters: createFilter({}),
  settings: {
    darkMode: false,
    contentLengthForKeywords: 1024,
    maxKeywordsCount: 128,
  },
  mailboxes: [],
  mails: [],
  totalCount: 0,
  openedMail: null,
};

const createBootstrapAction = (set: SetState) => {
  return async (): Promise<void> => {
    const mailboxes = await getMailboxes();
    // const settings = await getSettings();

    set({
      bootstrapComplete: true,
      mailboxes,
      // settings,
      mails: [],
    });
  };
}

const createFilterAction = (set: SetState, get: GetState) => {
  return async (filters: Partial<FiltersT>) : Promise<void> => {
    const newFilters = createFilter({
      ...get().filters,
      ...filters,
    });
    console.log(filters, newFilters);
    
    set({
      filters: newFilters,
    });

    const {
      mails,
      count: totalCount
    } = await getMails(newFilters.mailboxId, {
      ...newFilters,
      limit: newFilters.limit.toString(),
      offset: newFilters.offset.toString(),
    });

    set({
      mails: mails.map(mailMapper),
      totalCount
    })
  }
}

const createOpenMailAction = (set: SetState, get: GetState) => {
  return async (mail: MailT) => {
    const { id } = mail;
    const openedMail = mailMapper<MailWithContent>(await getMail(id));
    window.history.pushState({}, "", `${window.location.pathname}/mail/${id}`);
    set({
      openedMail,
    });
  }
}

const createCloseMailAction = (set: SetState, get: GetState) => {
  return async () => {
    window.history.back();
    set({
      openedMail: null,
    });
  }
}

export const useStore = create<StateT>((set, get) => ({
  ...defaultState,
  bootstrap: createBootstrapAction(set),
  filter: createFilterAction(set, get),
  openMail: createOpenMailAction(set, get),
  closeMail: createCloseMailAction(set, get),
}));

export const useStoreShallow = <T>(keys: Array<keyof StateT>): T => (useStore(
  useShallow((state) => keys.map(key => state[key]))
)as unknown as T);
