import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skull } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface PassphraseModalProps {
  open: boolean;
  onAuthenticated: (token: string) => void;
}

export const PassphraseModal = ({ open, onAuthenticated }: PassphraseModalProps) => {
  const [passphrase, setPassphrase] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passphrase }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        sessionStorage.setItem('auth_token', data.token);
        onAuthenticated(data.token);
        toast({
          title: "Access Granted",
          description: "Welcome to the archives...",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: data.message || "Invalid passphrase",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Unable to verify passphrase",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md horror-border bg-card [&>button]:hidden">
        <DialogHeader className="space-y-4">
          <div className="flex justify-center">
            <Skull className="w-16 h-16 text-accent animate-pulse" />
          </div>
          <DialogTitle className="text-2xl text-center font-heading">
            Restricted Access
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Enter passphrase to access classified archives
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <Input
            type="password"
            placeholder="Enter passphrase..."
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            className="text-center tracking-widest bg-background border-accent/30 focus:border-accent"
            autoFocus
            aria-label="Passphrase input"
          />
          <Button
            type="submit"
            className="w-full horror-glow hover:horror-glow"
            disabled={loading || !passphrase}
          >
            {loading ? "Verifying..." : "Enter Archives"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
