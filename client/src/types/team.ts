import type { UserT } from "./user";
import type { NotebookT } from "./notebook";

type UserWithRoleT = UserT & {
  UserTeams: {
    role: string;
  };
};

export type TeamT = {
  id: number;
  name: string;
  description: string;
  users: UserWithRoleT[];
  notebooks: NotebookT[];
  createdAt: string;
  updatedAt: string;
};

export type UpdateTeamT = {
  userIdToAdd?: number;
  userIdToRemove?: number;
  userIdToUpdate?: number;
  newUserRole?: string;
  description?: string;
  name?: string;
};
