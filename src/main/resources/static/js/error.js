(function () {
  'use strict';

  const backBtn = document.getElementById('errorBackBtn');
  backBtn?.addEventListener('click', () => {
    if (history.length > 1) history.back();
    else location.href = '/index.html';
  });
})();
