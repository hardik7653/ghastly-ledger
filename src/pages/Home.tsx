import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Target, PlusCircle, Clock } from "lucide-react";
import { Layout } from "@/components/Layout";

interface RecentItem {
  id: number;
  title: string;
  type: "case" | "target";
  created_at: string;
}

const Home = () => {
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const token = sessionStorage.getItem("auth_token");
        const headers = { Authorization: `Bearer ${token}` };

        const [casesRes, targetsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/cases`, { headers }),
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/targets`, { headers }),
        ]);

        const cases = await casesRes.json();
        const targets = await targetsRes.json();

        const combined: RecentItem[] = [
          ...(cases.ok ? cases.data.map((c: any) => ({ ...c, type: "case" as const })) : []),
          ...(targets.ok ? targets.data.map((t: any) => ({ ...t, type: "target" as const })) : []),
        ]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5);

        setRecentItems(combined);
      } catch (error) {
        console.error("Failed to fetch recent items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecent();
  }, []);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Hero section */}
        <div className="text-center space-y-4 py-12">
          <h1 className="text-5xl font-heading text-foreground mb-4">
            Case Study Archives
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A classified repository of investigative case studies and target profiles.
            All entries are encrypted and access-restricted.
          </p>
        </div>

        {/* Quick actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="horror-border bg-card/50 hover:bg-card transition-colors">
            <CardHeader>
              <FileText className="w-12 h-12 text-accent mb-4" />
              <CardTitle className="font-heading">Cases</CardTitle>
              <CardDescription>Browse investigation records</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/cases">
                <Button variant="outline" className="w-full border-accent/30 hover:border-accent">
                  View Cases
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="horror-border bg-card/50 hover:bg-card transition-colors">
            <CardHeader>
              <Target className="w-12 h-12 text-accent mb-4" />
              <CardTitle className="font-heading">Targets</CardTitle>
              <CardDescription>Access target profiles</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/targets">
                <Button variant="outline" className="w-full border-accent/30 hover:border-accent">
                  View Targets
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="horror-border bg-card/50 hover:bg-card transition-colors">
            <CardHeader>
              <PlusCircle className="w-12 h-12 text-accent mb-4" />
              <CardTitle className="font-heading">New Entry</CardTitle>
              <CardDescription>Add case or target</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/new">
                <Button className="w-full horror-glow">
                  Create New
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent activity */}
        {recentItems.length > 0 && (
          <Card className="horror-border bg-card/50">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-accent" />
                <CardTitle className="font-heading">Recent Activity</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentItems.map((item) => (
                  <Link
                    key={`${item.type}-${item.id}`}
                    to={`/${item.type}s`}
                    className="flex items-center justify-between p-3 rounded border border-border/30 hover:border-accent/50 hover:bg-background/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      {item.type === "case" ? (
                        <FileText className="w-4 h-4 text-accent" />
                      ) : (
                        <Target className="w-4 h-4 text-accent" />
                      )}
                      <span className="font-medium">{item.title}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Home;
