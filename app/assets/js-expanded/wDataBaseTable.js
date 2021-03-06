
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
  let db = {}; // db[tableId] - база даних конкретної таблиці є властивістю об'єкта

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

    document.querySelector('#clientTable .wjs-dbtable__big-search-input').value = '';

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

      let table       = event.target.closest('.wjs-dbtable'),
          tableId     = table.getAttribute('id'),
          data        = db[tableId],
          dataLength  = data.length,
          btn         = event.target.closest('.wjs-dbtable__page-btn'),
          itemsAmount = btn.dataset.paginationperpage,
          startValue  = btn.dataset.paginationstart*itemsAmount;

      // якщо включені фільтри
      if ( +(table.querySelector('.wjs-dbtable__filtered-amount').innerHTML) ) {
        data = filterDB(tableId);
      }

      // якщо включений пошук
      if ( +(table.querySelector('.wjs-dbtable__founded-amount').innerHTML) ) {
        let value = table.querySelector('.wjs-dbtable__big-search-input').dataset.value;
        data = formDBAfterSearching(tableId, value);
      }

      buildTableBody ({tableId, data, startValue, itemsAmount, dataLength});
      normalizeTableMeasurements(tableId);
    }
    // pagination 2
    if ( event.target.closest('.wjs-dbtable__go-to-page-btn') ) {
      goToPage(event.target);
    }

    // зняти усі пташки
    if ( event.target.closest('.wjs-dbtable__uncheckAll_selected') ) {
      uncheckAllCheckboxes(event.target);
    }

    // скинути пошук
    if ( event.target.closest('.wjs-dbtable__uncheckAll_founded') ) {
      closeSearch(event.target);
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

    // show small search field
    if ( event.target.closest('.wjs-dbtable__btn_search') ) {
      openSmallSearchField(event.target)
    }

    // close small search field
    if ( document.querySelector('.wjs-dbtable__small-search-input')
         && !event.target.closest('.wjs-dbtable__small-search-input')
         && !event.target.closest('.wjs-dbtable__btn_search') ) {
      closeSmallSearchField('clientTable')
    }

    // reset settings
    if ( event.target.closest('.wjs-dbtable__resetLS') ) {
      resetLS(event.target);
    }

    // copy cell data to clipboard
    if ( event.target.closest('.wjs-dbtable__copy-btn') ) {
      copyDataToClipboard(event.target);
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

    if ( event.key.toLowerCase() == 'enter' && event.target.classList.contains('wjs-dbtable__go-to-page-input') ) {
      goToPage(event.target);
    }

  });

  document.querySelector('#clientTable').addEventListener('input', function(event){
    // пошук через інпут у заголовку таблиці
    if ( event.target.closest('.wjs-dbtable__small-search-input') ) {
      searchInDB(event);
    }

    // пошук через глобальне поле пошуку
    if ( event.target.closest('.wjs-dbtable__big-search-input') ) {
      searchInDB(event);
    }
  });

  document.querySelector('#clientTable').addEventListener('mousedown', function(event) {
    // change column width
    if ( event.target.closest('.wjs-dbtable__width-changer') ) {
      startChangeColumnWidth(event);
    }

    // drag'n'drop
    if ( !event.target.closest('.wjs-dbtable__width-changer')
         && !event.target.closest('.wjs-dbtable__small-search-input')
         && event.target.closest('.wjs-dbtable__header-cell') ) {
      startDragColumn(event);
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
    //   h: [       //  headers: [
    //     {        //    {
    //       n:  "" //      name           : "id",
    //       b:  [] //      buttons        : ["search", "close", "sort"],
    //       s:  "" //      source         : "id",
    //       d:  "" //      display        : true
    //       v:  [] //      values         : ["status1", "satus2", ...]
    //       mw: "" //      minWidth       : number
    //       iw: "" //      impotrantWidth : number
    //     }        //    }
    //   ],         //  ],
    //   cc: []     //  checkedCheckboxes : [1,2,3 ... n]
    //   cf: {}     //  closedFilters : { filterGroup1: [filterName1, ...], ...}
    // };

    let tableObj = JSON.parse( localStorage.getItem(tableId) ) || {};

    if ( !('h' in tableObj) ) tableObj.h = [];
    if ( !('cc' in tableObj) ) tableObj.cc = [];
    if ( !('cf' in tableObj) ) tableObj.cf = {};
    if ( !('s' in tableObj) ) tableObj.s = {};

    localStorage.setItem( tableId, JSON.stringify(tableObj) );
  }

  /**
   * [handleTableBody функція-колбек на запит бази даних]
   * @param  {[String]} arg [база даних]
   */
  function handleTableBody(arg, tableId) {
    showLoader('clientTable', 'обработка данных ...');
    db[tableId] = JSON.parse(arg);

    let data = db[tableId];
    if ( document.querySelector('.wjs-dbtable__filter-item') ) {
      data = filterDB(tableId);
      showFilteredItemsAnountAtStartUp(tableId);
    }

    buildTableBody({tableId, data: data, dataLength: db[tableId].length});
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
    //         .wjs-dbtable__inner-table-container.wjs-scroll(data-scroll='right' data-scroll-hidden='horizontal')
    //
    //           .wjs-scroll__wrapper.wjs-scroll__wrapper_right
    //             .wjs-scroll__line wjs-scroll__line_right
    //               .wjs-scroll__thumb wjs-scroll__thumb_right
    //
    //           .wjs-scroll__content-wrapper
    //             .wjs-scroll__content
    //               .wjs-dbtable__tbody

    let tableElement       = document.getElementById(tableId),
        outerContainer     = tableElement.querySelector('.wjs-dbtable__table-wrapper.wjs-scroll'),
        outerScrollContent = tableElement.querySelector('.wjs-dbtable__table-wrapper > .wjs-scroll__content-wrapper > .wjs-scroll__content'),
        table              = tableElement.querySelector('.wjs-dbtable__table'),
        theader            = table.querySelector('.wjs-dbtable__theader'),
        innerContainer     = table.querySelector('.wjs-dbtable__inner-table-container.wjs-scroll'),
        innerScrollContent = innerContainer.querySelector('.wjs-scroll__content'),
        hCells             = tableElement.querySelectorAll('.wjs-dbtable__header-cell'),
        tbody              = tableElement.querySelector('.wjs-dbtable__tbody'),
        bCells             = tableElement.querySelectorAll('.wjs-dbtable__body-cell'),
        tableObj           = JSON.parse( localStorage.getItem(tableId) ),
        headerData         = tableObj.h;

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

      let condition = !!tableElement.querySelector('.wjs-dbtable__filter-item') // якщо присутній хоча б один маркер фільтра
                       && getComputedStyle( tableElement.querySelector('.wjs-dbtable__label_filtered') ).display == 'none' // є позначка, яка вказує на кількість відфільтрованих елементів
                       && !tableElement.querySelector('.wjs-dbtable__filters-list-wrapper'); // список фільтрів закритий
      if ( condition ) {
        showMessageInsideBody(tableId, 'Совпадения отсутствуют. Попробуйте упростить критерии поиска');
      } else {

        // перебір колонок і вирівнювання ширини чарунок тіла таблиці і шапки
        // iw - important width, утворюється при ручній зміні ширини колонки
        // mw - minimal width, утворюється при сортуванні, щоб не скакали
        //      розміри колонки зі зміною контенту
        // d - display, видимість колонки (фільтри)

        let countWidth = 0;
        headerData.forEach( (item, i) => {

          let hCell = table.querySelector('.wjs-dbtable__header-cell[data-source="' + item.s + '"]')
                      || table.querySelector('.wjs-dbtable__header-cell_checkbox');
          let bCell = table.querySelector('.wjs-dbtable__body-cell[data-source="' + item.s + '"]')
                      || table.querySelector('.wjs-dbtable__body-cell_checkbox');

          if (item.d) { // якщо колонку видно
            if (item.iw) { // якщо є фіксована ширина
              item.mw = 0;
              hCell.style.width = item.iw + 'px';
              tableElement.querySelectorAll('.wjs-dbtable__body-cell[data-source="' + item.s + '"]').forEach( item2 => {
                item2.style.overflow = 'hidden';
                item2.style.width = item.iw + 'px';
              });
            } else { // якщо нема фіксованої ширини
              // порівняння розмірів чарунок шапки і тіла

              if (bCell) {
                bCell.style.width = 'auto';
                hCell.style.width = 'auto';

                if (hCell.clientWidth > bCell.clientWidth) {
                  bCell.style.width = hCell.offsetWidth + 'px';
                } else {
                  hCell.style.width = bCell.offsetWidth + 'px';
                }

                if (item.mw) { // якщо є мінімальна ширина
                  if (item.mw > hCell.offsetWidth) {
                    hCell.style.minWidth = item.mw + 'px';
                    bCell.style.minWidth = item.mw + 'px';
                  } else {
                    item.mw = hCell.offsetWidth;
                  }
                } else { // якщо нема мінімальної ширини
                  item.mw = hCell.offsetWidth;
                  hCell.style.minWidth = item.mw + 'px';
                  bCell.style.minWidth = item.mw + 'px';
                }
              }
            }
            countWidth += hCell.offsetWidth;
          }
        });
        localStorage.setItem( tableId, JSON.stringify(tableObj) );

        if (countWidth > theader.clientWidth) {
          theader.style.width            = countWidth + 'px';
          tbody.style.width              = countWidth + 'px';
          table.style.width              = countWidth + 'px';
          outerScrollContent.style.width = countWidth + 'px';
          innerContainer.style.width     = countWidth + 'px';
        }
      }
    /* ↑↑↑ table cells width ↑↑↑ */

    /* ↓↓↓ left scroll review ↓↓↓ */
      // це щоб при лівому скролі закриття останньої колонки на утворювало пустоту
      let maxScrollLeft = outerScrollContent.offsetWidth - outerContainer.clientWidth;
      if (outerScrollContent.scrollLeft > maxScrollLeft) {
        outerScrollContent.scrollLeft = maxScrollLeft;
      }
    /* ↑↑↑ left scroll review ↑↑↑ */

    table.style.height = outerScrollContent.clientHeight + 'px';

    wSetScroll( document.querySelector('#' + tableId + ' .wjs-dbtable__table-wrapper.wjs-scroll'), {bottom:true,overvlowYHidden:true});

    // виправлення висоти елементів при появі/зникненні фільтрів
    table.style.height = outerContainer.clientHeight + 'px';

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

      let bottomScrollLineHeight;
      if ( tableElement.querySelector('.wjs-scroll__wrapper_bottom') ) {
        // chrome і mozilla по різному сприймають padding-bottom. Якщо це зробити через
        // стилі, у chrom'a буде зайвий padding.
        outerScrollContent.style.paddingBottom = '20px';
        bottomScrollLineHeight = tableElement.querySelector('.wjs-scroll__wrapper_bottom').offsetHeight;
      } else {
        outerScrollContent.style.paddingBottom = '0px';
        bottomScrollLineHeight = 0;
      }

      let height = table.clientHeight
                   - theader.offsetHeight
                   - bottomScrollLineHeight;

      innerContainer.style.height     = height + 'px';
      innerScrollContent.style.height = height + 'px';
      innerScrollContent.style.width  = innerContainer.clientWidth + 'px';
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
   * @param  {[String]} tableId    [ідентифікатор таблиці]
   * @param  {[String]} sortSource [передається при drug'n'drop для підсвітки кнопки сортування]
   * @param  {[String]} sortType   [передається при drug'n'drop для підсвітки кнопки сортування]
   */
  function buildTableHeader (tableId, sortSource, sortType) {
    let tableObj = JSON.parse( localStorage.getItem(tableId) ),
        table    = document.querySelector('#' + tableId),
        theader  = table.querySelector('.wjs-dbtable__theader'),
        htmlStr  = '';

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
          htmlStr += '</div><div class="wjs-dbtable__width-changer"></div>';
        }

        htmlStr += '</div>';

      }
    }
    theader.innerHTML = htmlStr;

    // підсвічування типу сортування
    if (sortSource && sortType) {
      theader.querySelector('.wjs-dbtable__header-cell[data-source="' + sortSource + '"] .wjs-dbtable__btn_sort')
             .classList.add('wjs-dbtable__btn_sort_active_' + sortType);
    } else if ( theader.querySelector('.wjs-dbtable__header-cell[data-source="id"]') ) {
      theader.querySelector('.wjs-dbtable__header-cell[data-source="id"] .wjs-dbtable__btn_sort')
             .classList.add('wjs-dbtable__btn_sort_active_down');
    }

    highlightMenuBtns(tableId);
  }

  /**
   * [buildTableBody відповідає за динамічну побудову тіла таблиці]
   * @param {[Object]} params [об'єкт з параметрами]
   */
  // function buildTableBody (tableId, data, startValue, itemsAmount) {
  function buildTableBody (params = {}) {

    let tableId     = params.tableId,          // ідентифікатор таблиці
        data        = params.data       || [], // дані, з яких будується таблиця (оригінальна або фільтрована база даних)
        dataLength  = params.dataLength || 0,  // кількість записів в оригінальній базі даних
        startValue  = params.startValue,       // порядковий номер запису в базі даних, з якого починається побудова таблиці
        itemsAmount = params.itemsAmount;      // кількість відображуваних елементів на одній сторінці

    let headerData  = JSON.parse( localStorage.getItem(tableId) ).h,
        tableData   = data,
        tableBody   = document.querySelector('#' + tableId + ' .wjs-dbtable__tbody'),
        tableHeader = document.querySelector('#' + tableId + ' .wjs-dbtable__theader'),
        start       = startValue || 0,
        end         = start + +itemsAmount || 100,
        activePage  = start / +itemsAmount || 0;

    document.querySelector('.wjs-dbtable__items-amount').innerHTML = dataLength;
    buildPagination(tableId, tableData.length, itemsAmount, activePage);

    tableBody.innerHTML = '';

    let order = [];
    for (let item of headerData) {
      if (!item.d) continue;
     order.push(item.s);
    }

    tableHeader.style.gridTemplateColumns = 'repeat(' + (order.length - 1) + ', auto) 1fr';
    tableBody.style.gridTemplateColumns = 'repeat(' + (order.length - 1) + ', auto) 1fr';

    let copyBtnHtml = '<button type="button" class="wjs-dbtable__copy-btn" title="скопировать ячейку в буфер обмена">\
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M433.941 65.941l-51.882-51.882A48 48 0 0 0 348.118 0H176c-26.51 0-48 21.49-48 48v48H48c-26.51 0-48 21.49-48 48v320c0 26.51 21.49 48 48 48h224c26.51 0 48-21.49 48-48v-48h80c26.51 0 48-21.49 48-48V99.882a48 48 0 0 0-14.059-33.941zM266 464H54a6 6 0 0 1-6-6V150a6 6 0 0 1 6-6h74v224c0 26.51 21.49 48 48 48h96v42a6 6 0 0 1-6 6zm128-96H182a6 6 0 0 1-6-6V54a6 6 0 0 1 6-6h106v88c0 13.255 10.745 24 24 24h88v202a6 6 0 0 1-6 6zm6-256h-64V48h9.632c1.591 0 3.117.632 4.243 1.757l48.368 48.368a6 6 0 0 1 1.757 4.243V112z"/></svg>\
                       </button>';

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
                             <a href="#" class="w-link" data-forhighlighting="' + tableData[i][order[j]] + '">' + tableData[i][order[j]] + '</a>'
                        + copyBtnHtml +
                          '</div>';
            break;

          case 'clientName':
            item = item + '<div class="wjs-dbtable__body-cell ' + styleClass + '" data-source="' + order[j] + '">\
                             <a href="#" class="w-link" data-forhighlighting="' + tableData[i][order[j]] + '">' + tableData[i][order[j]] + '</a>'
                        + copyBtnHtml +
                           '</div>';
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
                             <a href="tel:' + tableData[i][order[j]] + '" class="w-link w-monotype" data-forhighlighting="' + tableData[i][order[j]] + '">' + tableData[i][order[j]] + '</a>'
                        + copyBtnHtml +
                          '</div>';
            break;

          case 'email':
            item = item + '<div class="wjs-dbtable__body-cell ' + styleClass + '" data-source="' + order[j] + '">\
                             <a href="#" class="w-link" data-forhighlighting="' + tableData[i][order[j]] + '">' + tableData[i][order[j]] + '</a>'
                        + copyBtnHtml +
                          '</div>';
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
   * @param {[DOM-елемент]} target [елемент, на якому спрацювала подія]
   */
  function goToPage(target) {
    let tableElement = event.target.closest('.wjs-dbtable'),
        tableId      = tableElement.getAttribute('id'),
        data         = db[tableId],
        dataLength   = data.length,
        btn          = tableElement.querySelector('.wjs-dbtable__page-btn[data-paginationperpage]'),
        itemsAmount  = btn.dataset.paginationperpage,
        inputValue   = event.target.closest('.wjs-dbtable__go-to-page-wrapper').querySelector('.wjs-dbtable__go-to-page-input').value;

    if (!+inputValue ) return;

    let startValue   = (inputValue-1)*itemsAmount;

    // якщо включені фільтри
    if ( +(tableElement.querySelector('.wjs-dbtable__filtered-amount').innerHTML) ) {
      data = filterDB(tableId);
    }

    // якщо включений пошук
    if ( +(tableElement.querySelector('.wjs-dbtable__founded-amount').innerHTML) ) {
      let value = tableElement.querySelector('.wjs-dbtable__big-search-input').dataset.value;
      data = formDBAfterSearching(tableId, value);
    }

    buildTableBody ({tableId, data, startValue, itemsAmount, dataLength});
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

      let data;
      if ( document.querySelector('#' + tableId + ' .wjs-dbtable__filter-item') ) {
        data = filterDB(tableId);
      } else {
        data = db[tableId];
      }

      // перебудувати таблицю
      buildTableHeader('clientTable');
      buildTableBody ({tableId:'clientTable', data, dataLength: db[tableId].length});
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
    } else {
      label.style.display = 'none';
      labelValue.style.display = 'none';
      labelValue.innerHTML = 0;
    }
    normalizeTableMeasurements(tableId);
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
        sortSource   = btn.closest('.wjs-dbtable__header-cell').dataset.source,
        tableObj     = JSON.parse( localStorage.getItem(tableId) ),
        sortType;

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

    let dataForCompare;
    if ( tableElement.querySelector('.wjs-dbtable__filter-item') ) {
      dataForCompare = filterDB(tableId);
    } else {
      dataForCompare = db[tableId];
    }

    // sort
    if (sortType == 'down') {
      dataForCompare.sort(function (a, b){
        if (a[sortSource] > b[sortSource]) return 1;
        if (a[sortSource] < b[sortSource]) return -1;
        if (a[sortSource] == b[sortSource]) return 0;
      });
    } else {
      dataForCompare.sort(function (a, b){
        if (a[sortSource] > b[sortSource]) return -1;
        if (a[sortSource] < b[sortSource]) return 1;
        if (a[sortSource] == b[sortSource]) return 0;
      });
    }

    buildTableBody ({tableId, data: dataForCompare, dataLength: db[tableId].length});
    normalizeTableMeasurements('clientTable');
  }

  /**
   * [collectFilters перебирає базу даних, вишукуючи усі варіанти фільтрів, та
   * записує їх в ls]
   * @param {[String]}   tableId [ідентифікатор таблиці]
   * @param {[Array]} db [база даних]
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
   * [closeFiltersList закриття списку фільтрів. Може викликатися без параметра,
   * тоді закриває усі відкриті списки]
   * @param {[String]} tableId [ідентифікатор таблиці]
   */
  function closeFiltersList(tableId) {

    // порівняння відбитків, за потреби - запуск функції фільтрування БД та
    // перебудови таблиці
    if (tableId) {
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
        handleFilters(tableId);
      }
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
    // тут потрібен код для нормалізації скролів таблиці, але
    // normalizeTableMeasurements(tableId) не працює

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

    normalizeTableMeasurements(tableId);
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

    normalizeTableMeasurements(tableId)
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
    normalizeTableMeasurements(tableId);
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

    handleFilters(tableId);
    normalizeTableMeasurements(tableId);
    highlightMenuBtns(tableId);
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

  /**
   * [handleFilters викликається при зміні фільтра, відповідає за довколо-
   * фільтровий візуал, викликає функцію фільтрування бд та побудови таблиці]
   * @param  {[String]} tableId [ідентифікатор таблиці]
   */
  function handleFilters(tableId) {
    let filteredAmount      = document.querySelector('#' + tableId + ' .wjs-dbtable__filtered-amount'),
        filteredAmountLabel = document.querySelector('#' + tableId + ' .wjs-dbtable__label_filtered');

    let filteredDB = filterDB(tableId);

    if (filteredDB.length == 0) {
      showMessageInsideBody(tableId, 'Совпадения отсутствуют. Попробуйте упростить критерии поиска');
        filteredAmount.innerHTML = 0;
        filteredAmount.style.display = 'none';
        filteredAmountLabel.style.display = 'none';
    } else {
      if (filteredDB.length == db[tableId].length) {
        filteredAmount.innerHTML = 0;
        filteredAmount.style.display = 'none';
        filteredAmountLabel.style.display = 'none';
      } else {
        filteredAmount.innerHTML = filteredDB.length;
        filteredAmount.style.display = 'block';
        filteredAmountLabel.style.display = 'block';
      }

      buildTableBody ({tableId, data: filteredDB, dataLength: db[tableId].length});
      normalizeTableMeasurements(tableId);
    }
  }

  /**
   * [filterDB приймає id таблиці, знаходить по ньому вимклені фільтки в ls,
   * фільтрує базу даних, видаляючи ел-ти, що підходять під ці фільтри]
   * @param  {[String]} tableId [ідентифікатор таблиці]
   * @return {[Array]}          [масив об'єктів, відфільтрована база даних]
   */
  function filterDB(tableId) {
    let filters = JSON.parse( localStorage.getItem(tableId) ).cf;

    let resultDB = [];

    db[tableId].forEach( item => {
      for (let key in filters) {
        if( filters[key].includes(item[key]) ) {
          return
        }
      }
      resultDB.push(item);
    });
    return resultDB;
  }

  /**
   * [showFilteredItemsAnountAtStartUp під час завантаження перевіряє, чи є
   * увімкнені фільтри і показує кількість елементів у відфільтрованій бд]
   * @param {[String]} tableId [ідентифікатор таблиці]
   */
  function showFilteredItemsAnountAtStartUp(tableId) {
    let filteredAmount      = document.querySelector('#' + tableId + ' .wjs-dbtable__filtered-amount'),
        filteredAmountLabel = document.querySelector('#' + tableId + ' .wjs-dbtable__label_filtered');

    let filteredDB = filterDB(tableId);

    if (filteredDB.length == 0) {
      showMessageInsideBody(tableId, 'Совпадения отсутствуют. Попробуйте упростить критерии поиска');
    } else {

      if (filteredDB.length == db[tableId].length) {
        filteredAmount.innerHTML = 0;
        filteredAmount.style.display = 'none';
        filteredAmountLabel.style.display = 'none';
      } else {
        filteredAmount.innerHTML = filteredDB.length;
        filteredAmount.style.display = 'block';
        filteredAmountLabel.style.display = 'block';
      }
    }
  }

  /**
   * [startDragColumn відповідає за усю логіку перетягування колонок,
   * містить вкладені функції]
   * @param {[Event object]} event [об'єкт події]
   */
  function startDragColumn(event) {
    let headerCell         = event.target.closest('.wjs-dbtable__header-cell'),
        tableElement       = event.target.closest('.wjs-dbtable'),
        outerScrollContent = tableElement.querySelector('.wjs-dbtable__table-wrapper > .wjs-scroll__content-wrapper > .wjs-scroll__content'),
        table              = event.target.closest('.wjs-dbtable__table'),
        source             = headerCell.dataset.source,
        tableId            = tableElement.getAttribute('id');

    let shiftX = event.clientX - headerCell.getBoundingClientRect().left,
        shiftY = event.clientY - headerCell.getBoundingClientRect().top;

    let startX,startY,mirror,target,targetSource;
    let isMouseUp = false;

    // перша колонка з чекбоксом - не "тягабельна"
    if ( headerCell.classList.contains('wjs-dbtable__header-cell_checkbox') ) return;

    // drag'n'drop починати тільки якщо є зсув більше 10 пікселів
    document.addEventListener('mousemove', buildColumnMirror);

    // завершення drag'n'drop
    document.addEventListener('mouseup', () => isMouseUp = true );

    function buildColumnMirror(event) {
      if (!startX) {
        startX = event.pageX;
        startY = event.pageY;
      } else {

        // зсув курсору після початку руху
        let deltaX = Math.abs(event.pageX - startX);
        let deltaY = Math.abs(event.pageY - startY);

        // якщо зсув істотний - починати drag'n'drop
        if ( (deltaX >= 10 || deltaY >= 10) && !isMouseUp ) {
          document.removeEventListener('mousemove', buildColumnMirror);

          mirror = document.createElement('div');
          mirror.classList.add('wjs-dbtable__column-mirror');
          mirror.append( headerCell.cloneNode(true) );

          let bCells = tableElement.querySelectorAll('.wjs-dbtable__body-cell[data-source="' + source + '"]');
          bCells.forEach(function(item){
            let clonedCell = item.cloneNode(true);
            clonedCell.style.height = item.offsetHeight + 'px';
            mirror.append(clonedCell);
          });

          let mirrorX = headerCell.getBoundingClientRect().left
                        - tableElement.getBoundingClientRect().left
                        + outerScrollContent.scrollLeft;
          let mirrorY = 0;

          mirror.style.top = mirrorY + 'px';
          mirror.style.left = mirrorX + 'px';

          table.append(mirror);

          // перенесення дзеркала
          document.addEventListener('mousemove', moveColumnMirror);

          // завершення drag'n'drop
          document.addEventListener('mouseup', stopDragColumn);
        }
      }
    }

    function moveColumnMirror(event){
      let x = mirror.getBoundingClientRect().left - 1,
          y = mirror.getBoundingClientRect().top;

      if ( document.elementFromPoint(x,y) ) {
        target = document.elementFromPoint(x,y).closest('.wjs-dbtable__header-cell');
      }

      if (target) {
        targetSource = target.dataset.source;
        let headersArr = target.closest('.wjs-dbtable__theader').querySelectorAll('.wjs-dbtable__header-cell');
        headersArr.forEach( item => {
          item.classList.remove('wjs-dbtable__header-cell_dropable');
        } );
        target.classList.add('wjs-dbtable__header-cell_dropable');

        if (target.nextElementSibling) {
          target.nextElementSibling.classList.add('wjs-dbtable__header-cell_dropable');
        }
      } else {
        targetSource = null;
      }

      // перетягування не повинно виповзати за межі таблиці
      let minX    = 1, // бо розрахунок target іде на -1 координату
          minY    = 0,
          maxX    = table.clientWidth
                    - headerCell.offsetWidth,
          maxY    = tableElement.querySelector('.wjs-dbtable__table-wrapper > .wjs-scroll__content-wrapper').clientHeight
                   - tableElement.querySelector('.wjs-scroll__wrapper.wjs-scroll__wrapper_bottom').offsetHeight
                   - headerCell.offsetHeight
                   - 1,
          scrollX = tableElement.querySelector('.wjs-dbtable__table-wrapper.wjs-scroll').clientWidth
                    - tableElement.querySelector('.wjs-scroll__wrapper.wjs-scroll__wrapper_right').offsetWidth
                    - headerCell.offsetWidth,
          left = event.pageX
                 - table.getBoundingClientRect().left
                 - shiftX,
          top  = event.pageY
                 - table.getBoundingClientRect().top
                 - shiftY;

      if (left < minX) left = minX;
      if (left > maxX) left = maxX;
      if (top < minY) top = minY;
      if (top > maxY) top = maxY;

      mirror.style.left = left + 'px';
      mirror.style.top = top + 'px';

      // якщо дзеркало підтягується до правого краю тягабельної зони -
      // прокрутити таблицю вліво
      if (left - outerScrollContent.scrollLeft >= scrollX) {
          outerScrollContent.scrollLeft += 10;
      }

      // якщо дзеркало підтягується до лівого краю тягабельної зони -
      // прокрутити таблицю вправо
      if (outerScrollContent.scrollLeft > 0
          && outerScrollContent.scrollLeft + table.getBoundingClientRect().left > x) {
        outerScrollContent.scrollLeft -= 10;
      }
    }

    function stopDragColumn() {
      isMouseUp = true;
      document.removeEventListener('mousemove', moveColumnMirror);
      document.removeEventListener('mouseup', stopDragColumn);

      if (mirror) {
        mirror.remove();
      }

      if ( document.querySelector('.wjs-dbtable__header-cell_dropable') ) {
        let dragMarkered = document.querySelectorAll('.wjs-dbtable__header-cell_dropable');
        dragMarkered.forEach( item => {
          item.classList.remove('wjs-dbtable__header-cell_dropable')
        } );
      }

      // save changes in ls
      let tableObj   = JSON.parse( localStorage.getItem(tableId) ),
          headersArr = tableObj.h;
      let sourceObject,
          tempArr = [];

      for (let i = 0; i < headersArr.length; i++) {
        if (headersArr[i].s == source) {
          sourceObject = Object.assign({}, headersArr[i]);
          break
        }
      }

      // якщо відпускання мишки відбувається поза заголовками таблиці,
      // targetSource == null, перетягування не відбувається
      if (targetSource) {
        if (source == targetSource) {
          // тут змін нема, колонка все одно встане на своє місце
          return
        } else {
          for (let i = 0; i < headersArr.length; i++) {
             if (headersArr[i].s != source && headersArr[i].s != targetSource) {
              tempArr.push(headersArr[i]);
            } else if (headersArr[i].s == source) {
              continue
            } else if (headersArr[i].s == targetSource) {
              tempArr.push(headersArr[i]);
              tempArr.push(sourceObject);
            }
          }
          tableObj.h = tempArr;
          localStorage.setItem( tableId, JSON.stringify(tableObj) );
        }
      } else {
        // коли відпускання мишки відбувається поза областю заголовків,
        // targetSource === null, а якщо над чекбоксом, то undefined.
        if (targetSource === undefined) {
          tempArr.push(headersArr[0]);
          let tempArr2 = [];
          for (let i = 1; i < headersArr.length; i++) {
            if (headersArr[i].s == source) {
              tempArr.push(headersArr[i]);
            } else {
              tempArr2.push(headersArr[i]);
            }
          }
          tempArr = tempArr.concat(tempArr2);
          tableObj.h = tempArr;
          localStorage.setItem( tableId, JSON.stringify(tableObj) );
        } else {
        // тут зміни не потрібні, бо дзеркало було відпущене за межеми області
        // заголовків
        return
        }
      }

      let activeSortButton, sortType;

      if ( document.querySelector('#' + tableId + ' .wjs-dbtable__btn_sort_active_down') ) {
        activeSortButton = document.querySelector('#' + tableId + ' .wjs-dbtable__btn_sort_active_down');
        sortType = 'down';
      } else {
        activeSortButton = document.querySelector('#' + tableId + ' .wjs-dbtable__btn_sort_active_up');
        sortType = 'up';
      }

      let sortSource = activeSortButton.closest('.wjs-dbtable__header-cell').dataset.source;

      buildTableHeader (tableId, sortSource, sortType);

      // buildTableBody ({}) вимагає формування складного аргументу, простіше
      // вибрати наявний HTML та перетасувати його
      let tbody = tableElement.querySelector('.wjs-dbtable__tbody'),
          bCellsArr    = tableElement.querySelectorAll('.wjs-dbtable__body-cell'),
          bCellsAmount = bCellsArr.length,
          hCellsArr    = tableElement.querySelectorAll('.wjs-dbtable__header-cell'),
          hCellsAmount = hCellsArr.length;

      // формуємо масив з порядком колонок по атрибуту data-source
      let headerSourcesArr = [];
      let headerData = JSON.parse( localStorage.getItem('clientTable') ).h;
      headerData.forEach( item => {
        if (item.d) {
          headerSourcesArr.push(item.s);
        }
      });

      // кількість записів у таблиці
      let itemsAmount = bCellsAmount/hCellsAmount;
      let sortedArr = [];

      let counter;
      for (let i = 0; i < itemsAmount; i++) {
        // порядковий номер чарунки, з якої починається черговий рядок таблиці
        let start = counter || i;
        // порядковий номер чарунки, якою закінчується черговий рядок таблиці
        let end = start + hCellsAmount-1;
        counter = end + 1;

        // перебір конкретного рядочка таблиці
        let lineObj = {};
        for ( let j = start; j < end+1; j++) {
          let key = bCellsArr[j].dataset.source;
          if (!key) {
            key = 'checkbox';
          }
          lineObj[key] = bCellsArr[j];
        }

        for (let j = 0; j < headerSourcesArr.length; j++) {
          tbody.append( lineObj[headerSourcesArr[j]] );
        }
      }

      normalizeTableMeasurements(tableId);
    }
  }

  /**
   * [startChangeColumnWidth відповідає за усю логіку зміни ширини колонок,
   * містить вкладені функції]
   * @param {[Event object]} event [об'єкт події]
   */
  function startChangeColumnWidth(event) {

    let tableElement       = event.target.closest('.wjs-dbtable'),
        tableId            = tableElement.getAttribute('id'),
        currentCell        = event.target.closest('.wjs-dbtable__header-cell'),
        currentCellSource  = currentCell.dataset.source,
        columnCells        = tableElement.querySelectorAll('.wjs-dbtable__body-cell[data-source="' + currentCellSource + '"]'),
        outerContainer     = tableElement.querySelector('.wjs-dbtable__table-wrapper.wjs-scroll'),
        outerScrollContent = tableElement.querySelector('.wjs-dbtable__table-wrapper > .wjs-scroll__content-wrapper > .wjs-scroll__content'),
        table              = tableElement.querySelector('.wjs-dbtable__table'),
        theader            = table.querySelector('.wjs-dbtable__theader'),
        innerContainer     = table.querySelector('.wjs-dbtable__inner-table-container.wjs-scroll'),
        tbody              = tableElement.querySelector('.wjs-dbtable__tbody'),
        tableObj           = JSON.parse( localStorage.getItem(tableId) ),
        headerData         = tableObj.h,
        startX             = event.pageX;

    // заміряємо поточну ширину, скидаємо до мінімуму, заміряємо мінімальну і
    // повертаємо попередні розміри
    let currentWidth = currentCell.offsetWidth;
    currentCell.style.width = 'auto';
    currentCell.style.minWidth = 'auto';

    let minWidth = currentCell.offsetWidth;
    currentCell.style.width = currentWidth + 'px';
    currentCell.style.minWidth = minWidth + 'px';

    let parentsWidthWithoutCurrent = theader.clientWidth - currentWidth;

    document.addEventListener('mousemove', changeColumnWidth);
    document.addEventListener('mouseup', stopChangeColumnWidth );

    let calculatedWidth;
    function changeColumnWidth(event) {
      let deltaX = event.pageX - startX;

      calculatedWidth = currentWidth + deltaX;
      if (calculatedWidth < minWidth) {
        calculatedWidth = minWidth;
      }

      let newParentsWidth = parentsWidthWithoutCurrent + calculatedWidth;

      currentCell.style.width = calculatedWidth + 'px';
      columnCells.forEach( item => {
        item.style.minWidth = '0px';
        item.style.width = calculatedWidth + 'px';
        item.style.overflow = 'hidden';
      });

      theader.style.width            = newParentsWidth + 'px';
      tbody.style.width              = newParentsWidth + 'px';
      table.style.width              = newParentsWidth + 'px';
      innerContainer.style.width     = newParentsWidth + 'px';

      let maxScrollLeft = table.offsetWidth - outerContainer.clientWidth;
      if (outerScrollContent.scrollLeft > maxScrollLeft) {
        outerScrollContent.scrollLeft = maxScrollLeft;
      }

      wSetScroll(innerContainer, {right:true,overvlowXHidden:true});
    }

    function stopChangeColumnWidth() {
      document.removeEventListener('mousemove', changeColumnWidth);

      let tableObj   = JSON.parse( localStorage.getItem(tableId) ),
          headerData = tableObj.h;

      for (let i = 0; i < headerData.length; i++) {
        if (headerData[i].s == currentCellSource) {
          headerData[i].iw = calculatedWidth;
          headerData[i].mw = 0;
          break;
        }
      }

      localStorage.setItem( tableId, JSON.stringify(tableObj) );

      document.removeEventListener('mouseup', stopChangeColumnWidth);
    }
  }

  /**
   * [showMessageInsideBody вивидить у тіло таблиці повідомлення замість колонок, якщо таблиця не може бути побудована]
   * @param  {[String]} tableId [ідентифікатор таблиці]
   * @param  {[String]} message [description]
   */
  function showMessageInsideBody(tableId, message) {
    document.querySelector('#' + tableId + ' .wjs-dbtable__tbody').innerHTML = '<p style="padding: 20px">' + message + '</p>';
  }

  /**
   * [openSmallSearchField відкриває мале поле пошуку в загоговку таблиці]
   * @param {[DOM-object]} btn [кнопка пошуку в заголовку таблиці]
   */
  function openSmallSearchField(btn) {
    let tableId = btn.closest('.wjs-dbtable').getAttribute('id');
    document.querySelector('#clientTable .wjs-dbtable__big-search-input').value = '';

    if ( btn.closest('.wjs-dbtable__header-cell').querySelector('.wjs-dbtable__small-search-input') ) {
      closeSmallSearchField(tableId);
      return
    }

    if ( document.querySelector('#' + tableId + ' .wjs-dbtable__small-search-input') ) {
      closeSmallSearchField(tableId);
    }

    let hCell = btn.closest('.wjs-dbtable__header-cell'),
        html  = '<input type="text" class="wjs-dbtable__small-search-input">';
    hCell.insertAdjacentHTML('beforeEnd', html);
    hCell.querySelector('.wjs-dbtable__small-search-input').focus();
  }

  /**
   * [closeSmallSearchField закриває мале поле пошуку в загоговку таблиці]
   * @param  {[String]} tableId [ідентифікатор таблиці]
   */
  function closeSmallSearchField(tableId) {
    document.querySelector('#' + tableId + ' .wjs-dbtable__small-search-input').remove();
  }

  /**
   * [closeSearch скидає пошук по БД]
   * @param  {[DOM-Object]} btn [кнопка скидання пошуку]
   */
  function closeSearch(btn) {
    let tableElement   = btn.closest('.wjs-dbtable'),
        tableId        = tableElement.getAttribute('id'),
        label          = tableElement.querySelector('.wjs-dbtable__label_founded'),
        labelValue     = tableElement.querySelector('.wjs-dbtable__founded-amount'),
        bigSearchInput = tableElement.querySelector('.wjs-dbtable__big-search-input');

    label.style.display = 'none';
    label.nextElementSibling.style.display = 'none';
    bigSearchInput.removeAttribute('data-source');
    bigSearchInput.removeAttribute('data-value');
    labelValue.innerHTML = '';
    bigSearchInput.value = '';
    buildTableBody ({tableId, data: db[tableId], dataLength: db[tableId].length});
    normalizeTableMeasurements(tableId);
  }

  /**
   * [searchInDB обробляє зміни в полях пошуку по базі]
   * @param {[Event object]} event [об'єкт події]
   */
  function searchInDB(event) {

    let tableElement   = event.target.closest('.wjs-dbtable'),
        tableId        = tableElement.getAttribute('id'),
        label          = tableElement.querySelector('.wjs-dbtable__label.wjs-dbtable__label_founded'),
        labelValue     = tableElement.querySelector('.wjs-dbtable__founded-amount'),
        value          = event.target.value,
        bigSearchInput = tableElement.querySelector('.wjs-dbtable__big-search-input'),
        source         = '',
        dataLength     = db[tableId].length;

    // формуємо source: якщо клік по заголовку колонки в таблиці, це одне
    // значення, якщо клік по головному полю пошуку, source буде рядком зі
    // значеннями, взятими з заголовків таблиці, в яких є кнопка пошуку,
    // розділених пробілом. Замість масиву використовую рядок з пробілами, бо
    // для сторінкування потрібно передати атрибут, в який масив не впишеш
    if ( event.target.closest('.wjs-dbtable__header-cell') ) {
      source = event.target.closest('.wjs-dbtable__header-cell').dataset.source;
    } else {
      let hCellsWithSources = tableElement.querySelectorAll('.wjs-dbtable__header-cell .wjs-dbtable__btn_search');

      for (let i = 0; i < hCellsWithSources.length; i++) {
        source += hCellsWithSources[i].closest('.wjs-dbtable__header-cell').dataset.source + ' ';
      }
      source = source.trim();
    }

    bigSearchInput.setAttribute('data-source', source);
    bigSearchInput.setAttribute('data-value', value);

    let data;
    let filteredDataLength;
    if (value) {
      data = formDBAfterSearching(tableId, value);
    } else if ( +(tableElement.querySelector('.wjs-dbtable__filtered-amount').innerHTML) ) {
      data = filterDB(tableId);
      filteredDataLength = data.length;
    } else {
      data = db[tableId];
    }

    if (data.length) {
      if (data.length == db[tableId].length
         || (data.length == filteredDataLength && !value) ) {

        label.style.display = 'none';
        labelValue.style.display = 'none';
        bigSearchInput.removeAttribute('data-source');
        bigSearchInput.removeAttribute('data-value');
      } else {
        label.style.display = 'block';
        labelValue.style.display = 'block';
        labelValue.innerHTML = data.length;
      }
      buildTableBody ({tableId, data, dataLength});
      normalizeTableMeasurements(tableId);
      if (value) {
        highlightMatches(tableId, value, source);
      }
    } else {
      labelValue.innerHTML = 0;
      showMessageInsideBody(tableId, 'Совпадения отсутствуют. Попробуйте упростить критерии поиска');
    }
  }

  /**
   * [formDBAfterSearching перебирає базу даних, у вказаному полі source шукає співпадіння
   * і, якщо воно є, додає елемент до тимчасового масиву, який перебирається]
   * @param  {[String]} tableId [ідентифікатор таблиці]
   * @param  {[String]} what    [шуканий фрагмент, набраний в інпуті]
   * @return {[Array]}          [масив елементів, у яких є збіги]
   */
  function formDBAfterSearching(tableId, what) {
    let data           = [],
        bigSearchInput = document.querySelector('#' + tableId + ' .wjs-dbtable__big-search-input'),
        where          = bigSearchInput.dataset.source.split(' ');

    for (let i = 0; i < db[tableId].length; i++) {
      for (let j = 0; j < where.length; j++) {
        if ( String(db[tableId][i][where[j]]).toLowerCase().includes(what.toLowerCase()) ) {
          data.push(db[tableId][i]);
          break
        }
      }
    }
    return data;
  }

  /**
   * [highlightMatches підсвічує співпадіння в колонках таблиці]
   * @param  {[String]} tableId  [ідентифікатор таблиці]
   * @param  {[String]} where    [тип колонки]
   * @param  {[String]} matching [співпадіння, шматок рядка, який треба підсвітити]
   */
  function highlightMatches(tableId, matching, where) {
    let source = where.split(' ');

    source.forEach(function(item) {
    let elems = document.querySelectorAll('#' + tableId + ' .wjs-dbtable__body-cell[data-source="' + item + '"] [data-forhighlighting]');

      elems.forEach( function(item){
        let attr   = item.dataset.forhighlighting,
            regexp = new RegExp(matching,'gui'),
            result = attr.replace(regexp, '<span class="w-bgc-yellow">$&</span>');
        item.innerHTML = result;
      });
    });
  }

  /**
   * [resetLS вичищає збережені налаштування в ls, перезавантажує сторінку]
   * @param  {[DOM-Object]} btn [кнопка скидання налаштувань]
   */
  function resetLS(btn) {
    let tableElement = btn.closest('.wjs-dbtable'),
        tableId      = tableElement.getAttribute('id');

    localStorage.removeItem(tableId);
    initLocalStorage(tableId);
    location.href = location.href;
  }

  /**
   * [copyDataToClipboard копіює дані з чарунки (ім'я, телефон, пошту тощо')]
   * @param {[DOM-Object]} elem [елемент, на якому спрацював клік]
   */
  function copyDataToClipboard(elem) {
    let btn  = elem.closest('.wjs-dbtable__copy-btn'),
        cell = btn.closest('.wjs-dbtable__body-cell'),
        data = cell.querySelector('a').dataset.forhighlighting,
        tempInput = '<input type="text" id="clipboard"  value="' + data + '">';

    cell.insertAdjacentHTML('beforeEnd', tempInput);
    document.querySelector('#clipboard').select();
    document.execCommand('copy');
    document.querySelector('#clipboard').remove();

  }

  /**
   * [changeItemInfo функція для бек-енду, оновлює інформацію в таблиці по
   * конкретному елементу: змінює бд і за потреби змінює html]
   * @param  {[String]} tableId   [ідентифікатор таблиці]
   * @param  {[Number]} itemId    [ідентифікатор елемента]
   * @param  {[String]} source    [ключ властивості елемента]
   * @param  {[String]} data      [значення властивості елемента]
   * @param  {[String]} outerHtml [розмітка чарунки таблиці]
   */
  function changeItemInfo(tableId, itemId, source, data, outerHtml) {

    /*
    приклад перевірки через консоль:
    let myOuterHtml = '<div class="wjs-dbtable__body-cell w-lime w-bgc-aliceblue" data-source="networkStatus">online</div>';
    changeItemInfo("clientTable", 4, "networkStatus", "online", myOuterHtml);
    */

    // зберегти зміни в db[tableId]
    for (let i = 0; i < db[tableId].length; i++) {
      if ( db[tableId][i].id == itemId ) {
        let item = db[tableId][i];
        item[source] = data;
        break
      }
    }

    // якщо такий елемент відображається на сторінці - змінити html
    if ( document.querySelector('#' + tableId + ' .wjs-dbtable__body-cell[data-source="id"] a[data-forhighlighting="' + itemId + '"]') ) {

      let cellWithId = document.querySelector('#' + tableId + ' .wjs-dbtable__body-cell[data-source="id"] a[data-forhighlighting="' + itemId + '"]').closest('.wjs-dbtable__body-cell');

      let nextCell = cellWithId;
      let targetCell;

      // шукаємо вперед до кінця рядка
      do {
        nextCell = nextCell.nextElementSibling;
        if (nextCell.dataset.source == source) {
          targetCell = nextCell;
          break;
        }
      } while ( !nextCell.classList.contains('wjs-dbtable__body-cell_checkbox') )

      // якщо не знайшли до кінця рядка, шукаємо до початку
      if (!targetCell) {
        do {
          nextCell = nextCell.previousElementSibling;
          if (nextCell.dataset.source == source) {
            targetCell = nextCell;
            break;
          }
        } while ( !nextCell.classList.contains('wjs-dbtable__body-cell_checkbox') )
      }

      // якщо не знайшли і в сторону початку - значить колонка виключена
      if (!targetCell) return;

      // якщо потрібно - додаємо клас з кольором тла рядка таблиці
      let bgClass;
      if (cellWithId.classList.length) {
        for (let i = 0; i < cellWithId.classList.length; i++) {
          if (cellWithId.classList[i].startsWith('w-bgc-')) {
            bgClass = cellWithId.classList[i];
          }
        }
      }

      let correctedHTML = outerHtml.replace('class="', 'class="' + bgClass + ' ');
      targetCell.outerHTML = correctedHTML;
    }
  }

  /**
   * [addItemToDB функція для бек-енду, додає елемент в базу даних]
   * @param {[String]} tableId [ідентифікатор таблиці]
   * @param {[Object]} item    [елемент бд]
   */
  function addItemToDB(tableId, item) {

    /*
    приклад перевірки через консоль:
    let testItem = {
      "checkbox": true,
      "id": 1001,
      "clientName": "Loving Elouise",
      "networkStatus": "offline",
      "status": "Not intrested",
      "specStatus": "new",
      "phone": 54542626832,
      "email": "elouise.love@uncallower.edu",
      "company": "LeadBolid",
      "platform": "CFD",
      "verification": "полная верификация",
      "country": "Marshall Islands",
      "language": "língua portuguesa",
      "currency": "USD",
      "money": 18173,
      "deposits": "без депозитов",
      "activity": "не активен",
      "isTradeAble": "не доступна",
      "accountType": "business",
      "lastNote": "Lorem ipsum dolor sit amet consectetur adipisicing elit. Mollitia quaerat voluptatum nisi sapiente veritatis quam sunt pariatur at, quidem, officiis.",
      "dateRegistration": 1569616311677,
      "lastActivity": 1603542148318,
      "dateLastNote": 1606274117107,
      "broker": "Diana Gornaya",
      "brokerPosition": "retention",
      "brokerTeam": "RetTeam_1"
    };
    addItemToDB('clientTable', testItem);
    */

    db[tableId].push(item);
    document.querySelector('#' + tableId + ' .wjs-dbtable__items-amount').innerHTML = db[tableId].length;
  }
/* ↑↑↑ functions declaration ↑↑↑ */
////////////////////////////////////////////////////////////////////////////////