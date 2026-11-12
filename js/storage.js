/* Central storage: single versioned key, safe load/save, validation, import/export */
const KEY='lablink_data_v1';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const today=(o=0)=>{const d=new Date();d.setDate(d.getDate()+o);return new Date(d-d.getTimezoneOffset()*6e4).toISOString().slice(0,10)};
const uid=p=>p+'-'+Date.now().toString(36).toUpperCase().slice(-5)+Math.random().toString(36).slice(2,4).toUpperCase();
const SECTIONS=['profile','equipment','bookings','maintenanceReports','notifications','settings'];
const ICONS={Electronics:'⚡',Embedded:'🔌',Tools:'🔧',Measurement:'📏',Biology:'🔬',Chemistry:'🧪',Kits:'🧰'};
const DB={d:null,
seed(){
 const E=[['Digital Multimeter','Electronics',10,'EE Lab 1','6.5-digit, 1000V, 10A'],['Oscilloscope','Electronics',6,'EE Lab 1','100 MHz, 2 channel'],['Function Generator','Electronics',5,'EE Lab 2','0.1 Hz–25 MHz'],['Arduino Uno','Embedded',15,'Embedded Lab','ATmega328P, 5V'],['Raspberry Pi','Embedded',8,'Embedded Lab','Pi 4B, 4GB RAM'],['Digital Storage Oscilloscope','Electronics',4,'EE Lab 2','200 MHz, 1 GS/s'],['Soldering Station','Tools',8,'Workshop','60W, temp controlled'],['Regulated DC Power Supply','Electronics',9,'EE Lab 1','0–30V, 0–5A'],['Vernier Caliper','Measurement',12,'Mech Lab','0–150 mm, 0.01 mm'],['Digital Microscope','Biology',4,'Bio Lab','1000x, USB camera'],['Spectrophotometer','Chemistry',2,'Chem Lab','190–1100 nm'],['Centrifuge','Chemistry',3,'Chem Lab','15000 RPM'],['Electronic Component Kit','Kits',20,'Store Room','500+ parts'],['Sensor Development Kit','Kits',10,'Embedded Lab','37 sensors'],['Logic Analyzer','Electronics',4,'EE Lab 2','16 ch, 100 MHz'],['Breadboard Kit','Kits',25,'Store Room','830 pt + jumpers'],['Digital Thermometer','Measurement',14,'Chem Lab','-50 to 300 °C'],['Signal Generator','Electronics',5,'EE Lab 2','RF up to 1 GHz']];
 const equipment=E.map((e,i)=>({id:'EQ-'+String(i+1).padStart(3,'0'),name:e[0],category:e[1],description:e[0]+' for undergraduate laboratory work.',specs:e[4],total:e[2],location:e[3],condition:'Good',maintenance:false}));
 equipment[14].maintenance=true;equipment[14].condition='Under Inspection';
 const S={n:'Demo Student',id:'STU-2026-001',d:'Electronics Engineering',e:'demo.student@college.edu'};
 const B=(i,q,o,s,e,n,st,me,p)=>({id:'BK-DEMO'+i,equipmentId:'EQ-'+String(q).padStart(3,'0'),studentName:me?S.n:n,studentId:me?S.id:'STU-2026-0'+(40+i),department:S.d,email:S.e,date:today(o),start:s,end:e,qty:n=='x'?1:2,purpose:p,status:st,created:today(-3),flagged:false});
 const bookings=[B(1,2,2,'10:00','12:00','x','Pending',1,'Circuit lab 4'),B(2,1,3,'14:00','16:00','x','Approved',1,'Sensor calibration'),B(3,4,0,'09:00','18:00','x','Active',1,'Final-year IoT project'),B(4,5,-5,'10:00','12:00','x','Completed',1,'OS demo'),B(5,9,-2,'11:00','12:00','x','Cancelled',1,'Measurement practice'),
 B(6,2,2,'10:00','13:00','Riya Verma','Approved',0,'Waveform study'),B(7,12,1,'09:00','11:00','Kabir Singh','Rejected',0,'Centrifuge trial'),B(8,10,4,'13:00','15:00','Meera Nair','Pending',0,'Slide analysis'),B(9,8,-4,'10:00','12:00','Arjun Rao','Completed',0,'Power supply test')];
 const mr=(i,q,c,d,p,s,n)=>({id:'MR-DEMO'+i,equipmentId:'EQ-'+String(q).padStart(3,'0'),category:c,description:d,priority:p,date:today(-i),status:s,notes:n,history:[{s,date:today(-i)}]});
 const nt=(m,r)=>({id:uid('N'),msg:m,type:'info',date:new Date().toISOString(),read:r});
 return{profile:{name:S.n,studentId:S.id,email:S.e,department:S.d,year:'3rd Year',phone:'+91 90000 00000'},equipment,bookings,
 maintenanceReports:[mr(1,15,'Not Functioning','Channel 3 shows no signal (demo)','High','Under Inspection','Probe check pending'),mr(2,12,'Calibration Required','Speed drifts (demo)','Medium','Resolved','Recalibrated'),mr(3,10,'Physical Damage','Cracked stand (demo)','Low','Reported','')],
 notifications:[nt('Demo: booking BK-DEMO2 approved',false),nt('Demo: booking BK-DEMO1 submitted',false),nt('Demo: Logic Analyzer unavailable for maintenance',false),nt('Demo: maintenance MR-DEMO2 resolved',true),nt('Welcome to LabLink (demonstration data)',true)],settings:{theme:'light'}}},
valid(d){return d&&typeof d==='object'&&SECTIONS.every(k=>k in d)&&['equipment','bookings','maintenanceReports','notifications'].every(k=>Array.isArray(d[k]))},
load(){try{const d=JSON.parse(localStorage.getItem(KEY));if(this.valid(d))return this.d=d}catch(e){console.warn('Corrupt data, reseeding')}this.d=this.seed();this.save();return this.d},
save(){try{localStorage.setItem(KEY,JSON.stringify(this.d))}catch(e){console.warn('Save failed',e)}},
reset(){this.d=this.seed();this.save()},
clear(){this.d={profile:this.seed().profile,equipment:[],bookings:[],maintenanceReports:[],notifications:[],settings:this.d.settings};this.save()},
export(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(this.d,null,2)],{type:'application/json'}));a.download='lablink-data.json';a.click()},
import(txt){let d;try{d=JSON.parse(txt)}catch(e){return false}if(!this.valid(d))return false;this.d=d;this.save();return true},
eq(id){return this.d.equipment.find(e=>e.id===id)},eqName(id){return this.eq(id)?.name||'(deleted)'}};
