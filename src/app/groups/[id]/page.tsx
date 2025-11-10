import { GroupBalanceView } from "@/app/components/Groups/GroupBalanceView";

export default async function GroupPage({
  params,
}: {
  params: { id: string };
}) {
  const groupId = (await params).id;
  return <GroupBalanceView groupId={groupId} />;
}
