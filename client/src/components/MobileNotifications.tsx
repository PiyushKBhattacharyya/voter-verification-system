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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { SmartphoneNfc, Mail, CheckCircle2, XCircle, Bell, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Voter } from '@shared/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

interface MobileNotificationData {
  id: number;
  voterId: number;
  phoneNumber: string | null;
  email: string | null;
  optedIn: boolean;
  verificationCode: string;
  verified: boolean;
  notificationType: string;
  lastNotified: Date | null;
  createdAt: Date;
}

interface MobileNotificationsProps {
  voter: Voter;
  onSetupComplete?: () => void;
}

// Form schema for SMS notifications
const smsFormSchema = z.object({
  phoneNumber: z.string()
    .min(10, { message: 'Phone number must be at least 10 digits' })
    .regex(/^\+?[0-9\s\-()]+$/, { message: 'Please enter a valid phone number' }),
  optedIn: z.boolean().default(true),
});

// Form schema for email notifications
const emailFormSchema = z.object({
  email: z.string()
    .email({ message: 'Please enter a valid email address' }),
  optedIn: z.boolean().default(true),
});

// Form schema for verification code
const verificationFormSchema = z.object({
  verificationCode: z.string()
    .min(6, { message: 'Verification code must be at least 6 characters' })
    .max(6, { message: 'Verification code must be at most 6 characters' })
});

