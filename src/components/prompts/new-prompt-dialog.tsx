import { useState, useEffect } from "react";
import { ReactNode } from "react";
import { BlankPromptForm } from "./blank-prompt-form";
import { TemplatePromptForm } from "./template-prompt-form";
import { X } from "lucide-react";

interface NewPromptDialogProps {
  onPromptCreated?: () => void;
  children: ReactNode;
  promptType: 'blank' | 'template';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function NewPromptDialog({ 
  onPromptCreated, 
  children, 
  promptType, 
  open: externalOpen,
  onOpenChange
}: NewPromptDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Use external open state if provided, otherwise use internal state
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  // Close on Escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  // Don't render anything if not open
  if (!open) {
    return (
      <div onClick={() => setOpen(true)}>
        {children}
      </div>
    );
  }

  return (
    <>
      <div 
        className="fixed inset-0 bg-background z-50 overflow-auto"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(false);
        }}
      >
        <div 
          className="min-h-screen w-full flex items-center justify-center p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </button>
          <div className="bg-background rounded-lg w-full max-w-[1200px] max-h-[90vh] overflow-y-auto relative">
            <div className="p-6">
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
