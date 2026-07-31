/**
 * THEHAMMER - Public Web Application Controller
 * Handles pump catalog rendering, technical spec grid formatting, RFQs, and WhatsApp pre-filled templates.
 */

document.addEventListener("DOMContentLoaded", () => {
  initApp();

  // Backdrop click and Escape keyboard listener for modal dismissal
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      const detailModal = document.getElementById("productDetailModal");
      if (detailModal && detailModal.classList.contains("show")) {
        closeProductDetailModal();
      }
      const quoteModal = document.getElementById("quoteListModal");
      if (quoteModal && quoteModal.classList.contains("show")) {
        closeQuoteListModal();
      }
    }
  });

  const detailModal = document.getElementById("productDetailModal");
  if (detailModal) {
    detailModal.addEventListener("click", (event) => {
      if (event.target === detailModal) {
        closeProductDetailModal();
      }
    });
  }

  const quoteModal = document.getElementById("quoteListModal");
  if (quoteModal) {
    quoteModal.addEventListener("click", (event) => {
      if (event.target === quoteModal) {
        closeQuoteListModal();
      }
    });
  }
});

let selectedQuoteFile = null;

function initApp() {
  const savedTheme = localStorage.getItem("hammer_theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeLogos(savedTheme);

  const icon = document.getElementById("themeIcon");
  if (icon) {
    icon.setAttribute("data-lucide", savedTheme === "dark" ? "moon" : "sun");
    if (window.lucide) {
      lucide.createIcons();
    }
  }

  renderCategoryCards();
  renderCategoryFilter();
  populateFilters();
  renderCertificates();
  renderDownloads();
  setupDropzone();
  updateQuoteListBadge();

  checkURLCategoryOnLoad();

  window.addEventListener("popstate", () => {
    checkURLCategoryOnLoad();
  });

  window.addEventListener("languageChanged", () => {
    renderCategoryCards();
    renderCategoryFilter();
    populateFilters();
    if (currentCategorySlug) {
      openCategoryPage(currentCategorySlug, false);
    } else {
      renderCatalog();
    }
    renderCertificates();
    renderDownloads();
    updateLangUI();
  });

  updateLangUI();
}

function updateLangUI() {
  const currentLang = window.i18n ? window.i18n.currentLang : "en";
  const labelMap = { en: "🇬🇧 EN", it: "🇮🇹 IT", ar: "🇪🇬 AR" };
  const labelEl = document.getElementById("currentLangLabel");
  if (labelEl) labelEl.textContent = labelMap[currentLang] || "🇬🇧 EN";
}

function toggleDarkMode() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  html.setAttribute("data-theme", newTheme);
  localStorage.setItem("hammer_theme", newTheme);

  const icon = document.getElementById("themeIcon");
  if (icon) {
    icon.setAttribute("data-lucide", newTheme === "dark" ? "moon" : "sun");
    if (window.lucide) {
      lucide.createIcons();
    }
  }
  updateThemeLogos(newTheme);
}

function toggleMobileMenu() {
  const drawer = document.getElementById("mobileNavDrawer");
  const btn = document.querySelector(".mobile-menu-toggle");
  if (!drawer) return;
  const isHidden = drawer.getAttribute("aria-hidden") === "true";

  if (isHidden) {
    drawer.setAttribute("aria-hidden", "false");
    drawer.classList.add("active");
    btn?.classList.add("active");
    btn?.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  } else {
    closeMobileMenu();
  }
}

function closeMobileMenu() {
  const drawer = document.getElementById("mobileNavDrawer");
  const btn = document.querySelector(".mobile-menu-toggle");
  if (!drawer) return;
  drawer.setAttribute("aria-hidden", "true");
  drawer.classList.remove("active");
  btn?.classList.remove("active");
  btn?.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
}

function updateThemeLogos(theme) {
  const isDarkMode = theme === "dark";

  document.querySelectorAll(".theme-responsive-logo").forEach((logo) => {
    const lightLogo = logo.dataset.lightLogo;
    const darkLogo = logo.dataset.darkLogo;

    if (!lightLogo || !darkLogo) return;

    const requiredLogo = isDarkMode ? darkLogo : lightLogo;

    if (logo.getAttribute("src") !== requiredLogo) {
      logo.setAttribute("src", requiredLogo);
    }
  });
}

function toggleLangDropdown() {
  const dropdown = document.getElementById("langDropdown");
  if (dropdown)
    dropdown.style.display =
      dropdown.style.display === "block" ? "none" : "block";
}

function switchLanguage(lang) {
  if (window.i18n) {
    window.i18n.setLanguage(lang, true);
  }
  const dropdown = document.getElementById("langDropdown");
  if (dropdown) dropdown.style.display = "none";
}

/* Localized Name & Description Fallback Helpers */
function getProductName(product, lang) {
  if (!product) return "";
  if (lang === "ar") {
    return (
      product.nameAR ||
      product.nameAr ||
      product.nameEn ||
      product.nameEN ||
      product.nameIt ||
      product.nameIT ||
      ""
    );
  } else if (lang === "it") {
    return (
      product.nameIT ||
      product.nameIt ||
      product.nameEn ||
      product.nameEN ||
      product.nameAR ||
      product.nameAr ||
      ""
    );
  } else {
    return (
      product.nameEN ||
      product.nameEn ||
      product.nameIT ||
      product.nameIt ||
      product.nameAR ||
      product.nameAr ||
      ""
    );
  }
}

function getProductDesc(product, lang) {
  if (!product) return "";
  if (lang === "ar") {
    return (
      product.descAR ||
      product.descriptionAr ||
      product.descEN ||
      product.descriptionEn ||
      product.descIT ||
      product.descriptionIt ||
      ""
    );
  } else if (lang === "it") {
    return (
      product.descIT ||
      product.descriptionIt ||
      product.descEN ||
      product.descriptionEn ||
      product.descAR ||
      product.descriptionAr ||
      ""
    );
  } else {
    return (
      product.descEN ||
      product.descriptionEn ||
      product.descIT ||
      product.descriptionIt ||
      product.descAR ||
      product.descriptionAr ||
      ""
    );
  }
}

/* Category Filtering & Category Cards Rendering */
let activeCategoryFilter = "all";
let currentCategorySlug = null;
let defaultDocumentTitle = document.title;

/* Explicit Category Images Mapping & Console Error Verification */
const CATEGORY_IMAGES = {
  "fire-fighting-pumps": "images/system_fire_pumb.jpeg",
  "cat-ff": "images/system_fire_pumb.jpeg",
  "booster-systems": "images/Booster-Systems.png",
  "cat-booster": "images/Booster-Systems.png",
  "centrifugal-pumps": "images/Centrifugal-Pumps.png",
  "cat-centrifugal": "images/Centrifugal-Pumps.png",
  "end-suction-pumps": "images/end-section-pumb.jpg",
  "cat-end-suction": "images/end-section-pumb.jpg",
  "vertical-multistage-pumps": "images/Vertical-Multistage-Pumps.png",
  "cat-vertical-multistage": "images/Vertical-Multistage-Pumps.png",
  "electric-pumps": "images/Electric-Pumps.png",
  "cat-electric": "images/Electric-Pumps.png",
  "diesel-pumps": "images/PSD-Diesel-Pump.jpeg",
  "cat-diesel": "images/PSD-Diesel-Pump.jpeg",
  "jockey-pumps": "images/PV-Jockey-Pump.jpg",
  "cat-jockey": "images/PV-Jockey-Pump.jpg",
  "split-case-pumps": "images/Split-Case-Pumps.png",
  "cat-split-case": "images/Split-Case-Pumps.png"
};

