import { Role } from '@prisma/client';

export interface IRegisterInput {
  name: string;
  email: string;
  password: string;
  role?: Role;
}

export interface ILoginInput {
  email: string;
  password: string;
}

export interface IAuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface ILoginResponse {
  user: IAuthUser;
  token: string;
}
