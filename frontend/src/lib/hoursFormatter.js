// Utilitários para formatação de horas

/**
 * Converte horas decimais para formato "Xh Ymin"
 * @param {number} decimalHours - Horas em formato decimal (ex: 0.8)
 * @returns {string} - Formato "Xh Ymin" (ex: "0h 48min")
 */
export const formatDecimalHours = (decimalHours) => {
  if (!decimalHours || decimalHours === 0) return "0h 0min";
  
  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);
  
  if (hours === 0) {
    return `${minutes}min`;
  } else if (minutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${minutes}min`;
  }
};

/**
 * Converte formato "Xh Ymin" para horas decimais
 * @param {string} formattedHours - Formato "Xh Ymin" ou similar
 * @returns {number} - Horas em formato decimal
 */
export const parseFormattedHours = (formattedHours) => {
  if (!formattedHours || typeof formattedHours !== 'string') return 0;
  
  const hoursMatch = formattedHours.match(/(\d+)h/);
  const minutesMatch = formattedHours.match(/(\d+)min/);
  
  const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
  const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
  
  return hours + (minutes / 60);
};

/**
 * Valida se o formato de horas está correto
 * @param {string} hoursString - String de horas para validar
 * @returns {boolean} - Se é válido
 */
export const validateHoursFormat = (hoursString) => {
  if (!hoursString) return false;
  
  // Aceita formatos: "1h", "30min", "1h 30min", "1.5", "1,5"
  const validFormats = [
    /^\d+h$/, // "1h"
    /^\d+min$/, // "30min"
    /^\d+h \d+min$/, // "1h 30min"
    /^\d+[\.,]?\d*$/ // "1.5" ou "1,5" ou "1"
  ];
  
  return validFormats.some(format => format.test(hoursString.trim()));
};

/**
 * Converte qualquer formato de entrada para horas decimais
 * @param {string|number} input - Entrada do usuário
 * @returns {number} - Horas em formato decimal
 */
export const convertToDecimalHours = (input) => {
  if (typeof input === 'number') return input;
  if (!input) return 0;
  
  const inputStr = String(input).trim();
  
  // Se tem formato "h" ou "min", usa parseFormattedHours
  if (inputStr.includes('h') || inputStr.includes('min')) {
    return parseFormattedHours(inputStr);
  }
  
  // Se é número decimal com vírgula, substitui por ponto
  const normalizedInput = inputStr.replace(',', '.');
  const decimal = parseFloat(normalizedInput);
  
  return isNaN(decimal) ? 0 : decimal;
};