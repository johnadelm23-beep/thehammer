/**
 * European Industrial Manufacturer - Media Manager & Cloudinary Service
 * Drag-and-drop file upload, client-side WebP converter, thumbnail generator, and Cloudinary API sync.
 */

class MediaManagerService {
  constructor() {
    this.allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    this.allowedDocTypes = ['application/pdf', 'application/zip', 'application/x-step'];
  }

  /**
   * Reads a File and generates a client-side WebP preview, compressed thumbnail, and Base64 string.
   */
  async processFile(file) {
    return new Promise((resolve, reject) => {
      const isImage = this.allowedImageTypes.includes(file.type);
      const isDoc = this.allowedDocTypes.includes(file.type);

      if (!isImage && !isDoc) {
        return reject(new Error('Unsupported file format. Please upload JPG, PNG, WebP, SVG, or PDF.'));
      }

      if (file.size > 15 * 1024 * 1024) {
        return reject(new Error('File size exceeds the 15MB limit.'));
      }

      const reader = new FileReader();

      reader.onload = (e) => {
        const result = {
          name: file.name,
          size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
          type: file.type,
          url: e.target.result,
          optimizedWebP: null,
          thumbnailUrl: null,
          uploadedAt: new Date().toISOString()
        };

        if (isImage) {
          this.generateWebPAndThumbnail(e.target.result)
            .then(({ webpUrl, thumbUrl }) => {
              result.optimizedWebP = webpUrl;
              result.thumbnailUrl = thumbUrl;
              resolve(result);
            })
            .catch(() => resolve(result));
        } else {
          result.thumbnailUrl = 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=120&q=80'; // PDF Icon
          resolve(result);
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file stream.'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Generates optimized WebP and thumbnail via HTML5 Canvas
   */
  generateWebPAndThumbnail(dataUrl) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // WebP version (Max 1200px wide)
        let width = img.width;
        let height = img.height;
        const maxW = 1200;
        if (width > maxW) {
          height = Math.round((height * maxW) / width);
          width = maxW;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        const webpUrl = canvas.toDataURL('image/webp', 0.85);

        // Thumbnail version (200x200 crop)
        const thumbCanvas = document.createElement('canvas');
        thumbCanvas.width = 200;
        thumbCanvas.height = 200;
        const thumbCtx = thumbCanvas.getContext('2d');
        thumbCtx.drawImage(img, 0, 0, 200, 200);
        const thumbUrl = thumbCanvas.toDataURL('image/webp', 0.7);

        resolve({ webpUrl, thumbUrl });
      };
      img.src = dataUrl;
    });
  }

  /**
   * Uploads file to Cloudinary if Cloud Name is configured, otherwise fallback to local dataURL.
   */
  async uploadToCloudinary(file) {
    const settings = window.store ? window.store.getSettings() : {};
    const cloudName = settings.cloudinaryCloudName;

    if (!cloudName || cloudName.includes('demo')) {
      // Offline / Fallback mode
      const processed = await this.processFile(file);
      return {
        success: true,
        url: processed.optimizedWebP || processed.url,
        thumbnailUrl: processed.thumbnailUrl,
        publicId: 'local_' + Date.now(),
        provider: 'local_storage'
      };
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'industrial_preset');

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      return {
        success: true,
        url: data.secure_url,
        thumbnailUrl: data.secure_url.replace('/upload/', '/upload/w_200,h_200,c_fill,f_auto,q_auto/'),
        publicId: data.public_id,
        provider: 'cloudinary'
      };
    } catch (err) {
      console.warn('Cloudinary upload failed, falling back to local optimization:', err);
      const processed = await this.processFile(file);
      return {
        success: true,
        url: processed.optimizedWebP || processed.url,
        thumbnailUrl: processed.thumbnailUrl,
        publicId: 'fallback_' + Date.now(),
        provider: 'local_fallback'
      };
    }
  }

  /**
   * Setup Drag and Drop Event listeners on an element
   */
  setupDropzone(element, onFileSelected) {
    if (!element) return;

    ['dragenter', 'dragover'].forEach(eventName => {
      element.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        element.classList.add('dragover');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      element.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        element.classList.remove('dragover');
      }, false);
    });

    element.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files && files.length > 0) {
        onFileSelected(files[0]);
      }
    });
  }
}

window.mediaManager = new MediaManagerService();
