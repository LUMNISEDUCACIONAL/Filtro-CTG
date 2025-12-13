// ===== Configurações / Destinatários =====
const BG_IMAGES = [
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80',
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1920&q=80',
  'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=1920&q=80',
  'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1920&q=80',
  'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=1920&q=80',
  'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1920&q=80',
  'https://images.unsplash.com/photo-1565008576549-57569a49371d?w=1920&q=80'
];

const WEB3FORMS_ACCESS_KEY = '48c7b0de-05bc-4228-98f1-1d2ebc6e2b44';
const FORMSUBMIT_EMAIL = 'assessortecnico@lumnis.com.br'; // precisa estar confirmado no FormSubmit
const CC_LIST = ['wilkerfreelancer@gmail.com']; // ex.: ['outra.pessoa@empresa.com.br']
const BCC_LIST = []; // ex.: ['auditoria@empresa.com.br']
const WHATSAPP_NUMBER = '5511961803550';

// ===== Map legível de classificação =====
function levelLabel(code){
  const map = {
    ceo_ready: 'CEO Ready',
    especialista: 'Especialista',
    nutricao: 'Nutrição',
    desalinhado: 'Desalinhado'
  };
  return map[code] || code || '';
}

// ===== Perguntas =====
const QUESTIONS = {
  p4_cargo: {
    question: 'Qual sua função na empresa?',
    options: [
      { value:'A', label:'CEO / Presidente / Sócio-Diretor' },
      { value:'B', label:'CFO / Diretor Financeiro / Head de Investimentos' },
      { value:'C', label:'Diretor / Gerente Sênior', desc:'Com influência direta' },
      { value:'D', label:'Analista / Consultor', desc:'Pesquisa ou apoio' },
    ]
  },
  p1_tipo: {
    question: 'Qual é o foco principal do seu projeto?',
    options: [
      { value:'A', label:'Desenvolvimento/Investimento em Ativos Imobiliários', desc:'Residencial, comercial, logístico ou industrial' },
      { value:'B', label:'Outro Setor', desc:'Tecnologia, indústria, varejo, agronegócio, etc.' },
      { value:'C', label:'Prestação de serviços ou fornecimento de produtos para o setor imobiliário', desc:'Construção, arquitetura, consultoria' },
    ]
  },
  p2_garantia: {
    question: 'Seu projeto possui ativo imobiliário como garantia?',
    options: [
      { value:'A', label:'Sim, com ativo imobiliário', desc:'Terreno, imóvel pronto ou em desenvolvimento' },
      { value:'B', label:'Não', desc:'Outras garantias: faturamento, recebíveis, equipamentos' },
    ]
  },
  p3_ticket: {
    question: 'Qual a faixa de capital necessária?',
    options: [
      { value:'A', label:'Inferior a R$ 50 milhões' },
      { value:'B', label:'R$ 50–99 milhões' },
      { value:'C', label:'R$ 100 milhões ou mais' },
    ]
  },
  p5_prazo: {
    question: 'Qual o horizonte de tempo para captação?',
    options: [
      { value:'A', label:'Até 3 meses', desc:'Urgente / prioridade' },
      { value:'B', label:'3–6 meses' },
      { value:'C', label:'6–12 meses' },
      { value:'D', label:'Acima de 12 meses', desc:'Exploratória' },
    ]
  },
};

// ===== Estado =====
const state = { step:1, form: {
  nome:'', email:'', telefone:'', empresa:'', cnpj:'', local:'', consentimento_lgpd:false,
  p4_cargo:null, p1_tipo:null, p2_garantia:null, p3_ticket:null, p5_prazo:null,
  utm_source:'', utm_medium:'', utm_campaign:''
}, errors:{}, result:null };

// ===== Helpers DOM =====
function $(q){ return document.querySelector(q); }
function el(html){ const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstElementChild; }

function showError(msg){
  const box = document.getElementById('errorBox');
  box.textContent = msg;
  box.classList.remove('hidden');
}

