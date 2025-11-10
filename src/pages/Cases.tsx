import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Search, Image as ImageIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ImageGalleryModal } from "@/components/ImageGalleryModal";

interface CaseImage {
  id: number;
  url: string;
  thumbnailUrl: string;
  original_name: string;
}

interface Case {
  id: number;
  title: string;
  description: string;
  mistakes: string;
  created_at: string;
  images: CaseImage[];
}

const Cases = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [filteredCases, setFilteredCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImages, setSelectedImages] = useState<CaseImage[]>([]);
  const [galleryOpen, setGalleryOpen] = useState(false);

  const fetchCases = async () => {
    try {
      const token = sessionStorage.getItem("auth_token");
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/cases`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.ok) {
        setCases(data.data);
        setFilteredCases(data.data);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load cases",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      setFilteredCases(
        cases.filter((c) =>
          c.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredCases(cases);
    }
  }, [searchQuery, cases]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this case?")) return;

    try {
      const token = sessionStorage.getItem("auth_token");
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/cases/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.ok) {
        setCases((prev) => prev.filter((c) => c.id !== id));
        toast({
          title: "Case Deleted",
          description: "Case removed from archives",
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete case",
      });
    }
  };

  const openGallery = (images: CaseImage[]) => {
    setSelectedImages(images);
    setGalleryOpen(true);
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading cases...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-heading">Case Files</h1>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search cases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background border-accent/30"
            />
          </div>
        </div>

        {filteredCases.length === 0 ? (
          <Card className="horror-border bg-card/50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ImageIcon className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? "No cases found matching your search" : "No cases in the archives yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCases.map((caseItem) => (
              <Card key={caseItem.id} className="horror-border bg-card/50 hover:bg-card transition-colors">
                <CardHeader>
                  <CardTitle className="font-heading flex items-center justify-between">
                    <span className="truncate">{caseItem.title}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(caseItem.id)}
                      className="hover:text-destructive"
                      aria-label="Delete case"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    {new Date(caseItem.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-foreground line-clamp-3">
                    {caseItem.description}
                  </p>
                  {caseItem.mistakes && (
                    <div className="p-2 bg-destructive/10 border border-destructive/30 rounded">
                      <p className="text-xs text-destructive font-medium">Mistakes:</p>
                      <p className="text-xs text-foreground line-clamp-2">
                        {caseItem.mistakes}
                      </p>
                    </div>
                  )}
                  {caseItem.images.length > 0 && (
                    <div>
                      <button
                        onClick={() => openGallery(caseItem.images)}
                        className="grid grid-cols-3 gap-2 w-full"
                      >
                        {caseItem.images.slice(0, 3).map((img) => (
                          <img
                            key={img.id}
                            src={img.thumbnailUrl}
                            alt={img.original_name}
                            className="w-full h-20 object-cover rounded horror-border hover:opacity-80 transition-opacity"
                          />
                        ))}
                      </button>
                      {caseItem.images.length > 3 && (
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                          +{caseItem.images.length - 3} more
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

export default Cases;
