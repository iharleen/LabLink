const LIVE=['Approved','Active'],BF={q:'',st:'',dt:''};
/* Peak concurrent quantity in use for an equipment/time window (approved+active only) */
function peak(id,date,s,e,ex){const L=DB.d.bookings.filter(b=>b.equipmentId===id&&b.id!==ex&&LIVE.includes(b.status)&&b.date===date&&b.start<e&&s<b.end);
 return Math.max(0,...[s,...L.map(b=>b.start).filter(t=>t>s&&t<e)].map(t=>L.filter(b=>b.start<=t&&t<b.end).reduce((a,b)=>a+b.qty,0)))}
const free=(id,date,s,e,ex)=>DB.eq(id).total-peak(id,date,s,e,ex);
let busy=false;
function viewBook(pre){const p=DB.d.profile;
 $('#view').innerHTML=`<div class=card><h3>Book equipment</h3><div class=form><div class=full><label>Equipment</label><select id=b1>${DB.d.equipment.map(e=>`<option value="${e.id}" ${e.maintenance?'disabled':''} ${pre===e.id?'selected':''}>${esc(e.name)}${e.maintenance?' (under maintenance)':''}`).join('')}</select></div>
 <div><label>Student name</label><input id=b2 value="${esc(p.name)}"></div><div><label>Student ID</label><input id=b3 value="${esc(p.studentId)}"></div><div><label>Department</label><input id=b4 value="${esc(p.department)}"></div><div><label>Email</label><input id=b5 type=email value="${esc(p.email)}"></div>
 <div><label>Date</label><input id=b6 type=date min="${today()}"></div><div><label>Start</label><input id=b7 type=time></div><div><label>End</label><input id=b8 type=time></div><div><label>Quantity</label><input id=b9 type=number min=1 value=1></div><div class=full><label>Purpose</label><textarea id=b10></textarea></div></div><p id=be class=err-t></p><p id=bi style="color:var(--mu);font-size:13px"></p><button class=btn id=bs>Submit request</button></div>`;
 const info=()=>{const id=$('#b1').value,d=$('#b6').value,s=$('#b7').value,e=$('#b8').value;$('#bi').textContent=d&&s&&e&&s<e&&id?`Available for that slot: ${free(id,d,s,e)} of ${DB.eq(id).total}`:''};$$('#b1,#b6,#b7,#b8').forEach(i=>i.onchange=info);
 $('#bs').onclick=()=>{if(busy)return;const v=k=>$('#b'+k).value.trim(),id=v(1),q=+v(9),err=m=>$('#be').textContent=m;
  if(![2,3,4,5,6,7,8,10].every(k=>v(k)))return err('Please complete every field.');
  if(!/^\S+@\S+\.\S+$/.test(v(5)))return err('Enter a valid email.');
  if(v(6)<today())return err('Booking date cannot be in the past.');
  if(v(7)>=v(8))return err('End time must be after start time.');
  if(!Number.isInteger(q)||q<1)return err('Quantity must be a whole number ≥ 1.');
  const e=DB.eq(id);if(!e||e.maintenance)return err('This equipment is under maintenance and cannot be booked.');
  if(q>e.total)return err(`Only ${e.total} units exist in total.`);
  const f=free(id,v(6),v(7),v(8));if(q>f)return err(`Only ${f} unit(s) available in that time slot.`);
  busy=true;$('#bs').disabled=true;const b={id:uid('BK'),equipmentId:id,studentName:v(2),studentId:v(3),department:v(4),email:v(5),date:v(6),start:v(7),end:v(8),qty:q,purpose:v(10),status:'Pending',created:today(),flagged:false};
  DB.d.bookings.push(b);notify(`Booking ${b.id} submitted for ${e.name}`);DB.save();busy=false;toast('Request submitted — status Pending');go('mybookings')}}
