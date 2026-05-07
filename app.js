document.documentElement.classList.add("js");
document.body.classList.add("page-enter");

const reveals = document.querySelectorAll(".reveal");
const nav = document.querySelector(".site-nav");
const navToggle = document.querySelector(".nav-toggle");
const cursor = document.querySelector(".cursor");
const statusNode = document.querySelector(".form-status");
const compactTextNodes = document.querySelectorAll("[data-mobile-text]");
const mobileTextQuery = window.matchMedia("(max-width: 560px)");

window.addEventListener("load", () => {
  requestAnimationFrame(() => {
    document.body.classList.remove("page-enter");
  });
});

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    }
  }, { threshold: 0.16 });

  for (const item of reveals) {
    observer.observe(item);
  }
} else {
  for (const item of reveals) {
    item.classList.add("is-visible");
  }
}

if (nav && navToggle) {
  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    document.body.classList.toggle("nav-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  for (const link of nav.querySelectorAll("a")) {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      document.body.classList.remove("nav-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  }
}

function syncMobileCopy() {
  for (const node of compactTextNodes) {
    if (!node.dataset.desktopHtml) {
      node.dataset.desktopHtml = node.innerHTML;
      node.dataset.expanded = "false";
    }

    const next = node.nextElementSibling;
    const hasToggle = next && next.classList.contains("mobile-copy-toggle");

    if (!mobileTextQuery.matches) {
      node.innerHTML = node.dataset.desktopHtml;
      node.dataset.expanded = "false";
      node.classList.remove("is-mobile-collapsed");

      if (hasToggle) {
        next.remove();
      }

      continue;
    }

    const isExpanded = node.dataset.expanded === "true";
    node.innerHTML = isExpanded ? node.dataset.desktopHtml : node.dataset.mobileText;
    node.classList.toggle("is-mobile-collapsed", !isExpanded);

    let toggle = next;

    if (!hasToggle) {
      toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "mobile-copy-toggle";
      toggle.addEventListener("click", () => {
        const expanded = node.dataset.expanded === "true";
        node.dataset.expanded = expanded ? "false" : "true";
        node.innerHTML = expanded ? node.dataset.mobileText : node.dataset.desktopHtml;
        node.classList.toggle("is-mobile-collapsed", expanded);
        toggle.textContent = expanded ? "Полный текст" : "Свернуть";
      });
      node.insertAdjacentElement("afterend", toggle);
    }

    toggle.textContent = isExpanded ? "Свернуть" : "Полный текст";
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

const applicationForm = document.getElementById("membership-form");

if (applicationForm && statusNode) {
  applicationForm.addEventListener("submit", (event) => {
    event.preventDefault();
    statusNode.textContent = "Заявка принята. Следующий шаг — личное подтверждение и приглашение в клуб.";
    applicationForm.reset();
  });
}
