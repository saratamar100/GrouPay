// // app/services/client/removeMemberService.ts
// export async function removeMemberFromGroup(groupId: string, userId: string) {
//   try {
//     const res = await fetch(`/api/groups/${groupId}/members/removeMember`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ groupId, userId }),
//     });

//     const data = await res.json();
//     console.log(data)

//     if (!res.ok) {
//       throw new Error(data.error || "שגיאה בהסרת המשתמש");
//     }

//     return data;
//   } catch (err: any) {
//     console.error(err);
//     throw err;
//   }
// }

export async function removeMemberFromGroup(groupId: string, userId: string) {
  const res = await fetch(`/api/groups/${groupId}/members/removeMember`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ groupId, userId }),
  });

  const data = await res.json();
  return data; 
}
