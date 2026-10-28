// FOOTEAM - Supabase Auth, catálogo e Storage.
const SUPABASE_URL = 'https://svspvrvzndrfbonrjfxc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_UX7h2_hvaHWEItmsRSjuVg_B2GScC5R';
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const WHATSAPP_NUMBER = '5511986338370';
const defaults = [];
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const safeUrl = value => {try {const u=new URL(value);return u.protocol==='https:' ? u.href : '';}catch{return '';}};
const productFromDB = p => ({...p, price:Number(p.price)||0, colors:Array.isArray(p.colors)?p.colors:['#ff671f','#151515'], images:Array.isArray(p.images)?p.images:[], image:Array.isArray(p.images)?p.images[0]||'':''});
async function loadProducts(){
  const {data,error}=await db.from('products').select('id,name,price,category,type,colors,badge,images').order('created_at',{ascending:false});
  if(error)throw error;
  products=(data||[]).map(productFromDB);
  renderProducts();renderCart();if(isAdmin())renderAdmin();
}
async function restoreSession(){
  const {data:{user},error}=await db.auth.getUser();
  if(error || !user){session=null;updateAccountUI();return;}
  const {data:profile,error:profileError}=await db.from('profiles').select('id,name,email,role').eq('id',user.id).single();
  if(profileError){session={id:user.id,name:user.user_metadata?.name||user.email,email:user.email,role:'user'};}
  else session={id:user.id,name:profile.name||user.email,email:user.email,role:profile.role==='admin'?'admin':'user'};
  updateAccountUI();
}
const money=n=>n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let products=[];
let cart=JSON.parse(localStorage.getItem('footeam-cart')||'[]');
let session=null;
let activeFilter='Todos', query='';

function save(){localStorage.setItem('footeam-cart',JSON.stringify(cart));}
function setSession(user){session=user;updateAccountUI();}
function openDialog(dialog){
  if(!dialog)return;
  if(typeof dialog.showModal==='function'){
    if(!dialog.open)dialog.showModal();
  }else{
    dialog.setAttribute('open','');
    dialog.classList.add('dialog-fallback-open');
  }
}
function closeDialog(dialog){
  if(!dialog)return;
  if(typeof dialog.close==='function' && dialog.open)dialog.close();
  else{
    dialog.removeAttribute('open');
    dialog.classList.remove('dialog-fallback-open');
  }
}

function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2600)}
function isAdmin(){return session?.role==='admin';}

function updateAccountUI(){
  const label=$('#accountLabel');
  if(!label)return;
  if(session){
    label.textContent=session.name.split(' ')[0];
    $('#accountName').textContent=session.name;
    $('#accountEmail').textContent=session.email;
    $('#accountRole').textContent=isAdmin()?'ADMINISTRADOR':'CLIENTE';
    $('#accountRole').classList.toggle('admin-role',isAdmin());
    $('#openAdminFromAccount').classList.toggle('hidden',!isAdmin());
  }else{
    label.textContent='Entrar';
  }
}

function productImages(p){
  if(Array.isArray(p.images) && p.images.length) return p.images.filter(Boolean);
  if(p.image) return [p.image];
  return [];
}

