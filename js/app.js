/**
 * THEHAMMER - Public Web Application Controller
 * Handles pump catalog rendering, technical spec grid formatting, RFQs, and Email inquiries.
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

      const catCatalogs = window.store && window.store.getCatalogsForCategory ? window.store.getCatalogsForCategory(cat) : [];
      const catalogBadgeHtml = catCatalogs.length > 0
        ? `<span class="category-card-catalog-badge"><i data-lucide="file-text" style="width: 13px; height: 13px;"></i> ${catCatalogs.length} ${currentLang === "ar" ? "كتالوجات PDF" : currentLang === "it" ? "Cataloghi PDF" : "PDF Catalogs"}</span>`
        : "";

      const formattedCount = window.i18n
        ? window.i18n.t("catalog.foundProducts", { count }, `Found ${count} Products`)
        : `Found ${count} Products`;

      return `
        <div class="category-card" data-filter-tag="${filterTag}" onclick="openCategoryPage('${cat.slug}')">
          <div class="category-card-img-wrapper">
            <img src="${catImage}" alt="${catName} category" class="category-card-img" width="400" height="260" loading="lazy" decoding="async" onerror="console.error('Failed to load category image:', '${catImage}');">
            <span class="category-card-count-badge">${formattedCount}</span>
            ${catalogBadgeHtml}
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

      const titleKey = currentLang === "ar" ? "titleAR" : currentLang === "it" ? "titleIT" : "titleEN";
      const matchingCatalogs = (window.store && window.store.getCatalogsForProduct)
        ? window.store.getCatalogsForProduct(p)
        : [];
      const isFallbackCatalog = matchingCatalogs.length === 1 && (matchingCatalogs[0].isMainFallback || matchingCatalogs[0].id === "cat-pdf-main");

      const previewText = window.i18n ? window.i18n.t("pdf.previewPdf", "Preview PDF") : "Preview PDF";
      const downloadText = window.i18n ? window.i18n.t("pdf.downloadCatalog", "Download") : "Download";
      const pagesText = window.i18n ? window.i18n.t("pdf.pagesCount", "Pages") : "Pages";

      const catalogBoxHeaderTitle = isFallbackCatalog
        ? (window.i18n ? window.i18n.t("pdf.masterCatalog", "THEHAMMER Master Catalog") : "THEHAMMER Master Catalog")
        : (matchingCatalogs.length > 1
            ? (window.i18n ? window.i18n.t("pdf.technicalCatalogs", "Technical Catalogs") : "Technical Catalogs")
            : (window.i18n ? window.i18n.t("pdf.technicalCatalog", "Technical Catalog") : "Technical Catalog"));

      const catalogBoxBadge = isFallbackCatalog
        ? (window.i18n ? window.i18n.t("pdf.completeRange", "Complete Range") : "Complete Range")
        : (matchingCatalogs.length > 1 ? `${matchingCatalogs.length} Catalogs` : "PDF");

      const catalogItemsHtml = matchingCatalogs.map((c) => {
        const title = c[titleKey] || c.titleEN;
        const encodedPdf = encodeURI(`images/catalogs/${c.filename}`);
        const cleanFilename = c.cleanDownloadFilename || c.filename;

        let pressureBadge = "";
        if (c.pressureBar) {
          pressureBadge = `<span class="catalog-mini-pill pressure-known">${c.pressureBar} Bar</span>`;
        } else if (c.gpm) {
          const unknownText = window.i18n ? window.i18n.t("pdf.pressureUnknown", "Pressure Unknown") : "Pressure Unknown";
          pressureBadge = `<span class="catalog-mini-pill pressure-unknown">${unknownText}</span>`;
        } else {
          const rangeText = window.i18n ? window.i18n.t("pdf.fallbackNotice", "Master Catalog Fallback") : "Master Fallback";
          pressureBadge = `<span class="catalog-mini-pill pressure-master">${rangeText}</span>`;
        }

        const capBadge = c.gpm ? `<span class="catalog-mini-pill capacity-pill">${c.gpm} GPM</span>` : "";

        return `
          <div class="product-catalog-row">
            <div class="product-catalog-row-info">
              <div class="product-catalog-pills">
                ${capBadge}
                ${pressureBadge}
              </div>
              <span class="product-catalog-filename" title="${title}">${title}</span>
              <span class="product-catalog-meta">${c.pages} ${pagesText} • ${c.fileSize}</span>
            </div>
            <div class="product-catalog-row-actions">
              <a href="${encodedPdf}" target="_blank" rel="noopener noreferrer" class="catalog-mini-btn btn-secondary" aria-label="${previewText}: ${title}">
                <i data-lucide="eye" style="width: 13px; height: 13px;"></i>
                <span>${previewText}</span>
              </a>
              <button type="button" class="catalog-mini-btn btn-primary" onclick="downloadCatalogPdf('${encodedPdf}', '${cleanFilename}', '${c.id}')" aria-label="${downloadText}: ${title}">
                <i data-lucide="download" style="width: 13px; height: 13px;"></i>
                <span>${downloadText}</span>
              </button>
            </div>
          </div>
        `;
      }).join("");

      const catalogBoxHtml = matchingCatalogs.length > 0 ? `
        <div class="product-card-catalog-box ${isFallbackCatalog ? 'is-fallback' : 'is-specialized'}">
          <div class="product-catalog-box-header">
            <div class="product-catalog-header-title">
              <i data-lucide="file-text" style="width: 14px; height: 14px; color: var(--primary-red);"></i>
              <span>${catalogBoxHeaderTitle}</span>
            </div>
            <span class="product-catalog-type-badge">${catalogBoxBadge}</span>
          </div>
          <div class="product-catalog-box-list">
            ${catalogItemsHtml}
          </div>
        </div>
      ` : "";

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

          <!-- Integrated Catalog Display -->
          ${catalogBoxHtml}

          <div class="product-card-footer">
            <button class="btn btn-secondary btn-sm product-card-btn" onclick="openProductDetail('${p.id}')" data-i18n="catalog.viewDetails">${window.i18n.t("catalog.viewDetails")}</button>
            <button class="btn btn-primary btn-sm product-card-btn" onclick="addToQuoteList('${p.id}')" data-i18n="catalog.addToQuote">${window.i18n.t("catalog.addToQuote")}</button>
            <button class="btn btn-outline btn-sm product-card-btn" onclick="openEmailInquiry('${p.id}')" aria-label="${currentLang === "it" ? "Invia richiesta per " + name : currentLang === "ar" ? "استفسار لـ " + name : "Inquire for " + name}">
              <i data-lucide="mail" class="btn-icon" style="width: 14px; margin-right: 4px;"></i>
              <span data-i18n="catalog.sendInquiry">${window.i18n.t("catalog.sendInquiry", "Send Inquiry")}</span>
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

/* ==========================================================================
   OFFICIAL CATALOG SYSTEM: DOWNLOAD, PREVIEW & RENDERING
   ========================================================================== */

