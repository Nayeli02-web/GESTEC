/**
 * Utilidades para formateo de fechas según el idioma de la aplicación
 * Cumple con requisito: "Las fechas y horas deben mostrarse en el formato adecuado al idioma de la aplicación"
 */

import i18n from '../i18n';

/**
 * Formatea una fecha según el idioma actual de la aplicación
 * @param {string|Date} fecha - Fecha a formatear
 * @param {object} options - Opciones de formato (Intl.DateTimeFormat)
 * @returns {string} Fecha formateada
 */
export const formatearFecha = (fecha, options = {}) => {
  if (!fecha) return '';
  
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
  
  // Idioma actual de la aplicación
  const locale = i18n.language || 'es';
  
  // Opciones por defecto: fecha completa
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };
  
  return date.toLocaleDateString(locale, defaultOptions);
};

/**
 * Formatea una fecha y hora según el idioma actual
 * @param {string|Date} fecha - Fecha a formatear
 * @param {object} options - Opciones de formato
 * @returns {string} Fecha y hora formateada
 */
export const formatearFechaHora = (fecha, options = {}) => {
  if (!fecha) return '';
  
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
  const locale = i18n.language || 'es';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options
  };
  
  return date.toLocaleString(locale, defaultOptions);
};

/**
 * Formatea una fecha en formato corto (DD/MM/YYYY o MM/DD/YYYY según idioma)
 * @param {string|Date} fecha - Fecha a formatear
 * @returns {string} Fecha formateada corta
 */
export const formatearFechaCorta = (fecha) => {
  if (!fecha) return '';
  
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
  const locale = i18n.language || 'es';
  
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

/**
 * Formatea solo la hora según el idioma (12h para EN, 24h para ES)
 * @param {string|Date} fecha - Fecha a formatear
 * @returns {string} Hora formateada
 */
export const formatearHora = (fecha) => {
  if (!fecha) return '';
  
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
  const locale = i18n.language || 'es';
  
  return date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: locale === 'en'
  });
};

/**
 * Formatea fecha relativa (Hace X minutos/horas/días)
 * @param {string|Date} fecha - Fecha a formatear
 * @returns {string} Fecha relativa
 */
export const formatearFechaRelativa = (fecha) => {
  if (!fecha) return '';
  
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
  const ahora = new Date();
  const diffMs = ahora - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHoras = Math.floor(diffMs / 3600000);
  const diffDias = Math.floor(diffMs / 86400000);
  
  const t = i18n.t; // Función de traducción
  
  if (diffMins < 1) return t('common.justNow') || 'Justo ahora';
  if (diffMins < 60) return `${t('common.ago')} ${diffMins} ${t('common.minutes')}` || `Hace ${diffMins} min`;
  if (diffHoras < 24) return `${t('common.ago')} ${diffHoras} ${t('common.hours')}` || `Hace ${diffHoras}h`;
  if (diffDias < 7) return `${t('common.ago')} ${diffDias} ${t('common.days')}` || `Hace ${diffDias}d`;
  
  return formatearFechaCorta(fecha);
};

/**
 * Valida si una fecha es válida
 * @param {string|Date} fecha - Fecha a validar
 * @returns {boolean} true si es válida
 */
export const esFechaValida = (fecha) => {
  if (!fecha) return false;
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
  return date instanceof Date && !isNaN(date);
};

/**
 * Obtiene el formato de fecha según el idioma
 * @returns {string} Formato de fecha (DD/MM/YYYY o MM/DD/YYYY)
 */
export const obtenerFormatoFecha = () => {
  const locale = i18n.language || 'es';
  return locale === 'en' ? 'MM/DD/YYYY' : 'DD/MM/YYYY';
};
