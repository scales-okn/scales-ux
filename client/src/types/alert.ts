import type { ConnectionT } from "./connection";
import type { UserT } from "./user";
import type { TeamT } from "./team";
import type { NotebookT } from "./notebook";

export type AlertT = {
  id: number;
  userId: number;
  initiatorUserId: number;
  initiatorUser?: UserT;
  notebookId: number | null;
  notebook: NotebookT;
  viewed: boolean;
  connection?: ConnectionT;
  connectionId?: number;
  team?: TeamT;
  teamId?: number;
  createdAt: string;
  updatedAt: string;
  ringLabel?: string;
  deletedNotebookName?: string;
};