function setBackground(){
  const idx = (state.step - 1) % BG_IMAGES.length;
  const img = $('#bgImage');
  img.style.opacity = 0.2;
  img.style.transform = 'scale(1.02)';
  requestAnimationFrame(()=>{
    img.style.backgroundImage = `url('${BG_IMAGES[idx]}')`;
    img.style.opacity = 0.35;
    img.style.transform = 'scale(1)';
  });
}
document.addEventListener('mousemove', (e)=>{
  const img = $('#bgImage'); if(!img) return;
  const cx = (e.clientX / innerWidth - .5) * 2;
  const cy = (e.clientY / innerHeight - .5) * 2;
  img.style.transform = `translate(${cx*6}px, ${cy*4}px) scale(1.02)`;
});

// ===== Fluxo / UI =====
function getTotalSteps(){ return 6; }

function updProgress(){
  $('#etapaAtual').textContent = state.step;
  $('#etapasTotal').textContent = getTotalSteps();
  const pct = Math.round((state.step / getTotalSteps())*100);
  $('#pct').textContent = pct;
  $('#barra').style.width = pct + '%';
}

function optionButton({value,label,desc,model}){
  const selected = state.form[model] === value;
  const node = el(`
    <button data-model="${model}" data-value="${value}" class="w-full text-left group relative p-4 rounded-2xl border-2 ${selected ? 'border-b44red bg-gradient-to-b from-red-50 to-red-100' : 'border-gray-200 bg-white'} transition will-change-transform">
      <div class="absolute inset-0 bg-gradient-to-r from-white/0 via-b44/5 to-b44/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${selected ? 'hidden' : ''}"></div>
      <div class="relative flex items-start justify-between gap-4">
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-1">
            <span class="text-xs font-bold px-3 py-1 rounded-full ${selected ? 'bg-b44red text-white':'bg-gray-100 text-gray-600 group-hover:bg-b44 group-hover:text-white'}">${value}</span>
            <span class="font-bold text-lg ${selected ? 'text-b44red':'text-gray-900'}">${label}</span>
          </div>
          ${desc ? `<div class="text-sm text-gray-600 mt-1">${desc}</div>` : ''}
        </div>
        <span class="text-gray-400">›</span>
      </div>
    </button>
  `);
  node.addEventListener('mousedown', ()=> node.classList.add('option-press'));
  node.addEventListener('mouseup', ()=> node.classList.remove('option-press'));
  node.addEventListener('mouseleave', ()=> node.classList.remove('option-press'));
  return node;
}

function inputField({label,type='text',id,placeholder,required=false,error=null}){
  return el(`
    <div class="animate-fade-in">
      <label class="text-xs font-bold tracking-wide text-gray-800">${label}${required? ' *':''}</label>
      <input id="${id}" type="${type}" placeholder="${placeholder||''}" class="mt-2 w-full px-3 py-3 rounded-xl border-2 border-gray-200 outline-none focus:border-b44" />
      ${error ? `<div class="text-sm text-red-600 mt-1">${error}</div>`:''}
    </div>
  `);
}

// ===== Validações =====
function validateEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
function validatePhone(v){ const d = String(v||'').replace(/\D/g,''); return d.length>=10 && d.length<=11; }
function validateCNPJ(v){ const d = String(v||'').replace(/\D/g,''); return d.length===14; }

// ===== Classificação =====
function classifyLead(){
  const { p1_tipo, p2_garantia, p3_ticket, p4_cargo, p5_prazo } = state.form;
  if (p1_tipo === 'B') return { classificacao:'desalinhado', prioridade:'nenhuma' };
  if (p2_garantia === 'B') return { classificacao:'desalinhado', prioridade:'nenhuma' };
  if (p1_tipo==='A' && p2_garantia==='A' && p3_ticket==='C' && ['A','B'].includes(p4_cargo) && ['A','B'].includes(p5_prazo)) {
    return { classificacao:'ceo_ready', prioridade:'alta' };
  }
  if (['A','C'].includes(p1_tipo) && p2_garantia==='A' && ['B','C'].includes(p3_ticket) && ['A','B','C'].includes(p4_cargo) && ['A','B','C'].includes(p5_prazo)) {
    return { classificacao:'especialista', prioridade:'media' };
  }
  if (['A','C'].includes(p1_tipo) && p2_garantia==='A' && p3_ticket==='A') {
    return { classificacao:'nutricao', prioridade:'baixa' };
  }
  return { classificacao:'desalinhado', prioridade:'nenhuma' };
}

