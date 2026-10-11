const toggle=document.querySelector('.menu-toggle');
const closeMenu=()=>{document.body.classList.remove('menu-open');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Открыть меню')};
toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');document.body.classList.toggle('menu-open',open)});
document.querySelectorAll('.desktop-nav a').forEach(link=>link.addEventListener('click',closeMenu));
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu()});

document.querySelectorAll('.before-after').forEach(comparison=>{
  const range=comparison.querySelector('.comparison-range');
  let dragging=false;
  const update=()=>{
    comparison.style.setProperty('--comparison',`${range.value}%`);
    range.setAttribute('aria-valuetext',`Показано до ремонта ${range.value} процентов`);
  };
  const updateFromPointer=event=>{
    const bounds=comparison.getBoundingClientRect();
    if(!bounds.width)return;
    range.value=String(Math.round(Math.min(1,Math.max(0,(event.clientX-bounds.left)/bounds.width))*100));
    range.dispatchEvent(new Event('input',{bubbles:true}));
  };
  comparison.addEventListener('pointerdown',event=>{
    if(event.button!==undefined&&event.button!==0)return;
    dragging=true;
    comparison.setPointerCapture(event.pointerId);
    range.focus({preventScroll:true});
    updateFromPointer(event);
    event.preventDefault();
  });
  comparison.addEventListener('pointermove',event=>{if(dragging)updateFromPointer(event)});
  const stopDragging=()=>{dragging=false};
  comparison.addEventListener('pointerup',stopDragging);
  comparison.addEventListener('pointercancel',stopDragging);
  range.addEventListener('input',update);
  update();
});

const floatingActions=document.querySelector('.floating-actions');
const footer=document.querySelector('footer');
const booking=document.querySelector('.booking');
if('IntersectionObserver' in window&&footer&&booking){
  const quietZones=new Set();
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>entry.isIntersecting?quietZones.add(entry.target):quietZones.delete(entry.target));
    floatingActions.classList.toggle('is-hidden',quietZones.size>0);
  },{rootMargin:'0px 0px 90px 0px'});
  observer.observe(footer);
  observer.observe(booking);
}

