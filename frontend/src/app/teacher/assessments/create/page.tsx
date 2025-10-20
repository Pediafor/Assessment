"use client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api";

const schema = z.object({
  title: z.string().min(3, "Title is too short"),
  subject: z.string().min(2, "Subject is too short"),
  description: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function CreateAssessmentPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { title: "", subject: "", description: "" } });

  return (
    <div role="main" aria-label="Create assessment" className="max-w-2xl space-y-4">
      <h2 className="text-xl font-semibold">Create Assessment</h2>
      <Card>
        <CardHeader className="text-base font-medium">Basic info</CardHeader>
        <CardContent>
          <form
            className="grid gap-3"
            onSubmit={form.handleSubmit(async (vals) => {
              try {
                await api.post('/assessments', vals);
                success('Assessment created');
                router.push('/teacher/assessments');
              } catch {
                error('Failed to create assessment');
              }
            })}
          >
            <label className="block text-sm">
              <span className="mb-1 block">Title</span>
              <Input {...form.register('title')} placeholder="e.g., Algebra Midterm" />
              {form.formState.errors.title ? <div className="text-xs text-red-600 mt-1">{form.formState.errors.title.message}</div> : null}
            </label>
            <label className="block text-sm">
              <span className="mb-1 block">Subject</span>
              <Input {...form.register('subject')} placeholder="e.g., Mathematics" />
              {form.formState.errors.subject ? <div className="text-xs text-red-600 mt-1">{form.formState.errors.subject.message}</div> : null}
            </label>
            <label className="block text-sm">
              <span className="mb-1 block">Description</span>
              <Input {...form.register('description')} placeholder="Short description (optional)" />
            </label>
            <div className="pt-2">
              <Button type="submit">Create</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
