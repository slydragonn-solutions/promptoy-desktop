import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { promptsStore } from "@/store/prompts-store";

// Base schema for the form
const baseFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name is too long"),
});

type BaseFormData = z.infer<typeof baseFormSchema>;

interface TemplatePromptFormProps {
  onSuccess: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (isSubmitting: boolean) => void;
}

interface Template {
  id: string;
  name: string;
  content: string;
  variables: string[];
}

const extractVariables = (content: string): string[] => {
  const variableRegex = /\{\{([^}]+)\}\}/g;
  const matches: string[] = [];
  let match;
  while ((match = variableRegex.exec(content)) !== null) {
    const varName = match[1].trim();
    if (varName && !matches.includes(varName)) {
      matches.push(varName);
    }
  }
  return matches;
};

export function TemplatePromptForm({ onSuccess, onBack, isSubmitting, setIsSubmitting }: TemplatePromptFormProps) {
  const { prompts, addPrompt } = promptsStore();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  // Create a dynamic form schema based on the selected template
  const getFormSchema = () => {
    if (!selectedTemplate) return baseFormSchema;
    
    const variableFields = selectedTemplate.variables.reduce((acc, varName) => {
      acc[varName] = z.string().min(1, `${varName} is required`);
      return acc;
    }, {} as Record<string, z.ZodString>);
    
    return baseFormSchema.extend(variableFields);
  };

  type FormData = z.infer<ReturnType<typeof getFormSchema>>;

  const form = useForm<FormData>();
  
  // Update form schema when template changes
  useEffect(() => {
    if (selectedTemplate) {
      form.reset({
        name: `Copy of ${selectedTemplate.name}`,
        ...selectedTemplate.variables.reduce((acc, varName) => {
          acc[varName] = "";
          return acc;
        }, {} as Record<string, string>)
      });
    }
  }, [selectedTemplate, form]);

  useEffect(() => {
    const availableTemplates = prompts
      .filter(prompt => 
        prompt.versions.length > 0 && 
        prompt.versions[0].content.includes('{{') &&
        prompt.versions[0].content.includes('}}')
      )
      .map(prompt => ({
        id: prompt.id,
        name: prompt.name,
        content: prompt.versions[0].content,
        variables: extractVariables(prompt.versions[0].content)
      }));
    
    setTemplates(availableTemplates);
  }, [prompts]);

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    
    const initialValues: Record<string, any> = { name: `Copy of ${template.name}` };
    template.variables.forEach(varName => {
      initialValues[varName] = "";
    });
    
    form.reset(initialValues);
  };



  if (!selectedTemplate) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Select a Template</h3>
          <p className="text-sm text-muted-foreground">
            Choose a template to use as a starting point for your prompt.
          </p>
        </div>
        
        {templates.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No templates found. Create some prompts with variables first.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={onBack}
            >
              Back
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {templates.map((template) => (
                <Card 
                  key={template.id}
                  className="cursor-pointer transition-colors hover:bg-accent"
                  onClick={() => handleTemplateSelect(template)}
                >
                  <CardHeader>
                    <CardTitle>{template.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {template.content.replace(/\{\{[^}]*\}\}/g, '[variable]')}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {template.variables.map((variable) => (
                        <span key={variable} className="text-xs bg-muted rounded px-2 py-1">
                          {variable}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    );
  }

  const handleSubmit = async (data: any) => {
    if (!selectedTemplate) return;
    
    const { name, ...variables } = data as BaseFormData & Record<string, string>;
    
    try {
      setIsSubmitting(true);
      
      // Replace variables in the template content
      let content = selectedTemplate.content;
      Object.entries(variables).forEach(([key, value]) => {
        content = content.replace(new RegExp(`\\{\\{${key}\\}}`, 'g'), String(value));
      });
      
      const newPrompt = {
        name,
        versions: [{
          date: new Date().toISOString(),
          name,
          content
        }],
        notes: [],
        chatHistory: [],
        tags: [],
        isFavorite: false,
        group: undefined,
      };
      
      const success = await addPrompt(newPrompt);
      
      if (success) {
        toast.success(`Prompt "${name}" created successfully`);
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
    <div className="space-y-6">
      <div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-4 -ml-2"
          onClick={() => setSelectedTemplate(null)}
          disabled={isSubmitting}
          type="button"
        >
          ← Back to templates
        </Button>
        
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Configure Template</h3>
          <p className="text-sm text-muted-foreground">
            Fill in the variables for the "{selectedTemplate.name}" template.
          </p>
        </div>
      </div>
      
      <Form {...form}>
        <form 
          onSubmit={form.handleSubmit(handleSubmit as any)} 
          className="space-y-6"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prompt Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="My Awesome Prompt"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Template Variables</h4>
            {selectedTemplate.variables.map((variable) => (
              <FormField
                key={variable}
                control={form.control}
                name={variable}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{variable}</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={`Enter ${variable}`}
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setSelectedTemplate(null)}
              disabled={isSubmitting}
            >
              Back
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Prompt'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