function jersey(p){
  const imgs=productImages(p);
  if(imgs.length){
    return `<div class="mini-jersey product-photo-wrap" style="--c1:${p.colors[0]}">
      <img class="product-photo" src="${safeUrl(imgs[0])}" alt="${escapeHtml(p.name)}"/>
      ${imgs.length>1?`<span class="photo-count">+${imgs.length-1}</span>`:''}
    </div>`;
  }
  return `<div class="mini-jersey" style="--c1:${p.colors[0]}"><img class="mini-logo" src="footeam-logo.png" alt="FOOTEAM"/></div>`;
}
function renderProducts(){
  const list=products.filter(p=>(activeFilter==='Todos'||p.category===activeFilter)&&(p.name+p.type).toLowerCase().includes(query.toLowerCase()));
  $('#productGrid').innerHTML=list.map(p=>`<article class="product-card" data-id="${escapeHtml(p.id)}" style="--c1:${/^#[0-9a-f]{6}$/i.test(p.colors[0])?p.colors[0]:'#ff671f'};--c2:${/^#[0-9a-f]{6}$/i.test(p.colors[1])?p.colors[1]:'#151515'}"><div class="product-visual"><span class="badge">${escapeHtml(p.badge||p.category)}</span>${jersey(p)}<span class="quick">Ver detalhes</span></div><div class="product-info"><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.type)} • ID ${escapeHtml(p.id)}</p><strong>${money(p.price)}</strong></div></article>`).join('');
  $('#emptyProducts').classList.toggle('hidden',list.length>0);
  $$('.product-card').forEach(c=>c.onclick=()=>openProduct(c.dataset.id));
}
function openProduct(id){
  const p=products.find(x=>x.id===id); if(!p)return;
  let size='M';
  const imgs=productImages(p);
  const gallery=imgs.length
    ? `<div class="product-gallery">
         <div class="gallery-main"><img id="galleryMainImage" src="${safeUrl(imgs[0])}" alt="${escapeHtml(p.name)}"/></div>
         ${imgs.length>1?`<div class="gallery-thumbs">${imgs.map((src,i)=>`<button type="button" class="${i===0?'active':''}" data-gallery-index="${i}" aria-label="Ver foto ${i+1}"><img src="${safeUrl(src)}" alt="Foto ${i+1} de ${escapeHtml(p.name)}"/></button>`).join('')}</div>`:''}
       </div>`
    : `<div class="modal-art" style="--c1:${/^#[0-9a-f]{6}$/i.test(p.colors[0])?p.colors[0]:'#ff671f'};--c2:${/^#[0-9a-f]{6}$/i.test(p.colors[1])?p.colors[1]:'#151515'}">${jersey(p)}</div>`;

  $('#modalContent').innerHTML=`<div class="modal-grid">
    ${gallery}
    <div class="modal-copy">
      <p class="eyebrow">${escapeHtml(p.category)} / ${escapeHtml(p.badge)}</p>
      <h2>${escapeHtml(p.name)}</h2>
      <p>${escapeHtml(p.type)} • ID ${escapeHtml(p.id)}</p>
      <p class="price">${money(p.price)}</p>
      <p>Acabamento premium, escudo aplicado e tecido leve. Consulte a disponibilidade no atendimento.</p>
      <b>Escolha o tamanho</b>
      <div class="sizes">${['P','M','G','GG','2XL'].map(s=>`<button data-size="${s}" class="${s==='M'?'active':''}">${s}</button>`).join('')}</div>
      <label>Quantidade<select id="modalQty"><option>1</option><option>2</option><option>3</option><option>4</option></select></label>
      <button id="addCart" class="btn primary">Adicionar à sacola →</button>
    </div>
  </div>`;

  $$('[data-gallery-index]').forEach(btn=>btn.onclick=()=>{
    const i=+btn.dataset.galleryIndex;
    $('#galleryMainImage').src=imgs[i];
    $$('[data-gallery-index]').forEach(x=>x.classList.toggle('active',x===btn));
  });

  $$('.sizes button').forEach(b=>b.onclick=()=>{
    $$('.sizes button').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    size=b.dataset.size;
  });
  $('#addCart').onclick=()=>{addToCart(p.id,size,+$('#modalQty').value);closeDialog($('#productModal'))};
  openDialog($('#productModal'));
}
function addToCart(id,size,qty){const old=cart.find(x=>x.id===id&&x.size===size);old?old.qty+=qty:cart.push({id,size,qty});save();renderCart();toast('Camisa adicionada à sacola')}
function renderCart(){
  let total=0,count=0;
  $('#cartItems').innerHTML=cart.length?cart.map((item,i)=>{const p=products.find(x=>x.id===item.id);if(!p)return'';total+=p.price*item.qty;count+=item.qty;return `<div class="cart-item"><div class="cart-thumb"><img src="footeam-logo.png" alt="FOOTEAM"/></div><div><h4>${escapeHtml(p.name)}</h4><p>Tam. ${item.size} • Qtd. ${item.qty}</p><strong>${money(p.price*item.qty)}</strong></div><button data-remove="${i}" aria-label="Remover">×</button></div>`}).join(''):'<div class="empty"><strong>Sua sacola está vazia.</strong><p>Escolha uma camisa para começar.</p></div>';
  $('#cartTotal').textContent=money(total);$('#cartCount').textContent=count;
  $$('[data-remove]').forEach(b=>b.onclick=()=>{cart.splice(+b.dataset.remove,1);save();renderCart()});
}
function openCart(){renderCart();$('#cartDrawer').classList.add('open');$('#cartDrawer').setAttribute('aria-hidden','false');$('#overlay').classList.add('show')}
function closeCart(){$('#cartDrawer').classList.remove('open');$('#cartDrawer').setAttribute('aria-hidden','true');$('#overlay').classList.remove('show')}
function wa(text){const url=WHATSAPP_NUMBER?`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`:`https://wa.me/?text=${encodeURIComponent(text)}`;window.open(url,'_blank','noopener')}
function checkout(){
  if(!cart.length)return toast('Adicione uma camisa antes de finalizar');
  const lines=cart.map(i=>{const p=products.find(x=>x.id===i.id);return `• ${escapeHtml(p.name)}\n  ID: ${escapeHtml(p.id)} | Tamanho: ${i.size} | Quantidade: ${i.qty}`});
  const total=cart.reduce((s,i)=>s+(products.find(p=>p.id===i.id)?.price||0)*i.qty,0);
  const customer=session?`\nCliente: ${session.name} (${session.email})\n`:'';
  wa(`Olá, FOOTEAM! Quero confirmar este pedido:${customer}\n${lines.join('\n')}\n\nTotal estimado: ${money(total)}\n\nGostaria de confirmar disponibilidade, pagamento e entrega.`)
}

