export function validateCardNumber(number: string): boolean {
  const digits = number.replace(/\s/g, '');
  if (!/^\d{16}$/.test(digits)) return false;
  let sum = 0;
  let isEven = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits[i], 10);
    if (isEven) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    isEven = !isEven;
  }
  return sum % 10 === 0;
}

export function validateExpiryDate(month: string, year: string): boolean {
  const m = parseInt(month, 10);
  const y = parseInt(year, 10);
  if (isNaN(m) || isNaN(y) || m < 1 || m > 12) return false;
  const now = new Date();
  const currentYear = now.getFullYear();
  // Support both 2-digit and 4-digit years using a sliding window:
  // treat 2-digit years as belonging to the century that minimises past dates
  const fullYear =
    y < 100
      ? currentYear - (currentYear % 100) + y + (y + (currentYear % 100) < -50 ? 100 : 0)
      : y;
  const expiry = new Date(fullYear, m - 1, 1);
  const thisMonth = new Date(currentYear, now.getMonth(), 1);
  return expiry >= thisMonth;
}

export function validateCVV(cvv: string): boolean {
  return /^\d{3,4}$/.test(cvv);
}

export function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePhone(phone: string): boolean {
  return /^\d{7,15}$/.test(phone.replace(/\s/g, ''));
}
