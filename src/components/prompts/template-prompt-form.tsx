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
      <div className="space-y-6 flex flex-col items-center justify-center text-center">
        <div className="space-y-2">
          <h3 className="text-lg font-bold">Select a Template</h3>
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
          <ScrollArea className="h-[450px] pr-4">
            <div className="space-y-2 text-start">
              {templates.map((template) => (
                <Card 
                  key={template.id}
                  className="cursor-pointer transition-colors hover:bg-accent w-full max-w-[600px]"
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

  // Generate preview content with current form values
  const getPreviewContent = () => {
    if (!selectedTemplate) return '';
    
    let content = selectedTemplate.content;
    const formValues = form.getValues();
    
    Object.entries(formValues).forEach(([key, value]) => {
      if (key !== 'name' && value) {
        content = content.replace(new RegExp(`\\{\\{${key}\\}}`, 'g'), String(value));
      } else if (key !== 'name') {
        // If the variable is empty, show it as [variable_name]
        content = content.replace(new RegExp(`\\{\\{${key}\\}}`, 'g'), `[${key}]`);
      }
    });
    
    return content;
  };

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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column - Form */}
      <div className="space-y-4">
        <div className="rounded-lg border bg-card p-4">
          <ScrollArea className="h-[500px] pr-4">            
            {selectedTemplate.variables.length > 0 && (
              <div className="mb-4 pb-4">
                <span className="text-sm">Preview</span>
                <div className="flex flex-wrap gap-2 mt-4 mb-2 border-b pb-2 w-full max-w-[500px]">
                  {selectedTemplate.variables.map((variable) => {
                    const value = form.watch(variable);
                    return (
                      <div 
                        key={variable} 
                        className={`text-xs px-2 py-1 rounded max-w-[100px] truncate ${
                          value ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                        }`}
                      >
                        {variable}: {value || 'Not set'}
                      </div>
                    );
                  })}
                  
                </div>
                <div className="prose dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap font-mono text-sm p-4 bg-neutral-100 rounded">
                    {getPreviewContent() || "Fill in the variables to see the preview..."}
                  </pre>
                </div>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          
          
          <div className="space-y-2">
            <h3 className="text-lg font-bold">Configure Template</h3>
            <p className="text-sm text-muted-foreground">
              Fill in the variables for the "{selectedTemplate.name}" template.
            </p>
          </div>
        </div>

        {/* Right Column - Preview */}
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
              <h4 className="text-sm font-medium">Template Variables ({selectedTemplate.variables.length})</h4>
              <ScrollArea className="h-[280px]">
                {selectedTemplate.variables.map((variable) => (
                  <FormField
                    key={variable}
                    control={form.control}
                    name={variable}
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel>{variable}</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={`Enter ${variable}`}
                            {...field}
                            disabled={isSubmitting}
                            onChange={(e) => {
                              field.onChange(e);
                              // Trigger preview update on input change
                              form.trigger(variable);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </ScrollArea>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setSelectedTemplate(null)}
                disabled={isSubmitting}
                className="rounded-xl"
              >
                ← Back to templates
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
                variant="default"
                className="bg-indigo-400 hover:bg-indigo-500 rounded-xl"
              >
                {isSubmitting ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
