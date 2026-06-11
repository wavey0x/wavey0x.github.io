document.addEventListener("DOMContentLoaded", () => {
  // add toggle functionality to abstract and bibtex buttons
  document.querySelectorAll("a.abstract").forEach((link) => {
    link.addEventListener("click", () => {
      const entry = link.parentElement && link.parentElement.parentElement;
      if (!entry) return;
      entry.querySelectorAll(".abstract.hidden").forEach((el) => el.classList.toggle("open"));
      entry.querySelectorAll(".bibtex.hidden.open").forEach((el) => el.classList.toggle("open"));
    });
  });

  document.querySelectorAll("a.bibtex").forEach((link) => {
    link.addEventListener("click", () => {
      const entry = link.parentElement && link.parentElement.parentElement;
      if (!entry) return;
      entry.querySelectorAll(".bibtex.hidden").forEach((el) => el.classList.toggle("open"));
      entry.querySelectorAll(".abstract.hidden.open").forEach((el) => el.classList.toggle("open"));
    });
  });

  document.querySelectorAll("a").forEach((link) => {
    link.classList.remove("waves-effect", "waves-light");
  });
});