function openAuth(mode='login',adminRequest=false){
  setAuthMode(adminRequest?'admin':mode);
  if($('#loginHint')) $('#loginHint').textContent='Acesse sua conta para continuar.';
  openDialog($('#authModal'));
  setTimeout(()=>$('#authModal input:not(.hidden)')?.focus(),50);
}
function setAuthMode(mode){
  const isLogin=mode==='login', isAdminLogin=mode==='admin', isRegister=mode==='register';
  $('#loginForm').classList.toggle('hidden',!isLogin);
  $('#adminLoginForm').classList.toggle('hidden',!isAdminLogin);
  $('#registerForm').classList.toggle('hidden',!isRegister);
  $('#loginTab').classList.toggle('active',isLogin);
  $('#adminLoginTab').classList.toggle('active',isAdminLogin);
  $('#registerTab').classList.toggle('active',isRegister);
}
function openAccount(){
  if(!session)return openAuth('login');
  updateAccountUI();openDialog($('#accountModal'));
}
async function signIn(e,adminOnly=false){
  e.preventDefault();const d=new FormData(e.target);
  const {error}=await db.auth.signInWithPassword({email:String(d.get('email')).trim(),password:String(d.get('password'))});
  if(error)return toast('Falha no login: '+error.message);
  await restoreSession();
  if(adminOnly&&!isAdmin()){await db.auth.signOut();setSession(null);return toast('Esta conta não possui acesso administrativo');}
  e.target.reset();closeDialog($('#authModal'));toast('Login realizado com sucesso');
  if(adminOnly)openAdmin();
}
async function handleLogin(e){return signIn(e,false)}
async function handleAdminLogin(e){return signIn(e,true)}
async function handleRegister(e){
  e.preventDefault();const d=new FormData(e.target);
  if(d.get('password')!==d.get('confirmPassword'))return toast('As senhas não são iguais');
  const {data,error}=await db.auth.signUp({email:String(d.get('email')).trim(),password:String(d.get('password')),options:{data:{name:String(d.get('name')).trim()}}});
  if(error)return toast('Cadastro não realizado: '+error.message);
  e.target.reset();closeDialog($('#authModal'));
  toast(data.session?'Conta criada.':'Confira seu e-mail para confirmar a conta.');
  if(data.session)await restoreSession();
}
function requireAdmin(){
  if(isAdmin())return true;
  session?toast('Sua conta não possui permissão de administrador'):openAuth('login',true);
  return false;
}
function openAdmin(){if(!requireAdmin())return;renderAdmin();openDialog($('#adminModal'))}
function renderAdmin(filter=''){
  if(!isAdmin())return;
  const inventory=products.length;
  $('#adminStats').innerHTML=`<div><span>Produtos</span><strong>${inventory}</strong></div><div><span>Itens na sacola</span><strong>${cart.reduce((s,x)=>s+x.qty,0)}</strong></div><div><span>Usuários</span><strong>—</strong></div>`;
  const term=filter.trim().toLowerCase();
  const visible=products.filter(p=>(p.name+p.id+p.category+p.type).toLowerCase().includes(term));
  $('#adminProducts').innerHTML=visible.length?visible.map(p=>`<div class="admin-row">
    <div class="admin-product-meta">${productImages(p).length?`<img src="${safeUrl(p.image)}" alt=""/>`:`<img src="footeam-logo.png" alt=""/>`}<span><b>${escapeHtml(p.id)}</b><strong>${escapeHtml(p.name)}</strong><small>${escapeHtml(p.category)} • ${escapeHtml(p.type)} • ${money(p.price)}</small></span></div>
    <button data-edit="${escapeHtml(p.id)}">Editar</button><button data-delete="${escapeHtml(p.id)}" class="danger-btn">Excluir</button>
  </div>`).join(''):'<div class="empty"><strong>Nenhum produto encontrado.</strong></div>';

  $$('[data-edit]').forEach(b=>b.onclick=()=>{
    if(!requireAdmin())return;
    const p=products.find(x=>x.id===b.dataset.edit),f=$('#productForm');
    f.elements.namedItem('id').value=p.id;f.elements.namedItem('name').value=p.name;f.elements.namedItem('price').value=p.price;f.elements.namedItem('category').value=p.category;
    f.elements.namedItem('type').value=p.type||'Tailandesa 1.1';f.elements.namedItem('badge').value=p.badge||'';
    f.elements.namedItem('color1').value=p.colors?.[0]||'#ff671f';f.elements.namedItem('color2').value=p.colors?.[1]||'#151515';
    const savedImages=productImages(p);
    $('#existingImagesInfo').textContent=savedImages.length?`${savedImages.length} foto(s) já salva(s). Novas fotos serão adicionadas às atuais.`:'Nenhuma foto salva.';
    $('#existingImagesInfo').classList.remove('hidden');
    $('#clearProductImages').classList.toggle('hidden',savedImages.length===0);
    $('#clearProductImages').dataset.productId=p.id;
    $('#productSubmitLabel').textContent='Salvar alterações';
    $('#cancelProductEdit').classList.remove('hidden');
    setAdminTab('new');
  });
  $$('[data-delete]').forEach(b=>b.onclick=async()=>{
    if(!requireAdmin())return;
    const p=products.find(x=>x.id===b.dataset.delete);
    if(!confirm(`Excluir "${p?.name||'este produto'}" do catálogo?`))return;
    const {error}=await db.from('products').delete().eq('id',b.dataset.delete);
    if(error)return toast('Erro ao excluir: '+error.message);
    await loadProducts();toast('Produto excluído do catálogo');
  });
}


