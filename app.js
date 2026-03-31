'use strict';

// ===== CLASSES =====
class Usuario {
  constructor(id, nomeCompleto, email, senhaHash, dataCadastro) {
    this.id = id; this.nomeCompleto = nomeCompleto; this.email = email;
    this.senhaHash = senhaHash; this.dataCadastro = dataCadastro;
  }
}
class Categoria {
  constructor(id, nome, descricao) { this.id=id; this.nome=nome; this.descricao=descricao; }
}
class Curso {
  constructor(id,titulo,descricao,idInstrutor,idCategoria,nivel,dataPublicacao,totalAulas,totalHoras) {
    Object.assign(this,{id,titulo,descricao,idInstrutor,idCategoria,nivel,dataPublicacao,totalAulas,totalHoras});
  }
}
class Modulo {
  constructor(id,idCurso,titulo,ordem) { Object.assign(this,{id,idCurso,titulo,ordem}); }
}
class Aula {
  constructor(id,idModulo,titulo,tipoConteudo,urlConteudo,duracaoMinutos,ordem) {
    Object.assign(this,{id,idModulo,titulo,tipoConteudo,urlConteudo,duracaoMinutos,ordem});
  }
}
class Matricula {
  constructor(id,idUsuario,idCurso,dataMatricula,dataConclusao) {
    Object.assign(this,{id,idUsuario,idCurso,dataMatricula,dataConclusao:dataConclusao||null});
  }
}
class ProgressoAula {
  constructor(idUsuario,idAula,dataConclusao,status) {
    Object.assign(this,{idUsuario,idAula,dataConclusao,status});
  }
}
class Avaliacao {
  constructor(id,idUsuario,idCurso,nota,comentario,dataAvaliacao) {
    Object.assign(this,{id,idUsuario,idCurso,nota,comentario:comentario||'',dataAvaliacao});
  }
}
class Trilha {
  constructor(id,titulo,descricao,idCategoria) { Object.assign(this,{id,titulo,descricao,idCategoria}); }
}
class TrilhaCurso {
  constructor(idTrilha,idCurso,ordem) { Object.assign(this,{idTrilha,idCurso,ordem}); }
}
class Certificado {
  constructor(id,idUsuario,idCurso,idTrilha,codigoVerificacao,dataEmissao) {
    Object.assign(this,{id,idUsuario,idCurso,idTrilha:idTrilha||null,codigoVerificacao,dataEmissao});
  }
}
class Plano {
  constructor(id,nome,descricao,preco,duracaoMeses) {
    Object.assign(this,{id,nome,descricao,preco,duracaoMeses});
  }
}
class Assinatura {
  constructor(id,idUsuario,idPlano,dataInicio,dataFim) {
    Object.assign(this,{id,idUsuario,idPlano,dataInicio,dataFim});
  }
}
class Pagamento {
  constructor(id,idAssinatura,valorPago,dataPagamento,metodoPagamento,idTransacaoGateway) {
    Object.assign(this,{id,idAssinatura,valorPago,dataPagamento,metodoPagamento,idTransacaoGateway});
  }
}

// ===== DATABASE =====
const db = {
  usuarios:[],categorias:[],cursos:[],modulos:[],aulas:[],
  matriculas:[],progressoAulas:[],avaliacoes:[],trilhas:[],
  trilhasCursos:[],certificados:[],planos:[],assinaturas:[],pagamentos:[]
};
const cnt = {usuario:1,categoria:1,curso:1,modulo:1,aula:1,matricula:1,
             avaliacao:1,trilha:1,certificado:1,plano:1,assinatura:1,pagamento:1};

// ===== HELPERS =====
const nid = k => cnt[k]++;
const today = () => new Date().toISOString().split('T')[0];
const genCode = () => 'CERT-'+Math.random().toString(36).substr(2,8).toUpperCase();
const genTxn  = () => 'TXN-' +Math.random().toString(36).substr(2,10).toUpperCase();
const hashPwd = p => btoa(unescape(encodeURIComponent(p)));
const getById = (arr,id) => arr.find(x=>x.id===id);
const getLabel = (arr,id) => { const o=getById(arr,id); return o?(o.nomeCompleto||o.titulo||o.nome):'-'; };