let activeCatalogFlowFilter = "all";

/**
 * Downloads a catalog PDF using Blob URL to force direct attachment download
 * across any static server configuration (GitHub Pages, Vercel, Nginx, etc.),
 * with graceful anchor download fallback.
 */
async function downloadCatalogPdf(encodedPath, cleanFilename, catalogId) {
  if (catalogId && window.store && window.store.incrementDownloadCount) {
    window.store.incrementDownloadCount(catalogId);
  }

  const fallbackFilename = cleanFilename || encodedPath.split("/").pop().replace(/%20/g, " ");

  try {
    // 1. Fetch as blob to guarantee real attachment file download
    const response = await fetch(encodedPath);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = fallbackFilename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 4000);
  } catch (err) {
    console.warn("Direct blob download failed, falling back to anchor download:", err);
    // 2. Fallback: Native anchor tag with download attribute
    const a = document.createElement("a");
    a.href = encodedPath;
    a.download = fallbackFilename;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

function renderDownloads() {
  const grid = document.getElementById("downloadsGrid");
  if (!grid) return;

  const allDownloads = window.store ? window.store.getDownloads() : [];
  // Ensure homepage downloads section displays ONLY the main catalog (and non-catalog technical guides)
  const downloads = allDownloads.filter((d) => !d.id.startsWith("dl-cat-") || d.id === "dl-cat-main");
  const currentLang = window.i18n ? window.i18n.currentLang : "en";
  const titleKey = currentLang === "ar" ? "titleAR" : currentLang === "it" ? "titleIT" : "titleEN";
  const previewText = window.i18n ? window.i18n.t("pdf.previewPdf", "Preview PDF") : "Preview PDF";
  const downloadText = window.i18n ? window.i18n.t("pdf.downloadCatalog", "Download") : "Download";

  grid.innerHTML = downloads
    .map((d) => {
      const title = d[titleKey] || d.titleEN;
      const isCatalog = d.category === "Fire Pump Catalog" || (d.file && d.file.endsWith(".pdf") && d.file.includes("Fire"));
      const encodedPdf = isCatalog ? encodeURI(`images/catalogs/${d.file}`) : "";
      const cleanName = d.cleanDownloadFilename || d.file;
      const sizeInfo = d.fileSize ? ` • ${d.fileSize}` : "";

      const previewBtnHtml = isCatalog
        ? `<a href="${encodedPdf}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm" aria-label="${previewText}: ${title}">
            <i data-lucide="eye" style="width: 14px; height: 14px;"></i>
            <span>${previewText}</span>
          </a>`
        : "";

      return `
        <div class="download-card stagger-item">
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.35rem;">
              <span class="badge ${isCatalog ? 'badge-primary' : 'badge-secondary'}" style="font-size: 0.725rem; font-weight: 700; font-family: var(--font-mono); padding: 0.2rem 0.5rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
                <i data-lucide="${isCatalog ? 'file-text' : 'package'}" style="width: 12px; height: 12px; margin-right: 4px;"></i>
                ${d.category}
              </span>
              ${d.rating ? `<span style="font-size: 0.75rem; font-weight: 600; color: var(--text-muted); font-family: var(--font-mono);">${d.rating}</span>` : ''}
            </div>
            <h4 class="download-title">${title}</h4>
            <span class="download-info">Downloads: ${d.count || 0}${sizeInfo}</span>
          </div>
          <div class="download-card-actions" style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
            ${previewBtnHtml}
            <button type="button" class="btn btn-primary btn-sm" onclick="triggerDownload('${d.id}', '${d.file}')" aria-label="${downloadText}: ${title}">
              <i data-lucide="download" style="width: 14px; height: 14px;"></i>
              <span>${downloadText}</span>
            </button>
          </div>
        </div>
      `;
    })
    .join("");

  if (window.lucide) {
    lucide.createIcons();
  }
}

function triggerDownload(id, filename) {
  if (window.store) window.store.incrementDownloadCount(id);
  const download = (window.store ? window.store.getDownloads() : []).find((d) => d.id === id);
  const cleanName = (download && download.cleanDownloadFilename) ? download.cleanDownloadFilename : filename;
  const encodedUrl = encodeURI(`images/catalogs/${filename}`);
  downloadCatalogPdf(encodedUrl, cleanName, id);
}

let lastActiveElement = null;
let originalPageTitle = document.title;
let originalMetaDescription =
  document.querySelector('meta[name="description"]')?.getAttribute("content") ||
  "";

/* Product Spec Modal */
function openProductDetail(productId) {
  const products = window.store ? window.store.getProducts() : [];
  const p = products.find((item) => item.id === productId || item.slug === productId);
  if (!p) return;

  const currentLang = window.i18n ? window.i18n.currentLang : "en";

  const detailModelEl = document.getElementById("detailModel");
  if (detailModelEl) detailModelEl.textContent = p.model;

  const detailNameEl = document.getElementById("detailName");
  if (detailNameEl) detailNameEl.textContent = getProductName(p, currentLang);

  // Highlighting key specs in details modal
  const specHighlightHTML =
    currentLang === "ar"
      ? `<div class="modal-spec-highlight">معدل التدفق (Q) = ${p.qGpm} جالون/دقيقة | الضغط (H) = ${p.hBar} بار</div>`
      : `<div class="modal-spec-highlight">Flow Rate (Q) = ${p.qGpm} GPM | Head (H) = ${p.hBar} Bar</div>`;

  const detailDescEl = document.getElementById("detailDesc");
  if (detailDescEl) {
    detailDescEl.innerHTML =
      specHighlightHTML + `<p>${getProductDesc(p, currentLang)}</p>`;
  }

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

  const emailBtn = document.getElementById("detailEmailBtn") || document.getElementById("detailWhatsAppBtn");
  if (emailBtn) {
    emailBtn.onclick = () => {
      openEmailInquiry(p.id);
    };
  }

  const matchedCatalog = (window.store && window.store.getCatalogForProduct) ? window.store.getCatalogForProduct(p) : null;
  const catalogPdfUrl = matchedCatalog ? encodeURI(`images/catalogs/${matchedCatalog.filename}`) : null;

  const pdfUrl =
    p.pdfUrl ||
    p.datasheetUrl ||
    p.catalogUrl ||
    catalogPdfUrl ||
    p.documentUrl ||
    p.datasheetPdf;
  const pdfBtn = document.getElementById("detailPdfBtn");
  if (pdfBtn) {
    if (pdfUrl) {
      pdfBtn.style.cursor = "pointer";
      pdfBtn.style.opacity = "1";
      pdfBtn.onclick = () => {
        if (matchedCatalog) {
          downloadCatalogPdf(pdfUrl, matchedCatalog.cleanDownloadFilename, matchedCatalog.id);
        } else {
          window.open(pdfUrl, "_blank", "noopener,noreferrer");
        }
      };
      const labelText = matchedCatalog
        ? (matchedCatalog.gpm
            ? `${window.i18n ? window.i18n.t("pdf.downloadCatalog", "Download Catalog") : "Download Catalog"} (${matchedCatalog.gpm} GPM)`
            : (window.i18n ? window.i18n.t("pdf.masterCatalog", "THEHAMMER Master Catalog") : "THEHAMMER Master Catalog"))
        : (window.i18n ? window.i18n.t("pdf.download", "Download PDF") : "Download PDF");
      pdfBtn.innerHTML = `<i data-lucide="download" style="width: 16px; height: 16px; margin-right: 6px;"></i><span>${labelText}</span>`;
      if (window.lucide) {
        lucide.createIcons();
      }
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
  const itemsGrid = document.getElementById("quoteListItemsGrid");
  const totalCountEl = document.getElementById("quoteListTotalCount");
  const currentLang = window.i18n ? window.i18n.currentLang : "en";

  const totalQuantity = list.reduce((sum, item) => sum + (item.quantity || 1), 0);
  if (totalCountEl) totalCountEl.textContent = totalQuantity;

  if (list.length === 0) {
    if (emptyState) emptyState.style.display = "flex";
    if (content) content.style.display = "none";
    return;
  }

  if (emptyState) emptyState.style.display = "none";
  if (content) content.style.display = "block";

  if (itemsGrid) {
    const products = window.store ? window.store.getProducts() : [];
    const categories = window.store ? window.store.getCategories() : [];

    itemsGrid.innerHTML = list
      .map((item) => {
        const p = products.find((prod) => prod.id === item.productId);
        if (!p) return "";

        const productName = getProductName(p, currentLang);
        const cat = categories.find((c) => c.id === p.categoryId);
        const catName = cat
          ? currentLang === "ar"
            ? cat.nameAR
            : currentLang === "it"
              ? cat.nameIT
              : cat.nameEN
          : "THEHAMMER";

        return `
        <div class="quote-item-card">
          <div class="quote-item-img-wrapper">
            <img src="${p.image}" alt="${productName}" class="quote-item-img" width="80" height="65" loading="lazy" onerror="this.src='images/PSM-Electric-Pump.jpg'">
          </div>
          <div class="quote-item-details">
            <span class="quote-item-cat">${catName}</span>
            <h4 class="quote-item-title">${productName}</h4>
            <span class="quote-item-model font-mono tech-val">${p.model}</span>
            
            <div class="quote-item-bottom">
              <div class="qty-selector quote-qty-selector">
                <button type="button" class="qty-btn" onclick="updateQuoteListQty('${p.id}', -1)" aria-label="Decrease quantity">-</button>
                <span class="qty-val">${item.quantity}</span>
                <button type="button" class="qty-btn" onclick="updateQuoteListQty('${p.id}', 1)" aria-label="Increase quantity">+</button>
              </div>
              <button type="button" class="quote-remove-btn" onclick="removeFromQuoteList('${p.id}')" title="Remove item" aria-label="Remove item">
                <i data-lucide="trash-2" class="trash-icon"></i>
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
  }
}

function clearQuoteList() {
  const currentLang = window.i18n ? window.i18n.currentLang : "en";
  const confirmMsg =
    currentLang === "ar"
      ? "هل أنت تأكد من رغبتك في مسح قائمة طلب السعر بالكامل؟"
      : currentLang === "it"
        ? "Sei sicuro di voler svuotare l'elenco dei preventivi?"
        : "Are you sure you want to clear your Quote List?";

  if (confirm(confirmMsg)) {
    saveQuoteList([]);
    updateQuoteListBadge();
    renderQuoteList();
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

  const company = document.getElementById("quoteListCompany") ? document.getElementById("quoteListCompany").value.trim() : "";
  const name = document.getElementById("quoteListName") ? document.getElementById("quoteListName").value.trim() : "";
  const email = document.getElementById("quoteListEmail") ? document.getElementById("quoteListEmail").value.trim() : "";
  const phoneEl = document.getElementById("quoteListPhone");
  const phone = phoneEl ? phoneEl.value.trim() : "";
  const country = document.getElementById("quoteListCountry") ? document.getElementById("quoteListCountry").value.trim() : "";
  const message = document.getElementById("quoteListMessage") ? document.getElementById("quoteListMessage").value.trim() : "";

  let hasError = false;
  const currentLang = window.i18n ? window.i18n.currentLang : "en";

  if (!name) {
    showError("quoteListName", window.i18n.t("validation.fullNameRequired"));
    hasError = true;
  }
  if (phoneEl && phone && !validatePhone(phone)) {
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

    let emailSubject = "";
    let emailBody = "";
    if (currentLang === "ar") {
      emailSubject = "THE HAMMER - طلب عرض سعر جديد";
      emailBody = `THE HAMMER - طلب عرض سعر جديد

بيانات العميل:

الاسم: ${name}
البريد الإلكتروني: ${email}`;
      if (phone) emailBody += `\nرقم الهاتف: ${phone}`;
      if (company) emailBody += `\nاسم الشركة: ${company}`;
      emailBody += `\nالموقع: ${country}

بيانات المنتجات المطلوبة:
${itemsListString}`;
      if (message) emailBody += `\n\nتفاصيل إضافية:\n${message}`;
    } else if (currentLang === "it") {
      emailSubject = "THE HAMMER - Nuova richiesta di preventivo";
      emailBody = `THE HAMMER - Nuova richiesta di preventivo

Informazioni cliente:

Nome: ${name}
Email: ${email}`;
      if (phone) emailBody += `\nTelefono: ${phone}`;
      if (company) emailBody += `\nAzienda: ${company}`;
      emailBody += `\nLocalità: ${country}

Informazioni prodotti:
${itemsListString}`;
      if (message) emailBody += `\n\nDettagli aggiuntivi:\n${message}`;
    } else {
      emailSubject = "THE HAMMER - New Quote Request";
      emailBody = `THE HAMMER - New Quote Request

Customer information:

Name: ${name}
Email: ${email}`;
      if (phone) emailBody += `\nPhone: ${phone}`;
      if (company) emailBody += `\nCompany: ${company}`;
      emailBody += `\nLocation: ${country}

Product information:
${itemsListString}`;
      if (message) emailBody += `\n\nAdditional details:\n${message}`;
    }

    const recipientEmail = (window.store && window.store.getSettings && window.store.getSettings().email) || "info@thehammer.uk";
    const mailtoUrl = `mailto:${recipientEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoUrl;

    closeQuoteListModal();
    saveQuoteList([]);
    document.getElementById("quoteListForm").reset();
  } catch (err) {
    console.error(err);
    alert(window.i18n ? window.i18n.t("validation.emailError") : "Unable to send email inquiry.");
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

  const name = document.getElementById("contactName") ? document.getElementById("contactName").value.trim() : "";
  const phoneEl = document.getElementById("contactPhone");
  const phone = phoneEl ? phoneEl.value.trim() : "";
  const email = document.getElementById("contactEmail") ? document.getElementById("contactEmail").value.trim() : "";
  const company = document.getElementById("contactCompany") ? document.getElementById("contactCompany").value.trim() : "";
  const subject = document.getElementById("contactSubject") ? document.getElementById("contactSubject").value.trim() : "";
  const message = document.getElementById("contactMessage") ? document.getElementById("contactMessage").value.trim() : "";

  let hasError = false;
  const currentLang = window.i18n ? window.i18n.currentLang : "en";

  if (!name) {
    showError("contactName", window.i18n.t("validation.fullNameRequired"));
    hasError = true;
  }
  if (phoneEl && phone && !validatePhone(phone)) {
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
البريد الإلكتروني: ${email}`;
      if (phone) emailBody += `\nرقم الهاتف: ${phone}`;
      if (company) emailBody += `\nاسم الشركة: ${company}`;
      emailBody += `\nالموضوع: ${subject}

الرسالة:
${message}`;
    } else if (currentLang === "it") {
      emailSubject = "Nuovo messaggio di contatto dal sito web";
      emailBody = `Nuovo messaggio di contatto dal sito web

Nome: ${name}
Email: ${email}`;
      if (phone) emailBody += `\nTelefono: ${phone}`;
      if (company) emailBody += `\nAzienda: ${company}`;
      emailBody += `\nOggetto: ${subject}

Messaggio:
${message}`;
    } else {
      emailSubject = "New website contact message";
      emailBody = `New website contact message

Name: ${name}
Email: ${email}`;
      if (phone) emailBody += `\nPhone: ${phone}`;
      if (company) emailBody += `\nCompany: ${company}`;
      emailBody += `\nSubject: ${subject}

Message:
${message}`;
    }

    const recipientEmail = (window.store && window.store.getSettings && window.store.getSettings().email) || "info@thehammer.uk";
    const mailtoUrl = `mailto:${recipientEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
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

function openEmailInquiry(productId) {
  const products = window.store ? window.store.getProducts() : [];
  const p = products.find(
    (item) => item.id === productId || item.model === productId,
  );

  const currentLang = window.i18n ? window.i18n.currentLang : "en";
  let subject = "";
  let body = "";

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
      subject = `استفسار عن ${productName}`;
      body = `مرحبًا فريق ذا هامر،

أود الحصول على مزيد من المعلومات حول:

المنتج: ${productName}
التصنيف: ${categoryName}
الموديل: ${productCode}

المواصفات الفنية:
- معدل التدفق: ${p.qGpm} GPM
- الضغط: ${p.hBar} بار
- المضخة الكهربائية: ${p.electricPump}
- مضخة الديزل: ${p.dieselPump}
- مضخة الجوكي: ${p.jockeyPump}
- التكوين: ${p.configuration}

رابط المنتج: ${window.location.href}

برجاء إرسال المزيد من المعلومات وعرض السعر.

شكرًا لكم.`;
    } else if (currentLang === "it") {
      subject = `Richiesta informazioni per ${productName}`;
      body = `Ciao Team THEHAMMER,

Vorrei ricevere maggiori informazioni su:

Prodotto: ${productName}
Categoria: ${categoryName}
Modello: ${productCode}

Specifiche tecniche:
- Portata: ${p.qGpm} GPM
- Prevalenza: ${p.hBar} Bar
- Pompa Elettrica: ${p.electricPump}
- Pompa Diesel: ${p.dieselPump}
- Pompa Jockey: ${p.jockeyPump}
- Configurazione: ${p.configuration}

Pagina prodotto: ${window.location.href}

Per favore, inviatemi maggiori informazioni e un preventivo.

Grazie.`;
    } else {
      subject = `Inquiry About ${productName}`;
      body = `Hello THEHAMMER Team,

I would like to request more information about:

Product: ${productName}
Category: ${categoryName}
Model: ${productCode}

Technical Specifications:
- Flow Rate: ${p.qGpm} GPM
- Head Pressure: ${p.hBar} Bar
- Electric Pump: ${p.electricPump}
- Diesel Pump: ${p.dieselPump}
- Jockey Pump: ${p.jockeyPump}
- Configuration: ${p.configuration}

Product page: ${window.location.href}

Please send me more information and a quotation.

Thank you.`;
    }
  } else {
    const inquiryTopic = productId || "General Pump Enquiry";
    if (currentLang === "ar") {
      subject = `استفسار فني: ${inquiryTopic}`;
      body = `مرحبًا فريق ذا هامر،

أود الحصول على مزيد من المعلومات حول: ${inquiryTopic}.

شكرًا لكم.`;
    } else if (currentLang === "it") {
      subject = `Richiesta informazioni: ${inquiryTopic}`;
      body = `Ciao Team THEHAMMER,

Vorrei ricevere maggiori informazioni in merito a: ${inquiryTopic}.

Grazie.`;
    } else {
      subject = `Inquiry: ${inquiryTopic}`;
      body = `Hello THEHAMMER Team,

I would like to request more information regarding: ${inquiryTopic}.

Thank you.`;
    }
  }

  const recipientEmail = (window.store && window.store.getSettings && window.store.getSettings().email) || "info@thehammer.uk";
  const mailtoUrl = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailtoUrl;
}

function openWhatsAppQuote(productId) {
  openEmailInquiry(productId);
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
