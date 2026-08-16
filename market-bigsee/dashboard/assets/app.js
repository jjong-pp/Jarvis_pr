(() => {
  const body = document.body;
  const toggle = document.querySelector('[data-nav-toggle]');
  const closeTarget = document.querySelector('[data-nav-close]');

  const setNavigation = open => {
    body.classList.toggle('nav-open', open);
    toggle?.setAttribute('aria-expanded', String(open));
  };

  toggle?.addEventListener('click', () => {
    setNavigation(!body.classList.contains('nav-open'));
  });
  closeTarget?.addEventListener('click', () => setNavigation(false));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') setNavigation(false);
  });
  document.querySelectorAll('.primary-nav a').forEach(link => {
    link.addEventListener('click', () => setNavigation(false));
  });

  document.querySelectorAll('a[target="_blank"]').forEach(link => {
    if (!/^https?:/i.test(link.getAttribute('href') || '')) {
      link.removeAttribute('target');
      link.removeAttribute('rel');
    }
  });

  document.querySelectorAll('[data-freshness]').forEach(element => {
    const value = element.dataset.freshness || '';
    const updated = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : null;
    if (!updated || Number.isNaN(updated.getTime())) {
      element.classList.add('freshness--stale');
      element.textContent = '갱신일 미확인';
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const age = Math.max(0, Math.floor((today - updated) / 86400000));
    if (age === 0) {
      element.classList.add('freshness--fresh');
      element.textContent = '오늘 갱신';
    } else if (age <= 7) {
      element.classList.add('freshness--fresh');
      element.textContent = `${age}일 전 갱신`;
    } else if (age <= 10) {
      element.classList.add('freshness--due');
      element.textContent = `${age}일 전 갱신`;
    } else {
      element.classList.add('freshness--stale');
      element.textContent = `${age}일 전 · 미갱신`;
    }
  });

  const catalog = Array.isArray(window.BIGSEE_CATALOG) ? window.BIGSEE_CATALOG : [];
  const normalize = value => String(value || '').toLocaleLowerCase('ko-KR').replace(/\s+/g, ' ').trim();
  const statusClass = status => {
    if (/주의|위험|차단|지연/.test(status)) return 'risk';
    if (/완료|채택|종료/.test(status)) return 'done';
    if (/대기|보류|미시작|미측정|미정/.test(status)) return 'wait';
    if (/대체|수정|보관/.test(status)) return 'archived';
    return 'active';
  };

  const createMeta = (label, value) => {
    const item = document.createElement('span');
    const title = document.createElement('small');
    const content = document.createElement('strong');
    title.textContent = label;
    content.textContent = value || '미확인';
    item.append(title, content);
    return item;
  };

  document.querySelectorAll('[data-record-browser]').forEach(browser => {
    const queryInput = browser.querySelector('[data-record-query]');
    const typeSelect = browser.querySelector('[data-record-type]');
    const statusSelect = browser.querySelector('[data-record-status]');
    const roleControl = browser.querySelector('[data-record-role-filter]');
    const resultTarget = browser.querySelector('[data-record-results]');
    const countTarget = browser.querySelector('[data-record-count]');
    const moreButton = browser.querySelector('[data-record-more]');
    const fixedRole = browser.dataset.recordRole || '';
    const basePath = browser.dataset.recordBase || '';
    let visibleCount = 20;
    let filtered = [];

    if (fixedRole && roleControl) roleControl.value = fixedRole;

    const render = () => {
      const query = normalize(queryInput?.value);
      const type = typeSelect?.value || '';
      const statusQuery = statusSelect?.value || '';
      const role = roleControl?.value || fixedRole;
      filtered = catalog.filter(record => {
        if (type && record.type !== type) return false;
        if (role && record.role !== role) return false;
        if (statusQuery && !String(record.status || '').includes(statusQuery)) return false;
        if (query && !normalize(record.searchText).includes(query)) return false;
        return true;
      });

      resultTarget.replaceChildren();
      if (!catalog.length) {
        const empty = document.createElement('p');
        empty.className = 'empty-state';
        empty.textContent = '자료 카탈로그를 불러오지 못했습니다. 대시보드를 다시 생성해 주세요.';
        resultTarget.append(empty);
        countTarget.textContent = '자료 없음';
        moreButton.hidden = true;
        return;
      }
      if (!filtered.length) {
        const empty = document.createElement('p');
        empty.className = 'empty-state';
        empty.textContent = '조건에 맞는 자료가 없습니다.';
        resultTarget.append(empty);
        countTarget.textContent = '검색 결과 0건';
        moreButton.hidden = true;
        return;
      }

      filtered.slice(0, visibleCount).forEach(record => {
        const article = document.createElement('article');
        article.className = 'record-card';

        const heading = document.createElement('div');
        heading.className = 'record-card__heading';
        const labels = document.createElement('div');
        labels.className = 'record-card__labels';
        const typeLabel = document.createElement('span');
        typeLabel.className = 'record-type';
        typeLabel.textContent = record.typeLabel;
        const status = document.createElement('span');
        status.className = `status status--${statusClass(record.status)}`;
        status.textContent = record.status || '기록';
        labels.append(typeLabel, status);

        const title = document.createElement('h3');
        const link = document.createElement('a');
        link.href = basePath + record.href;
        link.textContent = record.title;
        title.append(link);
        heading.append(labels, title);

        const summary = document.createElement('p');
        summary.textContent = record.summary || '요약 미등록';
        const meta = document.createElement('div');
        meta.className = 'record-card__meta';
        meta.append(
          createMeta('ID', record.id),
          createMeta('담당', record.roleLabel),
          createMeta('기준일', record.date),
          createMeta('목표일', record.due),
          createMeta('자료 위치', record.source)
        );
        article.append(heading, summary, meta);
        resultTarget.append(article);
      });

      countTarget.textContent = `검색 결과 ${filtered.length}건 · ${Math.min(filtered.length, visibleCount)}건 표시`;
      moreButton.hidden = visibleCount >= filtered.length;
    };

    const resetAndRender = () => {
      visibleCount = 20;
      render();
    };
    queryInput?.addEventListener('input', resetAndRender);
    typeSelect?.addEventListener('change', resetAndRender);
    statusSelect?.addEventListener('change', resetAndRender);
    roleControl?.addEventListener('change', resetAndRender);
    moreButton?.addEventListener('click', () => {
      visibleCount += 20;
      render();
    });
    render();
  });
})();
