import { ObjectId } from "mongodb";
import { getDb } from "./mongo";

export async function updateUserProfileService(
  id: string,
  name?: string,
  photoURL?: string | null
) {

  if (!id) {
    const err = new Error("לא התקבל ID של המשתמש");
    (err as any).status = 400;
    throw err;
  }

  const db = await getDb("groupay_db");
  const users = db.collection("user");
  const payments = db.collection("payment");
  const expenses = db.collection("expense");
  const groups = db.collection("group");

  const trimmedName = typeof name === "string" ? name.trim() : "";
  console.log("Trimmed Name:", trimmedName);

  if (!trimmedName && photoURL === undefined) {
    const err = new Error("לא נשלחו שדות לעדכון");
    (err as any).status = 400;
    throw err;
  }

  const userObjectId = new ObjectId(id);
  console.log("ObjectId:", userObjectId);

  const updateFields: Record<string, unknown> = {};
  if (trimmedName) updateFields.name = trimmedName;
  if (photoURL) updateFields.photoURL = photoURL;

  console.log("Updating user with:", updateFields);

  const updatedUser = await users.findOneAndUpdate(
    { _id: userObjectId },
    { $set: updateFields },
  );



  console.log("User update result:", updatedUser);

  if (!updatedUser) {
    const err = new Error("המשתמש לא נמצא במערכת");
    (err as any).status = 404;
    throw err;
  }

  if (trimmedName) {
   

    await payments.updateMany(
      { "payer.id": userObjectId },
      { $set: { "payer.name": trimmedName } }
    );

    await payments.updateMany(
      { "payee.id": userObjectId },
      { $set: { "payee.name": trimmedName } }
    );

    await expenses.updateMany(
      { "payer.id": userObjectId },
      { $set: { "payer.name": trimmedName } }
    );


    await groups.updateMany(
      { "members.id": userObjectId },
      {
        $set: {
          "members.$[m].name": trimmedName,
        },
      },
      {
        arrayFilters: [{ "m.id": userObjectId }],
      }
    );

   
  }

  return {
    id: updatedUser._id.toString(),
    name: updatedUser.name.toString(),
    email: updatedUser.email.toString(),
    photoURL: updatedUser.photoURL.toString(),
  };
}