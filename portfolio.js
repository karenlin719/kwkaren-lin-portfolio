const landing = document.querySelector(".landing");
const index = document.querySelector(".index");
const projectGrid = document.querySelector(".grid");
const viewer = document.querySelector("dialog");
const projectTitle = document.querySelector("#project-title");
const stage = document.querySelector(".stage");
const slide = stage.querySelector("img");
const counter = document.querySelector(".viewer-count");
let activeProject;
let slideIndex = 0;
let touchStart = null;

function syncView(moveFocus = false) {
  const showIndex = location.hash === "#index";
  if (viewer.open) viewer.close();
  landing.hidden = showIndex;
  index.hidden = !showIndex;
  resetField();
  if (moveFocus) (showIndex ? index : landing).focus();
}

function showSlide(offset = 0) {
  const total = activeProject.slides.length;
  slideIndex = (slideIndex + offset + total) % total;
  slide.src = activeProject.slides[slideIndex];
  slide.alt = `${activeProject.title}, image ${slideIndex + 1}`;
  counter.textContent = `${slideIndex + 1} / ${total}`;
}

for (const project of projects) {
  const item = document.createElement("li");
  const tile = document.createElement(project.url ? "a" : "button");
  const label = document.createElement("span");
  const cover = document.createElement("img");
  tile.className = "tile";
  label.textContent = project.title;
  cover.alt = "";
  cover.loading = "lazy";
  cover.src = project.cover;
  tile.append(label, cover);
  item.append(tile);
  projectGrid.append(item);

  if (project.url) {
    tile.href = project.url;
    tile.target = "_blank";
    tile.rel = "noopener noreferrer";
    tile.setAttribute("aria-label", "Photography on Flickr (opens in a new tab)");
  } else {
    tile.type = "button";
    tile.setAttribute("aria-haspopup", "dialog");
    tile.addEventListener("click", () => {
      activeProject = project;
      slideIndex = 0;
      projectTitle.textContent = project.title;
      showSlide();
      viewer.showModal();
    });
  }
}

const fieldMotion = window.matchMedia("(min-width: 850px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");

function resetField() {
  projectGrid.style.removeProperty("--field-x");
  projectGrid.style.removeProperty("--field-y");
}

index.addEventListener("pointermove", event => {
  if (!fieldMotion.matches || event.pointerType !== "mouse") return;
  const horizontal = (0.5 - event.clientX / window.innerWidth) * 90;
  const vertical = (0.5 - event.clientY / window.innerHeight) * 64;
  projectGrid.style.setProperty("--field-x", `${horizontal.toFixed(1)}px`);
  projectGrid.style.setProperty("--field-y", `${vertical.toFixed(1)}px`);
});
index.addEventListener("pointerleave", resetField);
fieldMotion.addEventListener("change", resetField);

document.querySelector("#close").addEventListener("click", () => viewer.close());
document.querySelector("#previous").addEventListener("click", () => showSlide(-1));
document.querySelector("#next").addEventListener("click", () => showSlide(1));
viewer.addEventListener("keydown", event => {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  event.preventDefault();
  showSlide(event.key === "ArrowLeft" ? -1 : 1);
});

stage.addEventListener("touchstart", event => {
  touchStart = event.touches.length === 1 ? event.touches[0] : null;
}, { passive: true });
stage.addEventListener("touchend", event => {
  if (!touchStart) return;
  const touch = event.changedTouches[0];
  const horizontal = touch.clientX - touchStart.clientX;
  const vertical = touch.clientY - touchStart.clientY;
  touchStart = null;
  if (Math.abs(horizontal) > Math.max(45, Math.abs(vertical))) showSlide(horizontal < 0 ? 1 : -1);
}, { passive: true });
stage.addEventListener("touchcancel", () => { touchStart = null; });

window.addEventListener("hashchange", () => syncView(true));
syncView();
