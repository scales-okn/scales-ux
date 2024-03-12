import { UserT } from "./user";
import { TeamT } from "./team";

export type NotebookT = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  userId: string | number;
  user: UserT;
  team: TeamT;
  visibility: string;
};
