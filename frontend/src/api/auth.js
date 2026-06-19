import api from "./axios";

/**
 * Log in or Sign up with Google OAuth ID token
 * @param {string} idToken
 * @returns {Promise<{access_token, token_type, user: {id, email, name, picture}}>}
 */
export const loginWithGoogle = async (idToken) => {
  const res = await api.post("/auth/google", { id_token: idToken });
  return res.data;
};
