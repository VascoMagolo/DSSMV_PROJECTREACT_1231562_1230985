export const languagesData = [
  { label: 'English', value: 'en' },
  { label: 'Português', value: 'pt' },
  { label: 'Español', value: 'es' },
  { label: 'Français', value: 'fr' },
  { label: 'Deutsch', value: 'de' },
  { label: 'Italiano', value: 'it' },
  { label: '中文', value: 'zh' },
  { label: '日本語', value: 'ja' },
  { label: '한국어', value: 'ko' },
  { label: 'Русский', value: 'ru' },
];

export type Action<T> =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: T[] }
  | { type: 'OPERATION_START' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'DELETE_PHRASE'; payload: string };