function showAlert(msg, type, cid) {
  const c = document.getElementById(cid); if(!c) return;
  c.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show py-2 mb-0">
    ${msg}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`;
  setTimeout(()=>{ c.innerHTML=''; },5000);
}

function populateSelect(selId, arr, labelFn, empty=true) {
  const sel=document.getElementById(selId); if(!sel) return;
  const prev=sel.value;
  sel.innerHTML = empty?'<option value="">Selecione...</option>':'';
  arr.forEach(item=>{
    const o=document.createElement('option');
    o.value=item.id; o.textContent=labelFn(item); sel.appendChild(o);
  });
  sel.value=prev;
}

function showSection(id) {
  document.querySelectorAll('.content-section').forEach(s=>s.classList.add('d-none'));
  document.getElementById(id).classList.remove('d-none');
  document.querySelectorAll('.sidebar .nav-link').forEach(l=>l.classList.remove('active'));
  const lk=document.querySelector(`.sidebar .nav-link[data-section="${id}"]`);
  if(lk) lk.classList.add('active');
  refreshAll(); renderDashboard();
}

function refreshAll() {
  populateSelect('c-instrutor', db.usuarios, u=>u.nomeCompleto);
  populateSelect('c-categoria', db.categorias, c=>c.nome);
  populateSelect('m-curso', db.cursos, c=>c.titulo);
  populateSelect('a-modulo', db.modulos, m=>`[C${m.idCurso}] ${m.titulo}`);
  populateSelect('mat-usuario', db.usuarios, u=>u.nomeCompleto);
  populateSelect('mat-curso', db.cursos, c=>c.titulo);
  populateSelect('prog-usuario', db.usuarios, u=>u.nomeCompleto);
  populateSelect('prog-aula', db.aulas, a=>`[M${a.idModulo}] ${a.titulo}`);
  populateSelect('cert-usuario', db.usuarios, u=>u.nomeCompleto);
  populateSelect('cert-curso', db.cursos, c=>c.titulo);
  populateSelect('av-usuario', db.usuarios, u=>u.nomeCompleto);
  populateSelect('av-curso', db.cursos, c=>c.titulo);
  populateSelect('tr-categoria', db.categorias, c=>c.nome);
  populateSelect('tc-trilha', db.trilhas, t=>t.titulo);
  populateSelect('tc-curso', db.cursos, c=>c.titulo);
  populateSelect('ass-usuario', db.usuarios, u=>u.nomeCompleto);
  populateSelect('ass-plano', db.planos, p=>`${p.nome} — R$ ${Number(p.preco).toFixed(2)}`);
  populateSelect('pag-assinatura', db.assinaturas,
    a=>`#${a.id} ${getLabel(db.usuarios,a.idUsuario)} / ${getLabel(db.planos,a.idPlano)}`);
  populateSelect('filtro-categoria', db.categorias, c=>c.nome);
}

// ===== DASHBOARD =====
function renderDashboard() {
  const m=[['dash-u',db.usuarios.length],['dash-c',db.cursos.length],
           ['dash-m',db.matriculas.length],['dash-cert',db.certificados.length],
           ['dash-pl',db.planos.length],['dash-pg',db.pagamentos.length]];
  m.forEach(([id,v])=>{ const el=document.getElementById(id); if(el) el.textContent=v; });
}

// ===== USUARIOS =====
function setupUsuarios() {
  document.getElementById('form-usuario').addEventListener('submit', e=>{
    e.preventDefault();
    const nome=document.getElementById('u-nome').value.trim();
    const email=document.getElementById('u-email').value.trim();
    const senha=document.getElementById('u-senha').value;
    if(!nome||!email||!senha) return showAlert('Preencha todos os campos obrigatórios.','danger','alrt-usuarios');
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showAlert('E-mail inválido.','danger','alrt-usuarios');
    if(db.usuarios.some(u=>u.email===email)) return showAlert('E-mail já cadastrado.','danger','alrt-usuarios');
    db.usuarios.push(new Usuario(nid('usuario'),nome,email,hashPwd(senha),today()));
    e.target.reset(); renderUsuarios(); refreshAll();
    showAlert('✅ Usuário cadastrado com sucesso!','success','alrt-usuarios');
  });
  document.getElementById('u-busca').addEventListener('input', e=>renderUsuarios(e.target.value));
}
function renderUsuarios(f='') {
  const list=f?db.usuarios.filter(u=>u.nomeCompleto.toLowerCase().includes(f.toLowerCase())||u.email.toLowerCase().includes(f.toLowerCase())):db.usuarios;
  document.getElementById('tbody-usuarios').innerHTML=list.map(u=>`
    <tr><td>${u.id}</td><td>${u.nomeCompleto}</td><td>${u.email}</td><td>${u.dataCadastro}</td>
    <td><button class="btn btn-sm btn-outline-danger" onclick="removeItem('usuarios',${u.id});renderUsuarios();refreshAll()"><i class="bi bi-trash3"></i></button></td></tr>`).join('');
}

