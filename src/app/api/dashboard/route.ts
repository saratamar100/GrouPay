// import { NextResponse } from "next/server";
// import { getDb } from "@/app/services/server/mongo";
// import { ObjectId } from "mongodb";

// export async function GET(request: Request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const userId = searchParams.get("userId");

//     if (!userId) {
//       return NextResponse.json({ error: "Missing userId" }, { status: 400 });
//     }

//     const db = await getDb();
//     const usersCollection = db.collection("user");

//     let query: any;

//     // אם ניתן להמיר ל-ObjectId, נעשה זאת
//     if (ObjectId.isValid(userId)) {
//       query = { _id: new ObjectId(userId) };
//     } else {
//       // אחרת ננסה למצוא לפי מחרוזת רגילה
//       query = { _id: userId };
//     }

//     const user = await usersCollection.findOne(query);

//     if (!user) {
//       return NextResponse.json({ error: "User not found" }, { status: 404 });
//     }

//     return NextResponse.json(user);
//   } catch (err: unknown) {
//     const message = err instanceof Error ? err.message : "Internal server error";
//     console.error(err);
//     return NextResponse.json({ error: message }, { status: 500 });
//   }
// }

// ==========================================


// import { NextResponse } from "next/server";
// import { getDb } from "@/app/services/server/mongo";
// import { ObjectId } from "mongodb"; // <- הוספה

// export async function GET(request: Request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const userId = searchParams.get("userId");

//     if (!userId) {
//       return NextResponse.json({ error: "Missing userId" }, { status: 400 });
//     }

//     const db = await getDb();

//     // המרה ל-ObjectId
//     const user = await db.collection("user").findOne({ _id: new ObjectId(userId) });

//     if (!user) {
//       return NextResponse.json({ error: "User not found" }, { status: 404 });
//     }

//     const groups = await db
//       .collection("group")
//       .find({ _id: { $in: user.groupId.map((id: string) => new ObjectId(id)) } }) // גם כאן צריך ObjectId
//       .toArray();

//     const result = groups
//       .map((group: any) => {
//         const member = group.members.find((m: any) => m.userId === userId);
//         if (!member) return null;

//         const balance = member.balances.reduce((sum: number, b: any) => sum + b.amount, 0);

//         return {
//           groupId: group._id,
//           groupName: group.name,
//           balance,
//         };
//       })
//       .filter(Boolean);

//     return NextResponse.json(result);
//   } catch (err: unknown) {
//     const message = err instanceof Error ? err.message : "Internal server error";
//     console.error(err);
//     return NextResponse.json({ error: message }, { status: 500 });
//   }
// }



// ==================================================

// import { NextResponse } from "next/server";
// import { getDb } from "@/app/services/server/mongo";
// import { ObjectId } from "mongodb";

// export async function GET(request: Request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const userId = searchParams.get("userId");

//     if (!userId) {
//       return NextResponse.json({ error: "Missing userId" }, { status: 400 });
//     }

//     const db = await getDb();

//     // המרה ל-ObjectId אם אפשר
//     const query = ObjectId.isValid(userId) ? { _id: new ObjectId(userId) } : { _id: userId };
//     const user = await db.collection("user").findOne(query);

//     if (!user) {
//       return NextResponse.json({ error: "User not found" }, { status: 404 });
//     }

//     // אם למשתמש אין קבוצות, נחזיר [] מיד
//     if (!user.groupId || user.groupId.length === 0) {
//       return NextResponse.json([]);
//     }

//     // המרה ל-ObjectId לכל הקבוצות
//     const groupIds = user.groupId.map((id: string) =>
//       ObjectId.isValid(id) ? new ObjectId(id) : id
//     );

//     const groups = await db
//       .collection("group")
//       .find({ _id: { $in: groupIds } })
//       .toArray();

//     const result = groups
//       .map((group: any) => {
//         // השוואת userId כ-string
//         const member = group.members.find(
//           (m: any) => m.userId.toString() === user._id.toString()
//         );
//         if (!member) return null;

//         const balance = member.balances.reduce(
//           (sum: number, b: any) => sum + b.amount,
//           0
//         );

//         return {
//           groupId: group._id,
//           groupName: group.name,
//           balance,
//         };
//       })
//       .filter(Boolean);

//     return NextResponse.json(result);
//   } catch (err: unknown) {
//     const message = err instanceof Error ? err.message : "Internal server error";
//     console.error(err);
//     return NextResponse.json({ error: message }, { status: 500 });
//   }
// }




// =============================================




import { NextResponse } from "next/server";
import { getDb } from "@/app/services/server/mongo";
import { ObjectId } from "mongodb";

export async function GET(request: Request) {
  console.log("🔹 התחלת הבקשה ל-GET /api/userGroups");
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    console.log("📥 userId שהתקבל:", userId);

    if (!userId) {
      console.warn("⚠️ חסר userId בפרמטרים!");
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    console.log("📡 מתחבר למסד הנתונים...");
    const db = await getDb();
    console.log("✅ חיבור למסד הנתונים הצליח.");

    console.log("🧩 ממיר userId ל-ObjectId...");
    const userObjectId = new ObjectId(userId);
    console.log("✅ ObjectId:", userObjectId);

    console.log("🔍 מחפש משתמש עם ה-ID הזה...");
    const user = await db.collection("user").findOne({ _id: userObjectId });
    console.log("📄 משתמש שנמצא:", user);

    if (!user) {
      console.warn("⚠️ לא נמצא משתמש עם ID:", userId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("👥 מזהי קבוצות של המשתמש:", user.groupId);

    if (!Array.isArray(user.groupId)) {
      console.error("❌ שדה groupId אינו מערך:", user.groupId);
      return NextResponse.json({ error: "Invalid user.groupId format" }, { status: 500 });
    }

    console.log("🔄 ממיר groupId ל-ObjectId...");
    const groupObjectIds = user.groupId.map((id: string) => new ObjectId(id));
    console.log("✅ groupObjectIds:", groupObjectIds);

    console.log("🔍 שולף קבוצות מהמסד...");
    const groups = await db.collection("group").find({ _id: { $in: groupObjectIds } }).toArray();
    console.log(`📊 נמצאו ${groups.length} קבוצות.`);

    console.log("🔎 מתחיל עיבוד קבוצות למציאת באלאנס למשתמש...");
    const result = groups
      .map((group: any, index: number) => {
        console.log(`➡️ קבוצה #${index + 1}:`, group.name, "ID:", group._id);

        if (!Array.isArray(group.members)) {
          console.warn("⚠️ group.members לא מערך:", group.members);
          return null;
        }

        const member = group.members.find((m: any) => m.userId === userId);
        console.log("👤 חבר בקבוצה שנמצא:", member);

        if (!member) {
          console.log("❌ המשתמש לא חבר בקבוצה הזו.");
          return null;
        }

        if (!Array.isArray(member.balances)) {
          console.warn("⚠️ balances לא מערך:", member.balances);
          return null;
        }

        const balance = member.balances.reduce((sum: number, b: any) => {
          console.log("💰 חישוב באלאנס:", b);
          return sum + (b.amount || 0);
        }, 0);

        console.log("📈 באלאנס סופי בקבוצה:", balance);

        return {
          groupId: group._id,
          groupName: group.name,
          balance,
        };
      })
      .filter(Boolean);

    console.log("✅ תוצאה סופית להחזרה:", result);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("💥 שגיאה:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
