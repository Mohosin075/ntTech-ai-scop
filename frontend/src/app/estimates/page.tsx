import React, { Suspense } from 'react';
import EstimatesClient from './EstimatesClient';
import { Loader2 } from 'lucide-react';

interface EstimatesPageProps {
  searchParams: Promise<{ status?: string | string[] }>;
}

async function EstimatesContent({ searchParams }: EstimatesPageProps) {
  const { status } = await searchParams;
  const initialStatus = Array.isArray(status) ? status[0] : status;

  return <EstimatesClient initialStatus={initialStatus} />;
}

export default function EstimatesPage(props: EstimatesPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f7f7f4] flex items-center justify-center text-[#526270]">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
        </div>
      }
    >
      <EstimatesContent {...props} />
    </Suspense>
  );
}
