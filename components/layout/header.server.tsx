import ClientHeader from "./header";
import { getServerSession } from "@/lib/auth";

export default async function Header() {
  const session = await getServerSession();
  return <ClientHeader session={session} key={Date.now()} />;
}
