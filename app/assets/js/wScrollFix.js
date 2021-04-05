"use strict";

////////////////////////////////////////////////////////////////////////////////
/* ↓↓↓ scroll-fix ↓↓↓ */
  // ініціалізація
  window.addEventListener('load', function(){
    if ( !document.querySelector('.wjs-scrollfix') ) return;

    // .wjs-MobileHeightFix - цей клас навішується на html, містить такий код
    // html {
    //   display    : flex;
    //   height     : 100%;
    //   overflow   : hidden;
    // }
    // body {
    //   flex-grow  : 1;
    //   overflow-y : auto;
    //   overflow-x : hidden;
    // }

    if ( document.querySelector('.wjs-MobileHeightFix') ) {
      document.querySelector('body').addEventListener('scroll', wSetScrollFix);
    } else {
      document.addEventListener('scroll', wSetScrollFix);
    }
  });
/* ↑↑↑ scroll-fix ↑↑↑ */
////////////////////////////////////////////////////////////////////////////////
/* ↓↓↓ functions declaration ↓↓↓ */

function wSetScrollFix() {

  if ( !document.querySelector('.wjs-scrollfix') ) return;

  let arrOfScrollFixElements = document.querySelectorAll('.wjs-scrollfix');
  arrOfScrollFixElements.forEach( item => {

    let content       = item.querySelector('.wjs-scrollfix__content'),
        currentTop    = item.getBoundingClientRect().top,
        fixedTop      = item.dataset.scrollfix || 0,
        contentHeight = content.clientHeight;

    item.style.height = contentHeight + 'px';
    content.style.top = '0px';
    content.style.left = '0px';

    if (currentTop <= fixedTop) {
      // fixed
      content.style.position = 'fixed';
      content.style.top = fixedTop + 'px';
      content.style.width = '100%';
    } else {
      // relative
      content.style.position = 'relative';
      content.style.top = '0px';
      content.style.width = 'auto';
    }

  } );
}
/* ↑↑↑ functions declaration ↑↑↑ */
////////////////////////////////////////////////////////////////////////////////