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
    document.querySelectorAll("[data-contact-address]").forEach((n) => {
      n.textContent = cfg.addressDisplay || "";
    });
    document.querySelectorAll("a[data-contact-maps]").forEach((a) => {
      const url = cfg.mapsUrl || "#";
      a.setAttribute("href", url);
      if (url && url !== "#") {
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "noopener noreferrer");
      }
    });
    document.querySelectorAll("[data-contact-instagram]").forEach((n) => {
      const url = cfg.instagramUrl || "#";
      if (n.tagName === "A") n.href = url;
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
      "headspa-duo-basis": {
        title: "Chana Headspa Duo: Basis",
        image: "arrangement%20pictures/Duoarrangement.png",
        price: "€180",
        subtitle: "Samen de Signature Headspa Basis",
        description:
          "Voor twee personen die samen willen ontspannen. Jullie beleven allebei de Signature Headspa Chana Basis: rust, hoofdhuidverzorging en een verzorgde finish in één gedeeld moment.",
        bullets: [
          "Signature Headspa Basis voor twee",
          "Persoonlijke aandacht in een rustige setting",
          "Focus op ontspanning en comfort",
          "Vaste prijs: €180",
        ],
      },
      "headspa-duo-luxury": {
        title: "Chana Headspa Duo: Luxury",
        image: "arrangement%20pictures/Duoarrangement.png",
        price: "€230",
        subtitle: "Samen de Luxury Headspa",
        description:
          "Een rijkere head spa-ervaring voor twee. Meer tijd, intensievere verzorging en een luxe afronding, ideaal om samen écht te landen.",
        bullets: [
          "Chana Headspa Luxury voor twee",
          "Uitgebreidere verzorging en massage",
          "Luxe sfeer en persoonlijke begeleiding",
          "Vaste prijs: €230",
        ],
      },
      "headspa-duo-royal": {
        title: "Chana Headspa Duo: Royal",
        image: "arrangement%20pictures/Duoarrangement.png",
        price: "€295",
        subtitle: "Samen het Royal ritueel",
        description:
          "Het meest complete head spa-duo: Royal voor jullie allebei, inclusief De-Stress Facial. Maximale rust, intensieve verzorging en een premium finish.",
        bullets: [
          "Chana Royal Headspa voor twee (incl. De-Stress Facial)",
          "Meest uitgebreide ritueel",
          "Premium beleving van begin tot eind",
          "Vaste prijs: €295",
        ],
      },
      "royal-duo-high-tea": {
        title: "Chana Royal Headspa Duo + styling + mini high tea",
        image: "arrangement%20pictures/duohightea.png",
        price: "€385",
        subtitle: "Royal voor twee, styling naar keuze, afgesloten met mini high tea",
        description:
          "Royal Headspa voor twee personen (inclusief De-Stress Facial), plus styling naar keuze (Luxury blow out, Signature curls of Straight finish). We sluiten af met een Chana Mini High Tea, het complete verwenmoment van verzorging tot nagenieten.",
        bullets: [
          "Chana Royal Headspa voor twee (incl. De-Stress Facial)",
          "Styling naar keuze: Luxury blow out, Signature curls of Straight finish",
          "Afgesloten met Chana Mini High Tea",
          "Volledige beleving van ontvangst tot afronding",
          "Vaste prijs: €385",
        ],
      },
      "zussen-spa-day": {
        title: "Zussen spa day",
        image: "arrangement%20pictures/zussenspa.png",
        price: "€390",
        subtitle: "Een ontspannen dag om samen op te laden",
        description:
          "De zussen spa day is een gepersonaliseerd duo-moment: samen ontspannen, genieten en verzorgd worden. We stemmen de invulling af op jullie wensen, van head spa tot combinaties.",
        bullets: [
          "Rustig ontvangst en persoonlijke begeleiding",
          "Behandelingen afgestemd op jullie wensen",
          "Focus op ontspanning, verbinding en comfort",
          "Vaste prijs: €390",
        ],
      },
      "moeder-dochter-spa-day": {
        title: "Moeder dochter spa day",
        image: "arrangement%20pictures/moederdochterspa.png",
        price: "€390",
        subtitle: "Een bijzonder moment van aandacht en verbinding",
        description:
          "Een gepersonaliseerd duo-arrangement voor moeder en dochter. Samen vertragen, verzorgd worden en genieten in een warme, luxe setting.",
        bullets: [
          "Persoonlijke intake voor moeder en dochter",
          "Ontspannende en verzorgende behandeling op maat",
          "Luxe sfeer met focus op comfort en beleving",
          "Vaste prijs: €390",
        ],
      },
      "vrienden-spa-day": {
        title: "Vriendinnen spa day",
        image: "arrangement%20pictures/vriendenspa.png",
        price: "€390",
        subtitle: "Samen genieten van een complete spa-beleving",
        description:
          "Voor vriendinnen die een luxe en ontspannen uitje zoeken. Een gepersonaliseerd duo-moment met verzorging en gezelligheid, precies zoals jullie het willen.",
        bullets: [
          "Duo-moment met behandelingen op maat",
          "Ontspanning en verzorging in een warme setting",
          "Tijd voor quality time zonder haast",
          "Vaste prijs: €390",
        ],
      },
    };

    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("arr") || "";
    const fromHash = (window.location.hash || "").replace("#", "").trim();
    const fromStore = sessionStorage.getItem("arrangementKey") || "";
    const key = fromQuery || fromHash || fromStore;
    const data = map[key] || map["headspa-duo-basis"];

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

  function initHeroVideo() {
    const video = document.querySelector("[data-hero-video]");
    if (!video) return;

    const poster = String(cfg.heroPoster || "").trim();
    if (poster) video.setAttribute("poster", poster);

    const local = String(cfg.heroVideo || "").trim();
    const remote = String(cfg.heroVideoRemote || "").trim();

    function tryPlay() {
      const play = video.play();
      if (play && typeof play.catch === "function") play.catch(() => {});
    }

    function setSource(src) {
      if (!src) return;
      video.innerHTML = "";
      const source = document.createElement("source");
      source.src = src;
      source.type = "video/mp4";
      video.appendChild(source);
      video.load();
      tryPlay();
    }

    async function boot() {
      let src = remote;
      if (local) {
        try {
          const res = await fetch(local, { method: "HEAD" });
          if (res.ok) src = local;
        } catch {
          /* gebruik remote placeholder */
        }
      }
      setSource(src);
    }

    video.addEventListener("loadeddata", tryPlay, { once: true });
    boot();
  }

  function initLogo() {
    const logo = String(cfg.logo || "").trim();
    if (!logo) return;
    document.querySelectorAll("[data-site-logo]").forEach((img) => {
      img.src = logo;
    });
  }

  function initScrollReveal() {
    const els = document.querySelectorAll("[data-reveal]");
    if (!els.length || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -30px 0px" }
    );
    els.forEach((el) => io.observe(el));
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
    initLogo();
    initHeroVideo();
    initScrollReveal();
    initWaLinks();
    initContactInject();
    initTreatmentPage();
    initArrangementCards();
    initArrangementDetailPage();
  });
})();