function bTable(L,admin){return L.length?`<div class=tw><table><tr><th>ID<th>Student<th>Equipment<th>Date<th>Time<th>Qty<th>Status<th></tr>${L.map(b=>`<tr><td>${b.id}<td>${esc(b.studentName)}<br><small>${esc(b.studentId)}</small><td>${esc(DB.eqName(b.equipmentId))}<td>${b.date}<td>${b.start}–${b.end}<td>${b.qty}<td>${badge(b.status)}${b.flagged?' ⚠️ review':''}<td>${admin?actions(b):`<button class="btn sm ghost" onclick="bDetail('${b.id}')">Details</button> `+(['Pending','Approved'].includes(b.status)?`<button class="btn sm danger" onclick="setStatus('${b.id}','Cancelled')">Cancel</button>`:'')}</tr>`).join('')}</table></div>`:'<div class=empty>📭 No bookings found</div>'}
function actions(b){const A={Pending:['Approved','Rejected','Cancelled'],Approved:['Active','Cancelled'],Active:['Completed','Cancelled']}[b.status]||[];return A.map(s=>`<button class="btn sm ${s=='Approved'||s=='Completed'||s=='Active'?'ok':'danger'}" onclick="setStatus('${b.id}','${s}')">${{Approved:'Approve',Rejected:'Reject',Cancelled:'Cancel',Active:'Mark Active',Completed:'Complete'}[s]}</button>`).join(' ')||'—'}
function setStatus(id,s){const b=DB.d.bookings.find(x=>x.id===id);
 if(s==='Approved'){if(b.status!=='Pending')return;const e=DB.eq(b.equipmentId);if(!e||e.maintenance)return toast('Equipment unavailable','err');if(b.qty>free(b.equipmentId,b.date,b.start,b.end,b.id))return toast('Approval would exceed available stock','err')}
 if(s==='Rejected'&&b.status!=='Pending')return;
 b.status=s;if(s==='Approved')b.flagged=false;notify(`Booking ${id} ${s.toLowerCase()}`);DB.save();toast('Booking '+s.toLowerCase());render()}
function bDetail(id){const b=DB.d.bookings.find(x=>x.id===id);modal(`<h3>${b.id} ${badge(b.status)}</h3><p>${esc(DB.eqName(b.equipmentId))} × ${b.qty}<br>${b.date}, ${b.start}–${b.end}<br>${esc(b.studentName)} (${esc(b.studentId)}), ${esc(b.department)}<br>${esc(b.email)}<br><b>Purpose:</b> ${esc(b.purpose)}</p><button class=btn onclick=closeModal()>Close</button>`)}
function viewMyBookings(){const me=DB.d.profile.studentId;
 $('#view').innerHTML=`<div class=row><input id=mq placeholder="Search…" value="${esc(BF.q)}" style="max-width:220px"><select id=ms><option value="">All statuses${['Pending','Approved','Active','Completed','Cancelled','Rejected'].map(s=>`<option ${BF.st==s?'selected':''}>${s}`).join('')}</select><input id=md type=date value="${BF.dt}" style="max-width:170px"></div><div class=card id=ml></div>`;
 const d=()=>{BF.q=$('#mq').value;BF.st=$('#ms').value;BF.dt=$('#md').value;$('#ml').innerHTML=bTable(DB.d.bookings.filter(b=>b.studentId===me&&(!BF.st||b.status===BF.st)&&(!BF.dt||b.date===BF.dt)&&(DB.eqName(b.equipmentId)+b.id+b.purpose).toLowerCase().includes(BF.q.toLowerCase())).sort((a,b)=>b.date.localeCompare(a.date)))};$$('#mq,#ms,#md').forEach(i=>i.oninput=d);d()}
function viewRequests(){$('#view').innerHTML=(admin?'':'<div class=note>🔒 Demo Admin Mode is off. Enable it in the top bar to manage requests. (Frontend-only toggle — not real authentication.)</div>')+`<div class=card>${bTable([...DB.d.bookings].reverse(),admin)}</div>`}
