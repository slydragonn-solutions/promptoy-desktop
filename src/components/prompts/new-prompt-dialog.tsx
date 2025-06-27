import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { promptsStore } from "@/store/prompts-store";
import { PromptMetadata } from "@/types/prompts";
import { ReactNode } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name is too long"),
});

type NewPromptFormData = z.infer<typeof formSchema>;

interface NewPromptDialogProps {
  onPromptCreated?: () => void;
  children: ReactNode;
}

export function NewPromptDialog({ onPromptCreated, children }: NewPromptDialogProps) {
  const [open, setOpen] = useState(false);
  const { addPrompt } = promptsStore();
  
  const form = useForm<NewPromptFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (data: NewPromptFormData) => {
    try {
      const newPrompt = {
        name: data.name,
        versions: [{
          date: new Date().toISOString(),
          name: data.name,
          content: "" // Start with empty content
        }],
        notes: [],
        chatHistory: [],
        tags: [],
        isFavorite: false,
        metadata: { type: 'blank' } as PromptMetadata
      };
      
      const success = await addPrompt(newPrompt);
      
      if (success) {
        toast.success(`Prompt "${data.name}" created successfully`);
        onPromptCreated?.();
        setOpen(false);
        form.reset();
      } else {
        throw new Error("Failed to create prompt");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create prompt';
      toast.error(errorMessage);
      console.error("Error creating prompt:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <DialogHeader>
              <DialogTitle>Create New Prompt</DialogTitle>
              <DialogDescription>
                Give your new prompt a name. You can edit it later.
              </DialogDescription>
            </DialogHeader>
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="My Awesome Prompt" 
                      {...field} 
                      disabled={form.formState.isSubmitting} 
                    />
                  </FormControl>
                  <FormDescription>
                    This will be the display name for your prompt
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Creating..." : "Create Prompt"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
