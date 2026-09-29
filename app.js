'use strict';
// No build step, dependencies, remote uploads, or external rendering services.
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clone = o => JSON.parse(JSON.stringify(o));
let phoneTypography=false;
const fonts = {
  roundedSet:'"Jua", "PairNotoJP", sans-serif',
  handwrittenSet:'"Gaegu", "PairSerifJP", serif',
  editorial:'"PairSerifKR", "PairSerifJP", serif',
  noto:'"PairNotoKR", "PairNotoJP", sans-serif',
  notojp:'"PairNotoJP", "PairNotoKR", sans-serif',
  system:'Inter, "Segoe UI", "PairNotoKR", sans-serif',
  gamja:'"GamjaFlower", "Malgun Gothic", sans-serif',
  single:'"SingleDay", "Malgun Gothic", sans-serif',
  melody:'"HiMelody", "Malgun Gothic", sans-serif',
  cute:'"CuteFont", "Malgun Gothic", sans-serif',
  pen:'"NanumPenScript", "Malgun Gothic", sans-serif',
  jua: '"Jua", "Malgun Gothic", sans-serif',
  gaegu: '"Gaegu", "Malgun Gothic", sans-serif',
  sans: '"Malgun Gothic", "Apple SD Gothic Neo", "Yu Gothic", sans-serif',
  serif: 'Batang, "AppleMyungjo", "Yu Mincho", Georgia, serif',
  round: 'Gulim, "Hiragino Maru Gothic ProN", "Malgun Gothic", sans-serif',
  jp: '"Yu Gothic", Meiryo, "Hiragino Kaku Gothic ProN", "Malgun Gothic", sans-serif',
  jpserif: '"Yu Mincho", "Hiragino Mincho ProN", Batang, serif',
  classic: 'Georgia, "Times New Roman", Batang, serif',
  modern: 'Arial, Helvetica, "Malgun Gothic", sans-serif',
  mono: 'Consolas, "Courier New", "Malgun Gothic", monospace',
  custom: '"PairCustom", "Malgun Gothic", "Yu Gothic", sans-serif'
};
const webFonts = {"poor":["Poor Story","KR","Poor+Story"],"dongle":["Dongle","KR","Dongle"],"sunflower":["Sunflower","KR","Sunflower:wght@300"],"gowun":["Gowun Dodum","KR","Gowun+Dodum"],"yomogi":["Yomogi","JP","Yomogi"],"zen":["Zen Maru Gothic","JP","Zen+Maru+Gothic"],"hachi":["Hachi Maru Pop","JP","Hachi+Maru+Pop"],"mplus":["M PLUS Rounded 1c","JP","M+PLUS+Rounded+1c"],"quicksand":["Quicksand","EN","Quicksand"],"fredoka":["Fredoka","EN","Fredoka"],"patrick":["Patrick Hand","EN","Patrick+Hand"],"pacifico":["Pacifico","EN","Pacifico"]};
for(const [key,[family]] of Object.entries(webFonts))fonts[key]='"'+family+'", "PairNotoKR", "PairNotoJP", sans-serif';
fonts.pretendard='"PairPretendard", "PairNotoKR", sans-serif';
fonts.neurimbo='"PairNeurimbo", "PairNotoKR", sans-serif';
const directFonts={pretendard:['PairPretendard','local("Pretendard Regular"), local("Pretendard"), url("https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/static/woff2/Pretendard-Regular.woff2")'],neurimbo:['PairNeurimbo','local("NeurimboGothic"), local("느림보고딕")']};
fonts.suit='"PairSUIT", "PairNotoKR", sans-serif';
directFonts.suit=['PairSUIT','local("SUIT"), url("https://cdn.jsdelivr.net/gh/sun-typeface/SUIT@2.0.3/fonts/static/woff2/SUIT-Regular.woff2")'];
webFonts.inter=['Inter','EN','Inter'];fonts.inter='"Inter", "PairNotoKR", sans-serif';
webFonts.manrope=['Manrope','EN','Manrope'];fonts.manrope='"Manrope", "PairNotoKR", sans-serif';
const fontSets={displaySet:{families:['Black Han Sans','Dela Gothic One'],query:'Black+Han+Sans&family=Dela+Gothic+One'},literarySet:{families:['Hahmlet','Shippori Mincho'],query:'Hahmlet:wght@400;500;600;700&family=Shippori+Mincho:wght@400;500;600;700'},monoSet:{families:['Nanum Gothic Coding','BIZ UDGothic'],query:'Nanum+Gothic+Coding:wght@400;700&family=BIZ+UDGothic:wght@400;700'},plexSet:{families:['IBM Plex Sans KR','IBM Plex Sans JP'],query:'IBM+Plex+Sans+KR:wght@300;400;500;600;700&family=IBM+Plex+Sans+JP:wght@300;400;500;600;700'},gothicSet:{families:['Gothic A1','Zen Kaku Gothic New'],query:'Gothic+A1:wght@300;400;500;600;700&family=Zen+Kaku+Gothic+New:wght@300;400;500;700;900'}};
for(const [key,set]of Object.entries(fontSets))fonts[key]=set.families.map(f=>'"'+f+'"').join(', ')+', "PairNotoKR", "PairNotoJP", sans-serif';
for(const key of ['pretendard','suit','inter','manrope','system'])fonts[key]=fonts[key].replace(/, sans-serif$/,', "PairNotoJP", sans-serif');
const fontLoads=new Map();
let fontSelection=0;
let fontStatus="";
function fontSample(){return [...new Set(Array.from(["성별 나이 키 체형 이름 관계 서사 외관 정보 인권 NG 페어명 ABC 日本語",state.title,state.subtitle,state.story,state.etc,state.free,state.ng,state.relationA,state.relationB,...["a","b"].flatMap(side=>Object.entries(state[side]).filter(([k,v])=>typeof v==="string").map(([k,v])=>v)),...state.messages.map(m=>m.text)].join(" ")))].join("");}
function showFontStatus(message){fontStatus=message;const node=$("#font-status");if(node)node.textContent=message;}
async function ensureFont(key){
  if(fontSets[key]){if(fontLoads.has(key))return fontLoads.get(key);const set=fontSets[key];const task=(async()=>{await new Promise((resolve,reject)=>{const link=document.createElement('link');link.rel='stylesheet';link.href='https://fonts.googleapis.com/css2?family='+set.query+'&display=swap';const timer=setTimeout(()=>reject(new Error('font timeout')),15000);link.onload=()=>{clearTimeout(timer);resolve();};link.onerror=()=>{clearTimeout(timer);reject(new Error('font network'));};document.head.appendChild(link);});for(const [i,family]of set.families.entries()){const loaded=await document.fonts.load('400 22px "'+family+'"',i?'日本語あいう':'한글 ABC');if(!loaded.length)throw new Error('Font unavailable');}})();fontLoads.set(key,task);try{await task;}catch(e){fontLoads.delete(key);throw e;}return;}

  if(directFonts[key]){
    if(fontLoads.has(key))return fontLoads.get(key);
    const [family,source]=directFonts[key],face=new FontFace(family,source);
    const task=(async()=>{let timer;try{await Promise.race([face.load(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('font timeout')),12000);})]);document.fonts.add(face);}finally{clearTimeout(timer);}})();
    fontLoads.set(key,task);try{await task;}catch(e){fontLoads.delete(key);throw e;}return;
  }
  if(!webFonts[key]){await document.fonts.load('22px '+fonts[key],fontSample());return;}
  if(fontLoads.has(key))return fontLoads.get(key);
  const [family,lang,query]=webFonts[key];
  const task=(async()=>{await new Promise((resolve,reject)=>{const link=document.createElement('link');link.rel='stylesheet';link.href='https://fonts.googleapis.com/css2?family='+query+'&display=swap';const timer=setTimeout(()=>reject(new Error('font timeout')),12000);link.onload=()=>{clearTimeout(timer);resolve();};link.onerror=()=>{clearTimeout(timer);reject(new Error('font network'));};document.head.appendChild(link);});const loaded=await document.fonts.load('22px "'+family+'"',fontSample());if(!loaded.length)throw new Error('Font not loaded');})();
  fontLoads.set(key,task);try{await task;}catch(e){fontLoads.delete(key);throw e;}
}
const palette = {messageA:'#e9e9ed',messageB:'#1687ff',messageTextA:'#33313b',messageTextB:'#ffffff',bg:'#fff2f7',panel:'#ffffff',ink:'#624f69',line:'#e6cde9',a:'#bd79af',b:'#7e9ccc',bubble:'#f5e9fa'};
const blankCharacter = letter => ({name:`캐릭터 ${letter}`,en:'',jp:'',gender:'',age:'',height:'',body:'',personality:'',rights:'',appearance:'',ng:'',imageCredits:{},images:{}});
const defaults = () => ({version:1,designRevision:4,stickers:[],textStyles:{},groupSizes:{basic:30,detail:34},highlights:{a:'#ffe4a3',b:'#d7e9ff',shared:'#eee0ff'},phoneTime:'9:41',phoneComposer:true,phoneDraft:'',title:'페어명',subtitle:'',a:blankCharacter('A'),b:blankCharacter('B'),relationA:'A의 한마디',relationB:'B의 한마디',free:'관계 설명',ng:'',story:'',etc:'',messages:[{side:'a',text:'A의 대사'},{side:'b',text:'B의 대사'}],colors:{...palette},font:'noto',fontSize:34,fontWeight:500,fontFile:null});
let state = defaults(), activeTab='a', activeView='pair', db=null, crop=null, drawing=false, revision=0, savedRevision=0, saveTimer, saveQueue=Promise.resolve(), outputURL=null, outputBlob=null, outputName='pair-maker.png';
let hitAreas=[], previewLayout=null, customFace=null;
const images = new Map();
const imageSlots = [['profile','원형 프로필'],['full','전신 이미지'],['detail1','1:1 이미지 1'],['detail2','1:1 이미지 2'],['detail3','1:1 이미지 3']];
const assetKey=(side,slot)=>`${side}.${slot}`;
const notice = message => { $('#toast').textContent=message; $('#toast').classList.add('show'); clearTimeout(notice.timer); notice.timer=setTimeout(()=>$('#toast').classList.remove('show'),3500); };
const pathGet = p => p.split('.').reduce((o,k)=>o?.[k],state);
function pathSet(p,v){ const parts=p.split('.');const last=parts.pop();parts.reduce((o,k)=>o[k],state)[last]=v; }
const styleKeys=['story','etc',...['a','b'].flatMap(s=>['name','en','jp','gender','age','height','body','personality','appearance','ng'].map(k=>s+'.'+k))];
const selectedText=new Map();
function styleSize(key,fallback){if(/\.(gender|age|height|body)$/.test(key||''))return state.groupSizes.basic;if(/\.(personality|appearance|ng)$/.test(key||'')||['free','story','etc'].includes(key))return state.groupSizes.detail;return fallback;}
function defaultSize(key){return /\.name$/.test(key)?44:/\.(en|jp)$/.test(key)?26:/\.(gender|age|height|body)$/.test(key)?30:state.fontSize;}
function field(label,path,placeholder='',multi=false,max=2000){return '<label class="field">'+label+(multi?'<textarea data-path="'+path+'" maxlength="'+max+'" placeholder="'+esc(placeholder)+'">'+esc(pathGet(path))+'</textarea>':'<input data-path="'+path+'" maxlength="120" placeholder="'+esc(placeholder)+'" value="'+esc(pathGet(path))+'">')+'</label>';}

