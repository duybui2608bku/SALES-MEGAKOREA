import { sample, sampleSize } from 'lodash'

export const generatePassword = (): string => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const special = '!@#$%^&*()-_=+[]{}|;:,.<>?'
  const all = uppercase + lowercase + numbers + special

  // Đảm bảo ít nhất có 1 kí tự mỗi loại
  const oneUpper = sample(uppercase)!
  const oneNumber = sample(numbers)!
  const oneSpecial = sample(special)!
  const remaining = sampleSize(all, 5).join('')

  const fullPassword = (oneUpper + oneNumber + oneSpecial + remaining).split('')
  return sampleSize(fullPassword, fullPassword.length).join('')
}
