import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { FilePenIcon } from 'lucide-react';
import { Prompt } from '@/store/prompts-store';
import { createPrompt } from '@/lib/fs';
import { promptsStore } from '@/store/prompts-store';

export default function CreatePromptDialog() {
    const { addPrompts } = promptsStore();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedOption, setSelectedOption] = useState('');
  const [formData, setFormData] = useState({});

  const handleCreatePrompt = () => {
    const newPrompt: Prompt = {
      id: crypto.randomUUID(),
      name: formData.promptName,
      content: [
        {
            date: new Date().toISOString(),
            content: "",
        }
      ],
      notes: [],
      chatHistory: [],
      isFavorite: false,
      isSynced: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    createPrompt(newPrompt);
    addPrompts([newPrompt]);
    
    setIsOpen(false);
    resetDialog();
  }  

  const options = [
    { id: 'blank', label: 'Blank Prompt', description: 'Blank' },
    { id: 'layout', label: 'Layout Prompt', description: 'Layout' },
    { id: 'template', label: 'Template Prompt', description: 'Template' },
    { id: 'human-lang', label: 'Human Language Prompt', description: 'Human Language' },
  ];

  const handleNext = () => {
    if (step === 1 && selectedOption) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handleBack = () => {
    if (step === 4) {   
      setStep(3);
    } else if (step === 3) {
      setStep(2);
    } else if (step === 2) {
      setStep(1);
    }
  };

  const handleSubmit = () => {
    handleCreatePrompt();
    setIsOpen(false);
    resetDialog();
  };

  const resetDialog = () => {
    setStep(1);
    setSelectedOption('');
    setFormData({});
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderStepOne = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <p className="text-sm text-gray-600">Select the type of prompt you want to create</p>
      </div>
      
      <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
        {options.map((option) => (
          <div key={option.id} className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
            <RadioGroupItem value={option.id} id={option.id} />
            <div className="flex-1">
              <Label htmlFor={option.id} className="font-medium cursor-pointer">
                {option.label}
              </Label>
              <p className="text-sm text-gray-500 mt-1">{option.description}</p>
            </div>
          </div>
        ))}
      </RadioGroup>
    </div>
  );

  const renderBlankPrompt = () => (
          <Input
            id="promptName"
            placeholder="Enter the name of the prompt"
            value={formData.promptName || ''}
            onChange={(e) => handleInputChange('promptName', e.target.value)}
          />
  );

  const renderLayoutPrompt = () => (
    <div className="space-y-4">
     
        <Input
          id="promptName"
          placeholder="Enter the name of the prompt"
          value={formData.promptName || ''}
          onChange={(e) => handleInputChange('promptName', e.target.value)}
        />
     
        <select
          id="layout"
          className="w-full p-2 border rounded-md"
          value={formData.layout || ''}
          onChange={(e) => handleInputChange('layout', e.target.value)}
        >
          <option value="">Select a layout</option>
          <option value="technical">Problema Técnico</option>
          <option value="billing">Facturación</option>
          <option value="account">Cuenta</option>
          <option value="other">Otro</option>
        </select>
    </div>
  );

  const renderTemplatePrompt = () => (
    <div className="space-y-4">
     
        <Input
          id="promptName"
          placeholder="Enter the name of the prompt"
          value={formData.promptName || ''}
          onChange={(e) => handleInputChange('promptName', e.target.value)}
        />
     
        <select
          id="template"
          className="w-full p-2 border rounded-md"
          value={formData.template || ''}
          onChange={(e) => handleInputChange('template', e.target.value)}
        >
          <option value="">Select a template</option>
          <option value="technical">Problema Técnico</option>
          <option value="billing">Facturación</option>
          <option value="account">Cuenta</option>
          <option value="other">Otro</option>
        </select>
    </div>
  );

  const renderHumanLangPrompt = () => (
    <div className="space-y-4">
     
        <Input
          id="promptName"
          placeholder="Enter the name of the prompt"
          value={formData.promptName || ''}
          onChange={(e) => handleInputChange('promptName', e.target.value)}
        />
   
        <Textarea
          id="promptDescription"
          placeholder="Enter the description of the prompt"
          rows={4}
          value={formData.promptDescription || ''}
          onChange={(e) => handleInputChange('promptDescription', e.target.value)}
        />
    </div>
  );

  const renderStepTwo = () => {
  switch (selectedOption) {
      case 'blank':
        return renderBlankPrompt();
      case 'layout':
        return renderLayoutPrompt();
      case 'template':
        return renderTemplatePrompt();
      case 'human-lang':
        return renderHumanLangPrompt();
      default:
        return null;
    }
  };

  return (
      <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) resetDialog();
      }}>
        <DialogTrigger>
            <Button variant="secondary"><FilePenIcon /></Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {step === 1 ? 'Select a prompt type' : `${options.find(opt => opt.id === selectedOption)?.label}`}
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            {step === 1 ? renderStepOne() : renderStepTwo()}
          </div>

          <DialogFooter className="flex justify-between">
            <div className="flex gap-2 w-full">
              {step === 2 && (
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
              )}
              <div className="flex-1" />
              {step === 1 ? (
                <Button 
                  onClick={handleNext} 
                  disabled={!selectedOption}
                >
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit}>
                  Create
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  );
}