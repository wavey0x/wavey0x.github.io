document.addEventListener("DOMContentLoaded", () => {
  const closeDropdowns = (except) => {
    document.querySelectorAll(".nav-item.dropdown.show").forEach((item) => {
      if (item === except) return;
      item.classList.remove("show");
      item.querySelector(".dropdown-menu")?.classList.remove("show");
      item.querySelector(".dropdown-toggle")?.setAttribute("aria-expanded", "false");
    });
  };

  document.querySelectorAll('[data-toggle="collapse"][data-target]').forEach((button) => {
    const target = document.querySelector(button.getAttribute("data-target"));
    if (!target) return;

    button.addEventListener("click", () => {
      const isOpen = target.classList.toggle("show");
      button.classList.toggle("collapsed", !isOpen);
      button.setAttribute("aria-expanded", String(isOpen));
    });
  });

  document.querySelectorAll('[data-toggle="dropdown"]').forEach((toggle) => {
    toggle.addEventListener("click", (event) => {
      event.preventDefault();
      const item = toggle.closest(".nav-item.dropdown");
      const menu = item?.querySelector(".dropdown-menu");
      if (!item || !menu) return;

      const willOpen = !item.classList.contains("show");
      closeDropdowns(item);
      item.classList.toggle("show", willOpen);
      menu.classList.toggle("show", willOpen);
      toggle.setAttribute("aria-expanded", String(willOpen));
    });
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".nav-item.dropdown")) {
      closeDropdowns();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeDropdowns();
    }
  });

  document.querySelectorAll("#navbarNav .nav-link:not(.dropdown-toggle), #navbarNav .dropdown-item").forEach((link) => {
    link.addEventListener("click", () => {
      const nav = document.getElementById("navbarNav");
      const toggler = document.querySelector('[data-target="#navbarNav"]');
      if (nav?.classList.contains("show")) {
        nav.classList.remove("show");
        toggler?.classList.add("collapsed");
        toggler?.setAttribute("aria-expanded", "false");
      }
    });
  });
});