function getCategoryImage(cat) {
  if (!cat) {
    console.error("Category image missing: Invalid category object");
    return "";
  }
  const key = cat.slug || cat.id;
  const imagePath = CATEGORY_IMAGES[key] || cat.image;

  if (!imagePath) {
    console.error("Category image missing for category:", key || cat.nameEN || cat);
  }

  return imagePath || "";
}

function renderCategoryCards() {
  const container = document.getElementById("categoryCardsGrid");
  if (!container || !window.store) return;

  const categories = window.store.getCategories();
  const currentLang = window.i18n ? window.i18n.currentLang : "en";

  container.innerHTML = categories
    .map((cat) => {
      const nameKey = currentLang === "ar" ? "nameAR" : currentLang === "it" ? "nameIT" : "nameEN";
      const descKey = currentLang === "ar" ? "descAR" : currentLang === "it" ? "descIT" : "descEN";

      const catName = cat[nameKey] || cat.nameEN;
      const catDesc = cat[descKey] || cat.descEN || "";
      const catIcon = cat.icon || "layers";
      const catImage = getCategoryImage(cat);
      const filterTag = cat.filterTag || "all";

      const catProducts = window.store.getProductsForCategory(cat);
      const count = catProducts.length;

      const formattedCount = window.i18n
        ? window.i18n.t("catalog.foundProducts", { count }, `Found ${count} Products`)
        : `Found ${count} Products`;

      return `
        <div class="category-card" data-filter-tag="${filterTag}" onclick="openCategoryPage('${cat.slug}')">
          <div class="category-card-img-wrapper">
            <img src="${catImage}" alt="${catName} category" class="category-card-img" width="400" height="260" loading="lazy" decoding="async" onerror="console.error('Failed to load category image:', '${catImage}');">
            <span class="category-card-count-badge">${formattedCount}</span>
          </div>
          <div class="category-card-body">
            <h3 class="category-card-title">
              <i data-lucide="${catIcon}"></i>
              ${catName}
            </h3>
            <p class="category-card-desc">${catDesc}</p>
            <div class="category-card-footer">
              <span class="category-card-action">
                ${currentLang === "ar" ? "تصفح المنتجات &larr;" : currentLang === "it" ? "Esplora Prodotti &rarr;" : "Browse Products &rarr;"}
              </span>
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  // Update Found Categories counter (Step 3)
  updateCategoriesCount(categories.length);

  if (window.lucide) {
    lucide.createIcons();
  }
}

function updateCategoriesCount(count) {
  const counterEl = document.getElementById("categoriesCountHeader");
  if (!counterEl) return;
  const countText = window.i18n
    ? window.i18n.t("catalog.foundCategories", { count }, `Found ${count} Categories`)
    : `Found ${count} Categories`;
  counterEl.textContent = countText;
}

function filterCategories(filterKey, buttonEl) {
  activeCategoryFilter = filterKey;

  // Update active pill state
  document.querySelectorAll("#categoryFilterBar .filter-pill").forEach((btn) => {
    btn.classList.remove("active");
  });
  if (buttonEl) {
    buttonEl.classList.add("active");
  } else {
    const targetPill = document.querySelector(`#categoryFilterBar .filter-pill[data-filter="${filterKey}"]`);
    if (targetPill) targetPill.classList.add("active");
  }

  const cards = document.querySelectorAll("#categoryCardsGrid .category-card");
  let visibleCount = 0;

  cards.forEach((card) => {
    const tag = card.getAttribute("data-filter-tag");
    const matches = filterKey === "all" || tag === filterKey || tag.includes(filterKey) || filterKey.includes(tag);

    if (matches) {
      visibleCount++;
      card.style.display = "flex";
      card.classList.remove("filtering-out");
      card.classList.add("filtering-in");
    } else {
      card.classList.remove("filtering-in");
      card.classList.add("filtering-out");
      setTimeout(() => {
        if (card.classList.contains("filtering-out")) {
          card.style.display = "none";
        }
      }, 280);
    }
  });

  updateCategoriesCount(visibleCount);
}

function openCategoryPage(slug, updateHistory = true, scrollToTop = true) {
  if (!window.store) return;
  const cat = window.store.getCategoryBySlug(slug);

  if (!cat) {
    if (window.location.pathname.includes("category.html")) {
      window.location.href = "index.html";
    } else {
      showCategoriesView(false);
    }
    return;
  }

  // If clicked from index.html (or another page), navigate to category.html?category=slug
  const isCategoryPage = window.location.pathname.includes("category.html");
  if (!isCategoryPage && updateHistory) {
    window.location.href = `category.html?category=${encodeURIComponent(cat.slug)}`;
    return;
  }

  resetFiltersSilent();
  currentCategorySlug = cat.slug;

  const homeView = document.getElementById("homepageCategoriesView");
  const detailView = document.getElementById("categoryDetailView");

  if (homeView) homeView.style.display = "none";
  if (detailView) detailView.style.display = "block";

  const currentLang = window.i18n ? window.i18n.currentLang : "en";
  const nameKey = currentLang === "ar" ? "nameAR" : currentLang === "it" ? "nameIT" : "nameEN";
  const descKey = currentLang === "ar" ? "descAR" : currentLang === "it" ? "descIT" : "descEN";
  const catName = cat[nameKey] || cat.nameEN;
  const catDesc = cat[descKey] || cat.descEN || "";

  // Step 5: Large category title & description
  const titleEl = document.getElementById("selectedCategoryTitle");
  if (titleEl) titleEl.textContent = catName;

  const descEl = document.getElementById("selectedCategoryDesc");
  if (descEl) descEl.textContent = catDesc;

  // Step 6: Breadcrumbs update
  const breadcrumbEl = document.getElementById("breadcrumbCategoryName");
  if (breadcrumbEl) breadcrumbEl.textContent = catName;

  // Step 8: SEO Title & Meta Description update
  document.title = `${catName} | THEHAMMER`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute("content", `${catName} - ${catDesc}`);
  }

  const categorySelect = document.getElementById("categoryFilter");
  if (categorySelect) categorySelect.value = cat.id || cat.slug;

  if (updateHistory && window.history && window.history.pushState && isCategoryPage) {
    const targetUrl = `category.html?category=${encodeURIComponent(cat.slug)}`;
    window.history.pushState({ categorySlug: cat.slug }, "", targetUrl);
  }

  // Populate category-scoped filters & render catalog
  populateFilters();
  renderCatalog();

  if (scrollToTop) {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }
}

function showCategoriesView(updateHistory = true, scrollToTop = false) {
  const isCategoryPage = window.location.pathname.includes("category.html");
  if (isCategoryPage) {
    window.location.href = "index.html#catalog";
    return;
  }

  currentCategorySlug = null;
  resetFiltersSilent();

  const homeView = document.getElementById("homepageCategoriesView");
  const detailView = document.getElementById("categoryDetailView");

  if (homeView) homeView.style.display = "block";
  if (detailView) detailView.style.display = "none";

  // Reset SEO title & description
  if (defaultDocumentTitle) {
    document.title = defaultDocumentTitle;
  }
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute("content", "THEHAMMER provides heavy-duty industrial water pumps, NFPA-20 fire fighting pump sets, electric motors, diesel pumps, jockey pumps, and pressure booster stations.");
  }

  const categorySelect = document.getElementById("categoryFilter");
  if (categorySelect) categorySelect.value = "all";

  if (updateHistory && window.history && window.history.pushState) {
    const newUrl = "index.html" + window.location.hash;
    window.history.pushState({ categorySlug: null }, "", newUrl);
  }

  renderCategoryCards();

  if (scrollToTop) {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }
}

