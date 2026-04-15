export const themeScript = `
  (function () {
    try {
      var storageKey = "kavach-theme";
      var savedTheme = window.localStorage.getItem(storageKey);
      var theme = savedTheme === "light" ? "light" : "dark";
      document.documentElement.dataset.theme = theme;
    } catch (error) {
      document.documentElement.dataset.theme = "dark";
    }
  })();
`;
