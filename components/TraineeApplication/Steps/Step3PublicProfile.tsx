"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TraineeApplication, FormValidation } from '../../../types/trainee-application';
import { publicProfileSchema } from '../../../lib/validation';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { MultiSelect } from '../../ui/multi-select';
import { R2Uploader } from '../../ui/r2-uploader';
import { FileText, CheckCircle2, Clock, XCircle } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '../../ui/form';
import {
  TITLES,
  SKILLS_ACQUIRED,
  SPECIALTIES,
  TREATMENT_ORIENTATIONS,
  MODALITIES,
  AGE_GROUPS,
  LANGUAGES_EXTENDED,
  ETHNICITIES_SERVED,
} from '../../../utils/trainee-form-constants';

interface Step3PublicProfileProps {
  data: Partial<TraineeApplication>;
  onUpdate: (data: Partial<TraineeApplication>) => void;
  onNext: () => void;
  onBack: () => void;
  validation: FormValidation;
}

const Step3PublicProfile: React.FC<Step3PublicProfileProps> = ({
  data,
  onUpdate,
  onNext,
  onBack,
  validation
}) => {
  const [showOtherSkills, setShowOtherSkills] = useState(false);
  const [showOtherLanguages, setShowOtherLanguages] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const [uploadedDocs, setUploadedDocs] = useState<{ id: string; title: string; type: string; status: string }[]>([]);

  const refreshDocuments = useCallback(async () => {
    try {
      const res = await fetch('/api/users/profile');
      if (res.ok) {
        const payload = await res.json();
        const docs = payload.user?.documents || payload.user?.traineeApplication?.user?.documents || [];
        setUploadedDocs(
          docs.filter((d: any) => d.type !== 'PROFILE_PHOTO')
        );
      }
    } catch {
      // Silent — non-critical fetch
    }
  }, []);

  useEffect(() => {
    void refreshDocuments();
  }, [refreshDocuments]);

  const form = useForm({
    resolver: zodResolver(publicProfileSchema),
    defaultValues: {
      title: data.publicProfile?.title || '',
      therapistType: 'Student Intern / Trainee' as const,
      institutionOfStudy: data.publicProfile?.institutionOfStudy || '',
      skillsAcquired: data.publicProfile?.skillsAcquired || [],
      otherSkills: data.publicProfile?.otherSkills || '',
      specialties: data.publicProfile?.specialties || [],
      treatmentOrientation: data.publicProfile?.treatmentOrientation || [],
      modality: data.publicProfile?.modality || [],
      ageGroups: data.publicProfile?.ageGroups || [],
      languages: data.publicProfile?.languages || [],
      otherLanguages: data.publicProfile?.otherLanguages || '',
      ethnicitiesServed: data.publicProfile?.ethnicitiesServed || [],
      personalStatement: data.publicProfile?.personalStatement || '',
      profilePhotoUrl: data.publicProfile?.profilePhotoUrl || '',
    },
  });

  const watchedValues = form.watch();

  useEffect(() => {
    form.reset({
      title: data.publicProfile?.title || '',
      therapistType: 'Student Intern / Trainee' as const,
      institutionOfStudy: data.publicProfile?.institutionOfStudy || '',
      skillsAcquired: data.publicProfile?.skillsAcquired || [],
      otherSkills: data.publicProfile?.otherSkills || '',
      specialties: data.publicProfile?.specialties || [],
      treatmentOrientation: data.publicProfile?.treatmentOrientation || [],
      modality: data.publicProfile?.modality || [],
      ageGroups: data.publicProfile?.ageGroups || [],
      languages: data.publicProfile?.languages || [],
      otherLanguages: data.publicProfile?.otherLanguages || '',
      ethnicitiesServed: data.publicProfile?.ethnicitiesServed || [],
      personalStatement: data.publicProfile?.personalStatement || '',
      profilePhotoUrl: data.publicProfile?.profilePhotoUrl || '',
    });
  }, [data.publicProfile, form]);

  // Update parent component when form values change
  useEffect(() => {
    const publicProfile = {
      ...watchedValues,
      therapistType: 'Student Intern / Trainee' as const,
      title: watchedValues.title as 'Dr.' | 'Mr.' | 'Mrs.' | 'Ms.' | 'Mx.' | '',
    };

    onUpdate({
      ...data,
      publicProfile,
    });
  }, [watchedValues, data, onUpdate]);

  // Update character count for personal statement
  useEffect(() => {
    setCharacterCount(watchedValues.personalStatement?.length || 0);
  }, [watchedValues.personalStatement]);

  // Check if "Other" is selected in skills
  useEffect(() => {
    setShowOtherSkills(watchedValues.skillsAcquired?.includes('Other') || false);
  }, [watchedValues.skillsAcquired]);

  // Check if "Other" is selected in languages
  useEffect(() => {
    setShowOtherLanguages(watchedValues.languages?.includes('Other') || false);
  }, [watchedValues.languages]);

  const handleNext = () => {
    form.handleSubmit(() => {
      onNext();
    })();
  };

  // Convert constants to options format
  const skillsOptions = SKILLS_ACQUIRED.map(skill => ({ value: skill, label: skill }))
    .concat([{ value: 'Other', label: 'Other (please specify)' }]);

  const specialtiesOptions = SPECIALTIES.map(specialty => ({ value: specialty, label: specialty }));

  const treatmentOptions = TREATMENT_ORIENTATIONS.map(treatment => ({ value: treatment, label: treatment }));

  const modalityOptions = MODALITIES.map(modality => ({ value: modality, label: modality }));

  const ageGroupOptions = AGE_GROUPS.map(age => ({ value: age, label: age }));

  const languageOptions = LANGUAGES_EXTENDED.map(lang => ({ value: lang, label: lang }))
    .concat([{ value: 'Other', label: 'Other (please specify)' }]);

  const ethnicityOptions = ETHNICITIES_SERVED.map(ethnicity => ({ value: ethnicity, label: ethnicity }));

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
          Public Profile
        </h2>
        <p className="text-neutral-600">
          Create your professional profile that clients will see
        </p>
      </div>

      <Form {...form}>
        <form className="space-y-6">
          {/* Title and Institution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your title" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TITLES.map((title) => (
                        <SelectItem key={title.value} value={title.value}>
                          {title.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="institutionOfStudy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Institution of Study *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., University of Berlin"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Skills Acquired */}
          <FormField
            control={form.control}
            name="skillsAcquired"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Skills & Topics Acquired *</FormLabel>
                <FormControl>
                  <MultiSelect
                    options={skillsOptions}
                    selected={field.value || []}
                    onChange={field.onChange}
                    placeholder="Select skills you have acquired..."
                    searchPlaceholder="Search skills..."
                  />
                </FormControl>
                <FormDescription>
                  Select all skills and topics you have learned during your training
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Other Skills (conditional) */}
          {showOtherSkills && (
            <FormField
              control={form.control}
              name="otherSkills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Other Skills (please specify)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Describe other skills not listed above"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Specialties */}
          <FormField
            control={form.control}
            name="specialties"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Specialties *</FormLabel>
                <FormControl>
                  <MultiSelect
                    options={specialtiesOptions}
                    selected={field.value || []}
                    onChange={field.onChange}
                    placeholder="Select your specialties..."
                    searchPlaceholder="Search specialties..."
                  />
                </FormControl>
                <FormDescription>
                  Select the areas you specialize in or have experience with
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Treatment Orientation */}
          <FormField
            control={form.control}
            name="treatmentOrientation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Treatment Orientation *</FormLabel>
                <FormControl>
                  <MultiSelect
                    options={treatmentOptions}
                    selected={field.value || []}
                    onChange={field.onChange}
                    placeholder="Select treatment approaches..."
                    searchPlaceholder="Search treatment orientations..."
                  />
                </FormControl>
                <FormDescription>
                  Select the therapeutic approaches you are trained in
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Modality and Age Groups */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="modality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modality *</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={modalityOptions}
                      selected={field.value || []}
                      onChange={field.onChange}
                      placeholder="Select modalities..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ageGroups"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age Groups *</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={ageGroupOptions}
                      selected={field.value || []}
                      onChange={field.onChange}
                      placeholder="Select age groups..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Languages */}
          <FormField
            control={form.control}
            name="languages"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Languages *</FormLabel>
                <FormControl>
                  <MultiSelect
                    options={languageOptions}
                    selected={field.value || []}
                    onChange={field.onChange}
                    placeholder="Select languages you speak..."
                    searchPlaceholder="Search languages..."
                  />
                </FormControl>
                <FormDescription>
                  Select all languages you can conduct therapy in
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Other Languages (conditional) */}
          {showOtherLanguages && (
            <FormField
              control={form.control}
              name="otherLanguages"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Other Languages (please specify)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="List other languages not shown above"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Ethnicities Served */}
          <FormField
            control={form.control}
            name="ethnicitiesServed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ethnicities Served *</FormLabel>
                <FormControl>
                  <MultiSelect
                    options={ethnicityOptions}
                    selected={field.value || []}
                    onChange={field.onChange}
                    placeholder="Select ethnicities you serve..."
                    searchPlaceholder="Search ethnicities..."
                  />
                </FormControl>
                <FormDescription>
                  Select the ethnic communities you are comfortable working with
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Personal Statement */}
          <FormField
            control={form.control}
            name="personalStatement"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Personal Statement *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write a personal statement that describes your approach to therapy, your background, and what clients can expect when working with you. This will be visible to potential clients."
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <div className="flex justify-between items-center">
                  <FormDescription>
                    Minimum 200 characters required
                  </FormDescription>
                  <span className={`text-sm ${characterCount < 200 ? 'text-red-500' :
                    characterCount > 1000 ? 'text-red-500' : 'text-neutral-500'
                    }`}>
                    {characterCount}/1000
                  </span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Profile Photo */}
          <FormField
            control={form.control}
            name="profilePhotoUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Profile Photo</FormLabel>
                <FormControl>
                  <R2Uploader
                    fileType="PROFILE_PHOTO"
                    accept="image/*"
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormDescription>
                  Upload a professional photo that will be shown to clients (optional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Credential Documents Section */}
          <div className="border-t border-neutral-200 pt-6 mt-6 space-y-5">
            <div>
              <h3 className="text-base font-semibold text-neutral-900">Credential Documents</h3>
              <p className="text-sm text-neutral-500 mt-1">
                Upload your certification and identification documents. These will be reviewed by our team before your profile goes live.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-neutral-700">Certification / Diploma</Label>
                <p className="text-xs text-neutral-500 mb-2">
                  Proof of your training program enrollment or completion (PDF or image)
                </p>
                <R2Uploader
                  fileType="CERTIFICATION"
                  accept="image/*,application/pdf"
                  onChange={() => void refreshDocuments()}
                  onUploadComplete={() => void refreshDocuments()}
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-neutral-700">Government-Issued ID</Label>
                <p className="text-xs text-neutral-500 mb-2">
                  Passport, national ID card, or driver&apos;s license (PDF or image)
                </p>
                <R2Uploader
                  fileType="IDENTIFICATION"
                  accept="image/*,application/pdf"
                  onChange={() => void refreshDocuments()}
                  onUploadComplete={() => void refreshDocuments()}
                />
              </div>
            </div>

            {/* Uploaded documents list */}
            {uploadedDocs.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-neutral-700">Uploaded Documents</Label>
                <div className="space-y-2">
                  {uploadedDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="h-4 w-4 text-neutral-400 shrink-0" />
                        <span className="text-neutral-900 truncate">{doc.title}</span>
                        <span className="text-neutral-400 text-xs shrink-0">{doc.type.replace('_', ' ')}</span>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          doc.status === 'VERIFIED'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : doc.status === 'REJECTED'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                        }
                      >
                        {doc.status === 'VERIFIED' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {doc.status === 'REJECTED' && <XCircle className="h-3 w-3 mr-1" />}
                        {doc.status === 'PENDING' && <Clock className="h-3 w-3 mr-1" />}
                        {doc.status === 'VERIFIED' ? 'Verified' : doc.status === 'REJECTED' ? 'Rejected' : 'Pending Review'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </form>
      </Form>

      {/* Show validation errors if any */}
      {Object.keys(validation.errors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="text-red-800 font-medium mb-2">Please fix the following errors:</h4>
          <ul className="text-red-700 text-sm space-y-1">
            {Object.entries(validation.errors).map(([field, error]) => (
              <li key={field}>• {String(error)}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="px-8"
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={handleNext}
          variant="therapybook"
          className="px-8"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Step3PublicProfile;
