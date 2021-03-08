"use strict";
// wDataBaseTable
////////////////////////////////////////////////////////////////////////////////
/* ↓↓↓ variables declaration ↓↓↓ */
  let db = {};
  let headerURL = '../db/clientsDB-headers.txt';
  let bodyURL = '../db/clientsDB-100000.txt';
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
  });

  document.querySelector('#clientTable').addEventListener('click', function(event){
    if ( event.target.classList.contains('wjs-dbtable__btn_close') ) {
      closeColumn(event.target);
    }

    if ( event.target.classList.contains('wjs-dbtable__discols-close-btn') ) {
      showDisabledColumn(event.target);
    }

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
  function handleTableBody(arg, tableId) {
    showLoader('clientTable', 'обработка данных ...');
    db[tableId] = arg;

    buildTableBody('clientTable', arg);

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
  }

  /**
   * [buildTableBody відповідає за динамічну побудову тіла таблиці]
   * @param  {[String]} tableId     [ідентифікатор таблиці]
   * @param  {[String]} data        [дані, з яких будується таблиця]
   * @param  {[Number]} startValue  [порядковий номер запису в базі даних, з
   * якого починається побудова таблиці]
   * @param  {[Number]} itemsAmount [кількість відображуваних елементів]
   */
  function buildTableBody (tableId, data, startValue, itemsAmount) {
    let headerData  = JSON.parse( localStorage.getItem(tableId) ).h,
        tableData   = JSON.parse(data),
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
                  '; 
      }
      paginationWrapper.insertAdjacentHTML('beforeEnd', btnsStr);
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
/* ↑↑↑ functions declaration ↑↑↑ */
////////////////////////////////////////////////////////////////////////////////