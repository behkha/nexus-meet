export function isFormFieldInvalid(field: any) {
  return field?.state?.meta?.isTouched && !field?.state?.meta?.isValid;
}
