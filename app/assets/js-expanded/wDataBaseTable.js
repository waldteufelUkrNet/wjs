"use strict";

////////////////////////////////////////////////////////////////////////////////
/* ↓↓↓ wDataBaseTable ↓↓↓ */
  // коли даних в таблиці забагато, .wjs-dbtable__table-wrapper випадає за межі
  // .wjs-dbtable, в результаті не видно прокрутки. Потрібно розраховувати висоту
  // .wjs-dbtable__table-wrapper
  document.addEventListener('DOMContentLoaded', function(){

    // запит заголовків таблиці і виклик функції їх побудови
    ajax('../db/clientsDB-headers.txt', 'GET', callback1);
    function callback1(arg) {
      buildTableHeader('clientTable', arg);
    }

    ajax('../db/clientsDB.txt', 'GET', callback2);
    function callback2(arg) {
      buildTableBody('clientTable', arg);
    }

    calculateTableCellsWidth( document.querySelector('#clientTable') );

    setTableWrapperMaxAviableHeight();
    setTableInnerMaxAviableMeasurements();
    wSetScroll( document.querySelector('#clientTable .wjs-dbtable__table-wrapper.wjs-scroll'), {bottom:true,overvlowYHidden:true});
    wSetScroll( document.querySelector('#clientTable .wjs-scroll__content-wrapper .wjs-scroll'), {right:true,overvlowXHidden:true});
    positioningOfInnerRightScroll();
  });

  window.addEventListener('resize', function(){
    positioningOfInnerRightScroll();
    setTableWrapperMaxAviableHeight();
    setTableInnerMaxAviableMeasurements();
    wSetScroll( document.querySelector('#clientTable .wjs-dbtable__table-wrapper.wjs-scroll'), {bottom:true,overvlowYHidden:true});
    wSetScroll( document.querySelector('#clientTable .wjs-scroll__content-wrapper .wjs-scroll'), {right:true,overvlowXHidden:true});
  });
/* ↑↑↑ wDataBaseTable ↑↑↑ */
////////////////////////////////////////////////////////////////////////////////
/* ↓↓↓ functions declaration ↓↓↓ */

/**
 * [calculateTableCellsWidth нормалізує ширину чарунок таблиці і чарунок
 * заголовків]
 * @param  {[DOM-object]} tableElement [кореневий елемент DOM, в якому
 * знаходиться таблиця]
 */
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

/**
 * [setTableWrapperMaxAviableHeight виставляє точні розміри обгортки для
 * таблиці, максимально-доступні у flex-контейнері. Явно вказана висота
 * потрібна, щоб у елемента з'явилася прокрутка ]
 */
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

/**
 * [setTableInnerMaxAviableMeasurements виставляє точні розміри вкладеного
 * контейнера з прокруткою (тіло таблиці). Це потрібно для появи прокрутки та
 * коректного відображення контенту]
 */
function setTableInnerMaxAviableMeasurements() {
  let elem = document.querySelector('#clientTable .wjs-scroll__content-wrapper .wjs-scroll');
  let height = document.querySelector('#clientTable .wjs-dbtable__table-wrapper').clientHeight
               - document.querySelector('#clientTable .wjs-dbtable__theader').offsetHeight
               - getComputedStyle( document.querySelector('#clientTable .wjs-dbtable__table-wrapper .wjs-scroll__content') ).paddingBottom.slice(0,-2);

  let width = document.querySelector('#clientTable .wjs-dbtable__tbody').offsetWidth;

  elem.style.height = height + 'px';
  elem.style.width = width + 'px';
}

/**
 * [positioningOfInnerRightScroll позиціонує правий вертикальний скрол]
 */
function positioningOfInnerRightScroll() {
  let elem = document.querySelector('#clientTable .wjs-scroll__content-wrapper .wjs-scroll .wjs-scroll__wrapper_right');
  if(!elem) return;

  let container = document.querySelector('.wjs-dbtable__table-wrapper.wjs-scroll');
  elem.style.left =  container.clientWidth - elem.offsetWidth + 'px';

  container.querySelector('.wjs-scroll__content').addEventListener('scroll', foo);
  function foo(event) {
    elem.style.left =  container.clientWidth - elem.offsetWidth + event.target.scrollLeft + 'px';
  }
}

/**
 * [buildTableHeader відповідає за динамічну побудову шапки таблиці]
 * @param  {[DOM-object]} tableID [кореневий елемент DOM, в якому знаходиться
 * таблиця]
 * @param  {[type]} data    [дані, з яких будуються заголовки]
 */
function buildTableHeader (tableID, data) {
  let dataArr = JSON.parse(data);

  let table = document.querySelector('#' + tableID);
  let header = table.querySelector('.wjs-dbtable__theader');
  // header.innerHTML = '';

  let htmlStr = '';
  for (let item of dataArr ) {
    if (item.name == 'checkbox') {
      htmlStr += '\
                    <div class="wjs-dbtable__header-cell">\
                      <div class="wjs-dbtable__th-name">\
                        <input type="checkbox">\
                      </div>\
                    </div>\
                 ';
    } else {

      htmlStr += '<div class="wjs-dbtable__header-cell" data-source="' + item.source + '">';

      if ( item.buttons && item.buttons.includes('search') ) {
        htmlStr += '<button class="wjs-dbtable__btn wjs-dbtable__btn_search" type="button" title="поиск в базе по полю"></button>';
      }

      htmlStr += '<div class="wjs-dbtable__th-name">' + item.name + '</div>';

      if ( item.buttons && ( item.buttons.includes('close')
                             || item.buttons.includes('sort')
                             || item.buttons.includes('menu') ) ) {
        htmlStr += '<div class="wjs-dbtable__theader-btns-group">';

        if ( item.buttons.includes('close') ) {
          htmlStr += '<button class="wjs-dbtable__btn wjs-dbtable__btn_close" type="button" title="спрятать колонку"></button>';
        }
        if ( item.buttons.includes('sort') ) {
          htmlStr += '<button class="wjs-dbtable__btn wjs-dbtable__btn_sort" type="button" title="сортировать базу данных по полю"></button>';
        }
        if ( item.buttons.includes('menu') ) {
          htmlStr += '<button class="wjs-dbtable__btn wjs-dbtable__btn_options" type="button" title="доп. опции"></button>';
        }
        htmlStr += '</div>';
      }

      htmlStr += '</div>';

    }
  }
  header.innerHTML = htmlStr;
}

/**
 * [buildTableBody відповідає за динамічну побудову тіла таблиці]
 * @param  {[DOM-object]} tableID [кореневий елемент DOM, в якому знаходиться
 * таблиця]
 * @param  {[type]} data    [дані, з яких будується таблия]
 */
function buildTableBody (tableID, data) {
  console.log("data", data);
}
/* ↑↑↑ functions declaration ↑↑↑ */
////////////////////////////////////////////////////////////////////////////////