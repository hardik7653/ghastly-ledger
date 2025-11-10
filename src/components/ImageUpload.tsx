import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface ImagePreview {
  file: File;
  url: string;
}

interface ImageUploadProps {
  onChange: (files: File[]) => void;
  maxFiles?: number;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const ImageUpload = ({ onChange, maxFiles = 6 }: ImageUploadProps) => {
  const [previews, setPreviews] = useState<ImagePreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: `${file.name} is not a supported image format (JPEG, PNG, WEBP only)`,
      });
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: `${file.name} exceeds 5MB limit`,
      });
      return false;
    }

    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (previews.length + files.length > maxFiles) {
      toast({
        variant: "destructive",
        title: "Too many files",
        description: `Maximum ${maxFiles} images allowed`,
      });
      return;
    }

    const validFiles = files.filter(validateFile);
    
    const newPreviews = validFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    const updatedPreviews = [...previews, ...newPreviews];
    setPreviews(updatedPreviews);
    onChange(updatedPreviews.map((p) => p.file));

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removePreview = (index: number) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
    onChange(newPreviews.map((p) => p.file));
    
    // Revoke object URL to free memory
    URL.revokeObjectURL(previews[index].url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor="image-upload"
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-accent/30 rounded cursor-pointer hover:border-accent/50 transition-colors bg-background/50"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 mb-2 text-accent" />
            <p className="mb-2 text-sm text-foreground">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">
              PNG, JPG, WEBP (MAX. 5MB, up to {maxFiles} files)
            </p>
          </div>
          <input
            id="image-upload"
            ref={fileInputRef}
            type="file"
            className="hidden"
            multiple
            accept={ALLOWED_TYPES.join(",")}
            onChange={handleFileChange}
            aria-label="Upload images"
          />
        </label>
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {previews.map((preview, index) => (
            <div
              key={preview.url}
              className="relative group aspect-square rounded overflow-hidden horror-border"
            >
              <img
                src={preview.url}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => removePreview(index)}
                  className="horror-glow"
                  aria-label={`Remove image ${index + 1}`}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1">
                <p className="text-xs text-foreground truncate">
                  {preview.file.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
