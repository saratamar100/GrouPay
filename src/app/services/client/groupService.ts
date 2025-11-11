import type { Group, Transactionaction } from "@/app/types/types";

/* ---------------- helpers ---------------- */
const toNumber = (v: any) => Number(v ?? 0);
const toDate = (v: any) => new Date(String(v ?? ""));
export type GroupMember = {
  id: string;
  name: string;
  email: string;
};


function mapGroup(doc: any): Group {
  return {
    id: String(doc._id ?? doc.id ?? ""),
    name: String(doc.name ?? ""),
    memberIds: Array.isArray(doc.memberIds) ? doc.memberIds : [],
    actionIds: Array.isArray(doc.actionIds) ? doc.actionIds : [],
  };
}

function mapMember(m: any) {
  return {
    id: String(m._id ?? m.id),
    name: String(m.name ?? m.email ?? m._id ?? ""),
    email: String(m.email ?? ""),
  };
}

function mapTx(tx: any): Transactionaction {
  return {
    id: tx._id,
    groupId: tx.groupId,
    name: String(tx.name ?? "").trim(),
    type: tx.type === "payment" ? "payment" : "expense",
    amount: toNumber(tx.amount),
    payerId: String(tx.payerId ?? ""),
    split: Array.isArray(tx.split)
      ? tx.split.map((s: any) => ({
          userId: s.userId,
          amount: toNumber(s.amount),
        }))
      : [],
    date: toDate(tx.date),
    receiptUrl: tx.receiptUrl ?? null,
  };
}

function extractArray(data: any, key: string) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[key])) return data[key];
  return [];
}

/* ---------------- API ---------------- */
async function fetchJson(url: string, options?: RequestInit) {
  const res = await fetch(url, { cache: "no-store", ...options });
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data?.error) msg = data.error;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function getGroup(groupId: string): Promise<Group> {
  const data = await fetchJson(`/api/groups/${groupId}`);
  return mapGroup(data);
}

export async function getGroupTransactions(groupId: string): Promise<Transactionaction[]> {
  const data = await fetchJson(`/api/groups/${groupId}/transactions`);
  const arr = extractArray(data, "actions");
  return arr.map(mapTx);
}

export async function getGroupMembers(groupId: string) {
  const data = await fetchJson(`/api/groups/${groupId}/members`);
  const arr = extractArray(data, "members");
  return arr.map(mapMember);
}

export async function getGroupWithDetails(groupId: string) {
  const data = await fetchJson(`/api/groups/${groupId}`);

  const group = mapGroup(
    data.group ?? {
      _id: data._id,
      name: data.name,
      memberIds: data.memberIds,
      actionIds: data.actionIds,
    }
  );

  const members = Array.isArray(data.members)
    ? data.members.map(mapMember)
    : [];

  const arr = extractArray(data, "actions");
  const transactions = arr.map(mapTx);

  return { group, members, transactions };
}

export async function createGroupTransaction(
  groupId: string,
  payload: any
) {
  const data = await fetchJson(`/api/groups/${groupId}/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const id =
    data?.id ||
    data?.insertedId ||
    data?._id ||
    data?.transactionId ||
    "";

  if (!id) throw new Error("Transaction created but no id returned");

  return { id: String(id) };
}

export async function deleteGroupTransaction(groupId: string, transactionId: string) {
  await fetchJson(`/api/groups/${groupId}/transactions/${transactionId}`, {
    method: "DELETE",
  });
}

export async function updateGroupTransaction(
  groupId: string,
  actionId: string,
  payload: any
) {
  return fetchJson(
    `/api/groups/${groupId}/transactions/${actionId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
}
