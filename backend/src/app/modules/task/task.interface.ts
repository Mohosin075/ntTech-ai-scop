export type TTaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export type TCreateTaskInput = {
  title: string;
  description?: string;
  status?: TTaskStatus;
  userId: string;
};

export type TUpdateTaskInput = {
  title?: string;
  description?: string;
  status?: TTaskStatus;
};