// ===== Utilitário para rótulos legíveis =====
function qLabel(qkey, value){
  const q = QUESTIONS[qkey];
  if(!q) return value || '';
  const opt = (q.options || []).find(o => o.value === value);
  return opt ? opt.label : (value || '');
}

// ===== Envio via Web3Forms (fallback) =====
async function sendWithWeb3Forms(lead){
  const res = await fetch('https://api.web3forms.com/submit', {
    method:'POST',
    headers:{'Content-Type':'application/json','Accept':'application/json'},
    body: JSON.stringify({
      access_key: WEB3FORMS_ACCESS_KEY,
      subject: 'Novo Lead CTG',
      from_name: lead.nome || 'Lead',
      from_email: lead.email || 'no-reply@web3forms.com',
      nome: lead.nome || '',
      telefone: lead.telefone || '',
      email: lead.email || '',
      empresa: lead.empresa || '',
      cnpj: lead.cnpj || '',
      nivel: levelLabel(lead.classificacao),
      cargo:    qLabel('p4_cargo',    lead.p4_cargo),
      tipo:     qLabel('p1_tipo',     lead.p1_tipo),
      garantia: qLabel('p2_garantia', lead.p2_garantia),
      ticket:   qLabel('p3_ticket',   lead.p3_ticket),
      prazo:    qLabel('p5_prazo',    lead.p5_prazo),
      criado_em: lead.created_at || '',
      botcheck: ''
    })
  });
  let data = null; try { data = await res.json(); } catch(e){}
  console.log('[Web3Forms]', res.status, data);
  if(res.ok && data && (data.success===true || data.success===True)) return { ok:true };
  const err = (data && (data.message||data.error)) || ('status '+res.status);
  return { ok:false, error: err };
}

// ===== Envio via FormSubmit (com _cc/_bcc) =====
async function sendWithFormSubmit(lead){
  const formData = new FormData();

  // Campos básicos
  formData.append('nome',     lead.nome || '');
  formData.append('telefone', lead.telefone || '');
  formData.append('email',    lead.email || '');
  formData.append('empresa',  lead.empresa || '');
  formData.append('cnpj',     lead.cnpj || '');

  // Classificação + perguntas formatadas
  formData.append('nivel',    levelLabel(lead.classificacao) || '');
  formData.append('cargo',      qLabel('p4_cargo',   lead.p4_cargo)   || '');
  formData.append('tipo',       qLabel('p1_tipo',    lead.p1_tipo)    || '');
  formData.append('garantia',   qLabel('p2_garantia',lead.p2_garantia)|| '');
  formData.append('ticket',     qLabel('p3_ticket',  lead.p3_ticket)  || '');
  formData.append('prazo',      qLabel('p5_prazo',   lead.p5_prazo)   || '');

  // Metadados / opções
  formData.append('criado_em',  lead.created_at || '');
  formData.append('_subject',  'Novo Lead CTGD');
  formData.append('_template', 'table');
  formData.append('_captcha',  'false');
  formData.append('_origin',   location.href);
  formData.append('_honey',    '');

  // CC / BCC (opcionais)
  if (CC_LIST && CC_LIST.length)  formData.append('_cc',  CC_LIST.join(','));
  if (BCC_LIST && BCC_LIST.length) formData.append('_bcc', BCC_LIST.join(','));

  const url = `https://formsubmit.co/ajax/${encodeURIComponent(FORMSUBMIT_EMAIL)}`;
  const res = await fetch(url, { method:'POST', body: formData, headers: { 'Accept': 'application/json' } });

  let data = null; try { data = await res.json(); } catch(e){}
  console.log('[FormSubmit]', res.status, data);
  if (res.ok && data && (data.success === true)) return { ok:true };
  const err = (data && (data.message || data.error)) || ('status ' + res.status);
  return { ok:false, error: err };
}

