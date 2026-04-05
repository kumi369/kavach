import { IncidentDetailClient } from "./incident-detail-client";

export default async function IncidentDetailPage({
  params,
}: {
  params: Promise<{ alertId: string }>;
}) {
  const { alertId } = await params;

  return <IncidentDetailClient alertId={alertId} />;
}
