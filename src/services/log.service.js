import logger from '../utils/logger.js';

/**
 * Log de información
 * @param {string} message
 */
export function info(message) {
  logger.info(message);
}

/**
 * Log de advertencia
 * @param {string} message
 */
export function warn(message) {
  logger.warn(message);
}

/**
 * Log de error
 * @param {string|Error} message
 */
export function error(message) {
  logger.error(message);
}

/**
 * Log de debug (opcional)
 * @param {string} message
 */
export function debug(message) {
  logger.debug(message);
}
