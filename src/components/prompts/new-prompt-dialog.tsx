import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ReactNode } from "react";
import { BlankPromptForm } from "./blank-prompt-form";
import { TemplatePromptForm } from "./template-prompt-form";

interface NewPromptDialogProps {
  onPromptCreated?: () => void;
  children: ReactNode;
  promptType: 'blank' | 'template';
}

export function NewPromptDialog({ onPromptCreated, children, promptType }: NewPromptDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
      }}
    >
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]" onInteractOutside={(e) => e.preventDefault()}>
        {promptType === 'blank' ? (
          <BlankPromptForm 
            onSuccess={() => {
              setOpen(false);
              onPromptCreated?.();
            }}
            onBack={() => setOpen(false)}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
          />
        ) : (
          <TemplatePromptForm 
            onSuccess={() => {
              setOpen(false);
              onPromptCreated?.();
            }}
            onBack={() => setOpen(false)}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
