/**
 * THEHAMMER - PREMIUM MOTION & INTERACTIVE SCRIPTS
 * Manages entrance transitions, Intersection Observers, and count-up animations
 */

document.addEventListener('DOMContentLoaded', () => {
  // Check if prefers-reduced-motion is active
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  initScrollHeader();
  initScrollReveal(prefersReducedMotion);
  initCountUp(prefersReducedMotion);
  initDynamicCatalogObserver();
  initModalAnimations();
  initImageLightbox();
});

/**
 * Adds a scroll listener to toggle a scrolled background class on the header
 */
function initScrollHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('header-scrolled');
    } else {
      header.classList.remove('header-scrolled');
    }
  };

  // Run immediately on load in case page is already scrolled
  handleScroll();
  window.addEventListener('scroll', handleScroll, { passive: true });
}

/**
 * Scroll Reveal Intersection Observer
 */
function initScrollReveal(prefersReducedMotion) {
  if (prefersReducedMotion) {
    // If reduced motion is requested, show all reveal elements immediately
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
    return;
  }

  const revealOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        // Stop observing once visible to run the entrance animation only once
        obs.unobserve(entry.target);
      }
    });
  }, revealOptions);

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/**
 * Statistics Count-Up Observer
 */
function initCountUp(prefersReducedMotion) {
  const statsElements = document.querySelectorAll('.hero-stat-number, .about-stat-value');
  if (statsElements.length === 0) return;

  if (prefersReducedMotion) return; // Do not animate count up on prefers-reduced-motion

  const countUpOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -20px 0px'
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCountUp(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, countUpOptions);

  statsElements.forEach(el => observer.observe(el));
}

/**
 * Count up animation logic utilizing requestAnimationFrame
 */
function animateCountUp(el) {
  const targetText = el.textContent.trim();

  // If the target contains letters, it represents a spec code (e.g. NFPA-20, IE3/IE4) - do not count it up
  if (/[a-zA-Z]/.test(targetText)) {
    return;
  }

  // Parse prefix, number string, and suffix
  const match = targetText.match(/^([^\d,.]*)([\d,.]+)([^\d,.]*)$/);
  if (!match) return;

  const prefix = match[1] || '';
  const numStr = match[2];
  const suffix = match[3] || '';

  const isCommaFormatted = numStr.includes(',');
  const hasDecimal = numStr.includes('.');
  const targetVal = parseFloat(numStr.replace(/,/g, ''));

  if (isNaN(targetVal)) return;

  const duration = 1200; // Animation duration in milliseconds
  let start = null;

  function step(timestamp) {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);

    // Ease-out Quad easing
    const easedProgress = progress * (2 - progress);
    const currentVal = targetVal * easedProgress;

    let formattedNum = '';
    if (hasDecimal) {
      const decimals = numStr.split('.')[1].length;
      formattedNum = currentVal.toFixed(decimals);
    } else {
      formattedNum = Math.floor(currentVal).toString();
    }

    if (isCommaFormatted) {
      formattedNum = formattedNum.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    el.textContent = prefix + formattedNum + suffix;

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = targetText; // Restore precise original value
    }
  }

  requestAnimationFrame(step);
}

/**
 * Mutation Observer to apply reveal transitions to dynamically generated catalog cards
 */
function initDynamicCatalogObserver() {
  const catalogGrid = document.getElementById('catalogGrid');
  if (!catalogGrid) return;

  const observer = new MutationObserver(() => {
    const unrevealedCards = catalogGrid.querySelectorAll('.product-card:not(.reveal)');
    unrevealedCards.forEach((card, idx) => {
      card.classList.add('reveal', 'reveal-up');
      
      // Delay to ensure DOM repaint before adding active visible state
      setTimeout(() => {
        card.classList.add('is-visible');
        card.style.transitionDelay = `${idx * 0.04}s`;
      }, 40);
    });
  });

  observer.observe(catalogGrid, { childList: true });
}

/**
 * Modal visibility event hook for smooth scaling backdrop & container transitions
 */
function initModalAnimations() {
  // We hook into modal toggle functions by checking open/close clicks or class shifts
  const modals = document.querySelectorAll('.modal-backdrop');
  if (modals.length === 0) return;

  // Setup observer to check for 'show' class changes on modals
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      if (mutation.attributeName === 'class') {
        const target = mutation.target;
        if (target.classList.contains('show')) {
          document.body.style.overflow = 'hidden';
          document.documentElement.style.overflow = 'hidden';
        } else {
          // If all modals are closed, reset overflow
          const anyOpen = Array.from(modals).some(m => m.classList.contains('show'));
          if (!anyOpen) {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
          }
        }
      }
    });
  });

  modals.forEach(modal => {
    observer.observe(modal, { attributes: true, attributeFilter: ['class'] });
  });
}

/**
 * Reusable full-screen image lightbox modal with event delegation
 */
function initImageLightbox() {
  const lightbox = document.getElementById("imageLightbox");
  const lightboxPreview = document.getElementById("imageLightboxPreview");
  const lightboxClose = document.querySelector(".image-lightbox-close");

  if (!lightbox || !lightboxPreview) return;

  function openImageLightbox(imageSrc, imageAlt) {
    lightboxPreview.src = imageSrc;
    lightboxPreview.alt = imageAlt || "Product preview";

    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    // Lock scroll on active modals behind the lightbox
    document.querySelectorAll(".modal-backdrop.show").forEach(m => {
      m.style.overflowY = "hidden";
    });
  }

  function closeImageLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");

    // Restore scroll on active modals
    document.querySelectorAll(".modal-backdrop.show").forEach(m => {
      m.style.overflowY = "";
    });

    // Maintain modal scroll lock if any other backdrop modal remains visible
    const anyModalOpen = Array.from(document.querySelectorAll('.modal-backdrop')).some(m => m.classList.contains('show'));
    if (!anyModalOpen) {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }

    setTimeout(() => {
      lightboxPreview.src = "";
    }, 250);
  }

  // Delegated click listener
  document.addEventListener("click", (event) => {
    if (event.target.tagName !== "IMG") {
      if (event.target === lightbox) {
        closeImageLightbox();
      }
      return;
    }

    const img = event.target;
    // Matches explicit styling classes or any images within specification/modal containers
    const isClickable = img.matches(
      ".product-detail img, .product-images img, .product-gallery img, .product-modal img, .product-specifications img, #productDetailModal img, .product-detail-image, .product-img-wrapper img, .product-img, .detail-image, .modal-component-img"
    ) || img.closest(".product-detail, .product-images, .product-gallery, .product-modal, .product-specifications, #productDetailModal");

    if (isClickable) {
      openImageLightbox(img.currentSrc || img.src, img.alt);
    }
  });

  lightboxClose?.addEventListener("click", closeImageLightbox);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightbox.classList.contains("is-open")) {
      closeImageLightbox();
    }
  });
}
