/* دانش بوک — ابزارهای مشترک رابط پنل ادمین: آپلود تصویر، گالری، کتابخانه تصاویر، ویرایشگر متن، تب‌ها */

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

function loadImageElement(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("فایل انتخاب‌شده یک تصویر معتبر نیست.")); };
    img.src = url;
  });
}

function canvasToBlob(canvas, type, quality) {
  return new Promise(resolve => canvas.toBlob(resolve, type, quality));
}

/* تصویر قبل از آپلود در مرورگر کوچک و فشرده می‌شود تا سایت سریع بماند */
async function resizeImageFile(file, { maxWidth = 1600, maxHeight = 1600, quality = 0.85 } = {}) {
  if (file.type === "image/gif") return file; // حفظ انیمیشن
  const img = await loadImageElement(file);
  const scale = Math.min(1, maxWidth / img.naturalWidth, maxHeight / img.naturalHeight);
  if (scale === 1 && file.size <= 900 * 1024 && file.type !== "image/png") return file;

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
  const ctx = canvas.getContext("2d");
  const keepAlpha = file.type === "image/png" || file.type === "image/webp";
  if (!keepAlpha) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  let blob = await canvasToBlob(canvas, keepAlpha ? "image/webp" : "image/jpeg", quality);
  // مرورگرهایی که WebP نمی‌سازند، PNG برمی‌گردانند
  if (!blob) blob = await canvasToBlob(canvas, keepAlpha ? "image/png" : "image/jpeg", quality);
  return blob && blob.size < file.size ? blob : file;
}

async function uploadImage(file, resizeOptions) {
  if (!file) throw new Error("فایلی انتخاب نشده است.");
  if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type)) {
    throw new Error("فقط تصاویر JPG، PNG، WebP و GIF قابل آپلود هستند.");
  }
  const blob = await resizeImageFile(file, resizeOptions);
  if (blob.size > MAX_UPLOAD_BYTES) throw new Error("حجم تصویر نباید بیشتر از ۸ مگابایت باشد.");

  const ext = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" }[blob.type] || "jpg";
  const form = new FormData();
  form.append("file", blob, "image." + ext);

  const res = await fetch(API_BASE + "/uploads", {
    method: "POST",
    headers: { Authorization: "Bearer " + getAdminToken() },
    body: form
  });
  let data = null;
  try { data = await res.json(); } catch (e) { /* بدون بدنه */ }
  if (res.status === 401) {
    clearAdminSession();
    window.location.href = "login.html";
  }
  if (!res.ok) throw new Error((data && data.error) || (res.status === 413 ? "حجم فایل بیش از حد مجاز سرور است." : "آپلود تصویر انجام نشد."));
  return data.url;
}

