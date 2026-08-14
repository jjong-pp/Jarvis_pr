document.querySelectorAll('[data-copy]').forEach((button) => {
  button.addEventListener('click', async () => {
    const target = document.getElementById(button.dataset.copy);
    if (!target) return;
    try {
      await navigator.clipboard.writeText(target.value || target.textContent || '');
      button.textContent = '복사됨';
    } catch (error) {
      if (typeof target.select === 'function') target.select();
      button.textContent = '내용을 선택했습니다';
    }
  });
});
