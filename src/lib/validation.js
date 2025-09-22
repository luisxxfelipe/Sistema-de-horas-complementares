export const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const errors = [];
  
  if (password.length < minLength) {
    errors.push(`A senha deve ter pelo menos ${minLength} caracteres`);
  }
  if (!hasUpperCase) {
    errors.push('A senha deve conter pelo menos uma letra maiúscula');
  }
  if (!hasLowerCase) {
    errors.push('A senha deve conter pelo menos uma letra minúscula');
  }
  if (!hasNumbers) {
    errors.push('A senha deve conter pelo menos um número');
  }
  if (!hasSpecialChar) {
    errors.push('A senha deve conter pelo menos um caractere especial');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateMatricula = (matricula) => {
  const matriculaRegex = /^\d{8}$/;
  return matriculaRegex.test(matricula);
}; 