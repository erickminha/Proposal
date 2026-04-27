export const validators = {
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  cnpj: (v) => {
    const clean = v.replace(/[^\d]+/g, '');
    return clean.length === 14;
  },
  phone: (v) => {
    const clean = v.replace(/[^\d]+/g, '');
    return clean.length >= 10 && clean.length <= 11;
  },
  required: (v) => v !== null && v !== undefined && v.toString().trim() !== '',
  minLength: (v, min) => v && v.length >= min,
  maxLength: (v, max) => v && v.length <= max,
  url: (v) => {
    try {
      new URL(v);
      return true;
    } catch (_) {
      return false;
    }
  },
  number: (v) => !isNaN(parseFloat(v)) && isFinite(v)
};

export const sanitizers = {
  cnpj: (v) => {
    const clean = v.replace(/[^\d]+/g, '');
    return clean.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
  },
  phone: (v) => {
    const clean = v.replace(/[^\d]+/g, '');
    if (clean.length === 11) {
      return clean.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
    }
    return clean.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
  },
  text: (v) => v.replace(/<[^>]*>?/gm, ''),
  trim: (v) => v.trim(),
  removeAccents: (v) => v.normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
  lowercase: (v) => v.toLowerCase(),
  uppercase: (v) => v.toUpperCase()
};

export const validateForm = (formData, schema) => {
  const errors = {};
  let isValid = true;

  Object.keys(schema).forEach(field => {
    const fieldValidators = schema[field];
    const value = formData[field];

    for (const validator of fieldValidators) {
      if (!validator(value)) {
        isValid = false;
        errors[field] = errors[field] || [];
        errors[field].push(`Campo ${field} inválido`);
      }
    }
  });

  return { isValid, errors };
};
