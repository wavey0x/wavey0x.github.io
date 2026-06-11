document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.createElement("div");
  overlay.className = "image-zoom-overlay";
  overlay.setAttribute("aria-hidden", "true");

  const zoomedImage = document.createElement("img");
  zoomedImage.alt = "";
  overlay.appendChild(zoomedImage);
  document.body.appendChild(overlay);

  const update = () => {
    overlay.style.background =
      getComputedStyle(document.documentElement).getPropertyValue("--global-bg-color") + "ee";
  };

  const close = () => {
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    zoomedImage.removeAttribute("src");
    zoomedImage.alt = "";
  };

  document.querySelectorAll("[data-zoomable]").forEach((image) => {
    image.addEventListener("click", () => {
      update();
      zoomedImage.src = image.currentSrc || image.src;
      zoomedImage.alt = image.alt || "";
      overlay.classList.add("open");
      overlay.setAttribute("aria-hidden", "false");
    });
  });

  overlay.addEventListener("click", close);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });

  window.siteZoom = { update };
});
