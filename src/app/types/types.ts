// types.ts

// שימוש ב-Type Aliases עוזר לשמור על אחידות
// ומקל על שינויים בעתיד (למשל, אם תחליט לעבור ממספר למחרוזת)
type UserId = string;
type GroupId = string;
type ActionId = string;

/**
 * 1. משתמש
 * ID, שם, סיסמא, מייל, טלפון, רשימה של קבוצות (ID של הקבוצות).
 */
export interface User {
  id: UserId;
  name: string;
  passwordHash: string; // מומלץ לא לשמור סיסמא גלויה, אלא Hash
  email: string;
  phone: string;
  groupIds: GroupId[];
}

/**
 * 2. קבוצה
 * ID, שם, רשימה של חברי קבוצה (ID של משתמשים), רשימה של פעולות (ID של פעולות)
 */
export interface Group {
  id: GroupId;
  name: string;
  memberIds: UserId[];
  actionIds: ActionId[];
}

// ממשק עזר עבור חלוקת הסכום בפעולה
// (רשימה של ID של יוזרים וסכום לכל אחד)
interface SplitDetail {
  userId: UserId;
  amount: number;
}

// סוגי הפעולות האפשריים
// שימוש ב-Union Type מבטיח שרק ערכים אלו יתקבלו
export type ActionType = "expense" | "payment";

/**
 * 3. פעולה
 * ID, ID של הקבוצה, שם פעולה, סוג פעולה, סכום,
 * מי שילם/יצר, חלוקת הסכום, תאריך, קבלה.
 */
export interface Transactionaction {
  id: ActionId;
  groupId: GroupId;
  name: string; // שם הפעולה (לדוגמה: "ארוחת ערב")
  type: ActionType; // סוג הפעולה
  amount: number; // הסכום הכולל של הפעולה
  payerId: UserId; // מי שילם/יצר
  split: SplitDetail[]; // חלוקת הסכום
  date: Date; // תאריך הפעולה
  receiptUrl?: string | null; // קבלה - אופציונלי (יכול להיות URL לתמונה)
}