function imageCard(side,slot,label){const img=state[side].images[slot];return `<div class="upload-card ${slot==='full'?'body-pick':''}"><button class="image-pick" data-upload="${side}.${slot}" aria-label="${label} ${img?'교체':'추가'}">${img?`<img src="${img.src}" alt="${label}">`:'<span aria-hidden="true">＋</span>'}</button><p>${label}</p>${img?`<div class="image-actions"><button data-crop="${side}.${slot}">맞추기</button><button data-remove="${side}.${slot}" aria-label="${label} 삭제">삭제</button></div>`:''}${field('© 출처 (선택)',side+'.imageCredits.'+slot,'작가명 / 출처')}</div>`;}
function renderPanel(){
  const p=$('#panel');
  if(activeTab==='a'||activeTab==='b'){
    const s=activeTab,letter=s.toUpperCase();
    p.innerHTML=`<section class="form-section"><h2 class="section-title"><span class="badge">${letter}</span> 기본 정보</h2><div class="upload-main">${imageCard(s,'profile','원형 프로필')}<div class="upload-help">프로필 이미지<br>PNG · JPG · WebP · GIF<br>투명 PNG 지원</div></div>${field('이름',s+'.name','캐릭터 이름')}<div class="form-row">${field('영문 이름',s+'.en','English name')}${field('일본어 이름',s+'.jp','日本語の名前')}</div><div class="form-row">${field('성별',s+'.gender','자유롭게 입력')}${field('나이',s+'.age','예: 24세')}</div><div class="form-row">${field('키',s+'.height','예: 175cm')}${field('체형',s+'.body','예: 마른 체형')}</div></section><section class="form-section"><h2 class="section-title">외관 자료</h2><p class="section-note">맞추기: 위치 / 확대 / 크롭</p>${imageCard(s,'full','전신 이미지')}<div class="upload-grid">${imageSlots.slice(2).map(([slot,label])=>imageCard(s,slot,label)).join('')}</div></section><section class="form-section"><h2 class="section-title">상세 정보</h2>${field('성격 및 캐해',s+'.personality','성격, 행동, 캐릭터 해석을 적어 주세요.',true)}${field('외관 정보',s+'.appearance','눈동자, 머리색, 의상과 특징',true)}${field('NG',s+'.ng','피하고 싶은 설정이나 표현',true)}</section>`;
  }else if(activeTab==='story'){
    p.innerHTML=`<section class="form-section"><h2 class="section-title"><span class="badge">↔</span> 관계</h2>${field('페어명','title','페어 이름')}${field('작은 제목 (선택)','subtitle','선택 입력')}${field('A → B','relationA','A가 B에게',true,600)}${field('B → A','relationB','B가 A에게',true,600)}${field('관계 · 자유 텍스트','free','관계 설명',true)}</section><section class="form-section"><h2 class="section-title">서사 / 기타</h2>${field('서사','story','서사 입력',true,6000)}${field('etc.','etc','추가 설정 / 출처 / 메모',true,6000)}</section><section class="form-section"><h2 class="section-title">말풍선 대화</h2><label class="field">아이폰 시간<input data-path="phoneTime" maxlength="16" value="${esc(state.phoneTime)}" placeholder="9:41"></label><label class="field"><span><input type="checkbox" id="phone-composer" ${state.phoneComposer?'checked':''}> 문자 입력창 표시</span></label>${field('입력 중인 문자 (선택)','phoneDraft','비워두면 iMessage 표시',true,300)}<div class="color-grid">${[['messageA','A 말풍선'],['messageTextA','A 말풍선 글자'],['messageB','B 말풍선'],['messageTextB','B 말풍선 글자']].map(([k,l])=>`<label class="color-item"><input type="color" data-color="${k}" value="${state.colors[k]}">${l}</label>`).join('')}</div><p class="section-note">오른쪽 휴대폰 화면에 표시됩니다. 화면 비율은 390×844이며, 대화가 길면 화면 안에 맞춰 축소됩니다.</p><div id="message-list">${state.messages.map((m,i)=>`<div class="message-editor"><div class="message-head"><select data-message-side="${i}" aria-label="${i+1}번째 말풍선 화자"><option value="a" ${m.side==='a'?'selected':''}>A의 말풍선</option><option value="b" ${m.side==='b'?'selected':''}>B의 말풍선</option><option value="note" ${m.side==='note'?'selected':''}>자유 텍스트</option></select><button data-message-up="${i}" aria-label="말풍선 위로 이동" ${i===0?'disabled':''}>↑</button><button data-message-delete="${i}" aria-label="${i+1}번째 말풍선 삭제">✕</button></div><textarea data-message-text="${i}" maxlength="2000" aria-label="${i+1}번째 말풍선 내용">${esc(m.text)}</textarea></div>`).join('')}</div><button id="add-message" class="wide">＋ 말풍선 추가</button></section>`;
  }else{
    p.innerHTML=`<section class="form-section"><h2 class="section-title"><span class="badge">◐</span> 색상</h2><div class="preset-row"><button data-preset="sage">핑크</button><button data-preset="rose">피치</button><button data-preset="night">블루</button></div><div class="color-grid">${[['bg','전체 배경'],['panel','카드 배경'],['ink','텍스트'],['line','테두리'],['a','캐릭터 A'],['b','캐릭터 B'],['bubble','관계·말풍선']].map(([k,l])=>`<label class="color-item"><input type="color" data-color="${k}" value="${state.colors[k]}">${l}</label>`).join('')}</div></section><section class="form-section"><h2 class="section-title">항목 제목 형광펜</h2><div class="color-grid">${[['a','A 캐릭터'],['b','B 캐릭터'],['shared','관계 · 서사 · etc.']].map(([k,l])=>`<label class="color-item"><input type="color" data-heading-color="${k}" value="${state.highlights[k]}">${l}</label>`).join('')}</div></section><section class="form-section"><h2 class="section-title">글자 크기</h2>${[['basic','성별 ~ 체형'],['detail','성격 및 캐해 · 관계 · 서사 · etc.']].map(([k,l])=>`<label class="field">${l}<input type="number" min="12" max="100" data-group-size="${k}" value="${state.groupSizes[k]}"></label>`).join('')}</section><section class="form-section"><h2 class="section-title">글꼴</h2><label class="field">글꼴<select id="font-select">${[['displaySet','블랙 디스플레이 · 한·영·일 (웹)'],['literarySet','함렛 + Shippori · 한·영·일 명조 (웹)'],['monoSet','코딩 + BIZ · 한·영·일 고정폭 (웹)'],['plexSet','IBM Plex · 한·영·일 (웹)'],['gothicSet','Gothic A1 + Zen Kaku · 한·영·일 (웹)'],['editorial','Noto Serif · 한·영·일 명조'],['noto','Noto Sans · 한·영·일 고딕'],['pretendard','Pretendard · 프리텐다드 (웹)'],['suit','SUIT · 수트 (웹)'],['notojp','Noto Sans JP · 일본어'],['inter','Inter · 영문 (웹)'],['manrope','Manrope · 영문 (웹)'],['system','System Sans · 시스템'],['neurimbo','느림보고딕 · 설치 글꼴'],...(state.fontFile?[['custom','직접 추가한 글꼴']]:[])].map(([k,l])=>`<option value="${k}" ${state.font===k?'selected':''}>${l}</option>`).join('')}</select></label><p id="font-status" role="status" class="section-note">${esc(fontStatus)}</p><p class="section-note">Noto Sans KR·JP는 내장 글꼴입니다. 영문 글꼴은 영문만 바뀌고, 일본어 글꼴은 일본어에서 차이가 큽니다. 웹글꼴은 로드 성공 후 적용됩니다. IBM Plex는 같은 패밀리의 한국어·일본어 글꼴을, Gothic 조합은 Gothic A1·Zen Kaku Gothic New를 사용합니다. 아래 예문과 적용 상태를 확인하세요.</p><label class="field">내 글꼴 추가 (WOFF2 / WOFF / TTF / OTF)<input id="font-upload" type="file" accept=".woff2,.woff,.ttf,.otf"></label><p class="section-note">사용 권한이 있는 글꼴을 추가하면 이 브라우저에 함께 저장됩니다.</p><label class="range-label">글자 두께 <output id="font-weight-value">${state.fontWeight}</output><input id="font-weight" type="range" min="300" max="900" step="100" value="${state.fontWeight}"></label><div id="font-sample" style="font-family:${esc(fonts[state.font])};font-weight:${state.fontWeight};font-size:26px;line-height:1.6">가나다 ABC あいう</div></section><section class="form-section"><h2 class="section-title">스티커</h2><label class="field">투명 PNG / WebP 추가<input type="file" id="sticker-upload" accept="image/png,image/webp" multiple></label><p class="section-note">미리보기에서 스티커를 드래그해 이동하세요. 최대 30장까지 추가할 수 있습니다.</p><div>${state.stickers.map((st,i)=>`<div class="sticker-control"><span>스티커 ${i+1}</span><label>크기<input type="range" min="40" max="1600" step="10" value="${st.width}" data-sticker-size="${st.id}"></label><button data-sticker-front="${st.id}">맨 앞으로</button><button data-sticker-delete="${st.id}">삭제</button></div>`).join('')}</div></section><section class="form-section"><h2 class="section-title">내보내기</h2><p class="muted">프로필, 서사, 대화를 한 장의 PNG로 저장합니다.</p><button id="export-panel" class="primary wide">PNG 내보내기 ↗</button></section>`;
  }
}
function change(){revision++;$('#save-status').textContent='저장 중…';scheduleDraw();clearTimeout(saveTimer);saveTimer=setTimeout(()=>persist(),450);}
function openDB(){return new Promise((resolve,reject)=>{const req=indexedDB.open('pair-maker-studio',1);req.onupgradeneeded=()=>req.result.createObjectStore('projects');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);req.onblocked=()=>reject(new Error('다른 탭에서 저장소가 사용 중입니다.'));});}
function dbRead(){return new Promise((resolve,reject)=>{const req=db.transaction('projects').objectStore('projects').get('current');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
function dbWrite(value){return new Promise((resolve,reject)=>{const tx=db.transaction('projects','readwrite');tx.objectStore('projects').put(value,'current');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('저장 취소'));});}
function persist(){
  const value=clone(state),at=revision;
  saveQueue=saveQueue.catch(()=>{}).then(async()=>{
    try{if(db)await dbWrite(value);else localStorage.setItem('pair-maker-project',JSON.stringify(value));savedRevision=at;if(revision===at)$('#save-status').textContent='자동 저장됨';}
    catch(e){$('#save-status').textContent='저장 실패 · 백업 필요';notice('저장 공간이 부족하거나 차단되어 있습니다. 작업 파일을 저장해 주세요.');}
  });return saveQueue;
}
function validateProject(raw){
  if(!raw||raw.version!==1)throw new Error('지원하지 않는 작업 파일입니다.');
  const s=defaults();
  const take=(v,max=2000)=>typeof v==='string'?v.slice(0,max):'';
  for(const k of ['title','subtitle','relationA','relationB','free','ng','story','etc'])s[k]=take(raw[k],['story','etc'].includes(k)?6000:2000);
  for(const side of ['a','b']){if(!raw[side]||typeof raw[side]!=='object')throw new Error('캐릭터 데이터가 없습니다.');for(const k of ['name','en','jp','gender','age','height','body','personality','appearance','rights','ng'])s[side][k]=take(raw[side][k]);for(const [slot]of imageSlots){s[side].imageCredits[slot]=take(raw[side].imageCredits?.[slot],120);const im=raw[side].images?.[slot];if(im&&typeof im.src==='string'&&/^data:image\/(png|jpeg|webp|gif);base64,/.test(im.src)&&im.src.length<60000000){s[side].images[slot]={src:im.src,z:Math.min(5,Math.max(.2,Number(im.z)||1)),x:Math.min(2,Math.max(-2,Number(im.x)||0)),y:Math.min(2,Math.max(-2,Number(im.y)||0)),fit:im.fit==='cover'?'cover':'contain'};}}}
  for(const k of Object.keys(palette))if(/^#[0-9a-f]{6}$/i.test(raw.colors?.[k]))s.colors[k]=raw.colors[k];
  s.font=Object.hasOwn(fonts,raw.font)?raw.font:'sans';s.fontSize=Math.min(48,Math.max(20,Number(raw.fontSize)||34));s.fontWeight=Math.min(900,Math.max(300,Number(raw.fontWeight)||500));
  if(['handwrittenSet','roundedSet','gaegu','pen','gamja','single','melody','cute'].includes(s.font))s.font='noto';
  s.phoneComposer=raw.phoneComposer!==false;s.phoneDraft=typeof raw.phoneDraft==='string'?raw.phoneDraft.slice(0,300):'';
  s.phoneTime=typeof raw.phoneTime==='string'?raw.phoneTime.slice(0,16):'9:41';
  for(const key of styleKeys){const st=raw.textStyles?.[key];if(!st||typeof st!=='object')continue;s.textStyles[key]={size:st.size?Math.max(12,Math.min(100,Number(st.size)||34)):undefined,color:/^#[0-9a-f]{6}$/i.test(st.color)?st.color:'#fff29a',ranges:Array.isArray(st.ranges)?st.ranges.slice(0,100).filter(r=>Number.isInteger(r.start)&&Number.isInteger(r.end)&&r.start>=0&&r.end>r.start&&r.end<=6000).map(r=>({start:r.start,end:r.end})):[]};}
  for(const k of ['basic','detail'])s.groupSizes[k]=Math.max(12,Math.min(100,Number(raw.groupSizes?.[k])||s.groupSizes[k]));
  for(const k of ['a','b','shared'])if(/^#[0-9a-f]{6}$/i.test(raw.highlights?.[k]))s.highlights[k]=raw.highlights[k];
  s.messages=Array.isArray(raw.messages)?raw.messages.slice(0,80).map(m=>({side:['a','b','note'].includes(m.side)?m.side:'a',text:take(m.text)})):[];
  if(typeof raw.fontFile==='string'&&/^data:[\w/+.-]*;base64,/.test(raw.fontFile)&&raw.fontFile.length<15000000)s.fontFile=raw.fontFile;
  if(!raw.designRevision){
    if(s.title==='우리 사이의 계절')s.title='페어명';
    if(s.subtitle==='A STORY OF TWO')s.subtitle='';
    if(s.font!=='custom')s.font='noto';
    if(raw.colors?.bg==='#f7f5ed')s.colors={...palette};
    if(s.relationA==='너에게 건네는 한마디')s.relationA='A의 한마디';
    if(s.relationB==='너와 함께 쓰는 이야기')s.relationB='B의 한마디';
  }
  if((raw.designRevision||0)<3&&s.font!=='custom')s.font='noto';
  if((raw.designRevision||0)<4){s.fontSize=Math.max(34,s.fontSize);s.fontWeight=500;}
  s.stickers=Array.isArray(raw.stickers)?raw.stickers.slice(0,30).filter(v=>v&&typeof v.src==='string'&&/^data:image\/(png|webp);base64,/.test(v.src)&&v.src.length<28000000).map((v,i)=>({id:'sticker-'+i,src:v.src,x:Math.max(0,Math.min(4200,Number(v.x)||0)),y:Math.max(0,Math.min(20000,Number(v.y)||0)),width:Math.max(40,Math.min(1600,Number(v.width)||300))})):[];
  return s;
}
function loadImage(src){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('이미지를 읽을 수 없습니다.'));im.src=src;});}
async function loadAssets(){images.clear();for(const st of state.stickers){try{images.set(st.id,await loadImage(st.src));}catch{notice('스티커 이미지 하나를 불러오지 못했습니다.');}}await Promise.all(['a','b'].flatMap(side=>imageSlots.map(async([slot])=>{const data=state[side].images[slot];if(data){try{images.set(assetKey(side,slot),await loadImage(data.src));}catch{delete state[side].images[slot];notice('읽을 수 없는 이미지 하나를 제외했습니다.');}}})));if(state.fontFile){try{await installFont(state.fontFile);}catch{state.font='sans';notice('글꼴을 불러오지 못해 기본 글꼴을 적용했습니다.');}}}
async function installFont(src){const face=new FontFace('PairCustom',`url(${src})`);await face.load();if(customFace)document.fonts.delete(customFace);document.fonts.add(face);customFace=face;}
function readData(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(new Error('파일 읽기 실패'));r.readAsDataURL(file);});}
async function upload(side,slot){
  const input=document.createElement('input');input.type='file';input.accept='image/png,image/jpeg,image/webp,image/gif';
  input.onchange=async()=>{const file=input.files?.[0];if(!file)return;if(!['image/png','image/jpeg','image/webp','image/gif'].includes(file.type)){notice('PNG·JPG·WebP·GIF 이미지를 선택해 주세요.');return;}if(file.size>35*1024*1024){notice('이미지는 35MB 이하로 넣어 주세요.');return;}
    try{notice('이미지를 불러오는 중이에요.');const src=await readData(file),im=await loadImage(src);let normalized=src;
      // Preserve alpha; only oversized sources are resampled, never JPEG-flattened.
      if(file.type==='image/gif'){const f=1,c=document.createElement('canvas');c.width=Math.round(im.naturalWidth*f);c.height=Math.round(im.naturalHeight*f);c.getContext('2d').drawImage(im,0,0,c.width,c.height);normalized=c.toDataURL('image/png');c.width=1;c.height=1;}
      const otherBytes=['a','b'].flatMap(s=>imageSlots.map(([k])=>s===side&&k===slot?0:(state[s].images[k]?.src.length||0))).reduce((a,b)=>a+b,0);
      if(otherBytes+normalized.length>150000000){notice('작업 이미지 용량이 큽니다. 기존 이미지를 줄이거나 교체해 주세요.');return;}
      state[side].images[slot]={src:normalized,x:0,y:0,z:1,fit:slot==='full'?'contain':'cover'};images.set(assetKey(side,slot),await loadImage(normalized));change();renderPanel();openCrop(side,slot);
    }catch(e){notice('이미지를 열지 못했습니다. PNG·JPG·WebP 파일인지 확인해 주세요.');}
  };input.click();
}
const measure=document.createElement('canvas').getContext('2d');
function font(ctx,size=20,weight=400){if(phoneTypography){ctx.font=`400 ${size}px "PairNotoKR", "PairNotoJP", sans-serif`;ctx.textBaseline='top';return;}ctx.font=`${Math.min(900,weight+(state.fontWeight||500)-400)} ${size}px ${fonts[state.font]||fonts.sans}`;ctx.textBaseline='top';}
function lines(text,width,size=20,weight=400){
  font(measure,size,weight);const out=[];
  for(const paragraph of String(text||'').split('\n')){let row='';for(const ch of Array.from(paragraph)){if(row&&measure.measureText(row+ch).width>width){out.push(row);row=ch;}else row+=ch;}out.push(row);}
  return out;
}
function textHeight(text,w,size=state.fontSize,weight=400,key){size=styleSize(key,size);return lines(text,w,size,weight).length*size*1.55;}
function inkText(ctx,t,x,y){if(!phoneTypography&&(state.fontWeight||500)>400){ctx.save();ctx.strokeStyle=ctx.fillStyle;ctx.lineJoin='round';ctx.lineWidth=(state.fontWeight-400)/500*parseFloat(ctx.font.split(' ')[1])*.035;ctx.strokeText(t,x,y);ctx.restore();}ctx.fillText(t,x,y);}
function text(ctx,t,x,y,w,size=state.fontSize,color=state.colors.ink,weight=400,align='left',key){size=styleSize(key,size);font(ctx,size,weight);ctx.fillStyle=color;ctx.textAlign=align;const list=lines(t,w,size,weight),source=String(t||'');let cursor=0;for(const row of list){const offset=source.indexOf(row,cursor);cursor=Math.max(cursor,offset)+row.length;const startX=align==='right'?x+w-ctx.measureText(row).width:align==='center'?x+(w-ctx.measureText(row).width)/2:x;const st=key?.startsWith('heading:')?{color:state.highlights[key.slice(8)],ranges:[{start:0,end:source.length}]}:null;for(const range of st?.ranges||[]){const from=Math.max(0,range.start-offset),to=Math.min(row.length,range.end-offset);if(to>from){ctx.save();ctx.fillStyle=st.color||'#fff29a';ctx.globalAlpha=.65;ctx.fillRect(startX+ctx.measureText(row.slice(0,from)).width,y+size*.12,ctx.measureText(row.slice(0,to)).width-ctx.measureText(row.slice(0,from)).width,size*1.05);ctx.restore();}}inkText(ctx,row,align==='center'?x+w/2:align==='right'?x+w:x,y);y+=size*1.55;}ctx.textAlign='left';return y;}

function rect(ctx,x,y,w,h,fill,stroke,r=0){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.3;ctx.stroke();}}
function rule(ctx,x,y,w,color=state.colors.line){ctx.strokeStyle=color;ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+w,y);ctx.stroke();}
function imagePlacement(im,data,w,h){const base=data.fit==='cover'?Math.max(w/im.naturalWidth,h/im.naturalHeight):Math.min(w/im.naturalWidth,h/im.naturalHeight);const iw=im.naturalWidth*base*data.z,ih=im.naturalHeight*base*data.z;return {x:(w-iw)/2+data.x*w,y:(h-ih)/2+data.y*h,w:iw,h:ih};}
function picture(ctx,side,slot,x,y,w,h,circle=false,register=false){
  const data=state[side].images[slot],im=images.get(assetKey(side,slot));
  ctx.save();ctx.beginPath();if(circle)ctx.arc(x+w/2,y+h/2,w/2,0,Math.PI*2);else ctx.rect(x,y,w,h);ctx.clip();
  if(im&&data){const p=imagePlacement(im,data,w,h);ctx.drawImage(im,x+p.x,y+p.y,p.w,p.h);}
  else if(phoneTypography&&slot==='profile'){ctx.fillStyle=state.colors.bubble;ctx.fillRect(x,y,w,h);phoneLabel(ctx,side.toUpperCase(),x+w/2,y+h/2,19,state.colors[side],w-8);}
  else{ctx.fillStyle=state.colors.bubble;ctx.globalAlpha=.6;ctx.fillRect(x,y,w,h);ctx.globalAlpha=1;text(ctx,slot==='full'?'FULL LENGTH':slot==='profile'?side.toUpperCase():'＋',x,y+h/2-12,w,slot==='profile'?42:25,state.colors[side],400,'center');if(slot==='full'){rule(ctx,x+w*.25,y+h/2+24,w*.5);text(ctx,'전신 이미지를 추가해 주세요',x+12,y+h/2+44,w-24,25,state.colors[side],400,'center');}}
  ctx.restore();if(circle){ctx.beginPath();ctx.arc(x+w/2,y+h/2,w/2,0,Math.PI*2);ctx.strokeStyle=state.colors.line;ctx.stroke();}
  if(!phoneTypography){const credit=String(state[side].imageCredits[slot]||'').trim().replace(/^©\s*/, '');if(credit){ctx.save();ctx.font='400 20px sans-serif';ctx.textAlign=side==='a'?'left':'right';ctx.textBaseline='middle';ctx.fillStyle='#45404a';ctx.fillText('© '+credit,side==='a'?x+10:x+w-10,y+h+(slot==='profile'?8:19),w-20);ctx.restore();}}
  if(register)hitAreas.push({side,slot,x,y,w,h});
}
function boxHeight(value,w,min=80,key){return Math.max(min,textHeight(value||'—',w-36,state.fontSize,400,key)+Math.max(88,styleSize(key,28)*1.55+52));}
function infoBox(ctx,title,value,x,y,w,h,accent=state.colors.a,align='left',key){rect(ctx,x,y,w,h,state.colors.panel,state.colors.line,0);text(ctx,title,x+18,y+15,w-36,styleSize(key,28),accent,600,align,key?'heading:'+(key.startsWith('a.')?'a':key.startsWith('b.')?'b':'shared'):undefined);text(ctx,value||'—',x+18,y+Math.max(60,styleSize(key,28)*1.55+24),w-36,state.fontSize,state.colors.ink,400,align,key);}
function pairLayout(){
  const header=Math.max(32,-65+textHeight(state.title||'페어명',660,58,400)+(state.subtitle?textHeight(state.subtitle,1600,21)+10:0)+12);
  const nameH=Math.max(...['a','b'].map(s=>nameHeight(s)));
  const profileY=header+nameH+4;
  const metaH=Math.max(...['a','b'].map(s=>metaHeight(s)));
  const stageY=profileY+Math.max(340,metaH)+42,stageH=830;
  const phoneY=40,phone=phoneLayout(390);
  function flow(extra){
    const relationWidth=860+extra,freeWidth=880+extra,detailWidth=1172+extra/2,storyWidth=2540+extra;
    const detailY=Math.max(stageY+stageH+42,stageY+textHeight(state.relationA||'텍스트',relationWidth)+textHeight(state.relationB||'텍스트',relationWidth)+116+(state.free?boxHeight(state.free,freeWidth,90,'free'):0));
    let y=detailY+422;const sections=[];
    for(const [key,title]of [['personality','성격 및 캐해'],['appearance','외관 정보'],['ng','NG']]){const h=Math.max(...['a','b'].map(s=>boxHeight(state[s][key],detailWidth,90,s+'.'+key)));sections.push({key,title,y,h});y+=h+15;}
    const relAH=textHeight(state.relationA||'텍스트',relationWidth)+26,relBH=textHeight(state.relationB||'텍스트',relationWidth)+26,freeH=boxHeight(state.free,freeWidth,90,'free'),ngH=boxHeight(state.ng,freeWidth,90,'ng');
    const bottom=Math.max(y,stageY+relAH+relBH+freeH+60)+24,storyH=boxHeight(state.story,storyWidth,120,'story'),etcH=boxHeight(state.etc,storyWidth,110,'etc');
    return {detailY,sections,relAH,relBH,freeH,ngH,storyY:bottom,storyH,etcY:bottom+storyH+18,etcH,height:Math.max(1740,bottom+storyH+etcH+86,phone.height*2.75+80)+64};
  }
  const base=flow(0);
  const extra=Math.min(1800,Math.max(0,Math.round((base.height-2900)*1.5)));
  return {width:4200+extra,extra,header,profileY,stageY,stageH,phoneY,phone,...flow(extra)};
}
function drawPair(ctx,l,transparent=false,register=false){
  const c=state.colors;if(!transparent){ctx.fillStyle=c.bg;ctx.fillRect(0,0,l.width,l.height);}

  const titleLines=lines(state.title||'페어명',660,58),titleH=titleLines.length*58*1.55;
  rect(ctx,980+l.extra/2,39,700,titleH+14,c.panel,c.line,0);
  ctx.save();font(ctx,58);ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.fillStyle=c.ink;
  titleLines.forEach((row,i)=>{const m=ctx.measureText(row),ascent=m.actualBoundingBoxAscent||42,descent=m.actualBoundingBoxDescent||0;inkText(ctx,row,1330+l.extra/2,46+(i+.5)*58*1.55+(ascent-descent)/2);});ctx.restore();
  if(state.subtitle)text(ctx,state.subtitle,200,64+titleH,1600,21,c.a,400,'center');
  for(const side of ['a','b']){const x=side==='a'?60:1800+l.extra,s=state[side];let nameY=l.header;for(const [key,size]of [['name',64],['en',36],['jp',36]]){if(key!=='name'&&!s[key])continue;nameY=text(ctx,s[key]||(key==='name'?side.toUpperCase():''),x+18,nameY,770,size,c[side],400,side==='b'?'right':'left',side+'.'+key);}picture(ctx,side,'profile',x+(side==='b'?442:18),l.stageY-42-340,340,340,true,register);drawMeta(ctx,s,x+(side==='b'?60:402),l.profileY+(Math.max(340,metaHeight(side))-metaHeight(side))/2,side==='b'?'right':'left',side);
    if(!images.has(assetKey(side,'full')))rect(ctx,x,l.stageY,800,l.stageH,c.panel,c.line,0);
    picture(ctx,side,'full',x,l.stageY,800,l.stageH,false,register);
    const detailX=side==='a'?60:1428+l.extra,boxX=side==='a'?60:1428+l.extra/2;
    for(let i=0;i<3;i++){rect(ctx,detailX+i*396,l.detailY,380,380,c.panel,c.line,0);picture(ctx,side,'detail'+(i+1),detailX+i*396+4,l.detailY+4,372,372,false,register);}
    for(const item of l.sections)infoBox(ctx,item.title,s[item.key],boxX,item.y,1172+l.extra/2,item.h,c[side],side==='b'?'right':'left',side+'.'+item.key);
  }
  let y=l.stageY-12-170-(l.relAH+l.relBH+17)/2;
  for(const [value,right,accent,h]of [[state.relationA,true,c.a,l.relAH],[state.relationB,false,c.b,l.relBH]]){
    text(ctx,value||'텍스트',900,y+8,860+l.extra,state.fontSize,c.ink,400,'center');
    const ay=y+h-13;ctx.strokeStyle=accent;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(890,ay);ctx.lineTo(1770+l.extra,ay);ctx.moveTo(right?1748+l.extra:912,ay-13);ctx.lineTo(right?1770+l.extra:890,ay);ctx.lineTo(right?1748+l.extra:912,ay+13);ctx.stroke();y+=h+22;
  }
  y=l.stageY+l.relAH+l.relBH+44;
  if(state.free){infoBox(ctx,'관계',state.free,890,y,880+l.extra,l.freeH,c.ink,'left','free');y+=l.freeH+20;}

  const divider=2690+l.extra,phoneScale=2.75;
  ctx.save();ctx.setLineDash([18,14]);ctx.strokeStyle=c.ink;ctx.globalAlpha=.5;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(divider,110);ctx.lineTo(divider,l.height-110);ctx.stroke();ctx.restore();
  ctx.save();ctx.translate(divider+(l.width-divider-l.phone.width*phoneScale)/2,(l.height-l.phone.height*phoneScale)/2);ctx.scale(phoneScale,phoneScale);drawPhone(ctx,0,0,l.phone,register);ctx.restore();
  infoBox(ctx,'서사',state.story,60,l.storyY,2540+l.extra,l.storyH,c.ink,'left','story');infoBox(ctx,'etc.',state.etc,60,l.etcY,2540+l.extra,l.etcH,c.ink,'left','etc');
}
function centeredBubbleText(ctx,value,x,y,w,h,color){
  const size=16,rows=lines(value,w-30,size),lineH=size*1.3;
  ctx.save();font(ctx,size);ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.fillStyle=color;
  const first=ctx.measureText(rows[0]||'가'),last=ctx.measureText(rows.at(-1)||'가');
  const ascent=first.actualBoundingBoxAscent||size*.75,descent=last.actualBoundingBoxDescent||size*.2;
  const total=ascent+descent+(rows.length-1)*lineH,baseline=y+(h-total)/2+ascent;
  rows.forEach((row,i)=>ctx.fillText(row,x+w/2,baseline+i*lineH));ctx.restore();
}
function metaRows(s){return [['성별',s.gender],['나이',s.age],['키',s.height],['체형',s.body]];}
function nameHeight(side){return ['name','en','jp'].reduce((h,k)=>h+(state[side][k]||k==='name'?textHeight(state[side][k]||side.toUpperCase(),770,k==='name'?64:36,400,side+'.'+k):0),0);}
function metaHeight(side){return ['gender','age','height','body'].reduce((h,k)=>h+Math.max(48,textHeight(state[side][k]||'—',240,30,400,side+'.'+k),textHeight({gender:'성별',age:'나이',height:'키',body:'체형'}[k],90,styleSize(side+'.'+k,30))),0);}
function drawMeta(ctx,s,x,y,align='left',side){for(const [i,[label,value]]of metaRows(s).entries()){const key=side+'.'+['gender','age','height','body'][i],size=styleSize(key,30);text(ctx,label,align==='right'?x+248:x,y,90,size,state.colors.ink,400,align,'heading:'+side);text(ctx,value||'—',align==='right'?x:x+98,y,240,size,state.colors.ink,400,align,key);y+=Math.max(48,textHeight(value||'—',240,size),textHeight(label,90,size));}}

