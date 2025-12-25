document.addEventListener('DOMContentLoaded', function() {
    const mode_toggle = document.getElementById("light-toggle");
    const mode_toggle_mobile = document.getElementById("light-toggle-mobile");

    if (mode_toggle) {
        mode_toggle.addEventListener("click", function() {
            toggleTheme(localStorage.getItem("theme"));
        });
    }

    if (mode_toggle_mobile) {
        mode_toggle_mobile.addEventListener("click", function() {
            toggleTheme(localStorage.getItem("theme"));
        });
    }
});

