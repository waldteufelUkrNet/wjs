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
 * формат даних: {top:boolean,bottom:boolean,left:boolean,right:boolean}]
 */
function wSetScroll(elem, params = {}) {
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
        if ( !elem.querySelector('.wjs-scroll__line_top') ) {
          wAddScrollLine('top');
          lineT  = elem.querySelector('.wjs-scroll__line_top');
          thumbT = elem.querySelector('.wjs-scroll__thumb_top');

          thumbT.style.width = lineT.clientWidth*content.clientWidth/content.scrollWidth + 'px';
        }
      }

      if ( params.bottom
        || settingsString.match(/bottom/i)
        || (!params.bottom
          && !params.top
          && !settingsString.match(/bottom/i)
          && !settingsString.match(/top/i) ) ) {
        if ( !elem.querySelector('.wjs-scroll__line_bottom') ) {
          wAddScrollLine('bottom');
          lineB  = elem.querySelector('.wjs-scroll__line_bottom');
          thumbB = elem.querySelector('.wjs-scroll__thumb_bottom');

          thumbB.style.width = lineB.clientWidth*content.clientWidth/content.scrollWidth + 'px';
        }
      }
    }

    // додавання полос прокрутки по вертикалі
    if ( content.scrollHeight > content.clientHeight ) {

      if ( params.left || settingsString.match(/left/i) ) {
        if ( !elem.querySelector('.wjs-scroll__line_left') ) {
          wAddScrollLine('left');
          lineL  = elem.querySelector('.wjs-scroll__line_left');
          thumbL = elem.querySelector('.wjs-scroll__thumb_left');

          thumbL.style.height = lineL.clientHeight*content.clientHeight/content.scrollHeight + 'px';
        }
      }

      if ( params.right
        || settingsString.match(/right/i)
        || (!params.left
          && !params.right
          && !settingsString.match(/left/i)
          && !settingsString.match(/right/i) ) ) {
        if ( !elem.querySelector('.wjs-scroll__line_right') ) {
          wAddScrollLine('right');
          lineR  = elem.querySelector('.wjs-scroll__line_right');
          thumbR = elem.querySelector('.wjs-scroll__thumb_right');

          thumbR.style.height = lineR.clientHeight*content.clientHeight/content.scrollHeight + 'px';
        }
      }
    }
  /* ↑↑↑ ДОДАВАННЯ ПОЛОС ПРОКРУТКИ ↑↑↑ */

  /* ↓↓↓ ПРОКРУТКА КОЛІЩАТКОМ МИШІ ↓↓↓ */
    content.onscroll = function (event) {

      // кожного разу після повторного виклику функції формується нове
      // лексичне оточення, тому ці змінні потрібно постійно перепризначати
      lineL  = elem.querySelector('.wjs-scroll__line_left');
      thumbL = elem.querySelector('.wjs-scroll__thumb_left');
      lineR  = elem.querySelector('.wjs-scroll__line_right');
      thumbR = elem.querySelector('.wjs-scroll__thumb_right');
      lineT  = elem.querySelector('.wjs-scroll__line_top');
      thumbT = elem.querySelector('.wjs-scroll__thumb_top');
      lineB  = elem.querySelector('.wjs-scroll__line_bottom');
      thumbB = elem.querySelector('.wjs-scroll__thumb_bottom');

      // вертикальний скрол
      let maxContentYScroll = content.scrollHeight - content.clientHeight;
      let maxThumbYScroll;

      if (lineL) {
        maxThumbYScroll = lineL.clientHeight - thumbL.clientHeight;
      } else {
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
      } else {
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
    if ( elem.querySelector('.wjs-scroll__thumb_right') ) {
      elem.querySelector('.wjs-scroll__thumb_right').addEventListener('mousedown', verticalThumbScroll);
      elem.querySelector('.wjs-scroll__thumb_right').ondragstart = function() {return false;};
    }
    if ( elem.querySelector('.wjs-scroll__thumb_left') ) {
      elem.querySelector('.wjs-scroll__thumb_left').addEventListener('mousedown', verticalThumbScroll);
      elem.querySelector('.wjs-scroll__thumb_left').ondragstart = function() {return false;};
    }
    if ( elem.querySelector('.wjs-scroll__thumb_top') ) {
      elem.querySelector('.wjs-scroll__thumb_top').addEventListener('mousedown', gorizontalThumbScroll);
      elem.querySelector('.wjs-scroll__thumb_top').ondragstart = function() {return false;};
    }
    if ( elem.querySelector('.wjs-scroll__thumb_bottom') ) {
      elem.querySelector('.wjs-scroll__thumb_bottom').addEventListener('mousedown', gorizontalThumbScroll);
      elem.querySelector('.wjs-scroll__thumb_bottom').ondragstart = function() {return false;};
    }

    function verticalThumbScroll(event) {
      let thumb = elem.querySelector('.wjs-scroll__thumb_right')
               || elem.querySelector('.wjs-scroll__thumb_left');
      let line = elem.querySelector('.wjs-scroll__line_right')
              || elem.querySelector('.wjs-scroll__line_left');

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

        if ( elem.querySelector('.wjs-scroll__thumb_right') ) {
          elem.querySelector('.wjs-scroll__thumb_right').style.top = thumbCurrentAbsPosition + 'px';
        }
        if ( elem.querySelector('.wjs-scroll__thumb_left') ) {
          elem.querySelector('.wjs-scroll__thumb_left').style.top = thumbCurrentAbsPosition + 'px';
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
      let thumb = elem.querySelector('.wjs-scroll__thumb_bottom')
               || elem.querySelector('.wjs-scroll__thumb_top');
      let line = elem.querySelector('.wjs-scroll__line_bottom')
              || elem.querySelector('.wjs-scroll__line_top');

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


        if ( elem.querySelector('.wjs-scroll__thumb_bottom') ) {
          elem.querySelector('.wjs-scroll__thumb_bottom').style.left = thumbCurrentAbsPosition + 'px';
        }
        if ( elem.querySelector('.wjs-scroll__thumb_top') ) {
          elem.querySelector('.wjs-scroll__thumb_top').style.left = thumbCurrentAbsPosition + 'px';
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
    elem.insertAdjacentHTML('afterBegin', html);
  }
}
/* ↑↑↑ functions declaration ↑↑↑ */
////////////////////////////////////////////////////////////////////////////////