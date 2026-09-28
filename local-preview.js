(function () {
  if (window.location.protocol !== 'file:') return;

  document.addEventListener('click', function (event) {
    var link = event.target.closest && event.target.closest('a[href]');
    if (!link) return;

    var raw = link.getAttribute('href');
    if (!raw) return;

    // Leave anchors, mail/tel links, JS, absolute web links, and explicit files alone.
    if (/^(#|mailto:|tel:|javascript:|https?:\/\/)/i.test(raw)) return;

    var clean = raw.split('#')[0].split('?')[0];

    // Clean directory routes end in "/" (../community/, ../, etc.).
    // Under file:// Chrome opens the directory listing instead of index.html.
    if (!clean.endsWith('/')) return;

    event.preventDefault();

    var suffix = raw.slice(clean.length); // preserve query/hash if present
    window.location.href = clean + 'index.html' + suffix;
  });
})();