function setAdminTab(tab){
  const isNew=tab==='new';
  $('#adminNewSection').classList.toggle('hidden',!isNew);
  $('#adminManageSection').classList.toggle('hidden',isNew);
  $('#adminTabNew').classList.toggle('active',isNew);
  $('#adminTabManage').classList.toggle('active',!isNew);
  if(!isNew)renderAdmin($('#adminProductSearch')?.value||'');
}
function resetProductForm(){
  const f=$('#productForm');f.reset();f.elements.namedItem('id').value='';
  f.elements.namedItem('color1').value='#ff671f';f.elements.namedItem('color2').value='#151515';
  $('#productSubmitLabel').textContent='Cadastrar produto';
  $('#cancelProductEdit').classList.add('hidden');
  $('#existingImagesInfo')?.classList.add('hidden');
  $('#clearProductImages')?.classList.add('hidden');
  if($('#clearProductImages')) $('#clearProductImages').dataset.productId='';
}
function fileToDataURL(file){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=()=>resolve(reader.result);
    reader.onerror=reject;
    reader.readAsDataURL(file);
  });
}

async function imageFileToOptimizedDataURL(file){
  if(!file.type.startsWith('image/')) return fileToDataURL(file);

  const raw=await fileToDataURL(file);
  return new Promise(resolve=>{
    const img=new Image();
    img.onload=()=>{
      const maxSide=1400;
      const scale=Math.min(1,maxSide/Math.max(img.width,img.height));
      const canvas=document.createElement('canvas');
      canvas.width=Math.max(1,Math.round(img.width*scale));
      canvas.height=Math.max(1,Math.round(img.height*scale));
      const ctx=canvas.getContext('2d');
      ctx.drawImage(img,0,0,canvas.width,canvas.height);
      resolve(canvas.toDataURL('image/jpeg',0.84));
    };
    img.onerror=()=>resolve(raw);
    img.src=raw;
  });
}

