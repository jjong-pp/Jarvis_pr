(() => {
  const tags = [...document.querySelectorAll('[data-nav-tag]')];
  const setCurrent = (hash) => {
    tags.forEach((tag) => {
      if (tag.getAttribute('href') === hash) tag.setAttribute('aria-current', 'location');
      else tag.removeAttribute('aria-current');
    });
  };

  tags.forEach((tag) => {
    tag.addEventListener('click', () => {
      const hash = tag.getAttribute('href');
      const target = document.querySelector(hash);
      if (target?.tagName === 'DETAILS') target.open = true;
      setCurrent(hash);
    });
  });

  const initialHash = tags.some((tag) => tag.getAttribute('href') === location.hash) ? location.hash : '#now';
  setCurrent(initialHash);
})();
