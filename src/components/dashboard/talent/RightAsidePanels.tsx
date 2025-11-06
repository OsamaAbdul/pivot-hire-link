import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RightAsidePanels() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Top Talents Leaderboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { name: "Sarah Chen", role: "AI & ML Specialist", pts: 1250 },
            { name: "Michael B.", role: "Fintech Innovator", pts: 1190 },
            { name: "Emily Rose", role: "UX/UI Designer", pts: 1080 },
            { name: "David Lee", role: "Blockchain Dev", pts: 995 },
          ].map((p, i) => (
            <div key={p.name} className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-muted/40 flex items-center justify-center text-xs font-semibold">
                {i + 1}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.role}</p>
              </div>
              <div className="text-sm font-semibold">{p.pts} pts</div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Your Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md bg-card border border-border p-3 text-center">
              <div className="text-sm text-muted-foreground">Your Rank</div>
              <div className="text-2xl font-bold">#17</div>
            </div>
            <div className="rounded-md bg-card border border-border p-3 text-center">
              <div className="text-sm text-muted-foreground">Challenges Done</div>
              <div className="text-2xl font-bold">3</div>
            </div>
            <div className="col-span-2 rounded-md bg-card border border-border p-3 text-center">
              <div className="text-sm text-muted-foreground">Total Points</div>
              <div className="text-2xl font-bold">780</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}