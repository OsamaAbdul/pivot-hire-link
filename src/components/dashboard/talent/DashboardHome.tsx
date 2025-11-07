import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

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

      {/* Mentorship feature banner */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-lg font-semibold">New Mentorship Matching Feature Live!</p>
              <p className="text-muted-foreground mt-1">
                We’ve just launched a new feature to help you find your perfect mentor.
                Check it out now!
              </p>
            </div>
            <Button className="gap-2" variant="default">
              Learn More
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Ongoing challenges */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Ongoing Challenges</h2>
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