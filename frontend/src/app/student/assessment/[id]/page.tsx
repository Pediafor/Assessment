import { AssessmentPlayer } from "../../../../components/assessment/assessment-player";

export default async function AssessmentPlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AssessmentPlayer id={id} />;
}
