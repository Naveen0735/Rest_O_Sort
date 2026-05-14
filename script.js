/* REST-O-SORT — shared static client */

// ---------- Storage helpers ----------
const LS = {
  get(k, d){ try{ const v=localStorage.getItem(k); return v?JSON.parse(v):d }catch{ return d } },
  set(k, v){ localStorage.setItem(k, JSON.stringify(v)) }
};

// ---------- Seed data ----------
const SEED_MENU = [
  {id:'m1', name:'Truffle Burrata', category:'starters', description:'Creamy burrata with shaved black truffle and heirloom tomatoes.', price:780, is_popular:true},
  {id:'m2', name:'Tandoori Prawns', category:'starters', description:'Jumbo prawns marinated in saffron yogurt, kissed by the tandoor.', price:920, is_popular:false},
  {id:'m3', name:'Charred Beetroot Carpaccio', category:'starters', description:'Smoked beetroot, goat cheese, candied walnut, citrus.', price:540, is_popular:false},
  {id:'m4', name:'Saffron Risotto', category:'starters', description:'Carnaroli rice slow-cooked with saffron, parmesan and brown butter.', price:680, is_popular:false},
  {id:'m5', name:'Lobster Thermidor', category:'mains', description:'Atlantic lobster, brandy cream, gruyere crust.', price:2400, is_popular:true},
  {id:'m6', name:'Lamb Galouti', category:'mains', description:'Slow-cooked Awadhi lamb kebab on warm ulte tawa paratha.', price:1080, is_popular:true},
  {id:'m7', name:'Chilean Sea Bass', category:'mains', description:'Miso glazed sea bass, charred bok choy, dashi broth.', price:1860, is_popular:false},
  {id:'m8', name:'Wild Mushroom Pappardelle', category:'mains', description:'Hand-cut pasta, porcini, truffle oil, aged pecorino.', price:980, is_popular:false},
  {id:'m9', name:'Dum Biryani Royale', category:'mains', description:'Hyderabadi biryani sealed in dough, served tableside.', price:880, is_popular:true},
  {id:'m10', name:'Coq au Vin', category:'mains', description:'Burgundy braised chicken, pearl onions, smoky lardons.', price:1240, is_popular:false},
  {id:'m11', name:'Molten Chocolate Sphere', category:'desserts', description:'Dark chocolate sphere melted tableside with hot caramel.', price:560, is_popular:true},
  {id:'m12', name:'Pistachio Kulfi Trio', category:'desserts', description:'Three classic kulfi flavours, rose syrup, candied pistachio.', price:420, is_popular:false},
  {id:'m13', name:'Tiramisu Classico', category:'desserts', description:'Mascarpone, espresso, cocoa, savoiardi.', price:480, is_popular:false},
  {id:'m14', name:'Smoked Old Fashioned', category:'drinks', description:'Bourbon, demerara, smoked under hickory at your table.', price:680, is_popular:true},
  {id:'m15', name:'Saffron Negroni', category:'drinks', description:'Gin, campari, saffron-infused vermouth.', price:620, is_popular:false},
  {id:'m16', name:'Champagne Selection', category:'drinks', description:'Curated by our sommelier, served by the glass.', price:980, is_popular:false},
  {id:'m17', name:'House Mocktails', category:'drinks', description:'Botanical, citrus, or smoky — chef\'s choice.', price:340, is_popular:false},
];

// ---------- Auth ----------
const AUTH_KEY='ros_auth_user';
const USERS_KEY='ros_users';
function currentUser(){ return LS.get(AUTH_KEY, null) }
function setCurrentUser(u){ LS.set(AUTH_KEY, u) }
function signOut(){ localStorage.removeItem(AUTH_KEY); location.href='/'; }
function getUsers(){ return LS.get(USERS_KEY, {}) }
function saveUsers(u){ LS.set(USERS_KEY, u) }
function ensureProfile(email, full_name){
  const users=getUsers();
  if(!users[email]){
    users[email] = { email, full_name: full_name||'Guest', avatar_initial:(full_name||'G')[0].toUpperCase(), wallet_balance:500, created_at:new Date().toISOString() };
    // welcome bonus tx
    const tx=LS.get('ros_tx',[]);
    tx.unshift({ id:uid(), user:email, amount:500, type:'topup', description:'Welcome bonus', created_at:new Date().toISOString()});
    LS.set('ros_tx',tx);
    saveUsers(users);
  }
  return users[email];
}
function uid(){ return Math.random().toString(36).slice(2,10) + Date.now().toString(36) }

// ---------- Cart ----------
const CART_KEY='ros_cart';
function getCart(){ return LS.get(CART_KEY, []) }
function saveCart(c){ LS.set(CART_KEY, c); updateCartCount(); }
function addToCart(item){
  const c=getCart();
  const ex=c.find(i=>i.id===item.id);
  if(ex) ex.quantity++; else c.push({...item, quantity:1});
  saveCart(c);
}
function setQty(id, q){
  const c=getCart();
  const i=c.find(x=>x.id===id); if(!i) return;
  if(q<1){ saveCart(c.filter(x=>x.id!==id)); return; }
  i.quantity=q; saveCart(c);
}
function removeFromCart(id){ saveCart(getCart().filter(x=>x.id!==id)) }
function clearCart(){ saveCart([]) }
function cartTotal(){ return getCart().reduce((s,i)=>s+i.price*i.quantity,0) }
function cartCount(){ return getCart().reduce((s,i)=>s+i.quantity,0) }
function updateCartCount(){ /* could update badge */ }

