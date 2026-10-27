import { describe, expect, it } from 'vitest';
import { profileEmail, profileName, profilePassword } from './profile';

describe('profile login mapping', () => {
  it('maps the typed password to email and stored password, case-insensitive', () => {
    expect(profileEmail(' Aron ')).toBe('aron@banc.mercao.de');
    expect(profilePassword('MERLE')).toBe('merle#banc-profil');
  });
  it('derives the display name from the email', () => {
    expect(profileName('aron@banc.mercao.de')).toBe('Aron');
    expect(profileName(undefined)).toBe('');
  });
});
