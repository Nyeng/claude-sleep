  // ============================================================
  // CONFIG
  // ============================================================
  const SUPABASE_URL  = 'https://xdbveygpgzrxpowomdqi.supabase.co';
  const SUPABASE_ANON = 'sb_publishable_vGsYHC4BkhPx1ofIySftjg_QXRUtnGX';

  // ============================================================
  // CLIENT
  // ============================================================
  const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON, {
    auth: { flowType: 'implicit', detectSessionInUrl: true, persistSession: true }
  });

  // ============================================================
  // STATE
  // ============================================================
  let user           = null;
  let children       = [];
  let currentChild   = null;
  let lang           = localStorage.getItem('sovn-lang') || 'no';
  let currentTab          = 'new';
  let entries             = [];
  let currentChartMetric  = 'q10';
  let currentChartPeriod  = 14;
  const expandedEntries   = new Set();

  function isSelf() { return !!(currentChild && currentChild.is_self); }
  function getChildName() {
    if (isSelf()) return lang === 'no' ? 'du' : 'you';
    return currentChild?.name || (lang === 'no' ? 'barnet' : 'the child');
  }

  // ============================================================
  // TRANSLATIONS
  // ============================================================
  const T = {
    no: {
      appTitle:'Søvndagbok',authTitle:'Søvndagbok',signInGoogle:'Logg inn med Google',langSwitch:'EN',
      authOr:'eller',emailPlaceholder:'E-postadresse',sendMagicLink:'Send innloggingslenke',
      magicSent:'Sjekk e-posten din',magicSentSub:'Vi har sendt deg en innloggingslenke. Sjekk søppelpost om den ikke dukker opp.',
      magicBack:'← Prøv igjen',magicEmailRequired:'Skriv inn e-postadressen din.',magicError:'Noe gikk galt. Prøv igjen.',
      tabNew:'Ny registrering',tabHistory:'Historikk',tabSettings:'Innstillinger',
      labelDate:'Dato',sectionBefore:(s)=>s?'Fyll ut om kvelden':'Fylles ut før leggetid',sectionMorning:(s)=>s?'Fyll ut om morgenen':'Fylles ut om morgenen',
      q1:(n,s)=>s?'Hvordan har du fungert på dagtid?':`Hvordan har ${n} fungert på dagtid?`,
      q1Scale:['1 – Svært dårlig','2 – Dårlig','3 – Middels','4 – Bra','5 – Svært bra'],
      q2:(n,s)=>s?'Har du sovet på dagtid?':`Har ${n} sovet på dagtid?`,
      q2NapTimes:'Oppgi tidspunkt og varighet',
      q3:(n,s)=>s?'Medikament (valgfritt)':`Medikament gitt til ${n} (valgfritt)`,
      q4:(n,s)=>s?'Når la du deg?':`Når la du ${n}?`,
      labelInBed:'La seg',labelSleepAttempt:'Prøvde å sove',
      q5:(n,s)=>s?'Hvor lang tid brukte du på å sovne?':`Hvor lang tid brukte ${n} på å sovne?`,
      minutes:'minutter',
      q6:(n,s)=>s?'Hvor mange ganger våknet du i løpet av natten?':`Hvor mange ganger våknet ${n} i løpet av natten?`,
      q7:(n,s)=>s?'Hvor lenge var du våken totalt ved nattlige oppvåkninger?':`Hvor lenge var ${n} våken totalt ved nattlige oppvåkninger?`,
      q8:(n,s)=>s?'Når våknet du endelig om morgenen?':`Når våknet ${n} endelig om morgenen?`,
      q9:(n,s)=>s?'Når stod du opp?':`Når stod ${n} opp?`,
      q10:(n,s)=>s?'Hvordan vurderer du din søvnkvalitet?':`Hvordan vurderer du søvnkvaliteten til ${n}?`,
      q10Scale:['1 – Svært lett','2 – Lett','3 – Middels','4 – Dyp','5 – Svært dyp'],
      yes:'Ja',no_:'Nei',saveEntry:'Lagre registrering',entrySaved:'Registrering lagret.',
      accountLabel:'Konto',signOut:'Logg ut',editBtn:'Rediger',deleteBtn:'Slett',
      historyEmpty:'Ingen registreringer enda.',fallbackChild:'barnet',confirmDelete:'Slett denne registreringen?',
      fieldNap:'Dagsøvn',fieldNapTimes:'Tidspunkt dagsøvn',fieldMed:'Medikament',
      fieldInBed:'La seg',fieldSleepAttempt:'Prøvde å sove',fieldOnset:'Innsovningstid',
      fieldAwakenings:'Oppvåkninger',fieldWakeTime:'Våken tid natt',fieldFinalWake:'Siste oppvåkning',
      fieldGotUp:'Stod opp',fieldQ1:'Dagtidsfungering',fieldQ10:'Søvnkvalitet',minutesSuffix:' min',
      createChild:'Legg til barn',joinChild:'Bli med via kode',childNamePlaceholder:'Navn på barnet',
      codePlaceholder:'XXXXXX',createBtn:'Legg til',joinBtn:'Bli med',
      shareCodeLabel:'Delingskode',shareCodeHint:'Del denne koden med den andre foresatte',
      shareCodeHintSelf:'Del koden med legen eller noen du vil gi tilgang',copyCode:'Kopier',
      addChildBtn:'+ Legg til person',thisChild:'Dette barnet',thisChildSelf:'Deg selv',
      backLink:'← Tilbake',switchChild:'Bytt',signOutSmall:'Logg ut',childrenSection:'Personer',
      typeMyself:'Meg selv',typeChild:'Barn',setAsSelf:'Marker som meg selv',setAsChild:'Marker som barn',
      removeAccess:'Fjern',removeConfirm:(name)=>`Fjerne "${name}" fra listen din? Du mister tilgang til dagboken, men registreringene beholdes.`,removeError:'Kunne ikke fjerne. Prøv igjen.',
      removeMemberConfirm:(name)=>`Fjerne ${name} sin tilgang? De vil ikke lenger kunne se eller registrere søvn for dette barnet.`,removeMemberError:'Kunne ikke fjerne tilgangen. Prøv igjen.',membersLabel:'Foresatte med tilgang',
      createSelf:'Registrer min søvn',createSelfDesc:'Logg din egen søvn – for deg selv',
      createSelfBtn:'Legg til meg selv',orChild:'eller legg til barn',myselfLabel:'Meg selv',
      chartTitle:'Utvikling',chartPeriod14:'2 uker',chartPeriod28:'4 uker',chartPeriodAll:'Alt',
      chartMetricQ10:'Søvnkvalitet',chartMetricOnset:'Innsovning',chartMetricAwakenings:'Oppvåkninger',chartMetricQ1:'Dagtid',
      chartAvg:'Snitt',chartTrend:'Trend',chartRange:'Spenn',chartNoData:'Ikke nok data enda',chartUnit_min:' min',
    },
    en: {
      appTitle:'Sleep Diary',authTitle:'Sleep Diary',signInGoogle:'Sign in with Google',langSwitch:'NO',
      authOr:'or',emailPlaceholder:'Email address',sendMagicLink:'Send magic link',
      magicSent:'Check your inbox',magicSentSub:'We sent you a sign-in link. Check your spam folder if it doesn\'t arrive.',
      magicBack:'← Try again',magicEmailRequired:'Please enter your email address.',magicError:'Something went wrong. Please try again.',
      tabNew:'New entry',tabHistory:'History',tabSettings:'Settings',
      labelDate:'Date',sectionBefore:(s)=>s?'Fill out in the evening':'Fill out before bedtime',sectionMorning:(s)=>s?'Fill out in the morning':'Fill out in the morning',
      q1:(n,s)=>s?'How did you function during the day?':`How did ${n} function during the day?`,
      q1Scale:['1 – Very poor','2 – Poor','3 – Moderate','4 – Good','5 – Very good'],
      q2:(n,s)=>s?'Did you nap during the day?':`Did ${n} nap during the day?`,
      q2NapTimes:'Enter times and duration',
      q3:(n,s)=>s?'Medication (optional)':`Medication given to ${n} (optional)`,
      q4:(n,s)=>s?'When did you go to bed?':`When did you put ${n} to bed?`,
      labelInBed:'In bed',labelSleepAttempt:'Tried to sleep',
      q5:(n,s)=>s?'How long did it take you to fall asleep?':`How long did it take ${n} to fall asleep?`,
      minutes:'minutes',
      q6:(n,s)=>s?'How many times did you wake up during the night?':`How many times did ${n} wake up during the night?`,
      q7:(n,s)=>s?'How long were you awake in total during nighttime awakenings?':`How long was ${n} awake in total during nighttime awakenings?`,
      q8:(n,s)=>s?'When did you wake up for good in the morning?':`When did ${n} wake up for good in the morning?`,
      q9:(n,s)=>s?'When did you get up?':`When did ${n} get up?`,
      q10:(n,s)=>s?'How do you rate your sleep quality?':`How do you rate ${n}'s sleep quality?`,
      q10Scale:['1 – Very light','2 – Light','3 – Moderate','4 – Deep','5 – Very deep'],
      yes:'Yes',no_:'No',saveEntry:'Save entry',entrySaved:'Entry saved.',
      accountLabel:'Account',signOut:'Sign out',editBtn:'Edit',deleteBtn:'Delete',
      historyEmpty:'No entries yet.',fallbackChild:'your child',confirmDelete:'Delete this entry?',
      fieldNap:'Nap',fieldNapTimes:'Nap times',fieldMed:'Medication',
      fieldInBed:'In bed',fieldSleepAttempt:'Tried to sleep',fieldOnset:'Sleep onset',
      fieldAwakenings:'Awakenings',fieldWakeTime:'Awake time (night)',fieldFinalWake:'Final awakening',
      fieldGotUp:'Got up',fieldQ1:'Daytime functioning',fieldQ10:'Sleep quality',minutesSuffix:' min',
      createChild:'Add a child',joinChild:'Join with code',childNamePlaceholder:"Child's name",
      codePlaceholder:'XXXXXX',createBtn:'Add',joinBtn:'Join',
      shareCodeLabel:'Share code',shareCodeHint:'Share this code with the other parent',
      shareCodeHintSelf:'Share with your doctor or someone you want to give access',copyCode:'Copy',
      addChildBtn:'+ Add person',thisChild:'This child',thisChildSelf:'Yourself',
      backLink:'← Back',switchChild:'Switch',signOutSmall:'Sign out',childrenSection:'People',
      typeMyself:'Myself',typeChild:'Child',setAsSelf:'Mark as myself',setAsChild:'Mark as child',
      removeAccess:'Remove',removeConfirm:(name)=>`Remove "${name}" from your list? You'll lose access to the diary, but entries are kept.`,removeError:'Could not remove. Please try again.',
      removeMemberConfirm:(name)=>`Remove ${name}'s access? They will no longer be able to view or log sleep for this child.`,removeMemberError:'Could not remove access. Please try again.',membersLabel:'People with access',
      createSelf:'Track my own sleep',createSelfDesc:'Log your own sleep — for yourself',
      createSelfBtn:'Add myself',orChild:'or add a child',myselfLabel:'Myself',
      chartTitle:'Trends',chartPeriod14:'2 weeks',chartPeriod28:'4 weeks',chartPeriodAll:'All',
      chartMetricQ10:'Sleep quality',chartMetricOnset:'Onset',chartMetricAwakenings:'Awakenings',chartMetricQ1:'Daytime',
      chartAvg:'Avg',chartTrend:'Trend',chartRange:'Range',chartNoData:'Not enough data yet',chartUnit_min:' min',
    }
  };
  function t() { return T[lang]; }

  // ============================================================
  // INIT
  // ============================================================
  document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await sb.auth.getSession();
    if (session) { user = session.user; await bootstrap(); }
    else { showScreen('auth'); renderLang(); }

    sb.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) { user = session.user; await bootstrap(); }
      else if (event === 'SIGNED_OUT') {
        user = null; children = []; currentChild = null; entries = [];
        showScreen('auth'); renderLang();
      }
    });
  });

  function cacheKey(suffix) { return `sovn-cache-${suffix}`; }
  function readCache(key) { try { return JSON.parse(localStorage.getItem(cacheKey(key))); } catch { return null; } }
  function writeCache(key, val) { try { localStorage.setItem(cacheKey(key), JSON.stringify(val)); } catch {} }

  async function bootstrap() {
    // Show cached data immediately for instant LCP
    const cachedChildren = readCache('children');
    const lastId = localStorage.getItem('sovn-last-child');
    if (cachedChildren?.length) {
      children = cachedChildren;
      currentChild = children.find(c => c.id === lastId) || children[0];
      const cachedEntries = readCache(`entries-${currentChild.id}`);
      if (cachedEntries) {
        entries = cachedEntries;
        setTodayDate(); renderLang(); renderUserAvatar();
        showScreen('app'); renderPersonSwitcher(); switchTab('new');
      }
    }

    // Fetch fresh data in background (or foreground if no cache)
    try { children = await loadChildren(); }
    catch (err) {
      const el = document.getElementById('loading-error');
      if (el) { el.textContent = 'Kunne ikke koble til databasen. (' + err.message + ')'; el.classList.remove('hidden'); }
      return;
    }
    writeCache('children', children);
    if (children.length === 0) { renderLang(); renderUserAvatar(); showScreen('children'); return; }
    currentChild = children.find(c => c.id === lastId) || children[0];
    await loadEntries(); setTodayDate(); renderLang(); renderUserAvatar();
    showScreen('app'); renderPersonSwitcher(); switchTab('new');
  }

  // ============================================================
  // SCREENS
  // ============================================================
  function showScreen(name) {
    ['loading','auth','children','app'].forEach(s =>
      document.getElementById(`screen-${s}`).classList.toggle('hidden', s !== name));
    if (name === 'children') {
      renderLang(); renderUserAvatar();
      const b = document.getElementById('children-back-link');
      if (b) b.classList.toggle('hidden', children.length === 0);
      const hasSelf = children.some(c => c.is_self);
      const selfCard = document.getElementById('card-create-self');
      if (selfCard) selfCard.classList.toggle('hidden', hasSelf);
      const orDivider = document.getElementById('label-or-child')?.parentElement;
      if (orDivider) orDivider.classList.toggle('hidden', hasSelf);
    }
  }

  // ============================================================
  // AUTH
  // ============================================================
  async function signInWithGoogle() {
    await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
  }

  async function sendMagicLink() {
    const tx = t();
    const email = document.getElementById('auth-email-input').value.trim();
    if (!email) {
      document.getElementById('auth-magic-error').textContent = tx.magicEmailRequired;
      return;
    }
    const btn = document.getElementById('auth-magic-btn');
    btn.disabled = true;
    btn.style.opacity = '0.6';
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
    });
    btn.disabled = false;
    btn.style.opacity = '1';
    if (error) {
      document.getElementById('auth-magic-error').textContent = tx.magicError;
      return;
    }
    document.getElementById('auth-magic-form').classList.add('hidden');
    document.getElementById('auth-magic-sent').classList.remove('hidden');
  }

  function resetMagicForm() {
    document.getElementById('auth-magic-sent').classList.add('hidden');
    document.getElementById('auth-magic-form').classList.remove('hidden');
    document.getElementById('auth-email-input').value = '';
    document.getElementById('auth-magic-error').textContent = '';
  }

  async function signOut() { await sb.auth.signOut(); }

  // ============================================================
  // CHILDREN
  // ============================================================
  function sleepQualityEmoji(q10) { return ['😩','😪','😐','🙂','😊'][q10-1] || ''; }
  function generateShareCode() {
    const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let code = '';
    for (let i = 0; i < 6; i++) code += c[Math.floor(Math.random() * c.length)]; return code;
  }
  async function loadChildren() {
    const { data, error } = await sb.from('child_members').select('child_id, children(id, name, share_code, is_self)').eq('user_id', user.id);
    if (error) throw error;
    return (data || []).map(r => r.children).filter(Boolean);
  }
  async function createChild() {
    const name = document.getElementById('new-child-name').value.trim(); if (!name) return;
    const { data, error } = await sb.rpc('create_child', { child_name: name, child_share_code: generateShareCode() });
    if (error) { showFeedback('create-error', error.message, true); return; }
    const child = typeof data === 'string' ? JSON.parse(data) : data;
    children.push(child); await selectChild(child);
  }
  async function joinChild() {
    const code = document.getElementById('join-code').value.trim().toUpperCase(); if (code.length !== 6) return;
    const { data, error } = await sb.rpc('join_child', { child_share_code: code });
    if (error) { showFeedback('join-error', error.message, true); return; }
    if (!data) { showFeedback('join-error', lang === 'no' ? 'Fant ingen barn med denne koden.' : 'No child found with this code.', true); return; }
    const child = typeof data === 'string' ? JSON.parse(data) : data;
    if (!children.find(c => c.id === child.id)) children.push(child);
    await selectChild(child);
  }
  async function selectChild(child) {
    currentChild = child; localStorage.setItem('sovn-last-child', child.id);
    await loadEntries(); setTodayDate(); renderLang(); renderUserAvatar();
    showScreen('app'); renderPersonSwitcher(); switchTab('new');
  }
  async function cycleChild() {
    if (children.length < 2) return;
    const idx = children.findIndex(c => c.id === currentChild.id);
    await selectChild(children[(idx + 1) % children.length]);
  }
  async function createSelf() {
    const existing = children.find(c => c.is_self);
    if (existing) { await selectChild(existing); return; }
    const name = user?.user_metadata?.full_name || (lang === 'no' ? 'Meg selv' : 'Myself');
    const { data, error } = await sb.rpc('create_child', { child_name: name, child_share_code: generateShareCode() });
    if (error) { showFeedback('create-error', error.message, true); return; }
    const child = typeof data === 'string' ? JSON.parse(data) : data;
    child.is_self = true;
    await sb.from('children').update({ is_self: true }).eq('id', child.id);
    children.push(child); await selectChild(child);
  }
  function renderPersonSwitcher() {
    const container = document.getElementById('person-switcher');
    if (!container) return;
    if (children.length <= 1) { container.innerHTML = ''; return; }
    const selfId = localStorage.getItem('sovn-self-id');
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;';
    children.forEach(child => {
      const isActive    = child.id === currentChild?.id;
      const isSelfEntry = child.id === selfId;
      const label = (isSelfEntry ? '👤 ' : '') + (isSelfEntry ? (lang === 'no' ? 'Meg selv' : 'Myself') : child.name);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.innerHTML = isActive
        ? `<span style="margin-right:5px;font-size:0.7em;">✓</span>${label}`
        : label;
      btn.style.cssText = isActive
        ? `font-family:'Syne',sans-serif;font-weight:800;font-size:0.6875rem;letter-spacing:0.05em;text-transform:uppercase;padding:7px 14px;border-radius:6px;cursor:default;transition:all 0.15s;border:2px solid var(--green);background:var(--green);color:#fff;box-shadow:0 2px 6px rgba(39,77,58,0.25);`
        : `font-family:'Syne',sans-serif;font-weight:700;font-size:0.6875rem;letter-spacing:0.05em;text-transform:uppercase;padding:7px 14px;border-radius:6px;cursor:pointer;transition:all 0.15s;border:1px solid var(--border);background:var(--surface);color:var(--text-3);`;
      if (!isActive) {
        btn.onmouseover = () => { btn.style.borderColor = 'var(--green)'; btn.style.color = 'var(--green)'; };
        btn.onmouseout  = () => { btn.style.borderColor = 'var(--border)'; btn.style.color = 'var(--text-3)'; };
      }
      btn.onclick = () => { if (!isActive) selectChild(child); };
      wrapper.appendChild(btn);
    });
    container.appendChild(wrapper);
  }
  async function copyShareCode() {
    if (!currentChild) return;
    await navigator.clipboard.writeText(currentChild.share_code);
    showFeedback('code-copied', lang === 'no' ? 'Kopiert!' : 'Copied!');
  }
  async function loadMembers() {
    const { data } = await sb.rpc('get_child_members', { p_child_id: currentChild.id });
    return (typeof data === 'string' ? JSON.parse(data) : data) || [];
  }
  function renderMembersList(members) {
    const container = document.getElementById('members-list'); if (!container) return;
    container.innerHTML = '';
    if (!members.length) return;

    const heading = document.createElement('p');
    heading.style.cssText = 'font-family:"Syne",sans-serif;font-weight:700;font-size:0.625rem;letter-spacing:0.06em;text-transform:uppercase;color:var(--text-3);margin-bottom:8px;';
    heading.textContent = t().membersLabel;
    container.appendChild(heading);

    members.forEach(m => {
      const isMe = m.user_id === user?.id;
      const displayName = m.name || m.email || '?';
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:8px;padding:3px 0;';

      const avatar = m.avatar
        ? `<img src="${m.avatar}" style="width:26px;height:26px;border-radius:50%;object-fit:cover;flex-shrink:0;" />`
        : `<div style="width:26px;height:26px;border-radius:50%;background:var(--accent-soft);color:var(--accent);font-family:'Syne',sans-serif;font-weight:800;font-size:0.6875rem;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${displayName.charAt(0).toUpperCase()}</div>`;

      const nameEl = document.createElement('span');
      nameEl.style.cssText = 'font-size:0.8125rem;color:var(--text-2);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
      nameEl.textContent = isMe ? `${displayName} (${lang === 'no' ? 'deg' : 'you'})` : displayName;

      row.innerHTML = avatar;
      row.appendChild(nameEl);

      if (!isMe && m.user_id) {
        const removeBtn = document.createElement('button');
        removeBtn.textContent = t().removeAccess;
        removeBtn.style.cssText = 'font-family:"Syne",sans-serif;font-weight:700;font-size:0.5625rem;letter-spacing:0.05em;text-transform:uppercase;padding:4px 8px;border-radius:5px;cursor:pointer;border:1px solid rgba(184,64,30,0.25);background:transparent;color:var(--accent);white-space:nowrap;transition:all 0.15s;flex-shrink:0;';
        removeBtn.onmouseover = () => { removeBtn.style.background = 'var(--accent-soft)'; };
        removeBtn.onmouseout  = () => { removeBtn.style.background = 'transparent'; };
        removeBtn.onclick = () => removeMember(m.user_id, displayName);
        row.appendChild(removeBtn);
      }

      container.appendChild(row);
    });
  }

  async function removeMember(targetUserId, displayName) {
    if (!confirm(t().removeMemberConfirm(displayName))) return;
    const { error } = await sb.rpc('remove_member', {
      p_child_id: currentChild.id,
      p_target_user_id: targetUserId
    });
    if (error) { alert(t().removeMemberError); return; }
    loadMembers().then(renderMembersList);
  }

  // ============================================================
  // ENTRIES
  // ============================================================
  async function loadEntries() {
    if (!currentChild) return;
    const { data } = await sb.from('sleep_entries').select('*').eq('child_id', currentChild.id).order('date', { ascending: false });
    entries = data || [];
    writeCache(`entries-${currentChild.id}`, entries);
  }
  async function handleSaveEntry(e) {
    e.preventDefault();
    if (!currentChild) { showFeedback('entry-feedback', '⚠️ Ingen person valgt — last siden på nytt.', true); return; }
    try {
      const date   = document.getElementById('entry-date').value;
      const napVal = document.querySelector('input[name="nap"]:checked');
      const nap    = napVal ? napVal.value === 'yes' : null;
      const q1El   = document.querySelector('input[name="q1"]:checked');
      const q10El  = document.querySelector('input[name="q10"]:checked');
      const payload = {
        child_id: currentChild.id, date,
        q1: q1El ? parseInt(q1El.value) : null, nap,
        nap_times: nap === true ? (document.getElementById('nap-times').value.trim() || null) : null,
        medication: document.getElementById('medication').value.trim() || null,
        time_in_bed: document.getElementById('time-in-bed').value || null,
        time_sleep_attempt: document.getElementById('time-sleep-attempt').value || null,
        sleep_onset: intOrNull('sleep-onset'), awakenings_count: intOrNull('awakenings-count'),
        wake_time: intOrNull('wake-time'), final_awakening: document.getElementById('final-awakening').value || null,
        got_up: document.getElementById('got-up').value || null,
        q10: q10El ? parseInt(q10El.value) : null, updated_at: new Date().toISOString(),
      };
      const { data, error } = await sb.from('sleep_entries').upsert(payload, { onConflict: 'child_id,date' }).select();
      if (error) { showFeedback('entry-feedback', '⚠️ ' + error.message, true); return; }
      const saved = data?.[0] ?? payload;
      const idx = entries.findIndex(en => en.date === date);
      if (idx >= 0) entries[idx] = saved; else entries.unshift(saved);
      entries.sort((a, b) => b.date.localeCompare(a.date));
      showFeedback('entry-feedback', t().entrySaved);
    } catch (err) { showFeedback('entry-feedback', '⚠️ ' + err.message, true); console.error(err); }
  }
  async function deleteEntry(date) {
    if (!confirm(t().confirmDelete)) return;
    const { error } = await sb.from('sleep_entries').delete().eq('child_id', currentChild.id).eq('date', date);
    if (!error) { entries = entries.filter(en => en.date !== date); renderHistory(); }
  }
  function onDateChange(date) {
    if (!date) return;
    const entry = entries.find(en => en.date === date); if (entry) editEntry(date, true);
  }
  function editEntry(date, keepDate = false) {
    const entry = entries.find(en => en.date === date); if (!entry) return;
    if (!keepDate) document.getElementById('entry-date').value = entry.date;
    document.querySelectorAll('input[name="q1"]').forEach(r => { r.checked = parseInt(r.value) === entry.q1; });
    if (entry.nap !== null && entry.nap !== undefined) {
      document.getElementById(entry.nap ? 'nap-yes' : 'nap-no').checked = true;
      document.getElementById('nap-times-wrap').classList.toggle('hidden', !entry.nap);
    } else {
      document.querySelectorAll('input[name="nap"]').forEach(r => r.checked = false);
      document.getElementById('nap-times-wrap').classList.add('hidden');
    }
    updateYnStyles();
    document.getElementById('nap-times').value          = entry.nap_times || '';
    document.getElementById('medication').value         = entry.medication || '';
    document.getElementById('time-in-bed').value        = entry.time_in_bed || '';
    document.getElementById('time-sleep-attempt').value = entry.time_sleep_attempt || '';
    document.getElementById('sleep-onset').value        = entry.sleep_onset != null ? entry.sleep_onset : '';
    document.getElementById('awakenings-count').value   = entry.awakenings_count != null ? entry.awakenings_count : '';
    document.getElementById('wake-time').value          = entry.wake_time != null ? entry.wake_time : '';
    document.getElementById('final-awakening').value    = entry.final_awakening || '';
    document.getElementById('got-up').value             = entry.got_up || '';
    document.querySelectorAll('input[name="q10"]').forEach(r => { r.checked = parseInt(r.value) === entry.q10; });
    renderRadioGroup('q1-radios', 'q1', t().q1Scale);
    renderRadioGroup('q10-radios', 'q10', t().q10Scale);
    if (!keepDate) { switchTab('new'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  }

  // ============================================================
  // TABS
  // ============================================================
  function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
    document.getElementById(`tab-${tab}`).classList.remove('hidden');
    document.querySelectorAll('.tab-btn').forEach(btn =>
      btn.classList.toggle('active', btn.dataset.tab === tab));
    if (tab === 'history') renderHistory();
    if (tab === 'settings') {
      document.getElementById('user-email').textContent = user?.email || '';
      const n = document.getElementById('settings-child-name'); if (n) n.textContent = currentChild?.name || '';
      const c = document.getElementById('share-code-display'); if (c) c.textContent = currentChild?.share_code || '';
      renderSettingsChildrenList(); loadMembers().then(renderMembersList);
    }
  }
  function renderSettingsChildrenList() {
    const section = document.getElementById('settings-children-section');
    const list    = document.getElementById('settings-children-list');
    if (!section || !list) return;
    section.classList.remove('hidden'); list.innerHTML = '';
    children.forEach(child => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:8px;padding:4px 0;';
      const nameSpan = document.createElement('span');
      const isActive = child.id === currentChild?.id;
      const isSelf   = !!child.is_self;
      const label = (isSelf ? '👤 ' : '') + (isSelf ? (lang === 'no' ? 'Meg selv' : 'Myself') : child.name);
      nameSpan.innerHTML = isActive
        ? `<span style="display:inline-flex;align-items:center;gap:7px;">${label}<span style="font-size:0.6rem;background:var(--green);color:#fff;font-family:'Syne',sans-serif;font-weight:800;letter-spacing:0.04em;text-transform:uppercase;padding:2px 7px;border-radius:99px;">${lang === 'no' ? 'Valgt' : 'Active'}</span></span>`
        : label;
      nameSpan.style.cssText = `font-size:0.875rem;flex:1;${isActive ? 'font-weight:600;color:var(--text-1);' : 'color:var(--text-2);'}`;
      row.appendChild(nameSpan);

      const actions = document.createElement('div');
      actions.style.cssText = 'display:flex;align-items:center;gap:6px;flex-shrink:0;';

      const tx = t();
      const typeBtn = document.createElement('button');
      typeBtn.textContent = isSelf ? tx.typeMyself : tx.typeChild;
      typeBtn.style.cssText = `font-family:"Syne",sans-serif;font-weight:700;font-size:0.625rem;letter-spacing:0.05em;text-transform:uppercase;padding:5px 10px;border-radius:6px;cursor:pointer;border:1px solid;transition:all 0.15s;background:transparent;${isSelf ? 'border-color:rgba(39,77,58,0.3);color:var(--green);' : 'border-color:var(--border);color:var(--text-3);'}`;
      typeBtn.title = isSelf ? tx.setAsChild : tx.setAsSelf;
      typeBtn.onclick = () => toggleSelfFlag(child);
      actions.appendChild(typeBtn);

      if (!isActive && children.length > 1) {
        const switchBtn = document.createElement('button');
        switchBtn.textContent = tx.switchChild;
        switchBtn.className = 'btn-ghost';
        switchBtn.style.cssText = 'font-size:0.625rem;padding:5px 10px;';
        switchBtn.onclick = () => selectChild(child);
        actions.appendChild(switchBtn);
      }

      const removeBtn = document.createElement('button');
      removeBtn.textContent = tx.removeAccess;
      removeBtn.style.cssText = 'font-family:"Syne",sans-serif;font-weight:700;font-size:0.625rem;letter-spacing:0.05em;text-transform:uppercase;padding:5px 10px;border-radius:6px;cursor:pointer;border:1px solid rgba(184,64,30,0.25);background:transparent;color:var(--accent);transition:all 0.15s;';
      removeBtn.onmouseover = () => { removeBtn.style.background = 'var(--accent-soft)'; };
      removeBtn.onmouseout  = () => { removeBtn.style.background = 'transparent'; };
      removeBtn.onclick = () => removeChild(child);
      actions.appendChild(removeBtn);

      row.appendChild(actions);
      list.appendChild(row);

      if (children.indexOf(child) < children.length - 1) {
        const divider = document.createElement('div');
        divider.style.cssText = 'height:1px;background:var(--border);margin:2px 0;';
        list.appendChild(divider);
      }
    });
  }

  async function toggleSelfFlag(child) {
    const newVal = !child.is_self;
    if (newVal) {
      // unset any existing self
      await sb.from('children').update({ is_self: false }).in('id', children.filter(c => c.is_self).map(c => c.id));
      children.forEach(c => { c.is_self = false; });
    }
    await sb.from('children').update({ is_self: newVal }).eq('id', child.id);
    child.is_self = newVal;
    renderSettingsChildrenList();
    renderLang();
  }

  async function removeChild(child) {
    const tx = t();
    const isSelfEntry = !!child.is_self;
    const displayName = isSelfEntry ? (lang === 'no' ? 'Meg selv' : 'Myself') : child.name;
    if (!confirm(tx.removeConfirm(displayName))) return;

    const { error } = await sb.from('child_members')
      .delete()
      .eq('child_id', child.id)
      .eq('user_id', user.id);

    if (error) { alert(tx.removeError); return; }

    children = children.filter(c => c.id !== child.id);

    if (children.length === 0) {
      currentChild = null;
      showScreen('children');
    } else {
      if (currentChild?.id === child.id) await selectChild(children[0]);
      else renderSettingsChildrenList();
    }
  }

  // ============================================================
  // LANGUAGE
  // ============================================================
  function toggleLang() {
    lang = lang === 'no' ? 'en' : 'no';
    localStorage.setItem('sovn-lang', lang); renderLang();
    if (currentTab === 'history') renderHistory();
  }
  function renderLang() {
    const tx = t(); const name = getChildName(); const self = isSelf();
    setText('auth-title', tx.authTitle); setText('auth-google-btn-text', tx.signInGoogle); setText('auth-lang-btn', tx.langSwitch);
    setText('auth-or-text', tx.authOr);
    const emailInput = document.getElementById('auth-email-input');
    if (emailInput) emailInput.placeholder = tx.emailPlaceholder;
    setText('auth-magic-btn-text', tx.sendMagicLink);
    setText('auth-magic-sent-text', tx.magicSent);
    setText('auth-magic-sent-sub', tx.magicSentSub);
    setText('auth-magic-back-btn', tx.magicBack);
    setText('children-title', tx.authTitle); setText('children-lang-btn', tx.langSwitch);
    setText('children-signout-btn', tx.signOutSmall); setText('children-back-link', tx.backLink);
    setText('create-child-heading', tx.createChild); setAttr('new-child-name', 'placeholder', tx.childNamePlaceholder);
    setText('btn-create-child', tx.createBtn); setText('join-child-heading', tx.joinChild);
    setAttr('join-code', 'placeholder', tx.codePlaceholder); setText('btn-join-child', tx.joinBtn);
    setText('app-title', tx.appTitle); setText('app-lang-btn', tx.langSwitch);
    setText('tab-new-btn', tx.tabNew); setText('tab-history-btn', tx.tabHistory); setText('tab-settings-btn', tx.tabSettings);
    const badge = document.getElementById('child-badge');
    if (badge) {
      const label = (isSelf() ? '👤 ' : '') + (isSelf() ? tx.myselfLabel : (currentChild?.name || ''));
      const canCycle = children.length > 1;
      badge.innerHTML = canCycle ? `${label}<span style="margin-left:4px;opacity:0.7;">▾</span>` : label;
      badge.style.cursor = canCycle ? 'pointer' : 'default';
      badge.style.background = 'rgba(39,77,58,0.1)';
      badge.style.borderColor = 'rgba(39,77,58,0.25)';
      badge.style.color = 'var(--green)';
    }
    setText('create-self-heading', tx.createSelf); setText('create-self-desc', tx.createSelfDesc); setText('btn-create-self', tx.createSelfBtn);
    setText('label-or-child', tx.orChild);
    setText('label-date', tx.labelDate); setText('section-before', tx.sectionBefore(self)); setText('section-morning', tx.sectionMorning(self));
    setText('label-q1', tx.q1(name, self)); renderRadioGroup('q1-radios', 'q1', tx.q1Scale);
    setText('label-q2', tx.q2(name, self)); setText('label-yes', tx.yes); setText('label-no', tx.no_);
    setAttr('nap-times', 'placeholder', tx.q2NapTimes);
    setText('label-q3', tx.q3(name, self)); setText('label-q4', tx.q4(name, self));
    setText('label-in-bed', tx.labelInBed); setText('label-sleep-attempt', tx.labelSleepAttempt);
    setText('label-q5', tx.q5(name, self)); setText('label-minutes-1', tx.minutes);
    setText('label-q6', tx.q6(name, self)); setText('label-q7', tx.q7(name, self));
    setText('label-minutes-2', tx.minutes); setText('label-q8', tx.q8(name, self)); setText('label-q9', tx.q9(name, self));
    setText('label-q10', tx.q10(name, self)); renderRadioGroup('q10-radios', 'q10', tx.q10Scale);
    setText('btn-save-entry', tx.saveEntry);
    setText('label-this-child', self ? tx.thisChildSelf : tx.thisChild);
    setText('label-share-code', tx.shareCodeLabel);
    setText('share-code-hint', self ? tx.shareCodeHintSelf : tx.shareCodeHint);
    setText('btn-copy-code', tx.copyCode); setText('label-children-section', tx.childrenSection);
    setText('btn-add-child', tx.addChildBtn); setText('label-account', tx.accountLabel); setText('btn-sign-out', tx.signOut);
  }
  function renderRadioGroup(containerId, name, options) {
    const container = document.getElementById(containerId); if (!container) return;
    const checked    = document.querySelector(`input[name="${name}"]:checked`);
    const checkedVal = checked ? parseInt(checked.value) : null;
    container.innerHTML = '';
    options.forEach((label, i) => {
      const val = i + 1; const id = `${name}-${val}`;
      const wrap = document.createElement('label');
      wrap.htmlFor = id; wrap.className = 'radio-opt' + (checkedVal === val ? ' checked' : '');
      const radio = document.createElement('input');
      radio.type = 'radio'; radio.name = name; radio.id = id; radio.value = val;
      radio.style.cssText = 'position:absolute;opacity:0;pointer-events:none;';
      if (checkedVal === val) radio.checked = true;
      radio.onchange = () => renderRadioGroup(containerId, name, options);
      const span = document.createElement('span'); span.textContent = label;
      wrap.appendChild(radio); wrap.appendChild(span); container.appendChild(wrap);
    });
  }

  // ============================================================
  // YES/NO STYLE UPDATE
  // ============================================================
  function updateYnStyles() {
    const yL = document.getElementById('yn-label-yes');
    const nL = document.getElementById('yn-label-no');
    if (yL) yL.classList.toggle('yn-checked', !!document.getElementById('nap-yes')?.checked);
    if (nL) nL.classList.toggle('yn-checked', !!document.getElementById('nap-no')?.checked);
  }

  // ============================================================
  // CHART
  // ============================================================
  function setChartMetric(m) { currentChartMetric = m; renderSleepChart(); }
  function setChartPeriod(p) { currentChartPeriod = p; renderSleepChart(); }

  function renderSleepChart() {
    const container = document.getElementById('sleep-chart');
    if (!container) return;
    const sorted = [...entries].reverse(); // asc by date
    if (sorted.length < 2) { container.classList.add('hidden'); return; }
    container.classList.remove('hidden');

    const tx = t();

    // Period filter
    const data = currentChartPeriod === 0 ? sorted : sorted.slice(-currentChartPeriod);

    // Update SVG
    document.getElementById('chart-svg').innerHTML = buildChartSVG(data);

    // Update metric buttons
    const metricCfg = {
      q10:              { label: tx.chartMetricQ10,         activeColor: '#274d3a', activeBg: '#274d3a' },
      sleep_onset:      { label: tx.chartMetricOnset,       activeColor: '#b8401e', activeBg: '#b8401e' },
      awakenings_count: { label: tx.chartMetricAwakenings,  activeColor: '#b8401e', activeBg: '#b8401e' },
      q1:               { label: tx.chartMetricQ1,          activeColor: '#274d3a', activeBg: '#274d3a' },
    };
    Object.entries(metricCfg).forEach(([m, cfg]) => {
      const btn = document.getElementById(`chart-metric-${m}`);
      if (!btn) return;
      btn.textContent = cfg.label;
      const active = m === currentChartMetric;
      btn.style.background = active ? cfg.activeBg : 'transparent';
      btn.style.color      = active ? '#fff' : 'var(--text-3)';
      btn.style.borderColor= active ? cfg.activeBg : 'var(--border)';
    });

    // Update period buttons
    [[14, tx.chartPeriod14], [28, tx.chartPeriod28], [0, tx.chartPeriodAll]].forEach(([p, label]) => {
      const btn = document.getElementById(`chart-period-${p}`);
      if (!btn) return;
      btn.textContent = label;
      const active = p === currentChartPeriod;
      btn.style.background = active ? 'var(--accent-soft)' : 'transparent';
      btn.style.color      = active ? 'var(--accent)' : 'var(--text-3)';
      btn.style.borderColor= active ? 'rgba(184,64,30,0.3)' : 'var(--border)';
    });

    // Stats
    renderChartStats(data);

    // Title
    setText('chart-title', tx.chartTitle);
  }

  function buildChartSVG(data) {
    const tx = t();
    const metric = currentChartMetric;
    const W = 480, H = 155;
    const pad = { top: 14, right: 10, bottom: 30, left: 26 };
    const cw = W - pad.left - pad.right, ch = H - pad.top - pad.bottom;

    const isHigherBetter = metric === 'q10';
    const isMinutesMetric = metric === 'sleep_onset' || metric === 'wake_time';

    // Scale bounds
    let minVal, maxVal;
    if (metric === 'q10' || metric === 'q1') { minVal = 1; maxVal = 5; }
    else {
      const vals = data.map(e => e[metric]).filter(v => v != null).map(Number);
      if (!vals.length) return noDataSVG(W, H, tx.chartNoData);
      minVal = 0;
      maxVal = metric === 'sleep_onset'
        ? Math.max(Math.ceil(Math.max(...vals) / 15) * 15, 30)
        : Math.max(Math.ceil(Math.max(...vals)), 4);
    }

    const xPos = i  => pad.left + (i / Math.max(data.length - 1, 1)) * cw;
    const yPos = v  => pad.top  + ch - ((v - minVal) / (maxVal - minVal)) * ch;

    // Points with non-null values
    const pts = data
      .map((e, i) => ({ x: xPos(i), y: yPos(Number(e[metric])), val: Number(e[metric]), date: e.date, i }))
      .filter(p => data[p.i][metric] != null);

    if (pts.length < 1) return noDataSVG(W, H, tx.chartNoData);

    // Smooth bezier path
    const line = smoothPath(pts);
    const area = pts.length > 1
      ? `${line} L${pts.at(-1).x} ${pad.top + ch} L${pts[0].x} ${pad.top + ch} Z`
      : '';

    const isGood  = isHigherBetter; // q1 higher=better (5=Svært bra)
    const lineClr = (metric === 'q10' || metric === 'q1') ? '#274d3a' : '#b8401e';
    const gradClr = lineClr;
    const gradId  = `g${metric.replace('_','')}`;

    // Y gridlines + labels
    const yTicks = (metric === 'q10' || metric === 'q1') ? [1,2,3,4,5] : [minVal, Math.round((minVal+maxVal)/2), maxVal];
    const grid = yTicks.map(v => {
      const y = yPos(v).toFixed(1);
      return `<line x1="${pad.left}" y1="${y}" x2="${W-pad.right}" y2="${y}" stroke="var(--border)" stroke-width="0.5" stroke-dasharray="3 3"/>
              <text x="${pad.left-4}" y="${(Number(y)+3.5).toFixed(1)}" text-anchor="end" fill="var(--text-3)" font-size="9" font-family="Syne,sans-serif" font-weight="700">${v}</text>`;
    }).join('');

    // X date labels
    const everyN = data.length <= 7 ? 1 : data.length <= 14 ? 2 : data.length <= 21 ? 3 : Math.ceil(data.length / 7);
    const xLabels = data.map((e, i) => {
      if (i % everyN !== 0 && i !== data.length - 1) return '';
      const d = new Date(e.date + 'T12:00:00');
      const lbl = d.toLocaleDateString(lang === 'no' ? 'nb-NO' : 'en-GB', { day:'numeric', month:'short' });
      return `<text x="${xPos(i).toFixed(1)}" y="${H-3}" text-anchor="middle" fill="var(--text-3)" font-size="8.5" font-family="Syne,sans-serif" font-weight="700">${lbl}</text>`;
    }).join('');

    // Dots colored by value
    function dotColor(val) {
      if (metric === 'q10') return val >= 4 ? '#274d3a' : val === 3 ? '#8a7a5a' : '#b8401e';
      if (metric === 'q1')  return val >= 4 ? '#274d3a' : val === 3 ? '#8a7a5a' : '#b8401e';
      if (metric === 'sleep_onset') return val <= 15 ? '#274d3a' : val <= 30 ? '#8a7a5a' : '#b8401e';
      return val === 0 ? '#274d3a' : val <= 2 ? '#8a7a5a' : '#b8401e';
    }
    const dots = pts.map(p =>
      `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.5" fill="${dotColor(p.val)}" stroke="var(--surface)" stroke-width="1.5"/>`
    ).join('');

    return `<defs>
      <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${gradClr}" stop-opacity="0.2"/>
        <stop offset="100%" stop-color="${gradClr}" stop-opacity="0"/>
      </linearGradient>
    </defs>
    ${grid}
    ${xLabels}
    ${area ? `<path d="${area}" fill="url(#${gradId})"/>` : ''}
    <path d="${line}" fill="none" stroke="${lineClr}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    ${dots}`;
  }

  function noDataSVG(W, H, msg) {
    return `<text x="${W/2}" y="${H/2}" text-anchor="middle" dominant-baseline="middle" fill="var(--text-3)" font-size="12" font-style="italic" font-family="Spectral,Georgia,serif">${msg}</text>`;
  }

  function smoothPath(pts) {
    if (!pts.length) return '';
    if (pts.length === 1) return `M${pts[0].x} ${pts[0].y}`;
    let d = `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 1; i < pts.length; i++) {
      const p0 = pts[i-2] ?? pts[i-1], p1 = pts[i-1], p2 = pts[i], p3 = pts[i+1] ?? pts[i];
      const cp1x = p1.x + (p2.x - p0.x) / 6, cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6, cp2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C${cp1x.toFixed(1)} ${cp1y.toFixed(1)},${cp2x.toFixed(1)} ${cp2y.toFixed(1)},${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return d;
  }

  function renderChartStats(data) {
    const el = document.getElementById('chart-stats');
    if (!el) return;
    const tx = t();
    const metric = currentChartMetric;
    const vals = data.map(e => e[metric]).filter(v => v != null).map(Number);
    if (!vals.length) { el.innerHTML = ''; return; }

    const avg = (vals.reduce((a,b) => a+b,0) / vals.length).toFixed(1);
    const min = Math.min(...vals), max = Math.max(...vals);
    const unit = (metric === 'sleep_onset' || metric === 'wake_time') ? tx.chartUnit_min : '';

    // Trend: compare first half vs second half
    let trend = '→', trendColor = 'var(--text-3)';
    if (vals.length >= 4) {
      const h = Math.floor(vals.length / 2);
      const a1 = vals.slice(0,h).reduce((a,b)=>a+b,0)/h;
      const a2 = vals.slice(-h).reduce((a,b)=>a+b,0)/h;
      const d  = a2 - a1;
      const higherIsBetter = metric === 'q10' || metric === 'q1';
      const lowerIsBetter  = metric !== 'q10' && metric !== 'q1';
      if (Math.abs(d) > 0.25) {
        const improving = higherIsBetter ? d > 0 : d < 0;
        trend = improving ? '↑' : '↓';
        trendColor = improving ? 'var(--green)' : 'var(--accent)';
      }
    }

    const stat = (label, value) =>
      `<span style="display:flex;flex-direction:column;gap:1px;">
        <span style="font-family:'Syne',sans-serif;font-size:0.5625rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:var(--text-3);">${label}</span>
        <span style="font-family:'Syne',sans-serif;font-size:0.875rem;font-weight:800;color:var(--text-1);">${value}</span>
       </span>`;

    el.innerHTML =
      stat(tx.chartAvg, `${avg}${unit}`) +
      `<span style="display:flex;flex-direction:column;gap:1px;">
        <span style="font-family:'Syne',sans-serif;font-size:0.5625rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:var(--text-3);">${tx.chartTrend}</span>
        <span style="font-family:'Syne',sans-serif;font-size:1rem;font-weight:800;color:${trendColor};">${trend}</span>
       </span>` +
      stat(tx.chartRange, `${min}–${max}${unit}`);
  }

  // ============================================================
  // HISTORY
  // ============================================================
  function renderHistory() {
    renderSleepChart();
    const list  = document.getElementById('history-list');
    const empty = document.getElementById('history-empty');
    list.innerHTML = '';
    if (!entries.length) { empty.textContent = t().historyEmpty; empty.classList.remove('hidden'); return; }
    empty.classList.add('hidden');
    const tx = t();

    entries.forEach((entry, i) => {
      const isOpen = expandedEntries.has(entry.date);
      const card = document.createElement('div');
      card.className = 'card';
      card.style.cssText = `overflow:hidden;animation:cardIn 0.2s ${i * 0.03}s ease both;`;

      // ── Collapsed header (always visible) ──
      const header = document.createElement('div');
      header.className = 'entry-header';
      header.onclick = () => toggleEntryCard(entry.date, body, chevron);

      const headerLeft = document.createElement('div');
      headerLeft.style.cssText = 'display:flex;flex-direction:column;gap:3px;min-width:0;';

      const dateEl = document.createElement('p');
      dateEl.style.cssText = 'font-weight:600;color:var(--text-1);font-size:1rem;text-transform:capitalize;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
      dateEl.textContent = formatDate(entry.date, lang);
      headerLeft.appendChild(dateEl);

      // Compact key metrics shown in collapsed state
      const metrics = buildCompactMetrics(entry, tx);
      if (metrics) {
        const metricEl = document.createElement('p');
        metricEl.style.cssText = 'font-family:"Syne",sans-serif;font-size:0.65rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:var(--text-3);';
        metricEl.textContent = metrics;
        headerLeft.appendChild(metricEl);
      }
      header.appendChild(headerLeft);

      const headerRight = document.createElement('div');
      headerRight.style.cssText = 'display:flex;align-items:center;gap:8px;flex-shrink:0;';
      if (entry.q10) {
        const emoji = document.createElement('span');
        emoji.style.cssText = 'font-size:1.25rem;line-height:1;';
        emoji.textContent = sleepQualityEmoji(entry.q10);
        headerRight.appendChild(emoji);
      }

      const chevron = document.createElement('svg');
      chevron.className = 'entry-chevron' + (isOpen ? ' open' : '');
      chevron.setAttribute('width', '14');
      chevron.setAttribute('height', '14');
      chevron.setAttribute('viewBox', '0 0 14 14');
      chevron.setAttribute('fill', 'none');
      chevron.innerHTML = '<path d="M2.5 5L7 9.5L11.5 5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>';
      headerRight.appendChild(chevron);
      header.appendChild(headerRight);
      card.appendChild(header);

      // ── Expandable body ──
      const body = document.createElement('div');
      body.className = 'entry-body' + (isOpen ? ' open' : '');

      const bodyInner = document.createElement('div');
      bodyInner.style.cssText = 'padding:0 16px 14px;';

      // Divider
      const divider = document.createElement('div');
      divider.style.cssText = 'height:1px;background:var(--border);margin-bottom:12px;';
      bodyInner.appendChild(divider);

      // Detail grid
      const grid = document.createElement('div');
      grid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:4px 14px;margin-bottom:14px;';
      buildSummaryFields(entry, tx).forEach(([label, value]) => {
        if (value === null || value === undefined || value === '') return;
        const lEl = document.createElement('span');
        lEl.style.cssText = 'font-family:"Syne",sans-serif;font-size:0.65rem;font-weight:700;letter-spacing:0.07em;text-transform:uppercase;color:var(--text-3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
        lEl.textContent = label;
        const vEl = document.createElement('span');
        vEl.style.cssText = 'font-size:0.875rem;color:var(--text-1);font-weight:500;';
        vEl.textContent = value;
        grid.appendChild(lEl); grid.appendChild(vEl);
      });
      bodyInner.appendChild(grid);

      // Buttons
      const btnRow = document.createElement('div');
      btnRow.style.cssText = 'display:flex;gap:6px;';
      const editBtn = document.createElement('button');
      editBtn.textContent = tx.editBtn;
      editBtn.style.cssText = 'flex:1;font-family:"Syne",sans-serif;font-weight:700;font-size:0.7rem;letter-spacing:0.07em;text-transform:uppercase;padding:9px;border-radius:6px;border:1px solid var(--border);background:var(--surface-2);color:var(--text-2);cursor:pointer;transition:all 0.15s;';
      editBtn.onmouseover = () => { editBtn.style.borderColor='var(--accent)'; editBtn.style.color='var(--accent)'; };
      editBtn.onmouseout  = () => { editBtn.style.borderColor='var(--border)';  editBtn.style.color='var(--text-2)'; };
      editBtn.onclick = () => editEntry(entry.date);
      const delBtn = document.createElement('button');
      delBtn.textContent = tx.deleteBtn;
      delBtn.style.cssText = 'flex:1;font-family:"Syne",sans-serif;font-weight:700;font-size:0.7rem;letter-spacing:0.07em;text-transform:uppercase;padding:9px;border-radius:6px;border:1px solid #e8c8c0;background:transparent;color:#b8401e;cursor:pointer;transition:background 0.15s;';
      delBtn.onmouseover = () => { delBtn.style.background='rgba(184,64,30,0.06)'; };
      delBtn.onmouseout  = () => { delBtn.style.background='transparent'; };
      delBtn.onclick = () => deleteEntry(entry.date);
      btnRow.appendChild(editBtn); btnRow.appendChild(delBtn);
      bodyInner.appendChild(btnRow);

      body.appendChild(bodyInner);
      card.appendChild(body);
      list.appendChild(card);
    });
  }

  function toggleEntryCard(date, body, chevron) {
    const isOpen = expandedEntries.has(date);
    if (isOpen) {
      expandedEntries.delete(date);
      body.classList.remove('open');
      chevron.classList.remove('open');
    } else {
      expandedEntries.add(date);
      body.classList.add('open');
      chevron.classList.add('open');
    }
  }

  function buildCompactMetrics(entry, tx) {
    const parts = [];
    if (entry.time_in_bed)    parts.push(entry.time_in_bed);
    if (entry.got_up)         parts.push('→ ' + entry.got_up);
    if (entry.sleep_onset != null) parts.push(entry.sleep_onset + tx.minutesSuffix);
    if (entry.awakenings_count != null) parts.push(entry.awakenings_count + '×');
    return parts.join('  ·  ') || null;
  }
  function buildSummaryFields(entry, tx) {
    return [
      [tx.fieldQ1,          entry.q1!=null?tx.q1Scale[entry.q1-1]:null],
      [tx.fieldNap,         entry.nap===true?tx.yes:entry.nap===false?tx.no_:null],
      [tx.fieldNapTimes,    entry.nap_times],
      [tx.fieldMed,         entry.medication],
      [tx.fieldInBed,       entry.time_in_bed],
      [tx.fieldSleepAttempt,entry.time_sleep_attempt],
      [tx.fieldOnset,       entry.sleep_onset!=null?entry.sleep_onset+tx.minutesSuffix:null],
      [tx.fieldAwakenings,  entry.awakenings_count!=null?String(entry.awakenings_count):null],
      [tx.fieldWakeTime,    entry.wake_time!=null?entry.wake_time+tx.minutesSuffix:null],
      [tx.fieldFinalWake,   entry.final_awakening],
      [tx.fieldGotUp,       entry.got_up],
      [tx.fieldQ10,         entry.q10!=null?sleepQualityEmoji(entry.q10)+' '+tx.q10Scale[entry.q10-1]:null],
    ];
  }

  // ============================================================
  // USER AVATAR
  // ============================================================
  function renderUserAvatar() {
    const aI = document.getElementById('user-avatar'),       aF = document.getElementById('user-avatar-fallback');
    const cI = document.getElementById('children-avatar-img'), cF = document.getElementById('children-avatar-fallback');
    const url = user?.user_metadata?.avatar_url;
    const ini = (user?.user_metadata?.full_name || user?.email || '').charAt(0).toUpperCase();
    [[aI,aF],[cI,cF]].forEach(([img,fb]) => {
      if (!img||!fb) return;
      if (url) { img.src=url; img.classList.remove('hidden'); fb.classList.add('hidden'); }
      else { fb.textContent=ini; fb.classList.remove('hidden'); img.classList.add('hidden'); }
    });
  }

  // ============================================================
  // NAP TOGGLE
  // ============================================================
  function toggleNapTimes() {
    document.getElementById('nap-times-wrap').classList.toggle('hidden', !document.getElementById('nap-yes').checked);
  }

  // ============================================================
  // HELPERS
  // ============================================================
  function setTodayDate() {
    const t = new Date();
    document.getElementById('entry-date').value = `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;
  }
  function setText(id, text) { const el = document.getElementById(id); if (el) el.textContent = text; }
  function setAttr(id, attr, val) { const el = document.getElementById(id); if (el) el.setAttribute(attr, val); }
  function intOrNull(id) { const v = document.getElementById(id).value; return v === '' ? null : parseInt(v, 10); }
  function showFeedback(id, msg, isError = false) {
    const el = document.getElementById(id); if (!el) return;
    el.textContent = msg;
    el.style.color = isError ? 'var(--accent)' : 'var(--green)';
    el.classList.remove('hidden');
    if (!isError) setTimeout(() => el.classList.add('hidden'), 3000);
  }
  function formatDate(dateStr, language) {
    const [y,m,d] = dateStr.split('-').map(Number);
    return new Date(y,m-1,d).toLocaleDateString(language==='no'?'nb-NO':'en-GB', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  }
