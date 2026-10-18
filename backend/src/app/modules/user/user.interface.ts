export type TUserRole = 'USER' | 'ADMIN';

export type TCreateUserInput = {
  email: string;
  name?: string;
  role?: TUserRole;
};

export type TUpdateUserInput = {
  name?: string;
  role?: TUserRole;
};
