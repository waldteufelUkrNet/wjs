"use strict";

////////////////////////////////////////////////////////////////////////////////
/* ↓↓↓ wDataBaseTable ↓↓↓ */
  // коли даних в таблиці забагато, .wjs-dbtable__table-wrapper випадає за межі
  // .wjs-dbtable, в результаті не видно прокрутки. Потрібно розраховувати висоту
  // .wjs-dbtable__table-wrapper
  document.addEventListener('DOMContentLoaded', function(){
    calculateTableCellsWidth( document.querySelector('#clientTable') );

    setTableWrapperMaxAviableHeight();
    setTableInnerMaxAviableHeight();
    positioningOfInnerRightScroll();
  });
/* ↑↑↑ wDataBaseTable ↑↑↑ */
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
function wFoo(elem, params = {}) {}


function calculateTableCellsWidth(tableElement) {
  if (!tableElement) return;

  let headers = tableElement.querySelectorAll('.wjs-dbtable__header-cell'),
      cells   = tableElement.querySelectorAll('.wjs-dbtable__body-cell'),
      theader = tableElement.querySelector('.wjs-dbtable__theader'),
      tbody   = tableElement.querySelector('.wjs-dbtable__tbody');

  let countWidth = 0;

  for (let i = 0; i < headers.length; i++) {
    if (headers[i].clientWidth > cells[i].clientWidth) {
      cells[i].style.cssText = 'width:' + headers[i].offsetWidth + 'px';
      headers[i].style.cssText = 'width:' + headers[i].offsetWidth + 'px';
    } else {
      cells[i].style.cssText = 'width:' + cells[i].offsetWidth + 'px';
      headers[i].style.cssText = 'width:' + cells[i].offsetWidth + 'px';
    }
    countWidth += headers[i].offsetWidth;
  }

  theader.style.cssText = 'width:' + countWidth + 'px';
  tbody.style.cssText = 'width:' + countWidth + 'px';
}

function setTableWrapperMaxAviableHeight() {

  let elem = document.querySelector('#clientTable .wjs-dbtable__table-wrapper');

  let parent = elem.parentElement;
  let aviableHeight = parent.clientHeight
                      - +getComputedStyle(parent).paddingTop.slice(0,-2)
                      - +getComputedStyle(parent).paddingBottom.slice(0,-2);
  let elemSiblings = parent.children;
  if (elemSiblings.length == 1) {
    // елемент один і займає весь простір
    elem.style.height = aviableHeight + 'px';
  } else {
    // елемент не один, розраховуємо досупну для нього висоту
    for (let i = 0; i < elemSiblings.length; i++) {
      if (elemSiblings[i] == elem) continue;
      aviableHeight -= elemSiblings[i].clientHeight;
    }

    for (let i = 0; i < elemSiblings.length; i++) {
      if (elemSiblings[i-1]) {
        if ( +getComputedStyle(elemSiblings[i-1]).marginBottom.slice(0,-2) > +getComputedStyle(elemSiblings[i]).marginTop.slice(0,-2) ) {
          aviableHeight -= +getComputedStyle(elemSiblings[i-1]).marginBottom.slice(0,-2);
        } else {
          aviableHeight -= +getComputedStyle(elemSiblings[i]).marginTop.slice(0,-2);
        }
      } else {
        aviableHeight -= +getComputedStyle(elemSiblings[i]).marginTop.slice(0,-2);
      }
    }
    aviableHeight -= +getComputedStyle(elemSiblings[elemSiblings.length-1]).marginBottom.slice(0,-2);

    elem.style.height = aviableHeight + 'px';
  }
}

function setTableInnerMaxAviableHeight() {
  let elem = document.querySelector('#clientTable .wjs-scroll__content-wrapper .wjs-scroll');
  let height = document.querySelector('#clientTable .wjs-dbtable__table-wrapper').clientHeight
               - document.querySelector('#clientTable .wjs-dbtable__theader').offsetHeight
               - getComputedStyle( document.querySelector('#clientTable .wjs-dbtable__table-wrapper .wjs-scroll__content') ).paddingBottom.slice(0,-2);

  let width = document.querySelector('#clientTable .wjs-dbtable__tbody').offsetWidth;

  elem.style.height = height + 'px';
  elem.style.width = width + 'px';

  wSetScroll(elem,{right:true,overvlowYHidden:true});
}

function positioningOfInnerRightScroll() {
  let elem = document.querySelector('#clientTable .wjs-scroll__content-wrapper .wjs-scroll .wjs-scroll__wrapper_right');

  let container = document.querySelector('.wjs-dbtable__table-wrapper.wjs-scroll');
  elem.style.left =  container.clientWidth - elem.offsetWidth + 'px';

  container.querySelector('.wjs-scroll__content').addEventListener('scroll', foo);
  function foo(event) {
    elem.style.left =  container.clientWidth - elem.offsetWidth + event.target.scrollLeft + 'px';
  }
}
/* ↑↑↑ functions declaration ↑↑↑ */
////////////////////////////////////////////////////////////////////////////////