async function filesToDataURLs(fileList){
  const files=[...fileList];
  return Promise.all(files.map(imageFileToOptimizedDataURL));
}

$('#filters').onclick=e=>{if(!e.target.dataset.filter)return;activeFilter=e.target.dataset.filter;$$('#filters button').forEach(b=>b.classList.toggle('active',b===e.target));renderProducts()};
$('#searchInput').oninput=e=>{query=e.target.value;renderProducts()};
$('#searchToggle').onclick=()=>{$('#produtos').scrollIntoView();setTimeout(()=>$('#searchInput').focus(),400)};
$('#cartToggle').onclick=openCart;$('#overlay').onclick=closeCart;$('[data-close="cart"]').onclick=closeCart;
$('#clearCart').onclick=()=>{if(cart.length&&confirm('Esvaziar toda a sacola?')){cart=[];save();renderCart()}};
$('#checkoutBtn').onclick=checkout;$('.modal-close').onclick=()=>$('#productModal').close();
$('#menuToggle').onclick=()=>$('#nav').classList.toggle('open');$$('#nav a').forEach(a=>a.onclick=()=>$('#nav').classList.remove('open'));
$('#contactForm').onsubmit=e=>{e.preventDefault();const d=new FormData(e.target);wa(`Olá, FOOTEAM! Meu nome é ${d.get('name')} e estou procurando: ${d.get('shirt')}. Podem me ajudar?`)};

if($('#accountToggle')) $('#accountToggle').onclick=openAccount;
$('.auth-close').onclick=()=>closeDialog($('#authModal'));
$('.account-close').onclick=()=>closeDialog($('#accountModal'));
$('#loginTab').onclick=()=>setAuthMode('login');
$('#adminLoginTab').onclick=()=>setAuthMode('admin');
$('#registerTab').onclick=()=>setAuthMode('register');
$('#loginForm').onsubmit=handleLogin;
$('#adminLoginForm').onsubmit=handleAdminLogin;
$('#registerForm').onsubmit=handleRegister;
$$('[data-toggle-password]').forEach(btn=>btn.onclick=()=>{const input=btn.parentElement.querySelector('input');const show=input.type==='password';input.type=show?'text':'password';btn.textContent=show?'Ocultar':'Mostrar'});
$('#logoutBtn').onclick=async()=>{await db.auth.signOut();setSession(null);closeDialog($('#accountModal'));toast('Sessão encerrada')};
$('#openAdminFromAccount').onclick=()=>{closeDialog($('#accountModal'));openAdmin()};

