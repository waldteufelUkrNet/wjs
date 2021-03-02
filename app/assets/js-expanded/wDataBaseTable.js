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
  window.addEventListener('load', function(){

    let tableObj = JSON.parse( localStorage.getItem('clientTable') );
    if (!tableObj.h.length) {
      // ls пустий, вантажимо заголовки таблиці
      showLoader('clientTable', 'запрос структуры таблицы ...');
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
          tableObj.h.push(item);
        }

        localStorage.setItem( 'clientTable', JSON.stringify(tableObj) );
        buildTableHeader('clientTable');

        // заголовки таблиці готові, вантажимо тіло
        showLoader('clientTable', 'загрузка базы данных ...');
        ajax('../db/clientsDB.txt', 'GET', handleTableBody);
      }
    } else {
      // заголoвки таблиці записані в ls, будуємо таблицю
      showDisabledColumnMarkerAtStartUp('clientTable');
      buildTableHeader('clientTable');

      // заголовки таблиці готові, вантажимо тіло
      showLoader('clientTable', 'загрузка базы данных ...');
      ajax('../db/clientsDB-100.txt', 'GET', handleTableBody);
    }
  });
/* ↑↑↑ build table ↑↑↑ */

/* ↓↓↓ appointment of event handlers ↓↓↓ */
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
/* ↑↑↑ appointment of event handlers ↑↑↑ */
////////////////////////////////////////////////////////////////////////////////
/* ↓↓↓ functions declaration ↓↓↓ */

/**
 * [initLocalStorage перевірка наявності LS, якщо його нема - ініціалізація]
 * @param  {[String]} tableId [ідентифікатор таблиці]
 */
function initLocalStorage(tableId) {
  let tableObj = JSON.parse( localStorage.getItem(tableId) ) || {};

  if ( !('h' in tableObj) ) tableObj.h = [];

  localStorage.setItem( tableId, JSON.stringify(tableObj) );
}

/**
 * [handleTableBody функція-колбек на запит бази даних]
 * @param  {[Object]} arg [база даних]
 */
function handleTableBody(arg) {
  db = arg;
  showLoader('clientTable', 'обработка данных ...');

  setTimeout(function(){
    buildTableBody('clientTable', arg);
    normalizeTableMeasurements('clientTable');
  },1);
}

/**
 * [normalizeTableMeasurements нормалізує зовнішній вигляд таблиці: підганяє
 * розміри, додає полоси прокрутки]
 * @param  {[String]} tableId [ідентифікатор твблиці]
 */
