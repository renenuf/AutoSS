export function getBookmarkletCode(): string {
  const script = `
(function(){
  if(document.getElementById('course-capture-panel')){
    document.getElementById('course-capture-panel').remove();
    return;
  }

  var NAVIGATION_PATTERNS=['ir al siguiente','siguiente elemento','siguiente leccion','siguiente modulo','siguiente tema','siguiente paso','go to next','siguiente pagina','siguiente unidad','proximo','proxima','next item','next element','next lesson','next module'];
  var COMPLETE_PATTERNS=['marcar como completo','mark as complete','mark complete','completar','complete','done','finalizar','finish','terminado','completed','hecho'];
  var ARROW_PATTERNS=['\u2192','\u203a','\u00bb','>','\u25b6','\u23ed','\u21d2'];
  var BUTTON_SELECTORS=[
    '[data-testid="next-item-button"]',
    '[data-testid="cds-button"]',
    'button[data-track-component="click_next_item"]',
    '[class*="rc-ItemNavigation"] button',
    '[class*="item-nav"] button',
    '[class*="ItemNavigation"] a',
    '[class*="next-item"]',
    'button[class*="next"]',
    'a[class*="next"]',
    '[class*="nav-next"]',
    '[class*="next-button"]',
    '[class*="next-btn"]',
    '[class*="btn-next"]',
    '[data-action="next"]',
    '[data-nav="next"]',
    '[aria-label*="next" i]',
    '[aria-label*="siguiente" i]',
    '[title*="next" i]',
    '[title*="siguiente" i]',
    '.pagination-next',
    '.next-page',
    '#next-button',
    '#nextButton',
    '#btnNext',
    '.submitbtns input[name="next"]',
    '.activity-navigation .next',
    '[class*="NavigationNext"]',
    '[class*="navigation-next"]'
  ];

  var state={status:'idle',screenshots:[],delay:4000,customNextSelector:'',captureMode:'auto',scrollDelay:500,autoComplete:true,logs:[]};
  var timeoutId=null;

  function log(m){var t=new Date().toLocaleTimeString();state.logs.push('['+t+'] '+m);updateLogDisplay();}

  function loadScript(u){return new Promise(function(r,j){var e=document.querySelector('script[src="'+u+'"]');if(e){r();return;}var s=document.createElement('script');s.src=u;s.onload=function(){r();};s.onerror=function(){j(new Error('Failed to load '+u));};document.head.appendChild(s);});}

  async function loadDeps(){
    log('Loading dependencies...');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
    log('Dependencies loaded');
  }

  function isVisible(el){var s=window.getComputedStyle(el);var r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&s.opacity!=='0'&&r.width>0&&r.height>0;}
  function isClickable(el){var s=window.getComputedStyle(el);return !el.hasAttribute('disabled')&&s.pointerEvents!=='none'&&el.getAttribute('aria-disabled')!=='true';}

  function prepareForCapture(){
    if(window.getSelection){window.getSelection().removeAllRanges();}
    if(document.activeElement&&document.activeElement.blur){document.activeElement.blur();}
    var hovers=document.querySelectorAll(':hover');
    hovers.forEach(function(el){el.dispatchEvent(new MouseEvent('mouseleave',{bubbles:true}));});
  }

  function hasVideoContent(){
    var videos=document.querySelectorAll('video');
    for(var i=0;i<videos.length;i++){if(isVisible(videos[i]))return true;}
    var iframes=document.querySelectorAll('iframe');
    for(var i=0;i<iframes.length;i++){
      var src=(iframes[i].src||'').toLowerCase();
      if(isVisible(iframes[i])&&(src.indexOf('youtube')>=0||src.indexOf('vimeo')>=0||src.indexOf('video')>=0||src.indexOf('player')>=0))return true;
    }
    var videoContainers=document.querySelectorAll('[class*="video"],[class*="player"],[data-testid*="video"]');
    for(var i=0;i<videoContainers.length;i++){if(isVisible(videoContainers[i])&&videoContainers[i].offsetHeight>200)return true;}
    return false;
  }

  function hasTranscript(){
    var transcriptElements=document.querySelectorAll('[class*="transcript"],[class*="Transcript"],[data-testid*="transcript"]');
    for(var i=0;i<transcriptElements.length;i++){if(isVisible(transcriptElements[i]))return true;}
    var tabs=document.querySelectorAll('button,a,[role="tab"]');
    for(var i=0;i<tabs.length;i++){
      var t=(tabs[i].textContent||'').toLowerCase();
      if(t.indexOf('transcripci')>=0||t.indexOf('transcript')>=0)return true;
    }
    return false;
  }

  function hasLongContent(){
    var articles=document.querySelectorAll('article,[class*="content"],[class*="Content"],[class*="ItemContent"],[class*="reading"],[class*="Reading"],[class*="lectura"],[class*="Lectura"]');
    for(var i=0;i<articles.length;i++){
      if(isVisible(articles[i])&&articles[i].scrollHeight>600)return true;
    }
    var paragraphs=document.querySelectorAll('p');
    var totalTextHeight=0;
    for(var i=0;i<paragraphs.length;i++){
      if(isVisible(paragraphs[i]))totalTextHeight+=paragraphs[i].offsetHeight;
    }
    if(totalTextHeight>500)return true;
    return false;
  }

  function needsScrollCapture(){
    if(hasVideoContent()||hasTranscript()||hasLongContent())return true;
    var bodyScroll=document.body.scrollHeight;
    var docScroll=document.documentElement.scrollHeight;
    var maxScroll=Math.max(bodyScroll,docScroll);
    var viewHeight=window.innerHeight;
    if(maxScroll>viewHeight*1.2)return true;
    var container=getScrollableContainer();
    var scrollHeight=container.scrollHeight;
    var clientHeight=container===document.documentElement?window.innerHeight:container.clientHeight;
    return scrollHeight>clientHeight*1.2;
  }

  function findCompleteButton(){
    var all=document.querySelectorAll('button,a,[role="button"],input[type="button"],input[type="submit"]');
    for(var i=0;i<all.length;i++){
      var el=all[i];
      var t=(el.textContent||'').toLowerCase().trim();
      var a=(el.getAttribute('aria-label')||'').toLowerCase();
      var ti=(el.getAttribute('title')||'').toLowerCase();
      var combined=t+' '+a+' '+ti;
      for(var j=0;j<COMPLETE_PATTERNS.length;j++){
        if(combined.indexOf(COMPLETE_PATTERNS[j])>=0&&isVisible(el)&&isClickable(el)){
          var isNav=false;
          for(var k=0;k<NAVIGATION_PATTERNS.length;k++){if(combined.indexOf(NAVIGATION_PATTERNS[k])>=0){isNav=true;break;}}
          if(!isNav)return el;
        }
      }
    }
    return null;
  }

  function findNextButton(){
    if(state.customNextSelector){var c=document.querySelector(state.customNextSelector);if(c&&isVisible(c))return c;}
    for(var i=0;i<BUTTON_SELECTORS.length;i++){try{var els=document.querySelectorAll(BUTTON_SELECTORS[i]);for(var j=0;j<els.length;j++){if(isVisible(els[j])&&isClickable(els[j]))return els[j];}}catch(e){}}
    var all=document.querySelectorAll('button,a,[role="button"],input[type="button"],input[type="submit"]');
    for(var i=0;i<all.length;i++){var el=all[i];var t=(el.textContent||'').toLowerCase().trim();var a=(el.getAttribute('aria-label')||'').toLowerCase();var ti=(el.getAttribute('title')||'').toLowerCase();var c=t+' '+a+' '+ti;
      for(var j=0;j<NAVIGATION_PATTERNS.length;j++){if(c.indexOf(NAVIGATION_PATTERNS[j])>=0&&isVisible(el)&&isClickable(el))return el;}
      for(var j=0;j<ARROW_PATTERNS.length;j++){if(t.indexOf(ARROW_PATTERNS[j])>=0&&isVisible(el)&&isClickable(el))return el;}}
    return null;
  }

  function getScrollableContainer(){
    var containers=[
      document.querySelector('[class*="rc-ItemContent"]'),
      document.querySelector('[class*="item-page-content"]'),
      document.querySelector('main'),
      document.querySelector('[role="main"]'),
      document.documentElement
    ];
    for(var i=0;i<containers.length;i++){
      if(containers[i]&&containers[i].scrollHeight>containers[i].clientHeight)return containers[i];
    }
    return document.documentElement;
  }

  async function captureViewport(){
    var panel=document.getElementById('course-capture-panel');
    if(panel)panel.style.display='none';
    prepareForCapture();
    await new Promise(function(r){setTimeout(r,100);});
    try{
      var opts={useCORS:true,allowTaint:true,scale:window.devicePixelRatio||1,logging:false,backgroundColor:'#ffffff',
        width:window.innerWidth,height:window.innerHeight,windowWidth:window.innerWidth,windowHeight:window.innerHeight,
        x:window.scrollX,y:window.scrollY,
        ignoreElements:function(el){return el.tagName==='VIDEO'||el.id==='course-capture-panel';}};
      var canvas=await html2canvas(document.body,opts);
      var ss={id:state.screenshots.length+1,dataUrl:canvas.toDataURL('image/png'),timestamp:Date.now(),title:document.title||'Page '+(state.screenshots.length+1)};
      state.screenshots.push(ss);
      log('Screenshot '+ss.id+' captured');
    }catch(e){log('Error: '+e.message);}
    if(panel)panel.style.display='block';
    updateUI();
  }

  async function captureFullPage(){
    var panel=document.getElementById('course-capture-panel');
    if(panel)panel.style.display='none';
    prepareForCapture();
    await new Promise(function(r){setTimeout(r,100);});
    log('Capturing full page...');
    try{
      var opts={useCORS:true,allowTaint:true,scale:Math.min(window.devicePixelRatio||1,2),logging:false,backgroundColor:'#ffffff',
        width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,
        windowWidth:document.documentElement.scrollWidth,windowHeight:document.documentElement.scrollHeight,
        ignoreElements:function(el){return el.tagName==='VIDEO'||el.id==='course-capture-panel';}};
      var canvas=await html2canvas(document.body,opts);
      var ss={id:state.screenshots.length+1,dataUrl:canvas.toDataURL('image/png'),timestamp:Date.now(),title:document.title||'Page '+(state.screenshots.length+1)};
      state.screenshots.push(ss);
      log('Full page captured');
    }catch(e){log('Error: '+e.message);}
    if(panel)panel.style.display='block';
    updateUI();
  }

  async function captureWithScroll(){
    var panel=document.getElementById('course-capture-panel');
    if(panel)panel.style.display='none';
    prepareForCapture();
    log('Starting scroll capture...');

    var container=getScrollableContainer();
    var scrollTop=container===document.documentElement?window.scrollY:container.scrollTop;
    var scrollHeight=container.scrollHeight;
    var clientHeight=container===document.documentElement?window.innerHeight:container.clientHeight;
    var totalScrolls=Math.ceil(scrollHeight/clientHeight);
    var captureCount=0;

    if(container===document.documentElement){window.scrollTo(0,0);}else{container.scrollTop=0;}
    await new Promise(function(r){setTimeout(r,300);});

    for(var i=0;i<totalScrolls&&i<20;i++){
      prepareForCapture();
      await new Promise(function(r){setTimeout(r,100);});
      log('Scroll capture '+(i+1)+'/'+totalScrolls);
      try{
        var opts={useCORS:true,allowTaint:true,scale:window.devicePixelRatio||1,logging:false,backgroundColor:'#ffffff',
          width:window.innerWidth,height:window.innerHeight,windowWidth:window.innerWidth,windowHeight:window.innerHeight,
          x:window.scrollX,y:window.scrollY,
          ignoreElements:function(el){return el.tagName==='VIDEO'||el.id==='course-capture-panel';}};
        var canvas=await html2canvas(document.body,opts);
        var ss={id:state.screenshots.length+1,dataUrl:canvas.toDataURL('image/png'),timestamp:Date.now(),
          title:(document.title||'Page')+'_scroll_'+(i+1)};
        state.screenshots.push(ss);
        captureCount++;
      }catch(e){log('Error: '+e.message);}

      if(i<totalScrolls-1){
        var scrollAmount=clientHeight-50;
        if(container===document.documentElement){window.scrollBy(0,scrollAmount);}else{container.scrollTop+=scrollAmount;}
        await new Promise(function(r){setTimeout(r,state.scrollDelay);});
      }
    }

    if(container===document.documentElement){window.scrollTo(0,scrollTop);}else{container.scrollTop=scrollTop;}
    log('Scroll capture done: '+captureCount+' images');
    if(panel)panel.style.display='block';
    updateUI();
  }

  async function captureScreenshot(){
    var mode=state.captureMode;
    if(mode==='auto'){
      var useScroll=needsScrollCapture();
      log('Auto-detect: '+(useScroll?'scroll (video/long page)':'viewport'));
      if(useScroll){await captureWithScroll();}else{await captureViewport();}
    }else if(mode==='viewport'){
      log('Capturing viewport...');
      await captureViewport();
    }else if(mode==='fullpage'){
      await captureFullPage();
    }else if(mode==='scroll'){
      await captureWithScroll();
    }
  }

  async function clickCompleteButton(){
    if(!state.autoComplete)return false;
    var btn=findCompleteButton();
    if(!btn)return false;
    log('Clicking complete: '+(btn.textContent||'').trim().substring(0,25));
    btn.scrollIntoView({behavior:'smooth',block:'center'});
    await new Promise(function(r){setTimeout(r,300);});
    btn.click();
    await new Promise(function(r){setTimeout(r,1000);});
    return true;
  }

  async function clickNext(){var btn=findNextButton();if(!btn){log('No next button found');return false;}log('Clicking next: '+(btn.textContent||'').trim().substring(0,25));btn.scrollIntoView({behavior:'smooth',block:'center'});await new Promise(function(r){setTimeout(r,300);});btn.click();return true;}
  function waitForPageLoad(){return new Promise(function(r){setTimeout(r,state.delay);});}

  async function runAutomation(){
    if(state.status!=='running')return;
    await captureScreenshot();
    await clickCompleteButton();
    var hasNext=await clickNext();
    if(!hasNext){state.status='complete';updateUI();log('Complete - no more pages');return;}
    log('Waiting '+state.delay/1000+'s...');
    await waitForPageLoad();
    if(state.status==='running'){timeoutId=setTimeout(runAutomation,100);}
  }

  function start(){if(state.status==='running')return;state.status='running';log('Starting automation');updateUI();runAutomation();}
  function pause(){if(state.status!=='running')return;state.status='paused';if(timeoutId)clearTimeout(timeoutId);log('Paused');updateUI();}
  function resume(){if(state.status!=='paused')return;state.status='running';log('Resuming');updateUI();runAutomation();}
  function stop(){state.status='idle';if(timeoutId)clearTimeout(timeoutId);log('Stopped');updateUI();}

  async function exportZip(){
    if(state.screenshots.length===0){alert('No screenshots');return;}
    log('Creating ZIP...');var zip=new JSZip();
    for(var i=0;i<state.screenshots.length;i++){var ss=state.screenshots[i];var b64=ss.dataUrl.split(',')[1];var fn=String(ss.id).padStart(3,'0')+'_'+ss.title.replace(/[^a-z0-9]/gi,'_').substring(0,50)+'.png';zip.file(fn,b64,{base64:true});}
    var blob=await zip.generateAsync({type:'blob'});downloadBlob(blob,'course_screenshots_'+Date.now()+'.zip');log('ZIP exported');
  }

  async function exportPdf(){
    if(state.screenshots.length===0){alert('No screenshots');return;}
    log('Creating PDF...');var pdf=new jspdf.jsPDF({orientation:'landscape',unit:'px',format:[1920,1080]});
    for(var i=0;i<state.screenshots.length;i++){
      if(i>0)pdf.addPage([1920,1080],'landscape');
      var ss=state.screenshots[i];
      var img=new Image();
      img.src=ss.dataUrl;
      await new Promise(function(r){img.onload=r;});
      var pw=pdf.internal.pageSize.getWidth();
      var ph=pdf.internal.pageSize.getHeight();
      var ratio=Math.min(pw/img.width,ph/img.height);
      var w=img.width*ratio;
      var h=img.height*ratio;
      var x=(pw-w)/2;
      var y=(ph-h)/2;
      pdf.addImage(ss.dataUrl,'PNG',x,y,w,h);
    }
    pdf.save('course_screenshots_'+Date.now()+'.pdf');log('PDF exported');
  }

  function downloadBlob(b,f){var u=URL.createObjectURL(b);var a=document.createElement('a');a.href=u;a.download=f;document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(u);}

  function createPanel(){
    var p=document.createElement('div');p.id='course-capture-panel';
    p.innerHTML='<style>#course-capture-panel{position:fixed;top:20px;right:20px;width:340px;background:#1a1a2e;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.3);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;z-index:2147483647;color:#fff;overflow:hidden}#course-capture-panel *{box-sizing:border-box}.ccp-header{background:linear-gradient(135deg,#16213e,#1a1a2e);padding:12px 16px;cursor:move;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #2a2a4a}.ccp-title{font-weight:600;font-size:14px;display:flex;align-items:center;gap:8px}.ccp-close{background:none;border:none;color:#888;cursor:pointer;font-size:20px;padding:0;line-height:1}.ccp-close:hover{color:#ff6b6b}.ccp-body{padding:16px}.ccp-status{display:flex;align-items:center;gap:8px;margin-bottom:12px;padding:8px 12px;background:#2a2a4a;border-radius:8px;font-size:13px}.ccp-status-dot{width:10px;height:10px;border-radius:50%;background:#888}.ccp-status-dot.idle{background:#888}.ccp-status-dot.running{background:#4ade80;animation:pulse 1s infinite}.ccp-status-dot.paused{background:#fbbf24}.ccp-status-dot.complete{background:#60a5fa}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}.ccp-counter{font-size:24px;font-weight:700;text-align:center;margin-bottom:12px;color:#60a5fa}.ccp-counter span{font-size:12px;color:#888;display:block;font-weight:400}.ccp-mode{margin-bottom:12px}.ccp-mode-label{font-size:11px;color:#888;margin-bottom:6px;display:block}.ccp-mode-btns{display:flex;gap:4px}.ccp-mode-btn{flex:1;padding:8px 4px;border:1px solid #2a2a4a;border-radius:6px;background:#16213e;color:#888;font-size:10px;cursor:pointer;transition:all .2s;text-align:center}.ccp-mode-btn:hover{border-color:#3b82f6;color:#fff}.ccp-mode-btn.active{background:#3b82f6;border-color:#3b82f6;color:#fff}.ccp-mode-desc{font-size:10px;color:#666;margin-top:6px;text-align:center}.ccp-controls{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px}.ccp-btn{padding:10px 8px;border:none;border-radius:8px;font-size:12px;font-weight:500;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:4px}.ccp-btn:disabled{opacity:.5;cursor:not-allowed}.ccp-btn-primary{background:#3b82f6;color:#fff}.ccp-btn-primary:hover:not(:disabled){background:#2563eb}.ccp-btn-secondary{background:#374151;color:#fff}.ccp-btn-secondary:hover:not(:disabled){background:#4b5563}.ccp-btn-success{background:#059669;color:#fff}.ccp-btn-success:hover:not(:disabled){background:#047857}.ccp-btn-danger{background:#dc2626;color:#fff}.ccp-btn-danger:hover:not(:disabled){background:#b91c1c}.ccp-btn-capture{background:linear-gradient(135deg,#3b82f6,#06b6d4);color:#fff;grid-column:span 2;padding:12px}.ccp-btn-capture:hover{opacity:.9}.ccp-toggle{display:flex;align-items:center;gap:8px;margin-bottom:12px;padding:8px 12px;background:#2a2a4a;border-radius:8px}.ccp-toggle-label{font-size:12px;flex:1}.ccp-toggle-switch{position:relative;width:40px;height:22px;background:#374151;border-radius:11px;cursor:pointer;transition:background .2s}.ccp-toggle-switch.active{background:#3b82f6}.ccp-toggle-switch::after{content:"";position:absolute;top:3px;left:3px;width:16px;height:16px;background:#fff;border-radius:50%;transition:transform .2s}.ccp-toggle-switch.active::after{transform:translateX(18px)}.ccp-settings{margin-top:12px;padding-top:12px;border-top:1px solid #2a2a4a}.ccp-settings-toggle{background:none;border:none;color:#60a5fa;cursor:pointer;font-size:12px;padding:0;display:flex;align-items:center;gap:4px}.ccp-settings-content{margin-top:12px;display:none}.ccp-settings-content.open{display:block}.ccp-input-group{margin-bottom:12px}.ccp-label{font-size:11px;color:#888;margin-bottom:4px;display:block}.ccp-input{width:100%;padding:8px 12px;border:1px solid #2a2a4a;border-radius:6px;background:#16213e;color:#fff;font-size:13px}.ccp-input:focus{outline:none;border-color:#3b82f6}.ccp-log{margin-top:12px;max-height:80px;overflow-y:auto;background:#0d1117;border-radius:6px;padding:8px;font-family:monospace;font-size:10px;color:#7ee787}.ccp-log::-webkit-scrollbar{width:4px}.ccp-log::-webkit-scrollbar-thumb{background:#374151;border-radius:2px}.ccp-preview{margin-top:12px}.ccp-preview-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;max-height:60px;overflow-y:auto}.ccp-preview-thumb{aspect-ratio:16/9;background:#2a2a4a;border-radius:4px;overflow:hidden}.ccp-preview-thumb img{width:100%;height:100%;object-fit:cover}</style><div class="ccp-header"><div class="ccp-title"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>Course Capture</div><button class="ccp-close" id="ccp-close">&times;</button></div><div class="ccp-body"><div class="ccp-status"><div class="ccp-status-dot idle" id="ccp-status-dot"></div><span id="ccp-status-text">Ready</span></div><div class="ccp-counter"><span id="ccp-count">0</span><span>screenshots captured</span></div><div class="ccp-toggle"><span class="ccp-toggle-label">Auto-click "Mark complete"</span><div class="ccp-toggle-switch active" id="ccp-auto-complete"></div></div><div class="ccp-mode"><span class="ccp-mode-label">Capture Mode</span><div class="ccp-mode-btns"><button class="ccp-mode-btn active" data-mode="auto">Auto</button><button class="ccp-mode-btn" data-mode="viewport">Viewport</button><button class="ccp-mode-btn" data-mode="scroll">Scroll</button><button class="ccp-mode-btn" data-mode="fullpage">Full</button></div><div class="ccp-mode-desc" id="ccp-mode-desc">Auto-detects videos and long pages</div></div><div class="ccp-controls"><button class="ccp-btn ccp-btn-capture" id="ccp-capture"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="3"/></svg>Capture Screenshot</button></div><div class="ccp-controls"><button class="ccp-btn ccp-btn-primary" id="ccp-start"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>Auto</button><button class="ccp-btn ccp-btn-secondary" id="ccp-pause" disabled><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>Pause</button><button class="ccp-btn ccp-btn-danger" id="ccp-stop" disabled><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>Stop</button><button class="ccp-btn ccp-btn-secondary" id="ccp-clear"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>Clear</button></div><div class="ccp-controls"><button class="ccp-btn ccp-btn-success" id="ccp-zip" disabled><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>ZIP</button><button class="ccp-btn ccp-btn-success" id="ccp-pdf" disabled><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>PDF</button></div><div class="ccp-settings"><button class="ccp-settings-toggle" id="ccp-settings-toggle"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>Settings</button><div class="ccp-settings-content" id="ccp-settings-content"><div class="ccp-input-group"><label class="ccp-label">Delay between pages (ms)</label><input type="number" class="ccp-input" id="ccp-delay" value="4000" min="1000" max="30000" step="500"></div><div class="ccp-input-group"><label class="ccp-label">Scroll delay (ms)</label><input type="number" class="ccp-input" id="ccp-scroll-delay" value="500" min="200" max="3000" step="100"></div><div class="ccp-input-group"><label class="ccp-label">Custom Next Button Selector</label><input type="text" class="ccp-input" id="ccp-next-selector" placeholder="e.g. button.next-btn"></div></div></div><div class="ccp-preview" id="ccp-preview" style="display:none"><div class="ccp-label">Recent captures</div><div class="ccp-preview-grid" id="ccp-preview-grid"></div></div><div class="ccp-log" id="ccp-log"></div></div>';
    return p;
  }

  function initDragging(p){
    var h=p.querySelector('.ccp-header');var isDragging=false,startX=0,startY=0,startLeft=0,startTop=0;
    h.addEventListener('mousedown',function(e){if(e.target.classList.contains('ccp-close'))return;isDragging=true;startX=e.clientX;startY=e.clientY;var r=p.getBoundingClientRect();startLeft=r.left;startTop=r.top;});
    document.addEventListener('mousemove',function(e){if(!isDragging)return;var dx=e.clientX-startX;var dy=e.clientY-startY;p.style.left=(startLeft+dx)+'px';p.style.top=(startTop+dy)+'px';p.style.right='auto';});
    document.addEventListener('mouseup',function(){isDragging=false;});
  }

  function updateModeDesc(){
    var desc=document.getElementById('ccp-mode-desc');
    if(!desc)return;
    var descs={
      auto:'Auto-detects videos and long pages',
      viewport:'Captures visible screen area',
      scroll:'Scrolls down and captures each section',
      fullpage:'Captures entire page as one image'
    };
    desc.textContent=descs[state.captureMode]||'';
  }

  function updateUI(){
    var sd=document.getElementById('ccp-status-dot');var st=document.getElementById('ccp-status-text');var cnt=document.getElementById('ccp-count');
    var startBtn=document.getElementById('ccp-start');var pauseBtn=document.getElementById('ccp-pause');var stopBtn=document.getElementById('ccp-stop');
    var zipBtn=document.getElementById('ccp-zip');var pdfBtn=document.getElementById('ccp-pdf');var preview=document.getElementById('ccp-preview');var pg=document.getElementById('ccp-preview-grid');
    var autoCompleteToggle=document.getElementById('ccp-auto-complete');
    if(sd)sd.className='ccp-status-dot '+state.status;
    var texts={idle:'Ready',running:'Running...',paused:'Paused',complete:'Complete'};
    if(st)st.textContent=texts[state.status];
    if(cnt)cnt.textContent=state.screenshots.length;
    if(startBtn){startBtn.disabled=state.status==='running';startBtn.innerHTML=(state.status==='paused'?'<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>Resume':'<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>Auto');}
    if(pauseBtn)pauseBtn.disabled=state.status!=='running';
    if(stopBtn)stopBtn.disabled=state.status==='idle'||state.status==='complete';
    var has=state.screenshots.length>0;
    if(zipBtn)zipBtn.disabled=!has;if(pdfBtn)pdfBtn.disabled=!has;
    if(preview&&pg&&has){preview.style.display='block';var r=state.screenshots.slice(-8);pg.innerHTML=r.map(function(s){return '<div class="ccp-preview-thumb"><img src="'+s.dataUrl+'" alt="Screenshot '+s.id+'"></div>';}).join('');}
    if(autoCompleteToggle){autoCompleteToggle.classList.toggle('active',state.autoComplete);}

    var modeBtns=document.querySelectorAll('.ccp-mode-btn');
    modeBtns.forEach(function(btn){btn.classList.toggle('active',btn.dataset.mode===state.captureMode);});
    updateModeDesc();
  }

  function updateLogDisplay(){var l=document.getElementById('ccp-log');if(l){l.innerHTML=state.logs.slice(-10).join('<br>');l.scrollTop=l.scrollHeight;}}

  function bindEvents(p){
    p.querySelector('#ccp-close').addEventListener('click',function(){stop();p.remove();});
    p.querySelector('#ccp-start').addEventListener('click',function(){if(state.status==='paused')resume();else start();});
    p.querySelector('#ccp-pause').addEventListener('click',pause);
    p.querySelector('#ccp-stop').addEventListener('click',stop);
    p.querySelector('#ccp-capture').addEventListener('click',function(){captureScreenshot();});
    p.querySelector('#ccp-zip').addEventListener('click',exportZip);
    p.querySelector('#ccp-pdf').addEventListener('click',exportPdf);
    p.querySelector('#ccp-clear').addEventListener('click',function(){state.screenshots=[];log('Cleared');updateUI();document.getElementById('ccp-preview').style.display='none';});
    p.querySelector('#ccp-settings-toggle').addEventListener('click',function(){document.getElementById('ccp-settings-content').classList.toggle('open');});
    p.querySelector('#ccp-delay').addEventListener('change',function(e){state.delay=parseInt(e.target.value)||4000;log('Page delay: '+state.delay+'ms');});
    p.querySelector('#ccp-scroll-delay').addEventListener('change',function(e){state.scrollDelay=parseInt(e.target.value)||500;log('Scroll delay: '+state.scrollDelay+'ms');});
    p.querySelector('#ccp-next-selector').addEventListener('change',function(e){state.customNextSelector=e.target.value;log('Next selector: '+(state.customNextSelector||'auto'));});
    p.querySelector('#ccp-auto-complete').addEventListener('click',function(){state.autoComplete=!state.autoComplete;log('Auto-complete: '+(state.autoComplete?'ON':'OFF'));updateUI();});

    p.querySelectorAll('.ccp-mode-btn').forEach(function(btn){
      btn.addEventListener('click',function(){
        state.captureMode=btn.dataset.mode;
        log('Mode: '+state.captureMode);
        updateUI();
      });
    });
  }

  async function init(){var p=createPanel();document.body.appendChild(p);initDragging(p);bindEvents(p);await loadDeps();log('Ready');updateUI();}
  init();
})();
`;

  const minified = script.replace(/\s+/g, ' ').replace(/\s*([{};,:])\s*/g, '$1').trim();
  return `javascript:${encodeURIComponent(minified)}`;
}
