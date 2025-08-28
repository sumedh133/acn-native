export interface FormField {
  id: string;
  label: string;
  type:
    | "text"
    | "select"
    | "multiselect"
    | "dropdown"
    | "number"
    | "boolean"
    | "date"
    | "textarea"
    | "dropdownWithInput"
    | "dateRange";
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: any }[];
  dateFields?: { label: string; value: any }[];
  dependsOn?:
    | {
        field: string;
        values: any[];
      }
    | {
        conditions: Array<{
          field: string;
          values: any[];
        }>;
        logicOperator: "AND";
      };
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    message?: string;
  };
  unit?: string;
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