// ===== CATEGORIAS =====
function setupCategorias() {
  document.getElementById('form-categoria').addEventListener('submit', e=>{
    e.preventDefault();
    const nome=document.getElementById('cat-nome').value.trim();
    const desc=document.getElementById('cat-desc').value.trim();
    if(!nome) return showAlert('Nome é obrigatório.','danger','alrt-categorias');
    if(db.categorias.some(c=>c.nome.toLowerCase()===nome.toLowerCase()))
      return showAlert('Categoria já existe.','danger','alrt-categorias');
    db.categorias.push(new Categoria(nid('categoria'),nome,desc));
    e.target.reset(); renderCategorias(); refreshAll();
    showAlert('✅ Categoria cadastrada!','success','alrt-categorias');
  });
}
function renderCategorias() {
  document.getElementById('tbody-categorias').innerHTML=db.categorias.map(c=>`
    <tr><td>${c.id}</td><td>${c.nome}</td><td>${c.descricao||'—'}</td>
    <td><button class="btn btn-sm btn-outline-danger" onclick="removeItem('categorias',${c.id});renderCategorias();refreshAll()"><i class="bi bi-trash3"></i></button></td></tr>`).join('');
}

// ===== CURSOS =====
function setupCursos() {
  document.getElementById('form-curso').addEventListener('submit', e=>{
    e.preventDefault();
    const titulo=document.getElementById('c-titulo').value.trim();
    const desc=document.getElementById('c-desc').value.trim();
    const idInstrutor=parseInt(document.getElementById('c-instrutor').value);
    const idCategoria=parseInt(document.getElementById('c-categoria').value);
    const nivel=document.getElementById('c-nivel').value;
    const dataPub=document.getElementById('c-datapub').value;
    const totalAulas=parseInt(document.getElementById('c-totalaulas').value)||0;
    const totalHoras=parseFloat(document.getElementById('c-totalhoras').value)||0;
    if(!titulo||!idInstrutor||!idCategoria||!nivel)
      return showAlert('Preencha: Título, Instrutor, Categoria e Nível.','danger','alrt-cursos');
    db.cursos.push(new Curso(nid('curso'),titulo,desc,idInstrutor,idCategoria,nivel,dataPub,totalAulas,totalHoras));
    e.target.reset(); renderCursos(); refreshAll();
    showAlert('✅ Curso cadastrado!','success','alrt-cursos');
  });
  document.getElementById('filtro-categoria').addEventListener('change',()=>renderCursos());
}
function renderCursos() {
  const f=parseInt(document.getElementById('filtro-categoria').value)||0;
  const list=f?db.cursos.filter(c=>c.idCategoria===f):db.cursos;
  const badge={Iniciante:'bg-success',Intermediário:'bg-warning text-dark',Avançado:'bg-danger'};
  document.getElementById('tbody-cursos').innerHTML=list.map(c=>`
    <tr><td>${c.id}</td><td><strong>${c.titulo}</strong></td>
    <td>${getLabel(db.usuarios,c.idInstrutor)}</td>
    <td>${getLabel(db.categorias,c.idCategoria)}</td>
    <td><span class="badge ${badge[c.nivel]||'bg-secondary'}">${c.nivel}</span></td>
    <td>${c.dataPublicacao||'—'}</td><td>${c.totalAulas}</td><td>${c.totalHoras}h</td>
    <td><button class="btn btn-sm btn-outline-danger" onclick="removeItem('cursos',${c.id});renderCursos();refreshAll()"><i class="bi bi-trash3"></i></button></td></tr>`).join('');
}

