type UserId = string;
type GroupId = string;
type ActionId = string;
export type Status = "pending" | "completed";

export interface User {
  id: UserId;
  name: string;
  email: string;
  photoURL: string;
  phone: string;
}

export interface GroupShort {
  id: GroupId;
  name: string;
  balance: number;
  isActive: boolean;
}
export type Member = {
  id: UserId;
  name: string;
};
export interface Group {
  id: GroupId;
  name: string;
  members: Member[];
  expenses: Expense[];
  isActive: boolean;
  notifications: boolean;
}
export interface Debt {
  member: Member;
  amount: number;
}
export interface GroupTransactions {
  debts: Debt[];
  payments: Payment[];
}

export interface SplitDetail {
  userId: UserId;
  amount: number;
  name: string;

}

export interface Expense {
  id: ActionId;
  name: string;
  amount: number;
  payer: Member;
  split: SplitDetail[];
  date: Date;
  receiptUrl?: string | null;
}

export interface Payment {
  id: ActionId;
  amount: number;
  payer: Member;
  payee: Member;
  date: Date;
  status: Status;
}
