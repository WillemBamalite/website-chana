(function () {
  const cfg = window.CHANA_SITE || {};
  const PREVIEW_SESSION_KEY = "chl_preview_unlock_v1";

  function initPreviewGate() {
    if (!cfg.previewLock) return;
    if (sessionStorage.getItem(PREVIEW_SESSION_KEY) === "1") return;

    function mount() {
      if (document.getElementById("chl-preview-gate")) return;
      const user = String(cfg.previewUser || "").trim();
      const pass = String(cfg.previewPass || "");
      const wrap = document.createElement("div");
      wrap.id = "chl-preview-gate";
      wrap.setAttribute("role", "dialog");
      wrap.setAttribute("aria-modal", "true");
      wrap.setAttribute("aria-labelledby", "chl-preview-title");
      wrap.style.cssText =
        "position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:1.5rem;background:rgba(26,22,24,.88);backdrop-filter:blur(6px);font-family:Outfit,system-ui,sans-serif;";
      wrap.innerHTML = `
        <div style="max-width:26rem;width:100%;background:#fffaf8;border:1px solid rgba(199,162,168,.45);border-radius:16px;padding:1.75rem 1.5rem;box-shadow:0 18px 48px rgba(26,22,24,.2);color:#2b2225;">
          <h1 id="chl-preview-title" style="margin:0 0 .5rem;font-size:1.25rem;font-weight:600;font-family:'Cormorant Garamond',Georgia,serif;">Website tijdelijk niet openbaar</h1>
          <p style="margin:0 0 1rem;font-size:.95rem;line-height:1.5;opacity:.92;">We zijn nog bezig met de site. Heb je toegang gekregen? Log hieronder in. Geen gegevens? Neem contact op met Chana Beauty Lounge.</p>
          <form id="chl-preview-form" style="display:grid;gap:.75rem;">
            <label style="display:grid;gap:.25rem;font-size:.85rem;">
              Gebruikersnaam
              <input name="u" autocomplete="username" required style="padding:.55rem .75rem;border:1px solid rgba(199,162,168,.5);border-radius:10px;font:inherit;" />
            </label>
            <label style="display:grid;gap:.25rem;font-size:.85rem;">
              Wachtwoord
              <input name="p" type="password" autocomplete="current-password" required style="padding:.55rem .75rem;border:1px solid rgba(199,162,168,.5);border-radius:10px;font:inherit;" />
            </label>
            <p id="chl-preview-err" style="display:none;margin:0;font-size:.85rem;color:#9b2c3a;"></p>
            <button type="submit" style="margin-top:.25rem;padding:.65rem 1rem;border:none;border-radius:999px;background:#7d4f56;color:#fff;font:inherit;font-weight:600;cursor:pointer;">Site openen</button>
          </form>
        </div>`;
      document.body.appendChild(wrap);
      document.body.style.overflow = "hidden";

      const form = wrap.querySelector("#chl-preview-form");
      const err = wrap.querySelector("#chl-preview-err");
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const u = String(fd.get("u") || "").trim();
        const p = String(fd.get("p") || "");
        if (u === user && p === pass) {
          sessionStorage.setItem(PREVIEW_SESSION_KEY, "1");
          wrap.remove();
          document.body.style.overflow = "";
        } else {
          err.style.display = "block";
          err.textContent = "Dat hoort niet bij elkaar. Probeer opnieuw.";
        }
      });
    }

    if (document.body) mount();
    else document.addEventListener("DOMContentLoaded", mount, { once: true });
  }

  initPreviewGate();

  function waLink(text) {
    const phone = (cfg.whatsappPhone || "").replace(/\D/g, "");
    const msg = encodeURIComponent(text || cfg.defaultWaText || "");
    return phone ? `https://wa.me/${phone}?text=${msg}` : "#";
  }

  function initNav() {
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.querySelector(".nav");
    const overlay = document.querySelector(".nav-overlay");
    if (!toggle || !nav) return;

    function close() {
      nav.classList.remove("is-open");
      overlay?.classList.remove("is-visible");
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }

    function open() {
      nav.classList.add("is-open");
      overlay?.classList.add("is-visible");
      toggle.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    }

    toggle.addEventListener("click", () => {
      if (nav.classList.contains("is-open")) close();
      else open();
    });

    overlay?.addEventListener("click", close);

    nav.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        if (window.matchMedia("(max-width: 899px)").matches) close();
      });
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
  }

  function initWaLinks() {
    document.querySelectorAll("[data-wa]").forEach((el) => {
      const custom = el.getAttribute("data-wa-text");
      el.setAttribute("href", waLink(custom || undefined));
      if (el.getAttribute("href") === "#") {
        el.addEventListener("click", (e) => e.preventDefault());
      }
    });
  }

  function telHref() {
    const digits = String(cfg.phoneTelDigits || cfg.whatsappPhone || "").replace(
      /\D/g,
      ""
    );
    return digits ? `tel:+${digits}` : "#";
  }

  function initContactInject() {
    document.querySelectorAll("[data-contact-phone]").forEach((n) => {
      n.textContent = cfg.phoneDisplay || "";
    });
    document.querySelectorAll("a[data-contact-tel]").forEach((a) => {
      a.setAttribute("href", telHref());
    });
    document.querySelectorAll("a[data-contact-email], a[data-email-card]").forEach((n) => {
      const em = cfg.email || "";
      if (n.tagName === "A") n.href = em ? `mailto:${em}` : "#";
    });
    document.querySelectorAll("[data-email-text]").forEach((n) => {
      n.textContent = cfg.email || "";
    });
    document.querySelectorAll("[data-contact-instagram]").forEach((n) => {
      const url = cfg.instagramUrl || "#";
      if (n.tagName === "A") n.href = url;
    });
  }

  function initForm() {
    const form = document.getElementById("aanvraag-form");
    const success = document.getElementById("form-success");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const lines = [
        `Naam: ${fd.get("naam") || ""}`,
        `Telefoon: ${fd.get("telefoon") || ""}`,
        `E-mail: ${fd.get("email") || ""}`,
        `Behandeling: ${fd.get("behandeling") || ""}`,
        `Voorkeursdatum: ${fd.get("datum") || ""}`,
        `Voorkeurstijd: ${fd.get("tijd") || ""}`,
        `Opmerking: ${fd.get("opmerking") || ""}`,
      ];
      const subject = encodeURIComponent("Afspraakaanvraag — Chana Beauty Lounge");
      const body = encodeURIComponent(lines.join("\n"));
      const mail = cfg.email || "";
      if (mail) {
        window.location.href = `mailto:${mail}?subject=${subject}&body=${body}`;
      }
      form.reset();
      success?.classList.add("is-visible");
      success?.setAttribute("tabindex", "-1");
      success?.focus();
    });
  }

  function initTreatmentPage() {
    const page = document.querySelector('[data-page="behandelingen"]');
    if (!page) return;

    const sections = Array.from(document.querySelectorAll(".treatment-cat[data-category]"));
    const filterLinks = Array.from(document.querySelectorAll("[data-show-category]"));
    const showAllBtn = document.querySelector("[data-show-all-categories]");
    const activeLabel = document.querySelector("[data-active-category-label]");

    if (!sections.length) return;

    const allowed = new Set(sections.map((s) => s.getAttribute("data-category")));

    function titleFor(category) {
      const sec = sections.find((s) => s.getAttribute("data-category") === category);
      return sec?.querySelector("h2")?.textContent?.trim() || category;
    }

    function updateNav(category) {
      filterLinks.forEach((link) => {
        const key = link.getAttribute("data-show-category");
        link.classList.toggle("is-active", key === category);
      });
      if (!activeLabel) return;
      if (!category) {
        activeLabel.textContent = "";
      } else {
        activeLabel.textContent = `Je bekijkt nu alleen: ${titleFor(category)}.`;
      }
    }

    function applyFilter(category) {
      sections.forEach((sec) => {
        const matches = !category || sec.getAttribute("data-category") === category;
        sec.classList.toggle("is-hidden", !matches);
      });
      showAllBtn?.classList.toggle("is-hidden", !category);
      updateNav(category);
    }

    function categoryFromHash() {
      const hash = window.location.hash.replace("#", "").trim();
      return allowed.has(hash) ? hash : "";
    }

    filterLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const category = link.getAttribute("data-show-category") || "";
        if (!allowed.has(category)) return;
        history.replaceState(null, "", `#${category}`);
        applyFilter(category);
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });

    showAllBtn?.addEventListener("click", () => {
      history.replaceState(null, "", window.location.pathname);
      applyFilter("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    window.addEventListener("hashchange", () => {
      applyFilter(categoryFromHash());
    });

    applyFilter(categoryFromHash());
  }

  function initArrangementDetailPage() {
    const page = document.querySelector('[data-page="arrangement-detail"]');
    if (!page) return;

    const titleEl = document.getElementById("arr-title");
    const subtitleEl = document.getElementById("arr-subtitle");
    const priceEl = document.getElementById("arr-price");
    const descEl = document.getElementById("arr-description");
    const imageEl = document.getElementById("arr-image");
    const listEl = document.getElementById("arr-expect-list");

    const map = {
      "behandelingen-duo": {
        title: "Behandelingen duo",
        image: "arrangement%20pictures/Duoarrangement.png",
        price: "Vanaf €149",
        subtitle: "Samen ontspannen met persoonlijke aandacht",
        description:
          "Dit duo-arrangement is perfect voor twee personen die samen willen ontspannen en verzorgd willen worden in een rustige, luxe setting. We stemmen de invulling af op jullie wensen, zodat jullie allebei een behandeling krijgen die echt past.",
        bullets: [
          "Persoonlijke intake en afstemming per persoon",
          "Duo-behandeling met focus op rust en comfort",
          "Tijd om samen te ontspannen in een warme sfeer",
          "Afsluiting met persoonlijk advies en nazorgtips",
        ],
      },
      "duo-high-tea": {
        title: "Behandelingen duo met mini high tea",
        image: "arrangement%20pictures/duohightea.png",
        price: "Vanaf €179",
        subtitle: "Luxe duo-moment met een smaakvolle afsluiting",
        description:
          "Voor wie net dat beetje extra wil: een verzorgend duo-arrangement gecombineerd met een mini high tea. Ideaal voor een bijzonder verwenmoment samen of als luxe cadeau-ervaring.",
        bullets: [
          "Persoonlijke duo-behandeling in een ontspannen setting",
          "Zorg, rust en aandacht voor beide personen",
          "Mini high tea als luxe en gezellige afsluiting",
          "Volledige beleving van ontvangst tot afronding",
        ],
      },
      "zussen-spa-day": {
        title: "Zussen spa day",
        image: "arrangement%20pictures/zussenspa.png",
        price: "Vanaf €149",
        subtitle: "Een ontspannen dag om samen op te laden",
        description:
          "De zussen spa day is ontworpen voor quality time met je zus: samen ontspannen, genieten en verzorgd worden in een rustige en luxe omgeving. Een dag waarin beleving en verbinding centraal staan.",
        bullets: [
          "Rustig ontvangst en persoonlijke begeleiding",
          "Verzorgende behandelingen afgestemd op jullie wensen",
          "Focus op ontspanning, verbinding en comfort",
          "Een dag die echt voelt als samen opladen",
        ],
      },
      "moeder-dochter-spa-day": {
        title: "Moeder dochter spa day",
        image: "arrangement%20pictures/moederdochterspa.png",
        price: "Vanaf €149",
        subtitle: "Een bijzonder moment van aandacht en verbinding",
        description:
          "Dit arrangement draait om samen genieten en bewust vertragen. Een warme keuze voor moeder en dochter die een verzorgend, luxe en verbindend moment met elkaar willen beleven.",
        bullets: [
          "Persoonlijke intake voor moeder en dochter",
          "Ontspannende en verzorgende behandeling op maat",
          "Luxe sfeer met focus op comfort en beleving",
          "Een waardevol moment om samen te delen",
        ],
      },
      "vrienden-spa-day": {
        title: "Vrienden spa day",
        image: "arrangement%20pictures/vriendenspa.png",
        price: "Vanaf €149",
        subtitle: "Samen genieten van een complete spa-beleving",
        description:
          "Voor vriendinnen die een luxe en ontspannen uitje zoeken. De vrienden spa day combineert verzorging met gezelligheid, zodat jullie samen echt kunnen ontladen.",
        bullets: [
          "Duo- of vriendenmoment met behandelingen op maat",
          "Ontspanning en verzorging in een warme setting",
          "Tijd voor quality time zonder haast",
          "Een ervaring die je samen bijblijft",
        ],
      },
    };

    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("arr") || "";
    const fromHash = (window.location.hash || "").replace("#", "").trim();
    const fromStore = sessionStorage.getItem("arrangementKey") || "";
    const key = fromQuery || fromHash || fromStore;
    const data = map[key] || map["behandelingen-duo"];

    if (titleEl) titleEl.textContent = data.title;
    if (subtitleEl) subtitleEl.textContent = data.subtitle;
    if (priceEl) priceEl.textContent = data.price || "";
    if (descEl) descEl.textContent = data.description;
    if (imageEl) {
      imageEl.src = data.image;
      imageEl.alt = data.title;
    }
    if (listEl) {
      listEl.innerHTML = data.bullets.map((b) => `<li>${b}</li>`).join("");
    }
  }

  function initArrangementCards() {
    document.querySelectorAll("[data-arr-key]").forEach((card) => {
      card.addEventListener("click", () => {
        const key = card.getAttribute("data-arr-key");
        if (key) sessionStorage.setItem("arrangementKey", key);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initNav();
    initWaLinks();
    initContactInject();
    initForm();
    initTreatmentPage();
    initArrangementCards();
    initArrangementDetailPage();
  });
})();
