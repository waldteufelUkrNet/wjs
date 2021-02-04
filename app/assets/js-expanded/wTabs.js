"use strict";

////////////////////////////////////////////////////////////////////////////////
/* ↓↓↓ переключення вкладок ↓↓↓ */
  document.addEventListener('click', wSwitchTab);

  /**
   * [wSwitchTab переключає вкладки]
   * @param {[object]} event [об'єкт події]
   */
  function wSwitchTab(event) {
    if ( !event.target.classList.contains('wjs-tab__header') ||
          event.target.classList.contains('wjs-tab__header_active') ) return;

    let tab         = event.target.closest('.wjs-tab__header'),
        dataAttr    = tab.dataset.tab,
        grandParent = tab.closest('.wjs-tab');

    let currentBodyItems = grandParent.querySelector('.wjs-tab__bodies-wrapper').children;
    for (let i = 0; i < currentBodyItems.length; i++) {
      currentBodyItems[i].classList.remove('wjs-tab__body_active');
    }
    grandParent.children[0].querySelector('.wjs-tab__header_active')
               .classList.remove('wjs-tab__header_active');

    event.target.classList.add('wjs-tab__header_active');
    grandParent.querySelector('.wjs-tab__body[data-tab="' + dataAttr + '"]')
               .classList.add('wjs-tab__body_active');
  }
/* ↑↑↑ /переключення вкладок ↑↑↑ */
////////////////////////////////////////////////////////////////////////////////