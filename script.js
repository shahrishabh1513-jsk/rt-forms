/* ===== RT FORMS — local demo mode. Storage + API layer are swappable for a real backend. ===== */
const K = 'rtforms1', $ = s => document.querySelector(s), E = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let D = { forms: [], resp: {}, user: null, theme: '' }, F, A = 0, SET = 0, V = { nav: 'all', q: '', sort: 'mod', type: '', grid: 1 };
const S = {
    load() { try { Object.assign(D, JSON.parse(localStorage.getItem(K) || '{}')) } catch (e) { } },
    save() { try { localStorage.setItem(K, JSON.stringify(D)); const s = $('#st'); if (s) s.textContent = 'Saved ✓' } catch (e) { toast('Storage full or blocked — export your data.') } }
};
/* API layer: replace bodies with fetch() calls to Supabase/Firebase later (never hardcode secrets). */
const API = {
    BACKEND_URL: null, createForm(f) { D.forms.unshift(f); S.save(); return f }, getForm: id => D.forms.find(f => f.id === id && !f.trash),
    updateForm(f) { f.mod = Date.now(); S.save() }, publishForm(f) { f.status = 'published'; API.updateForm(f) },
    submitResponse(id, r) { (D.resp[id] = D.resp[id] || []).push(r); S.save() }, getResponses: id => D.resp[id] || [],
    deleteForm(id) { D.forms = D.forms.filter(f => f.id !== id); delete D.resp[id]; S.save() }
};
const uid = () => Math.random().toString(36).slice(2, 10), R = v => { $('#app').innerHTML = v }, toast = m => { const t = $('#ts'); t.textContent = m; t.style.display = 'block'; setTimeout(() => t.style.display = 'none', 2200) };
const T = { short: 'Short answer', para: 'Paragraph', mc: 'Multiple choice', cb: 'Checkboxes', dd: 'Dropdown', scale: 'Linear scale', rating: 'Rating', date: 'Date', time: 'Time', num: 'Number', email: 'Email', tel: 'Phone number', file: 'File upload (placeholder)', mgrid: 'Multiple choice grid', cgrid: 'Checkbox grid', section: 'Section heading', info: 'Info block' };
const mkq = ([t, q, o, a]) => ({ id: uid(), t, q: q || '', d: '', req: false, ph: '', opts: o || (['mc', 'cb', 'dd'].includes(t) ? ['Option 1', 'Option 2'] : []), other: false, rows: ['Row 1', 'Row 2'], cols: ['Column 1', 'Column 2'], min: 1, max: 5, lo: '', hi: '', pts: 1, ans: a || [], why: '' });
const newForm = (title, qs, quiz) => ({
    id: uid() + uid(), title, desc: '', color: '#B8E986', status: 'draft', quiz: !!quiz, pass: 0, showScore: true, showAns: true, start: '', end: '', star: false, trash: false, created: Date.now(), mod: Date.now(),
    set: { email: false, open: true, confirm: 'Your response has been recorded.', closed: 'This form is no longer accepting responses.', limit: 0, prog: true, shuf: false }, qs: qs.map(mkq)
});
const sc5 = ['Very poor', 'Poor', 'OK', 'Good', 'Excellent'];
const TP = [['Student Feedback Form', [['short', 'Name'], ['rating', 'Rate your overall experience'], ['para', 'What can we improve?']]], ['Teacher Evaluation Form', [['rating', 'Clarity of teaching'], ['rating', 'Availability for help'], ['para', 'Comments']]],
['Event Registration Form', [['short', 'Full name'], ['email', 'Email'], ['mc', 'Ticket type', ['General', 'VIP', 'Student']]]], ['Customer Feedback Form', [['mc', 'How satisfied are you?', sc5], ['para', 'Tell us more']]],
['Online Quiz', [['mc', 'What is 2 + 2?', ['3', '4', '5'], ['4']], ['cb', 'Select the prime numbers', ['2', '4', '5', '9'], ['2', '5']], ['dd', 'Capital of France?', ['Paris', 'Rome', 'Berlin'], ['Paris']]], 1],
['Student Attendance Survey', [['short', 'Student name'], ['mc', 'Attended today?', ['Yes', 'No']]]], ['Contact Form', [['short', 'Name', 0], ['email', 'Email'], ['para', 'Message']]], ['Job Application Form', [['short', 'Full name'], ['email', 'Email'], ['tel', 'Phone'], ['file', 'Résumé'], ['para', 'Why this role?']]],
['Course Evaluation Form', [['mgrid', 'Rate the course', 0], ['para', 'Suggestions']]], ['Website Feedback Form', [['scale', 'How easy was the site to use?'], ['para', 'Suggestions']]], ['Product Survey', [['cb', 'Features you use', ['Sharing', 'Reports', 'Quizzes']], ['rating', 'Overall rating']]], ['Bug Report Form', [['short', 'Bug title'], ['dd', 'Severity', ['Low', 'Medium', 'High']], ['para', 'Steps to reproduce']]]];
const useT = i => { if (!D.user) { location.hash = 'login'; return } const t = TP[i], f = newForm(t[0], t[1], t[2]); const g = f.qs.find(q => q.t == 'mgrid'); if (g) { g.rows = ['Content', 'Pace']; g.cols = ['Poor', 'Good', 'Great'] } API.createForm(f); location.hash = 'edit-' + f.id };
const logo = (s = 34) => `<svg width="${s}" height="${s}" viewBox="0 0 48 48" aria-hidden="true"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#258653"/><stop offset="1" stop-color="#17663D"/></linearGradient></defs><rect width="48" height="48" rx="14" fill="url(#g)"/><path d="M15 35V13h11a6 6 0 010 12H15m10 0l8 10" fill="none" stroke="#B8E986" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const brand = `<a class="brand" href="#home">${logo()}<b>RT FORMS</b></a>`, mode = '<span class="badge">Local demo mode</span>';
const dlg = h => { $('#dg').innerHTML = h; $('#dg').showModal() };
const ask = (m, v, cb) => { dlg(`<form method="dialog"><p>${m}</p>${v != null ? `<input id="av" aria-label="${E(m)}" value="${E(v)}">` : ''}<div class="r"><button class="btn s" value="x">Cancel</button><button class="btn" value="ok">OK</button></div></form>`); $('#dg form').onsubmit = e => { if (e.submitter.value == 'ok') cb(v != null ? $('#av').value : 1) } };
const info = t => dlg(`<h2>${t}</h2><p>RT FORMS is a demo build. Data stays in your browser and nothing is sent to a server.</p><form method="dialog"><button class="btn">Close</button></form>`);
const go = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
function box(name, text) { dlg(`<h2>${E(name)}</h2><textarea id="bx" rows="9" readonly>${E(text)}</textarea><div class="r"><button class="btn" onclick="$('#bx').select();try{navigator.clipboard.writeText($('#bx').value)}catch(e){document.execCommand('copy')}toast('Copied')">Copy</button><a class="btn s" download="${E(name)}" href="data:text/plain;charset=utf-8,${encodeURIComponent(text)}">Download</a><form method="dialog"><button class="btn s">Close</button></form></div><p class="note">If Download is blocked here, use Copy and paste into a file.</p>`) }

/* ===== Router (hash: home, login, register, dash, edit-ID, prev-ID, fill-ID, resp-ID, prefs) ===== */
function route() {
    const h = location.hash.slice(1) || 'home', i = h.indexOf('-'), p = i < 0 ? h : h.slice(0, i), id = i < 0 ? '' : h.slice(i + 1); scrollTo(0, 0);
    const M = { home, login: () => auth(0), register: () => auth(1), dash, edit: () => editor(id), prev: () => fill(id, 1), fill: () => fill(id, 0), resp: () => resp(id), prefs }; (M[p] || nf)()
}
function nf(p) { R(`<div class="wrap" style="text-align:center;padding:60px 0">${logo(60)}<h1>Form not found</h1><p>${p ? 'This form isn’t in this browser’s storage. In the local demo, links only work in the browser that created the form. Import its JSON export, or connect a backend for cross-device links.' : 'The page you’re looking for doesn’t exist.'}</p><a class="btn" href="#home">Back to home</a></div>`) }
const needUser = () => { if (!D.user) { location.hash = 'login'; return 1 } };

/* ===== Landing ===== */
function home() {
    R(`<div class="top">${brand}<span class="sp"></span><nav class="r" aria-label="Main"><a href="#home">Home</a><button class="btn s" onclick="go('feat')">Features</button><button class="btn s" onclick="go('tpl')">Templates</button><button class="btn s" onclick="go('about')">About</button><a class="btn s" href="#login">Login</a><a class="btn" href="#register">Get Started</a></nav></div>