// ===== Orquestrador de envio: testa FormSubmit e cai no Web3Forms se falhar =====
async function sendEmailServer(lead){
  const fr = await sendWithFormSubmit(lead);
  if (fr.ok) return fr;

  console.warn('FormSubmit falhou:', fr.error);
  const wr = await sendWithWeb3Forms(lead);
  if (wr.ok) return wr;

  throw new Error(wr.error || 'Falha no envio');
}

// ===== Tela de resultado =====
function resultScreen(type, nome){
  const first = (nome||'').split(' ')[0];
  const titles = {
    ceo_ready: 'Elegível — Prioridade Executiva',
    especialista: 'Obrigado! — Encaminhado ao Especialista',
    nutricao: 'Recebido — Seguiremos em Nutrição',
    desalinhado: 'Obrigado — No momento, não seguimos adiante'
  };
  const body = {
    ceo_ready: `Parabéns, <strong>${first}</strong>! Seu projeto atende aos critérios para análise em alto nível.`,
    especialista: `Obrigado, <strong>${first}</strong>! Um especialista irá contatar para discutir estrutura de capital.`,
    nutricao: `Obrigado, <strong>${first}</strong>! Registramos suas informações e seguiremos em contato futuramente.`,
    desalinhado: `Agradecemos o interesse, <strong>${first}</strong>. Seus dados foram registrados.`
  };
  confetti();
  return el(`
    <div class="text-center result-pulse">
      <div class="inline-flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700">${type}</div>
      <h2 class="text-2xl md:text-3xl font-black text-b44 mt-3">${titles[type]}</h2>
      <p class="text-gray-700 mt-3">${body[type]}</p>
      <div class="mt-6">
        <a href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Olá, tenho interesse em conhecer a operação')}" target="_blank" rel="noopener" class="inline-block bg-[#25D366] text-white font-bold px-5 py-3 rounded-lg shadow">
          Abrir WhatsApp
        </a>
      </div>
    </div>
  `);
}

function persistLocal(lead){
  const list = JSON.parse(localStorage.getItem('leads')||'[]');
  list.unshift(lead);
  localStorage.setItem('leads', JSON.stringify(list));
}

