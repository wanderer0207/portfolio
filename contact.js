const menuToggle=document.querySelector('.menu-toggle');

const nav=document.querySelector('.nav');


menuToggle?.addEventListener('click',()=>{const open=nav.classList.toggle('is-open');
                                          
menuToggle.setAttribute('aria-expanded',String(open));
                                          
menuToggle.textContent=open?'CLOSE −':'MENU ＋';});


nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('is-open');menuToggle?.setAttribute('aria-expanded','false');if(menuToggle)menuToggle.textContent='MENU ＋';}));


document.querySelector('#backToTop')?.addEventListener('click',e=>{e.preventDefault();window.scrollTo({top:0,behavior:'smooth'});});