function normalizeTableMeasurements(tableId) {

  // html-структура:
  // --------------
  // .wjs-dbtable__table-wrapper.wjs-scroll(data-scroll='bottom' data-scroll-hidden='vertical')
  //
  //   .wjs-scroll__wrapper.wjs-scroll__wrapper_bottom
  //     .wjs-scroll__line wjs-scroll__line_bottom
  //       .wjs-scroll__thumb wjs-scroll__thumb_bottom
  //
  //   .wjs-scroll__content-wrapper
  //     .wjs-scroll__content
  //
  //       .wjs-dbtable__table
  //         .wjs-dbtable__theader
  //         .wjs-scroll(data-scroll='right' data-scroll-hidden='horizontal')
  //
  //           .wjs-scroll__wrapper.wjs-scroll__wrapper_right
  //             .wjs-scroll__line wjs-scroll__line_right
  //               .wjs-scroll__thumb wjs-scroll__thumb_right
  //
  //           .wjs-scroll__content-wrapper
  //             .wjs-scroll__content
  //               .wjs-dbtable__tbody

  let tableElement       = document.getElementById(tableId),
      outerContainer     = tableElement.querySelector('.wjs-dbtable__table-wrapper'),
      outerScrollContent = tableElement.querySelector('.wjs-dbtable__table-wrapper .wjs-scroll__content'),
      innerContainer     = tableElement.querySelector('.wjs-scroll__content-wrapper .wjs-scroll'),
      table              = tableElement.querySelector('.wjs-dbtable__table'),
      theader            = tableElement.querySelector('.wjs-dbtable__theader'),
      hCells             = tableElement.querySelectorAll('.wjs-dbtable__header-cell'),
      tbody              = tableElement.querySelector('.wjs-dbtable__tbody'),
      bCells             = tableElement.querySelectorAll('.wjs-dbtable__body-cell');

  /* ↓↓↓ outerContainer height ↓↓↓ */
    // розраховуємо точні розміри обгортки для таблиці, максимально-доступні у
    // flex-контейнері. Явно вказана висота потрібна, щоб у елемента з'явилася
    // прокрутка
    let parent = outerContainer.parentElement;
    let aviableHeight = parent.clientHeight
                        - +getComputedStyle(parent).paddingTop.slice(0,-2)
                        - +getComputedStyle(parent).paddingBottom.slice(0,-2);
    let elemSiblings = parent.children;
    if (elemSiblings.length == 1) {
      // елемент один і займає весь простір
      outerContainer.style.height = aviableHeight + 'px';
    } else {
      // елемент не один, розраховуємо досупну для нього висоту
      for (let i = 0; i < elemSiblings.length; i++) {
        if (elemSiblings[i] == outerContainer) continue;
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

      outerContainer.style.height = aviableHeight + 'px';
    }
  /* ↑↑↑ outerContainer height ↑↑↑ */

  /* ↓↓↓ table cells width ↓↓↓ */
    // зрівнюємо ширини чарунок тіла таблиці і чарунок шапки

    theader.style.width            = outerContainer.clientWidth + 'px';
    tbody.style.width              = outerContainer.clientWidth + 'px';
    table.style.width              = outerContainer.clientWidth + 'px';
    outerScrollContent.style.width = outerContainer.clientWidth + 'px';

    let countWidth = 0;
    for (let i = 0; i < hCells.length; i++) {
      bCells[i].style.width = 'auto';
      hCells[i].style.width = 'auto';
      if (hCells[i].clientWidth > bCells[i].clientWidth) {
        bCells[i].style.width = hCells[i].offsetWidth + 'px';
      } else {
        hCells[i].style.width = bCells[i].offsetWidth + 'px';
      }
      countWidth += hCells[i].offsetWidth;
    }

    if (countWidth > theader.clientWidth) {
      theader.style.width            = countWidth + 'px';
      tbody.style.width              = countWidth + 'px';
      table.style.width              = countWidth + 'px';
      outerScrollContent.style.width = countWidth + 'px';
    }
  /* ↑↑↑ table cells width ↑↑↑ */

  /* ↓↓↓ left scroll review ↓↓↓ */
    let maxScrollLeft = outerScrollContent.offsetWidth - outerContainer.clientWidth;
    if (outerScrollContent.scrollLeft > maxScrollLeft) {
      outerScrollContent.scrollLeft = maxScrollLeft;
    }
  /* ↑↑↑ left scroll review ↑↑↑ */

  wSetScroll( document.querySelector('#' + tableId + ' .wjs-dbtable__table-wrapper.wjs-scroll'), {bottom:true,overvlowYHidden:true});

  /* ↓↓↓ innerContainer height&width ↓↓↓ */
    // розраховуємо точні розміри вкладеного контейнера з прокруткою (тіло
    // таблиці). Це потрібно для появи прокрутки та коректного відображення
    // контенту

    if ( tableElement.querySelector('.wjs-scroll__wrapper_bottom') ) {
      // chrome і mozilla по різному сприймають padding-bottom. Якщо це зробити через
      // стилі, у chrom'a буде зайвий padding.
      outerScrollContent.style.paddingBottom = '20px';
    } else {
      outerScrollContent.style.paddingBottom = '0px';
    }

    let height = outerContainer.clientHeight
                 - theader.offsetHeight
                 - getComputedStyle(outerScrollContent).paddingBottom.slice(0,-2);
    let width = tbody.offsetWidth;

    innerContainer.style.height = height + 'px';
    innerContainer.style.width = width + 'px';
  /* ↑↑↑ innerContainer height&width ↑↑↑ */

  wSetScroll( document.querySelector('#' + tableId + ' .wjs-scroll__content-wrapper .wjs-scroll'), {right:true,overvlowXHidden:true});

console.log(outerScrollContent.scrollWidth + '/' + outerScrollContent.clientWidth);

  positioningOfInnerRightScroll(tableId);

  setTimeout(function(){
    hideLoader(tableId);
  },1000);
}

/**
 * [positioningOfInnerRightScroll позиціонує правий вертикальний скрол]
 * @param  {[String]} tableId [ідентифікатор твблиці]
 */
function positioningOfInnerRightScroll(tableId) {
  let elem = document.querySelector('#' + tableId + ' .wjs-scroll__content-wrapper .wjs-scroll .wjs-scroll__wrapper_right');
  if(!elem) return;

  let container = document.querySelector('.wjs-dbtable__table-wrapper.wjs-scroll');

  let content = document.querySelector('#' + tableId + ' .wjs-scroll__content');

  elem.style.left =  container.clientWidth + content.scrollLeft - elem.offsetWidth + 'px';

  container.querySelector('.wjs-scroll__content').addEventListener('scroll', foo);
  function foo(event) {
    elem.style.left =  container.clientWidth - elem.offsetWidth + event.target.scrollLeft + 'px';
  }
}

/**
 * [buildTableHeader відповідає за динамічну побудову шапки таблиці]
 * @param  {[String]} tableId [ідентифікатор твблиці]
 */
function buildTableHeader (tableId) {

  let tableObj = JSON.parse( localStorage.getItem(tableId) );

  let table   = document.querySelector('#' + tableId);
  let theader = table.querySelector('.wjs-dbtable__theader');

  let htmlStr = '';
  for (let item of tableObj.h ) {
    // якщо колонка виключена - не відображати
    if (!item.d) continue;

    if (item.n == 'checkbox') {
      htmlStr += '\
                    <div class="wjs-dbtable__header-cell wjs-dbtable__header-cell_checkbox">\
                      <div class="wjs-dbtable__th-name">\
                        <input type="checkbox" id="chboxAll">\
                        <label for="chboxAll"></label>\
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
  theader.innerHTML = htmlStr;
}

/**
 * [buildTableBody відповідає за динамічну побудову тіла таблиці]
 * @param  {[String]} tableId [ідентифікатор твблиці]
 * @param  {[String]} data    [дані, з яких будується таблиця]
 */
function buildTableBody (tableId, data) {
  let headerData  = JSON.parse( localStorage.getItem(tableId) ).h,
      tableData   = JSON.parse(data),
      tableBody   = document.querySelector('#' + tableId + ' .wjs-dbtable__tbody'),
      tableHeader = document.querySelector('#' + tableId + ' .wjs-dbtable__theader');

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
    let styleClass = 'w-bgc-aliceblue';
    if ( i%2 == 0 ) {
      styleClass = '';
    }

    for (let j = 0; j < order.length; j++) {
      // tableData[i] - елемент БД, об'єкт
      // [order[j]] - його властивості (networkStatus/phone/id і т.д.)
      switch(order[j]) {
        case 'checkbox':
          if ( tableData[i][order[j]] === true ) {
            item = item + '<div class="wjs-dbtable__body-cell wjs-dbtable__body-cell_checkbox ' + styleClass + '">\
                             <input type="checkbox" id="chbox' + tableData[i].id + '">\
                             <label for="chbox' + tableData[i].id + '"></label>\
                           </div>';
          }
          break;

        case 'id':
          item = item + '<div class="wjs-dbtable__body-cell ' + styleClass + '" data-source="' + order[j] + '">\
                           <a href="#" class="w-link">' + tableData[i][order[j]] + '</a>\
                         </div>';
          break;

        case 'clientName':
          item = item + '<div class="wjs-dbtable__body-cell ' + styleClass + '" data-source="' + order[j] + '">\
                           <a href="#" class="w-link">' + tableData[i][order[j]] + '</a>\
                         </div>';
          break;

        case 'networkStatus':
          if ( tableData[i][order[j]] === 'offline' ) {
            item = item + '<div class="wjs-dbtable__body-cell w-red ' + styleClass + '" data-source="' + order[j] + '">' + tableData[i][order[j]] + '</div>';
          } else {
            item = item + '<div class="wjs-dbtable__body-cell w-lime ' + styleClass + '" data-source="' + order[j] + '">' + tableData[i][order[j]] + '</div>';
          }
          break;

        case 'phone':
          item = item + '<div class="wjs-dbtable__body-cell ' + styleClass + '" data-source="' + order[j] + '">\
                           <a href="#" class="w-link w-monotype">' + tableData[i][order[j]] + '</a>\
                         </div>';
          break;

        case 'email':
          item = item + '<div class="wjs-dbtable__body-cell ' + styleClass + '" data-source="' + order[j] + '">\
                           <a href="#" class="w-link">' + tableData[i][order[j]] + '</a>\
                         </div>';
          break;

        case 'verification':
          if ( tableData[i][order[j]] === 'без верификации' ) {
            item = item + '<div class="wjs-dbtable__body-cell w-red ' + styleClass + '" data-source="' + order[j] + '">' + tableData[i][order[j]] + '</div>';
          } else if ( tableData[i][order[j]] === 'частичная верификация' ){
            item = item + '<div class="wjs-dbtable__body-cell w-orange ' + styleClass + '" data-source="' + order[j] + '">' + tableData[i][order[j]] + '</div>';
          } else {
            item = item + '<div class="wjs-dbtable__body-cell ' + styleClass + '" data-source="' + order[j] + '">' + tableData[i][order[j]] + '</div>';
          }
          break;

        case 'activity':
          if ( tableData[i][order[j]] === 'не активен' ) {
            item = item + '<div class="wjs-dbtable__body-cell w-lightgrey ' + styleClass + '" data-source="' + order[j] + '">' + tableData[i][order[j]] + '</div>';
          } else {
            item = item + '<div class="wjs-dbtable__body-cell ' + styleClass + '" data-source="' + order[j] + '">' + tableData[i][order[j]] + '</div>';
          }
          break;

        case 'isTradeAble':
          if ( tableData[i][order[j]] === 'не доступна' ) {
            item = item + '<div class="wjs-dbtable__body-cell w-red ' + styleClass + '" data-source="' + order[j] + '">' + tableData[i][order[j]] + '</div>';
          } else {
            item = item + '<div class="wjs-dbtable__body-cell w-lime ' + styleClass + '" data-source="' + order[j] + '">' + tableData[i][order[j]] + '</div>';
          }
          break;

        case 'dateRegistration':
        case 'dateLastNote':
        case 'lastActivity':
          let dateString = tableData[i][order[j]],
              dateObj = new Date(dateString),
              yyyy = dateObj.getUTCFullYear(),
              mm = dateObj.getUTCMonth() + 1,
              dd = dateObj.getUTCDate(),
              hh = dateObj.getUTCHours(),
              min = dateObj.getUTCMinutes();
          if (mm < 10) mm = '0' + mm;
          if (dd < 10) dd = '0' + dd;
          if (hh < 10) hh = '0' + hh;
          if (min < 10) min = '0' + min;

          let date = yyyy + '.' +
                     mm + '.' +
                     dd + ' ' +
                     hh + ':' +
                     min;
          item = item + '<div class="wjs-dbtable__body-cell w-monotype ' + styleClass + '" data-source="' + order[j] + '">' + date + '</div>';
          break

        default:
          item = item + '<div class="wjs-dbtable__body-cell ' + styleClass + '" data-source="' + order[j] + '">' + tableData[i][order[j]] + '</div>';
      }
    }
    tableBody.insertAdjacentHTML('beforeEnd', item);
  }
}

/**
 * [closeColumn видаляє колонку з таблиці]
 * @param  {[DOM-Object]} elem [кнопка, на якій спрацював обробник кліку]
 */
function closeColumn(elem) {
  showLoader('clientTable', 'обработка данных ...');
  let parent     = elem.closest('.wjs-dbtable'),
      parentId   = parent.getAttribute('id'),
      theader    = parent.querySelector('.wjs-dbtable__theader'),
      tbody      = parent.querySelector('.wjs-dbtable__tbody'),
      headerCell = elem.closest('[data-source]'),
      source     = headerCell.dataset.source,
      name       = '';

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

  theader.style.gridTemplateColumns = 'repeat(' + enabledColumnsAmount + ', auto) 1fr';
  tbody.style.gridTemplateColumns = 'repeat(' + enabledColumnsAmount + ', auto) 1fr';


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

/**
 * [showDisabledColumnMarker показує маркер закритої колонки]
 * @param  {[String]} name    [назва колонки]
 * @param  {[String]} source  [як колонка назавається в бд(по цій змінній
 * відбувається зв'язка шапки і тіла таблиці) ]
 * @param  {[String]} tableId [ідентифікатор твблиці]
 */
function showDisabledColumnMarker(name, source, tableId) {
  let markersWrapper = document.querySelector('#' + tableId + ' .wjs-dbtable__discols-wrapper');
  let markersWrapperLabel = markersWrapper.previousElementSibling;
  let html = '\
          <div class="wjs-dbtable__discols-item" data-source="' + source + '">\
            <span>' + name + '</span>\
            <button type="button" class="wjs-dbtable__discols-close-btn"></buton>\
          </div>\
  ';

  markersWrapper.style.display = 'flex';
  markersWrapperLabel.style.display = 'block';
  markersWrapper.insertAdjacentHTML('beforeEnd', html);

  let allCloseMarker = document.querySelector('#' + tableId + ' .wjs-dbtable__discols-item[data-role="closeAll"]');
  if (!allCloseMarker) {
    let html = '\
            <div class="wjs-dbtable__discols-item" data-role="closeAll">\
              <span>show all columns</span>\
              <button type="button" class="wjs-dbtable__discols-close-btn"></buton>\
            </div>\
    ';
    markersWrapper.insertAdjacentHTML('afterBegin', html);
  }
}

/**
 * [showDisabledColumnMarkerAtStartUp під час завантаження показує в циклі усі
 * маркери виключених колонок таблиці]
 * @param  {[String]} tableId [ідентифікатор твблиці]
 */
function showDisabledColumnMarkerAtStartUp(tableId) {
  let tableData = JSON.parse( localStorage.getItem('clientTable') );

  for (let i = 0; i < tableData.h.length; i++) {
    if (!tableData.h[i].d) {
      showDisabledColumnMarker(tableData.h[i].n, tableData.h[i].s, tableId);
    }
  }
}

/**
 * [showDisabledColumn видаляє маркер, повертає колонку в таблицю]
 * @param  {[DOM-Object]} elem [кнопка, на якій спрацював обробник кліку]
 */
function showDisabledColumn(elem) {
  showLoader('clientTable', 'обновление таблицы ...');
  let marker              = elem.closest('.wjs-dbtable__discols-item'),
      markersWrapper      = elem.closest('.wjs-dbtable__discols-wrapper'),
      markersWrapperLabel = markersWrapper.previousElementSibling,
      source              = marker.dataset.source,
      tableId             = elem.closest('.wjs-dbtable').getAttribute('id'),
      tableData           = JSON.parse( localStorage.getItem(tableId) );

  setTimeout(function(){
    if ( marker.dataset.role == 'closeAll' ) {
      markersWrapper.innerHTML = '';

      // зберігаємо зміни в ls
      for ( let i = 0; i < tableData.h.length; i++) {
        tableData.h[i].d = true;
        localStorage.setItem( tableId, JSON.stringify(tableData) );
      }
    } else {
      // видаляємо маркер
      marker.remove();

      if( !markersWrapper.children.length || markersWrapper.children.length == 1 ) {
        markersWrapper.style.display = 'none';
        markersWrapperLabel.style.display = 'none';
      }

      // зберігаємо зміни в ls
      for ( let i = 0; i < tableData.h.length; i++) {
        if (source == tableData.h[i].s) {
          tableData.h[i].d = true;
          localStorage.setItem( tableId, JSON.stringify(tableData) );
        }
      }
    }

    // перебудувати таблицю
    buildTableHeader('clientTable');
    buildTableBody('clientTable', db);
    normalizeTableMeasurements('clientTable');
  });
}

function showLoader(tableId, text){
  let loader = document.querySelector('#' + tableId + ' .wjs-dbtable__loader');
  loader.querySelector('.wjs-dbtable__loader-info').innerHTML = text;
  loader.classList.add('wjs-dbtable__loader_active');
}

function hideLoader(tableId){
  document.querySelector('#' + tableId + ' .wjs-dbtable__loader').classList.remove('wjs-dbtable__loader_active');
}
/* ↑↑↑ functions declaration ↑↑↑ */
////////////////////////////////////////////////////////////////////////////////