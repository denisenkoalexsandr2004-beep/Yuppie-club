const APPS_SCRIPT_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycby_8XVIyvDRoC4GZhbDk0IBjrt1Y_LYh765Ryb2ZvR1s4b45SakPeJqclzoTzCMCld9Ew/exec";

const root = document.documentElement;
const revealItems = document.querySelectorAll(
  ".reveal, .intro-grid article, .cards article, .timeline article, .faq-list article"
);
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const nav = document.querySelector(".nav");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const form = document.getElementById("application-form");
const saveDraftButton = document.getElementById("save-draft");
const submitButton = document.getElementById("copy-application");
const formStatus = document.getElementById("form-status");
const storageKey = "private-club-application-draft";
const iframeName = "private-club-submit-frame";

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function updateProgress() {
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? Math.round((window.scrollY / maxScroll) * 100) : 0;
  root.style.setProperty("--progress", clamp(progress, 0, 100));
}

function revealImmediately() {
  for (const item of revealItems) {
    item.classList.add("is-visible");
  }
}

function setStatus(message) {
  if (formStatus) {
    formStatus.textContent = message;
  }
}

function setSubmitButtonState(isBusy) {
  if (!submitButton) {
    return;
  }

  submitButton.disabled = isBusy;
  submitButton.textContent = isBusy ? "Отправляем..." : "Отправить в Telegram";
}

function validateForm() {
  if (!form) {
    return false;
  }

  const requiredFields = ["name", "goal", "contact"];

  for (const fieldName of requiredFields) {
    const field = form.elements.namedItem(fieldName);

    if (field && !field.value.trim()) {
      field.focus();
      setStatus("Заполни имя, цель и контакт, чтобы отправить заявку.");
      return false;
    }
  }

  return true;
}

function getDraft() {
  if (!form) {
    return {};
  }

  return Object.fromEntries(new FormData(form).entries());
}

function saveDraft() {
  if (!form) {
    return;
  }

  localStorage.setItem(storageKey, JSON.stringify(getDraft()));
}

function loadDraft() {
  if (!form) {
    return;
  }

  const savedDraft = localStorage.getItem(storageKey);

  if (!savedDraft) {
    return;
  }

  try {
    const parsedDraft = JSON.parse(savedDraft);

    for (const [key, value] of Object.entries(parsedDraft)) {
      const field = form.elements.namedItem(key);

      if (field && typeof value === "string") {
        field.value = value;
      }
    }
  } catch (error) {
    localStorage.removeItem(storageKey);
  }
}

function ensureSubmitFrame() {
  let iframe = document.getElementById(iframeName);

  if (!iframe) {
    iframe = document.createElement("iframe");
    iframe.id = iframeName;
    iframe.name = iframeName;
    iframe.hidden = true;
    document.body.appendChild(iframe);
  }

  return iframe;
}

function upsertHiddenField(fieldName, value) {
  let hiddenField = form.querySelector(`input[type="hidden"][name="${fieldName}"]`);

  if (!hiddenField) {
    hiddenField = document.createElement("input");
    hiddenField.type = "hidden";
    hiddenField.name = fieldName;
    form.appendChild(hiddenField);
  }

  hiddenField.value = value;
}

function sendApplication() {
  if (!form || !validateForm()) {
    return;
  }

  if (!APPS_SCRIPT_WEBHOOK_URL || APPS_SCRIPT_WEBHOOK_URL.includes("PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEBHOOK_HERE")) {
    setStatus("Сначала вставь ссылку Google Apps Script в файл script.js.");
    return;
  }

  saveDraft();
  setSubmitButtonState(true);
  setStatus("Отправляем заявку...");

  ensureSubmitFrame();
  upsertHiddenField("submittedAt", new Date().toISOString());
  upsertHiddenField("source", "Private Club website");

  form.method = "POST";
  form.action = APPS_SCRIPT_WEBHOOK_URL;
  form.target = iframeName;
  form.enctype = "application/x-www-form-urlencoded";

  try {
    form.submit();

    window.setTimeout(() => {
      setStatus("Заявка отправлена. Проверь Telegram и таблицу.");
      form.reset();
      localStorage.removeItem(storageKey);
      setSubmitButtonState(false);
    }, 900);
  } catch (error) {
    setStatus("Не удалось отправить заявку. Проверь подключение и попробуй еще раз.");
    setSubmitButtonState(false);
  }
}

function bootRevealAnimations() {
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealImmediately();
    return;
  }

  window.addEventListener("pointermove", (event) => {
    const x = (event.clientX / window.innerWidth - 0.5).toFixed(3);
    const y = (event.clientY / window.innerHeight - 0.5).toFixed(3);
    root.style.setProperty("--mx", x);
    root.style.setProperty("--my", y);
  });

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    }
  }, { threshold: 0.14 });

  for (const item of revealItems) {
    observer.observe(item);
  }
}

function bootPageTransition() {
  const transition = document.createElement("div");
  transition.className = "page-transition";
  document.body.appendChild(transition);

  requestAnimationFrame(() => {
    document.body.classList.add("page-ready");
  });

  if (prefersReducedMotion) {
    return;
  }

  const links = document.querySelectorAll("a[href]");

  for (const link of links) {
    const href = link.getAttribute("href");

    if (!href || href.startsWith("#") || link.target === "_blank" || link.hasAttribute("download")) {
      continue;
    }

    const isInternalPage =
      href.endsWith(".html") ||
      href.includes(".html#") ||
      /^[a-z0-9-]+\.html(?:#.*)?$/i.test(href);

    if (!isInternalPage) {
      continue;
    }

    link.addEventListener("click", (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      event.preventDefault();
      document.body.classList.add("is-transitioning");

      window.setTimeout(() => {
        window.location.href = href;
      }, 320);
    });
  }
}

function bootNav() {
  if (!nav || !navToggle || !navLinks) {
    return;
  }

  const openLabel = "Открыть меню";
  const closeLabel = "Закрыть меню";

  const closeNav = () => {
    nav.classList.remove("is-open");
    document.body.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", openLabel);
  };

  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    document.body.classList.toggle("nav-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? closeLabel : openLabel);
  });

  for (const link of navLinks.querySelectorAll("a")) {
    link.addEventListener("click", closeNav);
  }

  window.addEventListener("resize", () => {
    if (window.innerWidth > 720) {
      closeNav();
    }
  });
}

function bootForm() {
  if (!form) {
    return;
  }

  loadDraft();

  form.addEventListener("input", () => {
    saveDraft();
    setStatus("");
  });

  if (saveDraftButton) {
    saveDraftButton.addEventListener("click", () => {
      saveDraft();
      setStatus("Черновик анкеты сохранен в этом браузере.");
    });
  }

  if (submitButton) {
    submitButton.addEventListener("click", sendApplication);
  }
}

bootRevealAnimations();
bootPageTransition();
bootNav();
bootForm();

window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress);
updateProgress();
