export function set(key: string, value: any) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(e);
  }
}

export function get<T>(key: string, defaultValue?: T): T | undefined {
  try {
    const payload = window.localStorage.getItem(key);
    const value = payload && JSON.parse(payload);
    if (value) {
      return value;
    }
  } catch (e) {
    console.error(e);
  }
  return defaultValue;
}
