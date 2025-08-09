import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, ChevronRight } from "lucide-react";

type FeatureItem = {
  title: string;
  description: string;
};

const features: FeatureItem[] = [
  {
    title: "Prompt Editor",
    description: "Create and edit your AI prompts with a clean, distraction-free interface.",
  },
  {
    title: "Templating",
    description: "Use variables in your prompts with double curly braces like {{variable}} for dynamic content.",
  },
  {
    title: "Version Control",
    description: "Track changes to your prompts with comprehensive version history.",
  },
  {
    title: "Version Comparison",
    description: "Easily compare different versions of your prompts side by side.",
  },
  {
    title: "Notes",
    description: "Add detailed notes to your prompts for context and instructions.",
  },
  {
    title: "Tags & Groups",
    description: "Organize your prompts with custom tags and group them for better management.",
  },
];

export function WelcomeDialog() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setIsOpen(true);
      localStorage.setItem('hasSeenWelcome', 'true');
    }
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="h-16 w-16 rounded-lg bg-primary/10 p-2 flex items-center justify-center">
              <img 
                src="/promptoy-logo-512.png" 
                alt="Promptoy Logo" 
                className="h-12 w-12 object-contain"
              />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl font-bold">Welcome to Promptoy! 🎉</DialogTitle>
          <DialogDescription className="text-center text-base">
            Your all-in-one solution for managing AI prompts. Here are the key features to help you get started:
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30">
              <div className="flex-shrink-0 mt-0.5">
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                  <Check className="h-3 w-3 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-medium">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <DialogFooter className="sm:justify-center">
          <Button 
            onClick={() => setIsOpen(false)}
            className="gap-2"
          >
            Get Started
            <ChevronRight className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
