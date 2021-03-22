"use strict";
// wDataBaseTable
////////////////////////////////////////////////////////////////////////////////
/* ↓↓↓ variables declaration ↓↓↓ */
  let headerURL = '../db/clientsDB-headers.txt';
  let bodyURL = '../db/clientsDB-1000.txt';

  /**
   * [db об'єкт, властивості якого (db[tableId]) бази даних конкретних таблиць]
   * @type {Object}
   */
  let db = {}; // db[tableId] - база даних конкретної таблиці є властивістю об1єкта

  /**
   * [fingerprint Коли у списку фільтрів вмикати/вимикати фільтри, кожен раз
   * викликати функцію фільтрації бази даних і перебудови таблиці буде
   * контрпродуктивно. Краще при відкритті списку фільтрів робити "відбиток"
   * фільтрів, а при закритті списку - порівнювати новий відбиток зі старим.
   * Якщо вони різні - тоді один раз викликати функцію фільтрації БД]
   * @type {String}
   */
  let fingerprint = '';
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
      ajax(headerURL, 'GET', handleTableHeaders);
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
        ajax(bodyURL, 'GET', handleTableBody, 'clientTable');
      }
    } else {
      // заголoвки таблиці записані в ls, будуємо таблицю
      showDisabledColumnMarkerAtStartUp('clientTable');
      addAllFilterMarkersAtStartUp('clientTable');
      buildTableHeader('clientTable');

      // заголовки таблиці готові, вантажимо тіло
      showLoader('clientTable', 'загрузка базы данных ...');
      ajax(bodyURL, 'GET', handleTableBody, 'clientTable');
    }
  });
