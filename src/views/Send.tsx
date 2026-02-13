"use client";

import { useParams } from "next/navigation";
import { SendForm } from "@/components/send/SendForm";
import { useBalances } from "@/hooks/useBalances";

export function SendPage() {
  useBalances();
  const params = useParams();
  const tokenMint = params?.tokenMint as string | undefined;

  console.log({ tokenMint });
  return <SendForm initialMint={tokenMint} />;
}