function scrollToHero() {
  const heroSec = document.getElementById("hero");
  if (heroSec && typeof heroSec.scrollIntoView === "function") {
    heroSec.scrollIntoView({ behavior: "smooth" });
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function checkURLCategoryOnLoad() {
  const isCategoryPage = window.location.pathname.includes("category.html");
  let slug = null;

  // 1. Check query parameters e.g. category.html?category=fire-fighting-pumps
  const urlParams = new URLSearchParams(window.location.search);
  slug = urlParams.get("category");

  // 2. Fallback check for pathname
  if (!slug) {
    const pathMatch = window.location.pathname.match(/\/category\/([a-zA-Z0-9-]+)/);
    if (pathMatch && pathMatch[1]) {
      slug = pathMatch[1];
    }
  }

  // 3. Fallback check for hash
  if (!slug && window.location.hash) {
    const hashMatch = window.location.hash.match(/#\/?category\/([a-zA-Z0-9-]+)/);
    if (hashMatch && hashMatch[1]) {
      slug = hashMatch[1];
    }
  }

  if (slug && slug !== "all") {
    openCategoryPage(slug, false, true);
  } else if (isCategoryPage) {
    const categories = window.store ? window.store.getCategories() : [];
    if (categories.length > 0) {
      openCategoryPage(categories[0].slug, false, true);
    } else {
      window.location.href = "index.html";
    }
  } else {
    showCategoriesView(false, false);
  }
}

/* Catalog Render */
function renderCategoryFilter() {
  const categories = window.store ? window.store.getCategories() : [];
  const select = document.getElementById("categoryFilter");
  if (!select) return;

  const currentLang = window.i18n ? window.i18n.currentLang : "en";
  const langKey =
    currentLang === "ar"
      ? "nameAR"
      : currentLang === "it"
        ? "nameIT"
        : "nameEN";

  select.innerHTML =
    `<option value="all">${window.i18n.t("catalog.allCategories")}</option>` +
    categories
      .map(
        (cat) =>
          `<option value="${cat.id}">${cat[langKey] || cat.nameEN}</option>`,
      )
      .join("");
}

function resetFiltersSilent() {
  const searchInput = document.getElementById("catalogSearchInput");
  const flowRateFilter = document.getElementById("flowRateFilter");
  const headFilter = document.getElementById("headFilter");
  const availabilityFilter = document.getElementById("availabilityFilter");

  if (searchInput) searchInput.value = "";
  if (flowRateFilter) flowRateFilter.value = "all";
  if (headFilter) headFilter.value = "all";
  if (availabilityFilter) availabilityFilter.value = "all";
}

function populateFilters() {
  // Only extract products belonging to THIS category for 100% filter isolation
  let products = [];
  if (currentCategorySlug && window.store) {
    products = window.store.getProductsForCategory(currentCategorySlug);
  } else {
    products = window.store ? window.store.getProducts() : [];
  }

  const currentLang = window.i18n ? window.i18n.currentLang : "en";

  const flowRateFilter = document.getElementById("flowRateFilter");
  const headFilter = document.getElementById("headFilter");

  if (flowRateFilter) {
    const savedValue = flowRateFilter.value || "all";
    const rates = [
      ...new Set(products.map((p) => p.qGpm).filter(Boolean)),
    ].sort((a, b) => Number(a) - Number(b));

    flowRateFilter.innerHTML =
      `<option value="all">${window.i18n.t("catalog.allFlowRates")}</option>` +
      rates.map((r) => `<option value="${r}">${r} GPM</option>`).join("");

    if (rates.includes(savedValue) || savedValue === "all") {
      flowRateFilter.value = savedValue;
    } else {
      flowRateFilter.value = "all";
    }
  }

  if (headFilter) {
    const savedValue = headFilter.value || "all";
    const heads = [
      ...new Set(products.map((p) => p.hBar).filter(Boolean)),
    ].sort((a, b) => {
      const parseNum = (s) => {
        const matched = String(s).match(/^(\d+)/);
        return matched ? Number(matched[1]) : 0;
      };
      return parseNum(a) - parseNum(b);
    });
    const headBarText = currentLang === "ar" ? "بار" : "Bar";
    headFilter.innerHTML =
      `<option value="all">${window.i18n.t("catalog.allHeads")}</option>` +
      heads
        .map((h) => `<option value="${h}">${h} ${headBarText}</option>`)
        .join("");

    if (heads.includes(savedValue) || savedValue === "all") {
      headFilter.value = savedValue;
    } else {
      headFilter.value = "all";
    }
  }

  const resetBtn = document.getElementById("clearFiltersBtn");
  if (resetBtn) {
    resetBtn.textContent = window.i18n.t("catalog.reset");
  }
}

function resetFilters() {
  resetFiltersSilent();
  renderCatalog();
}

function renderCatalog() {
  const grid = document.getElementById("catalogGrid");
  if (!grid) return;

  const currentLang = window.i18n ? window.i18n.currentLang : "en";
  let products = [];

  if (currentCategorySlug && window.store) {
    products = window.store.getProductsForCategory(currentCategorySlug);
  } else {
    products = window.store ? window.store.getProducts() : [];
  }

  const searchVal = (document.getElementById("catalogSearchInput")?.value || "")
    .toLowerCase()
    .trim();
  const categoryVal = document.getElementById("categoryFilter")?.value || "all";
  const flowVal = document.getElementById("flowRateFilter")?.value || "all";
  const headVal = document.getElementById("headFilter")?.value || "all";
  const availVal =
    document.getElementById("availabilityFilter")?.value || "all";

  const filtered = products.filter((p) => {
    if (!p.active) return false;

    // Category match if explicitly set in select
    if (!currentCategorySlug && categoryVal !== "all") {
      if (p.categoryId !== categoryVal) return false;
    }

    // Flow GPM match
    const matchesFlow = flowVal === "all" || String(p.qGpm) === flowVal;
    if (!matchesFlow) return false;

    // Head Bar match
    const matchesHead = headVal === "all" || String(p.hBar) === headVal;
    if (!matchesHead) return false;

    // Availability coupling match
    let matchesAvail = true;
    if (availVal === "close") {
      matchesAvail = p.configuration.toLowerCase().includes("close");
    } else if (availVal === "separate") {
      matchesAvail = p.configuration.toLowerCase().includes("separate");
    }
    if (!matchesAvail) return false;

    // Search query matches
    if (searchVal) {
      const targetSearchable =
        `${p.model} ${p.qGpm} gpm ${p.hBar} bar ${p.electricPump} ${p.dieselPump} ${p.jockeyPump} ${p.configuration}`.toLowerCase();
      const cleanVal = searchVal.replace(/\s+/g, "");
      const cleanTarget = targetSearchable.replace(/\s+/g, "");

      const isMatch =
        targetSearchable.includes(searchVal) || cleanTarget.includes(cleanVal);
      if (!isMatch) return false;
    }

    return true;
  });

  // Update Category Page count header & result counts using i18n translation key
  const countText = window.i18n
    ? window.i18n.t("catalog.foundProducts", { count: filtered.length }, `Found ${filtered.length} Products`)
    : `Found ${filtered.length} Products`;

  const selectedCategoryCountEl = document.getElementById("selectedCategoryCount");
  if (selectedCategoryCountEl) {
    selectedCategoryCountEl.textContent = countText;
  }

  const countEl = document.getElementById("catalogProductCount");
  if (countEl) {
    countEl.textContent = countText;
  }

  // Inject Product JSON-LD Structured Data dynamically for Google SEO indexing
  const oldProductSchema = document.getElementById("dynamicProductJsonLd");
  if (oldProductSchema) oldProductSchema.remove();

  if (filtered.length > 0) {
    const productSchemaData = {
      "@context": "https://schema.org",
      "@graph": filtered.slice(0, 10).map((p) => ({
        "@type": "Product",
        "@id": `https://thehammer.uk/#product-${p.id || p.model}`,
        "name": getProductName(p, currentLang),
        "model": p.model,
        "description": `Industrial pump model ${p.model} - Flow: ${p.qGpm} GPM, Head: ${p.hBar} Bar. ${p.configuration || ''}`,
        "image": p.image || "https://thehammer.uk/images/system_fire_pumb.jpeg",
        "brand": {
          "@type": "Brand",
          "name": "THEHAMMER"
        },
        "offers": {
          "@type": "Offer",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock",
          "url": `https://thehammer.uk/?category=${currentCategorySlug || 'fire-fighting-pumps'}`
        }
      }))
    };

    const scriptJsonLd = document.createElement("script");
    scriptJsonLd.id = "dynamicProductJsonLd";
    scriptJsonLd.type = "application/ld+json";
    scriptJsonLd.text = JSON.stringify(productSchemaData);
    document.head.appendChild(scriptJsonLd);
  }

  if (filtered.length === 0) {
    if (products.length === 0) {
      grid.innerHTML = `
        <div class="coming-soon-container">
          <div class="coming-soon-card reveal reveal-up">
            <div class="coming-soon-icon-wrapper">
              <i data-lucide="clock" class="coming-soon-icon"></i>
            </div>
            <h3 class="coming-soon-title">${window.i18n.t("catalog.comingSoonTitle")}</h3>
            <p class="coming-soon-desc">${window.i18n.t("catalog.comingSoonDesc")}</p>
            <button class="btn btn-primary btn-md coming-soon-btn" onclick="openQuoteModal()">
              <i data-lucide="mail" style="width:16px;height:16px;"></i>
              ${window.i18n.t("catalog.contactSales")}
            </button>
          </div>
        </div>
      `;
    } else {
      grid.innerHTML = `
        <div class="catalog-empty-state">
          <i data-lucide="droplet-off" class="catalog-empty-icon"></i>
          <h3>${window.i18n.t("catalog.noResults")}</h3>
        </div>
      `;
    }
    if (window.lucide) {
      lucide.createIcons();
    }

    return;
  }

  grid.innerHTML = filtered
    .map((p) => {
      const name = getProductName(p, currentLang);
      const desc = getProductDesc(p, currentLang);
      const categories = window.store ? window.store.getCategories() : [];
      const cat = categories.find((c) => c.id === p.categoryId);
      const catName = cat
        ? currentLang === "ar"
          ? cat.nameAR
          : currentLang === "it"
            ? cat.nameIT
            : cat.nameEN
        : "";

      const flowLabel =
        currentLang === "ar"
          ? "معدل التدفق"
          : currentLang === "it"
            ? "Portata"
            : "Flow Rate";
      const headLabel =
        currentLang === "ar"
          ? "الضغط"
          : currentLang === "it"
            ? "Prevalenza"
            : "Head";
      const headUnit = currentLang === "ar" ? "بار" : "Bar";

      return `
      <div class="product-card">
        <div class="product-img-wrapper">
          <img src="${p.image}" alt="Industrial pump ${p.model}" class="product-img" width="400" height="300" loading="lazy" decoding="async" onerror="this.src='images/PSM-Electric-Pump.jpg'">
          <span class="product-card-tag">THEHAMMER</span>
        </div>

        <div class="product-card-body">
          <span class="product-model">${p.model}</span>
          <span class="product-category">${catName}</span>
          <h3 class="product-title">${name}</h3>
          <p class="product-desc">${desc}</p>

          <!-- Technical Specs Grid -->
          <div class="spec-grid product-spec-grid">
            <div class="spec-item">
              <span class="spec-key">${flowLabel}</span>
              <span class="spec-val tech-val spec-val-ltr">${p.qGpm} GPM</span>
            </div>
            <div class="spec-item">
              <span class="spec-key">${headLabel}</span>
              <span class="spec-val tech-val spec-val-ltr">${p.hBar} ${headUnit}</span>
            </div>
          </div>

          <div class="product-card-footer">
            <button class="btn btn-secondary btn-sm product-card-btn" onclick="openProductDetail('${p.id}')" data-i18n="catalog.viewDetails">${window.i18n.t("catalog.viewDetails")}</button>
            <button class="btn btn-primary btn-sm product-card-btn" onclick="addToQuoteList('${p.id}')" data-i18n="catalog.addToQuote">${window.i18n.t("catalog.addToQuote")}</button>
            <button class="btn btn-outline btn-sm" onclick="openWhatsAppQuote('${p.id}')" aria-label="${currentLang === "it" ? "WhatsApp per " + name : currentLang === "ar" ? "واتساب لـ " + name : "WhatsApp for " + name}">
              <span class="whatsapp-icon whatsapp-icon-mini" aria-hidden="true"><svg viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg" focusable="false" class="whatsapp-svg"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"></path></svg></span>
            </button>
          </div>
        </div>
      </div>
    `;
    })
    .join("");

  if (window.lucide) {
    lucide.createIcons();
  }

  // Make rendered product cards visible immediately
  const productCards = grid.querySelectorAll(".product-card");
  productCards.forEach((c) => c.classList.add("is-visible"));

  if ("IntersectionObserver" in window) {
    const cardObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -20px 0px", threshold: 0.05 }
    );
    productCards.forEach((c) => cardObserver.observe(c));
  }
}

function renderCertificates() {
  const grid = document.getElementById("certificatesGrid");
  if (!grid) return;

  const certs = window.store ? window.store.getCertificates() : [];
  const currentLang = window.i18n ? window.i18n.currentLang : "en";
  const titleKey =
    currentLang === "ar"
      ? "titleAR"
      : currentLang === "it"
        ? "titleIT"
        : "titleEN";

  grid.innerHTML = certs
    .map(
      (c) => `
    <div class="certificate-card stagger-item">
      <i data-lucide="shield-check" class="certificate-icon"></i>
      <h4 class="certificate-title">${c[titleKey] || c.titleEN}</h4>
      <p class="certificate-issuer">Issuer: ${c.issuer} (${c.code})</p>
      <a href="#" class="btn btn-outline btn-sm" onclick="alert('Downloading Certificate PDF: ${c.pdf}')">Download PDF</a>
    </div>
  `,
    )
    .join("");

  if (window.lucide) {
    lucide.createIcons();
  }
}

function renderDownloads() {
  const grid = document.getElementById("downloadsGrid");
  if (!grid) return;

  const downloads = window.store ? window.store.getDownloads() : [];
  const currentLang = window.i18n ? window.i18n.currentLang : "en";
  const titleKey =
    currentLang === "ar"
      ? "titleAR"
      : currentLang === "it"
        ? "titleIT"
        : "titleEN";

  grid.innerHTML = downloads
    .map(
      (d) => `
    <div class="download-card stagger-item">
      <div>
        <h4 class="download-title">${d[titleKey] || d.titleEN}</h4>
        <span class="download-info">Category: ${d.category} • Downloads: ${d.count}</span>
      </div>
      <button class="btn btn-primary btn-sm" onclick="triggerDownload('${d.id}', '${d.file}')">Download</button>
    </div>
  `,
    )
    .join("");
  if (window.lucide) {
    lucide.createIcons();
  }
}

function triggerDownload(id, filename) {
  if (window.store) window.store.incrementDownloadCount(id);
  alert(`Downloading official catalog file: ${filename}`);
}

let lastActiveElement = null;
let originalPageTitle = document.title;
let originalMetaDescription =
  document.querySelector('meta[name="description"]')?.getAttribute("content") ||
  "";

/* Product Spec Modal */
function openProductDetail(productId) {
  const products = window.store ? window.store.getProducts() : [];
  const p = products.find((item) => item.id === productId);
  if (!p) return;

  const currentLang = window.i18n ? window.i18n.currentLang : "en";

  document.getElementById("detailModel").textContent = p.model;
  document.getElementById("detailName").textContent = getProductName(
    p,
    currentLang,
  );

  // Highlighting key specs in details modal
  const specHighlightHTML =
    currentLang === "ar"
      ? `<div class="modal-spec-highlight">معدل التدفق (Q) = ${p.qGpm} جالون/دقيقة | الضغط (H) = ${p.hBar} بار</div>`
      : `<div class="modal-spec-highlight">Flow Rate (Q) = ${p.qGpm} GPM | Head (H) = ${p.hBar} Bar</div>`;

  document.getElementById("detailDesc").innerHTML =
    specHighlightHTML + `<p>${getProductDesc(p, currentLang)}</p>`;

  const detailImg = document.getElementById("detailImage");
  if (detailImg) {
    detailImg.src = p.image;
    detailImg.alt = `Fire pump set ${p.model} product model`;
    detailImg.onerror = () => {
      detailImg.src = "images/PSM-Electric-Pump.jpg";
    };
  }

  // SEO Updates
  document.title = `${p.model} Fire Pump Set | The Hammer`;
  const metaDescText = `${p.model} fire pump system configuration with ${p.qGpm} GPM flow, ${p.hBar} Bar head. Electric: ${p.electricPump}, Diesel: ${p.dieselPump}, Jockey: ${p.jockeyPump}.`;
  const metaDescEl = document.querySelector('meta[name="description"]');
  if (metaDescEl) {
    metaDescEl.setAttribute("content", metaDescText);
  }

  const specsTable = document.getElementById("detailSpecsTable");
  if (specsTable) {
    const getValHTML = (val) => {
      if (val === "-") {
        const text = window.i18n.t("catalog.notAvailable");
        return `<span class="badge-unavailable">${text}</span>`;
      }
      return val;
    };

    const configLabel =
      currentLang === "ar"
        ? "التكوين والاقتران"
        : currentLang === "it"
          ? "Configurazione"
          : "Configuration";
    const fullSpecs = [
      { key: window.i18n.t("catalog.flowRate"), val: `${p.qGpm} GPM` },
      {
        key: window.i18n.t("catalog.headPressure"),
        val: `${p.hBar} ${currentLang === "ar" ? "بار" : "Bar"}`,
      },
      {
        key: window.i18n.t("catalog.electricPumpLabel"),
        val: getValHTML(p.electricPump),
      },
      {
        key: window.i18n.t("catalog.dieselPumpLabel"),
        val: getValHTML(p.dieselPump),
      },
      {
        key: window.i18n.t("catalog.jockeyPumpLabel"),
        val: getValHTML(p.jockeyPump),
      },
      { key: configLabel, val: getValHTML(p.configuration) },
    ];

    specsTable.innerHTML = fullSpecs
      .map((s) => {
        const isLtr =
          typeof s.val === "string" && !s.val.includes("badge-unavailable");
        return `
        <tr class="modal-table-row">
          <td class="modal-table-label">${s.key}</td>
          <td class="modal-table-value tech-val ${isLtr ? "spec-val-ltr" : ""}">${s.val}</td>
        </tr>
      `;
      })
      .join("");
  }

  // Dynamic component image mapping inside details modal
  let electricImg = "images/PSM-Electric-Pump.jpg"; // Close Coupled default / fallback
  if (p.configuration.includes("Separate Coupled")) {
    electricImg = "images/PSM-Electric-Pump.jpg";
  }
  const dieselImg = "images/PSD-Diesel-Pump.jpg";
  let jockeyImg = "images/PV-Jockey-Pump.jpg"; // Configuration 1 default
  if (p.configuration.includes("SS304 Jockey")) {
    jockeyImg = "images/PVTS-Jockey-Pump.jpg";
  }

  const breakdownContainer = document.getElementById(
    "detailBreakdownContainer",
  );
  if (breakdownContainer) {
    const isRtl = currentLang === "ar";
    const alignClass = isRtl ? "text-right" : "text-left";
    breakdownContainer.innerHTML = `
      <!-- Electric Pump Card -->
      <div class="modal-component-card">
        <div class="modal-component-img-wrapper">
          <img src="${electricImg}" alt="Electric Pump Component" class="modal-component-img" onerror="this.src='images/PSM-Electric-Pump.jpg'" />
        </div>
        <div class="modal-component-body ${alignClass}">
          <div>
            <h5 class="modal-component-title">${window.i18n.t("catalog.electricPumpLabel")}</h5>
            <p class="modal-component-model spec-val-ltr">${p.electricPump}</p>
          </div>
        </div>
      </div>

      <!-- Diesel Pump Card -->
      <div class="modal-component-card">
        <div class="modal-component-img-wrapper">
          <img src="${dieselImg}" alt="Diesel Pump Component" class="modal-component-img" onerror="this.src='images/PSD-Diesel-Pump.jpeg'" />
        </div>
        <div class="modal-component-body ${alignClass}">
          <div>
            <h5 class="modal-component-title">${window.i18n.t("catalog.dieselPumpLabel")}</h5>
            <p class="modal-component-model spec-val-ltr">${p.dieselPump}</p>
          </div>
        </div>
      </div>

      <!-- Jockey Pump Card -->
      <div class="modal-component-card">
        <div class="modal-component-img-wrapper">
          <img src="${jockeyImg}" alt="Jockey Pump Component" class="modal-component-img" onerror="this.src='images/PVTS-Jockey-Pump.jpg'" />
        </div>
        <div class="modal-component-body ${alignClass}">
          <div>
            <h5 class="modal-component-title">${window.i18n.t("catalog.jockeyPumpLabel")}</h5>
            <p class="modal-component-model spec-val-ltr">${p.jockeyPump}</p>
          </div>
        </div>
      </div>
    `;
  }

  const quoteBtn = document.getElementById("detailQuoteBtn");
  if (quoteBtn) {
    quoteBtn.onclick = () => {
      closeProductDetailModal();
      addToQuoteList(p.id);
    };
  }

  const whatsAppBtn = document.getElementById("detailWhatsAppBtn");
  if (whatsAppBtn) {
    whatsAppBtn.onclick = () => {
      openWhatsAppQuote(p.id);
    };
  }

  const pdfUrl =
    p.pdfUrl ||
    p.datasheetUrl ||
    p.catalogUrl ||
    p.documentUrl ||
    p.datasheetPdf;
  const pdfBtn = document.getElementById("detailPdfBtn");
  if (pdfBtn) {
    if (pdfUrl) {
      pdfBtn.style.cursor = "pointer";
      pdfBtn.style.opacity = "1";
      pdfBtn.onclick = () => {
        window.open(pdfUrl, "_blank", "noopener,noreferrer");
      };
      pdfBtn.innerHTML = window.i18n.t("pdf.download");
      pdfBtn.setAttribute(
        "aria-label",
        currentLang === "it"
          ? "Scarica PDF per " + getProductName(p, currentLang)
          : currentLang === "ar"
            ? "تحميل ملف PDF لـ " + getProductName(p, currentLang)
            : "Download PDF for " + getProductName(p, currentLang),
      );
    } else {
      pdfBtn.style.cursor = "not-allowed";
      pdfBtn.style.opacity = "0.5";
      pdfBtn.onclick = () => {
        alert(window.i18n.t("pdf.unavailable"));
      };
      pdfBtn.innerHTML = window.i18n.t("pdf.download");
      pdfBtn.setAttribute("aria-label", window.i18n.t("pdf.unavailable"));
    }
  }

  lastActiveElement = document.activeElement;
  const modal = document.getElementById("productDetailModal");
  if (modal) {
    modal.classList.add("show");
    modal.setAttribute("tabindex", "-1");
    modal.focus();
    document.body.style.overflow = "hidden";
  }
}

function closeProductDetailModal() {
  const modal = document.getElementById("productDetailModal");
  if (modal) {
    modal.classList.remove("show");
    document.body.style.overflow = "";
  }

  // Restore SEO Title/Description
  document.title = originalPageTitle;
  const metaDescEl = document.querySelector('meta[name="description"]');
  if (metaDescEl && originalMetaDescription) {
    metaDescEl.setAttribute("content", originalMetaDescription);
  }

  if (lastActiveElement) {
    lastActiveElement.focus();
  }
}

/* E-Commerce Quote List cart logic */
function getQuoteList() {
  try {
    const data = localStorage.getItem("hammer_quote_list");
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function saveQuoteList(list) {
  localStorage.setItem("hammer_quote_list", JSON.stringify(list));
  updateQuoteListBadge();
}

function addToQuoteList(productId) {
  const list = getQuoteList();
  const existing = list.find((item) => item.productId === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    list.push({ productId, quantity: 1 });
  }
  saveQuoteList(list);
  alert(window.i18n.t("quoteList.addedAlert"));
  renderQuoteList();
  openQuoteListModal();
}

function removeFromQuoteList(productId) {
  let list = getQuoteList();
  list = list.filter((item) => item.productId !== productId);
  saveQuoteList(list);
  renderQuoteList();
}

function updateQuoteListQty(productId, change) {
  const list = getQuoteList();
  const item = list.find((item) => item.productId === productId);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      removeFromQuoteList(productId);
      return;
    }
  }
  saveQuoteList(list);
  renderQuoteList();
}

function updateQuoteListBadge() {
  const list = getQuoteList();
  const count = list.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById("quoteListBadge");
  if (badge) {
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = "flex";
    } else {
      badge.style.display = "none";
    }
  }
}

function openQuoteListModal() {
  const modal = document.getElementById("quoteListModal");
  if (modal) {
    // Clear errors
    const errorElements = modal.querySelectorAll(".error-msg");
    errorElements.forEach((el) => {
      el.style.display = "none";
      el.textContent = "";
    });
    renderQuoteList();
    modal.classList.add("show");
  }
}

function closeQuoteListModal() {
  const modal = document.getElementById("quoteListModal");
  if (modal) modal.classList.remove("show");
}

function renderQuoteList() {
  const list = getQuoteList();
  const emptyState = document.getElementById("quoteListEmptyState");
  const content = document.getElementById("quoteListContent");
  const tbody = document.getElementById("quoteListTbody");
  const currentLang = window.i18n ? window.i18n.currentLang : "en";

  if (list.length === 0) {
    if (emptyState) emptyState.style.display = "block";
    if (content) content.style.display = "none";
    return;
  }

  if (emptyState) emptyState.style.display = "none";
  if (content) content.style.display = "block";

  if (tbody) {
    const products = window.store ? window.store.getProducts() : [];
    const prodLbl =
      currentLang === "it"
        ? "Prodotto"
        : currentLang === "ar"
          ? "المنتج"
          : "Product";
    const codeLbl =
      currentLang === "it" ? "Codice" : currentLang === "ar" ? "الكود" : "Code";
    const qtyLbl =
      currentLang === "it"
        ? "Quantità"
        : currentLang === "ar"
          ? "الكمية"
          : "Quantity";

    tbody.innerHTML = list
      .map((item) => {
        const p = products.find((prod) => prod.id === item.productId);
        if (!p) return "";

        const productName = getProductName(p, currentLang);
        return `
        <tr class="quote-table-row">
          <td data-label="${prodLbl}" class="quote-table-td-product">
            <img src="${p.image}" alt="${productName}" class="quote-list-img">
            <div>
              <strong class="quote-item-name">${productName}</strong>
            </div>
          </td>
          <td data-label="${codeLbl}" class="quote-table-td-code font-mono spec-val-ltr">${p.model}</td>
          <td data-label="${qtyLbl}" class="quote-table-td-qty">
            <div class="qty-selector">
              <button type="button" class="qty-btn" onclick="updateQuoteListQty('${p.id}', -1)">-</button>
              <span class="qty-val">${item.quantity}</span>
              <button type="button" class="qty-btn" onclick="updateQuoteListQty('${p.id}', 1)">+</button>
            </div>
          </td>
          <td class="quote-table-td-remove">
            <button type="button" class="btn btn-secondary btn-sm" onclick="removeFromQuoteList('${p.id}')">
              <i data-lucide="trash-2" class="trash-icon"></i>
            </button>
          </td>
        </tr>
      `;
      })
      .join("");
    if (window.lucide) {
      lucide.createIcons();
    }
  }
}

async function handleQuoteListSubmit(event) {
  event.preventDefault();

  const modal = document.getElementById("quoteListModal");
  const errorElements = modal.querySelectorAll(".error-msg");
  errorElements.forEach((el) => {
    el.style.display = "none";
    el.textContent = "";
  });

  const company = document.getElementById("quoteListCompany").value.trim();
  const name = document.getElementById("quoteListName").value.trim();
  const email = document.getElementById("quoteListEmail").value.trim();
  const phone = document.getElementById("quoteListPhone").value.trim();
  const country = document.getElementById("quoteListCountry").value.trim();
  const message = document.getElementById("quoteListMessage").value.trim();

  let hasError = false;
  const currentLang = window.i18n ? window.i18n.currentLang : "en";

  if (!name) {
    showError("quoteListName", window.i18n.t("validation.fullNameRequired"));
    hasError = true;
  }
  if (!phone) {
    showError("quoteListPhone", window.i18n.t("validation.phoneRequired"));
    hasError = true;
  } else if (!validatePhone(phone)) {
    showError("quoteListPhone", window.i18n.t("validation.phoneInvalid"));
    hasError = true;
  }
  if (!email) {
    showError("quoteListEmail", window.i18n.t("validation.emailInvalid"));
    hasError = true;
  } else if (!validateEmail(email)) {
    showError("quoteListEmail", window.i18n.t("validation.emailInvalid"));
    hasError = true;
  }
  if (!country) {
    showError("quoteListCountry", window.i18n.t("validation.countryRequired"));
    hasError = true;
  }

  const list = getQuoteList();
  if (list.length === 0) {
    alert(window.i18n.t("quoteList.empty"));
    return;
  }

  if (hasError) return;

  const submitBtn = document.getElementById("quoteListSubmitBtn");
  const originalBtnText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.style.opacity = "0.7";
  submitBtn.textContent =
    currentLang === "ar"
      ? "جاري التحضير..."
      : currentLang === "it"
        ? "Preparazione in corso..."
        : "Preparing...";

  try {
    const products = window.store ? window.store.getProducts() : [];
    let itemsListString = "";

    list.forEach((item, index) => {
      const p = products.find((prod) => prod.id === item.productId);
      if (p) {
        const productName = getProductName(p, currentLang);
        if (currentLang === "ar") {
          itemsListString += `\n${index + 1}. اسم المنتج: ${productName}
   كود المنتج: ${p.model}
   الكمية المطلوبة: ${item.quantity}
   المواصفات: معدل تدفق ${p.qGpm} GPM، ضغط ${p.hBar} بار
   المكونات: كهربائية (${p.electricPump})، ديزل (${p.dieselPump})، جوكي (${p.jockeyPump})
   التكوين: ${p.configuration}`;
        } else if (currentLang === "it") {
          itemsListString += `\n${index + 1}. Nome prodotto: ${productName}
   Codice prodotto: ${p.model}
   Quantità richiesta: ${item.quantity}
   Specifiche: Portata ${p.qGpm} GPM, Prevalenza ${p.hBar} Bar
   Componenti: Elettrica (${p.electricPump}), Diesel (${p.dieselPump}), Jockey (${p.jockeyPump})
   Configurazione: ${p.configuration}`;
        } else {
          itemsListString += `\n${index + 1}. Product name: ${productName}
   Product code: ${p.model}
   Required quantity: ${item.quantity}
   Specs: Flow ${p.qGpm} GPM, Head ${p.hBar} Bar
   Components: Electric (${p.electricPump}), Diesel (${p.dieselPump}), Jockey (${p.jockeyPump})
   Configuration: ${p.configuration}`;
        }
      }
    });

    let waMessage = "";
    if (currentLang === "ar") {
      waMessage = `THE HAMMER - طلب عرض سعر جديد

بيانات العميل:

الاسم: ${name}
رقم الهاتف: ${phone}
البريد الإلكتروني: ${email}`;
      if (company) waMessage += `\nاسم الشركة: ${company}`;
      waMessage += `\nالموقع: ${country}

بيانات المنتجات المطلوبة:
${itemsListString}`;
      if (message) waMessage += `\n\nتفاصيل إضافية:\n${message}`;
    } else if (currentLang === "it") {
      waMessage = `THE HAMMER - Nuova richiesta di preventivo

Informazioni cliente:

Nome: ${name}
Telefono: ${phone}
Email: ${email}`;
      if (company) waMessage += `\nAzienda: ${company}`;
      waMessage += `\nLocalità: ${country}

Informazioni prodotti:
${itemsListString}`;
      if (message) waMessage += `\n\nDettagli aggiuntivi:\n${message}`;
    } else {
      waMessage = `THE HAMMER - New Quote Request

Customer information:

Name: ${name}
Phone: ${phone}
Email: ${email}`;
      if (company) waMessage += `\nCompany: ${company}`;
      waMessage += `\nLocation: ${country}

Product information:
${itemsListString}`;
      if (message) waMessage += `\n\nAdditional details:\n${message}`;
    }

    const encoded = encodeURIComponent(waMessage);
    const whatsappUrl = `https://wa.me/201203666634?text=${encoded}`;

    const newTab = window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    if (newTab) {
      closeQuoteListModal();
      saveQuoteList([]);
      document.getElementById("quoteListForm").reset();
    } else {
      alert(window.i18n.t("validation.whatsappError"));
    }
  } catch (err) {
    console.error(err);
    alert(window.i18n.t("validation.whatsappError"));
  } finally {
    submitBtn.disabled = false;
    submitBtn.style.opacity = "1";
    submitBtn.innerHTML = originalBtnText;
  }
}

/* Fallback Routing for openQuoteModal */
function openQuoteModal(productId = "") {
  if (productId) {
    addToQuoteList(productId);
  } else {
    openQuoteListModal();
  }
}

function closeQuoteModal() {
  closeQuoteListModal();
}

function setupDropzone() {
  const dropzone = document.getElementById("quoteFileDropzone");
  const fileInput = document.getElementById("quoteFileInput");
  if (dropzone && fileInput) {
    dropzone.onclick = () => fileInput.click();
    if (window.mediaManager) {
      window.mediaManager.setupDropzone(dropzone, (file) => {
        selectedQuoteFile = file;
        document.getElementById("filePreviewName").textContent =
          `Attached: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
      });
    }
  }
}

function handleQuoteFileChange(event) {
  const file = event.target.files[0];
  if (file) {
    selectedQuoteFile = file;
    document.getElementById("filePreviewName").textContent =
      `Attached: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
  }
}

// Form validations & submissions
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePhone(phone) {
  const re = /^[+0-9\s-]{5,}$/;
  return re.test(phone);
}

function showError(fieldId, message) {
  const errorEl = document.getElementById(`error-${fieldId}`);
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = "block";
  }
}

async function handleQuoteSubmit(event) {
  event.preventDefault();
  // Redirect standalone quote submit to handleQuoteListSubmit flow if triggered
  handleQuoteListSubmit(event);
}

async function handleContactSubmit(event) {
  event.preventDefault();

  const errorElements = document.querySelectorAll(".error-msg");
  errorElements.forEach((el) => {
    el.style.display = "none";
    el.textContent = "";
  });

  const name = document.getElementById("contactName").value.trim();
  const phone = document.getElementById("contactPhone").value.trim();
  const email = document.getElementById("contactEmail").value.trim();
  const company = document.getElementById("contactCompany").value.trim();
  const subject = document.getElementById("contactSubject").value.trim();
  const message = document.getElementById("contactMessage").value.trim();

  let hasError = false;
  const currentLang = window.i18n ? window.i18n.currentLang : "en";

  if (!name) {
    showError("contactName", window.i18n.t("validation.fullNameRequired"));
    hasError = true;
  }
  if (!phone) {
    showError("contactPhone", window.i18n.t("validation.phoneRequired"));
    hasError = true;
  } else if (!validatePhone(phone)) {
    showError("contactPhone", window.i18n.t("validation.phoneInvalid"));
    hasError = true;
  }
  if (!email) {
    showError("contactEmail", window.i18n.t("validation.emailInvalid"));
    hasError = true;
  } else if (!validateEmail(email)) {
    showError("contactEmail", window.i18n.t("validation.emailInvalid"));
    hasError = true;
  }
  if (!subject) {
    showError("contactSubject", window.i18n.t("validation.subjectRequired"));
    hasError = true;
  }
  if (!message) {
    showError("contactMessage", window.i18n.t("validation.messageRequired"));
    hasError = true;
  }

  if (hasError) return;

  const submitBtn = document.getElementById("contactSubmitBtn");
  const originalBtnText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.style.opacity = "0.7";
  submitBtn.textContent =
    currentLang === "ar"
      ? "جاري التحضير..."
      : currentLang === "it"
        ? "Preparazione in corso..."
        : "Preparing...";

  try {
    let emailSubject = "";
    let emailBody = "";

    if (currentLang === "ar") {
      emailSubject = "رسالة تواصل جديدة من الموقع";
      emailBody = `رسالة تواصل جديدة من الموقع

الاسم: ${name}
رقم الهاتف: ${phone}
البريد الإلكتروني: ${email}`;
      if (company) emailBody += `\nاسم الشركة: ${company}`;
      emailBody += `\nالموضوع: ${subject}

الرسالة:
${message}`;
    } else if (currentLang === "it") {
      emailSubject = "Nuovo messaggio di contatto dal sito web";
      emailBody = `Nuovo messaggio di contatto dal sito web

Nome: ${name}
Telefono: ${phone}
Email: ${email}`;
      if (company) emailBody += `\nAzienda: ${company}`;
      emailBody += `\nOggetto: ${subject}

Messaggio:
${message}`;
    } else {
      emailSubject = "New website contact message";
      emailBody = `New website contact message

Name: ${name}
Phone: ${phone}
Email: ${email}`;
      if (company) emailBody += `\nCompany: ${company}`;
      emailBody += `\nSubject: ${subject}

Message:
${message}`;
    }

    const mailtoUrl = `mailto:johnadelm23@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoUrl;

    document.getElementById("contactForm").reset();
  } catch (err) {
    console.error(err);
  } finally {
    submitBtn.disabled = false;
    submitBtn.style.opacity = "1";
    submitBtn.innerHTML = originalBtnText;
  }
}

function openWhatsAppQuote(productId) {
  const products = window.store ? window.store.getProducts() : [];
  const p = products.find(
    (item) => item.id === productId || item.model === productId,
  );

  const currentLang = window.i18n ? window.i18n.currentLang : "en";
  let message = "";

  if (p) {
    const categories = window.store ? window.store.getCategories() : [];
    const category = categories.find((c) => c.id === p.categoryId);

    const productName = getProductName(p, currentLang);
    const productCode = p.model;
    const categoryName = category
      ? currentLang === "ar"
        ? category.nameAR
        : currentLang === "it"
          ? category.nameIT
          : category.nameEN
      : "N/A";

    if (currentLang === "ar") {
      message = `مرحبًا أستاذ  Mo'men،

أرغب في الحصول على مزيد من المعلومات عن المنتج التالي:

اسم المنتج: ${productName}
كود المنتج: ${productCode}
التصنيف: ${categoryName}

المواصفات الفنية:
- معدل التدفق: ${p.qGpm} GPM
- الضغط: ${p.hBar} بار
- المضخة الكهربائية: ${p.electricPump}
- مضخة الديزل: ${p.dieselPump}
- مضخة الجوكي: ${p.jockeyPump}
- التكوين والاقتران: ${p.configuration}

رابط المنتج: ${window.location.href}

برجاء إرسال السعر والمعلومات الفنية المتاحة.

شكرًا لك.`;
    } else if (currentLang === "it") {
      message = `Ciao Mo'men,

Vorrei ricevere maggiori informazioni sul seguente prodotto:

Nome prodotto: ${productName}
Codice prodotto: ${productCode}
Categoria: ${categoryName}

Specifiche tecniche:
- Portata: ${p.qGpm} GPM
- Prevalenza: ${p.hBar} Bar
- Pompa Elettrica: ${p.electricPump}
- Pompa Diesel: ${p.dieselPump}
- Pompa Jockey: ${p.jockeyPump}
- Configurazione: ${p.configuration}

Pagina prodotto: ${window.location.href}

Per favore, inviami il prezzo e le informazioni tecniche disponibili.

Grazie.`;
    } else {
      message = `Hello Mo'men,

I would like to request more information about the following product:

Product name: ${productName}
Product code: ${productCode}
Category: ${categoryName}

Technical Specifications:
- Flow Rate: ${p.qGpm} GPM
- Head Pressure: ${p.hBar} Bar
- Electric Pump: ${p.electricPump}
- Diesel Pump: ${p.dieselPump}
- Jockey Pump: ${p.jockeyPump}
- Configuration: ${p.configuration}

Product page: ${window.location.href}

Please send me the price and the available technical information.

Thank you.`;
    }
  } else {
    const subject = productId || "General Inquiry";
    if (currentLang === "ar") {
      message = `مرحبًا أستاذ Mo'men،

أود الحصول على مزيد من المعلومات حول: ${subject}

شكرًا لك.`;
    } else if (currentLang === "it") {
      message = `Ciao Mo'men,

Vorrei ricevere maggiori informazioni in merito a: ${subject}

Grazie.`;
    } else {
      message = `Hello Mo'men,

I would like to request more information regarding: ${subject}

Thank you.`;
    }
  }

  const encoded = encodeURIComponent(message);
  window.open(
    `https://wa.me/201203666634?text=${encoded}`,
    "_blank",
    "noopener,noreferrer",
  );
}

/* ==========================================================================
   WORLD-CLASS PREMIUM MOTION ENGINE (60 FPS GPU-ACCELERATED)
   ========================================================================== */
function initPremiumMotionEngine() {
  // 0. Reset scroll position on page load to open at Hero section (top of homepage)
  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });

  // 1. IntersectionObserver for Reveal Animations (Runs ONLY ONCE)
  if ("IntersectionObserver" in window) {
    const revealElements = document.querySelectorAll(
      ".reveal, .reveal-up, .reveal-down, .reveal-left, .reveal-right, .reveal-scale, .reveal-blur, .reveal-rotate, .stagger-item, .product-card, .partner-card, .category-card"
    );

    const observerOptions = {
      root: null,
      rootMargin: "0px 0px -30px 0px",
      threshold: 0.08,
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          if (entry.target.classList.contains("hero-stat-number") || entry.target.querySelector(".hero-stat-number")) {
            animateStatNumbers(entry.target);
          }
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    document
      .querySelectorAll(".reveal, .stagger-item, .product-card, .partner-card")
      .forEach((el) => el.classList.add("is-visible"));
  }

  // 2. 3D Perspective Tilt on Mouse Hover
  init3DTilt();

  // 3. Button Click Ripples & Sheen
  initButtonRipples();

  // 4. Progressive Image Preloader & Blur-up Transition
  initProgressiveImageLoading();
}

/* Butter-Smooth 60FPS Stat Count-up */
function animateStatNumbers(container) {
  const statElements = container.querySelectorAll
    ? container.querySelectorAll(".hero-stat-number, [data-count]")
    : [container];

  statElements.forEach((el) => {
    if (el.getAttribute("data-count-done") === "true") return;
    el.setAttribute("data-count-done", "true");

    const rawText = el.textContent.trim();
    const matchedNumber = rawText.match(/[\d,.]+/);
    if (!matchedNumber) return;

    const targetNum = parseFloat(matchedNumber[0].replace(/,/g, ""));
    const prefix = rawText.substring(0, rawText.indexOf(matchedNumber[0]));
    const suffix = rawText.substring(rawText.indexOf(matchedNumber[0]) + matchedNumber[0].length);

    let startTimestamp = null;
    const duration = 1800;

    function step(timestamp) {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      const currentVal = Math.floor(easeProgress * targetNum);

      el.textContent = `${prefix}${currentVal.toLocaleString()}${suffix}`;

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = rawText;
      }
    }

    window.requestAnimationFrame(step);
  });
}

/* 3D Perspective Tilt Effect for Cards */
function init3DTilt() {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const cardSelector = ".category-card, .product-card, .about-stat-card, .certificate-card, .download-card";

  document.addEventListener("mousemove", (e) => {
    const card = e.target.closest(cardSelector);
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;

    card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.015, 1.015, 1)`;
  });

  document.addEventListener("mouseout", (e) => {
    const card = e.target.closest(cardSelector);
    if (card && !card.contains(e.relatedTarget)) {
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    }
  });
}

/* Button Click Ripple Effect */
function initButtonRipples() {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn");
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement("span");
    ripple.className = "ripple-effect";

    const diameter = Math.max(rect.width, rect.height);
    const radius = diameter / 2;

    ripple.style.width = ripple.style.height = `${diameter}px`;
    ripple.style.left = `${e.clientX - rect.left - radius}px`;
    ripple.style.top = `${e.clientY - rect.top - radius}px`;

    btn.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  });
}

/* Progressive Image Blur-Up */
function initProgressiveImageLoading() {
  const images = document.querySelectorAll("img:not(.progressive-loaded)");
  images.forEach((img) => {
    img.classList.add("progressive-loading");
    if (img.complete) {
      img.classList.add("progressive-loaded");
    } else {
      img.addEventListener("load", () => {
        img.classList.add("progressive-loaded");
      });
    }
  });
}

// Disable browser scroll restoration globally
if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

// Guarantee page load / refresh always starts at the Hero section (top: 0)
window.addEventListener("load", () => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "instant"
  });
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPremiumMotionEngine);
} else {
  initPremiumMotionEngine();
}