<div class="wrap"><section class="hero"><div><span class="badge">Create. Share. Collect.</span><h1>Create Beautiful Forms in Minutes.</h1><p>Build forms, quizzes and surveys, share a link, and review every response with live analytics.</p><div class="r"><a class="btn" href="#register">Create Your First Form</a><button class="btn s" onclick="go('tpl')">Explore Templates</button></div></div>
<div class="mock" aria-hidden="true"><div class="card"><b>Student Feedback</b><i style="width:70%"></i><i></i></div><div class="card"><i style="width:50%"></i>◯ Great &nbsp; ◯ Good &nbsp; ◯ Fair</div></div></section>
<section id="feat"><h2>Everything you need</h2><div class="g">${[['Form Builder', '17 question types with validation.'], ['Quiz Maker', 'Auto-scoring, passing marks, explanations.'], ['Instant Sharing', 'Copy a link or use native share.'], ['Response Analytics', 'Charts, averages, CSV/JSON export.']].map(f => `<div class="card"><h3>${f[0]}</h3><p>${f[1]}</p></div>`).join('')}</div></section>
<section id="tpl"><h2>Popular templates</h2><div class="g">${TP.slice(0, 6).map((t, i) => `<div class="card"><h3>${t[0]}</h3><button class="btn s" onclick="useT(${i})">Use template</button></div>`).join('')}</div></section>
<section><h2>How it works</h2><div class="g">${['1. Build — add questions', '2. Share — publish and copy the link', '3. Collect — view responses and charts'].map(s => `<div class="card">${s}</div>`).join('')}</div></section>
<section id="about"><h2>About</h2><p>RT FORMS is an original form builder. This version runs fully in your browser; a shared backend is needed for links that work across devices.</p></section></div>
<footer class="wrap">${['About', 'Features', 'Privacy', 'Terms', 'Contact'].map(x => `<button onclick="info('${x}')">${x}</button>`).join(' · ')}<p>© RT FORMS</p></footer>`)
}

/* ===== Demo auth (NOT secure; passwords are never stored) ===== */
function auth(reg) {
    R(`<div class="wrap" style="max-width:420px;padding:30px 0">${brand}<div class="card" style="margin-top:16px"><h1>${reg ? 'Create account' : 'Log in'}</h1><p class="note">Demo authentication only — not real security. Production needs a secure backend with hashed passwords.</p>
