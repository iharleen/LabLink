/* App shell: navigation, dashboard, profile/settings, UI helpers */
let page='dashboard',admin=false;
const PAGES=[['dashboard','Dashboard'],['catalogue','Equipment Catalogue'],['book','Book Equipment'],['mybookings','My Bookings'],['requests','Manage Requests'],['maintenance','Maintenance'],['analytics','Analytics'],['notifications','Notifications'],['profile','Profile & Settings']];
function toast(m,t=''){const e=document.createElement('div');e.className='toast '+t;e.textContent=m;$('#toasts').append(e);setTimeout(()=>e.remove(),3000)}
function modal(h){$('#modal').innerHTML='<div class=mbox>'+h+'</div>';$('#modal').classList.add('open')}
function closeModal(){$('#modal').classList.remove('open')}
function confirmDlg(m,fn){modal(`<p>${esc(m)}</p><div class=row><button class="btn ghost" onclick=closeModal()>Cancel</button><button class="btn danger" id=cy>Confirm</button></div>`);$('#cy').onclick=()=>{closeModal();fn()}}
const badge=s=>`<span class="badge ${s.toLowerCase().replace(/ /g,'-')}">${esc(s)}</span>`;
function go(p,arg){page=p;$('#side').classList.remove('show');render(arg)}
function render(arg){const V={dashboard:viewDashboard,catalogue:viewCatalogue,book:viewBook,mybookings:viewMyBookings,requests:viewRequests,maintenance:viewMaintenance,analytics:viewAnalytics,notifications:viewNotifications,profile:viewProfile};
 $('#nav').innerHTML=PAGES.map(p=>`<button data-p=${p[0]} class="${p[0]===page?'on':''}">${p[1]}</button>`).join('');$$('#nav button').forEach(b=>b.onclick=()=>go(b.dataset.p));
 $('#title').textContent=PAGES.find(p=>p[0]===page)[1];try{V[page](arg)}catch(e){console.error(e);$('#view').innerHTML='<div class=empty>Something went wrong. Try Reset demo data in Profile.</div>'}
 const u=DB.d.notifications.filter(n=>!n.read).length;$('#nb').textContent=u||'';document.documentElement.dataset.theme=DB.d.settings.theme}
function viewDashboard(){const E=DB.d.equipment,B=DB.d.bookings,now=E.filter(e=>!e.maintenance&&availNow(e)>0).length,res=B.filter(b=>b.status==='Active'||(b.status==='Approved'&&b.date===today())).reduce((a,b)=>a+b.qty,0);
 const S=[['Total equipment',E.length],['Available now',now],['Currently reserved (units)',res],['Pending requests',B.filter(b=>b.status==='Pending').length],['Under maintenance',E.filter(e=>e.maintenance).length]];
 const up=B.filter(b=>b.studentId===DB.d.profile.studentId&&['Pending','Approved'].includes(b.status)&&b.date>=today()).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,5);
 $('#view').innerHTML=`<div class="card hero"><h2>Hello, ${esc(DB.d.profile.name.split(' ')[0])} 👋</h2><p>${new Date().toLocaleDateString(undefined,{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p><div class=row><button class="btn ghost" style="color:#fff" onclick="go('catalogue')">Browse Equipment</button><button class="btn ghost" style="color:#fff" onclick="go('book')">Book Equipment</button><button class="btn ghost" style="color:#fff" onclick="go('maintenance')">Report an Issue</button><button class="btn ghost" style="color:#fff" onclick="go('mybookings')">My Bookings</button></div></div>
 <div class=grid>${S.map(s=>`<div class="card stat"><b>${s[1]}</b><span>${s[0]}</span></div>`).join('')}</div><br>
 <div class="grid g2"><div class=card><b>Recent reservations</b>${B.length?`<div class=tw><table>${B.slice(-5).reverse().map(b=>`<tr><td>${esc(DB.eqName(b.equipmentId))}<td>${esc(b.studentName)}<td>${b.date}<td>${badge(b.status)}</tr>`).join('')}</table></div>`:'<div class=empty>No reservations</div>'}</div>
 <div class=card><b>My upcoming bookings</b>${up.length?`<div class=tw><table>${up.map(b=>`<tr><td>${esc(DB.eqName(b.equipmentId))}<td>${b.date}<td>${b.start}–${b.end}<td>${badge(b.status)}</tr>`).join('')}</table></div>`:'<div class=empty>Nothing upcoming</div>'}</div>
 <div class=card><b>Most reserved equipment</b><div><canvas id=c1></canvas></div></div><div class=card><b>Weekly booking activity</b><div><canvas id=c2></canvas></div></div></div>`;drawDashCharts()}
function viewProfile(){const p=DB.d.profile,f=[['name','Full name'],['studentId','Student ID'],['email','Email'],['department','Department'],['year','Academic year'],['phone','Phone']];
 $('#view').innerHTML=`<div class=card><h3>Profile</h3><div class=form>${f.map(x=>`<div><label>${x[1]}</label><input id=p_${x[0]} value="${esc(p[x[0]])}"></div>`).join('')}</div><div class=row><button class=btn id=ps>Save profile</button></div></div><br><div class=card><h3>Settings & data</h3><div class=row><button class="btn ghost" id=th>Switch to ${DB.d.settings.theme=='dark'?'light':'dark'} mode</button><button class="btn ghost" onclick="DB.export()">Export JSON</button><label class="btn ghost" style="display:inline-block;color:var(--tx)">Import JSON<input type=file id=imp accept=.json hidden></label><button class="btn ghost" id=rs>Restore demo data</button><button class="btn danger" id=cl>Clear all data</button></div><small>Demonstration records are labelled “demo”. Data is stored only in this browser.</small></div>`;
 $('#ps').onclick=()=>{const n={};for(const x of f){n[x[0]]=$('#p_'+x[0]).value.trim();if(!n[x[0]]&&x[0]!=='phone')return toast('All fields except phone are required','err')}DB.d.profile=n;DB.save();toast('Profile saved')};
 $('#th').onclick=()=>{DB.d.settings.theme=DB.d.settings.theme=='dark'?'light':'dark';DB.save();render()};
 $('#imp').onchange=e=>{const r=new FileReader();r.onload=()=>{DB.import(r.result)?(toast('Imported'),render()):toast('Invalid LabLink JSON file','err')};r.readAsText(e.target.files[0])};
 $('#rs').onclick=()=>confirmDlg('Replace all data with the original demo dataset?',()=>{DB.reset();toast('Demo data restored');render()});
 $('#cl').onclick=()=>confirmDlg('Delete ALL equipment, bookings, reports and notifications?',()=>{DB.clear();toast('Data cleared');render()})}
document.addEventListener('DOMContentLoaded',()=>{DB.load();$('#menu').onclick=()=>$('#side').classList.toggle('show');$('#bell').onclick=()=>go('notifications');
 $('#adm').onchange=e=>{admin=e.target.checked;toast(admin?'Demo Admin Mode ON (not secure authentication)':'Admin mode off');render()};
 $('#modal').onclick=e=>{if(e.target.id==='modal')closeModal()};render()});
