// components/missionControl/messages/types.ts

export interface Message {
  id: number;
  sender: string;
  text: string;
  time: string;
  isUser: boolean;
}

export interface Contact {
  id: number;
  name: string;
  avatar?: string;
  online?: boolean;
}

export interface Chat {
  id: number;
  participants: Contact[];
  messages: Message[];
  isGroup?: boolean;
  groupName?: string;
  lastUpdated?: string;
}