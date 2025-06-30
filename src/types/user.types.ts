export interface User {
  sub: string; 
  username: string;
  role: string;
  permissions: string[];
}

export interface User2 {
  _id: string;
  username: string;
  email: string;
  password: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
  is_banned:boolean;
}

export type UserList = User2[];