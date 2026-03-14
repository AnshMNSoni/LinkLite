import api from "./axios";

/**
 * Shorten a URL
 * @param {string} originalUrl
 * @param {string|null} customCode
 * @returns {Promise<{id, original_url, short_code, created_at}>}
 */
export const shortenUrl = async (originalUrl, customCode = null) => {
  const payload = { original_url: originalUrl };
  if (customCode) payload.custom_code = customCode;
  const res = await api.post("/urls/shorten", payload);
  return res.data;
};