<form id="af" novalidate>${reg ? '<label>Name<input id="an" autocomplete="name"></label>' : ''}<label>Email<input id="ae" type="email" autocomplete="email"></label><label>Password<input id="ap" type="password" autocomplete="${reg ? 'new' : 'current'}-password"></label>
<label class="o"><input type="checkbox" onchange="$('#ap').type=this.checked?'text':'password'"> Show password</label><div class="err" id="ar" role="alert"></div><div class="r"><button class="btn">${reg ? 'Register' : 'Log in'}</button><button type="button" class="btn s" onclick="D.user={name:'Demo User',email:'demo@rtforms.local'};S.save();location.hash='dash'">Use demo account</button></div></form>
<p><a href="#${reg ? 'login' : 'register'}">${reg ? 'Have an account? Log in' : 'New here? Register'}</a></p></div></div>`);
    $('#af').onsubmit = e => {
        e.preventDefault(); const em = $('#ae').value.trim(), pw = $('#ap').value, nm = reg ? $('#an').value.trim() : em.split('@')[0]; let m = '';
        if (reg && !nm) m = 'Enter your name.'; else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) m = 'Enter a valid email.'; else if (pw.length < 8) m = 'Password must be at least 8 characters.';
        $('#ar').textContent = m; if (!m) { D.user = { name: nm, email: em }; S.save(); location.hash = 'dash' }
    }
}

/* ===== Dashboard ===== */
function shell(body, on) {
    return `<div class="top">${brand}${mode}<span class="sp"></span><button class="btn s mb" onclick="$('.side').classList.toggle('open')" aria-label="Menu">☰ Menu</button><span>${E(D.user.name)}</span></div>
<div class="app"><nav class="side" aria-label="Sidebar">${[['all', 'Dashboard'], ['all2', 'My Forms'], ['star', 'Starred'], ['tpl', 'Templates'], ['trash', 'Trash']].map(n => `<button class="${on == n[0] ? 'on' : ''}" onclick="V.nav='${n[0] == 'all2' ? 'all' : n[0]}';$('.side').classList.remove('open');dash()">${n[1]}</button>`).join('')}<button onclick="location.hash='prefs'">Settings</button></nav><main class="main">${body}</main></div>`
}
function dash() {
    if (needUser()) return; const tp = V.nav == 'tpl' || V.nav == 'all';
    R(shell(`<h1>Welcome, ${E(D.user.name)} 👋</h1><div class="r noprint"><button class="btn" onclick="mk(0)">+ Create New Form</button><button class="btn s" onclick="mk(1)">+ New Quiz</button><button class="btn s" onclick="imp()">Import JSON</button></div>
