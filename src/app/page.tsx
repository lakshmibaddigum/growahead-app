import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Grow AHead</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Welcome to your financial future!</p>
          <Button>Calculate Projection</Button>
        </CardContent>
      </Card>
    </div>
  );
}