import { useParams } from 'react-router-dom';
import { SendForm } from '@/components/send/SendForm';

export function SendPage() {
  const { tokenMint } = useParams();
  return <SendForm initialMint={tokenMint} />;
}
