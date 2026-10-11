export const adminAuth = {
  verified: false,
  verificationPromise: null,
}

export function resetAdminVerification() {
  adminAuth.verified = false
  adminAuth.verificationPromise = null

  window.dispatchEvent(
    new Event('admin-auth-changed')
  )
}