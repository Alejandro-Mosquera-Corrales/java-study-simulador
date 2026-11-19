/* JavaStudy - Simulador independiente, sin cuentas ni backend. */
(() => {
  'use strict';
  const STORE_KEY = 'javastudy_lists_v1';
  const SECTION_TITLES = { inicio: 'Inicio', estudio: 'Modo estudio', examen: 'Modo examen', oral: 'Sustentación oral', resultados: 'Mis resultados', codigo: 'Código fuente' };
  const LEVELS = ['Básico', 'Intermedio', 'Avanzado'];
  const letters = ['A', 'B', 'C', 'D'];
  const $ = (sel) => document.querySelector(sel);
  const root = $('#page-root');
  const escapeHtml = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const getTopic = (id) => TOPICS.find(t => t.id === id);
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const shuffle = (arr) => { const x = [...arr]; for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; };
  const percent = (n, d) => d ? Math.round((100 * n) / d) : 0;
  const formatDate = (v) => new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(v));
  const fmtTime = (sec) => `${Math.floor(sec / 60)} min ${String(sec % 60).padStart(2, '0')} s`;
  function loadData() { try { const d = JSON.parse(localStorage.getItem(STORE_KEY)); return { mastered: Array.isArray(d?.mastered) ? d.mastered.filter(x => Number.isInteger(x) && x >= 1 && x <= 50) : [], exams: Array.isArray(d?.exams) ? d.exams : [], oralHistory: Array.isArray(d?.oralHistory) ? d.oralHistory : [] }; } catch { return { mastered: [], exams: [], oralHistory: [] }; } }
  const saved = loadData();
  const state = {
    page: SECTION_TITLES[location.hash.slice(1)] ? location.hash.slice(1) : 'inicio',
    mastered: new Set(saved.mastered), exams: saved.exams, oralHistory: saved.oralHistory,
    study: { search: '', topic: 'todos', level: 'todos', index: 0, showAnswer: false },
    examConfig: { count: 10, topic: 'todos' }, exam: null,
    oralConfig: { count: 10, topic: 'todos' }, oral: null,
    source: 'Lista'
  };
  let toastTimer = 0;
  function saveData() { try { localStorage.setItem(STORE_KEY, JSON.stringify({ mastered: [...state.mastered], exams: state.exams.slice(-100), oralHistory: state.oralHistory.slice(-100) })); } catch { toast('El navegador no permitió guardar el progreso.'); } }
  function toast(msg) { const el = $('#toast'); el.textContent = msg; el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 3200); }
  function selectTopicOptions(selected) { return `<option value="todos" ${selected === 'todos' ? 'selected' : ''}>Todos los temas</option>` + TOPICS.map(t => `<option value="${t.id}" ${selected === t.id ? 'selected' : ''}>${escapeHtml(t.short)} (${QUESTIONS.filter(q => q.topic === t.id).length})</option>`).join(''); }
  function badges(q) { return `<span class="tag">${escapeHtml(getTopic(q.topic)?.short)}</span><span class="tag ${q.level === 'Avanzado' ? 'tag-amber' : 'tag-secondary'}">${escapeHtml(q.level)}</span>`; }
  function codeSnippet(q) { return `<div class="code-label"><span>INSTRUCCIÓN / FRAGMENTO RELACIONADO</span><span>${escapeHtml(q.id <= 44 ? 'Lista.java' : q.id === 48 || q.id === 49 ? 'Main.java' : 'Proyecto Java')}</span></div><pre class="code-box"><code>${escapeHtml(q.code)}</code></pre>`; }
  function answerPanels(q) { return `<div class="answer-panel"><h3>Respuesta para el profesor</h3><p>${escapeHtml(q.answer)}</p></div><div class="explain-panel"><h3>¿Cómo funciona en tu código?</h3><p>${escapeHtml(q.explain)}</p></div>`; }
  function updateShell() {
    $('#topbar-title').textContent = SECTION_TITLES[state.page];
    document.title = `${SECTION_TITLES[state.page]} | JavaStudy`;
    document.querySelectorAll('[data-page]').forEach(el => el.classList.toggle('active', el.dataset.page === state.page));
    const n = state.mastered.size;
    $('#sidebar-progress-percent').textContent = `${percent(n, QUESTIONS.length)}%`;
    $('#sidebar-progress-fill').style.width = `${percent(n, QUESTIONS.length)}%`;
    $('#sidebar-progress-text').textContent = `${n} de ${QUESTIONS.length} preguntas dominadas`;
  }
  function pageHeader(eyebrow, heading, desc) { return `<div class="page-heading"><div class="eyebrow">${eyebrow}</div><h1>${heading}</h1><p>${desc}</p></div>`; }
  function renderHome() {
    const done = state.mastered.size;
    const last = state.exams.at(-1);
    const tiles = [
      { icon: '▤', number: QUESTIONS.length, label: 'Preguntas de estudio' },
      { icon: '⌘', number: '04', label: 'Clases Java originales' },
      { icon: '◉', number: `${done}/${QUESTIONS.length}`, label: 'Preguntas dominadas' },
      { icon: '▥', number: last ? `${last.percent}%` : '—', label: 'Última evaluación' }
    ];
    root.innerHTML = `
      <section class="hero"><div class="eyebrow">TU ENTRENAMIENTO PARA LA SUSTENTACIÓN</div><h1>No memorices el código.<br><em>Aprende a defenderlo.</em></h1><p>50 preguntas basadas en tu proyecto real de listas enlazadas en Java. Comprende cada instrucción, practica como si estuvieras frente al profesor y mide tu progreso.</p><div class="hero-actions"><button type="button" class="btn btn-primary" data-action="go" data-target="estudio">Comenzar a estudiar ↗</button><button type="button" class="btn btn-hero-outline" data-action="go" data-target="examen">Hacer un examen →</button></div></section>
      <section class="stats-grid">${tiles.map(t => `<div class="stat-card"><span class="stat-icon">${t.icon}</span><div class="stat-number">${t.number}</div><div class="stat-label">${t.label}</div></div>`).join('')}</section>
      <section><div class="section-head"><div><div class="eyebrow">ELIGE TU MÉTODO</div><h2>Una forma de aprender para cada momento.</h2></div></div>
      <div class="mode-grid"><button class="mode-card" data-action="go" data-target="estudio"><div class="mode-symbol">▤</div><strong>Modo estudio</strong><p>Recorre las 50 preguntas. Descubre la respuesta, revisa el código y marca lo que ya dominas.</p><span class="mode-action">Explorar preguntas →</span></button><button class="mode-card" data-action="go" data-target="examen"><div class="mode-symbol">◉</div><strong>Modo examen</strong><p>Responde preguntas de opción múltiple sin ver las soluciones. Recibe una nota al finalizar.</p><span class="mode-action">Probar mis conocimientos →</span></button><button class="mode-card" data-action="go" data-target="oral"><div class="mode-symbol">♬</div><strong>Sustentación oral</strong><p>Responde como frente al profesor, compara tu explicación y califica tu propia respuesta.</p><span class="mode-action">Practicar oralmente →</span></button></div></section>
      <section><div class="section-head"><div><div class="eyebrow">CONTENIDO</div><h2>Lo que vas a dominar</h2><p>Las preguntas están organizadas según los métodos y clases que compartiste.</p></div><button class="link-btn" data-action="go" data-target="codigo">Ver código original →</button></div>
      <div class="topic-grid">${TOPICS.map((t,i) => { const total = QUESTIONS.filter(q => q.topic === t.id).length; const doneTopic = QUESTIONS.filter(q => q.topic === t.id && state.mastered.has(q.id)).length; return `<div class="topic-card"><span class="topic-bullet">${['◇','＋','⌕','−','⇅','⌘'][i]}</span><div><h3>${escapeHtml(t.name)}</h3><p>${total} preguntas · ${doneTopic} dominadas</p></div><div class="topic-right">${percent(doneTopic,total)}%</div></div>`; }).join('')}</div></section>
      <div class="callout"><strong>Sin registro y sin cuentas:</strong> esta página funciona gratuitamente desde el navegador. Cada persona conserva sus propios resultados en el dispositivo que utiliza; no se comparten notas entre compañeros.</div>`;
  }
  function filteredStudy() {
    const s = state.study;
    const term = s.search.toLocaleLowerCase('es').trim();
    return QUESTIONS.filter(q => (s.topic === 'todos' || q.topic === s.topic) && (s.level === 'todos' || q.level === s.level) && (!term || [q.prompt,q.answer,q.explain,q.code].some(t => t.toLocaleLowerCase('es').includes(term))));
  }
  function renderStudy() {
    const list = filteredStudy();
    state.study.index = clamp(state.study.index, 0, Math.max(0,list.length-1));
    const q = list[state.study.index];
    root.innerHTML = `${pageHeader('APRENDE A EXPLICAR CADA LÍNEA','Modo estudio','Revisa el fragmento real, piensa tu respuesta y descubre por qué funciona así. Marca las preguntas que ya puedas defender sin ayuda.')}
      <div class="filterbar"><div class="field input-search"><label for="study-search">Buscar pregunta o instrucción</label><input id="study-search" class="input" type="search" placeholder="Ej. cabeza, while, null, Nodo..." value="${escapeHtml(state.study.search)}" /></div><div class="field field-select"><label for="study-topic">Tema</label><select id="study-topic" class="select">${selectTopicOptions(state.study.topic)}</select></div><div class="field field-select"><label for="study-level">Dificultad</label><select id="study-level" class="select"><option value="todos">Todas</option>${LEVELS.map(v => `<option ${state.study.level === v ? 'selected' : ''}>${v}</option>`).join('')}</select></div><div class="field" style="justify-content:end"><button class="btn btn-outline" data-action="study-reset">Limpiar</button></div></div>
      <div class="workspace"><div class="workspace-main">${q ? `<article class="card question-card"><div class="question-top"><div class="pill-row">${badges(q)}</div><span class="q-number">PREGUNTA ${q.id} / ${QUESTIONS.length}</span></div><h2>${escapeHtml(q.prompt)}</h2>${codeSnippet(q)}<div class="q-body">${state.study.showAnswer ? answerPanels(q) : `<div class="spotlight"><strong>Antes de mirar la respuesta:</strong> intenta explicarlo con tus palabras. Piensa qué hace la instrucción, por qué está ubicada ahí y qué cambiaría si la quitaras.</div>`}</div><div class="question-footer"><button class="btn ${state.study.showAnswer ? 'btn-outline' : 'btn-dark'}" data-action="study-answer">${state.study.showAnswer ? 'Ocultar respuesta' : 'Ver respuesta y explicación'} ${state.study.showAnswer ? '↑' : '↓'}</button><div class="question-footer-actions"><button class="btn ${state.mastered.has(q.id) ? 'btn-primary' : 'btn-outline'}" data-action="study-mastered">${state.mastered.has(q.id) ? '✓ Dominada' : '✓ Marcar dominada'}</button></div></div></article><div class="pagination"><button class="btn btn-outline" data-action="study-prev" ${state.study.index === 0 ? 'disabled' : ''}>← Anterior</button><span>${state.study.index+1} de ${list.length}</span><button class="btn btn-dark" data-action="study-next" ${state.study.index === list.length-1 ? 'disabled' : ''}>Siguiente →</button></div>` : `<div class="empty"><div class="empty-symbol">⌕</div><h3>No hay preguntas con esos filtros</h3><p>Prueba otro tema, otro nivel de dificultad o un término de búsqueda diferente.</p><button class="btn btn-outline" data-action="study-reset">Mostrar todas</button></div>`}</div>
      <aside class="workspace-side"><div class="card"><h3 class="side-heading">Tu avance</h3><p class="side-intro">Cada pregunta dominada queda marcada para la próxima sesión.</p><div style="font-size:28px;letter-spacing:-1px;font-weight:850">${state.mastered.size}<span style="font-size:15px;color:#9ba8b8;font-weight:500"> / 50</span></div><div class="progress-visual"><span style="width:${percent(state.mastered.size,50)}%"></span></div><div class="tiny-divider"></div><div class="mini-kpi"><span>Preguntas disponibles</span><strong>${list.length}</strong></div><div class="mini-kpi"><span>Dominadas en filtro</span><strong>${list.filter(x=>state.mastered.has(x.id)).length}</strong></div><div class="mini-kpi"><span>Dificultad actual</span><strong>${q ? escapeHtml(q.level) : '—'}</strong></div><div class="tiny-divider"></div><p class="side-intro">¿Listo para comprobar lo aprendido?</p><button class="btn btn-primary" style="width:100%" data-action="go" data-target="examen">Ir a examen →</button></div></aside></div>`;
  }
  function renderModeConfig(kind) {
    const oral = kind === 'oral';
    const conf = oral ? state.oralConfig : state.examConfig;
    const section = oral ? 'SUSTENTACIÓN FRENTE AL PROFESOR' : 'PON A PRUEBA TU CONOCIMIENTO';
    const title = oral ? 'Sustentación oral' : 'Modo examen';
    const subtitle = oral ? 'Responde por escrito o en voz alta antes de mostrar la respuesta modelo. Después evalúa si lograste explicar la instrucción.' : 'Responde preguntas aleatorias con cuatro opciones. Recibirás puntuación y explicación de cada respuesta al terminar.';
    const optionsCount = [5,10,20,50].filter(v => !(!oral && v===5));
    root.innerHTML = `${pageHeader(section,title,subtitle)}<div class="config-grid"><div class="card config-card"><div class="eyebrow">01 · CONFIGURAR</div><h2>Prepara tu práctica</h2><p>Elige la cantidad de preguntas que quieras resolver. Puedes repetir el ejercicio todas las veces que necesites.</p><div class="field" style="margin-top:22px"><label>¿Cuántas preguntas?</label><div class="config-buttons">${optionsCount.map(v => `<button class="choice-chip ${conf.count===v?'selected':''}" data-action="${kind}-count" data-value="${v}">${v} preguntas</button>`).join('')}</div></div><div class="field" style="margin-top:21px"><label for="${kind}-topic">Selecciona un tema</label><select id="${kind}-topic" class="select">${selectTopicOptions(conf.topic)}</select></div><div class="config-footer"><button class="btn btn-primary" data-action="${kind}-start">${oral ? 'Comenzar sustentación' : 'Comenzar examen'} →</button></div></div><div class="card config-card"><div class="eyebrow">02 · ASÍ FUNCIONA</div><h2>${oral?'Tu profesor virtual':'Una evaluación realista'}</h2><p>${oral?'Una pregunta a la vez. Puedes escribir tu explicación y escuchar la pregunta en voz alta si tu navegador lo permite.':'Sin pistas durante el examen. Las respuestas correctas aparecen únicamente después de entregar tu evaluación.'}</p><ul class="neutral-list">${(oral ? ['Responde sin ver la solución','Revela y compara con el código original','Márcala como bien explicada o por repasar','Consulta un resumen al terminar'] : ['Preguntas mezcladas en cada intento','Cuatro opciones por pregunta','Nota automática de 0 a 100 %','Revisión con explicaciones al finalizar']).map(x => `<li>${x}</li>`).join('')}</ul><div class="notice">Si eliges un tema específico con menos preguntas que la cantidad seleccionada, se incluirán todas las disponibles de ese tema.</div></div></div>`;
  }
  function startExam() {
    const pool = state.examConfig.topic === 'todos' ? QUESTIONS : QUESTIONS.filter(q=>q.topic===state.examConfig.topic);
    const questionOrder = shuffle(pool).slice(0, Math.min(state.examConfig.count,pool.length));
    state.exam = {items: questionOrder.map(q=>({id:q.id,order:shuffle([0,1,2,3])})),idx:0,responses:{},started:Date.now(),stage:'active',result:null};
    render();
  }
  function renderExamActive() {
    const ex = state.exam;
    const entry = ex.items[ex.idx], q = QUESTIONS.find(x=>x.id===entry.id);
    const count = Object.keys(ex.responses).length;
    const picked = ex.responses[q.id];
    root.innerHTML = `${pageHeader('EVALUACIÓN EN CURSO','Modo examen','Elige la mejor respuesta para cada pregunta. Puedes regresar y cambiarla antes de entregar.')}
      <div class="exam-meta"><div><span class="tag">Pregunta ${ex.idx+1} de ${ex.items.length}</span><span class="tag tag-secondary">${count} respondidas</span></div><button class="btn btn-outline btn-small" data-action="exam-abandon">Salir del examen</button></div><div class="exam-progress"><div style="width:${percent(count,ex.items.length)}%"></div></div>
      <article class="card question-card"><div class="question-top"><div class="pill-row">${badges(q)}</div><span class="q-number">PREGUNTA ${q.id} DEL PROYECTO</span></div><h2>${escapeHtml(q.prompt)}</h2>${codeSnippet(q)}<div class="options">${entry.order.map((orig,i)=> `<button type="button" class="option ${picked===orig?'selected':''}" data-action="exam-select" data-value="${orig}"><span class="option-key">${letters[i]}</span><span>${escapeHtml(q.options[orig])}</span></button>`).join('')}</div><div class="question-footer"><button class="btn btn-outline" data-action="exam-prev" ${ex.idx===0?'disabled':''}>← Anterior</button><div class="question-footer-actions">${ex.idx===ex.items.length-1? `<button class="btn btn-primary" data-action="exam-finish">Entregar examen ✓</button>` : `<button class="btn btn-dark" data-action="exam-next">Siguiente →</button>`}</div></div></article>
      <div class="question-dots" aria-label="Ir a una pregunta">${ex.items.map((x,i)=> `<button class="dot ${i===ex.idx?'current':''} ${Object.hasOwn(ex.responses,x.id)?'answered':''}" data-action="exam-jump" data-value="${i}" aria-label="Pregunta ${i+1}" title="Pregunta ${i+1}">${i+1}</button>`).join('')}</div>`;
  }
  function finishExam() {
    const ex = state.exam;
    const pending = ex.items.length-Object.keys(ex.responses).length;
    if (pending && !confirm(`Todavía tienes ${pending} pregunta(s) sin responder. Se contarán como incorrectas. ¿Entregar de todas formas?`)) return;
    const reviews= ex.items.map(item=> {const q = QUESTIONS.find(x=>x.id===item.id);const chosen=Object.hasOwn(ex.responses,item.id)?ex.responses[item.id]:null;return {id:item.id,chosen,key:q.key,ok:chosen===q.key,topic:q.topic};});
    const correct=reviews.filter(r=>r.ok).length;
    const byTopic=Object.fromEntries(TOPICS.map(t=>[t.id,{correct:reviews.filter(x=>x.topic===t.id&&x.ok).length,total:reviews.filter(x=>x.topic===t.id).length}]));
    const result={id:Date.now(),date:new Date().toISOString(),percent:percent(correct,ex.items.length),correct,total:ex.items.length,seconds:Math.floor((Date.now()-ex.started)/1000),byTopic,reviews};
    state.exams.push(result);saveData();ex.result=result;ex.stage='review';render();toast('¡Examen entregado! Revisa las explicaciones de cada pregunta.');
  }
  function renderExamReview() {
    const r=state.exam.result;
    root.innerHTML=`${pageHeader('EVALUACIÓN FINALIZADA','Tu resultado','Aquí tienes tu calificación y la explicación de cada pregunta. Los aciertos no marcan automáticamente una pregunta como dominada.')}
      <div class="result-hero"><div><div class="eyebrow" style="color:#90e9d0">${r.percent>=80?'¡MUY BUEN TRABAJO!':r.percent>=60?'¡SIGUE PRACTICANDO!':'HAY TEMAS POR REFORZAR'}</div><h2>${r.correct} respuestas correctas de ${r.total}</h2><p>Tiempo: ${fmtTime(r.seconds)} · ${formatDate(r.date)}</p></div><div class="result-score">${r.percent}<small>%</small></div></div>
      <div class="section-head"><div><h2>Revisión de respuestas</h2><p>Comprueba por qué cada opción era correcta o incorrecta.</p></div><button class="btn btn-outline" data-action="exam-again">Nuevo examen ↗</button></div>
      <div class="result-list">${r.reviews.map((x,i)=>{const q=QUESTIONS.find(v=>v.id===x.id);return `<details class="result-item" ${!x.ok?'open':''}><summary style="cursor:pointer;list-style:none"><div class="result-item-head"><div><span class="mini-note">${i+1}. ${escapeHtml(getTopic(q.topic)?.short)} · Pregunta ${q.id}</span><h3>${escapeHtml(q.prompt)}</h3></div><strong class="${x.ok?'correct':'wrong'}" style="font-size:12px;white-space:nowrap">${x.ok?'✓ Correcta':'✕ Revisar'}</strong></div></summary><p><strong>Tu respuesta:</strong> ${x.chosen===null?'Sin responder':escapeHtml(q.options[x.chosen])}</p><p><strong>Respuesta correcta:</strong> ${escapeHtml(q.options[x.key])}</p>${answerPanels(q)}<div style="margin-top:12px">${codeSnippet(q)}</div></details>`}).join('')}</div><div class="config-footer"><button class="btn btn-primary" data-action="go" data-target="resultados">Ver mis resultados</button><button class="btn btn-outline" data-action="exam-again">Practicar otra vez</button></div>`;
  }
  function startOral(){
    const pool=state.oralConfig.topic==='todos'?QUESTIONS:QUESTIONS.filter(q=>q.topic===state.oralConfig.topic);
    state.oral={items:shuffle(pool).slice(0,Math.min(state.oralConfig.count,pool.length)).map(q=>q.id),idx:0,responses:{},revealed:{},grades:{},started:Date.now(),stage:'active',result:null};render();
  }
  function renderOralActive(){
    const oral=state.oral,q=QUESTIONS.find(x=>x.id===oral.items[oral.idx]);
    const revealed=oral.revealed[q.id];
    root.innerHTML=`${pageHeader('PRACTICA COMO SI ESTUVIERAS EN CLASE','Sustentación oral','Responde primero sin consultar la explicación. Las respuestas abiertas no se califican automáticamente: tú decides si lograste explicarlas.')}
      <div class="exam-meta"><div><span class="tag">Pregunta ${oral.idx+1} de ${oral.items.length}</span><span class="tag tag-secondary">${Object.keys(oral.grades).length} evaluadas</span></div><button class="btn btn-outline btn-small" data-action="oral-abandon">Salir de la práctica</button></div><div class="exam-progress"><div style="width:${percent(Object.keys(oral.grades).length,oral.items.length)}%"></div></div>
      <article class="card question-card"><div class="question-top"><div class="pill-row">${badges(q)}</div><span class="q-number">PREGUNTA ORIGINAL ${q.id}</span></div><h2>${escapeHtml(q.prompt)}</h2>${codeSnippet(q)}<div class="oral-response"><label class="eyebrow" for="oral-text">TU RESPUESTA (OPCIONAL)</label><textarea id="oral-text" class="textarea" placeholder="Explica qué hace la instrucción, por qué se usa aquí y qué sucedería si la cambiaras...">${escapeHtml(oral.responses[q.id]||'')}</textarea></div><div class="oral-controls"><button class="btn btn-outline" data-action="oral-speak">♫ Leer pregunta</button><button class="btn ${revealed?'btn-outline':'btn-dark'}" data-action="oral-reveal">${revealed?'Ocultar modelo':'Ver respuesta del modelo'} ${revealed?'↑':'↓'}</button></div>${revealed?answerPanels(q):`<div class="spotlight" style="margin-top:17px"><strong>Piensa como en la sustentación:</strong> describe el propósito de la línea, su relación con los nodos y qué pasaría si se cambiara.</div>`}
      ${revealed?`<div class="oral-controls"><button class="btn ${oral.grades[q.id]==='bien'?'btn-primary':'btn-outline'}" data-action="oral-grade" data-value="bien">✓ Pude explicarla</button><button class="btn ${oral.grades[q.id]==='repasar'?'btn-dark':'btn-outline'}" data-action="oral-grade" data-value="repasar">↺ Necesito repasar</button></div>`:''}<div class="question-footer"><button class="btn btn-outline" data-action="oral-prev" ${oral.idx===0?'disabled':''}>← Anterior</button><button class="btn btn-dark" data-action="oral-next" ${oral.idx===oral.items.length-1?'disabled':''}>Siguiente →</button></div></article>
      <div class="question-dots">${oral.items.map((id,i)=> `<button class="dot ${i===oral.idx?'current':''} ${oral.grades[id]?'answered':''}" data-action="oral-jump" data-value="${i}" title="Pregunta ${i+1}">${i+1}</button>`).join('')}</div><div class="config-footer"><button class="btn btn-primary" data-action="oral-finish">Finalizar y ver resumen ✓</button><span class="note-inline">La autoevaluación queda guardada solo en este navegador.</span></div>`;
  }
  function finishOral(){
    const oral=state.oral;
    const pending=oral.items.length-Object.keys(oral.grades).length;
    if(pending && !confirm(`Hay ${pending} preguntas sin autoevaluar. ¿Finalizar de todas formas?`))return;
    const yes=Object.values(oral.grades).filter(v=>v==='bien').length;
    const r={id:Date.now(),date:new Date().toISOString(),total:oral.items.length,well:yes,review:Object.values(oral.grades).filter(v=>v==='repasar').length,ungraded:pending,seconds:Math.floor((Date.now()-oral.started)/1000),grades:oral.items.map(id=>({id,grade:oral.grades[id]||'sin evaluar'}))};
    state.oralHistory.push(r);saveData();oral.result=r;oral.stage='review';render();
  }
  function renderOralReview(){
    const r=state.oral.result;
    root.innerHTML=`${pageHeader('RESUMEN DE TU PRÁCTICA','Sustentación terminada','Esta puntuación es una autoevaluación, no una nota automática de comprensión oral.')}
      <div class="result-hero"><div><div class="eyebrow" style="color:#90e9d0">TU PRÁCTICA ORAL</div><h2>${r.well} preguntas bien explicadas</h2><p>De ${r.total} preguntas · ${r.review} por repasar · ${r.ungraded} sin evaluar</p></div><div class="result-score">${percent(r.well,r.total)}<small>%</small></div></div><div class="section-head"><div><h2>Para reforzar</h2><p>Repasa las que marcaste como difíciles y vuelve a intentarlo.</p></div></div><div class="result-list">${r.grades.filter(v=>v.grade!=='bien').map(v=>{const q=QUESTIONS.find(x=>x.id===v.id);return `<div class="result-item"><div class="result-item-head"><div><span class="mini-note">PREGUNTA ${q.id} · ${escapeHtml(getTopic(q.topic)?.short)}</span><h3>${escapeHtml(q.prompt)}</h3></div><span class="tag tag-amber">${v.grade==='repasar'?'Repasar':'Sin evaluar'}</span></div>${answerPanels(q)}</div>`}).join('') || '<div class="empty"><div class="empty-symbol">✓</div><h3>¡Todas las marcaste como bien explicadas!</h3><p>Prueba una sustentación con preguntas aleatorias diferentes.</p></div>'}</div><div class="config-footer"><button class="btn btn-primary" data-action="oral-again">Nueva práctica oral</button><button class="btn btn-outline" data-action="go" data-target="resultados">Ver historial</button></div>`;
  }
  function renderResults(){
    const examN=state.exams.length,oralN=state.oralHistory.length;
    const best=examN?Math.max(...state.exams.map(r=>r.percent)):null;
    const avg=examN?Math.round(state.exams.reduce((s,r)=>s+r.percent,0)/examN):null;
    const totals=Object.fromEntries(TOPICS.map(t=>[t.id,{correct:0,total:0}]));
    state.exams.forEach(r=>TOPICS.forEach(t=>{totals[t.id].correct+=r.byTopic?.[t.id]?.correct||0;totals[t.id].total+=r.byTopic?.[t.id]?.total||0;}));
    root.innerHTML=`${pageHeader('TU HISTORIAL PERSONAL','Mis resultados','Aquí puedes revisar lo que dominas, tu desempeño en exámenes y las prácticas de sustentación realizadas en este dispositivo.')}
      <div class="metric-grid"><div class="metric"><strong>${state.mastered.size}/50</strong><span>Preguntas dominadas</span></div><div class="metric"><strong>${examN}</strong><span>Exámenes realizados</span></div><div class="metric"><strong>${best===null?'—':best+'%'}</strong><span>Mejor calificación</span></div></div>
      <div class="split-2"><div class="card"><h3 class="side-heading">Rendimiento por tema</h3>${TOPICS.map(t=>{const r=totals[t.id],p=percent(r.correct,r.total);return `<div class="topic-result-row"><span>${escapeHtml(t.short)}</span><div class="bar-wrap"><div style="width:${p}%"></div></div><strong>${r.total?p+'%':'Sin datos'}</strong></div>`}).join('')}<p class="mini-note">Promedio de aciertos acumulados en tus exámenes, no en la práctica oral.</p></div><div class="card"><h3 class="side-heading">Resumen de práctica</h3><div class="mini-kpi"><span>Promedio de exámenes</span><strong>${avg===null?'—':avg+'%'}</strong></div><div class="mini-kpi"><span>Prácticas orales</span><strong>${oralN}</strong></div><div class="mini-kpi"><span>Preguntas por dominar</span><strong>${50-state.mastered.size}</strong></div><div class="tiny-divider"></div><p class="side-intro">Una calificación mide un intento. Dominar una pregunta significa que puedes explicar la instrucción sin leer la respuesta.</p><button class="btn btn-outline" data-action="go" data-target="estudio">Continuar estudiando →</button></div></div>
      <div class="section-head" style="margin-top:32px"><div><h2>Historial de exámenes</h2><p>Los intentos se guardan localmente en tu navegador.</p></div></div>${examN?`<div class="card" style="padding:5px 16px;overflow-x:auto"><table class="history-table"><thead><tr><th>Fecha</th><th>Resultado</th><th>Correctas</th><th>Duración</th></tr></thead><tbody>${state.exams.slice().reverse().map(r=>`<tr><td>${formatDate(r.date)}</td><td><strong class="${r.percent>=70?'correct':'wrong'}">${r.percent}%</strong></td><td>${r.correct} / ${r.total}</td><td>${fmtTime(r.seconds)}</td></tr>`).join('')}</tbody></table></div>`:`<div class="empty"><div class="empty-symbol">◉</div><h3>Todavía no has hecho un examen</h3><p>Realiza tu primera evaluación para que aparezcan tus resultados en esta sección.</p><button class="btn btn-primary" data-action="go" data-target="examen">Comenzar examen</button></div>`}
      <div class="section-head" style="margin-top:32px"><div><h2>Prácticas orales</h2><p>Autoevaluaciones de sustentación (no son notas verificadas).</p></div></div>${oralN?`<div class="card" style="padding:5px 16px;overflow-x:auto"><table class="history-table"><thead><tr><th>Fecha</th><th>Bien explicadas</th><th>Repasar</th><th>Sin evaluar</th></tr></thead><tbody>${state.oralHistory.slice().reverse().map(r=>`<tr><td>${formatDate(r.date)}</td><td>${r.well}/${r.total}</td><td>${r.review}</td><td>${r.ungraded}</td></tr>`).join('')}</tbody></table></div>`:`<div class="empty"><div class="empty-symbol">♬</div><h3>Sin prácticas orales todavía</h3><p>Practica tus respuestas como si el profesor te señalara una instrucción del código.</p><button class="btn btn-outline" data-action="go" data-target="oral">Empezar sustentación</button></div>`}
      <div class="callout"><strong>Privacidad:</strong> no se recopilan nombres ni se envían los resultados a un servidor. Para borrar los datos de estudio y evaluación de este navegador, usa el botón siguiente.</div><div style="margin-top:15px"><button class="btn btn-danger" data-action="reset-progress">Borrar mi progreso de este navegador</button></div>`;
  }
  function renderCode(){
    const name=state.source,source=SOURCES[name],lines=source.split('\n').length;
    root.innerHTML=`${pageHeader('CONOCE EL PROYECTO REAL','Código fuente','Consulta exactamente las clases originales que se utilizaron para preparar el cuestionario. Los archivos incluidos aquí no fueron modificados.')}
      <div class="card"><div class="tabs">${Object.keys(SOURCES).map(n=>`<button class="tab ${n===name?'active':''}" data-action="source-tab" data-value="${n}">${n}.java</button>`).join('')}</div><div class="source-meta"><p>${name}.java · ${lines} líneas · Código original</p><a class="btn btn-outline btn-small" href="fuentes/${name}.java" download>↓ Descargar archivo</a></div><pre class="code-box source-box"><code>${escapeHtml(source)}</code></pre></div>
      <div class="callout"><strong>¿Cómo estudiar esta sección?</strong> Abre una clase, identifica sus atributos, constructores y métodos y después regresa al cuestionario para explicar por qué se utiliza cada línea.</div><div class="config-footer"><button class="btn btn-primary" data-action="go" data-target="estudio">Ir a las preguntas →</button></div>`;
  }
  function render(){
    updateShell();
    if(state.page==='inicio')renderHome();
    if(state.page==='estudio')renderStudy();
    if(state.page==='examen'){if(!state.exam)renderModeConfig('exam');else if(state.exam.stage==='active')renderExamActive();else renderExamReview();}
    if(state.page==='oral'){if(!state.oral)renderModeConfig('oral');else if(state.oral.stage==='active')renderOralActive();else renderOralReview();}
    if(state.page==='resultados')renderResults();
    if(state.page==='codigo')renderCode();
  }
  function setPage(page){if(!SECTION_TITLES[page])return;state.page=page;history.replaceState(null,'',`#${page}`);render();window.scrollTo({top:0,behavior:'instant'});}
  async function sharePage(){
    if(location.protocol==='file:'){toast('Para compartir el enlace, primero publica la página en GitHub Pages.');return;}
    try{await navigator.clipboard.writeText(location.href);toast('¡Enlace copiado! Envíalo a tu grupo.');}
    catch{toast('Copia la dirección de la barra del navegador para compartirla.');}
  }
  document.querySelectorAll('[data-page]').forEach(btn=>btn.addEventListener('click',()=>setPage(btn.dataset.page)));
  $('#top-share').addEventListener('click',sharePage);
  root.addEventListener('click',event=>{
    const b=event.target.closest('[data-action]');if(!b||b.disabled)return;
    const a=b.dataset.action, val=b.dataset.value;
    if(a==='go'){setPage(b.dataset.target);return;}
    if(a==='study-answer'){state.study.showAnswer=!state.study.showAnswer;render();return;}
    if(a==='study-mastered'){const q=filteredStudy()[state.study.index];if(!q)return;state.mastered.has(q.id)?state.mastered.delete(q.id):state.mastered.add(q.id);saveData();render();toast(state.mastered.has(q.id)?'Pregunta marcada como dominada.':'Pregunta marcada para repasar.');return;}
    if(a==='study-prev'||a==='study-next'){state.study.index+=a==='study-prev'?-1:1;state.study.showAnswer=false;render();window.scrollTo({top:0,behavior:'smooth'});return;}
    if(a==='study-reset'){state.study={search:'',topic:'todos',level:'todos',index:0,showAnswer:false};render();return;}
    if(a==='exam-count'||a==='oral-count'){(a==='exam-count'?state.examConfig:state.oralConfig).count=Number(val);render();return;}
    if(a==='exam-start'){startExam();return;}
    if(a==='exam-select'){const qid=state.exam.items[state.exam.idx].id;state.exam.responses[qid]=Number(val);render();return;}
    if(a==='exam-prev'||a==='exam-next'){state.exam.idx=clamp(state.exam.idx+(a==='exam-next'?1:-1),0,state.exam.items.length-1);render();return;}
    if(a==='exam-jump'){state.exam.idx=Number(val);render();return;}
    if(a==='exam-finish'){finishExam();return;}
    if(a==='exam-abandon'){if(confirm('¿Salir de este examen? Las respuestas de este intento se perderán.')){state.exam=null;render();}return;}
    if(a==='exam-again'){state.exam=null;render();window.scrollTo(0,0);return;}
    if(a==='oral-start'){startOral();return;}
    if(a==='oral-reveal'){const id=state.oral.items[state.oral.idx];state.oral.revealed[id]=!state.oral.revealed[id];render();return;}
    if(a==='oral-grade'){const id=state.oral.items[state.oral.idx];state.oral.grades[id]=val;render();toast(val==='bien'?'Marcada como bien explicada.':'Marcada para repasar.');return;}
    if(a==='oral-prev'||a==='oral-next'){state.oral.idx=clamp(state.oral.idx+(a==='oral-next'?1:-1),0,state.oral.items.length-1);render();return;}
    if(a==='oral-jump'){state.oral.idx=Number(val);render();return;}
    if(a==='oral-finish'){finishOral();return;}
    if(a==='oral-abandon'){if(confirm('¿Salir de la práctica oral? Las respuestas de este intento se perderán.')){state.oral=null;render();}return;}
    if(a==='oral-again'){state.oral=null;render();return;}
    if(a==='oral-speak'){if(!('speechSynthesis'in window)){toast('La lectura en voz alta no está disponible en este navegador.');return;}speechSynthesis.cancel();const q=QUESTIONS.find(x=>x.id===state.oral.items[state.oral.idx]);const u=new SpeechSynthesisUtterance(q.prompt);u.lang='es-ES';u.rate=.9;speechSynthesis.speak(u);return;}
    if(a==='source-tab'){state.source=val;render();return;}
    if(a==='reset-progress'){if(confirm('¿Seguro que quieres borrar todas las preguntas dominadas, los exámenes y las prácticas orales guardadas en este navegador?')){state.mastered.clear();state.exams=[];state.oralHistory=[];saveData();render();toast('Se borró el progreso local.');}return;}
  });
  root.addEventListener('change',event=>{
    const el=event.target;
    if(el.id==='study-topic'){state.study.topic=el.value;state.study.index=0;state.study.showAnswer=false;render();}
    if(el.id==='study-level'){state.study.level=el.value;state.study.index=0;state.study.showAnswer=false;render();}
    if(el.id==='exam-topic'){state.examConfig.topic=el.value;render();}
    if(el.id==='oral-topic'){state.oralConfig.topic=el.value;render();}
  });
  root.addEventListener('input',event=>{
    const el=event.target;
    if(el.id==='study-search'){
      const caret=el.selectionStart;
      state.study.search=el.value;state.study.index=0;state.study.showAnswer=false;
      render(); const next=$('#study-search');if(next){next.focus();try{next.setSelectionRange(caret,caret)}catch{}}
    }
    if(el.id==='oral-text'&&state.oral){state.oral.responses[state.oral.items[state.oral.idx]]=el.value;}
  });
  document.addEventListener('keydown',event=>{
    if(state.page!=='estudio'||event.altKey||event.ctrlKey||event.metaKey||['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;
    const list=filteredStudy();if(event.key==='ArrowRight'&&state.study.index<list.length-1){state.study.index++;state.study.showAnswer=false;render();}
    if(event.key==='ArrowLeft'&&state.study.index>0){state.study.index--;state.study.showAnswer=false;render();}
  });
  window.addEventListener('hashchange',()=>{const p=location.hash.slice(1);if(SECTION_TITLES[p]){state.page=p;render();}});
  render();
})();