$('#adminToggle').onclick=openAdmin;
$('.admin-close').onclick=()=>closeDialog($('#adminModal'));
async function uploadImages(id,files){
  const urls=[];
  for(const file of files){
    if(!file.type.startsWith('image/')||file.size>8*1024*1024)throw new Error('Imagem inválida ou maior que 8 MB');
    const ext=(file.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'')||'jpg';
    const path=`${id}/${crypto.randomUUID()}.${ext}`;
    const {error}=await db.storage.from('product-images').upload(path,file,{contentType:file.type,upsert:false});
    if(error)throw error;
    urls.push(db.storage.from('product-images').getPublicUrl(path).data.publicUrl);
  }
  return urls;
}
$('#productForm').onsubmit=async e=>{
  e.preventDefault();if(!requireAdmin())return;
  const f=e.target,d=new FormData(f),id=String(d.get('id')||`FT${Date.now()}`);
  const existing=products.find(p=>p.id===id);
  const submit=f.querySelector('[type="submit"]');submit.disabled=true;
  try{
    const newImages=await uploadImages(id,[...f.elements.namedItem('imageFile').files]);
    const obj={id,name:String(d.get('name')).trim(),price:Number(d.get('price')),category:d.get('category'),type:d.get('type'),colors:[d.get('color1'),d.get('color2')],badge:String(d.get('badge')||'CATÁLOGO').trim(),images:[...(existing?.images||[]),...newImages]};
    const result=existing?await db.from('products').update(obj).eq('id',id):await db.from('products').insert(obj);
    if(result.error)throw result.error;
    await loadProducts();resetProductForm();setAdminTab('manage');toast(existing?'Produto atualizado':'Produto cadastrado');
  }catch(err){console.error(err);toast('Erro ao salvar: '+err.message)}
  finally{submit.disabled=false;}
};
$('#adminTabNew').onclick=()=>setAdminTab('new');
$('#adminTabManage').onclick=()=>setAdminTab('manage');
$('#adminProductSearch').oninput=e=>renderAdmin(e.target.value);
$('#cancelProductEdit').onclick=()=>resetProductForm();

$('#clearProductImages').onclick=async()=>{
  const id=$('#clearProductImages').dataset.productId;
  const p=products.find(x=>x.id===id);
  if(!p||!requireAdmin()||!confirm('Remover as referências das fotos deste produto? Os arquivos permanecerão no Storage.'))return;
  const {error}=await db.from('products').update({images:[]}).eq('id',id);
  if(error)return toast('Erro: '+error.message);
  await loadProducts();$('#existingImagesInfo').textContent='Fotos removidas do catálogo.';$('#clearProductImages').classList.add('hidden');
  toast('Fotos removidas do catálogo');
};
$$('input[type="file"]').forEach(input=>input.multiple=true);
(async function init(){
  try{await restoreSession();await loadProducts();renderCart();}
  catch(err){console.error('FOOTEAM:',err);$('#emptyProducts').classList.remove('hidden');$('#emptyProducts').innerHTML='<strong>Não foi possível carregar o catálogo.</strong><p>Confira a conexão e as políticas de leitura do Supabase.</p>';renderCart();}
})();
db.auth.onAuthStateChange(()=>setTimeout(()=>restoreSession().catch(console.error),0));

// --- Efeito elétrico dinâmico do emblema principal ---
(function initHeroLightning(){
  const layer = document.getElementById('lightningLayer');
  const stage = document.getElementById('brandEmblemStage');
  if(!layer || !stage || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const bolts = [];
  const count = 14;

  function randomizeBolt(bolt, index){
    const angle = Math.round(Math.random()*360);
    const len = 55 + Math.round(Math.random()*95);
    const delay = (Math.random()*1.5).toFixed(2);
    const dur = (0.42 + Math.random()*0.55).toFixed(2);

    bolt.style.setProperty('--rot', `${angle}deg`);
    bolt.style.setProperty('--len', `${len}px`);
    bolt.style.setProperty('--delay', `${delay}s`);
    bolt.style.setProperty('--dur', `${dur}s`);
    bolt.style.top = `${48 + (Math.random()*4-2)}%`;
    bolt.style.left = `${48 + (Math.random()*4-2)}%`;
  }

  for(let i=0;i<count;i++){
    const bolt=document.createElement('span');
    bolt.className='lightning-bolt';
    randomizeBolt(bolt,i);
    layer.appendChild(bolt);
    bolts.push(bolt);
  }

  // Reposiciona os raios ao longo do tempo para evitar um efeito repetitivo.
  setInterval(()=>{
    const amount = 3 + Math.floor(Math.random()*4);
    for(let i=0;i<amount;i++){
      randomizeBolt(bolts[Math.floor(Math.random()*bolts.length)], i);
    }
  }, 1800);

  // Pequeno estouro elétrico ao passar o mouse.
  stage.addEventListener('pointerenter',()=>{
    bolts.forEach((bolt,i)=>{
      if(i%2===0){
        bolt.style.animationDuration='.38s';
        setTimeout(()=>bolt.style.animationDuration='',700);
      }
    });
  });
})();
