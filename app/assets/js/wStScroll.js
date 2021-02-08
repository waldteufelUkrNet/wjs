"use strict";
// let container = document.querySelector('.wjs-scroll-standart');
// setStandartScroll(container, {top: true});

////////////////////////////////////////////////////////////////////////////////
/* ↓↓↓ прокрутка ↓↓↓ */
  // ініціалізація
  document.addEventListener('DOMContentLoaded', setStandartScrollOnAllElements);

  // корекція вигляду прокрутки при зміні розмірів вікна
  window.addEventListener('resize', setStandartScrollOnAllElements);
/* ↑↑↑ прокрутка ↑↑↑ */
////////////////////////////////////////////////////////////////////////////////
function setStandartScroll(elem, param = {}) {
  let settingsString = elem.dataset.scroll || '';

  // якщо не вказано, які додаткові прокрутки робити
  if (!param.top && !param.left && !settingsString) return;

  let container = elem,
      content   = elem.querySelector('.wjs-content');

  // ліва прокрутка
  if ( param.left || settingsString.match(/left/i) ) {
    // під час resize виникають нові полоси прокрутки, тому старі потрібно видаляти
    if ( elem.querySelector('.wjs-scroll-standart__left') ) {
      elem.querySelector('.wjs-scroll-standart__left').remove();
    }
    let html = '\
                <div class="wjs-scroll-standart__left">\
                  <div class="wjs-scroll-standart-inner__left"></div>\
                </div>\
               ';
    elem.insertAdjacentHTML('afterBegin', html);

    let leftScroll      = elem.querySelector('.wjs-scroll-standart__left'),
        leftScrollInner = elem.querySelector('.wjs-scroll-standart-inner__left');

    // виставити розміри контенту по найбільших розмірах його дітей
    let arrOfContentChildren = content.children;
    let contentHeight = content.clientHeight;
    if (arrOfContentChildren.length != 0) {
      contentHeight = container.clientHeight;
    }
    for (let child of arrOfContentChildren) {
      let height = child.clientHeight || 0;
      if (height > contentHeight) contentHeight = height;
    }
    content.style.minHeight = contentHeight + 'px';
    leftScrollInner.style.height = contentHeight + 'px';

    leftScroll.style.height = container.clientHeight + 'px';
    content.style.marginLeft = leftScroll.offsetWidth + 'px';

    leftScroll.style.overflowY = 'scroll';
    container.style.overflowY = 'scroll';

    leftScroll.onscroll = function(e){
      container.scrollTop = leftScroll.scrollTop
    };

    container.addEventListener('scroll', function(e){
      leftScroll.scrollTop = container.scrollTop
    });
  }

  // верхня прокрутка
  if ( param.top || settingsString.match(/top/i) ) {
    // під час resize виникають нові полоси прокрутки, тому старі потрібно видаляти
    if ( elem.querySelector('.wjs-scroll-standart__top') ) {
      elem.querySelector('.wjs-scroll-standart__top').remove();
    }

    let html = '\
                <div class="wjs-scroll-standart__top">\
                  <div class="wjs-scroll-standart-inner__top"></div>\
                </div>\
               ';
    elem.insertAdjacentHTML('afterBegin', html);

    let topScroll      = elem.querySelector('.wjs-scroll-standart__top'),
        topScrollInner = elem.querySelector('.wjs-scroll-standart-inner__top');

    // виставити розміри контенту по найбільших розмірах його дітей
    let arrOfContentChildren = content.children;
    let contentWidth = content.clientWidth;
    if (arrOfContentChildren.length != 0) {
      contentWidth = content.clientWidth;
    }
    for (let child of arrOfContentChildren) {
      let width = child.clientWidth || 0;
      if (width > contentWidth) contentWidth = width;
    }
    content.style.minWidth = contentWidth + 'px';
    // ширина верхньої прокрутки із урахуванням лівої
    topScrollInner.style.width = contentWidth + +getComputedStyle(content).marginLeft.slice(0,-2) + 'px';

    topScroll.style.width = container.clientWidth + 'px';
    content.style.marginTop = topScroll.offsetHeight + 'px';

    topScroll.style.overflowX = 'scroll';
    container.style.overflowX = 'scroll';

    topScroll.onscroll = function(e){
      container.scrollLeft = topScroll.scrollLeft
    };

    container.addEventListener('scroll', function(e){
      topScroll.scrollLeft = container.scrollLeft
    });

    // якщо є верхня прокрутка, то ліву треба перерахувати (додати висоту верхньої)
    if ( elem.querySelector('.wjs-scroll-standart__left') ) {
      let leftScrollInner = elem.querySelector('.wjs-scroll-standart-inner__left');
      leftScrollInner.style.height = content.clientHeight + topScroll.offsetHeight + 'px';
    }
  }

  // mutation observer
  let observer = new MutationObserver(handleMutation);
  observer.observe(elem, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    characterData: true
  });
}

function setStandartScrollOnAllElements(){

  if ( !document.querySelector('.wjs-scroll-standart') ) return;

  let arrOfScrollableElements = document.querySelectorAll('.wjs-scroll-standart');
  for (let elem of arrOfScrollableElements) {
    setStandartScroll(elem);
  }
}

function handleMutation(mutationRecordList, observer) {
  observer.disconnect();
  let elem = mutationRecordList[mutationRecordList.length-1].target.closest('.wjs-scroll-standart');
  setStandartScroll(elem);
}

setTimeout(function(){
  document.getElementById('test1').style.width = '200px';
},3000);

setTimeout(function(){
  document.getElementById('test2').style.height = '200px';
},6000);