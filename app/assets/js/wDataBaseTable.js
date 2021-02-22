"use strict";
// wDataBaseTable
////////////////////////////////////////////////////////////////////////////////
/* ↓↓↓ variables declaration ↓↓↓ */
  let db;
/* ↑↑↑ variables declaration ↑↑↑ */
////////////////////////////////////////////////////////////////////////////////

// перевіряємо, чи є LS, якщо нема - для уникнення помилок створюємо
// правильну структуру
initLocalStorage('clientTable');

/* ↓↓↓ build table ↓↓↓ */
  document.addEventListener('DOMContentLoaded', function(){

    let table = JSON.parse( localStorage.getItem('clientTable') );
    if (!table.h.length) {
      // ls пустий, вантажимо заголовки таблиці
      ajax('../db/clientsDB-headers.txt', 'GET', handleTableHeaders);
      function handleTableHeaders(arg) {
        let headersArr = JSON.parse(arg);

        for (let i = 0; i < headersArr.length; i++) {
          let item = {
            n: headersArr[i].name,
            b: headersArr[i].buttons,
            s: headersArr[i].source,
            d: true
          };
          table.h.push(item);
        }

        localStorage.setItem( 'clientTable', JSON.stringify(table) );
        buildTableHeader('clientTable');

        // заголовки таблиці готові, вантажимо тіло
        ajax('../db/clientsDB.txt', 'GET', handleTableBody);
      }
    } else {
      // заголoвки таблиці записані в ls, будуємо таблицю
      showDisabledColumnMarkerAtStartUp('clientTable');
      buildTableHeader('clientTable');

      // заголовки таблиці готові, вантажимо тіло
      ajax('../db/clientsDB.txt', 'GET', handleTableBody);
    }
  });
/* ↑↑↑ build table ↑↑↑ */

  window.addEventListener('resize', function(){
    normalizeTableMeasurements('clientTable');
  });

  document.querySelector('#clientTable').addEventListener('click', function(event){
    if ( event.target.classList.contains('wjs-dbtable__btn_close') ) {
      closeColumn(event.target);
    }

    if ( event.target.classList.contains('wjs-dbtable__discols-close-btn') ) {
      showDisabledColumn(event.target);
    }

  });

////////////////////////////////////////////////////////////////////////////////
/* ↓↓↓ functions declaration ↓↓↓ */

/**
 * [initLocalStorage перевірка наявності LS, якщо його нема - ініціалізація]
 * @param  {[String]} tableId [ідентифікатор таблиці]
 */
function initLocalStorage(tableId) {
  let table = JSON.parse( localStorage.getItem(tableId) ) || {};

  if ( !('h' in table) ) table.h = [];

  localStorage.setItem( tableId, JSON.stringify(table) );
}

function handleTableBody(arg) {
  db = arg;
  buildTableBody('clientTable', arg);
  normalizeTableMeasurements('clientTable');
}

/**
 * [normalizeTableMeasurements нормалізує зовнішній вигляд таблиці: підганяє
 * розміри, додає полоси прокрутки]
 * @param  {[type]} tableElement [description]
 * @return {[type]}              [description]
 */
function normalizeTableMeasurements(tableElement) {
  calculateTableCellsWidth( document.querySelector('#' + tableElement) );

  setTableWrapperMaxAviableHeight(tableElement);
  setTableInnerMaxAviableMeasurements(tableElement);
  wSetScroll( document.querySelector('#clientTable .wjs-dbtable__table-wrapper.wjs-scroll'), {bottom:true,overvlowYHidden:true});
  wSetScroll( document.querySelector('#clientTable .wjs-scroll__content-wrapper .wjs-scroll'), {right:true,overvlowXHidden:true});
  positioningOfInnerRightScroll(tableElement);

  document.querySelector('#' + tableElement + ' .wjs-dbtable__loader-wrapper').style.display = 'none';
}

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

  theader.style.width = countWidth + 'px';
  tbody.style.width = countWidth + 'px';
}

