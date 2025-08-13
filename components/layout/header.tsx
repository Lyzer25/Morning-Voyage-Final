import ClientHeader from "./header.client";
import { getServerSession } from "@/lib/auth";

export default async function Header() {
  const session = await getServerSession();
  return <ClientHeader session={session} />;
}
