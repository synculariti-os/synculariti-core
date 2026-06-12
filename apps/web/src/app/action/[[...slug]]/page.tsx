import { ActionPageClient } from './ActionPageClient';

export function generateStaticParams() {
  return [{ slug: [] }];
}

export default function Page() {
  return <ActionPageClient />;
}
