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

      let startClientY          = event.clientY;
      let thumbStartAbsPosition = parseFloat( getComputedStyle(thumb).top );
      let thumbTopFixPosition   = thumb.getBoundingClientRect().top;
      let maxThumbScroll        = line.clientHeight - thumb.clientHeight;
      let maxContentScroll      = content.clientHeight - container.clientHeight;
      // let contentPosition       = parseFloat( getComputedStyle(content).top );

      function onMouseMove(event) {
        let shift = event.clientY - startClientY;

        let thumbCurrentAbsPosition = thumbStartAbsPosition + shift;
        if (thumbCurrentAbsPosition < 0) {
          thumbCurrentAbsPosition = 0;
        }
        if ( thumbCurrentAbsPosition > maxThumbScroll) {
          thumbCurrentAbsPosition = maxThumbScroll;
        }

        let currentContentScroll = -maxContentScroll * thumbCurrentAbsPosition / maxThumbScroll;
        content.style.top = currentContentScroll + 'px';

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
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    }

    function gorizontalThumbScroll(event) {
      let thumb = elem.querySelector('.wjs-scroll__thumb_bottom')
               || elem.querySelector('.wjs-scroll__thumb_top');
      let line = elem.querySelector('.wjs-scroll__line_bottom')
              || elem.querySelector('.wjs-scroll__line_top');

      let startClientX          = event.clientX;
      let thumbStartAbsPosition = parseFloat( getComputedStyle(thumb).left );
      let thumbLeftFixPosition  = thumb.getBoundingClientRect().left;
      let maxThumbScroll        = line.clientWidth - thumb.clientWidth;
      let maxContentScroll      = content.clientWidth - container.clientWidth;
      let contentPosition       = parseFloat( getComputedStyle(content).left );

      function onMouseMove(event) {
        let shift = event.clientX - startClientX;

        let thumbCurrentAbsPosition = thumbStartAbsPosition + shift;
        if (thumbCurrentAbsPosition < 0) {
          thumbCurrentAbsPosition = 0;
        }
        if ( thumbCurrentAbsPosition > maxThumbScroll) {
          thumbCurrentAbsPosition = maxThumbScroll;
        }

        let currentContentScroll = -maxContentScroll * thumbCurrentAbsPosition / maxThumbScroll;
        content.style.left = currentContentScroll + 'px';

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