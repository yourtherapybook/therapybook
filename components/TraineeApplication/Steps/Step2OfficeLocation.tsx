import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MapPin, Globe, Phone, X } from 'lucide-react';
import { TraineeApplication, FormValidation } from '../../../types/trainee-application';
import { officeLocationSchema } from '../../../lib/validation';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../ui/form';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import AddressForm from '../../Common/AddressForm';

interface Step2OfficeLocationProps {
  data: Partial<TraineeApplication>;
  onUpdate: (data: Partial<TraineeApplication>) => void;
  onNext: () => void;
  onBack: () => void;
  validation: FormValidation;
}

interface OfficeLocationFormData {
  practiceName: string;
  practiceWebsite?: string;
  officePhone?: string;
  address: {
    street: string;
    addressLine2?: string;
    city: string;
    stateProvince: string;
    zipPostalCode: string;
    country: string;
  };
}

const Step2OfficeLocation: React.FC<Step2OfficeLocationProps> = ({
  data,
  onUpdate,
  onNext,
  onBack,
  validation
}) => {
  const form = useForm<OfficeLocationFormData>({
    resolver: zodResolver(officeLocationSchema),
    defaultValues: {
      practiceName: data.officeLocation?.practiceName || '',
      practiceWebsite: data.officeLocation?.practiceWebsite || '',
      officePhone: data.officeLocation?.officePhone || '',
      address: {
        street: data.officeLocation?.address?.street || '',
        addressLine2: data.officeLocation?.address?.addressLine2 || '',
        city: data.officeLocation?.address?.city || '',
        stateProvince: data.officeLocation?.address?.stateProvince || '',
        zipPostalCode: data.officeLocation?.address?.zipPostalCode || '',
        country: data.officeLocation?.address?.country || 'US',
      },
    },
    mode: 'onChange', // Enable real-time validation
  });

  const { formState: { errors, isValid } } = form;

  // Auto-save form data when it changes
  useEffect(() => {
    const subscription = form.watch((value) => {
      onUpdate({
        ...data,
        officeLocation: {
          practiceName: value.practiceName || '',
          practiceWebsite: value.practiceWebsite || '',
          officePhone: value.officePhone || '',
          address: {
            street: value.address?.street || '',
            addressLine2: value.address?.addressLine2 || '',
            city: value.address?.city || '',
            stateProvince: value.address?.stateProvince || '',
            zipPostalCode: value.address?.zipPostalCode || '',
            country: value.address?.country || 'US',
          },
        },
      });
    });
    return () => subscription.unsubscribe();
  }, [form, data, onUpdate]);

  const onSubmit = (formData: OfficeLocationFormData) => {
    onUpdate({
      ...data,
      officeLocation: formData,
    });
    onNext();
  };

  // Format website URL to include protocol if missing
  const formatWebsiteUrl = (url: string) => {
    if (!url) return url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  };

  // Format phone number for display
  const formatPhoneNumber = (phone: string) => {
    if (!phone) return phone;
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // Format based on length (assuming US/international format)
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else if (digits.length === 11 && digits.startsWith('1')) {
      return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    }
    return phone; // Return original if doesn't match expected patterns
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
          Office Location
        </h2>
        <p className="text-neutral-600">
          Tell us about your practice location and contact information
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Practice Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5 text-primary-500" />
                  <h3 className="text-lg font-semibold text-neutral-900">Practice Information</h3>
                </div>

                <FormField
                  control={form.control}
                  name="practiceName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-neutral-700 font-medium">
                        Practice Name *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your practice or clinic name"
                          className="border-neutral-300 focus:border-primary-500 focus:ring-primary-500"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        This could be your clinic, institution, or private practice name
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="practiceWebsite"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-neutral-700 font-medium">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            Practice Website (Optional)
                          </div>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="url"
                            placeholder="https://example.com"
                            className="border-neutral-300 focus:border-primary-500 focus:ring-primary-500"
                            {...field}
                            onBlur={(e) => {
                              const formatted = formatWebsiteUrl(e.target.value);
                              field.onChange(formatted);
                              field.onBlur();
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Your practice or institution website
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="officePhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-neutral-700 font-medium">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            Office Phone (Optional)
                          </div>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="+1 (555) 123-4567"
                            className="border-neutral-300 focus:border-primary-500 focus:ring-primary-500"
                            {...field}
                            onBlur={(e) => {
                              const formatted = formatPhoneNumber(e.target.value);
                              field.onChange(formatted);
                              field.onBlur();
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Office or clinic phone number
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5 text-primary-500" />
                  <h3 className="text-lg font-semibold text-neutral-900">Practice Address</h3>
                </div>

                <AddressForm
                  control={form.control}
                  basePath="address"
                  required={true}
                />
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  className="border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="bg-primary-500 hover:bg-primary-600 text-white"
                  disabled={!isValid}
                >
                  Next Step
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Show validation errors if any */}
      {Object.keys(validation.errors).length > 0 && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <h4 className="text-destructive font-medium mb-2">Please fix the following errors:</h4>
            <ul className="text-destructive text-sm space-y-1">
              {Object.entries(validation.errors).map(([field, error]) => (
                <li key={field} className="flex items-center gap-2">
                  <X className="h-3 w-3" />
                  {String(error)}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Address Validation Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h4 className="text-blue-800 font-medium mb-2">Address Tips</h4>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Ensure your address is complete and accurate for client location purposes</li>
            <li>• Use the full street address including apartment/suite numbers if applicable</li>
            <li>• Double-check your ZIP/postal code for accuracy</li>
            <li>• This address will be used for verification and may be displayed to clients</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Step2OfficeLocation;