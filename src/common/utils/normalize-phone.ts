export const normalizePhone = (value?: string | null) => {
  if (!value) {
    return undefined;
  }

  const phone = value.replace(/\D/g, '');

  return phone || undefined;
};
