import EstimatesClient from './EstimatesClient';

interface EstimatesPageProps {
  searchParams: Promise<{ status?: string | string[] }>;
}

export default async function EstimatesPage({ searchParams }: EstimatesPageProps) {
  const { status } = await searchParams;
  const initialStatus = Array.isArray(status) ? status[0] : status;

  return <EstimatesClient initialStatus={initialStatus} />;
}
