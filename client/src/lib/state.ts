import { StoreApi, create } from "zustand";
import { useShallow } from 'zustand/react/shallow';
import { getMailboxes, getMails } from "./api";
import { mailMapper } from "./mappers";

export type FiltersT = {
  mailboxId: number; // Selected mailbox;
  label: number; // Label / folder
  search: string; // space seperated keywords
  from: string; // sender email
  to: string; // recipient email
  subject: string; // subject, partial search supported
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
  mails: MailT[]

  bootstrap: () => Promise<void>;
  filter: (filters: Partial<FiltersT>) => Promise<void>
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
    // Retain old mailboxId if user didn't attempt to update it.
    if(filters.mailboxId === undefined) {
      filters.mailboxId = get().filters.mailboxId;
    }

    const newFilters = createFilter(filters);
    set({
      filters: newFilters,
    });

    const mails = await getMails(newFilters.mailboxId, newFilters);
    set({
      mails: mails.map(mailMapper),
    })
  }
}

export const useStore = create<StateT>((set, get) => ({
  ...defaultState,
  bootstrap: createBootstrapAction(set),
  filter: createFilterAction(set, get),
}));

export const useStoreShallow = <T>(keys: Array<keyof StateT>): T => (useStore(
  useShallow((state) => keys.map(key => state[key]))
)as unknown as T);
