
/* ====== Basic interactivity (no external libs) ====== */
const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

// Mobile nav toggle
const toggleBtn = $('.nav-toggle');
const navList = $('#nav-list');
if(toggleBtn){
  toggleBtn.addEventListener('click', () => {
    const open = navList.classList.toggle('open');
    toggleBtn.setAttribute('aria-expanded', String(open));
  });
  // Close on link click
  $$('#nav-list a').forEach(a => a.addEventListener('click', () => navList.classList.remove('open')));
}

// Sticky header shadow on scroll
const header = $('.site-header');
window.addEventListener('scroll', () => {
  const y = window.scrollY || 0;
  header.style.boxShadow = y > 4 ? '0 10px 30px rgba(0,0,0,.25)' : 'none';
});

// Reveal on scroll
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add('visible');
      io.unobserve(e.target);
    }
  });
},{threshold:.12});
$$('.reveal').forEach(el=>io.observe(el));

// Choose plan -> prefill hidden field and scroll to form
$$('.choose-plan').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const plan = btn.dataset.plan || '';
    const hidden = $('#selected-plan');
    if(hidden){ hidden.value = plan; }
    location.hash = '#kontakt';
    const name = $('#name');
    if(name){ name.focus(); }
  });
});

// ====== Lead form logic ======
// 1) Jeśli ustawisz FORMSPREE_ENDPOINT, wyśle przez fetch.
// 2) W przeciwnym razie zbuduje mailto do kontakt@limitless-web.pl.
const FORMSPREE_ENDPOINT = ""; // <- Wstaw endpoint Formspree, np. "https://formspree.io/f/xyzabcd"
const form = $('#lead-form');
const statusEl = $('#form-status');

function serializeForm(form){
  const fd = new FormData(form);
  const data = {};
  for(const [k,v] of fd.entries()){ data[k] = v; }
  return data;
}

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  statusEl.textContent = "Wysyłanie...";
  const data = serializeForm(form);

  if(FORMSPREE_ENDPOINT){
    try{
      const resp = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
        body: JSON.stringify(data)
      });
      if(resp.ok){
        statusEl.textContent = "Dziękujemy! Odezwiemy się w 24h.";
        form.reset();
        $('#selected-plan').value = "";
      } else {
        statusEl.textContent = "Ups, spróbuj ponownie lub wyślij maila bezpośrednio.";
      }
    }catch(err){
      statusEl.textContent = "Błąd sieci. Spróbuj ponownie.";
    }
  } else {
    // mailto fallback
    const subject = encodeURIComponent("Nowe zapytanie — Limitless Web");
    const body = encodeURIComponent(
`Imię: ${data.name}
E-mail: ${data.email}
Telefon: ${data.phone || '-'}
Firma: ${data.company || '-'}
Strona/fanpage: ${data.website || '-'}
Plan: ${data.plan || '-'}

Wiadomość:
${data.message}`
    );
    window.location.href = `mailto:kontakt@limitless-web.pl?subject=${subject}&body=${body}`;
    statusEl.textContent = "Otwieram program pocztowy...";
  }
});

// Back to top smooth click
$('.back-to-top')?.addEventListener('click', (e)=>{
  e.preventDefault();
  window.scrollTo({top: 0, behavior: 'smooth'});
});

// Replace footer year if needed
try{
  const y = window.SITE_YEAR || new Date().getFullYear();
  document.querySelector('.site-footer .footer-inner p').innerHTML = `© ${y} Limitless Web — wszystkie prawa zastrzeżone.`;
}catch{}


async function loadProjects(){
  try{
    const grid = document.getElementById('projects-grid');
    if(!grid) return;
    grid.innerHTML = '<p>Ładowanie projektów...</p>';
    const res = await fetch('/api/projects', { credentials: 'include' });
    if(!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    grid.innerHTML = '';
    const tpl = document.getElementById('project-tile-tpl');
    (data.projects || []).sort((a,b)=>(a.order_num??0)-(b.order_num??0)).forEach(p=>{
      const node = tpl.content.cloneNode(true);
      const img = node.querySelector('.tile-img');
      const title = node.querySelector('.tile-title');
      const desc = node.querySelector('.tile-desc');
      const link = node.querySelector('.tile-link');
      img.src = p.imageUrl || 'assets/og-placeholder.png';
      img.alt = (p.title || 'Projekt') + ' — podgląd';
      title.textContent = p.title || 'Bez tytułu';
      desc.textContent = p.description || '';
      if(p.linkUrl){ link.href = p.linkUrl; } else { link.remove(); }
      grid.appendChild(node);
    });
    if(!grid.children.length){ grid.innerHTML = '<p>Brak projektów do wyświetlenia.</p>'; }
    if(typeof io !== 'undefined'){ document.querySelectorAll('.reveal').forEach(el=>io.observe(el)); }
  }catch(err){
    console.error('Nie udało się załadować projektów:', err);
    const grid = document.getElementById('projects-grid');
    if(grid){ grid.innerHTML = '<p>Nie udało się załadować projektów.</p>'; }
  }
}
document.addEventListener('DOMContentLoaded', loadProjects);
