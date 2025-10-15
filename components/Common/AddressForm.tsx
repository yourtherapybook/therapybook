import React from 'react';
import { Control, FieldPath } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface AddressFormProps<T extends Record<string, any>> {
  control: Control<T>;
  basePath: string;
  required?: boolean;
  className?: string;
}

// Common countries list
const COUNTRIES = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'IT', label: 'Italy' },
  { value: 'ES', label: 'Spain' },
  { value: 'NL', label: 'Netherlands' },
  { value: 'BE', label: 'Belgium' },
  { value: 'AT', label: 'Austria' },
  { value: 'CH', label: 'Switzerland' },
  { value: 'AU', label: 'Australia' },
  { value: 'NZ', label: 'New Zealand' },
  { value: 'IE', label: 'Ireland' },
  { value: 'SE', label: 'Sweden' },
  { value: 'NO', label: 'Norway' },
  { value: 'DK', label: 'Denmark' },
  { value: 'FI', label: 'Finland' },
];

const AddressForm = <T extends Record<string, any>>({
  control,
  basePath,
  required = true,
  className = '',
}: AddressFormProps<T>) => {
  const requiredIndicator = required ? ' *' : '';

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Street Address */}
      <FormField
        control={control}
        name={`${basePath}.street` as FieldPath<T>}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-neutral-700 font-medium">
              Street Address{requiredIndicator}
            </FormLabel>
            <FormControl>
              <Input
                placeholder="Enter street address"
                className="border-neutral-300 focus:border-primary-500 focus:ring-primary-500"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Address Line 2 (Optional) */}
      <FormField
        control={control}
        name={`${basePath}.addressLine2` as FieldPath<T>}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-neutral-700 font-medium">
              Address Line 2 (Optional)
            </FormLabel>
            <FormControl>
              <Input
                placeholder="Apartment, suite, unit, building, floor, etc."
                className="border-neutral-300 focus:border-primary-500 focus:ring-primary-500"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* City and State/Province */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name={`${basePath}.city` as FieldPath<T>}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-neutral-700 font-medium">
                City{requiredIndicator}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter city"
                  className="border-neutral-300 focus:border-primary-500 focus:ring-primary-500"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`${basePath}.stateProvince` as FieldPath<T>}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-neutral-700 font-medium">
                State/Province{requiredIndicator}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter state or province"
                  className="border-neutral-300 focus:border-primary-500 focus:ring-primary-500"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* ZIP/Postal Code and Country */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name={`${basePath}.zipPostalCode` as FieldPath<T>}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-neutral-700 font-medium">
                ZIP/Postal Code{requiredIndicator}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter ZIP or postal code"
                  className="border-neutral-300 focus:border-primary-500 focus:ring-primary-500"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`${basePath}.country` as FieldPath<T>}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-neutral-700 font-medium">
                Country{requiredIndicator}
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="border-neutral-300 focus:border-primary-500 focus:ring-primary-500">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country.value} value={country.value}>
                      {country.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default AddressForm;