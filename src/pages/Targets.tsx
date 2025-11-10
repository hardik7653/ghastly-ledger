import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Search, Image as ImageIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ImageGalleryModal } from "@/components/ImageGalleryModal";

interface TargetImage {
  id: number;
  url: string;
  thumbnailUrl: string;
  original_name: string;
}

interface Target {
  id: number;
  title: string;
  description: string;
  plan: string;
  created_at: string;
  images: TargetImage[];
}

const Targets = () => {
  const [targets, setTargets] = useState<Target[]>([]);
  const [filteredTargets, setFilteredTargets] = useState<Target[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImages, setSelectedImages] = useState<TargetImage[]>([]);
  const [galleryOpen, setGalleryOpen] = useState(false);

  const fetchTargets = async () => {
    try {
      const token = sessionStorage.getItem("auth_token");
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/targets`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.ok) {
        setTargets(data.data);
        setFilteredTargets(data.data);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load targets",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTargets();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      setFilteredTargets(
        targets.filter((t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredTargets(targets);
    }
  }, [searchQuery, targets]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this target?")) return;

    try {
      const token = sessionStorage.getItem("auth_token");
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/targets/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.ok) {
        setTargets((prev) => prev.filter((t) => t.id !== id));
        toast({
          title: "Target Deleted",
          description: "Target removed from archives",
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete target",
      });
    }
  };

  const openGallery = (images: TargetImage[]) => {
    setSelectedImages(images);
    setGalleryOpen(true);
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading targets...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-heading">Target Profiles</h1>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search targets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background border-accent/30"
            />
          </div>
        </div>

        {filteredTargets.length === 0 ? (
          <Card className="horror-border bg-card/50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ImageIcon className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? "No targets found matching your search" : "No targets in the archives yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTargets.map((target) => (
              <Card key={target.id} className="horror-border bg-card/50 hover:bg-card transition-colors">
                <CardHeader>
                  <CardTitle className="font-heading flex items-center justify-between">
                    <span className="truncate">{target.title}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(target.id)}
                      className="hover:text-destructive"
                      aria-label="Delete target"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    {new Date(target.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-foreground line-clamp-3">
                    {target.description}
                  </p>
                  {target.plan && (
                    <div className="p-2 bg-accent/10 border border-accent/30 rounded">
                      <p className="text-xs text-accent font-medium">Plan:</p>
                      <p className="text-xs text-foreground line-clamp-2">
                        {target.plan}
                      </p>
                    </div>
                  )}
                  {target.images.length > 0 && (
                    <div>
                      <button
                        onClick={() => openGallery(target.images)}
                        className="grid grid-cols-3 gap-2 w-full"
                      >
                        {target.images.slice(0, 3).map((img) => (
                          <img
                            key={img.id}
                            src={img.thumbnailUrl}
                            alt={img.original_name}
                            className="w-full h-20 object-cover rounded horror-border hover:opacity-80 transition-opacity"
                          />
                        ))}
                      </button>
                      {target.images.length > 3 && (
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                          +{target.images.length - 3} more
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ImageGalleryModal
        images={selectedImages}
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
      />
    </Layout>
  );
};

export default Targets;
