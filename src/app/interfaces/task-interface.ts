export interface Itask {
  title: string;
  id: string;
  isImportant?: boolean;
  isComplete?: boolean;
}
export interface Ibins {
  metadata: { createdAt: string; id: string; private: boolean };
  record: {
    tasks: Itask[];
  };
}