// ===== MODULOS =====
function setupModulos() {
  document.getElementById('form-modulo').addEventListener('submit', e=>{
    e.preventDefault();
    const idCurso=parseInt(document.getElementById('m-curso').value);
    const titulo=document.getElementById('m-titulo').value.trim();
    const ordem=parseInt(document.getElementById('m-ordem').value);
    if(!idCurso||!titulo||!ordem) return showAlert('Preencha todos os campos.','danger','alrt-modulos');
    db.modulos.push(new Modulo(nid('modulo'),idCurso,titulo,ordem));
    e.target.reset(); renderModulos(); refreshAll();
    showAlert('✅ Módulo adicionado!','success','alrt-modulos');
  });
}
function renderModulos() {
  document.getElementById('tbody-modulos').innerHTML=
    [...db.modulos].sort((a,b)=>a.idCurso-b.idCurso||a.ordem-b.ordem).map(m=>`
    <tr><td>${m.id}</td><td>${getLabel(db.cursos,m.idCurso)}</td>
    <td>${m.titulo}</td><td>${m.ordem}</td>
    <td><button class="btn btn-sm btn-outline-danger" onclick="removeItem('modulos',${m.id});renderModulos();refreshAll()"><i class="bi bi-trash3"></i></button></td></tr>`).join('');
}

// ===== AULAS =====
function setupAulas() {
  document.getElementById('form-aula').addEventListener('submit', e=>{
    e.preventDefault();
    const idModulo=parseInt(document.getElementById('a-modulo').value);
    const titulo=document.getElementById('a-titulo').value.trim();
    const tipo=document.getElementById('a-tipo').value;
    const url=document.getElementById('a-url').value.trim();
    const dur=parseInt(document.getElementById('a-duracao').value)||0;
    const ordem=parseInt(document.getElementById('a-ordem').value);
    if(!idModulo||!titulo||!tipo||!ordem) return showAlert('Preencha os campos obrigatórios.','danger','alrt-aulas');
    db.aulas.push(new Aula(nid('aula'),idModulo,titulo,tipo,url,dur,ordem));
    e.target.reset(); renderAulas(); refreshAll();
    showAlert('✅ Aula adicionada!','success','alrt-aulas');
  });
}
function renderAulas() {
  const tipoCor={Vídeo:'bg-primary',Texto:'bg-secondary',Quiz:'bg-warning text-dark'};
  document.getElementById('tbody-aulas').innerHTML=
    [...db.aulas].sort((a,b)=>a.idModulo-b.idModulo||a.ordem-b.ordem).map(a=>{
      const mod=getById(db.modulos,a.idModulo);
      return `<tr><td>${a.id}</td>
        <td>${mod?getLabel(db.cursos,mod.idCurso):'—'}</td>
        <td>${mod?mod.titulo:'—'}</td><td>${a.titulo}</td>
        <td><span class="badge ${tipoCor[a.tipoConteudo]||'bg-dark'}">${a.tipoConteudo}</span></td>
        <td>${a.duracaoMinutos} min</td><td>${a.ordem}</td>
        <td><button class="btn btn-sm btn-outline-danger" onclick="removeItem('aulas',${a.id});renderAulas();refreshAll()"><i class="bi bi-trash3"></i></button></td></tr>`;
    }).join('');
}

// ===== MATRÍCULAS =====
function setupMatriculas() {
  document.getElementById('form-matricula').addEventListener('submit', e=>{
    e.preventDefault();
    const idU=parseInt(document.getElementById('mat-usuario').value);
    const idC=parseInt(document.getElementById('mat-curso').value);
    const dt=document.getElementById('mat-data').value||today();
    if(!idU||!idC) return showAlert('Selecione usuário e curso.','danger','alrt-matriculas');
    if(db.matriculas.some(m=>m.idUsuario===idU&&m.idCurso===idC))
      return showAlert('Usuário já matriculado neste curso.','warning','alrt-matriculas');
    db.matriculas.push(new Matricula(nid('matricula'),idU,idC,dt,null));
    e.target.reset(); renderMatriculas(); refreshAll();
    showAlert('✅ Matrícula realizada!','success','alrt-matriculas');
  });
}
function renderMatriculas() {
  document.getElementById('tbody-matriculas').innerHTML=db.matriculas.map(m=>`
    <tr><td>${m.id}</td><td>${getLabel(db.usuarios,m.idUsuario)}</td>
    <td>${getLabel(db.cursos,m.idCurso)}</td><td>${m.dataMatricula}</td>
    <td>${m.dataConclusao?`<span class="badge bg-success">${m.dataConclusao}</span>`:'<span class="badge bg-warning text-dark">Em andamento</span>'}</td>
    <td><button class="btn btn-sm btn-outline-danger" onclick="removeItem('matriculas',${m.id});renderMatriculas()"><i class="bi bi-trash3"></i></button></td></tr>`).join('');
}