/* ↑↑↑ build table ↑↑↑ */
////////////////////////////////////////////////////////////////////////////////
/* ↓↓↓ appointment of event handlers ↓↓↓ */
  window.addEventListener('resize', function(){
    normalizeTableMeasurements('clientTable');

    // закриття списку фільтрів
    closeFiltersList();
  });

  document.querySelector('#clientTable').addEventListener('click', function(event){
    if ( event.target.classList.contains('wjs-dbtable__btn_close') ) {
      closeColumn(event.target);
    }

    if ( event.target.classList.contains('wjs-dbtable__discols-close-btn') ) {
      showDisabledColumn(event.target);
    }

    // pagination 1
    if ( event.target.closest('.wjs-dbtable__page-btn') ) {
      if ( event.target.closest('.wjs-dbtable__page-btn_disabled')
        || event.target.closest('.wjs-dbtable__page-btn_passive')
        || event.target.closest('.wjs-dbtable__page-btn_dotts') ) return;

      let tableId     = event.target.closest('.wjs-dbtable').getAttribute('id'),
          data        = db[tableId],
          btn         = event.target.closest('.wjs-dbtable__page-btn'),
          itemsAmount = btn.dataset.paginationperpage,
          startValue  = btn.dataset.paginationstart*itemsAmount;

      buildTableBody (tableId, data, startValue, itemsAmount);
      normalizeTableMeasurements(tableId);
    }
    // pagination 2
    if ( event.target.closest('.wjs-dbtable__go-to-page-btn') ) {
      goToPage(event.target);
    }

    // зняти усі пташки
    if ( event.target.closest('.wjs-dbtable__uncheckAll') ) {
      uncheckAllCheckboxes(event.target);
    }

    // sort
    if ( event.target.closest('.wjs-dbtable__btn_sort') ) {
      sortDB(event.target);
    }

    // build filters list
    if ( event.target.closest('.wjs-dbtable__btn_options') ) {
      buildFiltersList(event.target);
    }

    // close filters list
    if ( !event.target.closest('.wjs-dbtable__filters-list-wrapper')
         && !event.target.closest('.wjs-dbtable__btn.wjs-dbtable__btn_options')
         && document.querySelector('.wjs-dbtable__filters-list-wrapper') ) {
      closeFiltersList('clientTable');
    }

    // close filter markers
    if ( event.target.closest('.wjs-dbtable__filter-close-btn') ) {
      handleFilterMarkerClicks(event.target);
    }
  });

  document.querySelector('#clientTable').addEventListener('change', function(event){
    // логіка пташок для елементів таблиці
    if ( event.target.getAttribute('type') == 'checkbox'
        && (event.target.closest('.wjs-dbtable__body-cell_checkbox')
            || event.target.closest('.wjs-dbtable__header-cell_checkbox') ) ) {
      handleDBCheckboxes('clientTable', event.target);
    }

    // логіка пташок для фільтрів
    if ( event.target.getAttribute('type') == 'checkbox'
        && event.target.closest('.wjs-dbtable__filters-list-item') ) {
      handleFiltersCheckboxes('clientTable', event.target);
    }
  });

  document.querySelector('#clientTable').addEventListener('keydown', function(event){
    // контроль максимально допустимої сторінки
    if ( event.target.closest('.wjs-dbtable__go-to-page-wrapper') ) {
      let maxValue     = +event.target.dataset.maxValue,
          currentValue = +(event.target.value + event.key);

      if ( maxValue < currentValue) {
        event.target.value = maxValue;
        event.preventDefault();
      }
    }

    if ( event.key.toLowerCase() == 'enter' ) {
      goToPage(event.target);
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

    // tableId = {
    //   h: [      //  headers: [
    //     {       //    {
    //       n: "" //      name     : "id",
    //       b: [] //      buttons  : ["search", "close", "sort"],
    //       s: "" //      source   : "id",
    //       d: "" //      display  : true
    //       v: [] //      values   : ["status1", "satus2", ...]
    //     }       //    }
    //   ],        //  ],
    //   cc: []    //  checkedCheckboxes : [1,2,3 ... n]
    //   cf: {}    //  closedFilters : { filterGroup1: [filterName1, ...], ...}
    // };

    let tableObj = JSON.parse( localStorage.getItem(tableId) ) || {};

    if ( !('h' in tableObj) ) tableObj.h = [];
    if ( !('cc' in tableObj) ) tableObj.cc = [];
    if ( !('cf' in tableObj) ) tableObj.cf = {};

    localStorage.setItem( tableId, JSON.stringify(tableObj) );
  }

  /**
   * [handleTableBody функція-колбек на запит бази даних]
   * @param  {[String]} arg [база даних]
   */
  function handleTableBody(arg, tableId) {
    showLoader('clientTable', 'обработка данных ...');
    db[tableId] = JSON.parse(arg);

    buildTableBody(tableId, db[tableId]);
    collectFilters(tableId, db[tableId]);
    // при синхронному виклику normalizeTableMeasurements(arg) дає осічку до 40%:
    // шапка і колонки отримують різну ширину. Я не знаю, чому. Можливо через те,
    // що рушій не встигає відмалювати сторінку до порівняння. setTimeout - це
    // милиця. Треба продумати, як її позбутися. Проміси?
    setTimeout(function(){
      normalizeTableMeasurements('clientTable');
    },1000);
  }

  /**
   * [normalizeTableMeasurements нормалізує зовнішній вигляд таблиці: підганяє
   * розміри, додає полоси прокрутки]
   * @param  {[String]} tableId [ідентифікатор таблиці]
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

    let tableElement        = document.getElementById(tableId),
        outerContainer      = tableElement.querySelector('.wjs-dbtable__table-wrapper'),
        outerScrollContent  = tableElement.querySelector('.wjs-dbtable__table-wrapper .wjs-scroll__content'),
        innerContainer      = tableElement.querySelector('.wjs-scroll__content-wrapper .wjs-scroll'),
        innerScrollContent  = tableElement.querySelector('.wjs-scroll__content-wrapper .wjs-scroll .wjs-scroll__content'),
        table               = tableElement.querySelector('.wjs-dbtable__table'),
        theader             = tableElement.querySelector('.wjs-dbtable__theader'),
        hCells              = tableElement.querySelectorAll('.wjs-dbtable__header-cell'),
        tbody               = tableElement.querySelector('.wjs-dbtable__tbody'),
        bCells              = tableElement.querySelectorAll('.wjs-dbtable__body-cell');

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
      // скидаємо розміри (це потрібно при зменшенні ширини таблиці, якщо закрити
      // колонку)

      theader.style.width            = outerContainer.clientWidth + 'px';
      tbody.style.width              = outerContainer.clientWidth + 'px';
      table.style.width              = outerContainer.clientWidth + 'px';
      outerScrollContent.style.width = outerContainer.clientWidth + 'px';
      innerContainer.style.width     = outerContainer.clientWidth + 'px';

      // зрівнюємо ширини чарунок тіла таблиці і чарунок шапки
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
        innerContainer.style.width     = countWidth + 'px';
      }
    /* ↑↑↑ table cells width ↑↑↑ */

    /* ↓↓↓ left scroll review ↓↓↓ */
      // це щоб при лівому скролі закриття останньої колонки на утворювало пустоту
      let maxScrollLeft = outerScrollContent.offsetWidth - outerContainer.clientWidth;
      if (outerScrollContent.scrollLeft > maxScrollLeft) {
        outerScrollContent.scrollLeft = maxScrollLeft;
      }
    /* ↑↑↑ left scroll review ↑↑↑ */

    wSetScroll( document.querySelector('#' + tableId + ' .wjs-dbtable__table-wrapper.wjs-scroll'), {bottom:true,overvlowYHidden:true});

    // це для прибирання нижнього скролу, якщо після закриття колонки таблиця
    // повністю вписується в сторінку. Логічніше було б використовувати порівняння
    // (outerScrollContent.scrollWidth > outerScrollContent.clientWidth), але тут
    // є підводний камінь: при зменшенні розмірів елементу його scrollWidth не
    // зменшується. Ігри з overflow: auto/hidden не допомагають.
    if ( outerContainer.clientWidth == +table.clientWidth
      && tableElement.querySelector('.wjs-scroll__wrapper_bottom') ) {
      document.querySelector('#' + tableId + ' .wjs-scroll__wrapper_bottom').remove();
    }

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

      innerScrollContent.style.height = height + 'px';
      innerScrollContent.style.width = innerContainer.clientWidth + 'px';
    /* ↑↑↑ innerContainer height&width ↑↑↑ */

    wSetScroll( document.querySelector('#' + tableId + ' .wjs-scroll__content-wrapper .wjs-scroll'), {right:true,overvlowXHidden:true});

    /* ↓↓↓ right scroll positioning ↓↓↓ */
      let scrollWrapperRight = tableElement.querySelector('.wjs-scroll__wrapper_right');
      if(scrollWrapperRight) {

        scrollWrapperRight.style.left = outerContainer.clientWidth
                                        + outerScrollContent.scrollLeft
                                        - scrollWrapperRight.offsetWidth
                                        + 'px';

        let line          = scrollWrapperRight.querySelector('.wjs-scroll__line_right'),
            lineHeight    = line.clientHeight,
            thumb         = scrollWrapperRight.querySelector('.wjs-scroll__thumb_right'),
            thumbHeight   = thumb.offsetHeight,
            maxAviableTop = lineHeight - thumbHeight,
            top           = +getComputedStyle(thumb).top.slice(0,-2);

        if (top > maxAviableTop) {
          thumb.style.top = maxAviableTop + 'px';
        }

        outerContainer.querySelector('.wjs-scroll__content').addEventListener('scroll', foo);
        function foo(event) {
          scrollWrapperRight.style.left = outerContainer.clientWidth
                                          - scrollWrapperRight.offsetWidth
                                          + event.target.scrollLeft
                                          + 'px';
        }
      }
    /* ↑↑↑ right scroll positioning ↑↑↑ */

    setTimeout(function(){
      hideLoader(tableId);
    },1000);
  }

  /**
   * [buildTableHeader відповідає за динамічну побудову шапки таблиці]
   * @param  {[String]} tableId [ідентифікатор таблиці]
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

    // підсвічування типу сортування
    let activeHeaderCell = theader.querySelector('.wjs-dbtable__header-cell[data-source="id"]'),
        activeSortButton = activeHeaderCell.querySelector('.wjs-dbtable__btn_sort');
    activeSortButton.classList.add('wjs-dbtable__btn_sort_active_down');

    highlightMenuBtns(tableId);
  }

  /**
   * [buildTableBody відповідає за динамічну побудову тіла таблиці]
   * @param  {[String]} tableId     [ідентифікатор таблиці]
   * @param  {[Array ]} data        [дані, з яких будується таблиця]
   * @param  {[Number]} startValue  [порядковий номер запису в базі даних, з
   * якого починається побудова таблиці]
   * @param  {[Number]} itemsAmount [кількість відображуваних елементів на одній
   * сторінці]
   */
  function buildTableBody (tableId, data, startValue, itemsAmount) {

    let headerData  = JSON.parse( localStorage.getItem(tableId) ).h,
        tableData = data,
        tableBody   = document.querySelector('#' + tableId + ' .wjs-dbtable__tbody'),
        tableHeader = document.querySelector('#' + tableId + ' .wjs-dbtable__theader'),
        start       = startValue || 0,
        end         = start + +itemsAmount || 100,
        activePage  = start / +itemsAmount || 0;

    document.querySelector('.wjs-dbtable__items-amount').innerHTML = tableData.length;
    buildPagination(tableId, tableData.length, itemsAmount, activePage);

    tableBody.innerHTML = '';

    let order = [];
    for (let item of headerData) {
      if (!item.d) continue;
     order.push(item.s);
    }

    tableHeader.style.gridTemplateColumns = 'repeat(' + (order.length - 1) + ', auto) 1fr';
    tableBody.style.gridTemplateColumns = 'repeat(' + (order.length - 1) + ', auto) 1fr';

    for (let i = start; i < end; i++) {
      let item = '';
      let styleClass = 'w-bgc-aliceblue';
      if ( i%2 == 0 ) {
        styleClass = '';
      }

      if (!tableData[i]) break;

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

          case 'money':
            item = item + '<div class="wjs-dbtable__body-cell w-monotype w-tar ' + styleClass + '" data-source="' + order[j] + '">' + tableData[i][order[j]] + '</div>';
            break

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
    handleDBCheckboxes(tableId);
  }

  /**
   * [buildPagination вибудовує кнопки сторінок для таблиці]
   * @param  {[String]} tableId    [ідентифікатор таблиці]
   * @param  {[Number]} total      [кількість записів в базі даних]
   * @param  {[Number]} perPage    [кількість записів на одну сторінку]
   * @param  {[Number]} activePage [активна сторінка]
   */
  function buildPagination(tableId, total, perPage = 100, activePage) {
    let paginationWrapper = document.querySelector('#' + tableId + ' .wjs-dbtable__pagination-wrapper');

    paginationWrapper.innerHTML = '';

    let pagesAmount = Math.ceil(total/perPage);

    if (pagesAmount <= 7) {
      for (let i = 1; i < pagesAmount+1; i++) {
        let pageButton;
        if (i == activePage + 1) {
          pageButton = '\
                        <button class="wjs-dbtable__page-btn wjs-dbtable__page-btn_active"\
                                data-paginationstart="' + (i-1) + '"\
                                data-paginationperpage="' + perPage + '">'
                                 + i
                                 + '</button>\
                       ';
        } else {
          pageButton = '\
                        <button class="wjs-dbtable__page-btn"\
                                data-paginationstart="' + (i-1) + '"\
                                data-paginationperpage="' + perPage + '">'
                                 + i
                                 + '</button>\
                       ';
        }

        paginationWrapper.insertAdjacentHTML('beforeEnd', pageButton);
      }
    } else {
      let btnsStr = '';
      if (activePage == 0) {
        // самий початок
        btnsStr = '<button class="wjs-dbtable__page-btn"\
                           data-paginationstart="0"\
                           data-paginationperpage="' + perPage + '">1</button>\
                   <button class="wjs-dbtable__page-btn wjs-dbtable__page-btn_dotts">...</button>\
                   <button class="wjs-dbtable__page-btn wjs-dbtable__page-btn_passive"\
                           data-paginationstart="' +  (activePage-1) + '"\
                           data-paginationperpage="' + perPage + '">-<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 512"><path d="M192 127.338v257.324c0 17.818-21.543 26.741-34.142 14.142L29.196 270.142c-7.81-7.81-7.81-20.474 0-28.284l128.662-128.662c12.599-12.6 34.142-3.676 34.142 14.142z"/></svg></button>\
                   <button class="wjs-dbtable__page-btn wjs-dbtable__page-btn_disabled"\
                           data-paginationstart="' +  (activePage-1) + '"\
                           data-paginationperpage="' + perPage + '">' + activePage + '</button>\
                   <button class="wjs-dbtable__page-btn wjs-dbtable__page-btn_active"\
                           data-paginationstart="' +  activePage + '"\
                           data-paginationperpage="' + perPage + '">' + (activePage+1) + '</button>\
                   <button class="wjs-dbtable__page-btn"\
                           data-paginationstart="' +  (activePage+1) + '"\
                           data-paginationperpage="' + perPage + '">' + (activePage+2) + '</button>\
                   <button class="wjs-dbtable__page-btn"\
                           data-paginationstart="' +  (activePage+1) + '"\
                           data-paginationperpage="' + perPage + '">-<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 512"><path d="M0 384.662V127.338c0-17.818 21.543-26.741 34.142-14.142l128.662 128.662c7.81 7.81 7.81 20.474 0 28.284L34.142 398.804C21.543 411.404 0 402.48 0 384.662z"/></svg></button>\
                   <button class="wjs-dbtable__page-btn wjs-dbtable__page-btn_dotts">...</button>\
                   <button class="wjs-dbtable__page-btn"\
                           data-paginationstart="' + (pagesAmount-1) + '"\
                           data-paginationperpage="' + perPage + '">' + pagesAmount + '</button>\
                   <div class="wjs-dbtable__go-to-page-wrapper">\
                     <input class="wjs-dbtable__go-to-page-input" type="text" data-max-value="' + pagesAmount + '" onkeydown="return checkNumber(event.key)">\
                     <button class="wjs-dbtable__go-to-page-btn">\
                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M500.5 231.4l-192-160C287.9 54.3 256 68.6 256 96v320c0 27.4 31.9 41.8 52.5 24.6l192-160c15.3-12.8 15.3-36.4 0-49.2zm-256 0l-192-160C31.9 54.3 0 68.6 0 96v320c0 27.4 31.9 41.8 52.5 24.6l192-160c15.3-12.8 15.3-36.4 0-49.2z"/></svg>\
                     </button>\
                   </div>\
                  ';
      } else if (activePage == pagesAmount-1) {
        // самий кінець
        btnsStr = '<button class="wjs-dbtable__page-btn"\
                           data-paginationstart="0"\
                           data-paginationperpage="' + perPage + '">1</button>\
                   <button class="wjs-dbtable__page-btn wjs-dbtable__page-btn_dotts">...</button>\
                   <button class="wjs-dbtable__page-btn"\
                           data-paginationstart="' +  (activePage-1) + '"\
                           data-paginationperpage="' + perPage + '">-<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 512"><path d="M192 127.338v257.324c0 17.818-21.543 26.741-34.142 14.142L29.196 270.142c-7.81-7.81-7.81-20.474 0-28.284l128.662-128.662c12.599-12.6 34.142-3.676 34.142 14.142z"/></svg></button>\
                   <button class="wjs-dbtable__page-btn"\
                           data-paginationstart="' +  (activePage-1) + '"\
                           data-paginationperpage="' + perPage + '">' + activePage + '</button>\
                   <button class="wjs-dbtable__page-btn wjs-dbtable__page-btn_active"\
                           data-paginationstart="' +  activePage + '"\
                           data-paginationperpage="' + perPage + '">' + (activePage+1) + '</button>\
                   <button class="wjs-dbtable__page-btn  wjs-dbtable__page-btn_disabled"\
                           data-paginationstart="' +  (activePage+1) + '"\
                           data-paginationperpage="' + perPage + '">' + (activePage+2) + '</button>\
                   <button class="wjs-dbtable__page-btn wjs-dbtable__page-btn_passive"\
                           data-paginationstart="' +  (activePage+1) + '"\
                           data-paginationperpage="' + perPage + '">-<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 512"><path d="M0 384.662V127.338c0-17.818 21.543-26.741 34.142-14.142l128.662 128.662c7.81 7.81 7.81 20.474 0 28.284L34.142 398.804C21.543 411.404 0 402.48 0 384.662z"/></svg></button>\
                   <button class="wjs-dbtable__page-btn wjs-dbtable__page-btn_dotts">...</button>\
                   <button class="wjs-dbtable__page-btn"\
                           data-paginationstart="' + (pagesAmount-1) + '"\
                           data-paginationperpage="' + perPage + '">' + pagesAmount + '</button>\
                   <div class="wjs-dbtable__go-to-page-wrapper">\
                     <input class="wjs-dbtable__go-to-page-input" type="text" data-max-value="' + pagesAmount + '" onkeydown="return checkNumber(event.key)">\
                     <button class="wjs-dbtable__go-to-page-btn">\
                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M500.5 231.4l-192-160C287.9 54.3 256 68.6 256 96v320c0 27.4 31.9 41.8 52.5 24.6l192-160c15.3-12.8 15.3-36.4 0-49.2zm-256 0l-192-160C31.9 54.3 0 68.6 0 96v320c0 27.4 31.9 41.8 52.5 24.6l192-160c15.3-12.8 15.3-36.4 0-49.2z"/></svg>\
                     </button>\
                   </div>\
                  ';
      } else {
        // по середині
        btnsStr = '<button class="wjs-dbtable__page-btn"\
                           data-paginationstart="0"\
                           data-paginationperpage="' + perPage + '">1</button>\
                   <button class="wjs-dbtable__page-btn wjs-dbtable__page-btn_dotts">...</button>\
                   <button class="wjs-dbtable__page-btn"\
                           data-paginationstart="' +  (activePage-1) + '"\
                           data-paginationperpage="' + perPage + '">-<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 512"><path d="M192 127.338v257.324c0 17.818-21.543 26.741-34.142 14.142L29.196 270.142c-7.81-7.81-7.81-20.474 0-28.284l128.662-128.662c12.599-12.6 34.142-3.676 34.142 14.142z"/></svg></button>\
                   <button class="wjs-dbtable__page-btn"\
                           data-paginationstart="' +  (activePage-1) + '"\
                           data-paginationperpage="' + perPage + '">' + activePage + '</button>\
                   <button class="wjs-dbtable__page-btn wjs-dbtable__page-btn_active"\
                           data-paginationstart="' +  activePage + '"\
                           data-paginationperpage="' + perPage + '">' + (activePage+1) + '</button>\
                   <button class="wjs-dbtable__page-btn"\
                           data-paginationstart="' +  (activePage+1) + '"\
                           data-paginationperpage="' + perPage + '">' + (activePage+2) + '</button>\
                   <button class="wjs-dbtable__page-btn"\
                           data-paginationstart="' +  (activePage+1) + '"\
                           data-paginationperpage="' + perPage + '"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 512"><path d="M0 384.662V127.338c0-17.818 21.543-26.741 34.142-14.142l128.662 128.662c7.81 7.81 7.81 20.474 0 28.284L34.142 398.804C21.543 411.404 0 402.48 0 384.662z"/></svg></button>\
                   <button class="wjs-dbtable__page-btn wjs-dbtable__page-btn_dotts">...</button>\
                   <button class="wjs-dbtable__page-btn"\
                           data-paginationstart="' + (pagesAmount-1) + '"\
                           data-paginationperpage="' + perPage + '">' + pagesAmount + '</button>\
                   <div class="wjs-dbtable__go-to-page-wrapper">\
                     <input class="wjs-dbtable__go-to-page-input" type="text" data-max-value="' + pagesAmount + '" onkeydown="return checkNumber(event.key)">\
                     <button class="wjs-dbtable__go-to-page-btn">\
                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M500.5 231.4l-192-160C287.9 54.3 256 68.6 256 96v320c0 27.4 31.9 41.8 52.5 24.6l192-160c15.3-12.8 15.3-36.4 0-49.2zm-256 0l-192-160C31.9 54.3 0 68.6 0 96v320c0 27.4 31.9 41.8 52.5 24.6l192-160c15.3-12.8 15.3-36.4 0-49.2z"/></svg>\
                     </button>\
                   </div>\
                  ';
      }
      paginationWrapper.insertAdjacentHTML('beforeEnd', btnsStr);
    }
  }

  /**
   * [goToPage перехід до певної сторінки]
   * @param  {[DOM-елемент]} target [елемент, на якому спрацювала подія]
   */
  function goToPage(target) {
    let tableId     = event.target.closest('.wjs-dbtable').getAttribute('id'),
        data        = db[tableId],
        btn         = document.querySelector('#' + tableId + ' .wjs-dbtable__page-btn[data-paginationperpage]'),
        itemsAmount = btn.dataset.paginationperpage,
        inputValue  = event.target.closest('.wjs-dbtable__go-to-page-wrapper').querySelector('.wjs-dbtable__go-to-page-input').value;

    if (!+inputValue ) return;
    let startValue  = (inputValue-1)*itemsAmount;

    buildTableBody (tableId, data, startValue, itemsAmount);
    normalizeTableMeasurements(tableId);
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
    setTimeout(function(){
      normalizeTableMeasurements('clientTable');
    },100);
  }

  /**
   * [showDisabledColumnMarker показує маркер закритої колонки]
   * @param  {[String]} name    [назва колонки]
   * @param  {[String]} source  [як колонка назавається в бд(по цій змінній
   * відбувається зв'язка шапки і тіла таблиці) ]
   * @param  {[String]} tableId [ідентифікатор таблиці]
   */
  function showDisabledColumnMarker(name, source, tableId) {
    let markersWrapper      = document.querySelector('#' + tableId + ' .wjs-dbtable__discols-wrapper');
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
   * @param  {[String]} tableId [ідентифікатор таблиці]
   */
  function showDisabledColumnMarkerAtStartUp(tableId) {
    let tableData = JSON.parse( localStorage.getItem(tableId) );

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
        markersWrapper.style.display = 'none';
        markersWrapperLabel.style.display = 'none';
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
      buildTableBody('clientTable', db[tableId]);
      normalizeTableMeasurements('clientTable');
    },100);
  }

  /**
   * [showLoader показує тупілку]
   * @param  {[String]} tableId [ідентифікатор таблиці]
   * @param  {[type]}   text    [текст повідомлення]
   */
  function showLoader(tableId, text){
    let loader = document.querySelector('#' + tableId + ' .wjs-dbtable__loader');
    loader.querySelector('.wjs-dbtable__loader-info').innerHTML = text;
    loader.classList.add('wjs-dbtable__loader_active');
  }

  /**
   * [showLoader приховує тупілку]
   * @param  {[String]} tableId [ідентифікатор таблиці]
   */
  function hideLoader(tableId){
    document.querySelector('#' + tableId + ' .wjs-dbtable__loader').classList.remove('wjs-dbtable__loader_active');
  }

  /**
   * [handleDBCheckboxes обробка кліків по чекбоксах: візуалізація + запис в ls]
   * @param  {[String]}     tableId [ідентифікатор таблиці]
   * @param  {[DOM-Object]} checkbox [DOM-елемент (чекбокс)]
   * @return {[Array]}      [масив ідентифікаторів помічених чекбоксів]
   */
  function handleDBCheckboxes(tableId, checkbox) {
    let tableObj    = JSON.parse( localStorage.getItem(tableId) ),
        checkedArr  = tableObj.cc,
        tempSet     = new Set(checkedArr),
        checkboxArr = document.querySelector('#' + tableId).querySelectorAll('.wjs-dbtable__body-cell_checkbox input[type="checkbox"]');

    if (checkbox) {
      // виклик з двома аргументами (клік по чекбоксу)
      let id        = checkbox.getAttribute('id').slice(5).toLowerCase(),
          isChecked = checkbox.checked;

      if (id == 'all') {
        checkboxArr.forEach(function(item) {
          item.checked = isChecked;
          if (isChecked) {
            tempSet.add( item.getAttribute('id').slice(5).toLowerCase() );
          } else {
            tempSet.delete( item.getAttribute('id').slice(5).toLowerCase() );
          }
        });
      } else {
        if (isChecked) {
          tempSet.add( checkbox.getAttribute('id').slice(5).toLowerCase() );
        } else {
          tempSet.delete( checkbox.getAttribute('id').slice(5).toLowerCase() );
        }
      }

      checkedArr  = Array.from(tempSet);
      tableObj.cc = checkedArr;
      localStorage.setItem( tableId, JSON.stringify(tableObj) );
    } else {
      // виклик з одним аргументом (клік на іншу сторінку тощо)
      checkboxArr.forEach(function(item) {
        if (tempSet.has( item.getAttribute('id').slice(5).toLowerCase() ) ) {
          item.checked = true;
        }
      });
    }

    // якщо усі пташки на сторінці поставлені, то і головна пташка теж має бути
    let headerCheckbox = document.querySelector('#' + tableId + ' .wjs-dbtable__header-cell_checkbox input[type="checkbox"]');
    headerCheckbox.checked = true;
    for (let i = 0; i < checkboxArr.length; i++) {
      if ( !checkboxArr[i].checked ) {
        headerCheckbox.checked = false;
        break
      }
    }

    // показ кількості відмічених записів в мета-даних таблиці
    let label      = document.querySelector('.wjs-dbtable__label_selected'),
        labelValue = label.nextElementSibling;

        labelValue.innerHTML = tempSet.size;
    if (tempSet.size) {
      label.style.display = 'block';
      labelValue.style.display = 'block';
      labelValue.innerHTML = tempSet.size;
      normalizeTableMeasurements(tableId);
    }

    return checkedArr;
  }

  /**
   * [uncheckAllCheckboxes зняття пташок з усіх чекбоксів]
   * @param  {[DOM-Object]} btn [DOM-елемент (кнопка)]
   */
  function uncheckAllCheckboxes(btn) {
    let tableElement   = btn.closest('.wjs-dbtable'),
        tableId        = tableElement.getAttribute('id'),
        checkboxArr    = tableElement.querySelectorAll('.wjs-dbtable__body-cell_checkbox input[type="checkbox"]'),
        headerCheckbox = tableElement.querySelector('.wjs-dbtable__header-cell_checkbox input[type="checkbox"]');

    let tableObj   = JSON.parse( localStorage.getItem(tableId) );

    headerCheckbox.checked = false;
    checkboxArr.forEach( item => item.checked = false );

    tableObj.cc.length = 0;
    localStorage.setItem( tableId, JSON.stringify(tableObj) );

    let label = tableElement.querySelector('.wjs-dbtable__label_selected');
    label.style.display = 'none';
    label.nextElementSibling.style.display = 'none';
    normalizeTableMeasurements(tableId);
  }

  /**
   * [sortDB пересортування бази даних]
   * @param  {[DOM-Object]} btn [DOM-елемент (кнопка)]
   */
  function sortDB(btn) {
    let tableElement = btn.closest('.wjs-dbtable'),
        tableId      = tableElement.getAttribute('id'),
        sortBtns     = tableElement.querySelectorAll('.wjs-dbtable__header-cell .wjs-dbtable__btn_sort'),
        sortSource   = btn.closest('.wjs-dbtable__header-cell').dataset.source;
    let sortType;

    // visualisation
    if ( btn.classList.contains('wjs-dbtable__btn_sort_active_down') ) {
      btn.classList.remove('wjs-dbtable__btn_sort_active_down');
      btn.classList.add('wjs-dbtable__btn_sort_active_up');
      sortType = 'up';
    } else if ( btn.classList.contains('wjs-dbtable__btn_sort_active_up') ) {
      btn.classList.remove('wjs-dbtable__btn_sort_active_up');
      btn.classList.add('wjs-dbtable__btn_sort_active_down');
      sortType = 'down';
    } else if (!btn.classList.contains('wjs-dbtable__btn_sort_active_down')
               && !btn.classList.contains('wjs-dbtable__btn_sort_active_up')) {
      btn.classList.add('wjs-dbtable__btn_sort_active_down');
      sortType = 'down';
    }

    sortBtns.forEach( item => {
      if (item == btn) return;
      item.classList.remove('wjs-dbtable__btn_sort_active_down');
      item.classList.remove('wjs-dbtable__btn_sort_active_up');
    } );

    // sort
    if (sortType == 'down') {
      db[tableId].sort(function (a, b){
        if (a[sortSource] > b[sortSource]) return 1;
        if (a[sortSource] < b[sortSource]) return -1;
        if (a[sortSource] == b[sortSource]) return 0;
      });
    } else {
      db[tableId].sort(function (a, b){
        if (a[sortSource] > b[sortSource]) return -1;
        if (a[sortSource] < b[sortSource]) return 1;
        if (a[sortSource] == b[sortSource]) return 0;
      });
    }

    buildTableBody (tableId, db[tableId]);
    normalizeTableMeasurements('clientTable');
  }

  /**
   * [collectFilters перебирає базу даних, вишукуючи усі варіанти фільтрів, та
   * записує їх в ls]
   * @param  {[String]}   tableId [ідентифікатор таблиці]
   * @param  {[Array]} db [база даних]
   */
  function collectFilters(tableId, db) {
    let tableObj = JSON.parse( localStorage.getItem(tableId) );
    let headers = tableObj;

    for (let i = 0; i < headers.h.length; i++) {
      if ( headers.h[i].b && headers.h[i].b.includes('menu') ) {
        let source = headers.h[i].s;
        let tempSet = new Set();
        for (let i = 0; i < db.length; i++) {
          tempSet.add( db[i][source] );
        }
        headers.h[i].v = Array.from(tempSet);
      }
    }
    localStorage.setItem( tableId, JSON.stringify(tableObj) );
  }

  /**
   * [buildFiltersList будує список фільтрів для даної колонки]
   * @param {[DOM-Object]} btn [кнопка "меню" в чарунці шапки]
   */
  function buildFiltersList(btn) {

    let tableElement   = btn.closest('.wjs-dbtable'),
        tableId        = tableElement.getAttribute('id'),
        tHeaderCell    = btn.closest('.wjs-dbtable__header-cell'),
        innerContainer = tableElement.querySelector('.wjs-dbtable__table-wrapper .wjs-scroll__content-wrapper .wjs-scroll__content .wjs-dbtable__table .wjs-dbtable__theader + .wjs-scroll'),
        source         = tHeaderCell.dataset.source,
        tableObj       = JSON.parse( localStorage.getItem(tableId) ),
        headers        = tableObj.h;

    // закриття списку при подвійному кліку або іншого списку
    if ( tHeaderCell.querySelector('.wjs-dbtable__filters-list-wrapper') ) {
      closeFiltersList(tableId);
      return
    }
    if ( document.querySelector('.wjs-dbtable__filters-list-wrapper') ) {
      closeFiltersList(tableId);
    }

    for (let i = 0; i < headers.length; i++) {
      if (headers[i].s == source) {

        // початкова структура з елементом "позначити все"
        let html = '<div class="wjs-dbtable__filters-list-wrapper wjs-scroll">\
                      <div class="wjs-scroll__content-wrapper">\
                        <div class="wjs-scroll__content">\
                          <ul class="wjs-dbtable__filters-list">\
                            <li class="wjs-dbtable__filters-list-item">\
                                <input type="checkbox" id="' + tableId + '-' + source + '-filterchbox-All">\
                                <label for="' + tableId + '-' + source + '-filterchbox-All">\
                                  <span>Все</span>\
                                </label>\
                              </label>\
                            </li>\
                          </ul>\
                        </div>\
                      </div>\
                    </div>\
                   ';
        tHeaderCell.insertAdjacentHTML('beforeEnd', html);

        // заповнення структури рештою елементів з фільтрами
        let tempHeadersArr = headers[i].v.sort();
        let list = tHeaderCell.querySelector('.wjs-dbtable__filters-list');
        for (let i = 0; i < tempHeadersArr.length; i++ ) {
          let html = '\
                      <li class="wjs-dbtable__filters-list-item">\
                          <input type="checkbox" id="' + tableId + '-' + source + '-filterchbox-' + tempHeadersArr[i] + '">\
                          <label for="' + tableId + '-' + source + '-filterchbox-' + tempHeadersArr[i] + '">\
                            <span>' + tempHeadersArr[i] + '</span>\
                          </label>\
                        </label>\
                      </li>\
                     ';
          list.insertAdjacentHTML('beforeEnd', html);
        }

        // встановлення чіткої висоти списку (потрібно для кастомного скролу)
        let filtersListWrapper = tHeaderCell.querySelector('.wjs-dbtable__filters-list-wrapper.wjs-scroll'),
            filtersList        = tHeaderCell.querySelector('.wjs-dbtable__filters-list'),
            currentHeight      = filtersList.offsetHeight,
            maxAviableHeight   = innerContainer.clientHeight;

        if (currentHeight > maxAviableHeight) {
          filtersListWrapper.style.height = maxAviableHeight + 'px';
        } else {
          filtersListWrapper.style.height = currentHeight + 2 + 'px';
        }

        // кастомний скрол
        wSetScroll(filtersListWrapper, {right:true, overflowXHidden:true})

        break
      }
    }

    // перевірка включених/виключених фільтрів, побудова відбитку фільтрів
    fingerprint = '';
    let filterInputsArr = tHeaderCell.querySelectorAll('.wjs-dbtable__filters-list-wrapper input');
    for (let i = 0; i < filterInputsArr.length; i++) {
      if ( !tableObj.cf[source] || !tableObj.cf[source].includes( getFilterId(filterInputsArr[i]) ) ) {
        filterInputsArr[i].checked = true;
        fingerprint += 1;
      } else {
        filterInputsArr[0].checked = false;
        filterInputsArr[i].checked = false;
        fingerprint += 0;
      }
    }

    if (!filterInputsArr[0].checked) {
      fingerprint = '0' + fingerprint.slice(1);
    }
  }

  /**
   * [closeFiltersList закриття списку фільтрів]
   */
  function closeFiltersList(tableId) {

    // порівняння відбитків, за потреби - запуск функції фільтрування БД та
    // перебудови таблиці
    let fingerprintForCompare = '';
    let filterInputsArr = document.querySelectorAll('#' + tableId + ' .wjs-dbtable__filters-list-wrapper input');
    filterInputsArr.forEach( item => {
      if (item.checked) {
        fingerprintForCompare += 1;
      } else {
        fingerprintForCompare += 0;
      }
    });

    if (fingerprint != fingerprintForCompare) {
      filterDB(tableId);
    }

    // закрити усі списки фільтрів в усіх таблицях
    if ( document.querySelector('.wjs-dbtable__filters-list-wrapper') ) {
      let list = document.querySelectorAll('.wjs-dbtable__filters-list-wrapper');
      list.forEach( item => item.remove() );
    }
  }

  /**
   * [handleFiltersCheckboxes обробка кліків по чекбоксах, запис фільтрів у LS]
   * @param  {[String]}     tableId  [ідентифікатор таблиці]
   * @param  {[DOM-Object]} checkbox [чекбокс зі списку фільтрів]
   */
  function handleFiltersCheckboxes(tableId, checkbox) {
    let tableElement = checkbox.closest('.wjs-dbtable'),
        checkboxId   = checkbox.getAttribute('id'),
        checkboxArr  = checkbox.closest('.wjs-dbtable__filters-list')
                               .querySelectorAll('.wjs-dbtable__filters-list-item input[type="checkbox"]'),
        isChecked    = checkbox.checked,
        tHeaderCell  = checkbox.closest('.wjs-dbtable__header-cell'),
        menuButton   = tHeaderCell.querySelector('.wjs-dbtable__btn_options'),
        filterGroup  = tHeaderCell.dataset.source,
        filterName   = checkboxId.slice( (checkboxId.match('-filterchbox-').index + 13) ),
        tableObj     = JSON.parse( localStorage.getItem(tableId) );

    let tempSet;
    if ( tableObj.cf[filterGroup] ) {
      tempSet = new Set(tableObj.cf[filterGroup]);
    } else {
      tempSet = new Set();
    }

    if (checkboxId.endsWith('-filterchbox-All')) {
      checkboxArr.forEach( item => {
        item.checked = isChecked;
      });
      if (isChecked) {
        tempSet.clear();
        deleteAllFilterMarkers(tableId, filterGroup);
      } else {
        checkboxArr.forEach( item => {
          if ( getFilterId(item) == 'All' ) {
            return;
          } else {
            tempSet.add( getFilterId(item) );
          }
        } );
        addAllFilterMarkers(tableId, filterGroup);
      }
    } else {
      if (isChecked) {
        tempSet.delete(filterName);
        deleteFilterMarker(tableId, filterGroup, filterName);
      } else {
        tempSet.add(filterName);
        addFilterMarker(tableId, filterGroup, filterName);
      }
    }
    tableObj.cf[filterGroup] = Array.from(tempSet);
    localStorage.setItem( tableId, JSON.stringify(tableObj) );

    // якщо усе відмічено - поставити головну пташку на "все" та прибрати
    // підсвітку кнопки меню
    checkboxArr[0].checked = true;
    menuButton.classList.remove('wjs-dbtable__btn_options_active');
    for (let i = 1; i < checkboxArr.length; i++) {
      if (!checkboxArr[i].checked) {
        checkboxArr[0].checked = false;
        menuButton.classList.add('wjs-dbtable__btn_options_active');
        break
      }
    }
  }

  /**
   * [getFilterId шукає повний id фільтра і обрізає його до потрібного стану]
   * @param  {[DOM-Object]} checkbox [чекбокс зі списку фільтрів]
   * @return {[String]}              [id чекбокса]
   */
  function getFilterId(checkbox) {
    return checkbox.getAttribute('id').slice( (checkbox.getAttribute('id').match('-filterchbox-').index + 13) )
  }

  /**
   * [addFilterMarker додавання одиничного маркера фільтру]
   * @param {[String]} tableId [ідентифікатор таблиці]
   * @param {[String]} filterGroup [назва групи фільтрів]
   * @param {[String]} filterName  [назва конкретного фільтру]
   */
  function addFilterMarker(tableId, filterGroup, filterName) {
    let filtersWrapper      = document.querySelector('#' + tableId + ' .wjs-dbtable__filters-wrapper'),
        filtersWrapperLabel = filtersWrapper.previousElementSibling,
        tableObj          = JSON.parse( localStorage.getItem(tableId) );

    let groupName;
    for (let i = 0; i < tableObj.h.length; i++) {
      if ( tableObj.h[i].s == filterGroup ) {
        groupName = tableObj.h[i].n;
        break
      }
    }

    let html = '\
            <div class="wjs-dbtable__filter-item" data-filtergroup="' + filterGroup + '" data-filtername="' + filterName + '">\
              <span>' + groupName + ': ' + filterName + '</span>\
              <button type="button" class="wjs-dbtable__filter-close-btn"></buton>\
            </div>\
    ';

    filtersWrapper.style.display = 'flex';
    filtersWrapperLabel.style.display = 'block';
    filtersWrapper.insertAdjacentHTML('beforeEnd', html);

    let allCloseMarker = document.querySelector('#' + tableId + ' .wjs-dbtable__filter-item[data-role="closeAll"]');
    if (!allCloseMarker) {
      let html = '\
              <div class="wjs-dbtable__filter-item" data-role="closeAll">\
                <span style="text-decoration:none">reset all filters</span>\
                <button type="button" class="wjs-dbtable__filter-close-btn"></buton>\
              </div>\
      ';
      filtersWrapper.insertAdjacentHTML('afterBegin', html);
    }
  }

  /**
   * [deleteFilterMarker видалення одиничного маркера фільтру]
   * @param {[String]} tableId [ідентифікатор таблиці]
   * @param {[String]} filterGroup [назва групи фільтрів]
   * @param {[String]} filterName  [назва конкретного фільтру]
   */
  function deleteFilterMarker(tableId, filterGroup, filterName) {
    let tableElement        = document.getElementById(tableId),
        filtersWrapper      = tableElement.querySelector('.wjs-dbtable__filters-wrapper'),
        filtersWrapperLabel = filtersWrapper.previousElementSibling;

    let markers = tableElement.querySelectorAll('.wjs-dbtable__filter-item');
    if (markers.length == 2) {
      filtersWrapper.innerHTML = '';
      filtersWrapper.style.display = 'none';
      filtersWrapperLabel.style.display = 'none';
    } else {
      tableElement.querySelector('.wjs-dbtable__filter-item' +
                                  '[data-filtergroup="' + filterGroup + '"]' +
                                  '[data-filtername="' + filterName + '"]')
                  .remove();
    }
  }

  /**
   * [addAllFilterMarkers додає групу фільтрів (при натисненні на "Все")]
   * @param {[String]} tableId [ідентифікатор таблиці]
   * @param {[String]} filterGroup [назва групи фільтрів]
   */
  function addAllFilterMarkers(tableId, filterGroup) {
    let tableElement        = document.getElementById(tableId),
        filtersWrapper      = tableElement.querySelector('.wjs-dbtable__filters-wrapper'),
        filtersWrapperLabel = filtersWrapper.previousElementSibling,
        tableObj            = JSON.parse( localStorage.getItem(tableId) );

    for (let i = 0; i < tableObj.h.length; i++) {
      if (tableObj.h[i].s == filterGroup) {
        tableObj.h[i].v.forEach( item => {
          addFilterMarker(tableId, filterGroup, item);
        } );
      }
    }
  }

  /**
   * [deleteAllFilterMarkers видаляє групу фільтрів (при натисненні на "Все")]
   * @param {[String]} tableId [ідентифікатор таблиці]
   * @param {[String]} filterGroup [назва групи фільтрів]
   */
  function deleteAllFilterMarkers(tableId, filterGroup) {
    let tableElement        = document.getElementById(tableId),
        markers             = tableElement.querySelectorAll('.wjs-dbtable__filter-item[data-filtergroup="' + filterGroup + '"]'),
        filtersWrapper      = tableElement.querySelector('.wjs-dbtable__filters-wrapper'),
        filtersWrapperLabel = filtersWrapper.previousElementSibling;
    markers.forEach( item => item.remove() );

    markers = tableElement.querySelectorAll('.wjs-dbtable__filter-item');
    if (markers.length == 1) {
      filtersWrapper.innerHTML = '';
      filtersWrapper.style.display = 'none';
      filtersWrapperLabel.style.display = 'none';
    }
  }

  /**
   * [addAllFilterMarkersAtStartUp додає включені фільтри на сторінку під час
   * завантаження]
   * @param {[String]} tableId [ідентифікатор таблиці]
   */
  function addAllFilterMarkersAtStartUp(tableId) {
    let tableData = JSON.parse( localStorage.getItem(tableId) );

    if (tableData.cf) {
      for (let key in tableData.cf) {
        if (tableData.cf[key].length) {
          tableData.cf[key].forEach( item => {
            if (item == 'All') return;
            addFilterMarker(tableId, key, item);
          });
        }
      }
    }
  }

  /**
   * [handleFilterMarkerClicks обробляє кліки на маркерах фільтрів (візуал та
   * запис в ls. Викликає функцію підсвітки кнопки меню)]
   * @param  {[type]} button [description]
   * @return {[type]}        [description]
   */
  function handleFilterMarkerClicks(button) {
    let tableElement        = button.closest('.wjs-dbtable'),
        tableId             = tableElement.getAttribute('id'),
        currentMarker       = button.closest('.wjs-dbtable__filter-item'),
        filtersWrapper      = tableElement.querySelector('.wjs-dbtable__filters-wrapper'),
        filtersWrapperLabel = filtersWrapper.previousElementSibling,
        tableObj            = JSON.parse( localStorage.getItem(tableId) );

    if ( currentMarker.dataset.role == 'closeAll' ) {
      filtersWrapper.innerHTML = '';
      filtersWrapper.style.display = 'none';
      filtersWrapperLabel.style.display = 'none';

      for (let key in tableObj.cf) {
        delete tableObj.cf[key];
      }
    } else {
      currentMarker.remove();

      let markers = tableElement.querySelectorAll('.wjs-dbtable__filter-item');
      if (markers.length == 1) {
        filtersWrapper.innerHTML = '';
        filtersWrapper.style.display = 'none';
        filtersWrapperLabel.style.display = 'none';
      }

      let filterGroup = currentMarker.dataset.filtergroup,
          filterName  = currentMarker.dataset.filtername,
          tempSet = new Set(tableObj.cf[filterGroup]);

      tempSet.delete(filterName);
      tableObj.cf[filterGroup] = Array.from(tempSet);
    }
    localStorage.setItem( tableId, JSON.stringify(tableObj) );
    highlightMenuBtns(tableId);
    filterDB(tableId);
  }

  /**
   * [highlightMenuBtns перевіряє наявність фільтів і відповідно до результату
   * підсвічує кнопки опцій у заголовках таблиці]
   * @param {[String]} tableId [ідентифікатор таблиці]
   */
  function highlightMenuBtns(tableId) {
    let tableElement = document.getElementById(tableId),
        tableObj     = JSON.parse( localStorage.getItem(tableId) );

    if( isObjectEmpty(tableObj.cf) ) {
      let tempBtnsArr = tableElement.querySelectorAll('.wjs-dbtable__btn_options_active');
      tempBtnsArr.forEach( item => item.classList.remove('wjs-dbtable__btn_options_active') );
    } else {
      for (let key in tableObj.cf) {
        let tHeaderCell  = tableElement.querySelector('.wjs-dbtable__header-cell[data-source="' + key + '"]');
        if (tableObj.cf[key].length) {
          tHeaderCell.querySelector('.wjs-dbtable__btn_options').classList.add('wjs-dbtable__btn_options_active');
        } else {
          tHeaderCell.querySelector('.wjs-dbtable__btn_options').classList.remove('wjs-dbtable__btn_options_active');
        }
      }
    }
  }

  function filterDB(tableId) {
    console.log("filter", tableId);

    let filters = JSON.parse( localStorage.getItem(tableId) ).cf;

    db[tableId + 'Filtered'] = [];

    db[tableId].forEach( item => {
      for (let key in filters) {
        if( filters[key].includes(item[key]) ) {
          break
        }
        db[tableId + 'Filtered'].push(item);
      }
    });
    console.log("розмір відфільтрованої бази даних", db[tableId + 'Filtered'].length);
    buildTableBody (tableId, db[tableId + 'Filtered']);


    // tableObj.cf
    // {
    //   "status": [
    //     "Charge Backs",
    //     "No answer3",
    //     "No answer1",
    //     "Мусор Ретена",
    //     "Замена"
    //   ],
    //   "networkStatus": [
    //     "offline"
    //   ],
    //   "company": [
    //     "Im_JETsignals",
    //     "OneStep2",
    //     "ORI",
    //     "J-Signals"
    //   ],
    //   "brokerTeam": [
    //     "RetTeam_2"
    //   ]
    // }

    // db item
    // {
    //   "checkbox": true,
    //   "id": 1,
    //   "clientName": "Chas Jarrette",
    //   "networkStatus": "offline",
    //   "status": "Refund",
    //   "specStatus": "sstatus2",
    //   "phone": 96090456784,
    //   "email": "chas.jarrette@pharyngoscopy.net",
    //   "company": "EU_ALL",
    //   "platform": "CFD",
    //   "verification": "частичная верификация",
    //   "country": "Lesotho",
    //   "language": "русский",
    //   "currency": "RUB",
    //   "money": 28793,
    //   "deposits": "с депозитами",
    //   "activity": "не активен",
    //   "isTradeAble": "доступна",
    //   "accountType": "VIP",
    //   "lastNote": "Lorem ipsum dolor sit amet consectetur adipisicing elit. Mollitia quaerat voluptatum nisi sapiente veritatis quam sunt pariatur at, quidem, officiis.",
    //   "dateRegistration": 1527742456616,
    //   "lastActivity": 1553858222889,
    //   "dateLastNote": 1572020263094,
    //   "broker": "Diana Gornaya",
    //   "brokerPosition": "retention",
    //   "brokerTeam": "RetTeam_2"
    // }


  }
/* ↑↑↑ functions declaration ↑↑↑ */
////////////////////////////////////////////////////////////////////////////////