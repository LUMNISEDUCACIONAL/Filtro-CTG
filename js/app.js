// ===== CONFIGURAÇÕES =====
const FORMSUBMIT_EMAIL = 'gestormarketing@inteligenciacomercial.com';

// ===== MAPA DE PERGUNTAS (LEGÍVEL) =====
const QUESTIONS = {
  q1_segmento: {
    title: 'Segmento de atuação',
    options: [
      'FII, Asset, M&A Real Estate ou Family Office',
      'Construtora, Incorporadora ou Loteadora',
      'Banco de Investimento ou Crédito Estruturado',
      'Imobiliária de Luxo, Advocacia ou Contabilidade'
    ]
  },
  q2_funcao: {
    title: 'Função exercida',
    options: [
      'Sócio, Diretor ou Head de Real Estate',
      'Gerente Corporate / Consultor Sênior',
      'Broker ou Gerente de Expansão',
      'Outra função'
    ]
  },
  q3_acesso: {
    title: 'Acesso a ativos acima de R$ 100MM',
    options: [
      'Foco principal (portfólio > R$ 200MM)',
      'Recorrente e direto',
      'Ocasional',
      'Fora do foco'
    ]
  },
  q4_ativo: {
    title: 'Tipo de ativo predominante',
    options: [
      'Logístico / Industrial / Glebas',
      'Comercial / Varejo',
      'Rural',
      'Residencial de alto padrão'
    ]
  },
  q5_experiencia: {
    title: 'Experiência com operações estruturadas',
    options: [
      'Ampla experiência prática',
      'Experiência parcial',
      'Conhecimento teórico',
      'Sem familiaridade'
    ]
  }
};

// ===== HELPERS =====
const $ = (q) => document.querySelector(q);
const el = (html) => {
  const d = document.createElement('div');
  d.innerHTML = html.trim();
  return d.firstElementChild;
};

// ===== ESTADO =====
const TOTAL_STEPS = 6;
const state = {
  step: 1,
  form: {
    nome: '',
    email: '',
    telefone: '',
    lgpd: false,
    q1_segmento: null,
    q2_funcao: null,
    q3_acesso: null,
    q4_ativo: null,
    q5_experiencia: null
  }
};

// ===== VALIDAÇÕES =====
const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const validatePhone = (v) => String(v || '').replace(/\D/g, '').length >= 10;

// ===== PROGRESSO =====
function updProgress() {
  $('#etapaAtual').textContent = state.step;
  $('#etapasTotal').textContent = TOTAL_STEPS;
  const pct = Math.round((state.step / TOTAL_STEPS) * 100);
  $('#pct').textContent = pct;
  $('#barra').style.width = pct + '%';
}

// ===== RENDER =====
function render() {
  updProgress();
  const c = $('#content');
  c.innerHTML = '';

  $('#btnBack').classList.toggle('hidden', state.step === 1);
  $('#btnNext').textContent = state.step < TOTAL_STEPS ? 'Próximo' : 'Concluir';

  if (state.step === 1) {
    c.appendChild(el(`
      <div class="space-y-4">
        <h2 class="text-2xl font-black text-b44">Seus dados de contato</h2>
        <input id="nome" class="w-full border p-3 rounded-xl" placeholder="Nome completo">
        <input id="email" class="w-full border p-3 rounded-xl" placeholder="E-mail">
        <input id="tel" class="w-full border p-3 rounded-xl" placeholder="Telefone / WhatsApp">
        <label class="flex items-center gap-2 text-sm">
          <input type="checkbox" id="lgpd"> Autorizo o uso dos dados conforme a LGPD
        </label>
        <div id="err" class="text-red-600 text-sm"></div>
      </div>
    `));

    nome.value = state.form.nome;
    email.value = state.form.email;
    tel.value = state.form.telefone;
    lgpd.checked = state.form.lgpd;

    nome.oninput = e => state.form.nome = e.target.value;
    email.oninput = e => state.form.email = e.target.value;
    tel.oninput = e => state.form.telefone = e.target.value;
    lgpd.onchange = e => state.form.lgpd = e.target.checked;
  }

  if (state.step === 2) renderQuestion('q1_segmento');
  if (state.step === 3) renderQuestion('q2_funcao');
  if (state.step === 4) renderQuestion('q3_acesso');
  if (state.step === 5) renderQuestion('q4_ativo');
  if (state.step === 6) renderQuestion('q5_experiencia');
}

// ===== COMPONENTE DE PERGUNTA =====
function renderQuestion(key) {
  const q = QUESTIONS[key];
  const c = $('#content');

  const wrap = el(`<div class="space-y-3">
    <h2 class="text-xl font-black text-b44">${q.title}</h2>
  </div>`);

  q.options.forEach((opt, i) => {
    const btn = el(`
      <button class="w-full text-left p-4 rounded-xl border
        ${state.form[key] === i ? 'border-b44 bg-b44/10' : 'border-gray-300'}">
        <strong>${String.fromCharCode(65 + i)}.</strong> ${opt}
      </button>
    `);
    btn.onclick = () => {
      state.form[key] = i;
      render();
    };
    wrap.appendChild(btn);
  });

  c.appendChild(wrap);
}

// ===== ENVIO DE E-MAIL (FORMATADO) =====
async function sendEmail() {
  const data = new FormData();

  data.append('Nome', state.form.nome);
  data.append('E-mail', state.form.email);
  data.append('Telefone', state.form.telefone);

  Object.entries(QUESTIONS).forEach(([key, q]) => {
    const idx = state.form[key];
    if (idx !== null) {
      data.append(
        q.title,
        `${String.fromCharCode(65 + idx)} — ${q.options[idx]}`
      );
    }
  });

  data.append('_subject', 'Novo Lead – Qualificação Parceiros CTG');
  data.append('_template', 'table');
  data.append('_captcha', 'false');

  await fetch(`https://formsubmit.co/ajax/${FORMSUBMIT_EMAIL}`, {
    method: 'POST',
    body: data,
    headers: { Accept: 'application/json' }
  });
}

// ===== NAVEGAÇÃO =====
async function next() {
  if (state.step === 1) {
    if (
      !state.form.nome ||
      !validateEmail(state.form.email) ||
      !validatePhone(state.form.telefone) ||
      !state.form.lgpd
    ) {
      $('#err').textContent = 'Preencha corretamente todos os campos.';
      return;
    }
  }

  if (state.step < TOTAL_STEPS) {
    state.step++;
    render();
    return;
  }

  // FINAL
  await sendEmail();

  $('#content').innerHTML = `
    <div class="text-center">
      <h2 class="text-2xl font-black text-b44">Obrigado!</h2>
      <p class="mt-2">Recebemos suas informações com sucesso.</p>
    </div>
  `;
  $('#btnNext').classList.add('hidden');
  $('#btnBack').classList.add('hidden');
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  $('#btnNext').onclick = next;
  $('#btnBack').onclick = () => {
    if (state.step > 1) { state.step--; render(); }
  };
  $('#year').textContent = new Date().getFullYear();
  render();
});