// ===== PROGRESSO =====
function setupProgresso() {
  document.getElementById('form-progresso').addEventListener('submit', e=>{
    e.preventDefault();
    const idU=parseInt(document.getElementById('prog-usuario').value);
    const idA=parseInt(document.getElementById('prog-aula').value);
    const status=document.getElementById('prog-status').value;
    if(!idU||!idA) return showAlert('Selecione usuário e aula.','danger','alrt-progresso');
    const ex=db.progressoAulas.find(p=>p.idUsuario===idU&&p.idAula===idA);
    if(ex){ex.status=status;ex.dataConclusao=today();}
    else db.progressoAulas.push(new ProgressoAula(idU,idA,today(),status));
    e.target.reset(); renderProgresso();
    showAlert('✅ Progresso registrado!','success','alrt-progresso');
  });
  document.getElementById('form-certificado').addEventListener('submit', e=>{
    e.preventDefault();
    const idU=parseInt(document.getElementById('cert-usuario').value);
    const idC=parseInt(document.getElementById('cert-curso').value);
    if(!idU||!idC) return showAlert('Selecione usuário e curso.','danger','alrt-certificados');
    if(db.certificados.some(c=>c.idUsuario===idU&&c.idCurso===idC))
      return showAlert('Certificado já emitido.','warning','alrt-certificados');
    const cert=new Certificado(nid('certificado'),idU,idC,null,genCode(),today());
    db.certificados.push(cert);
    const mat=db.matriculas.find(m=>m.idUsuario===idU&&m.idCurso===idC);
    if(mat) mat.dataConclusao=today();
    e.target.reset(); renderCertificados(); renderMatriculas();
    showAlert(`🎓 Certificado emitido! Código: <strong>${cert.codigoVerificacao}</strong>`,'success','alrt-certificados');
  });
}
function renderProgresso() {
  document.getElementById('tbody-progresso').innerHTML=db.progressoAulas.map(p=>{
    const a=getById(db.aulas,p.idAula);
    return `<tr><td>${getLabel(db.usuarios,p.idUsuario)}</td>
      <td>${a?a.titulo:p.idAula}</td>
      <td><span class="badge bg-success">${p.status}</span></td>
      <td>${p.dataConclusao}</td></tr>`;
  }).join('');
}
function renderCertificados() {
  document.getElementById('tbody-certificados').innerHTML=db.certificados.map(c=>`
    <tr><td>${c.id}</td><td>${getLabel(db.usuarios,c.idUsuario)}</td>
    <td>${getLabel(db.cursos,c.idCurso)}</td>
    <td><code class="text-success fw-bold">${c.codigoVerificacao}</code></td>
    <td>${c.dataEmissao}</td></tr>`).join('');
}

// ===== AVALIAÇÕES =====
function setupAvaliacoes() {
  document.getElementById('form-avaliacao').addEventListener('submit', e=>{
    e.preventDefault();
    const idU=parseInt(document.getElementById('av-usuario').value);
    const idC=parseInt(document.getElementById('av-curso').value);
    const nota=parseInt(document.getElementById('av-nota').value);
    const coment=document.getElementById('av-comentario').value.trim();
    if(!idU||!idC||!nota) return showAlert('Preencha usuário, curso e nota.','danger','alrt-avaliacoes');
    db.avaliacoes.push(new Avaliacao(nid('avaliacao'),idU,idC,nota,coment,today()));
    e.target.reset(); renderAvaliacoes();
    showAlert('✅ Avaliação registrada!','success','alrt-avaliacoes');
  });
}
function renderAvaliacoes() {
  document.getElementById('tbody-avaliacoes').innerHTML=db.avaliacoes.map(a=>`
    <tr><td>${a.id}</td><td>${getLabel(db.usuarios,a.idUsuario)}</td>
    <td>${getLabel(db.cursos,a.idCurso)}</td>
    <td>${'⭐'.repeat(a.nota)}</td><td>${a.comentario||'—'}</td>
    <td>${a.dataAvaliacao}</td></tr>`).join('');
}