/**
 * [setTableWrapperMaxAviableHeight виставляє точні розміри обгортки для
 * таблиці, максимально-доступні у flex-контейнері. Явно вказана висота
 * потрібна, щоб у елемента з'явилася прокрутка ]
 */
function setTableWrapperMaxAviableHeight(tableElement) {

  let elem = document.querySelector('#' + tableElement + ' .wjs-dbtable__table-wrapper');

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
function setTableInnerMaxAviableMeasurements(tableElement) {
  let elem = document.querySelector('#' + tableElement + ' .wjs-scroll__content-wrapper .wjs-scroll');
  let height = document.querySelector('#' + tableElement + ' .wjs-dbtable__table-wrapper').clientHeight
               - document.querySelector('#' + tableElement + ' .wjs-dbtable__theader').offsetHeight
               - getComputedStyle( document.querySelector('#' + tableElement + ' .wjs-dbtable__table-wrapper .wjs-scroll__content') ).paddingBottom.slice(0,-2);

  let width = document.querySelector('#' + tableElement + ' .wjs-dbtable__tbody').offsetWidth;

  elem.style.height = height + 'px';
  elem.style.width = width + 'px';
}

/**
 * [positioningOfInnerRightScroll позиціонує правий вертикальний скрол]
 */
function positioningOfInnerRightScroll(tableElement) {
  let elem = document.querySelector('#' + tableElement + ' .wjs-scroll__content-wrapper .wjs-scroll .wjs-scroll__wrapper_right');
  if(!elem) return;

  let container = document.querySelector('.wjs-dbtable__table-wrapper.wjs-scroll');

  let content = document.querySelector('#' + tableElement + ' .wjs-scroll__content');

  elem.style.left =  container.clientWidth + content.scrollLeft - elem.offsetWidth + 'px';

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
function buildTableHeader (tableID) {

  let headerData = JSON.parse( localStorage.getItem(tableID) ).h;

  let table = document.querySelector('#' + tableID);
  let header = table.querySelector('.wjs-dbtable__theader');
  // header.innerHTML = '';

  let htmlStr = '';
  for (let item of headerData ) {
    // якщо колонка виключена - не відображати
    if (!item.d) continue;

    if (item.n == 'checkbox') {
      htmlStr += '\
                    <div class="wjs-dbtable__header-cell">\
                      <div class="wjs-dbtable__th-name">\
                        <input type="checkbox">\
                      </div>\
                    </div>\
                 ';
    } else {

      htmlStr += '<div class="wjs-dbtable__header-cell" data-source="' + item.s + '">';

      if ( item.b && item.b.includes('search') ) {
        htmlStr += '<button class="wjs-dbtable__btn wjs-dbtable__btn_search" type="button" title="поиск в базе по полю"></button>';
      }

      htmlStr += '<div class="wjs-dbtable__th-name">' + item.n + '</div>';

      if ( item.b && ( item.b.includes('close')
                             || item.b.includes('sort')
                             || item.b.includes('menu') ) ) {
        htmlStr += '<div class="wjs-dbtable__theader-btns-group">';

        if ( item.b.includes('close') ) {
          htmlStr += '<button class="wjs-dbtable__btn wjs-dbtable__btn_close" type="button" title="спрятать колонку"></button>';
        }
        if ( item.b.includes('sort') ) {
          htmlStr += '<button class="wjs-dbtable__btn wjs-dbtable__btn_sort" type="button" title="сортировать базу данных по полю"></button>';
        }
        if ( item.b.includes('menu') ) {
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
  let headerData   = JSON.parse( localStorage.getItem(tableID) ).h,
      tableData    = JSON.parse(data),
      tableBody    = document.querySelector('#' + tableID + ' .wjs-dbtable__tbody'),
      tableHeader  = document.querySelector('#' + tableID + ' .wjs-dbtable__theader');

  document.querySelector('.wjs-dbtable__items-amount').innerHTML = tableData.length;

  tableBody.innerHTML = '';

  let order = [];
  for (let item of headerData) {
    if (!item.d) continue;
   order.push(item.s);
  }

  tableHeader.style.gridTemplateColumns = 'repeat(' + (order.length - 1) + ', auto) 1fr';
  tableBody.style.gridTemplateColumns = 'repeat(' + (order.length - 1) + ', auto) 1fr';

  for (let i = 0; i < tableData.length; i++) {
    let item = '';
    for (let j = 0; j < order.length; j++) {
      if ( tableData[i][order[j]] === true ) {
        item = item + '<div class="wjs-dbtable__body-cell"><input type="checkbox"></div>';
      } else {
        item = item + '<div class="wjs-dbtable__body-cell" data-source="' + order[j] + '">' + tableData[i][order[j]] + '</div>';
      }
    }
    tableBody.insertAdjacentHTML('beforeEnd', item);
  }
}

function closeColumn(elem) {
  let parent         = elem.closest('.wjs-dbtable'),
      parentId       = parent.getAttribute('id'),
      tableHeader    = parent.querySelector('.wjs-dbtable__theader'),
      tableBody      = parent.querySelector('.wjs-dbtable__tbody'),
      headerCell     = elem.closest('[data-source]'),
      source         = headerCell.dataset.source,
      name           = '';

  // видалити заголок і колонку
  headerCell.remove();
  let bodyCellsArr = parent.querySelectorAll('.wjs-dbtable__body-cell[data-source="' + source + '"]');
  for (let cell of bodyCellsArr) {
    cell.remove();
  }

  // підкорегувати стилі
  let tableData   = JSON.parse( localStorage.getItem(parentId) );
  let enabledColumnsAmount = 0;
  for (let i = 0; i < tableData.h.length; i++) {
    if (tableData.h[i].d) {
      enabledColumnsAmount++;
    }
  }
  // -2, бо 1 колонку виключаємо, 1 колонку забирає 1fr
  enabledColumnsAmount -= 2;

  tableHeader.style.gridTemplateColumns = 'repeat(' + enabledColumnsAmount + ', auto) 1fr';
  tableBody.style.gridTemplateColumns = 'repeat(' + enabledColumnsAmount + ', auto) 1fr';


  // зберегти зміни
  for (let i = 0; i < tableData.h.length; i++) {
    if ( tableData.h[i].s == source ) {
      tableData.h[i].d = false;
      localStorage.setItem( parentId, JSON.stringify(tableData) );

      name = tableData.h[i].n;
      break;
    }
  }

  showDisabledColumnMarker(name, source, parentId);
  normalizeTableMeasurements(parentId);
}

function showDisabledColumnMarker(name, source, tableID) {
  let markersWrapper = document.querySelector('#' + tableID + ' .wjs-dbtable__discols-wrapper');
  let html = '\
          <div class="wjs-dbtable__discols-item" data-source="' + source + '">\
            <span>' + name + '</span>\
            <button type="button" class="wjs-dbtable__discols-close-btn"></buton>\
          </div>\
  ';
  markersWrapper.insertAdjacentHTML('beforeEnd', html);
}

function showDisabledColumnMarkerAtStartUp(tableID) {
  let tableData = JSON.parse( localStorage.getItem('clientTable') );

  for (let i = 0; i < tableData.h.length; i++) {
    if (!tableData.h[i].d) {
      showDisabledColumnMarker(tableData.h[i].n, tableData.h[i].s, tableID);
    }
  }
}

function showDisabledColumn(elem) {
  let marker    = elem.closest('.wjs-dbtable__discols-item'),
      source    = marker.dataset.source,
      tableID   = elem.closest('.wjs-dbtable').getAttribute('id'),
      tableData = JSON.parse( localStorage.getItem(tableID) );

  // видаляємо маркер
  marker.remove();

  // зберігаємо зміни в ls
  for ( let i = 0; i < tableData.h.length; i++) {
    if (source == tableData.h[i].s) {
      tableData.h[i].d = true;
      localStorage.setItem( tableID, JSON.stringify(tableData) );
    }
  }

  // перебудувати таблицю
  buildTableHeader('clientTable');
  buildTableBody('clientTable', db);
  normalizeTableMeasurements('clientTable');
}
/* ↑↑↑ functions declaration ↑↑↑ */
////////////////////////////////////////////////////////////////////////////////