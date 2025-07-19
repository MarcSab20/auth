import { I18n } from '../../src/i18n/';


test('translate correctly replaces params', () => {
  const i18n = new I18n('en');
  const result = i18n.translate('greeting', { name: 'Alice' });
  expect(result).toBe('Hello, Alice!');
});

test('returns key when translation is missing', () => {
  const i18n = new I18n('en');
  const result = i18n.translate('missing_key');
  expect(result).toBe('missing_key');
});