// ===== TRILHAS =====
function setupTrilhas() {
  document.getElementById('form-trilha').addEventListener('submit', e=>{
    e.preventDefault();
    const titulo=document.getElementById('tr-titulo').value.trim();
    const desc=document.getElementById('tr-desc').value.trim();
    const idCat=parseInt(document.getElementById('tr-categoria').value)||null;
    if(!titulo) return showAlert('Título obrigatório.','danger','alrt-trilhas');
    db.trilhas.push(new Trilha(nid('trilha'),titulo,desc,idCat));
    e.target.reset(); renderTrilhas(); refreshAll();
    showAlert('✅ Trilha criada!','success','alrt-trilhas');
  });
  document.getElementById('form-trilha-curso').addEventListener('submit', e=>{
    e.preventDefault();
    const idT=parseInt(document.getElementById('tc-trilha').value);
    const idC=parseInt(document.getElementById('tc-curso').value);
    const ordem=parseInt(document.getElementById('tc-ordem').value);
    if(!idT||!idC||!ordem) return showAlert('Preencha todos os campos.','danger','alrt-trilhas-cursos');
    if(db.trilhasCursos.some(tc=>tc.idTrilha===idT&&tc.idCurso===idC))
      return showAlert('Curso já associado a esta trilha.','warning','alrt-trilhas-cursos');
    db.trilhasCursos.push(new TrilhaCurso(idT,idC,ordem));
    e.target.reset(); renderTrilhasCursos();
    showAlert('✅ Curso associado à trilha!','success','alrt-trilhas-cursos');
  });
}
function renderTrilhas() {
  document.getElementById('tbody-trilhas').innerHTML=db.trilhas.map(t=>`
    <tr><td>${t.id}</td><td>${t.titulo}</td><td>${t.descricao||'—'}</td>
    <td>${t.idCategoria?getLabel(db.categorias,t.idCategoria):'—'}</td>
    <td><button class="btn btn-sm btn-outline-danger" onclick="removeItem('trilhas',${t.id});renderTrilhas();refreshAll()"><i class="bi bi-trash3"></i></button></td></tr>`).join('');
}
function renderTrilhasCursos() {
  document.getElementById('tbody-trilhas-cursos').innerHTML=
    [...db.trilhasCursos].sort((a,b)=>a.idTrilha-b.idTrilha||a.ordem-b.ordem).map(tc=>`
    <tr><td>${getLabel(db.trilhas,tc.idTrilha)}</td>
    <td>${getLabel(db.cursos,tc.idCurso)}</td><td>${tc.ordem}</td></tr>`).join('');
}

// ===== PLANOS =====
function setupPlanos() {
  document.getElementById('form-plano').addEventListener('submit', e=>{
    e.preventDefault();
    const nome=document.getElementById('pl-nome').value.trim();
    const desc=document.getElementById('pl-desc').value.trim();
    const preco=parseFloat(document.getElementById('pl-preco').value);
    const dur=parseInt(document.getElementById('pl-duracao').value);
    if(!nome||!preco||!dur) return showAlert('Preencha nome, preço e duração.','danger','alrt-planos');
    db.planos.push(new Plano(nid('plano'),nome,desc,preco,dur));
    e.target.reset(); renderPlanos(); refreshAll();
    showAlert('✅ Plano criado!','success','alrt-planos');
  });
}
function renderPlanos() {
  document.getElementById('tbody-planos').innerHTML=db.planos.map(p=>`
    <tr><td>${p.id}</td><td>${p.nome}</td><td>${p.descricao||'—'}</td>
    <td>R$ ${Number(p.preco).toFixed(2)}</td>
    <td>${p.duracaoMeses} ${p.duracaoMeses===1?'mês':'meses'}</td>
    <td><button class="btn btn-sm btn-outline-danger" onclick="removeItem('planos',${p.id});renderPlanos();refreshAll()"><i class="bi bi-trash3"></i></button></td></tr>`).join('');
}

