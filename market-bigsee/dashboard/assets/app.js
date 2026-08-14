(() => {
  const sections = [...document.querySelectorAll('details.section')];
  const expand = document.querySelector('[data-expand-all]');
  const collapse = document.querySelector('[data-collapse-all]');

  expand?.addEventListener('click', () => sections.forEach(section => { section.open = true; }));
  collapse?.addEventListener('click', () => sections.forEach(section => { section.open = false; }));

  document.querySelectorAll('a[target="_blank"]').forEach(link => {
    if (!/^https?:/i.test(link.getAttribute('href') || '')) {
      link.removeAttribute('target');
      link.removeAttribute('rel');
    }
  });
})();

