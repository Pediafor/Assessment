import { ResultDetailClient } from "@/components/student/result-detail";

export default async function ResultDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ResultDetailClient id={id} />;
}
