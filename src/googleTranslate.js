window.googleTranslateElementInit = function googleTranslateElementInit() {
  if (!window.google?.translate?.TranslateElement) return;

  new window.google.translate.TranslateElement(
    {
      pageLanguage: "en",
      includedLanguages: "en,hi",
      autoDisplay: false,
    },
    "google_translate_element",
  );
};

window.setLanguage = function setLanguage(lang) {
  if (!['en', 'hi'].includes(lang)) return;

  document.cookie = `googtrans=/en/${lang};path=/;SameSite=Lax`;
  document.cookie = `googtrans=/en/${lang};path=/;domain=${window.location.hostname};SameSite=Lax`;
  window.location.reload();
};
