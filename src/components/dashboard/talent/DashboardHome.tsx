import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";


interface DashboardHomeProps {
  name?: string;
}

export default function DashboardHome({ name = "Alex" }: DashboardHomeProps) {
  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {name}!</h1>
      </div>

      {/* Mentorship banner removed per requirements */}

      {/* Ongoing jobs */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Ongoing Jobs</h2>
        <div className="space-y-3">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">AI-Powered SaaS Solution</p>
                <p className="text-muted-foreground text-sm">Develop a market-ready SaaS product using generative AI.</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">Deadline: 24 Dec 2023</div>
                <Button>View Details</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">Sustainable Tech Pitch</p>
                <p className="text-muted-foreground text-sm">Create a compelling pitch for a green technology startup.</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">Deadline: 15 Jan 2024</div>
                <Badge className="bg-secondary/60">In Progress</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}