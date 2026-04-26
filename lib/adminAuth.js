export function isAdminAuthorized(request) {
  const token = request.headers.get('x-admin-token');
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!token || !adminPassword) return false;
  return token === Buffer.from(adminPassword).toString('base64');
}
