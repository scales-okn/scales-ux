export type UserT = {
  approved: boolean;
  blocked: boolean;
  email: string;
  firstName: string;
  id: number;
  lastName: string;
  role: string;
  usage?: string;
  notifyOnNewRingVersion?: boolean;
};
