"use strict";

////////////////////////////////////////////////////////////////////////////////
/* ↓↓↓ скрол ↓↓↓ */
let container = document.querySelector('.wjs-scroll');
setScroll(container, {top:true,left:true});
/* ↑↑↑ /скрол ↑↑↑ */
///////////////////////////////////////////////////////////////////////////////

/**
 * [wFoo descryption]
 * @param {[type]} arg [descryption]
 */
function setScroll(elem, params = {}) {
  let container = elem,
      content   = elem.querySelector('.wjs-scroll__content');

  /* ↓↓↓ ПІДГОТОВКА ↓↓↓ */
    // корекція розміру контенту: його внутрішній рзмір має бути таким, як і
    // сам контейнер, а скрол повинен бути прихований за межами контейнеру.
    let scrollLineHeight = content.offsetHeight - content.clientHeight,
        scrollLineWidth  = content.offsetWidth - content.clientWidth;

    content.style.height = container.clientHeight + scrollLineHeight + 'px';
    content.style.width  = container.clientWidth + scrollLineWidth + 'px';
  /* ↑↑↑ /ПІДГОТОВКА ↑↑↑ */

  /* ↓↓↓ ДОДАВАННЯ ПОЛОС ПРОКРУТКИ ↓↓↓ */
    let lineT, lineB, thumbT, thumbB,
        lineR, lineL, thumbR, thumbL;

    let settingsString = elem.dataset.scroll || '';

    // додавання полос прокрутки по горизонталі
    if ( content.scrollWidth > content.clientWidth ) {

      if ( params.top || settingsString.match(/top/i) ) {
        wAddScrollLine('top');
        lineT  = elem.querySelector('.wjs-scroll__line_top');
        thumbT = elem.querySelector('.wjs-scroll__thumb_top');

        thumbT.style.width = lineT.clientWidth*content.clientWidth/content.scrollWidth + 'px';
      }

      if ( params.bottom
        || settingsString.match(/bottom/i)
        || (!params.bottom
          && !params.top
          && !settingsString.match(/bottom/i)
          && !settingsString.match(/top/i)) ) {
        wAddScrollLine('bottom');
        lineB  = elem.querySelector('.wjs-scroll__line_bottom');
        thumbB = elem.querySelector('.wjs-scroll__thumb_bottom');

        thumbB.style.width = lineB.clientWidth*content.clientWidth/content.scrollWidth + 'px';
      }
    }

    // додавання полос прокрутки по вертикалі
    if ( content.scrollHeight > content.clientHeight ) {

      if ( params.left || settingsString.match(/left/i) ) {
        wAddScrollLine('left');
        lineL  = elem.querySelector('.wjs-scroll__line_left');
        thumbL = elem.querySelector('.wjs-scroll__thumb_left');

        thumbL.style.height = lineL.clientHeight*content.clientHeight/content.scrollHeight + 'px';
      }

      if ( params.right
        || settingsString.match(/right/i)
        || (!params.left
          && !params.right
          && !settingsString.match(/left/i)
          && !settingsString.match(/right/i)) ) {
        wAddScrollLine('right');
        lineR  = elem.querySelector('.wjs-scroll__line_right');
        thumbR = elem.querySelector('.wjs-scroll__thumb_right');

        thumbR.style.height = lineR.clientHeight*content.clientHeight/content.scrollHeight + 'px';
      }
    }
  /* ↑↑↑ ДОДАВАННЯ ПОЛОС ПРОКРУТКИ ↑↑↑ */

  /* ↓↓↓ ПРОКРУТКА КОЛІЩАТКОМ МИШІ ↓↓↓ */
    content.onscroll = function (event) {

      // вертикальний скрол
      let maxContentYScroll = content.scrollHeight - content.clientHeight;
      let maxThumbYScroll = lineR.clientHeight - thumbR.clientHeight
                            || lineL.clientHeight - thumbL.clientHeight;

      let thumbCurrentTop = maxThumbYScroll*content.scrollTop/maxContentYScroll;
      if (thumbR) {
        thumbR.style.top = thumbCurrentTop + 'px';
      }
      if (thumbL) {
        thumbL.style.top = thumbCurrentTop + 'px';
      }

      // горизонтальний скрол
      let maxContentXScroll = content.scrollWidth - content.clientWidth;
      let maxThumbXScroll = lineB.clientWidth - thumbB.clientWidth
                            || lineT.clientWidth- thumbT.clientWidth;

      let thumbCurrentLeft = maxThumbXScroll*content.scrollLeft/maxContentXScroll;
      if (thumbB) {
        thumbB.style.left = thumbCurrentLeft + 'px';
      }
      if (thumbT) {
        thumbT.style.left = thumbCurrentLeft + 'px';
      }
    }
  /* ↑↑↑ /ПРОКРУТКА КОЛІЩАТКОМ МИШІ ↑↑↑ */

  /* ↓↓↓ ПРОКРУТКА ПОВЗУНКОМ ↓↓↓ */

  /* ↑↑↑ /ПРОКРУТКА ПОВЗУНКОМ ↑↑↑ */

  function wAddScrollLine(name) {
    let html = '\
                <div class="wjs-scroll__wrapper wjs-scroll__wrapper_' + name + '">\
                  <div class="wjs-scroll__line wjs-scroll__line_' + name + '">\
                    <div class="wjs-scroll__thumb wjs-scroll__thumb_' + name + '"></div>\
                  </div>\
                </div>\
               ';
    elem.insertAdjacentHTML('afterBegin', html);
  }
}