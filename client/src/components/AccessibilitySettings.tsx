import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Eye, EyeOff, Volume2, Volume1, VolumeX, Languages, CheckCircle2, Save 
} from 'lucide-react';
import { Accessibility as Wheelchair } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Voter } from '@shared/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

interface AccessibilityData {
  id: number;
  voterId: number;
  visualAssistance: boolean;
  hearingAssistance: boolean;
  mobilityAssistance: boolean;
  languagePreference: string;
  otherNeeds: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const formSchema = z.object({
  visualAssistance: z.boolean().default(false),
  hearingAssistance: z.boolean().default(false),
  mobilityAssistance: z.boolean().default(false),
  languagePreference: z.string().default('english'),
  otherNeeds: z.string().optional(),
});

interface AccessibilitySettingsProps {
  voter: Voter;
  onSettingsSaved?: () => void;
}

export default function AccessibilitySettings({ voter, onSettingsSaved }: AccessibilitySettingsProps) {
  const [accessibilityData, setAccessibilityData] = useState<AccessibilityData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      visualAssistance: false,
      hearingAssistance: false,
      mobilityAssistance: false,
      languagePreference: 'english',
      otherNeeds: '',
    },
  });
  
  const fetchAccessibilityData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiRequest('GET', `/api/accessibility/voter/${voter.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setAccessibilityData(data);
        
        // Update form values
        form.reset({
          visualAssistance: data.visualAssistance,
          hearingAssistance: data.hearingAssistance,
          mobilityAssistance: data.mobilityAssistance,
          languagePreference: data.languagePreference,
          otherNeeds: data.otherNeeds || '',
        });
        
      } else if (response.status === 404) {
        // No accessibility preferences set yet
        setAccessibilityData(null);
        form.reset({
          visualAssistance: false,
          hearingAssistance: false,
          mobilityAssistance: false,
          languagePreference: 'english',
          otherNeeds: '',
        });
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error fetching accessibility preferences');
      }
    } catch (err) {
      setError('Network error: Unable to fetch accessibility preferences');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setSubmitLoading(true);
      setError(null);
      
      if (accessibilityData) {
        // Update existing preferences
        const response = await apiRequest('PUT', `/api/accessibility/${accessibilityData.id}`, values);
        
        if (response.ok) {
          const data = await response.json();
          setAccessibilityData(data);
          toast({
            title: 'Preferences Updated',
            description: 'Accessibility preferences have been updated.',
          });
          if (onSettingsSaved) onSettingsSaved();
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Error updating accessibility preferences');
        }
      } else {
        // Create new preferences
        const response = await apiRequest('POST', '/api/accessibility', {
          ...values,
          voterId: voter.id,
        });
        
        if (response.ok) {
          const data = await response.json();
          setAccessibilityData(data);
          toast({
            title: 'Preferences Saved',
            description: 'Accessibility preferences have been saved.',
          });
          if (onSettingsSaved) onSettingsSaved();
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Error saving accessibility preferences');
        }
      }
    } catch (err) {
      setError('Network error: Unable to save accessibility preferences');
      console.error(err);
    } finally {
      setSubmitLoading(false);
    }
  };
  
  useEffect(() => {
    if (voter.id) {
      fetchAccessibilityData();
    }
  }, [voter.id]);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Wheelchair className="mr-2 h-5 w-5" />
          Accessibility Settings
        </CardTitle>
        <CardDescription>
          Configure accessibility options to assist the voter during the voting process
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="visualAssistance"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base flex items-center">
                          {field.value ? <Eye className="mr-2 h-4 w-4" /> : <EyeOff className="mr-2 h-4 w-4" />}
                          Visual Assistance
                        </FormLabel>
                        <FormDescription>
                          Enable high contrast, large text, and screen reader support
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="hearingAssistance"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base flex items-center">
                          {field.value ? <Volume2 className="mr-2 h-4 w-4" /> : <VolumeX className="mr-2 h-4 w-4" />}
                          Hearing Assistance
                        </FormLabel>
                        <FormDescription>
                          Enable visual cues and closed captioning
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="mobilityAssistance"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base flex items-center">
                          <Wheelchair className="mr-2 h-4 w-4" />
                          Mobility Assistance
                        </FormLabel>
                        <FormDescription>
                          Request a wheelchair accessible booth
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="languagePreference"
                  render={({ field }) => (
                    <FormItem className="rounded-lg border p-4">
                      <FormLabel className="text-base flex items-center">
                        <Languages className="mr-2 h-4 w-4" />
                        Language Preference
                      </FormLabel>
                      <FormDescription>
                        Select your preferred language for voting instructions
                      </FormDescription>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="english">English</SelectItem>
                          <SelectItem value="spanish">Spanish (Español)</SelectItem>
                          <SelectItem value="chinese">Chinese (中文)</SelectItem>
                          <SelectItem value="vietnamese">Vietnamese (Tiếng Việt)</SelectItem>
                          <SelectItem value="korean">Korean (한국어)</SelectItem>
                          <SelectItem value="tagalog">Tagalog</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="otherNeeds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Other Accessibility Needs</FormLabel>
                    <FormDescription>
                      Please specify any other accessibility requirements
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        placeholder="E.g., I need assistance with..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {error && (
                <div className="p-2 text-sm text-red-600 bg-red-50 rounded-md">
                  {error}
                </div>
              )}
            </form>
          </Form>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          type="submit"
          onClick={form.handleSubmit(onSubmit)}
          disabled={submitLoading || loading}
        >
          {submitLoading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
              Saving...
            </>
          ) : accessibilityData ? (
            <>
              <Save className="mr-2 h-4 w-4" />
              Update Preferences
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Save Preferences
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}