// ===== Render =====
function render(){
  setBackground();
  updProgress();

  const c = $('#content');
  c.classList.remove('animate-fade-in');
  c.classList.add('animate-fade-out');
  setTimeout(()=>{
    c.innerHTML = '';
    c.classList.remove('animate-fade-out');
    c.classList.add('animate-fade-in');

    $('#btnBack').classList.toggle('hidden', state.step===1);
    $('#btnNext').textContent = state.step < getTotalSteps() ? 'Próximo' : (state.result ? 'Concluir' : 'Enviar');

    if(state.result){
      c.appendChild(resultScreen(state.result.type, state.form.nome));
      $('#btnBack').classList.add('hidden');
      $('#btnNext').classList.add('hidden');
      return;
    }

    if(state.step===1){
      const wrap = el(`<div class="p-6 md:p-8">
        <h2 class="text-3xl md:text-4xl font-bold text-b44 mb-8">Seus dados de contato</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4"></div>
        <div class="mt-4">
          <label class="inline-flex items-start gap-2 text-sm">
            <input id="f_lgpd" type="checkbox" class="mt-1">
            <span>Autorizo o uso dos meus dados conforme a LGPD.</span>
          </label>
          <div id="err_lgpd" class="text-sm text-red-600 mt-1"></div>
        </div>
      </div>`);
      const grid = wrap.querySelector('.grid');
      const f_nome = inputField({label:'Nome completo', id:'f_nome', placeholder:'João Silva', required:true, error: state.errors.nome});
      const f_email = inputField({label:'E-mail corporativo', type:'email', id:'f_email', placeholder:'joao@empresa.com.br', required:true, error: state.errors.email});
      const f_tel = inputField({label:'Telefone / WhatsApp', id:'f_tel', placeholder:'(11) 99999-9999', required:true, error: state.errors.telefone});
      const f_emp = inputField({label:'Empresa', id:'f_emp', placeholder:'Nome da empresa', required:true, error: state.errors.empresa});
      const f_cnpj = inputField({label:'CNPJ', id:'f_cnpj', placeholder:'00.000.000/0000-00', required:true, error: state.errors.cnpj});
      const f_loc = inputField({label:'Localização (opcional)', id:'f_loc', placeholder:'Cidade/Estado'});
      [f_nome,f_email,f_tel,f_emp,f_cnpj,f_loc].forEach(x=>grid.appendChild(x));
      c.appendChild(wrap);
      $('#f_nome').value = state.form.nome; $('#f_email').value=state.form.email;
      $('#f_tel').value=state.form.telefone; $('#f_emp').value=state.form.empresa;
      $('#f_cnpj').value=state.form.cnpj; $('#f_loc').value=state.form.local;
      $('#f_lgpd').checked = state.form.consentimento_lgpd;

      ['f_nome','f_email','f_tel','f_emp','f_cnpj','f_loc'].forEach(id=>{
        $('#'+id).addEventListener('input', ()=>{
          state.form.nome = $('#f_nome').value.trim();
          state.form.email = $('#f_email').value.trim();
          state.form.telefone = $('#f_tel').value.trim();
          state.form.empresa = $('#f_emp').value.trim();
          state.form.cnpj = $('#f_cnpj').value.trim();
          state.form.local = $('#f_loc').value.trim();
        });
      });
      $('#f_lgpd').addEventListener('change', ()=> state.form.consentimento_lgpd = $('#f_lgpd').checked);
    }

    if(state.step===2){
      const w = el(`<div class="p-6 md:p-8">
        <h2 class="text-3xl md:text-4xl font-bold text-b44 mb-8">${QUESTIONS.p4_cargo.question}</h2>
        <div class="grid gap-3"></div>
      </div>`);
      QUESTIONS.p4_cargo.options.forEach(o=>{
        const b = optionButton({...o, model:'p4_cargo'});
        b.addEventListener('click', ()=>{ state.form.p4_cargo=o.value; render(); });
        w.querySelector('.grid').appendChild(b);
      });
      c.appendChild(w);
    }

    if(state.step===3){
      const w = el(`<div class="p-6 md:p-8">
        <h2 class="text-3xl md:text-4xl font-bold text-b44 mb-8">${QUESTIONS.p1_tipo.question}</h2>
        <div class="grid gap-3"></div>
      </div>`);
      QUESTIONS.p1_tipo.options.forEach(o=>{
        const b = optionButton({...o, model:'p1_tipo'});
        b.addEventListener('click', ()=>{ state.form.p1_tipo=o.value; render(); });
        w.querySelector('.grid').appendChild(b);
      });
      c.appendChild(w);
    }

    if(state.step===4){
      const w = el(`<div class="p-6 md:p-8">
        <h2 class="text-3xl md:text-4xl font-bold text-b44 mb-8">${QUESTIONS.p2_garantia.question}</h2>
        <div class="grid gap-3"></div>
      </div>`);
      QUESTIONS.p2_garantia.options.forEach(o=>{
        const b = optionButton({...o, model:'p2_garantia'});
        b.addEventListener('click', ()=>{ state.form.p2_garantia=o.value; render(); });
        w.querySelector('.grid').appendChild(b);
      });
      c.appendChild(w);
    }

    if(state.step===5){
      const w = el(`<div class="p-6 md:p-8">
        <h2 class="text-3xl md:text-4xl font-bold text-b44 mb-8">${QUESTIONS.p3_ticket.question}</h2>
        <div class="grid gap-3"></div>
      </div>`);
      QUESTIONS.p3_ticket.options.forEach(o=>{
        const b = optionButton({...o, model:'p3_ticket'});
        b.addEventListener('click', ()=>{ state.form.p3_ticket=o.value; render(); });
        w.querySelector('.grid').appendChild(b);
      });
      c.appendChild(w);
    }

    if(state.step===6){
      const w = el(`<div class="p-6 md:p-8">
        <h2 class="text-3xl md:text-4xl font-bold text-b44 mb-8">${QUESTIONS.p5_prazo.question}</h2>
        <div class="grid gap-3"></div>
      </div>`);
      QUESTIONS.p5_prazo.options.forEach(o=>{
        const b = optionButton({...o, model:'p5_prazo'});
        b.addEventListener('click', ()=>{ state.form.p5_prazo=o.value; render(); });
        w.querySelector('.grid').appendChild(b);
      });
      c.appendChild(w);
    }
  }, 120);
}

