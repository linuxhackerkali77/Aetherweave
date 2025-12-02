'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { translateText, TranslateTextInput } from '@/ai/flows/translate-text-flow';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const languages = [
  { value: 'English', label: 'English' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'French', label: 'French' },
  { value: 'German', label: 'German' },
  { value: 'Japanese', label: 'Japanese' },
  { value: 'Chinese', label: 'Chinese' },
  { value: 'Russian', label: 'Russian' },
  { value: 'Korean', label: 'Korean' },
];

export default function TranslatorTool() {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('Spanish');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      toast({
        variant: 'destructive',
        title: 'Input is empty',
        description: 'Please enter text to translate.',
      });
      return;
    }
    setIsLoading(true);
    setTranslatedText('');

    try {
      const input: TranslateTextInput = {
        text: inputText,
        targetLanguage,
      };
      const result = await translateText(input);
      setTranslatedText(result.translatedText);
    } catch (error) {
      console.error('Translation failed:', error);
      toast({
        variant: 'destructive',
        title: 'Translation Failed',
        description: 'Could not translate text. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full border rounded-lg bg-background/30 p-4 gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-muted-foreground">Source Text</label>
          <Textarea
            placeholder="Enter text to translate..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 resize-none bg-input text-base"
            disabled={isLoading}
          />
        </div>
        <div className="flex flex-col gap-2">
           <label className="text-sm font-medium text-muted-foreground">Translated Text</label>
          <Textarea
            placeholder="Translation will appear here..."
            value={translatedText}
            readOnly
            className="flex-1 resize-none bg-muted/50 border-border text-base"
          />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className='flex items-center gap-2 w-full sm:w-auto'>
            <span className="text-sm font-medium">Translate to:</span>
            <Select onValueChange={setTargetLanguage} defaultValue={targetLanguage} disabled={isLoading}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                    {languages.map(lang => (
                        <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
        <Button onClick={handleTranslate} disabled={isLoading} className="w-full sm:w-auto cyber-button h-12 text-lg flex-1">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Translating...
            </>
          ) : (
            <>
              Translate <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
