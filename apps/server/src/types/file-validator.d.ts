export type FileValidatorOptions = {
  fieldName: string;
  maxFiles?: number;
  maxFileSize?: number;
  totalFileSize?: number;
  fileExtensions?: string[];
};