// ===== Próximo / Voltar =====
async function next(){
  if(state.step===1){
    const e = {};
    if(!state.form.nome.trim()) e.nome='Nome obrigatório';
    if(!state.form.email.trim() || !validateEmail(state.form.email)) e.email='E-mail inválido';
    if(!state.form.telefone.trim()) e.telefone='Telefone obrigatório';
    else if(!validatePhone(state.form.telefone)) e.telefone='Telefone inválido';
    if(!state.form.empresa.trim()) e.empresa='Empresa obrigatória';
    if(!state.form.cnpj.trim() || !validateCNPJ(state.form.cnpj)) e.cnpj='CNPJ obrigatório (14 dígitos)';
    if(!state.form.consentimento_lgpd) e.lgpd='Necessário aceitar os termos';
    state.errors = e;
    if(Object.keys(e).length){ render(); return; }
  }

  // Avança etapas até a última
  if(state.step < getTotalSteps()){ state.step++; render(); return; }

  // Final: SEMPRE envia (mesmo desalinhado)
  let classificacao = 'desalinhado';
  let prioridade = 'nenhuma';
  if(!(state.form.p1_tipo==='B' || state.form.p2_garantia==='B')){
    const r = classifyLead();
    classificacao = r.classificacao;
    prioridade = r.prioridade;
  }

  const payload = { ...state.form, classificacao, prioridade, created_at: new Date().toISOString() };
  persistLocal(payload);

  try{
    const resp = await sendEmailServer(payload);
    console.log('Envio OK', resp);
  }catch(err){
    console.error('Falha no envio', err);
    showError('Não foi possível enviar o e-mail agora: ' + (err?.message || 'erro desconhecido'));
  }

  let type='desalinhado';
  if(classificacao==='ceo_ready') type='ceo_ready';
  else if(classificacao==='especialista') type='especialista';
  else if(classificacao==='nutricao') type='nutricao';
  state.result = { type };
  render();
}

function back(){ if(state.step>1){ state.step--; render(); } }

// ===== Init =====
function init(){
  const p = new URLSearchParams(location.search);
  state.form.utm_source = p.get('utm_source') || '';
  state.form.utm_medium = p.get('utm_medium') || '';
  state.form.utm_campaign = p.get('utm_campaign') || '';

  document.getElementById('btnNext').addEventListener('click', next);
  document.getElementById('btnBack').addEventListener('click', back);
  document.getElementById('year').textContent = new Date().getFullYear();
  render();
}
document.addEventListener('DOMContentLoaded', init);

// ===== Confetti =====
function confetti(){
  const canvas = document.getElementById('confetti');
  const ctx = canvas.getContext('2d');
  const W = canvas.width = innerWidth;
  const H = canvas.height = innerHeight;
  const N = 140;
  const parts = Array.from({length:N}, ()=> ({
    x: Math.random()*W, y: -10, r: 2+Math.random()*3, vy: 2+Math.random()*3, vx:-2+Math.random()*4, a: Math.random()*Math.PI
  }));
  let frame = 0, maxFrames = 180;
  function tick(){
    ctx.clearRect(0,0,W,H);
    parts.forEach(p=>{
      p.x += p.vx; p.y += p.vy; p.a += .03;
      ctx.globalAlpha = .9;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
    });
    frame++;
    if(frame<maxFrames) requestAnimationFrame(tick);
    else ctx.clearRect(0,0,W,H);
  }
  tick();
}
