import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface Image {
  id: number;
  url: string;
  thumbnailUrl: string;
  original_name: string;
}

interface ImageGalleryModalProps {
  images: Image[];
  open: boolean;
  onClose: () => void;
}

export const ImageGalleryModal = ({ images, open, onClose }: ImageGalleryModalProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (images.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 bg-black border-accent">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70"
            onClick={onClose}
            aria-label="Close gallery"
          >
            <X className="w-6 h-6" />
          </Button>

          <img
            src={images[currentIndex].url}
            alt={images[currentIndex].original_name}
            className="w-full h-[70vh] object-contain"
          />

          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70"
                onClick={handlePrevious}
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70"
                onClick={handleNext}
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>

              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? "bg-accent w-8"
                        : "bg-muted-foreground hover:bg-accent/70"
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <p className="text-sm text-foreground text-center">
              {images[currentIndex].original_name} ({currentIndex + 1} / {images.length})
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
