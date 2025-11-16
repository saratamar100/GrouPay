import { GroupBalanceDisplay } from "@/app/components/Groups/GroupBalanceDisplay";

export default async function GroupBalancePage({
  params,
}: {
  params: { groupId: string };
}) {
  const groupId = (await params).groupId;
  return <GroupBalanceDisplay groupId={groupId} />;
}
