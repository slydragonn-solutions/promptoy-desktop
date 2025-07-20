import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { promptsStore } from "@/store/prompts-store";

const nameFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name is too long"),
});

type NameFormData = z.infer<typeof nameFormSchema>;

interface BlankPromptFormProps {
  onSuccess: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (isSubmitting: boolean) => void;
}

export function BlankPromptForm({ onSuccess, onBack, isSubmitting, setIsSubmitting }: BlankPromptFormProps) {
  const { addPrompt } = promptsStore();

  const form = useForm<NameFormData>({
    resolver: zodResolver(nameFormSchema),
    defaultValues: { name: "" },
  });

  const handleSubmit = async (data: NameFormData) => {
    try {
      setIsSubmitting(true);
      const newPrompt = {
        name: data.name,
        versions: [{
          date: new Date().toISOString(),
          name: data.name,
          content: ''
        }],
        notes: [],
        chatHistory: [],
        tags: [],
        isFavorite: false,
        group: undefined,
      };
      
      const success = await addPrompt(newPrompt);
      
      if (success) {
        toast.success(`Blank prompt "${data.name}" created successfully`);
        onSuccess();
      } else {
        throw new Error("Failed to create prompt");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create prompt';
      toast.error(errorMessage);
      console.error("Error creating prompt:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="p-4 space-y-4">
          <h3 className="text-lg font-medium">New Blank Prompt</h3>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input 
                    placeholder="Enter a name for your prompt"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onBack}
              disabled={isSubmitting}
            >
              Back
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
              variant="default"
              className="bg-indigo-400 hover:bg-indigo-500"
            >
              {isSubmitting ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </Form>
  );
}
