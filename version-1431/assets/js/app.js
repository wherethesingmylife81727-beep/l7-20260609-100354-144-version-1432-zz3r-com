(function(){
var toggle=document.getElementById('nav-toggle');
var menu=document.getElementById('mobile-menu');
if(toggle&&menu){toggle.addEventListener('click',function(){menu.classList.toggle('mobile-open')})}
var slides=[].slice.call(document.querySelectorAll('.hero-slide'));
var dots=[].slice.call(document.querySelectorAll('.hero-dot'));
var current=0;
function show(n){if(!slides.length)return;current=(n+slides.length)%slides.length;slides.forEach(function(s,i){s.classList.toggle('active',i===current)});dots.forEach(function(d,i){d.classList.toggle('active',i===current)})}
if(slides.length){dots.forEach(function(d,i){d.addEventListener('click',function(){show(i)})});show(0);setInterval(function(){show(current+1)},5000)}
var heroForm=document.getElementById('hero-search-form');
if(heroForm){heroForm.addEventListener('submit',function(ev){ev.preventDefault();var q=(heroForm.querySelector('input')||{}).value||'';location.href='categories.html?q='+encodeURIComponent(q.trim())})}
var search=document.getElementById('movie-search');
var region=document.getElementById('region-filter');
var year=document.getElementById('year-filter');
var cat=document.getElementById('category-filter');
var cards=[].slice.call(document.querySelectorAll('.movie-card-item'));
var empty=document.getElementById('empty-state');
function normalize(s){return (s||'').toString().toLowerCase()}
function applyFilters(){var q=normalize(search&&search.value);var r=region&&region.value;var y=year&&year.value;var c=cat&&cat.value;var shown=0;cards.forEach(function(card){var text=normalize((card.dataset.title||'')+' '+(card.dataset.tags||''));var ok=true;if(q&&text.indexOf(q)===-1)ok=false;if(r&&card.dataset.region!==r)ok=false;if(y){var yy=parseInt(card.dataset.year||'0',10);if(y==='2020s'&&yy<2020)ok=false;if(y==='2010s'&&(yy<2010||yy>2019))ok=false;if(y==='older'&&yy>=2010)ok=false}if(c&&card.dataset.category!==c)ok=false;card.classList.toggle('filtered-out',!ok);if(ok)shown++});if(empty)empty.classList.toggle('visible',shown===0)}
[search,region,year,cat].forEach(function(el){if(el){el.addEventListener('input',applyFilters);el.addEventListener('change',applyFilters)}});
if(search){var params=new URLSearchParams(location.search);var q=params.get('q');if(q){search.value=q}applyFilters()}
})();