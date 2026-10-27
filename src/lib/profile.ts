/** Profiles are auth users "<name>@banc.mercao.de"; the typed password is the profile name. */
const norm = (p: string) => p.trim().toLowerCase();

export const profileEmail = (p: string) => `${norm(p)}@banc.mercao.de`;
export const profilePassword = (p: string) => `${norm(p)}#banc-profil`;

export function profileName(email: string | undefined): string {
  const n = email?.split('@')[0] ?? '';
  return n.charAt(0).toUpperCase() + n.slice(1);
}
