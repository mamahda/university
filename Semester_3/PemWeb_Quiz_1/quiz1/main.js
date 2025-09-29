import Home from "/quiz1/pages/home.js";
import Profile from "/quiz1/pages/profile.js";
import Hometown from "/quiz1/pages/hometown.js";
import Food from "/quiz1/pages/food.js";
import Tourist, { initTourist } from "/quiz1/pages/tourist.js";

const routes = {
  "/quiz1/": Home(),
  "/quiz1": Home(),
  "/quiz1/profile": Profile(),
  "/quiz1/hometown": Hometown(),
  "/quiz1/food": Food(),
  "/quiz1/tourist": Tourist(),
};

function navigateTo(url) {
  history.pushState(null, null, url);
  router();
}

function router() {
  const path = location.pathname;
  const app = document.getElementById("app");

  app.classList.add("page-out");

  setTimeout(() => {
    app.innerHTML = routes[path] || "<h1>404 - Page Not Found</h1>";

    app.classList.remove("page-out");
    window.scrollTo(0, 0);

    if (path === "/quiz1/tourist") initTourist();
  }, 800);
}

document.addEventListener("click", (e) => {
  if (e.target.matches("[data-link]")) {
    e.preventDefault();
    navigateTo(e.target.getAttribute("href"));
  }
});


window.addEventListener("popstate", router);
window.addEventListener("DOMContentLoaded", router);