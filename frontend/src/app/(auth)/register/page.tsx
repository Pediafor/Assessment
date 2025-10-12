import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <h1 className="text-xl font-semibold">Create account</h1>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <Input placeholder="Name" />
            <Input type="email" placeholder="Email" />
            <Input type="password" placeholder="Password" />
            <Button type="submit" className="w-full">Sign up</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
