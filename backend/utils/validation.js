const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password.length < minLength) {
    return {
      isValid: false,
      message: `A senha deve ter no mínimo ${minLength} caracteres.`,
    };
  }
  if (!hasUpperCase) {
    return {
      isValid: false,
      message: "A senha deve conter pelo menos uma letra maiúscula.",
    };
  }
  if (!hasLowerCase) {
    return {
      isValid: false,
      message: "A senha deve conter pelo menos uma letra minúscula.",
    };
  }
  if (!hasNumber) {
    return {
      isValid: false,
      message: "A senha deve conter pelo menos um número.",
    };
  }
  if (!hasSpecialChar) {
    return {
      isValid: false,
      message: "A senha deve conter pelo menos um caractere especial.",
    };
  }

  return { isValid: true };
};

module.exports = { validatePassword };
