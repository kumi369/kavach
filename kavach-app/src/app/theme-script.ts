export const themeScript = `
  (function () {
    var storageKey = "kavach-theme";
    var savedTheme = window.localStorage.getItem(storageKey);
    var theme = savedTheme === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
  })();
`;
