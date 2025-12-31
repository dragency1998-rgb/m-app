// src/lib/utils/validators.ts
/**
 * Common validation functions
 */

export const isEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isStrongPassword = (password: string): boolean => {
  // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  return strongPasswordRegex.test(password)
}

export const isPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[0-9\s\-()]{10,}$/
  return phoneRegex.test(phone)
}

export const isUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export const isEmpty = (value: any): boolean => {
  return !value || (typeof value === 'string' && value.trim() === '')
}

export const minLength = (value: string, min: number): boolean => {
  return !!(value && value.length >= min)
}

export const maxLength = (value: string, max: number): boolean => {
  return !value || value.length <= max
}
