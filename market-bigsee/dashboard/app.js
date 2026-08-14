(() => {
  const copyButtons = document.querySelectorAll('[data-copy]');
  copyButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      const target = document.getElementById(button.dataset.copy);
      if (!target) return;
      try {
        await navigator.clipboard.writeText(target.value || target.textContent || '');
        const original = button.textContent;
        button.textContent = '복사됨';
        setTimeout(() => { button.textContent = original; }, 1400);
      } catch {
        if (typeof target.select === 'function') target.select();
      }
    });
  });

  const collapseButton = document.querySelector('[data-collapse-all]');
  if (collapseButton) {
    collapseButton.addEventListener('click', () => {
      document.querySelectorAll('details[open]').forEach((detail) => {
        detail.open = false;
      });
      document.querySelector('#main')?.scrollIntoView({ block: 'start' });
    });
  }
})();