const phoneTextSize=16,phoneLineHeight=21;
function phoneLayout(w){phoneTypography=true;let y=204;const rows=state.messages.map(m=>{font(measure,phoneTextSize);const longest=Math.max(...String(m.text||'…').split('\n').map(t=>measure.measureText(t).width));const bw=m.side==='note'?w-54:Math.min(w-68,Math.max(40,longest+30));const h=Math.max(36,lines(m.text||'…',m.side==='note'?w-70:bw-30,phoneTextSize).length*phoneLineHeight+14);const row={...m,y,h,bw};y+=h+10;return row;});phoneTypography=false;return {width:w,height:w*844/390,contentHeight:y-204,rows};}
function phoneBody(ctx,value,x,y,width,color,height,align='left'){
  ctx.save();font(ctx,phoneTextSize);ctx.textBaseline='alphabetic';ctx.fillStyle=color;ctx.textAlign=align;
  const rows=lines(value,width,phoneTextSize),sample=ctx.measureText('가나다ABC');
  const offset=((sample.actualBoundingBoxAscent||phoneTextSize)-(sample.actualBoundingBoxDescent||0))/2;
  let baseline=y+height/2-(rows.length-1)*phoneLineHeight/2+offset;
  for(const row of rows){ctx.fillText(row,align==='center'?x+width/2:x,baseline);baseline+=phoneLineHeight;}
  ctx.restore();
}
function phoneLabel(ctx,value,cx,cy,size,color,maxWidth=300){ctx.save();font(ctx,size);ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.fillStyle=color;const m=ctx.measureText(value);ctx.fillText(value,cx,cy+(m.actualBoundingBoxAscent-m.actualBoundingBoxDescent)/2,maxWidth);ctx.restore();}
function phoneChevron(ctx,cx,cy,direction,color){ctx.save();ctx.strokeStyle=color;ctx.lineWidth=2;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(cx-direction*3,cy-5);ctx.lineTo(cx+direction*3,cy);ctx.lineTo(cx-direction*3,cy+5);ctx.stroke();ctx.restore();}
function drawPhone(ctx,x,y,l,register){phoneTypography=true;ctx.save();ctx.translate(x,y);const w=l.width,h=l.height;
  rect(ctx,0,0,w,h,'#ffffff','#d8d9e2',35);rect(ctx,w/2-49,12,98,23,'#26252c',null,15);
  ctx.save();phoneLabel(ctx,state.phoneTime,64,25,14,'#1c1c1e',96);ctx.fillStyle='#1c1c1e';
  // Status icons share one optical center, with consistent spacing from the right edge.
  const statusRight=w-27, batteryX=statusRight-25, wifiX=batteryX-18, signalX=wifiX-32;
  for(let i=0;i<4;i++)rect(ctx,signalX+i*4.5,31-(5+i*2.3),3.2,5+i*2.3,'#1c1c1e',null,1);
  ctx.strokeStyle='#1c1c1e';ctx.lineWidth=2.2;ctx.lineCap='round';
  for(const radius of [9,5.7]){ctx.beginPath();ctx.arc(wifiX,30,radius,Math.PI*1.22,Math.PI*1.78);ctx.stroke();}
  ctx.beginPath();ctx.arc(wifiX,30,1.4,0,Math.PI*2);ctx.fill();
  ctx.globalAlpha=.45;rect(ctx,batteryX,19,25,12,null,'#1c1c1e',3);rect(ctx,statusRight+1.5,23,1.8,4,'#1c1c1e',null,.8);ctx.globalAlpha=1;
  rect(ctx,batteryX+2.5,21.5,20,7,'#1c1c1e',null,1.5);ctx.restore();
  phoneChevron(ctx,24,80,-1,'#1485ff');picture(ctx,'a','profile',w/2-47,51,45,45,true,false);picture(ctx,'b','profile',w/2+2,51,45,45,true,false);
  phoneLabel(ctx,state.title||'페어명',w/2,118,16,'#34323a',w-150);phoneChevron(ctx,w/2+85,118,1,'#a5a3ae');rule(ctx,12,145,w-24,'#eeeeF3');phoneLabel(ctx,'iMessage',w/2,168,12,'#9998a2');
  ctx.save();const composerH=state.phoneComposer?Math.max(36,Math.min(3,lines(state.phoneDraft||'iMessage',w-128,phoneTextSize).length)*phoneLineHeight+14):0;const messageScale=Math.min(1,(h-204-40-(state.phoneComposer?composerH+12:0))/Math.max(1,l.contentHeight));ctx.translate(w*(1-messageScale)/2,204);ctx.scale(messageScale,messageScale);ctx.translate(0,-204);
  for(const r of l.rows){if(r.side==='note'){phoneBody(ctx,r.text||'…',35,r.y,w-70,'#92919b',r.h,'center');continue;}const a=r.side==='a',bx=a?16:w-r.bw-16,color=a?state.colors.messageA:state.colors.messageB;rect(ctx,bx,r.y,r.bw,r.h,color,null,21);ctx.fillStyle=color;ctx.beginPath();const tx=a?bx:bx+r.bw;ctx.moveTo(tx+(a?14:-14),r.y+r.h-20);ctx.quadraticCurveTo(tx,r.y+r.h-3,tx+(a?-5:5),r.y+r.h);ctx.quadraticCurveTo(tx+(a?17:-17),r.y+r.h+1,tx+(a?25:-25),r.y+r.h-5);ctx.fill();phoneBody(ctx,r.text||'…',bx+15,r.y,r.bw-30,a?state.colors.messageTextA:state.colors.messageTextB,r.h);}
  ctx.restore();
  if(state.phoneComposer){const top=h-30-composerH,cy=top+composerH-18;rect(ctx,48,top,w-65,composerH,null,'#d1d1d6',19);ctx.save();ctx.strokeStyle='#8e8e93';ctx.lineWidth=2;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(23,cy-8);ctx.lineTo(23,cy+8);ctx.moveTo(15,cy);ctx.lineTo(31,cy);ctx.stroke();ctx.save();ctx.beginPath();ctx.rect(62,top+5,w-129,composerH-10);ctx.clip();phoneBody(ctx,state.phoneDraft||'iMessage',62,top,w-128,state.phoneDraft?'#1c1c1e':'#8e8e93',composerH);ctx.restore();const ax=w-35;if(state.phoneDraft){rect(ctx,ax-13,cy-13,26,26,'#007aff',null,13);ctx.strokeStyle='#fff';ctx.beginPath();ctx.moveTo(ax,cy+7);ctx.lineTo(ax,cy-7);ctx.moveTo(ax-5,cy-2);ctx.lineTo(ax,cy-7);ctx.lineTo(ax+5,cy-2);ctx.stroke();}else{rect(ctx,ax-3,cy-8,6,11,null,'#8e8e93',3);ctx.beginPath();ctx.arc(ax,cy-2,6,0,Math.PI);ctx.moveTo(ax,cy+4);ctx.lineTo(ax,cy+8);ctx.stroke();}ctx.restore();}
  rect(ctx,w/2-58,h-14,116,4,'#29282f',null,3);ctx.restore();phoneTypography=false;
}
function layout(){return pairLayout();}
function renderTo(canvas,l,scale,transparent=false,register=false){canvas.width=Math.round(l.width*scale);canvas.height=Math.round(l.height*scale);const ctx=canvas.getContext('2d');ctx.scale(scale,scale);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';if(register)hitAreas=[];drawPair(ctx,l,transparent,register);drawStickers(ctx,l,register);drawAttribution(ctx,l);return ctx;}
// Render last so the fixed credit stays visible above stickers and in transparent PNGs.
function drawAttribution(ctx,l){ctx.save();ctx.font='400 28px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#45404a';ctx.fillText('@Angngll',l.width/2,l.height-72);ctx.restore();}
function draw(){$('#preview').style.touchAction=state.stickers.length?'none':'auto';previewLayout=layout();const pixels=previewLayout.width*previewLayout.height;renderTo($('#preview'),previewLayout,Math.min(1,Math.sqrt(10000000/pixels)),false,true);$('#dimensions').textContent=`${previewLayout.width.toLocaleString()} × ${Math.round(previewLayout.height).toLocaleString()} · 글 길이에 따라 자동 확장`;}
function scheduleDraw(){if(drawing)return;drawing=true;requestAnimationFrame(()=>{drawing=false;draw();});}
document.fonts.addEventListener('loadingdone',scheduleDraw);
function openCrop(side,slot){const data=state[side].images[slot];if(!data){upload(side,slot);return;}crop={side,slot,data:{...data}};$('#crop-title').textContent=`${side.toUpperCase()} · ${imageSlots.find(v=>v[0]===slot)[1]}`;syncCropControls();$('#crop-dialog').showModal();drawCrop();}
function cropSize(){if(crop.slot==='full'){const l=pairLayout();return {w:800,h:l.stageH};}return {w:200,h:200};}
function syncCropControls(){for(const [id,key]of [['crop-zoom','z'],['crop-x','x'],['crop-y','y']])$('#'+id).value=crop.data[key];$('#zoom-value').textContent=Math.round(crop.data.z*100)+'%';}
function drawCrop(){if(!crop)return;const d=cropSize(),scale=Math.min(420/d.w,320/d.h),c=$('#crop-canvas');c.width=Math.round(d.w*scale*2);c.height=Math.round(d.h*scale*2);c.style.width=Math.round(d.w*scale)+'px';c.style.height=Math.round(d.h*scale)+'px';const ctx=c.getContext('2d');ctx.scale(c.width/d.w,c.height/d.h);if(crop.slot==='profile'){ctx.beginPath();ctx.arc(d.w/2,d.h/2,d.w/2,0,Math.PI*2);ctx.clip();}const im=images.get(assetKey(crop.side,crop.slot)),p=imagePlacement(im,crop.data,d.w,d.h);ctx.drawImage(im,p.x,p.y,p.w,p.h);ctx.strokeStyle='#718268';ctx.lineWidth=2/scale;ctx.strokeRect(0,0,d.w,d.h);}
let drag=null;
$('#crop-canvas').addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,ox:crop.data.x,oy:crop.data.y};e.currentTarget.setPointerCapture(e.pointerId);});
$('#crop-canvas').addEventListener('pointermove',e=>{if(!drag)return;const r=e.currentTarget.getBoundingClientRect();crop.data.x=Math.max(-2,Math.min(2,drag.ox+(e.clientX-drag.x)/r.width));crop.data.y=Math.max(-2,Math.min(2,drag.oy+(e.clientY-drag.y)/r.height));syncCropControls();drawCrop();});
for(const evt of ['pointerup','pointercancel','lostpointercapture'])$('#crop-canvas').addEventListener(evt,()=>drag=null);
for(const [id,key]of [['crop-zoom','z'],['crop-x','x'],['crop-y','y']])$('#'+id).addEventListener('input',e=>{crop.data[key]=Number(e.target.value);syncCropControls();drawCrop();});
for(const [id,fit]of [['crop-fit','contain'],['crop-fill','cover']])$('#'+id).onclick=()=>{Object.assign(crop.data,{fit,z:1,x:0,y:0});syncCropControls();drawCrop();};
$('#crop-apply').onclick=()=>{state[crop.side].images[crop.slot]=crop.data;change();$('#crop-dialog').close();};
$('#preview').onclick=e=>{if(stickerClick){stickerClick=false;return;}const r=e.currentTarget.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*previewLayout.width,y=(e.clientY-r.top)/r.height*previewLayout.height;const h=hitAreas.find(h=>x>=h.x&&x<=h.x+h.w&&y>=h.y&&y<=h.y+h.h);if(h)openCrop(h.side,h.slot);};
function showExport(){ $('#export-view').textContent='페어틀 전체 (대화 포함)';$('#export-result').hidden=true;$('#export-status').textContent='';$('#export-dialog').showModal(); }
function blobFrom(canvas){return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('이미지 메모리가 부족합니다.')),'image/png'));}
async function makePNG(){
  const button=$('#make-png');button.disabled=true;$('#export-status').textContent='글꼴과 이미지를 준비하고 있어요…';$('#export-result').hidden=true;
  let canvas=null;
  try{await ensureFont(state.font);await document.fonts.load('22px '+fonts[state.font],fontSample());await document.fonts.ready;const l=layout();let scale=Number($('#export-scale').value);const pixelLimit=matchMedia('(pointer: coarse)').matches?32000000:160000000,dimensionLimit=16384;const safe=Math.min(scale,Math.sqrt(pixelLimit/(l.width*l.height)),dimensionLimit/l.height,dimensionLimit/l.width);const allowResize=$('#export-auto-resize').checked;if(safe<scale&&!allowResize)throw new Error('선택한 크기가 이 기기의 안전한 출력 범위를 넘습니다. 해상도를 낮추거나 ‘기기 한도에 맞춰 크기 줄이기’를 선택해 주세요.');if(allowResize)scale=safe;
    for(let attempt=0;attempt<3;attempt++){try{canvas=document.createElement('canvas');renderTo(canvas,l,scale,$('#transparent').checked);outputBlob=await blobFrom(canvas);break;}catch(e){if(attempt===2||!allowResize)throw new Error('선택한 해상도를 만들 메모리가 부족합니다. 다른 앱을 닫거나 해상도를 낮춰 주세요.');scale*=.7;}finally{if(canvas){canvas.width=1;canvas.height=1;}}}
    if(outputURL)URL.revokeObjectURL(outputURL);outputURL=URL.createObjectURL(outputBlob);outputName=(state.title||'pair-maker').replace(/[<>:"/\\|?*\x00-\x1f]/g,'_').slice(0,80)+'-페어틀.png';$('#export-image').src=outputURL;$('#download-png').href=outputURL;$('#download-png').download=outputName;$('#export-result').hidden=false;
    $('#export-status').textContent=`완성! ${Math.round(l.width*scale).toLocaleString()} × ${Math.round(l.height*scale).toLocaleString()}px${scale<Number($('#export-scale').value)?' · 안정적인 저장을 위해 크기를 조정했어요.':''}`;
    const f=new File([outputBlob],outputName,{type:'image/png'});$('#share-png').hidden=!(navigator.canShare&&navigator.canShare({files:[f]}));
  }catch(e){$('#export-status').textContent=e.message||'이미지를 만들지 못했습니다. 해상도를 낮춰 다시 시도해 주세요.';}finally{button.disabled=false;}
}
$('#make-png').onclick=makePNG;$('#export-top').onclick=showExport;
$('#share-png').onclick=async()=>{try{await navigator.share({files:[new File([outputBlob],outputName,{type:'image/png'})]});}catch(e){if(e.name!=='AbortError')notice('공유가 지원되지 않습니다. 다운로드나 이미지 길게 누르기를 이용해 주세요.');}};
function downloadBlob(blob,name){const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);}
$('#backup').onclick=()=>downloadBlob(new Blob([JSON.stringify(state)],{type:'application/json'}),'pair-maker-work.json');
$('#restore').onchange=async e=>{const f=e.target.files?.[0];if(!f)return;try{if(f.size>180000000)throw new Error('작업 파일이 너무 큽니다.');const next=validateProject(JSON.parse(await f.text()));if(!confirm('현재 작업을 불러온 파일로 바꿀까요? 보관하려면 먼저 작업 파일을 저장해 주세요.'))return;state=next;await loadAssets();renderPanel();change();await persist();notice('작업 파일을 불러왔습니다.');}catch(error){notice(error instanceof SyntaxError?'올바른 JSON 작업 파일이 아닙니다.':error.message);}finally{e.target.value='';}};
document.addEventListener('input',e=>{const t=e.target;if(t.dataset.path){const key=t.dataset.path,old=String(pathGet(key)||''),next=t.value,st=state.textStyles[key];if(st?.ranges?.length){let left=0;while(left<old.length&&left<next.length&&old[left]===next[left])left++;let end=old.length,tail=next.length;while(end>left&&tail>left&&old[end-1]===next[tail-1]){end--;tail--;}const delta=next.length-old.length;st.ranges=st.ranges.flatMap(r=>r.end<=left?[r]:r.start>=end?[{start:r.start+delta,end:r.end+delta}]:[]);}pathSet(key,next);change();}if(t.dataset.color){state.colors[t.dataset.color]=t.value;change();}if(t.dataset.messageText!==undefined){state.messages[+t.dataset.messageText].text=t.value;change();}if(t.id==='font-weight'){state.fontWeight=+t.value;$('#font-weight-value').textContent=t.value;if($('#font-sample'))$('#font-sample').style.fontWeight=t.value;change();}if(t.id==='font-size'){state.fontSize=+t.value;$('#font-size-value').textContent=t.value+'px';change();}});
document.addEventListener('change',async e=>{const t=e.target;if(t.id==='phone-composer'){state.phoneComposer=t.checked;change();}if(t.dataset.messageSide!==undefined){state.messages[+t.dataset.messageSide].side=t.value;change();}if(t.id==='font-select'){const selected=t.value,request=++fontSelection;showFontStatus('글꼴 불러오는 중…');try{await ensureFont(selected);await document.fonts.load('22px '+fonts[selected],fontSample());if(request!==fontSelection)return;state.font=selected;if($('#font-sample'))$('#font-sample').style.fontFamily=fonts[selected];showFontStatus('적용됨: '+t.selectedOptions[0].textContent);change();}catch{if(request!==fontSelection)return;t.value=state.font;showFontStatus(selected==='neurimbo'?'느림보고딕 파일을 추가하거나 기기에 설치해야 합니다.':'불러오기 실패: 선택한 글꼴을 적용하지 않았습니다. 인터넷 연결 또는 글꼴 파일을 확인하세요.');}}if(t.id==='font-upload'){const f=t.files?.[0];if(!f)return;try{if(f.size>10000000)throw new Error('글꼴은 10MB 이하로 추가해 주세요.');const src=await readData(f);await installFont(src);state.fontFile=src;state.font='custom';fontStatus='적용됨: '+f.name;renderPanel();change();}catch(error){notice('글꼴을 추가하지 못했습니다. 파일 형식과 크기를 확인해 주세요.');}}});
document.addEventListener('click',e=>{
  const t=e.target.closest('button');if(!t)return;
  if(t.dataset.tab){activeTab=t.dataset.tab;$$('[data-tab]').forEach(b=>{b.classList.toggle('active',b===t);b.setAttribute('aria-pressed',String(b===t));});renderPanel();}
  if(t.dataset.view){activeView=t.dataset.view;$$('[data-view]').forEach(b=>{b.classList.toggle('active',b===t);b.setAttribute('aria-pressed',String(b===t));});scheduleDraw();}
  if(t.dataset.mobile){$$('[data-mobile]').forEach(b=>b.classList.toggle('active',b===t));$('.workspace').classList.toggle('mobile-preview',t.dataset.mobile==='preview');}
  if(t.dataset.upload)upload(...t.dataset.upload.split('.'));
  if(t.dataset.crop)openCrop(...t.dataset.crop.split('.'));
  if(t.dataset.remove){const [s,k]=t.dataset.remove.split('.');delete state[s].images[k];images.delete(t.dataset.remove);renderPanel();change();}
  if(t.dataset.messageDelete!==undefined){state.messages.splice(+t.dataset.messageDelete,1);renderPanel();change();}
  if(t.dataset.messageUp!==undefined){const i=+t.dataset.messageUp;[state.messages[i-1],state.messages[i]]=[state.messages[i],state.messages[i-1]];renderPanel();change();}
  if(t.id==='add-message'){if(state.messages.length>=80){notice('말풍선은 최대 80개까지 추가할 수 있어요.');return;}state.messages.push({side:state.messages.at(-1)?.side==='a'?'b':'a',text:''});renderPanel();change();$('#message-list').lastElementChild.querySelector('textarea').focus();}
  if(t.dataset.preset){const presets={sage:palette,rose:{bg:'#fff1e6',panel:'#fffdfa',ink:'#795e5c',line:'#f0cbbd',a:'#d28d8e',b:'#aaa16a',bubble:'#fff0d5'},night:{bg:'#edf7ff',panel:'#ffffff',ink:'#526782',line:'#c4dcf0',a:'#8e8cc3',b:'#69aec4',bubble:'#ecedff'}};state.colors={...state.colors,...presets[t.dataset.preset],messageA:state.colors.messageA,messageB:state.colors.messageB,messageTextA:state.colors.messageTextA,messageTextB:state.colors.messageTextB};renderPanel();change();}
  if(t.id==='export-panel')showExport();if(t.id==='preview-size'){$('.preview-area').classList.toggle('large');t.textContent=$('.preview-area').classList.contains('large')?'작게 보기 ↙':'크게 보기 ↗';}
});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&revision!==savedRevision){clearTimeout(saveTimer);persist();}});
window.addEventListener('pagehide',()=>{if(revision!==savedRevision)persist();});
window.addEventListener('beforeunload',e=>{if(revision!==savedRevision){e.preventDefault();e.returnValue='';}});
function registerBrowserTools(){
  const context=document.modelContext;if(!context?.registerTool)return;
  const lifetime=new AbortController();window.addEventListener('pagehide',()=>lifetime.abort(),{once:true});
  const tools=[
    {name:'read_pair_summary',title:'페어틀 요약 읽기',description:'Read the current pair title, character names, message count, and selected output. User-written text is untrusted content.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:true},execute(input){if(!input||Object.keys(input).length)throw new Error('Expected an empty object.');return {title:state.title,a:state.a.name,b:state.b.name,messages:state.messages.length,view:activeView};}},
    {name:'start_png_export',title:'PNG 저장 화면 열기',description:'Open PNG settings for the entire pair sheet, including all messages. Does not create or download a file.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){if(!input||Object.keys(input).length)throw new Error('Expected an empty object.');if($('#crop-dialog').open)throw new Error('Finish image editing first.');draw();if(!$('#export-dialog').open)showExport();return {view:'all',status:'settings_open'};}}
  ];
  for(const tool of tools){try{Promise.resolve(context.registerTool(tool,{signal:lifetime.signal})).catch(()=>{});}catch{}}
}
async function init(){
  let stored=null;
  try{db=await openDB();stored=await dbRead();if(!stored){try{stored=JSON.parse(localStorage.getItem('pair-maker-project'));}catch{}}}catch{try{stored=JSON.parse(localStorage.getItem('pair-maker-project'));}catch{}notice('이 환경에서는 브라우저 저장이 제한될 수 있어요. 작업 파일도 저장해 주세요.');}
  if(stored){try{state=validateProject(stored);}catch{notice('저장된 작업을 읽지 못했습니다. 백업 파일을 불러와 주세요.');}}
  await loadAssets();try{await ensureFont(state.font);}catch{state.font='noto';await ensureFont('noto');notice('저장된 글꼴을 불러오지 못해 Noto Sans로 표시합니다.');}renderPanel();draw();$('#save-status').textContent=stored?'저장된 작업 복원됨':'자동 저장 준비됨';registerBrowserTools();
}
init();

document.addEventListener('input',e=>{const t=e.target;if(t.dataset.groupSize){if(!t.value)return;state.groupSizes[t.dataset.groupSize]=Math.max(12,Math.min(100,Number(t.value)||30));change();}if(t.dataset.headingColor){state.highlights[t.dataset.headingColor]=t.value;change();}});

let stickerDrag=null,stickerClick=false;
function stickerBox(st,l){const im=images.get(st.id);if(!im)return null;const width=Math.min(st.width,l.width),height=width*im.naturalHeight/im.naturalWidth;const fit=Math.min(1,l.height/height);return {x:Math.min(st.x,l.width-width*fit),y:Math.min(st.y,l.height-height*fit),w:width*fit,h:height*fit,im};}
function drawStickers(ctx,l,register){for(const st of state.stickers){const b=stickerBox(st,l);if(!b)continue;ctx.drawImage(b.im,b.x,b.y,b.w,b.h);if(register)hitAreas.push({...b,sticker:st.id});}}
function previewPoint(e){const r=$('#preview').getBoundingClientRect();return {x:(e.clientX-r.left)/r.width*previewLayout.width,y:(e.clientY-r.top)/r.height*previewLayout.height};}
$('#preview').addEventListener('pointerdown',e=>{const p=previewPoint(e),h=[...hitAreas].reverse().find(h=>h.sticker&&p.x>=h.x&&p.x<=h.x+h.w&&p.y>=h.y&&p.y<=h.y+h.h);stickerClick=!!h;if(!h)return;e.preventDefault();const st=state.stickers.find(s=>s.id===h.sticker);stickerDrag={st,dx:p.x-h.x,dy:p.y-h.y,w:h.w,h:h.h};e.currentTarget.setPointerCapture(e.pointerId);});
$('#preview').addEventListener('pointermove',e=>{if(!stickerDrag)return;e.preventDefault();const p=previewPoint(e),d=stickerDrag;d.st.x=Math.max(0,Math.min(previewLayout.width-d.w,p.x-d.dx));d.st.y=Math.max(0,Math.min(previewLayout.height-d.h,p.y-d.dy));scheduleDraw();});
for(const type of ['pointerup','pointercancel','lostpointercapture'])$('#preview').addEventListener(type,()=>{if(stickerDrag){stickerDrag=null;change();}});
document.addEventListener('change',async e=>{if(e.target.id!=='sticker-upload')return;const files=[...e.target.files];for(const file of files){if(state.stickers.length>=30){notice('스티커는 최대 30장까지 추가할 수 있어요.');break;}if(!['image/png','image/webp'].includes(file.type)||file.size>20000000){notice('스티커는 20MB 이하 PNG 또는 WebP를 사용해 주세요.');continue;}try{const src=await readData(file),im=await loadImage(src),id='sticker-'+crypto.randomUUID();const l=layout();state.stickers.push({id,src,x:1100,y:Math.min(l.stageY+300,l.height-400),width:300});images.set(id,im);change();}catch{notice('스티커를 불러오지 못했습니다.');}}renderPanel();});
document.addEventListener('input',e=>{if(!e.target.dataset.stickerSize)return;const st=state.stickers.find(s=>s.id===e.target.dataset.stickerSize);if(st){st.width=Number(e.target.value);change();}});
document.addEventListener('click',e=>{const id=e.target.dataset.stickerDelete||e.target.dataset.stickerFront;if(!id)return;const i=state.stickers.findIndex(s=>s.id===id);if(i<0)return;const [st]=state.stickers.splice(i,1);if(e.target.dataset.stickerFront)state.stickers.push(st);else images.delete(id);change();renderPanel();});

let slotBusy=false;
function slotRead(key){if(!db)return Promise.resolve(JSON.parse(localStorage.getItem('pair-maker-'+key)||'null'));return new Promise((resolve,reject)=>{const r=db.transaction('projects').objectStore('projects').get(key);r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(r.error);});}
function slotWrite(key,value){if(!db){localStorage.setItem('pair-maker-'+key,JSON.stringify(value));return Promise.resolve();}return new Promise((resolve,reject)=>{const tx=db.transaction('projects','readwrite');tx.objectStore('projects').put(value,key);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('저장 실패'));});}
async function renderSlots(){const saved=await Promise.all([1,2,3,4,5].map(i=>slotRead('slot-'+i)));$('#slot-list').innerHTML=saved.map((v,i)=>'<section class="slot-row"><strong>슬롯 '+(i+1)+'</strong><span>'+(v?esc(v.title||'이름 없는 페어')+' · '+esc(new Date(v.savedAt).toLocaleString()):'비어 있음')+'</span><button data-slot-save="'+(i+1)+'">현재 작업 저장</button><button data-slot-load="'+(i+1)+'" '+(!v?'disabled':'')+'>불러오기</button></section>').join('');$('#slot-undo').disabled=!(await slotRead('before-slot-load'));}
$('#slots-open').onclick=async()=>{try{await renderSlots();$('#slots-dialog').showModal();}catch{notice('슬롯을 읽을 수 없습니다. 작업 파일 백업을 사용해 주세요.');}};
async function restoreSlot(project){const next=validateProject(project);await slotWrite('before-slot-load',{project:clone(state)});clearTimeout(saveTimer);await saveQueue;state=next;await loadAssets();try{await ensureFont(state.font);}catch{state.font='noto';await ensureFont('noto');}renderPanel();change();await persist();}
$('#reset-current').onclick=async()=>{
  if(slotBusy||!confirm('현재 편집 중인 작업을 초기화할까요? 저장 슬롯은 유지되며, 슬롯 화면에서 이전 작업으로 돌아갈 수 있습니다.'))return;
  slotBusy=true;$('#reset-current').disabled=true;
  try{await restoreSlot(defaults());notice('현재 작업을 초기화했습니다. 저장 슬롯은 그대로 있습니다.');}
  catch{notice('초기화하지 못했습니다. 저장 공간을 확인해 주세요.');}
  finally{slotBusy=false;$('#reset-current').disabled=false;}
};
document.addEventListener('click',async e=>{const t=e.target;if(!t.dataset.slotSave&&!t.dataset.slotLoad&&t.id!=='slot-undo')return;if(slotBusy)return;slotBusy=true;t.disabled=true;try{if(t.dataset.slotSave){const key='slot-'+t.dataset.slotSave,old=await slotRead(key);if(old&&!confirm('이 슬롯에 저장된 작업을 현재 작업으로 덮어쓸까요?'))return;await slotWrite(key,{project:clone(state),title:state.title||state.a.name+' / '+state.b.name,savedAt:Date.now()});notice('슬롯에 저장했습니다.');}else{const value=await slotRead(t.id==='slot-undo'?'before-slot-load':'slot-'+t.dataset.slotLoad);if(!value)throw new Error('빈 슬롯');await restoreSlot(value.project);notice('작업을 불러왔습니다. 직전 작업으로 돌아갈 수도 있습니다.');}await renderSlots();}catch{notice('슬롯 처리에 실패했습니다. 저장 공간을 확인하고 작업 파일로 백업해 주세요.');}finally{slotBusy=false;if(t.isConnected)t.disabled=false;}});
