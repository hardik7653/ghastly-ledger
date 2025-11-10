import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUpload } from "@/components/ImageUpload";
import { FileText, Target } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const New = () => {
  const navigate = useNavigate();
  const [caseForm, setCaseForm] = useState({
    title: "",
    description: "",
    mistakes: "",
    images: [] as File[],
  });
  const [targetForm, setTargetForm] = useState({
    title: "",
    description: "",
    plan: "",
    images: [] as File[],
  });
  const [loading, setLoading] = useState(false);

  const handleCaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseForm.title.trim() || !caseForm.description.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Title and description are required",
      });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("title", caseForm.title);
    formData.append("description", caseForm.description);
    formData.append("mistakes", caseForm.mistakes);
    caseForm.images.forEach((file) => formData.append("images", file));

    try {
      const token = sessionStorage.getItem("auth_token");
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/cases`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();
      if (data.ok) {
        toast({
          title: "Case Created",
          description: "New case added to archives",
        });
        navigate("/cases");
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create case",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTargetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetForm.title.trim() || !targetForm.description.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Title and description are required",
      });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("title", targetForm.title);
    formData.append("description", targetForm.description);
    formData.append("plan", targetForm.plan);
    targetForm.images.forEach((file) => formData.append("images", file));

    try {
      const token = sessionStorage.getItem("auth_token");
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/targets`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();
      if (data.ok) {
        toast({
          title: "Target Created",
          description: "New target added to archives",
        });
        navigate("/targets");
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create target",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-heading mb-6">Create New Entry</h1>

        <Tabs defaultValue="case" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="case" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>New Case</span>
            </TabsTrigger>
            <TabsTrigger value="target" className="flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>New Target</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="case">
            <Card className="horror-border bg-card/50">
              <CardHeader>
                <CardTitle className="font-heading">Add New Case</CardTitle>
                <CardDescription>
                  Document a new investigation case with evidence and mistakes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCaseSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="case-title">Case Title *</Label>
                    <Input
                      id="case-title"
                      placeholder="Enter case title..."
                      value={caseForm.title}
                      onChange={(e) =>
                        setCaseForm({ ...caseForm, title: e.target.value })
                      }
                      className="bg-background border-accent/30"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="case-description">Description *</Label>
                    <Textarea
                      id="case-description"
                      placeholder="Detailed case description..."
                      value={caseForm.description}
                      onChange={(e) =>
                        setCaseForm({ ...caseForm, description: e.target.value })
                      }
                      className="min-h-32 bg-background border-accent/30"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="case-mistakes">Mistakes & Lessons</Label>
                    <Textarea
                      id="case-mistakes"
                      placeholder="Document mistakes and lessons learned..."
                      value={caseForm.mistakes}
                      onChange={(e) =>
                        setCaseForm({ ...caseForm, mistakes: e.target.value })
                      }
                      className="min-h-24 bg-background border-accent/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Evidence Images (Optional, max 6)</Label>
                    <ImageUpload
                      onChange={(files) =>
                        setCaseForm({ ...caseForm, images: files })
                      }
                      maxFiles={6}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full horror-glow"
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "Create Case"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="target">
            <Card className="horror-border bg-card/50">
              <CardHeader>
                <CardTitle className="font-heading">Add New Target</CardTitle>
                <CardDescription>
                  Create a target profile with description and operation plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTargetSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="target-title">Target Name *</Label>
                    <Input
                      id="target-title"
                      placeholder="Enter target name..."
                      value={targetForm.title}
                      onChange={(e) =>
                        setTargetForm({ ...targetForm, title: e.target.value })
                      }
                      className="bg-background border-accent/30"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="target-description">Description *</Label>
                    <Textarea
                      id="target-description"
                      placeholder="Detailed target description..."
                      value={targetForm.description}
                      onChange={(e) =>
                        setTargetForm({ ...targetForm, description: e.target.value })
                      }
                      className="min-h-32 bg-background border-accent/30"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="target-plan">Operation Plan</Label>
                    <Textarea
                      id="target-plan"
                      placeholder="Detailed operation plan and objectives..."
                      value={targetForm.plan}
                      onChange={(e) =>
                        setTargetForm({ ...targetForm, plan: e.target.value })
                      }
                      className="min-h-24 bg-background border-accent/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Target Images (Optional, max 6)</Label>
                    <ImageUpload
                      onChange={(files) =>
                        setTargetForm({ ...targetForm, images: files })
                      }
                      maxFiles={6}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full horror-glow"
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "Create Target"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default New;
