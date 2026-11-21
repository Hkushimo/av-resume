const fallbackData = {
  name: "Hakeem Kushimo",
  headline: "AV Technician / Video Specialist / Graphics Operator",
  location: "Providence, RI / New England",
  contact: {
    phone: "401-854-6467",
    email: "hakeem@keemthedesigner.xyz",
    linkedin: "https://www.linkedin.com/in/hakeem-kushimo-b69b30178/"
  },
  availability: "Freelance, corporate, medical, convention, and hybrid events",
  summary: "Dynamic freelance AV technician and specialized graphics operator focused on corporate, medical, and hybrid events.",
  expertise: ["PlaybackPro", "Keynote", "PowerPoint", "Osee GoStream Duet", "Roland V-Series", "Blackmagic ATEM"],
  showKit: [],
  experience: [],
  selectedShows: []
};

let resumeData = fallbackData;
let activeShowFilter = "All";
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const getExperienceYears = (experience) => {
  const currentYear = new Date().getFullYear();
  const years = experience
    .map((item) => String(item.period || "").match(/\b(20\d{2})\b/))
    .filter(Boolean)
    .map((match) => Number(match[1]));

  if (!years.length) return "4+";
  return `${Math.max(1, currentYear - Math.min(...years))}+`;
};

const setText = (selector, value) => {
  document.querySelectorAll(selector).forEach((node) => {
    node.textContent = value || "";
  });
};

const renderContact = (data) => {
  const email = data.contact?.email || "";
  const phone = data.contact?.phone || "";
  const linkedin = data.contact?.linkedin || "";

  document.querySelectorAll('[data-link="email"]').forEach((node) => {
    node.setAttribute("href", `mailto:${email}`);
  });

  document.querySelectorAll('[data-link="phone"]').forEach((node) => {
    node.setAttribute("href", `tel:${phone.replace(/[^\d+]/g, "")}`);
  });

  document.querySelectorAll('[data-link="linkedin"]').forEach((node) => {
    node.setAttribute("href", linkedin || "#");
  });
};

const renderExperience = (items) => {
  const target = document.querySelector('[data-list="experience"]');
  target.innerHTML = items
    .map(
      (item) => `
        <article class="job">
          <div>
            <h3>${escapeHtml(item.role)}</h3>
            <ul>
              ${(item.highlights || []).map((highlight) => `<li>${escapeHtml(highlight)}</li>`).join("")}
            </ul>
          </div>
        </article>
      `
    )
    .join("");
};

const renderExpertise = (items) => {
  const target = document.querySelector('[data-list="expertise"]');
  target.innerHTML = items.map((item) => `<span class="skill">${escapeHtml(item)}</span>`).join("");
};

const renderShowKit = (items) => {
  const target = document.querySelector('[data-list="showKit"]');
  target.innerHTML = items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  target.closest(".tech-kit").hidden = items.length === 0;
};

const renderFilters = (shows) => {
  const target = document.querySelector("[data-filters]");
  const types = ["All", ...new Set(shows.map((show) => show.type).filter(Boolean))];
  target.innerHTML = types
    .map(
      (type) => `
        <button class="filter-button" type="button" data-filter="${escapeHtml(type)}" aria-pressed="false">
          ${escapeHtml(type)}
        </button>
      `
    )
    .join("");

  target.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      if (activeShowFilter === button.dataset.filter) return;
      activeShowFilter = button.dataset.filter;
      updateShowFilter(true);
    });
  });
};

