import { GroupBalanceDisplay } from "@/app/components/Groups/GroupBalanceDisplay";
import Header from "@/app/components/Header/Header";

export default async function GroupBalancePage({
  params,
}: {
  params: { groupId: string };
}) {
  const groupId = (await params).groupId;
  return (
    <>
      <Header />
      <GroupBalanceDisplay groupId={groupId} />;
    </>
  );
}