${tp ? `<h2>Templates</h2><div class="g">${TP.map((t, i) => `<div class="card"><b>${t[0]}</b><br><button class="btn s" onclick="useT(${i})">Use</button></div>`).join('')}</div>` : ''}
${V.nav != 'tpl' ? `<h2>${V.nav == 'trash' ? 'Trash' : V.nav == 'star' ? 'Starred' : 'Recent forms'}</h2><div class="r"><input aria-label="Search forms" placeholder="Search forms" value="${E(V.q)}" oninput="V.q=this.value;list()" style="max-width:240px"><select aria-label="Sort" style="width:auto" onchange="V.sort=this.value;list()"><option value="mod">Recently modified</option><option value="title">Title</option><option value="resp">Response count</option></select><select aria-label="Filter" style="width:auto" onchange="V.type=this.value;list()"><option value="">All types</option><option value="form">Forms</option><option value="quiz">Quizzes</option></select><button class="btn s" onclick="V.grid=!V.grid;list()">Grid/List</button></div><div id="lst"></div>` : ''}`, V.nav)); if (V.nav != 'tpl') list()
}
function list() {
    let fs = D.forms.filter(f => V.nav == 'trash' ? f.trash : !f.trash && (V.nav != 'star' || f.star)).filter(f => f.title.toLowerCase().includes(V.q.toLowerCase()) && (!V.type || (V.type == 'quiz') == f.quiz));
    const rc = f => API.getResponses(f.id).length; fs.sort((a, b) => V.sort == 'title' ? a.title.localeCompare(b.title) : V.sort == 'resp' ? rc(b) - rc(a) : b.mod - a.mod);
    $('#lst').innerHTML = fs.length ? `<div class="${V.grid ? 'g' : 'rows'}">${fs.map(f => `<div class="card"><h3>${V.nav == 'trash' ? E(f.title) : `<a href="#edit-${f.id}">${E(f.title)}</a>`}</h3><small>${f.quiz ? 'Quiz' : 'Form'} · ${new Date(f.created).toLocaleDateString()} · ${f.status} · ${rc(f)} responses</small><div class="r">${V.nav == 'trash' ? `<button class="btn s" onclick="fa('${f.id}','res')">Restore</button><button class="btn s d" onclick="fa('${f.id}','del')">Delete forever</button>` : `<button class="btn s" aria-label="Star" onclick="fa('${f.id}','star')">${f.star ? '★' : '☆'}</button><button class="btn s" onclick="fa('${f.id}','ren')">Rename</button><button class="btn s" onclick="fa('${f.id}','dup')">Duplicate</button><button class="btn s d" onclick="fa('${f.id}','trash')">Delete</button>`}</div></div>`).join('')}</div>` : `<div class="card"><p>${D.forms.length ? 'No forms match here.' : 'No forms yet — create one or pick a template.'}</p></div>`
}
function fa(id, a) {
    const f = D.forms.find(x => x.id == id); const done = () => { S.save(); list() };
    if (a == 'star') { f.star = !f.star; done() } else if (a == 'res') { f.trash = false; done() } else if (a == 'dup') { const c = JSON.parse(JSON.stringify(f)); c.id = uid() + uid(); c.title += ' (copy)'; c.status = 'draft'; c.created = c.mod = Date.now(); D.forms.unshift(c); done() }
    else if (a == 'ren') ask('Rename form', f.title, v => { if (v.trim()) { f.title = v.trim(); f.mod = Date.now(); done() } });
    else if (a == 'trash') ask('Move “' + E(f.title) + '” to Trash?', null, () => { f.trash = true; done() }); else ask('Permanently delete this form and its responses?', null, () => { API.deleteForm(id); list() })
}
function mk(q) { const f = newForm(q ? 'Untitled quiz' : 'Untitled form', [q ? ['mc', 'Question', ['Option 1', 'Option 2'], ['Option 1']] : ['short', 'Question']], q); API.createForm(f); location.hash = 'edit-' + f.id }
function imp() { dlg(`<h2>Import form JSON</h2><textarea id="ij" rows="8" aria-label="JSON"></textarea><div class="r"><button class="btn" onclick="doImp()">Import</button><form method="dialog"><button class="btn s">Cancel</button></form></div>`) }
function doImp() { try { const f = JSON.parse($('#ij').value); if (!f || !Array.isArray(f.qs) || typeof f.title != 'string') throw 0; f.id = uid() + uid(); f.status = 'draft'; f.trash = false; f.created = f.mod = Date.now(); f.qs.forEach(q => q.id = uid()); D.forms.unshift(f); S.save(); $('#dg').close(); dash(); toast('Imported') } catch (e) { toast('Invalid form JSON') } }

/* ===== Form builder ===== */
function editor(id) { if (needUser()) return; F = D.forms.find(f => f.id == id); if (!F) return nf(); A = Math.min(A, F.qs.length - 1); ed() }
const touch = () => { F.mod = Date.now(); S.save() };
const U = (i, k, v, rd) => { F.qs[i][k] = v; touch(); rd && ed() }, UL = (i, k, v) => { F.qs[i][k] = v.split('\n').map(s => s.trim()).filter(Boolean); touch() }, SF = (p, v, rd) => { const [a, b] = p.split('.'); b ? F[a][b] = v : F[a] = v; touch(); rd && ed() };
function ed() {
    R(`<div class="top noprint" style="background:${F.color}">${brand}<input aria-label="Form title" style="max-width:280px;font-weight:700" value="${E(F.title)}" oninput="F.title=this.value;touch()"><span id="st" class="badge">Saved ✓</span><span class="sp"></span><a class="btn s" href="#dash">Dashboard</a><button class="btn s" onclick="SET=!SET;ed()">Settings</button><a class="btn s" href="#prev-${F.id}">Preview</a><a class="btn s" href="#resp-${F.id}">Responses</a><button class="btn s" onclick="box('${F.id}.json',JSON.stringify(F,null,2))">Export JSON</button><button class="btn" onclick="share()">Publish & Share</button></div>
