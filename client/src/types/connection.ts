import { UserT } from "./user";

export type ConnectionT = {
  id: number;
  sender: number;
  receiver: number;
  receiverUser: UserT;
  senderUser: UserT;
  note: string;
  pending: boolean;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
};
