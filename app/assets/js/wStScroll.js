let container = document.querySelector('.container'),
    content   = document.querySelector('.content'),
    topScroll = document.querySelector('.topscroll'),
    fake      = document.querySelector('.fake');

fake.style.width = content.clientWidth + 'px';
content.style.marginTop = topScroll.offsetHeight + 'px';

topScroll.onscroll = function(e){
  container.scrollLeft = topScroll.scrollLeft
};

container.onscroll = function(e){
  topScroll.scrollLeft = container.scrollLeft
};