<div class="wrap" style="padding-top:16px;max-width:760px">${SET ? setPanel() : ''}<div class="card"><h2>${E(F.title)}</h2><textarea aria-label="Form description" rows="2" placeholder="Form description" oninput="F.desc=this.value;touch()">${E(F.desc)}</textarea><label>Header color <input type="color" value="${F.color}" oninput="SF('color',this.value,1)"></label></div>
${F.qs.map((q, i) => `<section class="card q ${i == A ? 'act' : ''}" onclick="if(A!=${i}){A=${i};ed()}">${i == A ? qedit(q, i) : `<h3>${E(q.q || 'Untitled')}${q.req ? ' *' : ''}</h3><small>${T[q.t]}${F.quiz && q.ans.length ? ' · ' + q.pts + ' pt' : ''}</small>`}</section>`).join('')}
<div class="card r"><select id="nt" aria-label="Question type" style="width:auto">${Object.entries(T).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select><button class="btn" onclick="F.qs.splice(A+1,0,mkq([$('#nt').value]));A++;touch();ed()">+ Add question</button><button class="btn s" onclick="F.qs.splice(A+1,0,mkq(['section','New section']));A++;touch();ed()">+ Add section</button></div></div>`)
}
function qedit(q, i) {
    const o = ['mc', 'cb', 'dd'].includes(q.t), L = (k) => E(q[k].join('\n'));
    return `<input class="big" aria-label="Question" placeholder="Question" value="${E(q.q)}" oninput="U(${i},'q',this.value)"><select aria-label="Type" onchange="U(${i},'t',this.value,1)">${Object.entries(T).map(([k, v]) => `<option value="${k}" ${k == q.t ? 'selected' : ''}>${v}</option>`).join('')}</select>
<input aria-label="Description" placeholder="Description (optional)" value="${E(q.d)}" oninput="U(${i},'d',this.value)">
${o ? `<label>Options (one per line — order = display order)<textarea rows="4" oninput="UL(${i},'opts',this.value)">${L('opts')}</textarea></label>${q.t != 'dd' ? `<label class="o"><input type="checkbox" ${q.other ? 'checked' : ''} onchange="U(${i},'other',this.checked)"> Add “Other” option</label>` : ''}` : ''}
${q.t == 'mgrid' || q.t == 'cgrid' ? `<label>Rows<textarea rows="3" oninput="UL(${i},'rows',this.value)">${L('rows')}</textarea></label><label>Columns<textarea rows="3" oninput="UL(${i},'cols',this.value)">${L('cols')}</textarea></label><small>${q.t == 'mgrid' ? 'One selection per row.' : 'Multiple selections per row.'}</small>` : ''}
${q.t == 'scale' ? `<div class="r">Min <select style="width:auto" onchange="U(${i},'min',+this.value)">${[0, 1].map(n => `<option ${n == q.min ? 'selected' : ''}>${n}</option>`)}</select> Max <select style="width:auto" onchange="U(${i},'max',+this.value)">${[2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => `<option ${n == q.max ? 'selected' : ''}>${n}</option>`)}</select></div><input placeholder="Low label" value="${E(q.lo)}" oninput="U(${i},'lo',this.value)"><input placeholder="High label" value="${E(q.hi)}" oninput="U(${i},'hi',this.value)">` : ''}
${['short', 'para', 'num', 'email', 'tel'].includes(q.t) ? `<input placeholder="Placeholder text" value="${E(q.ph)}" oninput="U(${i},'ph',this.value)">` : ''}
${F.quiz && o ? `<label>Correct answer(s), one per line — must match options exactly<textarea rows="2" oninput="UL(${i},'ans',this.value)">${L('ans')}</textarea></label><label>Points <input type="number" min="0" style="width:90px" value="${q.pts}" oninput="U(${i},'pts',+this.value||0)"></label><input placeholder="Explanation (shown after submit)" value="${E(q.why)}" oninput="U(${i},'why',this.value)">` : ''}
<div class="r">${!['section', 'info'].includes(q.t) ? `<label class="o"><input type="checkbox" ${q.req ? 'checked' : ''} onchange="U(${i},'req',this.checked)"> Required</label>` : ''}<span class="sp"></span><button class="btn s" aria-label="Move up" onclick="mv(${i},-1)">↑</button><button class="btn s" aria-label="Move down" onclick="mv(${i},1)">↓</button><button class="btn s" onclick="dupq(${i})">Duplicate</button><button class="btn s d" onclick="delq(${i})">Delete</button></div>`
}
function mv(i, d) { const j = i + d; if (j < 0 || j >= F.qs.length) return;[F.qs[i], F.qs[j]] = [F.qs[j], F.qs[i]]; A = j; touch(); ed() }
function dupq(i) { const c = JSON.parse(JSON.stringify(F.qs[i])); c.id = uid(); F.qs.splice(i + 1, 0, c); A = i + 1; touch(); ed() }
function delq(i) { if (F.qs.length < 2) return toast('A form needs at least one item'); ask('Delete this question?', null, () => { F.qs.splice(i, 1); A = Math.max(0, i - 1); touch(); ed() }) }
const ck = (p, l, v) => `<label class="o"><input type="checkbox" ${v ? 'checked' : ''} onchange="SF('${p}',this.checked,${p == 'quiz' ? 1 : 0})"> ${l}</label><br>`;
function setPanel() {
    const s = F.set; return `<div class="card"><h2>Form settings</h2>${ck('set.open', 'Form is open to responses', s.open)}${ck('set.email', 'Collect email addresses', s.email)}${ck('set.prog', 'Show progress indicator', s.prog)}${ck('quiz', 'Quiz mode', F.quiz)}
${F.quiz ? ck('set.shuf', 'Shuffle questions', s.shuf) + ck('showScore', 'Show score after submit', F.showScore) + ck('showAns', 'Show correct answers & explanations', F.showAns) + `<label>Passing score (points)<input type="number" min="0" value="${F.pass}" oninput="SF('pass',+this.value||0)"></label>` : ''}
<label>Confirmation message<input value="${E(s.confirm)}" oninput="SF('set.confirm',this.value)"></label><label>Closing message<input value="${E(s.closed)}" oninput="SF('set.closed',this.value)"></label><label>Response limit (0 = none)<input type="number" min="0" value="${s.limit}" oninput="SF('set.limit',+this.value||0)"></label>
<div class="r"><label>Start date<input type="date" value="${F.start}" onchange="SF('start',this.value)"></label><label>End date<input type="date" value="${F.end}" onchange="SF('end',this.value)"></label></div>
<p class="note">Limits, dates and one-response-per-session checks run in the browser and are <b>not</b> secure enforcement; real limits need a server. Response editing and per-browser limits are best-effort only in this demo.</p></div>`}
function share() { API.publishForm(F); const u = location.href.split('#')[0] + '#fill-' + F.id; dlg(`<h2>Published ✓</h2><input readonly id="lk" aria-label="Form link" value="${E(u)}"><div class="r"><button class="btn" onclick="$('#lk').select();try{navigator.clipboard.writeText($('#lk').value)}catch(e){document.execCommand('copy')}toast('Link copied')">Copy link</button>${navigator.share ? `<button class="btn s" onclick="navigator.share({title:F.title,url:$('#lk').value})">Share…</button>` : ''}<a class="btn s" href="#prev-${F.id}" onclick="$('#dg').close()">Preview</a><a class="btn s" href="#fill-${F.id}" onclick="$('#dg').close()">Open public form</a></div><p class="note"><b>Local demo:</b> this link only works in this browser where the form is stored. For cross-device links, connect a shared backend (see Settings). QR codes need a library and are omitted here.</p><form method="dialog"><button class="btn s">Close</button></form>`); $('#st') && 0 }

/* ===== Renderer / validation / respondent page ===== */
const NA = ['section', 'info', 'file'];
function rq(q) {
    const n = 'a_' + q.id, L = `<label class="ql" ${['mc', 'cb', 'scale', 'rating', 'mgrid', 'cgrid'].includes(q.t) ? '' : `for="${n}"`}><b>${E(q.q)}</b>${q.req ? '<span class="rq" aria-hidden="true"> *</span>' : ''}</label>${q.d ? `<br><small>${E(q.d)}</small>` : ''}`; let x = '';
    const ty = { short: 'text', email: 'email', tel: 'tel', date: 'date', time: 'time', num: 'number' }[q.t], rg = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
    if (q.t == 'section') return `<div class="card"><h2>${E(q.q)}</h2><p>${E(q.d)}</p></div>`; if (q.t == 'info') return `<div class="card"><b>${E(q.q)}</b><p>${E(q.d)}</p></div>`;
    if (ty) x = `<input id="${n}" name="${n}" type="${ty}" ${q.t == 'num' ? 'step="any"' : ''} placeholder="${E(q.ph)}">`;
    else if (q.t == 'para') x = `<textarea id="${n}" name="${n}" rows="4" placeholder="${E(q.ph)}"></textarea>`;
    else if (q.t == 'dd') x = `<select id="${n}" name="${n}"><option value="">Choose…</option>${q.opts.map(o => `<option>${E(o)}</option>`).join('')}</select>`;
    else if (q.t == 'mc' || q.t == 'cb') { const t = q.t == 'mc' ? 'radio' : 'checkbox'; x = `<div role="group" aria-label="${E(q.q)}">${q.opts.map(o => `<label class="o"><input type="${t}" name="${n}" value="${E(o)}">${E(o)}</label>`).join('<br>')}${q.other ? `<br><label class="o"><input type="${t}" name="${n}" value="__o">Other:</label><input id="${n}_o" aria-label="Other" style="width:60%">` : ''}</div>` }
    else if (q.t == 'scale' || q.t == 'rating') { const a = q.t == 'rating' ? 1 : q.min, b = q.t == 'rating' ? q.max : q.max; x = `<div class="sc" role="group" aria-label="${E(q.q)}"><small>${E(q.lo)}</small>${rg(a, b).map(v => `<label class="o"><input type="radio" name="${n}" value="${v}">${q.t == 'rating' ? v + '★' : v}</label>`).join('')}<small>${E(q.hi)}</small></div>` }
    else if (q.t == 'mgrid' || q.t == 'cgrid') { const t = q.t == 'mgrid' ? 'radio' : 'checkbox'; x = `<div class="tw"><table><tr><th></th>${q.cols.map(c => `<th>${E(c)}</th>`).join('')}</tr>${q.rows.map((r, ri) => `<tr><td>${E(r)}</td>${q.cols.map(c => `<td><input type="${t}" name="${n}_${ri}" value="${E(c)}" aria-label="${E(r)}: ${E(c)}"></td>`).join('')}</tr>`).join('')}</table></div>` }
    else if (q.t == 'file') x = `<input type="file" disabled><small>File upload needs server storage, which isn’t available in local demo mode.</small>`;
    return `<div class="card fq">${L}<div>${x}</div><div class="err" id="e_${q.id}" role="alert"></div></div>`
}
function get(q) {
    const n = 'a_' + q.id, f = $('#fm'), all = s => [...f.querySelectorAll(s)];
    if (['mc', 'cb', 'scale', 'rating'].includes(q.t)) { const v = all(`[name="${n}"]:checked`).map(e => e.value == '__o' ? 'Other: ' + ($('#' + n + '_o').value || '').trim() : e.value); return q.t == 'cb' ? v : v[0] || '' }
    if (q.t == 'mgrid' || q.t == 'cgrid') { const o = []; q.rows.forEach((r, ri) => all(`[name="${n}_${ri}"]:checked`).forEach(e => o.push(r + ': ' + e.value))); return o }
    const e = f.querySelector(`[name="${n}"]`); return e ? e.value.trim() : ''
}
function chk(q, v) {
    const e = Array.isArray(v) ? !v.length : v === ''; if (q.req && e) return 'This question is required.';
    if (q.t == 'mgrid' && q.req && v.length < q.rows.length) return 'Please answer every row.'; if (e) return '';
    if (q.t == 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) return 'Enter a valid email address.'; if (q.t == 'tel' && !/^\+?[\d\s()-]{7,15}$/.test(v)) return 'Enter a valid phone number.'; if (q.t == 'num' && isNaN(+v)) return 'Enter a valid number.'; return ''
}
function score(f, a) { let s = 0, m = 0, man = 0; f.qs.forEach(q => { if (['section', 'info'].includes(q.t)) return; if (!['mc', 'cb', 'dd'].includes(q.t) || !q.ans.length) { man++; return } m += q.pts; const v = a[q.id]; if (q.t == 'cb' ? Array.isArray(v) && v.length == q.ans.length && q.ans.every(x => v.includes(x)) : v === q.ans[0]) s += q.pts }); return { s, m, man } }
function fill(id, pv) {
    F = API.getForm(id); if (!F) return nf(1); const s = F.set, n = API.getResponses(id).length; let msg = '';
    if (!pv) {
        try { if (sessionStorage.getItem('done_' + id)) msg = 'You’ve already responded in this browser session.' } catch (e) { }
        if (!msg && (F.status != 'published' || !s.open)) msg = s.closed; else if (!msg && F.start && Date.now() < new Date(F.start)) msg = 'This form isn’t open yet.'; else if (!msg && F.end && Date.now() > new Date(F.end).getTime() + 864e5) msg = s.closed; else if (!msg && s.limit && n >= s.limit) msg = s.closed
    }
    const qs = F.quiz && s.shuf && !pv ? [...F.qs].sort(() => Math.random() - .5) : F.qs;
    R(`<div class="wrap" style="max-width:720px;padding:16px 0">${pv ? `<div class="card noprint"><b>Preview mode</b> — responses aren’t saved. <a href="#edit-${F.id}">Back to editor</a></div>` : ''}<div class="hd" style="background:${F.color}"><h1>${E(F.title)}</h1><p>${E(F.desc)}</p></div>
${msg ? `<div class="card"><p>${E(msg)}</p></div>` : `${s.prog ? '<div class="pg" role="progressbar" aria-label="Progress"><span id="pb"></span></div>' : ''}<form id="fm" novalidate oninput="prog()">${s.email ? `<div class="card"><label><b>Email <span class="rq">*</span></b><input name="_em" type="email" autocomplete="email"></label><div class="err" id="e__em" role="alert"></div></div>` : ''}${qs.map(rq).join('')}<button class="btn">Submit</button></form>`}<footer>${brand}</footer></div>`);
    if (!msg) { $('#fm').onsubmit = e => { e.preventDefault(); sub(pv) }; prog() }
}
function prog() { const b = $('#pb'); if (!b) return; const qs = F.qs.filter(q => !NA.includes(q.t)), d = qs.filter(q => { const v = get(q); return Array.isArray(v) ? v.length : v !== '' }).length; b.style.width = (qs.length ? 100 * d / qs.length : 0) + '%' }
function sub(pv) {
    let bad = null, a = {}, em = ''; document.querySelectorAll('.err').forEach(e => e.textContent = '');
    if (F.set.email) { em = $('#fm [name=_em]').value.trim(); if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { $('#e__em').textContent = 'Enter a valid email address.'; bad = bad || $('#fm [name=_em]') } }
    F.qs.forEach(q => { if (NA.includes(q.t)) return; const v = get(q), m = chk(q, v); a[q.id] = v; if (m) { $('#e_' + q.id).textContent = m; bad = bad || $('#fm').querySelector(`[name^="a_${q.id}"]`) } });
    if (bad) { bad.focus(); return } const sc = F.quiz ? score(F, a) : null, r = { id: uid(), at: Date.now(), email: em, a, sc };
    if (!pv) { API.submitResponse(F.id, r); try { sessionStorage.setItem('done_' + F.id, 1) } catch (e) { } }
    let h = `<div class="card"><h2>Thank you!</h2><p>${E(F.set.confirm)}</p>${pv ? '<p class="note">Preview — nothing was saved.</p>' : ''}`;
    if (sc && F.showScore) h += `<p><b>Score: ${sc.s} / ${sc.m}</b> ${F.pass ? (sc.s >= F.pass ? '— Passed ✓' : '— Not passed') : ''}${sc.man ? `<br><small>${sc.man} question(s) need manual review.</small>` : ''}</p>`;
    if (sc && F.showAns) h += F.qs.filter(q => q.ans.length).map(q => `<p><b>${E(q.q)}</b><br>Correct: ${E(q.ans.join(', '))}${q.why ? `<br><small>${E(q.why)}</small>` : ''}</p>`).join('');
    $('#fm').outerHTML = h + '</div>'; $('.pg') && ($('.pg').style.display = 'none'); scrollTo(0, 0)
}

/* ===== Responses & analytics ===== */
const fmt = v => Array.isArray(v) ? v.join('; ') : v ?? '';
const cell = v => '"' + String(fmt(v)).replace(/"/g, '""') + '"';
function resp(id) {
    if (needUser()) return; F = D.forms.find(f => f.id == id); if (!F) return nf(); const rs = API.getResponses(id), qs = F.qs.filter(q => !NA.includes(q.t));
    const an = qs.map(q => {
        let opts = ['mc', 'cb', 'dd'].includes(q.t) ? q.opts : q.t == 'rating' ? [1, 2, 3, 4, 5].slice(0, q.max) : q.t == 'scale' ? Array.from({ length: q.max - q.min + 1 }, (_, i) => q.min + i) : null; if (!opts) return '';
        const c = opts.map(o => rs.filter(r => { const v = r.a[q.id]; return Array.isArray(v) ? v.includes(String(o)) : v == String(o) }).length), t = Math.max(1, rs.length), nums = ['rating', 'scale'].includes(q.t) ? rs.map(r => +r.a[q.id]).filter(x => x) : [];
        return `<div class="card"><b>${E(q.q)}</b>${nums.length ? `<br><small>Average: ${(nums.reduce((x, y) => x + y, 0) / nums.length).toFixed(2)}</small>` : ''}${opts.map((o, i) => `<div>${E(o)} — ${c[i]}<div class="b2"><span style="width:${100 * c[i] / t}%"></span></div></div>`).join('')}</div>`
    }).join('');
    const days = {}; rs.forEach(r => { const d = new Date(r.at).toLocaleDateString(); days[d] = (days[d] || 0) + 1 }); const sc = rs.filter(r => r.sc), dist = {}; sc.forEach(r => dist[r.sc.s] = (dist[r.sc.s] || 0) + 1);
    R(`<div class="top noprint">${brand}<span class="sp"></span><a class="btn s" href="#edit-${F.id}">Editor</a><a class="btn s" href="#dash">Dashboard</a></div><div class="wrap" style="padding-top:16px"><h1>${E(F.title)} — Responses</h1>
<div class="g"><div class="card"><h2>${rs.length}</h2>Total responses</div>${sc.length ? `<div class="card"><h2>${(sc.reduce((x, r) => x + r.sc.s, 0) / sc.length).toFixed(1)} / ${sc[0].sc.m}</h2>Average quiz score</div>` : ''}</div>
<div class="r noprint"><button class="btn" onclick="expCSV()">Export CSV</button><button class="btn s" onclick="box('responses.json',JSON.stringify(API.getResponses(F.id),null,2))">Export JSON</button><button class="btn s" onclick="print()">Print report</button></div>
<h2>Summary</h2>${rs.length ? an : '<div class="card">No responses yet.</div>'}
${Object.keys(days).length > 1 ? `<div class="card"><b>Responses per day</b>${Object.entries(days).map(([d, n]) => `<div>${d} — ${n}<div class="b2"><span style="width:${100 * n / rs.length}%"></span></div></div>`).join('')}</div>` : ''}
${sc.length ? `<div class="card"><b>Score distribution</b>${Object.entries(dist).sort((a, b) => a[0] - b[0]).map(([k, n]) => `<div>${k} pts — ${n}<div class="b2"><span style="width:${100 * n / sc.length}%"></span></div></div>`).join('')}</div>` : ''}
<h2>Individual responses</h2><input class="noprint" aria-label="Search responses" placeholder="Search responses" oninput="rl(this.value)"><div id="rl"></div></div>`); rl('')
}
function rl(t) {
    t = t.toLowerCase(); const qs = F.qs.filter(q => !NA.includes(q.t)); const rs = API.getResponses(F.id).filter(r => JSON.stringify(r).toLowerCase().includes(t)).reverse();
    $('#rl').innerHTML = rs.length ? rs.map(r => `<details class="card"><summary>${new Date(r.at).toLocaleString()} ${E(r.email)} ${r.sc ? `· ${r.sc.s}/${r.sc.m}` : ''}</summary>${qs.map(q => `<p><b>${E(q.q)}</b><br>${E(fmt(r.a[q.id])) || '<small>(no answer)</small>'}</p>`).join('')}<button class="btn s d noprint" onclick="delr('${r.id}')">Delete response</button></details>`).join('') : '<p>No matching responses.</p>'
}
function delr(rid) { ask('Delete this response?', null, () => { D.resp[F.id] = API.getResponses(F.id).filter(r => r.id != rid); S.save(); resp(F.id) }) }
function expCSV() { const qs = F.qs.filter(q => !NA.includes(q.t)), rows = [['Timestamp', 'Email', 'Score', ...qs.map(q => q.q)], ...API.getResponses(F.id).map(r => [new Date(r.at).toISOString(), r.email, r.sc ? r.sc.s + '/' + r.sc.m : '', ...qs.map(q => r.a[q.id])])]; box('responses.csv', rows.map(r => r.map(cell).join(',')).join('\r\n')) }

/* ===== Settings ===== */
function prefs() {
    if (needUser()) return; R(shell(`<h1>Settings</h1><div class="card"><h2>Profile</h2><label>Name<input value="${E(D.user.name)}" onchange="D.user.name=this.value;S.save();toast('Saved')"></label><p>${E(D.user.email)}</p>
<div class="r"><button class="btn" onclick="D.user=null;S.save();location.hash='home'">Log out</button><button class="btn s d" onclick="ask('Erase ALL local forms and responses?',null,()=>{D.forms=[];D.resp={};S.save();toast('Erased')})">Erase local data</button></div></div>
<div class="card"><h2>Local demo vs. real backend</h2><p>Everything is stored in this browser (localStorage). Links, responses and accounts are <b>not</b> shared across devices. For production, connect Supabase or Firebase through the <code>API</code> object in this file: secure auth, a shared database, public form reads, owner-only response reads (row-level security), server-side validation and rate limiting. Never put secret keys in frontend code.</p></div>`, 'x'))
}
S.load(); addEventListener('hashchange', route); route();