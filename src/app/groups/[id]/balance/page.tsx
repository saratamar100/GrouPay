import { GroupBalanceDisplay } from "@/app/components/Groups/GroupBalanceDisplay";

export default async function GroupBalancePage({
  params,
}: {
  params: { id: string };
}) {
  const groupId = (await params).id;
  return <GroupBalanceDisplay groupId={groupId} />;
}
