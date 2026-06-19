import api from "./axios";

/**
 * Shorten a URL
 * @param {string} originalUrl
 * @param {string|null} customCode
 * @param {string|null} expiresAt
 * @returns {Promise<{id, original_url, short_code, created_at, expires_at}>}
 */
export const shortenUrl = async (originalUrl, customCode = null, expiresAt = null) => {
  const payload = { original_url: originalUrl };
  if (customCode) payload.custom_code = customCode;
  if (expiresAt) payload.expires_at = expiresAt;
  const res = await api.post("/urls/shorten", payload);
  return res.data;
};

/**
 * Fetch all URLs owned by the authenticated user
 * @returns {Promise<Array>}
 */
export const getUserUrls = async () => {
  const res = await api.get("/urls/my");
  return res.data;
};

/**
 * Update an existing short URL destination and/or expiration
 * @param {string} shortCode
 * @param {string} originalUrl
 * @param {string|null} expiresAt
 * @returns {Promise<object>}
 */
export const updateUrl = async (shortCode, originalUrl, expiresAt = null) => {
  const payload = { original_url: originalUrl, expires_at: expiresAt };
  const res = await api.put(`/urls/${shortCode}`, payload);
  return res.data;
};

/**
 * Delete an owned short URL
 * @param {string} shortCode
 * @returns {Promise<object>}
 */
export const deleteUrl = async (shortCode) => {
  const res = await api.delete(`/urls/${shortCode}`);
  return res.data;
};
