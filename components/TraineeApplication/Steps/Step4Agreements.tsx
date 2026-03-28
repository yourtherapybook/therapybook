"use client";
import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Minus, FileText, ChevronDown, ChevronUp, X, Check } from 'lucide-react';
import { TraineeApplication, FormValidation, Referral } from '../../../types/trainee-application';
import { agreementsSchema } from '../../../lib/validation';
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
import { Textarea } from '../../ui/textarea';
import { Checkbox } from '../../ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '../../ui/dialog';

interface Step4AgreementsProps {
  data: Partial<TraineeApplication>;
  onUpdate: (data: Partial<TraineeApplication>) => void;
  onNext: () => void;
  onBack: () => void;
  validation: FormValidation;
  onSubmit: () => Promise<void>;
}

interface AgreementsFormData {
  motivationStatement: string;
  paymentAgreement: boolean;
  responseTimeAgreement: boolean;
  minimumClientCommitment: boolean;
  termsOfService: boolean;
  referrals: Referral[];
}

const Step4Agreements: React.FC<Step4AgreementsProps> = ({
  data,
  onUpdate,
  onNext,
  onBack,
  validation,
  onSubmit
}) => {
  const [characterCount, setCharacterCount] = useState(0);
  const [showReferrals, setShowReferrals] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);

  const form = useForm<AgreementsFormData>({
    resolver: zodResolver(agreementsSchema),
    defaultValues: {
      motivationStatement: data.agreements?.motivationStatement || '',
      paymentAgreement: data.agreements?.paymentAgreement || false,
      responseTimeAgreement: data.agreements?.responseTimeAgreement || false,
      minimumClientCommitment: data.agreements?.minimumClientCommitment || false,
      termsOfService: data.agreements?.termsOfService || false,
      referrals: data.agreements?.referrals || [],
    },
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'referrals',
  });

  const { watch, formState: { errors, isValid } } = form;
  const watchedValues = watch();

  useEffect(() => {
    form.reset({
      motivationStatement: data.agreements?.motivationStatement || '',
      paymentAgreement: data.agreements?.paymentAgreement || false,
      responseTimeAgreement: data.agreements?.responseTimeAgreement || false,
      minimumClientCommitment: data.agreements?.minimumClientCommitment || false,
      termsOfService: data.agreements?.termsOfService || false,
      referrals: data.agreements?.referrals || [],
    });
  }, [data.agreements, form]);

  // Update character count for motivation statement
  useEffect(() => {
    setCharacterCount(watchedValues.motivationStatement?.length || 0);
  }, [watchedValues.motivationStatement]);

  // Auto-save form data when it changes
  useEffect(() => {
    const subscription = form.watch((value) => {
      onUpdate({
        ...data,
        agreements: {
          motivationStatement: value.motivationStatement || '',
          paymentAgreement: value.paymentAgreement || false,
          responseTimeAgreement: value.responseTimeAgreement || false,
          minimumClientCommitment: value.minimumClientCommitment || false,
          termsOfService: value.termsOfService || false,
          referrals: (value.referrals || []).filter((ref): ref is Referral => ref !== undefined),
        },
      });
    });
    return () => subscription.unsubscribe();
  }, [form, data, onUpdate]);

  // Initialize referrals section state
  useEffect(() => {
    setShowReferrals((data.agreements?.referrals?.length || 0) > 0);
  }, [data.agreements?.referrals]);

  const addReferral = () => {
    append({
      id: `referral-${Date.now()}`,
      firstName: '',
      lastName: '',
      workEmail: '',
    });
    setShowReferrals(true);
  };

  const removeReferral = (index: number) => {
    remove(index);
    if (fields.length === 1) {
      setShowReferrals(false);
    }
  };

  const handleSubmitApplication = async () => {
    const isFormValid = await form.trigger();
    if (!isFormValid) return;

    setIsSubmitting(true);
    try {
      await onSubmit();
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const allAgreementsChecked = 
    watchedValues.paymentAgreement &&
    watchedValues.responseTimeAgreement &&
    watchedValues.minimumClientCommitment &&
    watchedValues.termsOfService;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
          Agreements & Final Submission
        </h2>
        <p className="text-neutral-600">
          Complete your application by agreeing to our terms and providing final details
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form className="space-y-6">
              {/* Motivation Statement */}
              <FormField
                control={form.control}
                name="motivationStatement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-700 font-medium">
                      Motivation Statement *
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us why you want to join TherapyBook and what motivates you to provide affordable mental health care..."
                        className="min-h-[100px] border-neutral-300 focus:border-primary-500 focus:ring-primary-500"
                        {...field}
                      />
                    </FormControl>
                    <div className="flex justify-between items-center">
                      <FormDescription>
                        Share your motivation for joining our platform
                      </FormDescription>
                      <span className={`text-sm ${
                        characterCount > 250 ? 'text-destructive' : 'text-neutral-500'
                      }`}>
                        {characterCount}/250
                      </span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Agreements Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                  Platform Agreements
                </h3>

                {/* Payment Agreement */}
                <FormField
                  control={form.control}
                  name="paymentAgreement"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="mt-1"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-neutral-700 font-medium">
                          Payment Agreement *
                        </FormLabel>
                        <FormDescription>
                          I agree to TherapyBook's payment structure where I receive 70% of session fees, 
                          with 30% going to platform operations and support services.
                        </FormDescription>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                {/* Response Time Agreement */}
                <FormField
                  control={form.control}
                  name="responseTimeAgreement"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="mt-1"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-neutral-700 font-medium">
                          Response Time Agreement *
                        </FormLabel>
                        <FormDescription>
                          I commit to responding to client inquiries within 4 business days 
                          and maintaining professional communication standards.
                        </FormDescription>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                {/* Minimum Client Commitment */}
                <FormField
                  control={form.control}
                  name="minimumClientCommitment"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="mt-1"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-neutral-700 font-medium">
                          Minimum Client Commitment *
                        </FormLabel>
                        <FormDescription>
                          I agree to maintain availability for at least 5 client sessions per month 
                          to ensure consistent service delivery.
                        </FormDescription>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                {/* Terms of Service */}
                <FormField
                  control={form.control}
                  name="termsOfService"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="mt-1"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-neutral-700 font-medium">
                          Terms of Service *
                        </FormLabel>
                        <FormDescription>
                          I have read and agree to TherapyBook's{' '}
                          <Dialog open={termsModalOpen} onOpenChange={setTermsModalOpen}>
                            <DialogTrigger asChild>
                              <Button
                                type="button"
                                variant="link"
                                className="p-0 h-auto text-primary-500 underline"
                              >
                                Terms of Service
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <FileText className="h-5 w-5" />
                                  TherapyBook Terms of Service
                                </DialogTitle>
                                <DialogDescription>
                                  Please read these terms carefully before agreeing
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 text-sm">
                                <section>
                                  <h4 className="font-semibold mb-2">1. Platform Participation</h4>
                                  <p>By joining TherapyBook, you agree to provide professional mental health services under supervision as a trainee therapist. You must maintain current enrollment in an accredited mental health program.</p>
                                </section>
                                <section>
                                  <h4 className="font-semibold mb-2">2. Professional Standards</h4>
                                  <p>You agree to maintain the highest professional and ethical standards, follow all applicable laws and regulations, and adhere to your profession's code of ethics.</p>
                                </section>
                                <section>
                                  <h4 className="font-semibold mb-2">3. Supervision Requirements</h4>
                                  <p>All services must be provided under appropriate clinical supervision as required by your training program and local regulations.</p>
                                </section>
                                <section>
                                  <h4 className="font-semibold mb-2">4. Client Confidentiality</h4>
                                  <p>You must maintain strict client confidentiality and comply with GDPR, BDSG, and any other privacy or professional-conduct rules that apply in your jurisdiction.</p>
                                </section>
                                <section>
                                  <h4 className="font-semibold mb-2">5. Platform Fees</h4>
                                  <p>TherapyBook retains 30% of session fees to cover platform operations, payment processing, and support services. You receive 70% of all session fees.</p>
                                </section>
                                <section>
                                  <h4 className="font-semibold mb-2">6. Availability and Commitment</h4>
                                  <p>You agree to maintain reasonable availability and respond to client inquiries within 4 business days.</p>
                                </section>
                                <section>
                                  <h4 className="font-semibold mb-2">7. Termination</h4>
                                  <p>Either party may terminate this agreement with 30 days notice. TherapyBook reserves the right to terminate immediately for violations of these terms.</p>
                                </section>
                              </div>
                              <div className="flex justify-end pt-4">
                                <DialogClose asChild>
                                  <Button>Close</Button>
                                </DialogClose>
                              </div>
                            </DialogContent>
                          </Dialog>
                          {' '}and Privacy Policy.
                        </FormDescription>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Referrals Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-neutral-900">
                    Professional Referrals (Optional)
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowReferrals(!showReferrals)}
                    className="flex items-center gap-2"
                  >
                    {showReferrals ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        Hide Referrals
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        Add Referrals
                      </>
                    )}
                  </Button>
                </div>

                {showReferrals && (
                  <Card className="bg-neutral-50 border-neutral-200">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-base">Colleague References</CardTitle>
                      <p className="text-sm text-neutral-600">
                        Provide references from colleagues, supervisors, or professors who can speak to your professional abilities.
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-lg border border-neutral-200">
                          <FormField
                            control={form.control}
                            name={`referrals.${index}.firstName`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm">First Name *</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="First name"
                                    className="border-neutral-300 focus:border-primary-500"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`referrals.${index}.lastName`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm">Last Name *</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Last name"
                                    className="border-neutral-300 focus:border-primary-500"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`referrals.${index}.workEmail`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm">Work Email *</FormLabel>
                                <FormControl>
                                  <Input
                                    type="email"
                                    placeholder="colleague@university.edu"
                                    className="border-neutral-300 focus:border-primary-500"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="md:col-span-3 flex justify-end">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeReferral(index)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Minus className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}

                      <Button
                        type="button"
                        variant="outline"
                        onClick={addReferral}
                        className="w-full border-dashed border-neutral-300 text-neutral-600 hover:text-neutral-900"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Another Colleague
                      </Button>
                    </CardContent>
                  </Card>
                )}
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
                  type="button"
                  onClick={handleSubmitApplication}
                  disabled={!isValid || !allAgreementsChecked || isSubmitting}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-8"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Submit Application
                    </>
                  )}
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

      {/* Application Summary */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h4 className="text-blue-800 font-medium mb-2">Ready to Submit?</h4>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Your application will be reviewed within 3-5 business days</li>
            <li>• You'll receive an email notification once your status changes</li>
            <li>• All information provided will be kept confidential</li>
            <li>• You can update your profile after approval</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Step4Agreements;
