"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CheckStatusActionState } from "@/actions/check-application-status";
import {
  checkStatusLookupSchema,
  type CheckStatusLookupInput,
} from "@/validators/status.schema";

const initial: CheckStatusActionState = { searched: false, ok: false };

type Props = {
  checkStatusAction: (
    prev: CheckStatusActionState,
    formData: FormData,
  ) => Promise<CheckStatusActionState>;
  initialApplicationId?: string;
  initialEmail?: string;
};

export function StatusSearchForm({
  checkStatusAction,
  initialApplicationId = "",
  initialEmail = "",
}: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(checkStatusAction, initial);

  const {
    register,
    formState: { errors },
    setError,
  } = useForm<CheckStatusLookupInput>({
    resolver: zodResolver(checkStatusLookupSchema) as never,
    defaultValues: {
      applicationId: initialApplicationId,
      email: initialEmail,
    },
  });

  useEffect(() => {
    if (!state.fieldErrors) return;
    for (const [key, message] of Object.entries(state.fieldErrors)) {
      setError(key as keyof CheckStatusLookupInput, { message });
    }
  }, [state.fieldErrors, setError]);

  useEffect(() => {
    if (!state.searched || !state.ok || !state.application) return;
    const params = new URLSearchParams({
      applicationId: state.application.id,
      email: state.application.email,
    });
    router.replace(`/check-status?${params.toString()}`, { scroll: false });
  }, [state, router]);

  return (
    <form action={formAction} className="status-search-form" noValidate>
      {state.message && !state.ok && (
        <div className="status-search-alert" role="alert">
          {state.message}
        </div>
      )}

      <div className="status-search-fields">
        <div className="form-group">
          <label className="form-label" htmlFor="applicationId">
            Application ID <span className="required">*</span>
          </label>
          <input
            id="applicationId"
            className="form-input"
            placeholder="e.g. 2bc206cf-3df5-44e2-b139-bdd80cfec27f"
            {...register("applicationId")}
            name="applicationId"
            autoComplete="off"
          />
          {errors.applicationId && (
            <div className="form-error">{errors.applicationId.message}</div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="email">
            Email Address <span className="required">*</span>
          </label>
          <input
            id="email"
            type="email"
            className="form-input"
            placeholder="you@example.com"
            {...register("email")}
            name="email"
            autoComplete="email"
          />
          {errors.email && <div className="form-error">{errors.email.message}</div>}
        </div>
      </div>

      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Checking…" : "Check status"}
      </button>
    </form>
  );
}

export type { CheckStatusActionState };
