/**
 * Wine type translations from English (backend) to Spanish (UI)
 */
export const WINE_TYPE_TRANSLATIONS: Record<string, string> = {
  'Red': 'Tinto',
  'red': 'Tinto',
  'White': 'Blanco',
  'white': 'Blanco',
  'Rosé': 'Rosado',
  'Rose': 'Rosado',
  'rose': 'Rosado',
  'rosé': 'Rosado',
  'Sparkling': 'Espumante',
  'sparkling': 'Espumante',
  'Dessert': 'Oporto',
  'dessert': 'Oporto',
  'Sweet': 'Dulce',
  'sweet': 'Dulce',
  'Fortified': 'Fortificado',
  'Port': 'Oporto',
  'port': 'Oporto',
  'Dessert Port': 'Oporto',
  'dessert port': 'Oporto',
};

/**
 * Wine body translations from English (backend) to Spanish (UI)
 */
export const WINE_BODY_TRANSLATIONS: Record<string, string> = {
  'Very light-bodied': 'Muy Ligero',
  'very light-bodied': 'Muy Ligero',
  'Very Light-bodied': 'Muy Ligero',
  'Very Light': 'Muy Ligero',
  'very light': 'Muy Ligero',
  'Light-bodied': 'Ligero',
  'light-bodied': 'Ligero',
  'Light': 'Ligero',
  'light': 'Ligero',
  'Medium-bodied': 'Medio',
  'medium-bodied': 'Medio',
  'Medium': 'Medio',
  'medium': 'Medio',
  'Full-bodied': 'Completo',
  'full-bodied': 'Completo',
  'Full': 'Completo',
  'full': 'Completo',
  'Very full-bodied': 'Muy Completo',
  'very full-bodied': 'Muy Completo',
  'Very Full-bodied': 'Muy Completo',
  'Very Full': 'Muy Completo',
  'very full': 'Muy Completo',
  '1': 'Muy Ligero',
  '2': 'Ligero',
  '3': 'Medio',
  '4': 'Completo',
  '5': 'Muy Completo',
};

/**
 * Wine acidity translations from English (backend) to Spanish (UI)
 */
export const WINE_ACIDITY_TRANSLATIONS: Record<string, string> = {
  'Low': 'Baja',
  'low': 'Baja',
  'Medium': 'Media',
  'medium': 'Media',
  'High': 'Alta',
  'high': 'Alta',
  '1': 'Baja',
  '2': 'Media',
  '3': 'Alta',
};

/**
 * Translates a wine type from English to Spanish
 * @param type - The wine type in English
 * @returns The wine type in Spanish, or the original value if no translation exists
 */
export function translateWineType(type: string | null | undefined): string | null {
  if (!type) return null;
  return WINE_TYPE_TRANSLATIONS[type] || type;
}

/**
 * Translates wine body from English to Spanish
 * @param body - The wine body in English
 * @returns The wine body in Spanish, or the original value if no translation exists
 */
export function translateWineBody(body: string | null | undefined): string | null {
  if (!body) return null;
  return WINE_BODY_TRANSLATIONS[body] || body;
}

/**
 * Translates wine acidity from English to Spanish
 * @param acidity - The wine acidity in English
 * @returns The wine acidity in Spanish, or the original value if no translation exists
 */
export function translateWineAcidity(acidity: string | null | undefined): string | null {
  if (!acidity) return null;
  return WINE_ACIDITY_TRANSLATIONS[acidity] || acidity;
}
