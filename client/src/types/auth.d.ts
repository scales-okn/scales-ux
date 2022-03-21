interface User {
  id: number;
  role: string;
  email: string;
  firstName: string;
  lastName: string;
  blocked: boolean;
  approved: boolean;
}

interface DecodedToken {
  user: User | null;
  iat: number;
  exp: number;
}
