(function () {
  "use strict";

  const app = document.getElementById("img2pdf-app");
  if (!app) {
    return;
  }

  const el = {
    fileInput: document.getElementById("img2pdf-input"),
    cameraInput: document.getElementById("img2pdf-camera"),
    clearBtn: document.getElementById("img2pdf-clear"),
    pageSize: document.getElementById("img2pdf-page-size"),
    orientation: document.getElementById("img2pdf-orientation"),
    margin: document.getElementById("img2pdf-margin"),
    quality: document.getElementById("img2pdf-quality"),
    qualityValue: document.getElementById("img2pdf-quality-value"),
    maxEdge: document.getElementById("img2pdf-max-edge"),
    filename: document.getElementById("img2pdf-filename"),
    list: document.getElementById("img2pdf-list"),
    exportBtn: document.getElementById("img2pdf-export"),
    status: document.getElementById("img2pdf-status")
  };

  const hasMissingNode = Object.values(el).some(function (node) {
    return !node;
  });
  if (hasMissingNode) {
    return;
  }

  const state = {
    items: [],
    busy: false,
    dragFrom: null,
    counter: 0
  };

  function nextId() {
    state.counter += 1;
    return "img-" + Date.now() + "-" + state.counter;
  }

  function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) {
      return "0 B";
    }
    const units = ["B", "KB", "MB", "GB"];
    const value = Math.log(bytes) / Math.log(1024);
    const index = Math.min(units.length - 1, Math.floor(value));
    const scaled = bytes / Math.pow(1024, index);
    return scaled.toFixed(index === 0 ? 0 : 1) + " " + units[index];
  }

  function sanitizeFilename(input) {
    const raw = (input || "").trim() || "images-to-pdf";
    const cleaned = raw
      .replace(/[\\/:*?"<>|]/g, "-")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^\./, "")
      .slice(0, 80);
    const finalName = cleaned || "images-to-pdf";
    return finalName.toLowerCase().endsWith(".pdf") ? finalName : finalName + ".pdf";
  }

  function setStatus(message, tone) {
    el.status.textContent = message;
    el.status.dataset.tone = tone || "info";
  }

  function updateQualityLabel() {
    el.qualityValue.textContent = Number(el.quality.value).toFixed(2);
  }

  function revokePreview(item) {
    if (item && item.previewUrl) {
      URL.revokeObjectURL(item.previewUrl);
    }
  }

  function setBusy(flag) {
    state.busy = Boolean(flag);
    app.classList.toggle("is-busy", state.busy);

    const controls = [
      el.fileInput,
      el.cameraInput,
      el.clearBtn,
      el.pageSize,
      el.orientation,
      el.margin,
      el.quality,
      el.maxEdge,
      el.filename,
      el.exportBtn
    ];

    controls.forEach(function (node) {
      node.disabled = state.busy;
    });
  }

  function updateButtons() {
    if (state.busy) {
      return;
    }
    el.clearBtn.disabled = state.items.length === 0;
    el.exportBtn.disabled = state.items.length === 0;
  }

  function buildEmptyNode() {
    const li = document.createElement("li");
    li.className = "img2pdf-empty";
    li.textContent = "No images yet. Use Select Images or Add from Camera.";
    return li;
  }

  function buildItemNode(item, index) {
    const li = document.createElement("li");
    li.className = "img2pdf-item";
    li.dataset.index = String(index);
    li.draggable = true;

    const thumb = document.createElement("img");
    thumb.className = "img2pdf-thumb";
    thumb.src = item.previewUrl;
    thumb.alt = item.file.name;

    const meta = document.createElement("div");
    meta.className = "img2pdf-meta";

    const name = document.createElement("p");
    name.className = "img2pdf-name";
    name.textContent = item.file.name;

    const sub = document.createElement("p");
    sub.className = "img2pdf-sub";
    sub.textContent = "Image " + (index + 1) + " | " + formatBytes(item.file.size);

    meta.appendChild(name);
    meta.appendChild(sub);

    const controls = document.createElement("div");
    controls.className = "img2pdf-controls";

    const up = document.createElement("button");
    up.className = "img2pdf-mini";
    up.type = "button";
    up.dataset.action = "up";
    up.textContent = "Move Up";
    up.disabled = index === 0;

    const down = document.createElement("button");
    down.className = "img2pdf-mini";
    down.type = "button";
    down.dataset.action = "down";
    down.textContent = "Move Down";
    down.disabled = index === state.items.length - 1;

    const del = document.createElement("button");
    del.className = "img2pdf-mini";
    del.type = "button";
    del.dataset.action = "delete";
    del.textContent = "Delete";

    controls.appendChild(up);
    controls.appendChild(down);
    controls.appendChild(del);

    li.appendChild(thumb);
    li.appendChild(meta);
    li.appendChild(controls);

    return li;
  }

  function renderList() {
    el.list.innerHTML = "";
    if (state.items.length === 0) {
      el.list.appendChild(buildEmptyNode());
      updateButtons();
      return;
    }

    state.items.forEach(function (item, index) {
      el.list.appendChild(buildItemNode(item, index));
    });
    updateButtons();
  }

  function addFiles(fileList, sourceLabel) {
    if (state.busy) {
      return;
    }
    const incoming = Array.from(fileList || []);
    if (incoming.length === 0) {
      return;
    }

    const images = incoming.filter(function (file) {
      return file && file.type && file.type.indexOf("image/") === 0;
    });

    if (images.length === 0) {
      setStatus("No image files detected. Please choose images.", "error");
      return;
    }

    images.forEach(function (file) {
      state.items.push({
        id: nextId(),
        file: file,
        previewUrl: URL.createObjectURL(file)
      });
    });

    renderList();
    setStatus(
      sourceLabel + ": added " + images.length + " image(s). Total: " + state.items.length + ".",
      "success"
    );
  }

  function clearAll() {
    if (state.busy) {
      return;
    }
    state.items.forEach(revokePreview);
    state.items = [];
    renderList();
    setStatus("Image list cleared.", "info");
  }

  function removeAt(index) {
    if (state.busy) {
      return;
    }
    if (index < 0 || index >= state.items.length) {
      return;
    }
    const removed = state.items.splice(index, 1)[0];
    revokePreview(removed);
    renderList();
    setStatus("Removed 1 image.", "info");
  }

  function moveItem(fromIndex, toIndex) {
    if (state.busy) {
      return;
    }
    if (
      fromIndex < 0 ||
      fromIndex >= state.items.length ||
      toIndex < 0 ||
      toIndex >= state.items.length ||
      fromIndex === toIndex
    ) {
      return;
    }
    const moved = state.items.splice(fromIndex, 1)[0];
    state.items.splice(toIndex, 0, moved);
    renderList();
  }

  function pickOrientation(preference, width, height) {
    if (preference === "portrait" || preference === "landscape") {
      return preference;
    }
    return width >= height ? "landscape" : "portrait";
  }

  function loadImage(url) {
    return new Promise(function (resolve, reject) {
      const image = new Image();
      image.onload = function () {
        resolve(image);
      };
      image.onerror = function () {
        reject(new Error("Failed to read image."));
      };
      image.src = url;
    });
  }

  async function fileToJpegData(file, quality, maxEdgePx) {
    const imageUrl = URL.createObjectURL(file);
    try {
      const image = await loadImage(imageUrl);
      const rawWidth = image.naturalWidth || image.width;
      const rawHeight = image.naturalHeight || image.height;
      const maxSide = Math.max(rawWidth, rawHeight);
      const scale = maxSide > maxEdgePx ? maxEdgePx / maxSide : 1;
      const width = Math.max(1, Math.round(rawWidth * scale));
      const height = Math.max(1, Math.round(rawHeight * scale));

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) {
        throw new Error("Failed to initialize Canvas.");
      }

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(image, 0, 0, width, height);

      return {
        dataUrl: canvas.toDataURL("image/jpeg", quality),
        width: width,
        height: height
      };
    } finally {
      URL.revokeObjectURL(imageUrl);
    }
  }

  function addImageToPage(doc, imageData, marginMm) {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const safeMargin = Math.max(0, Math.min(marginMm, (Math.min(pageWidth, pageHeight) - 8) / 2));

    const availableWidth = pageWidth - safeMargin * 2;
    const availableHeight = pageHeight - safeMargin * 2;
    const ratio = Math.min(availableWidth / imageData.width, availableHeight / imageData.height);

    const drawWidth = imageData.width * ratio;
    const drawHeight = imageData.height * ratio;
    const x = (pageWidth - drawWidth) / 2;
    const y = (pageHeight - drawHeight) / 2;

    doc.addImage(imageData.dataUrl, "JPEG", x, y, drawWidth, drawHeight, undefined, "FAST");
  }

  async function exportPdf() {
    if (state.busy) {
      return;
    }
    if (state.items.length === 0) {
      setStatus("Please add at least 1 image first.", "error");
      return;
    }

    const jsPDFCtor = window.jspdf && window.jspdf.jsPDF;
    if (!jsPDFCtor) {
      setStatus("PDF engine failed to load. Refresh and try again.", "error");
      return;
    }

    const format = el.pageSize.value === "letter" ? "letter" : "a4";
    const orientationPreference = el.orientation.value;
    const marginMm = Math.max(0, Number(el.margin.value) || 0);
    const quality = Math.min(1, Math.max(0.5, Number(el.quality.value) || 0.82));
    const maxEdgePx = Math.min(5000, Math.max(1000, Number(el.maxEdge.value) || 2500));
    const outputName = sanitizeFilename(el.filename.value);

    setBusy(true);
    setStatus("Processing images...", "info");

    try {
      let doc = null;
      for (let i = 0; i < state.items.length; i += 1) {
        const item = state.items[i];
        setStatus("Processing image " + (i + 1) + " of " + state.items.length + "...", "info");

        const imageData = await fileToJpegData(item.file, quality, maxEdgePx);
        const pageOrientation = pickOrientation(
          orientationPreference,
          imageData.width,
          imageData.height
        );

        if (!doc) {
          doc = new jsPDFCtor({
            orientation: pageOrientation,
            unit: "mm",
            format: format,
            compress: true,
            putOnlyUsedFonts: true
          });
        } else {
          doc.addPage(format, pageOrientation);
        }

        addImageToPage(doc, imageData, marginMm);
      }

      if (!doc) {
        throw new Error("Failed to generate PDF.");
      }

      setStatus("PDF generated. Downloading...", "success");
      doc.save(outputName);
      setStatus("Export complete: " + outputName, "success");
    } catch (error) {
      console.error(error);
      setStatus("Export failed. Try fewer images or lower quality settings.", "error");
    } finally {
      setBusy(false);
      renderList();
    }
  }

  function clearDropStyles() {
    const nodes = el.list.querySelectorAll(".img2pdf-item.is-drop-target");
    nodes.forEach(function (node) {
      node.classList.remove("is-drop-target");
    });
  }

  function bindEvents() {
    el.fileInput.addEventListener("change", function () {
      addFiles(el.fileInput.files, "Gallery");
      el.fileInput.value = "";
    });

    el.cameraInput.addEventListener("change", function () {
      addFiles(el.cameraInput.files, "Camera");
      el.cameraInput.value = "";
    });

    el.clearBtn.addEventListener("click", clearAll);
    el.exportBtn.addEventListener("click", exportPdf);

    el.quality.addEventListener("input", updateQualityLabel);

    el.list.addEventListener("click", function (event) {
      const button = event.target.closest("button[data-action]");
      const row = event.target.closest(".img2pdf-item");
      if (!button || !row) {
        return;
      }
      const index = Number(row.dataset.index);
      if (!Number.isFinite(index)) {
        return;
      }

      const action = button.dataset.action;
      if (action === "delete") {
        removeAt(index);
      } else if (action === "up") {
        moveItem(index, index - 1);
      } else if (action === "down") {
        moveItem(index, index + 1);
      }
    });

    el.list.addEventListener("dragstart", function (event) {
      const row = event.target.closest(".img2pdf-item");
      if (!row || state.busy) {
        return;
      }
      state.dragFrom = Number(row.dataset.index);
      if (!Number.isFinite(state.dragFrom)) {
        state.dragFrom = null;
        return;
      }
      row.classList.add("is-dragging");
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", String(state.dragFrom));
      }
    });

    el.list.addEventListener("dragover", function (event) {
      const row = event.target.closest(".img2pdf-item");
      if (!row || state.busy) {
        return;
      }
      event.preventDefault();
      clearDropStyles();
      row.classList.add("is-drop-target");
    });

    el.list.addEventListener("dragleave", function (event) {
      const row = event.target.closest(".img2pdf-item");
      if (!row) {
        return;
      }
      row.classList.remove("is-drop-target");
    });

    el.list.addEventListener("drop", function (event) {
      const row = event.target.closest(".img2pdf-item");
      if (!row || state.busy) {
        return;
      }
      event.preventDefault();
      const toIndex = Number(row.dataset.index);
      if (Number.isFinite(state.dragFrom) && Number.isFinite(toIndex)) {
        moveItem(state.dragFrom, toIndex);
      }
      state.dragFrom = null;
      clearDropStyles();
    });

    el.list.addEventListener("dragend", function () {
      state.dragFrom = null;
      clearDropStyles();
      const dragging = el.list.querySelectorAll(".img2pdf-item.is-dragging");
      dragging.forEach(function (node) {
        node.classList.remove("is-dragging");
      });
    });

    window.addEventListener("beforeunload", function () {
      state.items.forEach(revokePreview);
    });
  }

  updateQualityLabel();
  renderList();
  bindEvents();
  setStatus("Waiting for images.", "info");
})();
