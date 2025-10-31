import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export async function getAccessToken(): Promise<string | null> {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return token ?? null;
  } catch (e) {
    return null;
  }
}

export async function setAccessToken(token: string): Promise<void> {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch {}
}

export async function removeAccessToken(): Promise<void> {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch {}
}

export async function getRefreshToken(): Promise<string | null> {
  try {
    const token = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    return token ?? null;
  } catch (e) {
    return null;
  }
}

export async function setRefreshToken(token: string): Promise<void> {
  try {
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
  } catch {}
}

export async function removeRefreshToken(): Promise<void> {
  try {
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {}
}

export { TOKEN_KEY, REFRESH_TOKEN_KEY };
