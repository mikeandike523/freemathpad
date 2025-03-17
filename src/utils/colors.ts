import { clamp } from "./math";
import Color from 'color'

/**
 * Custom error class for color parsing issues
 */
export class ColorParsingError extends Error {
  constructor(color: string, originalError?: Error) {
    super(`Invalid color format: "${color}"${originalError ? ` - ${originalError.message}` : ''}`);
    this.name = 'ColorParsingError';
  }
}

/**
 * 
 * Lighten or darken color by a certain factor (e.g. 0.95, 1.05, 0.8, 1.2, etc.)
 * 
 * Alpha is preserved
 * 
 * @param color - Any valid css color string, including words, hex, rgb, hsl, etc.
 * @param factor - The factor to lighten or darken by. The color space is hsl. The end lightness will be clamped to 0% to 100% range
 * 
 * @returns The lightened or darkened color in hsla format
 * 
 * @throws {ColorParsingError} If the color string cannot be parsed
 * 
 */
export function lightenOrDarkenColor(color: string, factor: number): string {
  try {
    const colorObj = Color(color);
    const hsl = colorObj.hsl();
    const currentLightness = hsl.lightness()
    const newLightness = clamp(currentLightness * factor, 0, 100);
    return colorObj.lightness(newLightness).hsl().string();
  } catch (error) {
    throw new ColorParsingError(color, error instanceof Error ? error : undefined);
  }
}

export function increaseOrDecreaseSaturation(color: string, factor: number): string {
  try {
    const colorObj = Color(color);
    const hsl = colorObj.hsl();
    const currentSaturation = hsl.saturationl()
    const newSaturation = clamp(currentSaturation * factor, 0, 100);
    return colorObj.saturate(newSaturation / currentSaturation - 1).hsl().string();
  } catch (error) {
    throw new ColorParsingError(color, error instanceof Error ? error : undefined);
  }
}

export function rotateHue(color: string, degrees: number): string {
  try {
    const colorObj = Color(color);
    return colorObj.rotate(degrees).hsl().string();
  } catch (error) {
    throw new ColorParsingError(color, error instanceof Error ? error : undefined);
  }
}