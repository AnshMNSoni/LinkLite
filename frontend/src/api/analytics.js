import api from "./axios";

/**
 * Fetch analytics for a short code
 * @param {string} shortCode
 * @returns {Promise<{total_clicks, daily_clicks: [{date, clicks}]}>}
 */
export const fetchAnalytics = async (shortCode) => {
  const res = await api.get(`/analytics/${shortCode}`);
  return res.data;
};