/* ===== کتابخانه تصاویر آپلودشده (انتخاب تصویر قبلی) ===== */
function openMediaLibrary({ multiple = false } = {}) {
  return new Promise(resolve => {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay open media-picker";
    overlay.innerHTML = `
      <div class="modal-box modal-wide">
        <div class="modal-head">
          <h2>🖼 انتخاب از تصاویر آپلودشده</h2>
          <button type="button" class="icon-btn" data-act="close" aria-label="بستن">✕</button>
        </div>
        <div class="media-grid"><div class="muted">در حال بارگذاری...</div></div>
        <div class="modal-actions">
          <label class="btn btn-outline">📤 آپلود تصویر جدید<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" ${multiple ? "multiple" : ""} hidden></label>
          ${multiple ? `<button type="button" class="btn btn-primary" data-act="confirm">افزودن تصاویر انتخاب‌شده</button>` : ""}
          <button type="button" class="btn btn-outline" data-act="close">انصراف</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    const grid = overlay.querySelector(".media-grid");
    const selected = new Set();

    function finish(result) {
      overlay.remove();
      resolve(result);
    }

    async function load() {
      try {
        const files = await adminApi("/uploads");
        grid.innerHTML = files.length
          ? files.map(f => `<button type="button" class="media-item" data-url="${esc(f.url)}"><img src="${esc(f.url)}" alt="" loading="lazy"></button>`).join("")
          : `<div class="muted">هنوز تصویری آپلود نشده است.</div>`;
        grid.querySelectorAll(".media-item").forEach(btn => btn.addEventListener("click", () => {
          if (!multiple) return finish(btn.dataset.url);
          btn.classList.toggle("selected");
          if (selected.has(btn.dataset.url)) selected.delete(btn.dataset.url); else selected.add(btn.dataset.url);
        }));
      } catch (e) {
        grid.innerHTML = `<div class="muted">${esc(e.message)}</div>`;
      }
    }

    overlay.querySelectorAll('[data-act="close"]').forEach(b => b.addEventListener("click", () => finish(multiple ? [] : null)));
    overlay.addEventListener("click", (e) => { if (e.target === overlay) finish(multiple ? [] : null); });
    const confirmBtn = overlay.querySelector('[data-act="confirm"]');
    if (confirmBtn) confirmBtn.addEventListener("click", () => finish(Array.from(selected)));
    overlay.querySelector('input[type="file"]').addEventListener("change", async (e) => {
      const files = Array.from(e.target.files);
      if (!files.length) return;
      try {
        showAdminToast("در حال آپلود...");
        const urls = [];
        for (const f of files) urls.push(await uploadImage(f));
        showAdminToast("تصویر آپلود شد ✓");
        finish(multiple ? urls : urls[0]);
      } catch (err) {
        showAdminToast(err.message, true);
      }
    });
    load();
  });
}

/*
 * فیلد تصویر: پیش‌نمایش، آپلود (یا کشیدن و رها کردن فایل)، انتخاب از تصاویر قبلی، حذف و آدرس دستی.
 * createImageField(element, { value, hint, resize, onChange }) → { get(), set(url) }
 */
function createImageField(el, opts = {}) {
  let value = opts.value || "";
  el.classList.add("image-field");
  el.innerHTML = `
    <div class="image-field-preview" tabindex="0" title="برای آپلود کلیک کنید یا تصویر را اینجا رها کنید"></div>
    <div class="image-field-side">
      <div class="image-field-actions">
        <label class="btn btn-outline btn-sm">📤 آپلود<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden></label>
        <button type="button" class="btn btn-outline btn-sm" data-act="library">🖼 تصاویر قبلی</button>
        <button type="button" class="btn btn-danger btn-sm" data-act="remove">حذف</button>
      </div>
      ${opts.hint ? `<small class="field-hint">${esc(opts.hint)}</small>` : ""}
      <details class="image-field-manual">
        <summary>وارد کردن آدرس تصویر</summary>
        <input type="text" dir="ltr" placeholder="https://example.com/image.jpg">
      </details>
    </div>`;

  const preview = el.querySelector(".image-field-preview");
  const fileInput = el.querySelector('input[type="file"]');
  const manual = el.querySelector(".image-field-manual input");
  const removeBtn = el.querySelector('[data-act="remove"]');

  function render() {
    const src = safeImageUrl(value);
    preview.innerHTML = src
      ? `<img src="${esc(src)}" alt="">`
      : `<span class="image-field-empty">🖼<br>بدون تصویر<br><small>کلیک یا رها کردن فایل</small></span>`;
    removeBtn.disabled = !value;
    manual.value = value;
  }

  function set(url) {
    value = url || "";
    render();
    if (opts.onChange) opts.onChange(value);
  }

  async function handleFile(file) {
    if (!file) return;
    preview.classList.add("loading");
    try {
      set(await uploadImage(file, opts.resize));
      showAdminToast("تصویر آپلود شد ✓");
    } catch (e) {
      showAdminToast(e.message, true);
    } finally {
      preview.classList.remove("loading");
      fileInput.value = "";
    }
  }

  preview.addEventListener("click", () => fileInput.click());
  preview.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInput.click(); } });
  fileInput.addEventListener("change", () => handleFile(fileInput.files[0]));
  preview.addEventListener("dragover", (e) => { e.preventDefault(); preview.classList.add("dragging"); });
  preview.addEventListener("dragleave", () => preview.classList.remove("dragging"));
  preview.addEventListener("drop", (e) => {
    e.preventDefault();
    preview.classList.remove("dragging");
    handleFile(e.dataTransfer.files[0]);
  });
  el.querySelector('[data-act="library"]').addEventListener("click", async () => {
    const url = await openMediaLibrary();
    if (url) set(url);
  });
  removeBtn.addEventListener("click", () => set(""));
  manual.addEventListener("change", () => {
    const v = manual.value.trim();
    if (v && !safeImageUrl(v)) {
      showAdminToast("آدرس تصویر باید با https:// یا /uploads/ شروع شود.", true);
      manual.value = value;
      return;
    }
    set(v);
  });

  render();
  return { get: () => value, set };
}

/*
 * گالری چند تصویری با امکان ترتیب‌دادن.
 * createGalleryField(element, { value: [], max }) → { get(), set(list) }
 */
function createGalleryField(el, opts = {}) {
  let list = Array.isArray(opts.value) ? opts.value.slice() : [];
  const max = opts.max || 8;
  el.classList.add("gallery-field");

  function render() {
    el.innerHTML = `
      <div class="gallery-items">
        ${list.map((url, i) => `
          <div class="gallery-item">
            <img src="${esc(safeImageUrl(url))}" alt="">
            <div class="gallery-item-tools">
              <button type="button" class="icon-btn" data-move="${i}" data-dir="-1" title="جابه‌جایی به راست" ${i === 0 ? "disabled" : ""}>→</button>
              <button type="button" class="icon-btn" data-remove="${i}" title="حذف">🗑️</button>
              <button type="button" class="icon-btn" data-move="${i}" data-dir="1" title="جابه‌جایی به چپ" ${i === list.length - 1 ? "disabled" : ""}>←</button>
            </div>
          </div>`).join("")}
        ${list.length < max ? `
          <label class="gallery-add" title="افزودن تصویر">
            <span>➕<br>افزودن تصویر</span>
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple hidden>
          </label>` : ""}
      </div>
      ${list.length < max ? `<button type="button" class="btn btn-outline btn-sm" data-act="library">🖼 افزودن از تصاویر قبلی</button>` : ""}
      <small class="field-hint">حداکثر ${max} تصویر؛ اولین تصویر بعد از عکس اصلی نمایش داده می‌شود.</small>`;

    el.querySelectorAll("[data-remove]").forEach(b => b.addEventListener("click", () => {
      list.splice(Number(b.dataset.remove), 1);
      render();
    }));
    el.querySelectorAll("[data-move]").forEach(b => b.addEventListener("click", () => {
      const i = Number(b.dataset.move);
      const j = i + Number(b.dataset.dir);
      if (j < 0 || j >= list.length) return;
      [list[i], list[j]] = [list[j], list[i]];
      render();
    }));
    const input = el.querySelector('input[type="file"]');
    if (input) input.addEventListener("change", async () => {
      const files = Array.from(input.files).slice(0, max - list.length);
      for (const f of files) {
        try {
          list.push(await uploadImage(f, opts.resize));
          render();
        } catch (e) {
          showAdminToast(e.message, true);
        }
      }
      if (files.length) showAdminToast("تصاویر آپلود شدند ✓");
    });
    const libBtn = el.querySelector('[data-act="library"]');
    if (libBtn) libBtn.addEventListener("click", async () => {
      const urls = await openMediaLibrary({ multiple: true });
      list = list.concat(urls).slice(0, max);
      render();
    });
  }

  render();
  return { get: () => list.slice(), set: (v) => { list = Array.isArray(v) ? v.slice() : []; render(); } };
}

/* ===== ویرایشگر ساده متن (با نوار ابزار و پیش‌نمایش) ===== */
const RICH_TEXT_HELP = `
  <b>راهنمای قالب‌بندی:</b>
  <code>## تیتر</code>، <code>### زیرتیتر</code>، <code>- آیتم لیست</code>، <code>1. لیست شماره‌دار</code>، <code>**پررنگ**</code>،
  <code>[متن لینک](shop.html)</code>، <code>![توضیح](آدرس تصویر)</code>، <code>---</code> خط جداکننده،
  <code>[[card:📚|عنوان|توضیح]]</code> کارت، <code>[[faq:سوال|پاسخ]]</code> پرسش و پاسخ، <code>[[button:متن|shop.html]]</code> دکمه.`;

function createRichEditor(textarea) {
  const wrap = document.createElement("div");
  wrap.className = "rich-editor";
  textarea.parentNode.insertBefore(wrap, textarea);
  wrap.innerHTML = `
    <div class="rich-toolbar">
      <button type="button" data-ins="h2" title="تیتر">تیتر</button>
      <button type="button" data-ins="h3" title="زیرتیتر">زیرتیتر</button>
      <button type="button" data-ins="bold" title="پررنگ"><b>B</b></button>
      <button type="button" data-ins="list" title="لیست">• لیست</button>
      <button type="button" data-ins="link" title="لینک">🔗 لینک</button>
      <button type="button" data-ins="image" title="تصویر">🖼 تصویر</button>
      <button type="button" data-ins="card" title="کارت">🗂 کارت</button>
      <button type="button" data-ins="faq" title="پرسش و پاسخ">❓ سوال</button>
      <button type="button" data-ins="button" title="دکمه">🔘 دکمه</button>
      <button type="button" data-ins="hr" title="خط جداکننده">―</button>
      <button type="button" class="preview-toggle" data-act="preview">👁 پیش‌نمایش</button>
    </div>`;
  wrap.appendChild(textarea);
  const previewBox = document.createElement("div");
  previewBox.className = "rich-preview rich-text";
  previewBox.hidden = true;
  wrap.appendChild(previewBox);
  const help = document.createElement("small");
  help.className = "field-hint";
  help.innerHTML = RICH_TEXT_HELP;
  wrap.appendChild(help);

  function insert(before, after = "", placeholder = "") {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.slice(start, end) || placeholder;
    const needsNewline = /^(\n|##|###|- |---|\[\[|!\[)/.test(before) && start > 0 && textarea.value[start - 1] !== "\n";
    const text = (needsNewline ? "\n" : "") + before + selected + after;
    textarea.setRangeText(text, start, end, "end");
    textarea.focus();
    textarea.dispatchEvent(new Event("input"));
  }

  const actions = {
    h2: () => insert("## ", "", "تیتر"),
    h3: () => insert("### ", "", "زیرتیتر"),
    bold: () => insert("**", "**", "متن پررنگ"),
    list: () => insert("- ", "", "آیتم لیست"),
    link: () => insert("[", "](shop.html)", "متن لینک"),
    card: () => insert("[[card:📚|", "|توضیح کوتاه]]", "عنوان کارت"),
    faq: () => insert("[[faq:", "|پاسخ سوال]]", "سوال"),
    button: () => insert("[[button:", "|shop.html]]", "متن دکمه"),
    hr: () => insert("---\n"),
    image: async () => {
      const url = await openMediaLibrary();
      if (url) insert(`![`, `](${url})\n`, "توضیح تصویر");
    }
  };

  wrap.querySelectorAll("[data-ins]").forEach(b => b.addEventListener("click", () => actions[b.dataset.ins]()));
  wrap.querySelector('[data-act="preview"]').addEventListener("click", (e) => {
    const showing = !previewBox.hidden;
    previewBox.hidden = showing;
    textarea.hidden = !showing;
    e.target.classList.toggle("active", !showing);
    if (!showing) previewBox.innerHTML = renderRichText(textarea.value) || `<p class="muted">متنی وارد نشده است.</p>`;
  });

  return {
    reset() {
      previewBox.hidden = true;
      textarea.hidden = false;
      wrap.querySelector('[data-act="preview"]').classList.remove("active");
    }
  };
}

/* ===== تب‌ها ===== */
function initTabs(root, onChange) {
  const buttons = root.querySelectorAll("[data-tab]");
  const panels = root.querySelectorAll("[data-panel]");
  function show(name) {
    buttons.forEach(b => b.classList.toggle("active", b.dataset.tab === name));
    panels.forEach(p => { p.hidden = p.dataset.panel !== name; });
    try { history.replaceState(null, "", "#" + name); } catch (e) { /* قابل چشم‌پوشی */ }
    if (onChange) onChange(name);
  }
  buttons.forEach(b => b.addEventListener("click", () => show(b.dataset.tab)));
  const fromHash = location.hash.slice(1);
  show(Array.from(buttons).some(b => b.dataset.tab === fromHash) ? fromHash : buttons[0].dataset.tab);
  return { show };
}

/* جابه‌جایی یک عنصر در آرایه (برای دکمه‌های بالا/پایین) */
function moveItem(list, index, dir) {
  const j = index + dir;
  if (j < 0 || j >= list.length) return false;
  [list[index], list[j]] = [list[j], list[index]];
  return true;
}

/* مدال‌ها با کلید Escape و کلیک بیرون بسته می‌شوند */
function setupModal(modal, onClose) {
  const close = () => { modal.classList.remove("open"); if (onClose) onClose(); };
  modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && modal.classList.contains("open")) close(); });
  return {
    open() {
      modal.classList.add("open");
      const box = modal.querySelector(".modal-box");
      if (box) box.scrollTop = 0;
    },
    close
  };
}
