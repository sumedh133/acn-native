export interface FormField {
  id: string;
  label: string;
  type:
    | "text"
    | "select"
    | "multiselect"
    | "number"
    | "boolean"
    | "date"
    | "textarea";
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: any }[];
  dependsOn?: {
    field: string;
    values: any[];
  };
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    message?: string;
  };
  colspan: number;
  conditional?: boolean;
}

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  dependsOn?: {
    field: string;
    values: any[];
  };
  validation?: () => boolean;
}

export interface FormConfig {
  steps: FormStep[];
}
