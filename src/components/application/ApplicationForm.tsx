"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  applyFormSchema,
  type ApplyFormValues,
} from "@/validators/application.schema";
import { ApplicationSuccess } from "@/components/application/ApplicationSuccess";
import { FileUploadField } from "@/components/application/FileUploadField";
import { FormField } from "@/components/application/FormField";
import type { ApplyActionState } from "@/actions/submit-application";

const initial: ApplyActionState = { ok: false };

type Props = {
  jobId: string;
  jobTitle: string;
  submitAction: (
    prev: ApplyActionState,
    formData: FormData,
  ) => Promise<ApplyActionState>;
};

function onlyLettersAndSpaces(value: string): string {
  return value.replace(/[^A-Za-z\s]/g, "");
}

function onlyDigits(value: string, maxLen: number): string {
  return value.replace(/\D/g, "").slice(0, maxLen);
}

export function ApplicationForm({ jobId, jobTitle, submitAction }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(submitAction, initial);
  const [pending, startTransition] = useTransition();
  const [resumeError, setResumeError] = useState<string | undefined>();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ApplyFormValues>({
    resolver: zodResolver(applyFormSchema) as Resolver<ApplyFormValues>,
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      currentCity: "",
      experience: "",
      currentCompany: "",
      currentCtc: "",
      expectedCtc: "",
      noticePeriod: "",
      linkedinUrl: "",
      portfolioUrl: "",
      coverLetter: "",
    },
  });

  const nameField = register("name");
  const phoneField = register("phone");
  const cityField = register("currentCity");

  useEffect(() => {
    if (!state.fieldErrors) return;
    for (const [key, message] of Object.entries(state.fieldErrors)) {
      if (key === "resume") {
        setResumeError(message);
        continue;
      }
      setError(key as keyof ApplyFormValues, { type: "server", message });
    }
  }, [state.fieldErrors, setError]);

  const onValid = handleSubmit(() => {
    const form = formRef.current;
    if (!form) return;

    const resumeInput = form.elements.namedItem("resume");
    const files =
      resumeInput instanceof HTMLInputElement ? resumeInput.files : null;
    if (!files?.length) {
      setResumeError("Resume is required");
      return;
    }

    setResumeError(undefined);
    startTransition(() => {
      formAction(new FormData(form));
    });
  });

  if (state.ok) {
    return (
      <ApplicationSuccess
        jobTitle={state.jobTitle ?? jobTitle}
        applicationId={state.applicationId}
        email={state.email}
      />
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={onValid}
      className="application-form"
      noValidate
    >
      <input type="hidden" name="jobId" value={jobId} />

      {state.message && !state.ok && (
        <div className="application-form-alert" role="alert">
          {state.message}
        </div>
      )}

      <FormField label="Full Name" htmlFor="name" required error={errors.name?.message}>
        <input
          id="name"
          className="form-input"
          autoComplete="name"
          aria-invalid={!!errors.name}
          {...nameField}
          onChange={(e) => {
            e.target.value = onlyLettersAndSpaces(e.target.value);
            void nameField.onChange(e);
          }}
        />
      </FormField>

      <FormField label="Email" htmlFor="email" required error={errors.email?.message}>
        <input
          id="email"
          type="email"
          className="form-input"
          autoComplete="email"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
      </FormField>

      <FormField label="Phone" htmlFor="phone" required error={errors.phone?.message}>
        <input
          id="phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          maxLength={10}
          className="form-input"
          placeholder="10-digit mobile number"
          aria-invalid={!!errors.phone}
          {...phoneField}
          onChange={(e) => {
            e.target.value = onlyDigits(e.target.value, 10);
            void phoneField.onChange(e);
          }}
        />
      </FormField>

      <FormField
        label="Current City"
        htmlFor="currentCity"
        required
        error={errors.currentCity?.message}
      >
        <input
          id="currentCity"
          className="form-input"
          autoComplete="address-level2"
          aria-invalid={!!errors.currentCity}
          {...cityField}
          onChange={(e) => {
            e.target.value = onlyLettersAndSpaces(e.target.value);
            void cityField.onChange(e);
          }}
        />
      </FormField>

      <FormField
        label="Experience"
        htmlFor="experience"
        required
        error={errors.experience?.message}
      >
        <input
          id="experience"
          className="form-input"
          placeholder="e.g. 3 years"
          aria-invalid={!!errors.experience}
          {...register("experience")}
        />
      </FormField>

      <FormField
        label="Current Company"
        htmlFor="currentCompany"
        required
        error={errors.currentCompany?.message}
      >
        <input
          id="currentCompany"
          className="form-input"
          aria-invalid={!!errors.currentCompany}
          {...register("currentCompany")}
        />
      </FormField>

      <div className="application-form-row">
        <FormField
          label="Current CTC"
          htmlFor="currentCtc"
          required
          error={errors.currentCtc?.message}
        >
          <input
            id="currentCtc"
            className="form-input"
            placeholder="e.g. 8 LPA"
            aria-invalid={!!errors.currentCtc}
            {...register("currentCtc")}
          />
        </FormField>

        <FormField
          label="Expected CTC"
          htmlFor="expectedCtc"
          required
          error={errors.expectedCtc?.message}
        >
          <input
            id="expectedCtc"
            className="form-input"
            placeholder="e.g. 12 LPA"
            aria-invalid={!!errors.expectedCtc}
            {...register("expectedCtc")}
          />
        </FormField>
      </div>

      <FormField
        label="Notice Period"
        htmlFor="noticePeriod"
        required
        error={errors.noticePeriod?.message}
      >
        <input
          id="noticePeriod"
          className="form-input"
          placeholder="e.g. 30 days"
          aria-invalid={!!errors.noticePeriod}
          {...register("noticePeriod")}
        />
      </FormField>

      <FormField label="LinkedIn" htmlFor="linkedinUrl" error={errors.linkedinUrl?.message}>
        <input
          id="linkedinUrl"
          type="url"
          className="form-input"
          placeholder="https://linkedin.com/in/..."
          aria-invalid={!!errors.linkedinUrl}
          {...register("linkedinUrl")}
        />
      </FormField>

      <FormField label="Portfolio" htmlFor="portfolioUrl" error={errors.portfolioUrl?.message}>
        <input
          id="portfolioUrl"
          type="url"
          className="form-input"
          placeholder="https://"
          aria-invalid={!!errors.portfolioUrl}
          {...register("portfolioUrl")}
        />
      </FormField>

      <FileUploadField
        error={resumeError ?? state.fieldErrors?.resume}
        onFileChange={() => setResumeError(undefined)}
      />

      <FormField
        label="Cover Letter"
        htmlFor="coverLetter"
        hint="(optional)"
        error={errors.coverLetter?.message}
      >
        <textarea
          id="coverLetter"
          rows={6}
          className="form-input form-textarea"
          placeholder="Tell us why you're excited about this role..."
          aria-invalid={!!errors.coverLetter}
          {...register("coverLetter")}
        />
      </FormField>

      <div className="application-form-actions">
        <button type="submit" className="btn btn-primary btn-lg" disabled={pending}>
          {pending ? "Submitting…" : "Submit application"}
        </button>
      </div>
    </form>
  );
}