const updateShowFilter = (animate = false) => {
  document.querySelectorAll("[data-filter]").forEach((button) => {
    const isActive = button.dataset.filter === activeShowFilter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  let visibleCount = 0;
  document.querySelectorAll(".show-row").forEach((row) => {
    const isVisible = activeShowFilter === "All" || row.dataset.type === activeShowFilter;
    const entering = row.hidden && isVisible && animate && !reducedMotion.matches;
    row.hidden = !isVisible;
    row.classList.toggle("is-filtered-in", entering);
    if (entering) row.style.setProperty("--row-delay", `${Math.min(visibleCount, 5) * 25}ms`);
    if (isVisible) visibleCount += 1;
  });

  setText("[data-portfolio-count]", `${visibleCount} ${visibleCount === 1 ? "show" : "shows"}`);
};

const renderShows = (shows) => {
  const target = document.querySelector('[data-list="selectedShows"]');

  target.innerHTML = shows
    .map(
      (show) => `
        <article class="show-row" data-type="${escapeHtml(show.type)}">
          <span class="tag">${escapeHtml(show.type)}</span>
          <div class="show-row__main">
            <h3>${escapeHtml(show.name)}</h3>
            <p class="show-row__meta">${escapeHtml(show.dates)} - ${escapeHtml(show.venue)}</p>
            <p class="show-row__company">${escapeHtml(show.company)}</p>
          </div>
          <div class="show-row__side">
            <strong>${escapeHtml(show.role)}</strong>
          </div>
        </article>
      `
    )
    .join("");

  updateShowFilter();
};

const renderMetrics = (data) => {
  setText('[data-count="experienceYears"]', getExperienceYears(data.experience || []));
  setText('[data-count="showCount"]', String((data.selectedShows || []).length));
  setText('[data-count="skillCount"]', String((data.expertise || []).length));
};

const formatPhoneForShare = (phone) => {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.length !== 10) return phone || "";
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

const setupShareButton = () => {
  const shareButton = document.querySelector('[data-action="share"]');
  if (!navigator.share && !navigator.clipboard) return;
  shareButton.hidden = false;
  let statusTimeout;

  shareButton.addEventListener("click", async () => {
    const email = resumeData.contact?.email || "";
    const phone = formatPhoneForShare(resumeData.contact?.phone);
    const shareTitle = `${resumeData.name} - Video Specialist`;
    const shareText = [
      shareTitle,
      "view portfolio -> https://www.hk-av.com",
      email && `email -> ${email}`,
      phone && `phone -> ${phone}`
    ].filter(Boolean).join("\n");
    const shareData = {
      title: shareTitle,
      text: shareText
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(shareText);
      setText("[data-share-status]", "Resume link copied");
      window.clearTimeout(statusTimeout);
      statusTimeout = window.setTimeout(() => {
        setText("[data-share-status]", "");
      }, 1800);
    } catch (error) {
      if (error.name === "AbortError") return;
      setText("[data-share-status]", "Could not share the resume.");
    }
  });
};

const setupReveals = () => {
  if (reducedMotion.matches || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver((entries) => {
    for (const { isIntersecting, target } of entries) {
      if (!isIntersecting) continue;
      target.classList.replace("reveal-pending", "reveal-visible");
      observer.unobserve(target);
    }
  });

  document.querySelectorAll(".content-grid .section-block:not([hidden]), .portfolio > .section-heading").forEach((target) => {
    if (target.getBoundingClientRect().top <= window.innerHeight) return;
    target.classList.add("reveal-pending");
    observer.observe(target);
  });
};

const renderResume = (data) => {
  resumeData = data;
  setText('[data-field="name"]', data.name);
  setText('[data-field="headline"]', data.headline);
  setText('[data-field="summary"]', data.summary);
  setText('[data-field="location"]', data.location);
  renderContact(data);
  renderExperience(data.experience || []);
  renderExpertise(data.expertise || []);
  renderShowKit(data.showKit || []);
  renderFilters(data.selectedShows || []);
  renderShows(data.selectedShows || []);
  renderMetrics(data);
  setupReveals();
  document.querySelector(".hero").classList.add("is-ready");
};

const loadResume = async () => {
  try {
    const response = await fetch("resume-data.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`Unable to load resume-data.json: ${response.status}`);
    renderResume(await response.json());
  } catch (error) {
    console.warn(error);
    renderResume(fallbackData);
  }
};

setupShareButton();
loadResume();
