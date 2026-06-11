// Add Bootstrap table classes without the bootstrap-table plugin.
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("table").forEach((table) => {
    if (document.documentElement.getAttribute("data-theme") === "dark") {
      table.classList.add("table-dark");
    } else {
      table.classList.remove("table-dark");
    }

    if (
      !table.closest('[class*="news"]') &&
      !table.closest('[class*="card"]') &&
      !table.closest("code")
    ) {
      table.classList.add("table-hover");
    }
  });
});
