import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ResetPasswordPage() {
  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <h1 className="text-xl font-semibold">Reset password</h1>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <Input type="password" placeholder="New password" />
            <Input type="password" placeholder="Confirm password" />
            <Button className="w-full">Update password</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
