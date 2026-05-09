document.documentElement.classList.add("js");
document.body.classList.add("page-enter");

const reveals = document.querySelectorAll(".reveal");
const nav = document.querySelector(".site-nav");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const navAux = document.querySelector(".nav-aux");
const cursor = document.querySelector(".cursor");
const statusNode = document.querySelector(".form-status");
const compactTextNodes = document.querySelectorAll("[data-mobile-text]");
const mobileTextQuery = window.matchMedia("(max-width: 560px)");
const mobileNavQuery = window.matchMedia("(max-width: 820px)");
const footer = document.querySelector(".footer");

const siteJourney = [
  { href: "club.html", label: "РРЅС„РѕСЂРјР°С†РёСЏ", meta: "Рћ РєР»СѓР±Рµ" },
  { href: "appearance.html", label: "Р’РЅРµС€РЅРѕСЃС‚СЊ", meta: "Р¤РѕСЂРјР° Рё СЃС‚РёР»СЊ" },
  { href: "business.html", label: "Р‘РёР·РЅРµСЃ", meta: "РњС‹С€Р»РµРЅРёРµ Рё РјР°СЃС€С‚Р°Р±" },
  { href: "art.html", label: "РСЃРєСѓСЃСЃС‚РІРѕ", meta: "РљСѓР»СЊС‚СѓСЂРЅР°СЏ РѕРїРѕСЂР°" },
  { href: "cellar.html", label: "Р’РєСѓСЃ", meta: "РЎС‚РѕР» Рё РЅР°РїРёС‚РєРё" },
  { href: "membership.html", label: "Р§Р»РµРЅСЃС‚РІРѕ", meta: "Р¤РѕСЂРјР°С‚ РґРѕСЃС‚СѓРїР°" },
  { href: "apply.html", label: "Р—Р°РїСЂРѕСЃ", meta: "РђРЅРєРµС‚Р° РєР»СѓР±Р°" },
];

window.addEventListener("load", () => {
  requestAnimationFrame(() => {
    document.body.classList.remove("page-enter");
  });
});

for (const [index, item] of document.querySelectorAll(".grid-3 .stat-card, .cards .page-card, .event-list .event-row, .pillars .pillar, .step-list .step").entries()) {
  if (!item.classList.contains("reveal")) {
    item.classList.add("reveal");
  }

  item.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
}

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    }
  }, { threshold: 0.16 });

  for (const item of document.querySelectorAll(".reveal")) {
    observer.observe(item);
  }
} else {
  for (const item of document.querySelectorAll(".reveal")) {
    item.classList.add("is-visible");
  }
}

function closeNav() {
  if (!nav || !navToggle) {
    return;
  }

  nav.classList.remove("is-open");
  document.body.classList.remove("nav-open");
  navToggle.setAttribute("aria-expanded", "false");
}

let mobileLoginLink = null;

function syncNavLayout() {
  if (!navLinks || !navAux) {
    return;
  }

  const navAuxLink = navAux.querySelector("a");

  if (!navAuxLink) {
    return;
  }

  if (mobileNavQuery.matches) {
    if (!mobileLoginLink) {
      mobileLoginLink = navAuxLink.cloneNode(true);
      mobileLoginLink.classList.add("nav-login-mobile");
    }

    if (!navLinks.contains(mobileLoginLink)) {
      navLinks.appendChild(mobileLoginLink);
    }

    navAux.hidden = true;
  } else {
    if (mobileLoginLink && mobileLoginLink.parentElement === navLinks) {
      mobileLoginLink.remove();
    }

    navAux.hidden = false;
  }
}


if (nav && navToggle) {
  syncNavLayout();

  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    document.body.classList.toggle("nav-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      closeNav();
    }
  });

  document.addEventListener("click", (event) => {
    if (nav.classList.contains("is-open") && !nav.contains(event.target)) {
      closeNav();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeNav();
    }
  });

  if (typeof mobileNavQuery.addEventListener === "function") {
    mobileNavQuery.addEventListener("change", () => {
      syncNavLayout();
      closeNav();
    });
  } else if (typeof mobileNavQuery.addListener === "function") {
    mobileNavQuery.addListener(() => {
      syncNavLayout();
      closeNav();
    });
  }

  window.addEventListener("resize", () => {
    if (window.innerWidth > 820) {
      closeNav();
    }
  });
}

function syncMobileCopy() {
  for (const node of compactTextNodes) {
    if (!node.dataset.desktopHtml) {
      node.dataset.desktopHtml = node.innerHTML;
    }

    node.innerHTML = mobileTextQuery.matches
      ? node.dataset.mobileText
      : node.dataset.desktopHtml;
  }
}

syncMobileCopy();

if (typeof mobileTextQuery.addEventListener === "function") {
  mobileTextQuery.addEventListener("change", syncMobileCopy);
} else if (typeof mobileTextQuery.addListener === "function") {
  mobileTextQuery.addListener(syncMobileCopy);
}

if (window.matchMedia("(pointer:fine)").matches && cursor) {
  cursor.classList.add("is-visible");

  window.addEventListener("mousemove", (event) => {
    cursor.style.transform = `translate(${event.clientX - 11}px, ${event.clientY - 11}px)`;
  });

  for (const target of document.querySelectorAll("a, button, input, textarea, select")) {
    target.addEventListener("mouseenter", () => cursor.classList.add("is-active"));
    target.addEventListener("mouseleave", () => cursor.classList.remove("is-active"));
  }
}

const parallaxImages = document.querySelectorAll(".hero-card img, .feature-media img");

if (parallaxImages.length) {
  let parallaxTicking = false;

  const updateParallax = () => {
    for (const image of parallaxImages) {
      const rect = image.parentElement.getBoundingClientRect();
      const shift = (rect.top - window.innerHeight * 0.5) * -0.03;
      image.style.transform = `scale(1.08) translate3d(0, ${shift.toFixed(2)}px, 0)`;
    }

    parallaxTicking = false;
  };

  updateParallax();

  window.addEventListener("scroll", () => {
    if (!parallaxTicking) {
      requestAnimationFrame(updateParallax);
      parallaxTicking = true;
    }
  }, { passive: true });

  window.addEventListener("resize", updateParallax);
}

for (const link of document.querySelectorAll('a[href$=".html"]')) {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");
    const currentFile = window.location.pathname.split("/").pop() || "index.html";

    if (!href || href.startsWith("#") || href === currentFile || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === "_blank") {
      if (href === currentFile) {
        event.preventDefault();
        closeNav();
      }
      return;
    }

    event.preventDefault();
    closeNav();
    document.body.classList.add("page-leave");

    window.setTimeout(() => {
      window.location.href = href;
    }, 260);
  });
}

const applicationForm = document.getElementById("membership-form");

if (applicationForm && statusNode) {
  applicationForm.addEventListener("submit", (event) => {
    event.preventDefault();
    statusNode.textContent = "Р—Р°СЏРІРєР° РїСЂРёРЅСЏС‚Р°. РЎР»РµРґСѓСЋС‰РёР№ С€Р°Рі вЂ” Р»РёС‡РЅРѕРµ РїРѕРґС‚РІРµСЂР¶РґРµРЅРёРµ Рё РїСЂРёРіР»Р°С€РµРЅРёРµ РІ РєР»СѓР±.";
    applicationForm.reset();
  });
}

