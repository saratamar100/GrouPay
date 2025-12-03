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

//     const userObjectId = new ObjectId(userId);

//     const user = await db.collection("user").findOne({ _id: userObjectId });

//     if (!user) {
//       return NextResponse.json({ error: "User not found" }, { status: 404 });
//     }

//     if (!Array.isArray(user.groupId)) {
//       return NextResponse.json({ error: "Invalid user.groupId format" }, { status: 500 });
//     }

//     const groupObjectIds = user.groupId.map((id: string) => new ObjectId(id));

//     const groups = await db.collection("group").find({ _id: { $in: groupObjectIds } }).toArray();

//     const result = groups
//       .map((group: any, index: number) => {

//         if (!Array.isArray(group.group_debts)) {
//           return null;
//         }

//         const userDebt = group.group_debts.find((entry: any) =>
//           String(entry.id) === userId
//         );

//         if (!userDebt) {
//           return null;
//         }

//         if (!Array.isArray(userDebt.debts)) {
//           return null;
//         }

//         const balance = userDebt.debts.reduce((sum: number, d: any) => {
//           return sum + (d.amount || 0);
//         }, 0);

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
//     return NextResponse.json({ error: message }, { status: 500 });
//   }
// }

// =============================================

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

//     const userObjectId = new ObjectId(userId);

//     const user = await db.collection("user").findOne({ _id: userObjectId });

//     if (!user) {
//       return NextResponse.json({ error: "User not found" }, { status: 404 });
//     }

//     if (!Array.isArray(user.groupId)) {
//       return NextResponse.json({ error: "Invalid user.groupId format" }, { status: 500 });
//     }

//     const groupObjectIds = user.groupId.map((id: string) => new ObjectId(id));

//     const groups = await db.collection("group").find({ _id: { $in: groupObjectIds } }).toArray();

//     const result = groups
//       .map((group: any, index: number) => {

//         if (!Array.isArray(group.group_debts)) {
//           return null;
//         }

//         const userDebt = group.group_debts.find((entry: any) =>
//           String(entry.id) === userId
//         );

//         if (!userDebt) {
//           return null;
//         }

//         if (!Array.isArray(userDebt.debts)) {
//           return null;
//         }

//         const balance = userDebt.debts.reduce((sum: number, d: any) => {
//           return sum + (d.amount || 0);
//         }, 0);

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
//     return NextResponse.json({ error: message }, { status: 500 });
//   }
// }

// ===================================

// import { NextResponse } from "next/server";
// import { getDb } from "@/app/services/server/mongo";
// import { ObjectId } from "mongodb";

// export async function GET(request: Request) {
//   try {
//     console.log("Starting GET /groups route");

//     const { searchParams } = new URL(request.url);
//     const userId = searchParams.get("userId");
//     console.log("Extracted userId:", userId);

//     if (!userId) {
//       console.log("Missing userId in request");
//       return NextResponse.json({ error: "Missing userId" }, { status: 400 });
//     }

//     console.log("Connecting to database");
//     const db = await getDb();

//     console.log("Converting userId to ObjectId");
//     const userObjectId = new ObjectId(userId);

//     console.log("Fetching user from database");
//     const user = await db.collection("user").findOne({ _id: userObjectId });

//     if (!user) {
//       console.log("User not found in database");
//       return NextResponse.json({ error: "User not found" }, { status: 404 });
//     }

//     console.log("Validating user.groupId format");
//     if (!Array.isArray(user.groupId)) {
//       console.log("user.groupId is not an array");
//       return NextResponse.json({ error: "Invalid user.groupId format" }, { status: 500 });
//     }

//     console.log("Converting groupId list to ObjectId array");
//     const groupObjectIds = user.groupId.map((id: string) => new ObjectId(id));

//     console.log("Fetching groups from database");
//     const groups = await db
//       .collection("group")
//       .find({ _id: { $in: groupObjectIds } })
//       .toArray();

//     console.log("Processing groups and calculating balances");

//     const result = groups
//       .map((group: any) => {
//         console.log("Processing group:", group._id);

//         if (!Array.isArray(group.group_debts)) {
//           console.log("Group has invalid group_debts format");
//           return null;
//         }

//         const userDebt = group.group_debts.find((entry: any) => String(entry.id) === userId);
//         console.log("Found user debt entry:", userDebt);

//         if (!userDebt) {
//           console.log("No debt entry for this user in group");
//           return null;
//         }

//         if (!Array.isArray(userDebt.debts)) {
//           console.log("Invalid debts array for user in this group");
//           return null;
//         }

//         console.log("Calculating balance");
//         const balance = userDebt.debts.reduce((sum: number, d: any) => {
//           return sum + (d.amount || 0);
//         }, 0);

//         console.log("Finished group", group._id, "balance:", balance);

//         return {
//           groupId: group._id,
//           groupName: group.name,
//           balance,
//         };
//       })
//       .filter(Boolean);

//     console.log("Returning final response");
//     return NextResponse.json(result);
//   } catch (err: unknown) {
//     console.log("Error occurred:", err);
//     const message = err instanceof Error ? err.message : "Internal server error";
//     return NextResponse.json({ error: message }, { status: 500 });
//   }
// }

// =======================================================

import { NextResponse } from "next/server";
import { getDb } from "@/app/services/server/mongo";
import { ObjectId } from "mongodb";

export async function GET(request: Request) {
  try {
    console.log("Starting GET /groups route");

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    console.log("Extracted userId:", userId);

    if (!userId) {
      console.log("Missing userId in request");
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    console.log("Connecting to database");
    const db = await getDb();

    console.log("Converting userId to ObjectId");
    const userObjectId = new ObjectId(userId);

    console.log("Fetching user from database");
    const user = await db.collection("user").findOne({ _id: userObjectId });

    if (!user) {
      console.log("User not found in database");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("Validating user.groupId format");
    if (!Array.isArray(user.groupId)) {
      console.log("user.groupId is not an array");
      return NextResponse.json(
        { error: "Invalid user.groupId format" },
        { status: 500 }
      );
    }

    console.log("Converting groupId list to ObjectId array");
    const groupObjectIds = user.groupId.map((id: string) => new ObjectId(id));

    console.log("Fetching groups from database");
    const groups = await db
      .collection("group")
      .find({ _id: { $in: groupObjectIds } })
      .toArray();

    console.log("Processing groups and calculating balances");

    const result = groups
      .map((group: any) => {
        console.log("Processing group:", group._id);

        if (!group.group_debts || typeof group.group_debts !== "object") {
          console.log("Group has invalid group_debts format");
          return null;
        }

        const userDebtsArray = group.group_debts[userId];
        console.log("Found debts array for user:", userDebtsArray);

        if (!Array.isArray(userDebtsArray)) {
          console.log("No debts found for this user in group");
          const balance = 0;
          return {
            groupId: group._id,
            groupName: group.name,
            balance,
            isActive: group.isActive,
          };
        }

        console.log("Calculating balance");
        const balance = userDebtsArray.reduce(
          (sum: number, d: any) => sum + (d.amount || 0),
          0
        );

        console.log("Finished group", group._id, "balance:", balance);

        return {
          groupId: group._id,
          groupName: group.name,
          balance,
          isActive: group.isActive,
        };
      })
      .filter(Boolean);

    console.log("Returning final response");
    return NextResponse.json(result);
  } catch (err: unknown) {
    console.log("Error occurred:", err);
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
