"use strict";

////////////////////////////////////////////////////////////////////////////////
/* ↓↓↓ скрол ↓↓↓ */
  // document.addEventListener('click', wSwitchTab);
/* ↑↑↑ /скрол ↑↑↑ */
////////////////////////////////////////////////////////////////////////////////

let container = document.querySelector('.wjs-scroll');
setScroll(container,{bottom:true,right:true});

/**
 * [wFoo descryption]
 * @param {[type]} arg [descryption]
 */
function setScroll(elem, params = {}) {
  // console.log("elem", elem);
  // console.log("params", params);

  let container = elem,
      content   = elem.querySelector('.wjs-scroll__content');

  if ( content.clientWidth <= container.clientWidth
    && content.clientHeight <= container.clientHeight ) {
    // контент вміщається в контейнер, прокрутка не потрібна
    return
  }

  let lineT, lineB, thumbT, thumbB,
      lineR, lineL, thumbR, thumbL;

  let settingsString = elem.dataset.scroll;

  if ( content.clientWidth > container.clientWidth ) {

    if ( params.top || settingsString.match(/top/i) ) {
      wAddScrollLine('top');
      lineL  = elem.querySelector('.wjs-scroll__line_top');
      thumbL = elem.querySelector('.wjs-scroll__thumb_top');
    }

    if ( params.bottom || settingsString.match(/bottom/i) ) {
      wAddScrollLine('bottom');
      lineR  = elem.querySelector('.wjs-scroll__line_bottom');
      thumbR = elem.querySelector('.wjs-scroll__thumb_bottom');
    }
  }

  if ( content.clientHeight > container.clientHeight ) {

    if ( params.left || settingsString.match(/left/i) ) {
      wAddScrollLine('left');
      lineL  = elem.querySelector('.wjs-scroll__line_left');
      thumbL = elem.querySelector('.wjs-scroll__thumb_left');
    }

    if ( params.right || settingsString.match(/right/i) ) {
      wAddScrollLine('right');
      lineR  = elem.querySelector('.wjs-scroll__line_right');
      thumbR = elem.querySelector('.wjs-scroll__thumb_right');
    }
  }

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

  /* ↓↓↓ ПРОКРУТКА КОЛІЩАТКОМ МИШІ ↓↓↓ */
    // елемент з overflow:hidden не має onscroll
    container.addEventListener('wheel', function (event) {

      if (event.shiftKey) {
        // горизонтальний скрол
        let scrollStep       = container.clientWidth/10,
            contentPosition  = parseFloat( getComputedStyle(content).left ),
            maxContentScroll = content.clientWidth - container.clientWidth,
            maxThumbScroll;

        let line = elem.querySelector('.wjs-scroll__line_bottom')
                || elem.querySelector('.wjs-scroll__line_top');

        let thumb = elem.querySelector('.wjs-scroll__thumb_bottom')
                 || elem.querySelector('.wjs-scroll__thumb_top');
        maxThumbScroll   = line.clientWidth - thumb.clientWidth;

        // розрахунок прокрутки
        if (event.deltaY > 0) {
          contentPosition -= scrollStep;
        } else {
          contentPosition += scrollStep;
        }

        // контроль меж прокрутки
        if ( contentPosition > 0 ) {
          contentPosition = 0;
        }
        if ( Math.abs(contentPosition) > maxContentScroll ) {
          contentPosition = -maxContentScroll;
        }

        // прокрутка елементів
        content.style.left = contentPosition + 'px';

        if ( elem.querySelector('.wjs-scroll__thumb_bottom') ) {
          elem.querySelector('.wjs-scroll__thumb_bottom').style.left = Math.abs(contentPosition * maxThumbScroll / maxContentScroll) + 'px';
        }
        if ( elem.querySelector('.wjs-scroll__thumb_top') ) {
          elem.querySelector('.wjs-scroll__thumb_top').style.left = Math.abs(contentPosition * maxThumbScroll / maxContentScroll) + 'px';
        }
      } else {
        // вертикальний скрол
        let scrollStep       = container.clientHeight/10,
            contentPosition  = parseFloat( getComputedStyle(content).top ),
            maxContentScroll = content.clientHeight - container.clientHeight,
            maxThumbScroll;

        let line = elem.querySelector('.wjs-scroll__line_right')
                || elem.querySelector('.wjs-scroll__line_left');

        let thumb = elem.querySelector('.wjs-scroll__thumb_right')
                 || elem.querySelector('.wjs-scroll__thumb_left');
        maxThumbScroll   = line.clientHeight - thumb.clientHeight;


        // розрахунок прокрутки
        if (event.deltaY > 0) {
          contentPosition -= scrollStep;
        } else {
          contentPosition += scrollStep;
        }

        // контроль меж прокрутки
        if ( contentPosition > 0 ) {
          contentPosition = 0;
        }
        if ( Math.abs(contentPosition) > maxContentScroll ) {
          contentPosition = -maxContentScroll;
        }

        // прокрутка елементів
        content.style.top = contentPosition + 'px';

        if ( elem.querySelector('.wjs-scroll__thumb_right') ) {
          elem.querySelector('.wjs-scroll__thumb_right').style.top = Math.abs(contentPosition * maxThumbScroll / maxContentScroll) + 'px';
        }
        if ( elem.querySelector('.wjs-scroll__thumb_left') ) {
          elem.querySelector('.wjs-scroll__thumb_left').style.top = Math.abs(contentPosition * maxThumbScroll / maxContentScroll) + 'px';
        }
      }
    });
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
      let contentPosition       = parseFloat( getComputedStyle(content).top );

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

  // /* ↓↓↓ ЕМУЛЯЦІЯ SWIPE ДЛЯ ТЕЛЕФОНІВ ↓↓↓ */
  //   // touchstart/touchend
  //   let touchstartY = 0,
  //       touchendY   = 0;

  //   container.addEventListener('touchstart', function(event) {
  //     touchstartY = event.changedTouches[0].screenY;
  //   }, false);

  //   container.addEventListener('touchend', function(event) {
  //     touchendY = event.changedTouches[0].screenY;

  //     let maxContentScroll = content.clientHeight - container.clientHeight;
  //     let maxThumbScroll   = line.clientHeight - thumb.clientHeight;
  //     let scrollStep       = container.clientHeight/2;
  //     let contentPosition  = parseFloat( getComputedStyle(content).top );

  //     // розрахунок прокрутки
  //     if (touchendY < touchstartY) { // swipe down
  //       contentPosition -= scrollStep;
  //     }
  //     if (touchendY > touchstartY) {
  //       contentPosition += scrollStep;
  //     }

  //     // контроль меж прокрутки
  //     if ( contentPosition > 0 ) {
  //       contentPosition = 0;
  //     }
  //     if ( Math.abs(contentPosition) > maxContentScroll ) {
  //       contentPosition = -maxContentScroll;
  //     }

  //     // прокрутка елементів
  //     content.style.top = contentPosition + 'px';
  //     thumb.style.top = Math.abs(contentPosition * maxThumbScroll / maxContentScroll) + 'px'

  //   }, false);
  // /* ↑↑↑ /ЕМУЛЯЦІЯ SWIPE ДЛЯ ТЕЛЕФОНІВ ↑↑↑ */
}