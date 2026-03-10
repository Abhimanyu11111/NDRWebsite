function doGTranslate(langPair) {
  if (langPair === "") return;

  var lang = langPair.split("|")[1];
  var select = document.querySelector("select.goog-te-combo");

  if (!select) {
    setTimeout(function () {
      doGTranslate(langPair);
    }, 500);
    return;
  }

  select.value = lang;
  select.dispatchEvent(new Event("change"));
}