// ---------- Bookings & Orders ----------
function getBookings(){ return LS.get('ros_bookings', []) }
function saveBookings(b){ LS.set('ros_bookings', b) }
function getOrders(){ return LS.get('ros_orders', []) }
function saveOrders(o){ LS.set('ros_orders', o) }
function getTx(user){ return LS.get('ros_tx', []).filter(t=>!user||t.user===user) }

// ---------- Toast ----------
function toast(msg, kind){
  const t=document.createElement('div');
  t.className='toast'+(kind==='error'?' error':'');
  t.textContent=msg;
  document.body.appendChild(t);
  setTimeout(()=>t.remove(), 3200);
}

// ---------- Icons (inline SVG) ----------
const ICONS = {
  utensils: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8"/><path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7"/><path d="m2.1 21.8 6.4-6.3"/><path d="m19 5-7 7"/></svg>',
  menu: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>',
  x: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
  star: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  award: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>',
  leaf: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19.2 2.96a1 1 0 0 1 1.8.5c0 6.9-7 13.5-10 13.5"/><path d="M2 21c0-3 1.85-5.36 5.08-6"/></svg>',
  sparkles: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>',
  fish: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z"/><path d="M18 12v.5"/><path d="M16 17.93a9.77 9.77 0 0 1 0-11.86"/><path d="M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33"/><path d="M10.46 7.26C10.2 5.88 9.17 4.24 8 3h5.8a2 2 0 0 1 1.98 1.67l.23 1.4"/><path d="m16.01 17.93-.23 1.4A2 2 0 0 1 13.8 21H9.5a5.96 5.96 0 0 0 1.49-3.98"/></svg>',
  music: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
  flame: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
  search: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
  plus: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>',
  minus: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>',
  trash: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  user: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>',
  pin: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>',
  lock: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
  phone: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
  mail: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
  mappin: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>',
};

// ---------- Layout (navbar + footer) ----------
function renderLayout(activePath){
  const navLinks = [['/','Home'],['/menu','Menu'],['/reserve','Reserve'],['/order','Order'],['/account','Account'],['/manager','Manager']];
  const isActive = (p) => activePath === p || (p!=='/' && activePath.startsWith(p));
  const user = currentUser();
  const authBtnDesktop = user
    ? `<button class="btn btn-outline btn-sm" onclick="signOut()">Sign Out</button>`
    : `<a class="btn btn-primary btn-sm" href="/signin">Sign In</a>`;
  const navHtml = `
    <header class="nav">
      <div class="nav-inner">
        <a class="brand" href="/">
          <span class="brand-mark">${ICONS.utensils}</span>
          <span>
            <div class="brand-name">REST-O-SORT</div>
            <div class="brand-sub">FINE DINING</div>
          </span>
        </a>
        <nav class="nav-links">
          ${navLinks.map(([h,l])=>`<a class="nav-link${isActive(h)?' active':''}" href="${h}">${l}</a>`).join('')}
        </nav>
        <div class="nav-cta">${authBtnDesktop}</div>
        <button class="nav-toggle" onclick="document.getElementById('navMobile').classList.toggle('open')">${ICONS.menu}</button>
      </div>
      <div id="navMobile" class="nav-mobile">
        ${navLinks.map(([h,l])=>`<a class="nav-link" href="${h}">${l}</a>`).join('')}
        ${authBtnDesktop}
      </div>
    </header>`;
  const footHtml = `
    <footer class="footer">
      <div class="footer-grid">
        <div>
          <div class="brand" style="margin-bottom:1rem"><span class="brand-mark" style="width:20px;height:20px">${ICONS.utensils}</span>
            <span><div class="brand-name" style="font-size:1.1rem">REST-O-SORT</div><div class="brand-sub" style="font-size:9px">FINE DINING</div></span>
          </div>
          <p style="font-size:.875rem;color:rgba(245,240,224,.6);line-height:1.7">Where every meal becomes an unforgettable story.</p>
        </div>
        <div>
          <h4>Navigation</h4>
          <ul>
            <li><a href="/">Home</a></li><li><a href="/menu">Menu</a></li>
            <li><a href="/reserve">Reserve</a></li><li><a href="/order">Order</a></li>
          </ul>
        </div>
        <div><h4>Dining Zones</h4><ul><li>Fish Pond</li><li>Live Music</li><li>Open Kitchen</li></ul></div>
        <div><h4>Contact</h4><ul>
          <li class="footer-row">${ICONS.mappin} 17 Heritage Lane, Mumbai</li>
          <li class="footer-row">${ICONS.phone} +91 98 1234 5678</li>
          <li class="footer-row">${ICONS.mail} hello@rest-o-sort.com</li>
        </ul></div>
      </div>
      <div class="footer-bottom">© 2026 Rest-O-Sort · Crafted with passion</div>
    </footer>`;
  document.body.insertAdjacentHTML('afterbegin', navHtml);
  document.body.insertAdjacentHTML('beforeend', footHtml);
}

// ---------- Page initializers ----------
window.addEventListener('DOMContentLoaded', () => {
  const path = location.pathname.replace(/\.html$/,'').replace(/\/$/, '') || '/';
  renderLayout(path);
  if (typeof initPage === 'function') initPage();
});
