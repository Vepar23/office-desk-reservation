import bcrypt from 'bcryptjs'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function validatePassword(password: string): boolean {
  return password.length >= 6
}

export function validateUsername(username: string): boolean {
  // Dozvoli slova (uključujući hrvatska), brojeve, razmake i underscore
  return username.length >= 3 && /^[a-zA-ZčćžšđČĆŽŠĐ0-9_ ]+$/.test(username)
}

