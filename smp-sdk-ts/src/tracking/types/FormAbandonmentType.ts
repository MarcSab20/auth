export type FormField = {
  fieldName: string;
  filledValue?: string;
  isCompleted: boolean;
  isInError: boolean;
  error?: string;
};

export type FormAbandonmentEvent = {
  type: "abandon_form_event";
  formId: string;
  fields: FormField[];
};
 export type FormSubmissionEvent = {
  type: "submit_form_event";
  formId: string;
  fields: FormField[];
  };
  
  export type FormEvent = FormAbandonmentEvent | FormSubmissionEvent;