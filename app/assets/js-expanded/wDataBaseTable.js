"use strict";

////////////////////////////////////////////////////////////////////////////////
/* ↓↓↓ wDataBaseTable ↓↓↓ */
  // коли даних в таблиці забагато, .wjs-dbtable__table-wrapper випадає за межі
  // .wjs-dbtable, в результаті не видно прокрутки. Потрібно розраховувати висоту
  // .wjs-dbtable__table-wrapper
  document.addEventListener('DOMContentLoaded', function(){
    calculateTableCellsWidth( document.querySelector('#clientTable') );

    calculateTableWrapperHeight( document.querySelector('.wjs-dbtable__table-wrapper') );


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

  let realHeaderCells = tableElement.querySelectorAll('thead th'),
      realHeaderCellsInner = tableElement.querySelectorAll('.wjs-dbtable__th-inner'),
      fakeHeaderCells = tableElement.querySelectorAll('.wjs-dbtable__pseudo-header-item');

  if (realHeaderCells.length == fakeHeaderCells.length) {
    for (let i = 0; i < realHeaderCells.length; i++) {
      if (realHeaderCellsInner[i].clientWidth > fakeHeaderCells[i].clientWidth) {
        console.log(realHeaderCellsInner[i].clientWidth + '/' + fakeHeaderCells[i].clientWidth);
        fakeHeaderCells[i].style.minWidth = realHeaderCellsInner[i].clientWidth + 'px';
        console.log(realHeaderCellsInner[i].clientWidth + '/' + fakeHeaderCells[i].clientWidth);
      } else {
        realHeaderCellsInner[i].style.minWidth = fakeHeaderCells[i].clientWidth + 'px';
      }
    }
  } else {
    console.log('table build error: realHeaderCells.length != fakeHeaderCells.length');
  }
}


function calculateTableWrapperHeight(elem) {
  if (!elem) return

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
/* ↑↑↑ functions declaration ↑↑↑ */
////////////////////////////////////////////////////////////////////////////////

// let th = document.querySelectorAll('.wjs-dbtable__th-inner')[3];
// th.style.width = '300px';