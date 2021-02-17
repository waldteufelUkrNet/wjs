"use strict";

////////////////////////////////////////////////////////////////////////////////
/* ↓↓↓ custom scroll ↓↓↓ */
  // ініціалізація
  document.addEventListener('DOMContentLoaded', function(){

    if ( !document.querySelector('.wjs-scroll') ) return;

    let arrOfScrollableElements = document.querySelectorAll('.wjs-scroll');
    for (let elem of arrOfScrollableElements) {
      wSetScroll(elem);
    }
  });

  // слідкування за змінами в сторінці (елемент може повністю влізти на
  // сторінку або навпаки), відповідно скрол повинен пропасти/з'явитися
  window.addEventListener('resize', function(){
    if ( !document.querySelector('.wjs-scroll') ) return;

    let arrOfScrollableElements = document.querySelectorAll('.wjs-scroll');
    for (let elem of arrOfScrollableElements) {
      wSetScroll(elem);
    }
  });
/* ↑↑↑ custom scroll ↑↑↑ */
////////////////////////////////////////////////////////////////////////////////
/* ↓↓↓ functions declaration ↓↓↓ */
/**
 * [wSetScroll відповідає за кастомну прокрутку:
 * 1. зчитує з атрибутів елемента, які прокрутки потрібно додати,
 * 2. слідкує за прокруткою елемента і поправляє положення повзунків прокрутки
 * 3. слідкує за положенням повзунків прокрутки і поправляє прокрутку елемента]
 * @param {[DOM-object]} elem [елемент DOM з класом .wjs-scroll]
 * @param {[object]} params [набір налаштувань для одиночного запуску функції
 * формат даних: {top:boolean, bottom:boolean, left:boolean, right:boolean,
 * overflowXHidden:boolean, overvlowYHidden:boolean}]
 */
