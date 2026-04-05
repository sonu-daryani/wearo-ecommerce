import { OrderDetailView } from "@/components/account/OrderDetailView";
import { auth } from "@/auth";
import { getAccountOrderDetail } from "@/lib/orders/get-account-order";
import { redirect, notFound } from "next/navigation";

type Props = {
  params: { publicToken: string };
};

export default async function AccountOrderDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/auth/login?callbackUrl=/account/orders/${encodeURIComponent(params.publicToken)}`);
  }

  const token = decodeURIComponent(params.publicToken);
  const order = await getAccountOrderDetail(token, session.user.id, session.user.email);

  if (!order) {
    notFound();
  }

  return <OrderDetailView order={order} />;
}