// ===== ASSINATURAS =====
function setupAssinaturas() {
  document.getElementById('form-assinatura').addEventListener('submit', e=>{
    e.preventDefault();
    const idU=parseInt(document.getElementById('ass-usuario').value);
    const idP=parseInt(document.getElementById('ass-plano').value);
    const dtInicio=document.getElementById('ass-inicio').value||today();
    if(!idU||!idP) return showAlert('Selecione usuário e plano.','danger','alrt-assinaturas');
    const plano=getById(db.planos,idP);
    const fim=new Date(dtInicio); fim.setMonth(fim.getMonth()+plano.duracaoMeses);
    const dtFim=fim.toISOString().split('T')[0];
    db.assinaturas.push(new Assinatura(nid('assinatura'),idU,idP,dtInicio,dtFim));
    e.target.reset(); renderAssinaturas(); refreshAll();
    showAlert(`✅ Assinatura criada! Válida até ${dtFim}`,'success','alrt-assinaturas');
  });
}
function renderAssinaturas() {
  document.getElementById('tbody-assinaturas').innerHTML=db.assinaturas.map(a=>`
    <tr><td>${a.id}</td><td>${getLabel(db.usuarios,a.idUsuario)}</td>
    <td>${getLabel(db.planos,a.idPlano)}</td>
    <td>${a.dataInicio}</td><td>${a.dataFim}</td></tr>`).join('');
}

// ===== PAGAMENTOS =====
function setupPagamentos() {
  document.getElementById('pag-assinatura').addEventListener('change',()=>{
    const id=parseInt(document.getElementById('pag-assinatura').value); if(!id) return;
    const ass=getById(db.assinaturas,id); if(!ass) return;
    const pl=getById(db.planos,ass.idPlano);
    if(pl) document.getElementById('pag-valor').value=pl.preco;
  });
  document.getElementById('form-pagamento').addEventListener('submit', e=>{
    e.preventDefault();
    const idAss=parseInt(document.getElementById('pag-assinatura').value);
    const valor=parseFloat(document.getElementById('pag-valor').value);
    const dt=document.getElementById('pag-data').value||today();
    const metodo=document.getElementById('pag-metodo').value;
    if(!idAss||!valor||!metodo) return showAlert('Preencha todos os campos.','danger','alrt-pagamentos');
    const txn=genTxn();
    db.pagamentos.push(new Pagamento(nid('pagamento'),idAss,valor,dt,metodo,txn));
    e.target.reset(); renderPagamentos(); renderDashboard();
    showAlert(`💳 Pagamento registrado! ID Transação: <strong>${txn}</strong>`,'success','alrt-pagamentos');
  });
}
function renderPagamentos() {
  document.getElementById('tbody-pagamentos').innerHTML=db.pagamentos.map(p=>{
    const ass=getById(db.assinaturas,p.idAssinatura);
    return `<tr><td>${p.id}</td>
      <td>#${p.idAssinatura} — ${ass?getLabel(db.usuarios,ass.idUsuario):'—'}</td>
      <td>R$ ${Number(p.valorPago).toFixed(2)}</td>
      <td>${p.dataPagamento}</td><td>${p.metodoPagamento}</td>
      <td><code class="text-primary">${p.idTransacaoGateway}</code></td></tr>`;
  }).join('');
}

// ===== UTIL =====
function removeItem(table, id) { db[table]=db[table].filter(x=>x.id!==id); renderDashboard(); }

// ===== INIT =====
document.addEventListener('DOMContentLoaded',()=>{
  setupUsuarios(); setupCategorias(); setupCursos(); setupModulos(); setupAulas();
  setupMatriculas(); setupProgresso(); setupAvaliacoes(); setupTrilhas();
  setupPlanos(); setupAssinaturas(); setupPagamentos();
  document.querySelectorAll('.sidebar .nav-link').forEach(lk=>{
    lk.addEventListener('click',e=>{ e.preventDefault(); showSection(lk.dataset.section); });
  });
  showSection('section-dashboard');
});
