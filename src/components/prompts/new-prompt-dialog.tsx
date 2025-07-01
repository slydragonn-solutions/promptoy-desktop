import { useState, useEffect } from "react";
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
import { ReactNode } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Step 1: Choose creation method
type CreationMethod = 'blank' | 'template' | null;

// Step 2: Template selection
type TemplateSelection = {
  templateId: string | null;
  variables: Record<string, string>;
};

// Form schemas
const nameFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name is too long"),
});

const variableFormSchema = z.record(z.string().min(1, "This field is required"));

type NameFormData = z.infer<typeof nameFormSchema>;
type VariableFormData = z.infer<typeof variableFormSchema>;

interface NewPromptDialogProps {
  onPromptCreated?: () => void;
  children: ReactNode;
}

// Extract variables from template content
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

export function NewPromptDialog({ onPromptCreated, children }: NewPromptDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [creationMethod, setCreationMethod] = useState<CreationMethod>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateSelection>({ 
    templateId: null, 
    variables: {} 
  });
  const [templates, setTemplates] = useState<Array<{
    id: string;
    name: string;
    content: string;
    variables: string[];
  }>>([]);

  const { addPrompt, prompts } = promptsStore();
  
  // Name form for the final step
  const nameForm = useForm<NameFormData>({
    resolver: zodResolver(nameFormSchema),
    defaultValues: { name: "" },
  });

  // Variable form for template variables
  const variableForm = useForm<VariableFormData>();

  // Load templates when dialog opens
  useEffect(() => {
    if (open) {
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
    } else {
      // Reset state when dialog closes
      setStep(1);
      setCreationMethod(null);
      setSelectedTemplate({ templateId: null, variables: {} });
      nameForm.reset();
      variableForm.reset();
    }
  }, [open, prompts]);

  // Handle variable form submission
  const onVariableSubmit = async (data: VariableFormData) => {
    try {
      // Get the template data
      const template = templates.find(t => t.id === selectedTemplate.templateId);
      if (!template) throw new Error('Template not found');
      
      // Get the name from the form
      const name = nameForm.getValues('name');
      
      // Replace variables in the template content
      let content = template.content;
      Object.entries(data).forEach(([key, value]) => {
        content = content.replace(new RegExp(`\\{\\{${key}\\}}`, 'g'), value);
      });
      
      // Create the new prompt
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
      };
      
      const success = await addPrompt(newPrompt);
      
      if (success) {
        toast.success(`Prompt "${name}" created successfully`);
        onPromptCreated?.();
        setOpen(false);
        // Reset forms
        nameForm.reset();
        variableForm.reset();
        setSelectedTemplate({ templateId: null, variables: {} });
      } else {
        throw new Error("Failed to create prompt");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create prompt';
      toast.error(errorMessage);
      console.error("Error creating prompt:", error);
    }
  };



  // Handle blank prompt creation
  const handleCreateBlankPrompt = async (data: NameFormData) => {
    try {
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
      };
      
      const success = await addPrompt(newPrompt);
      
      if (success) {
        toast.success(`Blank prompt "${data.name}" created successfully`);
        onPromptCreated?.();
        setOpen(false);
        nameForm.reset();
      } else {
        throw new Error("Failed to create prompt");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create prompt';
      toast.error(errorMessage);
      console.error("Error creating prompt:", error);
    }
  };

  // Render step 1: Choose creation method
  const renderStep1 = () => (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle>Create New Prompt</DialogTitle>
        <DialogDescription>
          Choose how you'd like to create your new prompt.
        </DialogDescription>
      </DialogHeader>
      
      <div className="grid grid-cols-1 gap-4">
        <Card 
          className={`cursor-pointer transition-colors hover:bg-accent ${creationMethod === 'blank' ? 'border-primary' : ''}`}
          onClick={() => setCreationMethod('blank')}
        >
          <CardHeader>
            <CardTitle>Blank Prompt</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Start with an empty prompt and write your own content from scratch.
            </p>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer transition-colors hover:bg-accent ${creationMethod === 'template' ? 'border-primary' : ''}`}
          onClick={() => setCreationMethod('template')}
        >
          <CardHeader>
            <CardTitle>From Template</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Choose from existing templates with pre-defined variables.
            </p>
          </CardContent>
        </Card>
      </div>
      
      <DialogFooter>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => setOpen(false)}
        >
          Cancel
        </Button>
        <Button 
          type="button" 
          disabled={!creationMethod}
          onClick={() => {
            if (creationMethod === 'blank') {
              // For blank prompt, show the name input directly
              setStep(2);
            } else {
              // For template, go to template selection
              setStep(2);
            }
          }}
        >
          Continue
        </Button>
      </DialogFooter>
    </div>
  );

  // Handle template selection
  const handleTemplateClick = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;
    
    const initialValues = template.variables.reduce((acc, varName) => {
      acc[varName] = "";
      return acc;
    }, {} as Record<string, string>);
    
    // Set initial name based on template name
    nameForm.setValue('name', `Copy of ${template.name}`);
    
    setSelectedTemplate({
      templateId,
      variables: initialValues
    });
    
    variableForm.reset(initialValues);
  };

  // Render step 2: Template selection or blank prompt name
  const renderStep2 = () => {
    // If creating a blank prompt, show the name input
    if (creationMethod === 'blank') {
      return (
        <div className="space-y-6">
          <DialogHeader>
            <DialogTitle>Name Your Blank Prompt</DialogTitle>
            <DialogDescription>
              Enter a name for your new blank prompt.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...nameForm}>
            <form onSubmit={nameForm.handleSubmit(handleCreateBlankPrompt)} className="space-y-6">
              <FormField
                control={nameForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prompt Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="My Awesome Prompt"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setStep(1)}
                  disabled={nameForm.formState.isSubmitting}
                >
                  Back
                </Button>
                <Button 
                  type="submit"
                  disabled={nameForm.formState.isSubmitting}
                >
                  {nameForm.formState.isSubmitting ? 'Creating...' : 'Create Prompt'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      );
    }

    // If we get here, we're working with templates
    const selectedTemplateData = selectedTemplate.templateId
      ? templates.find(t => t.id === selectedTemplate.templateId)
      : null;

    if (!selectedTemplateData) {
      return (
        <div className="space-y-6">
          <DialogHeader>
            <DialogTitle>Select a Template</DialogTitle>
            <DialogDescription>
              Choose a template to use as a starting point for your prompt.
            </DialogDescription>
          </DialogHeader>
          
          {templates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No templates found. Create some prompts with variables first.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setStep(1)}
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
                    onClick={() => handleTemplateClick(template.id)}
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
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setStep(1)}
            >
              Back
            </Button>
          </DialogFooter>
        </div>
      );
    }

    // Show template content and variables side by side
    return (
      <div className="space-y-6">
        <DialogHeader>
          <DialogTitle>Customize Template</DialogTitle>
          <DialogDescription>
            Fill in the variables for your template
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left side: Template content */}
          <div className="space-y-4">
            <h3 className="font-medium">Template Preview</h3>
            <div className="p-4 border rounded-md bg-muted/20 h-[200px] overflow-auto">
              <pre className="whitespace-pre-wrap text-sm">
                {selectedTemplateData.content}
              </pre>
            </div>
          </div>
          
          {/* Right side: Variables form */}
          <div className="space-y-4">
            <h3 className="font-medium">Template Variables</h3>
            <Form {...variableForm}>
              <form className="space-y-4">
                <FormField
                  control={nameForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prompt Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter prompt name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {selectedTemplateData.variables.map((variable) => (
                  <FormField
                    key={variable}
                    control={variableForm.control}
                    name={variable}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{variable}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={`Enter ${variable}`}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </form>
            </Form>
          </div>
        </div>
        <DialogFooter className="pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => {
              setSelectedTemplate({ templateId: null, variables: {} });
              variableForm.reset();
            }}
          >
            Back to Templates
          </Button>
          <Button 
            type="submit"
            disabled={variableForm.formState.isSubmitting}
            onClick={variableForm.handleSubmit(onVariableSubmit)}
          >
            {variableForm.formState.isSubmitting ? 'Creating...' : 'Create Prompt'}
          </Button>
        </DialogFooter>
      </div>
    );
  };



  // Main render function
  const renderContent = () => {
    if (step === 1) return renderStep1();
    if (step === 2) return renderStep2();
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="w-[800px]">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
