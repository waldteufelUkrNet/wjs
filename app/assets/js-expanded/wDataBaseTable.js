"use strict";

////////////////////////////////////////////////////////////////////////////////
/* ↓↓↓ wDataBaseTable ↓↓↓ */
  // коли даних в таблиці забагато, .wjs-table__table-wrapper випадає за межі
  // .wjs-table, в результаті не видно прокрутки. Потрібно розраховувати висоту
  // .wjs-table__table-wrapper
  document.addEventListener('DOMContentLoaded', function(){
    calculateTableWrapperHeight( document.querySelector('.wjs-table__table-wrapper') );
    calculateTableWrapperHeight( document.querySelector('.wjs-table__body') );
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

// let th = document.querySelectorAll('.wjs-table__th-inner')[3];
// th.style.width = '300px';