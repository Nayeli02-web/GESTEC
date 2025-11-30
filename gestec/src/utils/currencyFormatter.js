/**
 * Utilidades para formateo de valores monetarios
 * Cumple con requisito: "Toda cantidad monetaria debe mostrarse con su respectivo signo de moneda"
 */

import i18n from '../i18n';

/**
 * Configuración de monedas por idioma
 */
const CURRENCY_CONFIG = {
  es: {
    currency: 'CRC',      // Colones costarricenses
    symbol: '₡',
    locale: 'es-CR'
  },
  en: {
    currency: 'USD',      // Dólares estadounidenses
    symbol: '$',
    locale: 'en-US'
  }
};

/**
 * Formatea un valor monetario según el idioma actual
 * @param {number} valor - Valor numérico a formatear
 * @param {object} options - Opciones adicionales
 * @returns {string} Valor formateado con símbolo de moneda
 */
export const formatearMoneda = (valor, options = {}) => {
  if (valor === null || valor === undefined || isNaN(valor)) {
    return formatearMoneda(0, options);
  }
  
  const idioma = i18n.language || 'es';
  const config = CURRENCY_CONFIG[idioma] || CURRENCY_CONFIG.es;
  
  const defaultOptions = {
    style: 'currency',
    currency: config.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options
  };
  
  return new Intl.NumberFormat(config.locale, defaultOptions).format(valor);
};

/**
 * Formatea un valor monetario sin decimales
 * @param {number} valor - Valor numérico
 * @returns {string} Valor formateado sin decimales
 */
export const formatearMonedaSinDecimales = (valor) => {
  return formatearMoneda(valor, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
};

/**
 * Formatea un valor monetario compacto (K, M, B)
 * @param {number} valor - Valor numérico
 * @returns {string} Valor compacto (ej: ₡1.5K, $2.3M)
 */
export const formatearMonedaCompacta = (valor) => {
  if (valor === null || valor === undefined || isNaN(valor)) {
    return formatearMoneda(0);
  }
  
  const idioma = i18n.language || 'es';
  const config = CURRENCY_CONFIG[idioma] || CURRENCY_CONFIG.es;
  
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency,
    notation: 'compact',
    compactDisplay: 'short'
  }).format(valor);
};

/**
 * Obtiene solo el símbolo de moneda según el idioma
 * @returns {string} Símbolo de moneda (₡ o $)
 */
export const obtenerSimboloMoneda = () => {
  const idioma = i18n.language || 'es';
  const config = CURRENCY_CONFIG[idioma] || CURRENCY_CONFIG.es;
  return config.symbol;
};

/**
 * Obtiene el código de moneda según el idioma
 * @returns {string} Código de moneda (CRC o USD)
 */
export const obtenerCodigoMoneda = () => {
  const idioma = i18n.language || 'es';
  const config = CURRENCY_CONFIG[idioma] || CURRENCY_CONFIG.es;
  return config.currency;
};

/**
 * Parsea un string de moneda a número
 * @param {string} valorString - String con formato de moneda
 * @returns {number} Valor numérico
 */
export const parsearMoneda = (valorString) => {
  if (typeof valorString === 'number') return valorString;
  if (!valorString) return 0;
  
  // Eliminar símbolos de moneda, espacios y comas
  const valorLimpio = valorString
    .replace(/[₡$\s]/g, '')
    .replace(',', '.');
  
  return parseFloat(valorLimpio) || 0;
};

/**
 * Valida si un valor es monetario válido
 * @param {any} valor - Valor a validar
 * @returns {boolean} true si es válido
 */
export const esMonedaValida = (valor) => {
  if (typeof valor === 'number') {
    return !isNaN(valor) && isFinite(valor);
  }
  
  if (typeof valor === 'string') {
    const numerico = parsearMoneda(valor);
    return !isNaN(numerico) && isFinite(numerico);
  }
  
  return false;
};

/**
 * Formatea diferencia de moneda (positiva/negativa con color)
 * @param {number} valor - Valor numérico
 * @returns {object} {texto: string, color: string}
 */
export const formatearDiferenciaMoneda = (valor) => {
  const texto = formatearMoneda(Math.abs(valor));
  const prefijo = valor > 0 ? '+' : valor < 0 ? '-' : '';
  const color = valor > 0 ? 'success' : valor < 0 ? 'error' : 'text.secondary';
  
  return {
    texto: prefijo + texto,
    color
  };
};

/**
 * Convierte entre monedas (requiere tasa de cambio)
 * @param {number} valor - Valor a convertir
 * @param {number} tasaCambio - Tasa de cambio
 * @param {string} monedaDestino - Moneda destino (CRC o USD)
 * @returns {string} Valor convertido y formateado
 */
export const convertirMoneda = (valor, tasaCambio, monedaDestino = 'USD') => {
  if (!esMonedaValida(valor) || !esMonedaValida(tasaCambio)) {
    return formatearMoneda(0);
  }
  
  const valorConvertido = valor * tasaCambio;
  
  const config = monedaDestino === 'USD' ? CURRENCY_CONFIG.en : CURRENCY_CONFIG.es;
  
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency
  }).format(valorConvertido);
};
