type UserId = string;
type GroupId = string;
type ActionId = string;
export interface User {
  id: UserId;
  name: string;
  email: string;
  photoURL: string;
  phone: string;
}

export interface Group {
  id: GroupId;
  name: string;
  memberIds: UserId[];
  actionIds: ActionId[];
}

interface SplitDetail {
  userId: UserId;
  amount: number;
}

export type ActionType = "expense" | "payment";

export interface Transactionaction {
  id: ActionId;
  groupId: GroupId;
  name: string;
  type: ActionType;
  amount: number;
  payerId: UserId;
  split: SplitDetail[];
  date: Date;
  receiptUrl?: string | null;
}
