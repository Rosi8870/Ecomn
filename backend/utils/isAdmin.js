module.exports = (email) => {
  if (!email) return false;

  const ADMIN_EMAILS = [
    "admin@mystore.com"
  ];

  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
};
