import type { Member } from "@/app/types/types";
import type { SplitDetail } from "@/app/types/types";

export function buildSplit(
  selectedIds: string[],
  members: Member[],
  perUser: Record<string, number>
): SplitDetail[] {
  return selectedIds.map((id) => {
    const member = members.find((m) => m.id === id);

    return {
      userId: id,
      name: member?.name ?? "",
      amount: Number(perUser[id]) || 0,
    };
  });
}
