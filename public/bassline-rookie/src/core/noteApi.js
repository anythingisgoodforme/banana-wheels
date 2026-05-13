(function initNoteApi(root, factory) {
  const api = factory();
  root.BasslineNoteApi = api;
})(typeof window !== 'undefined' ? window : globalThis, function noteApiFactory() {
  const DEFAULT_BASE_URL = '/functions/v1';

  function getBaseUrl() {
    return rootConfig().functionsUrl || DEFAULT_BASE_URL;
  }

  async function detectNote(payload, options = {}) {
    return postJson(`${options.baseUrl || getBaseUrl()}/detect-note`, payload);
  }

  async function analyzeAudioNote(payload, options = {}) {
    return postJson(`${options.baseUrl || getBaseUrl()}/analyze-audio-note`, payload);
  }

  async function recordPracticeAttempt(payload, options = {}) {
    return postJson(`${options.baseUrl || getBaseUrl()}/record-practice-attempt`, payload);
  }

  async function practiceProfile(playerId = 'local-demo', options = {}) {
    const url = `${options.baseUrl || getBaseUrl()}/practice-profile?playerId=${encodeURIComponent(playerId)}`;
    const response = await fetch(url);
    return parseResponse(response);
  }

  async function postJson(url, payload) {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload || {}),
    });
    return parseResponse(response);
  }

  async function parseResponse(response) {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(
        data.message || data.error || `Request failed with ${response.status}`
      );
      error.status = response.status;
      error.data = data;
      throw error;
    }
    return data;
  }

  function rootConfig() {
    return (typeof window !== 'undefined' && window.BasslineConfig) || {};
  }

  return {
    analyzeAudioNote,
    detectNote,
    practiceProfile,
    recordPracticeAttempt,
  };
});
