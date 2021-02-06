"use strict";

////////////////////////////////////////////////////////////////////////////////
/* ↓↓↓ скрол ↓↓↓ */

  // ініціалізація
  document.addEventListener('DOMContentLoaded', function(){

    if ( !document.querySelector('.wjs-scroll') ) return;

    let arrOfScrollableElements = document.querySelectorAll('.wjs-scroll');
    for (let elem of arrOfScrollableElements) {
      setScroll(elem);
    }
  });

  // слідкування за змінами в сторінці (елемент може повністю влізти на
  // сторінку або навпаки), відповідно скрол повинен пропасти/з'явитися
  window.addEventListener('resize', function(){
    console.log('resize');
  });

  // mutation observer

/* ↑↑↑ /скрол ↑↑↑ */
////////////////////////////////////////////////////////////////////////////////



/**
 * [wFoo descryption]
 * @param {[type]} arg [descryption]
 */
function setScroll(elem, params = {}) {

  let container = elem,
      content   = elem.querySelector('.wjs-scroll__content');

  // контент вміщається в контейнер, прокрутка не потрібна
  if ( content.clientWidth <= container.clientWidth
    && content.clientHeight <= container.clientHeight ) {
    return
  }

  let lineT, lineB, thumbT, thumbB,
      lineR, lineL, thumbR, thumbL;

  let settingsString = elem.dataset.scroll || '';

  // додавання полос прокрутки по горизонталі
  if ( content.clientWidth > container.clientWidth ) {

    if ( params.top || settingsString.match(/top/i) ) {
      wAddScrollLine('top');
      lineL  = elem.querySelector('.wjs-scroll__line_top');
      thumbL = elem.querySelector('.wjs-scroll__thumb_top');
    }

    if ( params.bottom
      || settingsString.match(/bottom/i)
      || (!params.bottom
        && !params.top
        && !settingsString.match(/bottom/i)
        && !settingsString.match(/top/i)) ) {
      wAddScrollLine('bottom');
      lineR  = elem.querySelector('.wjs-scroll__line_bottom');
      thumbR = elem.querySelector('.wjs-scroll__thumb_bottom');
    }
  }

  // додавання полос прокрутки по вертикалі
  if ( content.clientHeight > container.clientHeight ) {

    if ( params.left || settingsString.match(/left/i) ) {
      wAddScrollLine('left');
      lineL  = elem.querySelector('.wjs-scroll__line_left');
      thumbL = elem.querySelector('.wjs-scroll__thumb_left');
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
        document.body.style.overflow = 'hidden';
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
          document.body.style.overflow = '';
        }
        if ( Math.abs(contentPosition) > maxContentScroll ) {
          contentPosition = -maxContentScroll;
          document.body.style.overflow = '';
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

  /* ↓↓↓ ЕМУЛЯЦІЯ SWIPE ДЛЯ ТЕЛЕФОНІВ ↓↓↓ */
    // touchstart/touchend
    let touchstartY = 0,
        touchendY   = 0,
        touchstartX = 0,
        touchendX   = 0;

    container.addEventListener('touchstart', function(event) {
      touchstartY = event.changedTouches[0].screenY;
      touchstartX = event.changedTouches[0].screenX;

      // якщо у документа є прокрутка, вона спрацює і кастомно-скрольний
      // елемент може прокрутитися за межі екрану
      // document.body.style.overflow = 'hidden';

let contentTop = content.getBoundingClientRect().top;
let containerTop = container.getBoundingClientRect().top;
// alert(`
// contentTop: ${contentTop},
// containerTop: ${containerTop},
// deltaT: ${contentTop - containerTop},
// contentH: ${content.clientHeight},
// containerH: ${container.clientHeight},
// deltaH: ${content.clientHeight - container.clientHeight}
// `);

    }, false);

    container.addEventListener('touchend', function(event) {

      touchendY = event.changedTouches[0].screenY;
      touchendX = event.changedTouches[0].screenX;

      let deltaY = Math.abs(touchendY - touchstartY),
          deltaX = Math.abs(touchendX - touchstartX);

      if (deltaX > deltaY) {
        // горизонтальний скрол

        let line = elem.querySelector('.wjs-scroll__line_bottom')
                || elem.querySelector('.wjs-scroll__line_top');

        let thumb = elem.querySelector('.wjs-scroll__thumb_bottom')
                 || elem.querySelector('.wjs-scroll__thumb_top');

        let maxContentScroll = content.clientWidth - container.clientWidth,
            maxThumbScroll   = line.clientWidth - thumb.clientWidth,
            scrollStep       = container.clientWidth/4,
            contentPosition  = parseFloat( getComputedStyle(content).left );

        // якщо свайп інтенсивний - збільшити швидкість прокрутки
        if ( (deltaX/container.clientWidth) > 0.45 ) {
          scrollStep = container.clientWidth/2;
        }
        if ( (deltaX/container.clientWidth) > 0.6 ) {
          scrollStep = container.clientWidth/1;
        }
        if ( (deltaX/container.clientWidth) > 0.75 ) {
          scrollStep = container.clientWidth/0.5;
        }
        if ( (deltaX/container.clientWidth) > 0.9 ) {
          scrollStep = container.clientWidth/0.2;
        }

        // розрахунок прокрутки
        if (touchendX < touchstartX) { // swipe down
          contentPosition -= scrollStep;
        }
        if (touchendX > touchstartX) {
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

        let line = elem.querySelector('.wjs-scroll__line_right')
                || elem.querySelector('.wjs-scroll__line_left');

        let thumb = elem.querySelector('.wjs-scroll__thumb_right')
                 || elem.querySelector('.wjs-scroll__thumb_left');

        let maxContentScroll = content.clientHeight - container.clientHeight,
            maxThumbScroll   = line.clientHeight - thumb.clientHeight,
            scrollStep       = container.clientHeight/4,
            contentPosition  = parseFloat( getComputedStyle(content).top );

        // якщо свайп інтенсивний - збільшити швидкість прокрутки
        if ( (deltaY/container.clientHeight) > 0.45 ) {
          scrollStep = container.clientHeight/2;
        }
        if ( (deltaY/container.clientHeight) > 0.6 ) {
          scrollStep = container.clientHeight/1;
        }
        if ( (deltaY/container.clientHeight) > 0.75 ) {
          scrollStep = container.clientHeight/0.5;
        }
        if ( (deltaY/container.clientHeight) > 0.9 ) {
          scrollStep = container.clientHeight/0.2;
        }

        // розрахунок прокрутки
        if (touchendY < touchstartY) { // swipe down
          contentPosition -= scrollStep;
        }
        if (touchendY > touchstartY) {
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
      // document.body.style.overflow = '';
    }, false);
  /* ↑↑↑ /ЕМУЛЯЦІЯ SWIPE ДЛЯ ТЕЛЕФОНІВ ↑↑↑ */
}