export default function MobileNotifications({ voter, onSetupComplete }: MobileNotificationsProps) {
  const [notificationData, setNotificationData] = useState<MobileNotificationData | null>(null);
  const [activeTab, setActiveTab] = useState<string>('sms');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [showVerificationForm, setShowVerificationForm] = useState<boolean>(false);
  
  const { toast } = useToast();
  
  const smsForm = useForm<z.infer<typeof smsFormSchema>>({
    resolver: zodResolver(smsFormSchema),
    defaultValues: {
      phoneNumber: '',
      optedIn: true,
    },
  });
  
  const emailForm = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      email: '',
      optedIn: true,
    },
  });
  
  const verificationForm = useForm<z.infer<typeof verificationFormSchema>>({
    resolver: zodResolver(verificationFormSchema),
    defaultValues: {
      verificationCode: '',
    },
  });
  
  const fetchNotificationData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiRequest('GET', `/api/mobile-notifications/voter/${voter.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setNotificationData(data);
        
        // Set active tab based on existing notification type
        setActiveTab(data.notificationType || 'sms');
        
        // Update form values
        if (data.phoneNumber) {
          smsForm.reset({
            phoneNumber: data.phoneNumber,
            optedIn: data.optedIn,
          });
        }
        
        if (data.email) {
          emailForm.reset({
            email: data.email,
            optedIn: data.optedIn,
          });
        }
        
        // Check if verification is needed
        if (!data.verified) {
          setShowVerificationForm(true);
        }
        
      } else if (response.status !== 404) {
        const errorData = await response.json();
        setError(errorData.message || 'Error fetching notification preferences');
      }
    } catch (err) {
      setError('Network error: Unable to fetch notification preferences');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const onSmsSubmit = async (values: z.infer<typeof smsFormSchema>) => {
    try {
      setSubmitLoading(true);
      setError(null);
      
      const payload = {
        ...values,
        voterId: voter.id,
        notificationType: 'sms',
      };
      
      if (notificationData) {
        // Not implemented in this demo: updating existing notification settings
        // This would require a PUT endpoint
        toast({
          title: 'Update not available',
          description: 'Updating existing notification settings is not supported in this demo.',
          variant: 'destructive',
        });
      } else {
        // Create new notification settings
        const response = await apiRequest('POST', '/api/mobile-notifications', payload);
        
        if (response.ok) {
          const data = await response.json();
          setNotificationData(data);
          setShowVerificationForm(true);
          toast({
            title: 'SMS Notifications Enabled',
            description: 'Please verify your phone number with the code sent to your device.',
          });
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Error saving notification preferences');
        }
      }
    } catch (err) {
      setError('Network error: Unable to save notification preferences');
      console.error(err);
    } finally {
      setSubmitLoading(false);
    }
  };
  
  const onEmailSubmit = async (values: z.infer<typeof emailFormSchema>) => {
    try {
      setSubmitLoading(true);
      setError(null);
      
      const payload = {
        ...values,
        voterId: voter.id,
        notificationType: 'email',
      };
      
      if (notificationData) {
        // Not implemented in this demo: updating existing notification settings
        toast({
          title: 'Update not available',
          description: 'Updating existing notification settings is not supported in this demo.',
          variant: 'destructive',
        });
      } else {
        // Create new notification settings
        const response = await apiRequest('POST', '/api/mobile-notifications', payload);
        
        if (response.ok) {
          const data = await response.json();
          setNotificationData(data);
          setShowVerificationForm(true);
          toast({
            title: 'Email Notifications Enabled',
            description: 'Please verify your email with the code sent to your inbox.',
          });
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Error saving notification preferences');
        }
      }
    } catch (err) {
      setError('Network error: Unable to save notification preferences');
      console.error(err);
    } finally {
      setSubmitLoading(false);
    }
  };
  
  const onVerificationSubmit = async (values: z.infer<typeof verificationFormSchema>) => {
    if (!notificationData) return;
    
    try {
      setVerifying(true);
      setError(null);
      
      const response = await apiRequest('POST', `/api/mobile-notifications/${notificationData.id}/verify`, {
        verificationCode: values.verificationCode
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotificationData(data);
        setShowVerificationForm(false);
        toast({
          title: 'Verification Successful',
          description: 'Your contact information has been verified successfully.',
        });
        if (onSetupComplete) onSetupComplete();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error verifying code');
      }
    } catch (err) {
      setError('Network error: Unable to verify code');
      console.error(err);
    } finally {
      setVerifying(false);
    }
  };
  
  const sendTestNotification = async () => {
    if (!notificationData || !notificationData.verified) return;
    
    try {
      setSubmitLoading(true);
      
      const response = await apiRequest('POST', `/api/mobile-notifications/${notificationData.id}/send`, {
        message: 'This is a test notification from the Polling Booth Verification System.'
      });
      
      if (response.ok) {
        toast({
          title: 'Test Notification Sent',
          description: `A test message has been sent to your ${notificationData.notificationType === 'sms' ? 'phone' : 'email'}.`,
        });
      } else {
        const errorData = await response.json();
        toast({
          title: 'Failed to Send',
          description: errorData.message || 'Error sending test notification',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Network Error',
        description: 'Unable to send test notification',
        variant: 'destructive',
      });
      console.error(err);
    } finally {
      setSubmitLoading(false);
    }
  };
  
  useEffect(() => {
    if (voter.id) {
      fetchNotificationData();
    }
  }, [voter.id]);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="mr-2 h-5 w-5" />
          Queue Notifications
        </CardTitle>
        <CardDescription>
          Receive updates about your position in the voting queue
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : notificationData && notificationData.verified ? (
          <div className="space-y-4">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Notifications Enabled</AlertTitle>
              <AlertDescription className="text-green-700">
                {notificationData.notificationType === 'sms' 
                  ? `You will receive SMS updates at ${notificationData.phoneNumber}`
                  : `You will receive email updates at ${notificationData.email}`}
              </AlertDescription>
            </Alert>
            
            <div className="flex items-center justify-between p-4 border rounded-md">
              <div>
                <h3 className="font-medium">Send a test message</h3>
                <p className="text-sm text-gray-500">Verify your notifications are working</p>
              </div>
              <Button
                variant="outline"
                onClick={sendTestNotification}
                disabled={submitLoading}
              >
                {submitLoading ? 'Sending...' : 'Send Test'}
              </Button>
            </div>
          </div>
        ) : showVerificationForm && notificationData ? (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Verification Required</AlertTitle>
              <AlertDescription>
                {notificationData.notificationType === 'sms'
                  ? `Please enter the 6-digit code sent to ${notificationData.phoneNumber}`
                  : `Please enter the 6-digit code sent to ${notificationData.email}`}
              </AlertDescription>
            </Alert>
            
            <Form {...verificationForm}>
              <form onSubmit={verificationForm.handleSubmit(onVerificationSubmit)} className="space-y-4">
                <FormField
                  control={verificationForm.control}
                  name="verificationCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verification Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter 6-digit code" {...field} />
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
                
                <Button type="submit" disabled={verifying}>
                  {verifying ? 'Verifying...' : 'Verify'}
                </Button>
              </form>
            </Form>
            
            <div className="text-sm text-gray-500 mt-2">
              <p>For this demo, use code: {notificationData.verificationCode}</p>
            </div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sms" className="flex items-center">
                <SmartphoneNfc className="mr-2 h-4 w-4" />
                SMS
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center">
                <Mail className="mr-2 h-4 w-4" />
                Email
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="sms" className="space-y-4">
              <Form {...smsForm}>
                <form onSubmit={smsForm.handleSubmit(onSmsSubmit)} className="space-y-4">
                  <FormField
                    control={smsForm.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 123-4567" {...field} />
                        </FormControl>
                        <FormDescription>
                          We'll send you SMS updates about your position in the queue
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={smsForm.control}
                    name="optedIn"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Receive Updates</FormLabel>
                          <FormDescription>
                            Allow us to send you SMS messages about your voting status
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
                  
                  {error && (
                    <div className="p-2 text-sm text-red-600 bg-red-50 rounded-md">
                      {error}
                    </div>
                  )}
                  
                  <Button type="submit" disabled={submitLoading}>
                    {submitLoading ? 'Saving...' : 'Enable SMS Notifications'}
                  </Button>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="email" className="space-y-4">
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                  <FormField
                    control={emailForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="example@email.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          We'll send you email updates about your position in the queue
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={emailForm.control}
                    name="optedIn"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Receive Updates</FormLabel>
                          <FormDescription>
                            Allow us to send you email messages about your voting status
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
                  
                  {error && (
                    <div className="p-2 text-sm text-red-600 bg-red-50 rounded-md">
                      {error}
                    </div>
                  )}
                  
                  <Button type="submit" disabled={submitLoading}>
                    {submitLoading ? 'Saving...' : 'Enable Email Notifications'}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
      {notificationData && notificationData.verified && (
        <CardFooter className="flex justify-between">
          <Badge variant="outline" className="flex items-center">
            <CheckCircle2 className="mr-1 h-4 w-4 text-green-500" />
            Verified
          </Badge>
          <Button variant="outline" onClick={() => setShowVerificationForm(false)}>
            Manage Settings
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}