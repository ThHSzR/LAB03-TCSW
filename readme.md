# 📚 Plataforma de Cursos Online — LAB03

Aplicação web front-end desenvolvida como atividade laboratorial, simulando o gerenciamento acadêmico e financeiro de uma plataforma de cursos online.

## 🛠️ Tecnologias Utilizadas

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap_5-7952B3?style=flat&logo=bootstrap&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript_ES6+-F7DF1E?style=flat&logo=javascript&logoColor=black)

- **HTML5** — Estrutura semântica das páginas
- **Bootstrap 5** — Layout responsivo (Grid, Cards, Navbar, Tabelas)
- **JavaScript ES6+** — Classes, Funções, Eventos DOM e persistência em memória

## 📁 Estrutura do Projeto

```
lab03/
├── index.html   # Estrutura principal com Navbar e Sidebar
├── app.js       # Classes JS, lógica de negócio e eventos
├── style.css    # Estilos customizados
└── README.md
```

## ⚙️ Como Executar

Não requer instalação de dependências ou servidor.

1. Clone ou baixe os arquivos do repositório
2. Certifique-se de que os três arquivos estão na mesma pasta
3. Abra o arquivo `index.html` diretamente no navegador

**Opção recomendada (VS Code):**
- Instale a extensão [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
- Clique com botão direito em `index.html` → **Open with Live Server**

## 📋 Funcionalidades

### Módulo Acadêmico

| Seção | Descrição |
|---|---|
| Usuários | Cadastro com validação de e-mail único e hash de senha |
| Categorias | Criação de categorias com nome único |
| Cursos | Cadastro com filtro por categoria, nível e instrutor |
| Módulos | Vinculação a cursos com ordenação |
| Aulas | Tipos: Vídeo, Texto ou Quiz, com URL e duração |

### Módulo de Progresso

| Seção | Descrição |
|---|---|
| Matrículas | Registro com bloqueio de duplicata |
| Progresso | Marcação de conclusão por aula/usuário |
| Certificados | Geração com código único de verificação |
| Avaliações | Notas de 1 a 5 estrelas com comentário |
| Trilhas | Agrupamento de cursos com ordem definida |

### Módulo Financeiro

| Seção | Descrição |
|---|---|
| Planos | Cadastro com preço e duração em meses |
| Assinaturas | Checkout com cálculo automático de DataFim |
| Pagamentos | Registro com método de pagamento e ID de transação gerado |

## 🗄️ Modelo de Dados

O sistema simula 13 entidades em memória:

`Usuarios` · `Categorias` · `Cursos` · `Modulos` · `Aulas` · `Matriculas` ·
`ProgressoAulas` · `Avaliacoes` · `Trilhas` · `TrilhasCursos` · `Certificados` ·
`Planos` · `Assinaturas` · `Pagamentos`

> ⚠️ Os dados são mantidos apenas durante a sessão do navegador (sem banco de dados ou localStorage).

## 👨‍💻 Autor

Desenvolvido por: 
- [Thiago Henrique](github.com/ThHSzR)
- [Mateus Afonso](github.com/IsMateusReal)
- [Guilherme Aguiar](github.com/GuilhermeAgu1ar)

Curso: Engenharia de Computação · PUC-GO