function wSetScroll(elem, params = {}) {

  if (!elem) return;

  if ( !elem.querySelector('.wjs-scroll__content-wrapper')
       || !elem.querySelector('.wjs-scroll__content') ) {
    console.log('markup error: wrong html structure');
    return;
  }

  let container      = elem,
      contentWrapper = elem.querySelector('.wjs-scroll__content-wrapper'),
      content        = elem.querySelector('.wjs-scroll__content');

  /* ↓↓↓ ПІДГОТОВКА ↓↓↓ */

    // заборона прокрутки (якщо потрібно)
    let settingsString2 = container.dataset.scrollHidden || '';
    let overflowXProhibition = settingsString2.match(/horizontal/i)
                               || params.overflowXHidden;
    let overflowYProhibition = settingsString2.match(/vertical/i)
                               || params.overflowYHidden;

    if (overflowXProhibition && overflowYProhibition) {
      content.style.overflow = 'hidden';
      return
    } else if (overflowXProhibition) {
      content.style.overflowX = 'hidden';
    } else if (overflowYProhibition) {
      content.style.overflowY = 'hidden';
    }
    // корекція розміру контенту: його внутрішній рзмір має бути таким, як і
    // сам контейнер, а скрол повинен бути прихований за межами контейнеру.
    let scrollLineHeight = content.offsetHeight - content.clientHeight,
        scrollLineWidth  = content.offsetWidth - content.clientWidth;

    content.style.height = contentWrapper.clientHeight + scrollLineHeight + 'px';
    content.style.width  = contentWrapper.clientWidth + scrollLineWidth + 'px';
  /* ↑↑↑ /ПІДГОТОВКА ↑↑↑ */

  /* ↓↓↓ ДОДАВАННЯ ПОЛОС ПРОКРУТКИ ↓↓↓ */
    let lineT, lineB, thumbT, thumbB,
        lineR, lineL, thumbR, thumbL;

    let settingsString = container.dataset.scroll || '';

    // додавання полос прокрутки по горизонталі
    if ( !overflowXProhibition && (content.scrollWidth > content.clientWidth) ) {

      if ( params.top || settingsString.match(/top/i) ) {
        if ( !container.querySelector('.wjs-scroll__line_top') ) {
          wAddScrollLine('top');
        }
        lineT  = container.querySelector('.wjs-scroll__line_top');
        thumbT = container.querySelector('.wjs-scroll__thumb_top');

        thumbT.style.width = lineT.clientWidth*content.clientWidth/content.scrollWidth + 'px';
      }

      if ( params.bottom
        || settingsString.match(/bottom/i)
        || (!params.bottom
          && !params.top
          && !settingsString.match(/bottom/i)
          && !settingsString.match(/top/i) ) ) {
        if ( !container.querySelector('.wjs-scroll__line_bottom') ) {
          wAddScrollLine('bottom');
        }
        lineB  = container.querySelector('.wjs-scroll__line_bottom');
        thumbB = container.querySelector('.wjs-scroll__thumb_bottom');

        thumbB.style.width = lineB.clientWidth*content.clientWidth/content.scrollWidth + 'px';
      }
    }

    // додавання полос прокрутки по вертикалі
    if ( !overflowYProhibition && (content.scrollHeight > content.clientHeight) ) {

      if ( params.left || settingsString.match(/left/i) ) {
        if ( !container.querySelector('.wjs-scroll__line_left') ) {
          wAddScrollLine('left');
        }
        lineL  = container.querySelector('.wjs-scroll__line_left');
        thumbL = container.querySelector('.wjs-scroll__thumb_left');

        thumbL.style.height = lineL.clientHeight*content.clientHeight/content.scrollHeight + 'px';
      }

      if ( params.right
        || settingsString.match(/right/i)
        || (!params.left
          && !params.right
          && !settingsString.match(/left/i)
          && !settingsString.match(/right/i) ) ) {
        if ( !container.querySelector('.wjs-scroll__line_right') ) {
          wAddScrollLine('right');
        }
        lineR  = container.querySelector('.wjs-scroll__line_right');
        thumbR = container.querySelector('.wjs-scroll__thumb_right');

        thumbR.style.height = lineR.clientHeight*content.clientHeight/content.scrollHeight + 'px';
      }
    }
  /* ↑↑↑ ДОДАВАННЯ ПОЛОС ПРОКРУТКИ ↑↑↑ */

  /* ↓↓↓ ПРОКРУТКА КОЛІЩАТКОМ МИШІ ↓↓↓ */
    content.onscroll = function (event) {

      // кожного разу після повторного виклику функції формується нове
      // лексичне оточення, тому ці змінні потрібно постійно перепризначати
      lineL  = container.querySelector('.wjs-scroll__line_left');
      thumbL = container.querySelector('.wjs-scroll__thumb_left');
      lineR  = container.querySelector('.wjs-scroll__line_right');
      thumbR = container.querySelector('.wjs-scroll__thumb_right');
      lineT  = container.querySelector('.wjs-scroll__line_top');
      thumbT = container.querySelector('.wjs-scroll__thumb_top');
      lineB  = container.querySelector('.wjs-scroll__line_bottom');
      thumbB = container.querySelector('.wjs-scroll__thumb_bottom');

      // вертикальний скрол
      let maxContentYScroll = content.scrollHeight - content.clientHeight;
      let maxThumbYScroll;

      if (lineL) {
        maxThumbYScroll = lineL.clientHeight - thumbL.clientHeight;
      } else if (lineR) {
        maxThumbYScroll = lineR.clientHeight - thumbR.clientHeight;
      }

      let thumbCurrentTop = maxThumbYScroll*content.scrollTop/maxContentYScroll;
      if (thumbR) {
        thumbR.style.top = thumbCurrentTop + 'px';
      }
      if (thumbL) {
        thumbL.style.top = thumbCurrentTop + 'px';
      }

      // горизонтальний скрол
      let maxContentXScroll = content.scrollWidth - content.clientWidth;
      let maxThumbXScroll;

      if (lineT) {
        maxThumbXScroll = lineT.clientWidth- thumbT.clientWidth;
      } else if (lineB) {
        maxThumbXScroll = lineB.clientWidth - thumbB.clientWidth;
      }

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
    // Drag'n'Drop
    if ( container.querySelector('.wjs-scroll__thumb_right') ) {
      container.querySelector('.wjs-scroll__thumb_right').addEventListener('mousedown', verticalThumbScroll);
      container.querySelector('.wjs-scroll__thumb_right').ondragstart = function() {return false;};
    }
    if ( container.querySelector('.wjs-scroll__thumb_left') ) {
      container.querySelector('.wjs-scroll__thumb_left').addEventListener('mousedown', verticalThumbScroll);
      container.querySelector('.wjs-scroll__thumb_left').ondragstart = function() {return false;};
    }
    if ( container.querySelector('.wjs-scroll__thumb_top') ) {
      container.querySelector('.wjs-scroll__thumb_top').addEventListener('mousedown', gorizontalThumbScroll);
      container.querySelector('.wjs-scroll__thumb_top').ondragstart = function() {return false;};
    }
    if ( container.querySelector('.wjs-scroll__thumb_bottom') ) {
      container.querySelector('.wjs-scroll__thumb_bottom').addEventListener('mousedown', gorizontalThumbScroll);
      container.querySelector('.wjs-scroll__thumb_bottom').ondragstart = function() {return false;};
    }

    function verticalThumbScroll(event) {
      let thumb = container.querySelector('.wjs-scroll__thumb_right')
               || container.querySelector('.wjs-scroll__thumb_left');
      let line = container.querySelector('.wjs-scroll__line_right')
              || container.querySelector('.wjs-scroll__line_left');

      event.target.closest('.wjs-scroll__wrapper').classList.add('wjs-scroll__wrapper_active-v');

      let startClientY          = event.clientY;
      let thumbStartAbsPosition = parseFloat( getComputedStyle(thumb).top );
      let thumbTopFixPosition   = thumb.getBoundingClientRect().top;
      let maxThumbScroll        = line.clientHeight - thumb.clientHeight;
      let maxContentScroll      = content.scrollHeight - content.clientHeight;

      function onMouseMove(event) {
        let shift = event.clientY - startClientY;

        let thumbCurrentAbsPosition = thumbStartAbsPosition + shift;
        if (thumbCurrentAbsPosition < 0) {
          thumbCurrentAbsPosition = 0;
        }
        if ( thumbCurrentAbsPosition > maxThumbScroll) {
          thumbCurrentAbsPosition = maxThumbScroll;
        }

        content.scrollTop = parseFloat( getComputedStyle(thumb).top )*maxContentScroll/maxThumbScroll;

        if ( container.querySelector('.wjs-scroll__thumb_right') ) {
          container.querySelector('.wjs-scroll__thumb_right').style.top = thumbCurrentAbsPosition + 'px';
        }
        if ( container.querySelector('.wjs-scroll__thumb_left') ) {
          container.querySelector('.wjs-scroll__thumb_left').style.top = thumbCurrentAbsPosition + 'px';
        }
      }

      function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        thumb.onmouseup = null;
        event.target.closest('.wjs-scroll__wrapper').classList.remove('wjs-scroll__wrapper_active-v');
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    }

    function gorizontalThumbScroll(event) {
      let thumb = container.querySelector('.wjs-scroll__thumb_bottom')
               || container.querySelector('.wjs-scroll__thumb_top');
      let line = container.querySelector('.wjs-scroll__line_bottom')
              || container.querySelector('.wjs-scroll__line_top');

      event.target.closest('.wjs-scroll__wrapper').classList.add('wjs-scroll__wrapper_active-h');

      let startClientX          = event.clientX;
      let thumbStartAbsPosition = parseFloat( getComputedStyle(thumb).left );
      let thumbLeftFixPosition  = thumb.getBoundingClientRect().left;
      let maxThumbScroll        = line.clientWidth - thumb.clientWidth;
      let maxContentScroll      = content.scrollWidth - content.clientWidth;

      function onMouseMove(event) {
        let shift = event.clientX - startClientX;

        let thumbCurrentAbsPosition = thumbStartAbsPosition + shift;
        if (thumbCurrentAbsPosition < 0) {
          thumbCurrentAbsPosition = 0;
        }
        if ( thumbCurrentAbsPosition > maxThumbScroll) {
          thumbCurrentAbsPosition = maxThumbScroll;
        }

        content.scrollLeft = parseFloat( getComputedStyle(thumb).left )*maxContentScroll/maxThumbScroll;


        if ( container.querySelector('.wjs-scroll__thumb_bottom') ) {
          container.querySelector('.wjs-scroll__thumb_bottom').style.left = thumbCurrentAbsPosition + 'px';
        }
        if ( container.querySelector('.wjs-scroll__thumb_top') ) {
          container.querySelector('.wjs-scroll__thumb_top').style.left = thumbCurrentAbsPosition + 'px';
        }
      }

      function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        thumb.onmouseup = null;
        event.target.closest('.wjs-scroll__wrapper').classList.remove('wjs-scroll__wrapper_active-h');
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    }
  /* ↑↑↑ /ПРОКРУТКА ПОВЗУНКОМ ↑↑↑ */

  function wAddScrollLine(name) {
    let html = '\
                <div class="wjs-scroll__wrapper wjs-scroll__wrapper_' + name + '">\
                  <div class="wjs-scroll__line wjs-scroll__line_' + name + '">\
                    <div class="wjs-scroll__thumb wjs-scroll__thumb_' + name + '"></div>\
                  </div>\
                </div>\
               ';
    container.insertAdjacentHTML('afterBegin', html);
  }
}
/* ↑↑↑ functions declaration ↑↑↑ */
////////////////////////////////////////////////////////////////////////////////