<h1 align="center">💰 Plataforma de Controle Financeiro Pessoal</h1>

<h3 align="center">Gerencie contas, transações e relatórios – tudo online, rápido e seguro.</h3>

<p align="center">
Aplicação completa desenvolvida com <strong>Next.js, React, TypeScript, Prisma e PostgreSQL</strong>.  
Autenticação, dashboard interativo, filtros avançados, exportações e controle total das finanças.
</p>

<p align="center">
  <a href="https://plataforma-controle-financeiro.vercel.app/" target="_blank">
    🚀 <strong>Testar versão online (Deploy na Vercel)</strong>
  </a>
</p>

<br/>

<h2>Sobre o Projeto</h2>

<p>
Este projeto é uma solução completa de controle financeiro pessoal, desenvolvida com foco em:
</p>

<ul>
  <li>Experiência real de aplicação em produção</li>
  <li>Front-end e Back-end integrados</li>
  <li>Banco relacional profissional (PostgreSQL via Supabase)</li>
  <li>Autenticação robusta com recuperação de senha</li>
  <li>Dashboard dinâmico com gráficos</li>
  <li>Filtros avançados e relatórios financeiros</li>
  <li>Design responsivo e otimizado para mobile</li>
</ul>

<br/>

<h2>Tecnologias Utilizadas</h2>

<h3>Frontend</h3>
<ul>
  <li>React</li>
  <li>Next.js 14 (App Router)</li>
  <li>TypeScript</li>
  <li>CSS Modules</li>
  <li>Recharts (gráficos)</li>
</ul>

<h3>Backend</h3>
<ul>
  <li>Next.js API Routes</li>
  <li>Prisma ORM</li>
  <li>TypeScript</li>
  <li>Autenticação com JWT</li>
  <li>Validações e middlewares</li>
</ul>

<h3>Banco de Dados</h3>
<ul>
  <li>PostgreSQL (produção via Supabase)</li>
  <li>MySQL/PostgreSQL (desenvolvimento via Docker)</li>
  <li>DBBeaver (admin local)</li>
</ul>

<h3>Infra / DevOps</h3>
<ul>
  <li>Docker</li>
  <li>Supabase</li>
  <li>Vercel</li>
  <li>Mailtrap (testes de e-mail)</li>
  <li>Postman (testes da API)</li>
</ul>

<br/>

<h2>Arquitetura Geral da Aplicação</h2>

Next.js (Front-end)
|
|---> API Routes (Back-end)
| |-- Auth (login, registro, recuperação)
| |-- Accounts CRUD
| |-- Transactions CRUD
|
Prisma ORM
|
Supabase (PostgreSQL em produção)
Docker + MySQL/PostgreSQL (desenvolvimento local)
<br/>

<h2>Sistema de Autenticação</h2>

<ul>
  <li>Registro de novo usuário</li>
  <li>Login com JWT</li>
  <li>Rotas privadas protegidas</li>
  <li>Recuperação de senha com envio de e-mail</li>
  <li>Token seguro com expiração</li>
  <li>Middleware de autenticação no servidor</li>
</ul>

<br/>

<h2>Funcionalidades Principais</h2>

<h3>Dashboard</h3>
<ul>
  <li>Gráficos de entradas e saídas</li>
  <li>Resumo do mês</li>
  <li>Comparação entre períodos</li>
</ul>

<h3>Gerenciamento de Contas</h3>
<ul>
  <li>Adicionar, editar e excluir contas</li>
  <li>Tipos: Corrente, Poupança, Investimento…</li>
</ul>

<h3>Gerenciamento de Transações</h3>
<ul>
  <li>Entradas e saídas</li>
  <li>Categorias</li>
  <li>Filtros avançados</li>
</ul>

<h3>Filtros Inteligentes</h3>
<ul>
  <li>Diário</li>
  <li>Mensal</li>
  <li>Mensal agrupado</li>
  <li>Anual</li>
  <li>Personalizado</li>
</ul>

<h3>Configurações</h3>
<ul>
  <li>Trocar Nome, Email e Senha do Usuário</li>
</ul>

<h3>Responsividade Total</h3>
<ul>
  <li>Smartphones</li>
  <li>Tablets</li>
  <li>Desktop</li>
</ul>

<br/>

<h2>Prints da Aplicação</h2>

<h3> 1. Tela de Login e Registro</h3>
<img width="1872" height="916" alt="Captura de tela 2025-12-10 171651" src="https://github.com/user-attachments/assets/0f08f7d3-bfa5-4f3f-86f0-4192c554f204" />

<h3> 2. Dashboard - Versão Desktop</h3>
<img width="1856" height="914" alt="Captura de tela 2025-12-10 171956" src="https://github.com/user-attachments/assets/869a18ef-7df5-4d2d-b734-3d547e54371d" />

<h3 align="center"> 3. Dashboard - Mobile</h3>
<div align="center"> <img width="378" height="818" alt="Captura de tela 2025-12-10 172955" src="https://github.com/user-attachments/assets/60fb407b-1174-458b-986d-4db55556eb52" /></div>

<h3> 4. Gestão de Contas</h3>
<img width="1852" height="913" alt="Captura de tela 2025-12-10 173114" src="https://github.com/user-attachments/assets/0f9f2045-dcdc-4a3c-bf16-6c45067f1699" />

<h3> 5. Gestão de Transações</h3>
<img width="1857" height="912" alt="Captura de tela 2025-12-10 173223" src="https://github.com/user-attachments/assets/a9711f0b-9181-4aa7-b04b-7ea460966bbe" />

<h3> 6. Exportar Relatórios</h3>
<img width="1854" height="912" alt="Captura de tela 2025-12-10 173526" src="https://github.com/user-attachments/assets/576df060-a3d0-4eeb-9da0-94cf4fff9404" />
<br/>

<h2> Prints do Ambiente de Desenvolvimento</h2>

<h3> 1. Docker — Banco rodando localmente</h3>
<img width="1621" height="718" alt="Captura de tela 2025-12-10 174232" src="https://github.com/user-attachments/assets/15c01bc8-7c66-4018-93f4-c8813f3a45a8" />

<h3> 2. DBBeaver — Gerenciamento do BD</h3>
<img width="628" height="649" alt="Captura de tela 2025-12-10 174549" src="https://github.com/user-attachments/assets/de70daee-4e2e-43af-bd08-1be671ab4216" />

<h3> 3. Mailtrap — Recuperação de Senha</h3>
<ul>
  <li>E-mail enviado</li>
  <li>Tela de redefinição</li>
</ul>
<img width="1132" height="592" alt="Captura de tela 2025-12-10 175354" src="https://github.com/user-attachments/assets/291bdeb9-f2b2-4f9b-b64d-135080dc3d14" />
<img width="1210" height="705" alt="Captura de tela 2025-12-10 175604" src="https://github.com/user-attachments/assets/545e892d-1600-4181-b546-79437a81a46a" />

<h3> 4. Postman — Testes da API</h3>
<img width="1244" height="881" alt="Captura de tela 2025-12-10 180544" src="https://github.com/user-attachments/assets/aff8f0ea-0a01-4e21-922c-b9c536e58369" />
<br/>

<h2> Produção</h2>

<h3> 1. Deploy na Vercel</h3>
<img width="1854" height="832" alt="imagem_2025-12-10_181858894" src="https://github.com/user-attachments/assets/6f451abf-b92c-437a-be92-9bcdbc11ab3e" />

<h3> 2. Supabase — Banco de Produção</h3>
<img width="1550" height="788" alt="imagem_2025-12-10_182014378" src="https://github.com/user-attachments/assets/731490ee-e835-4f8e-a614-0695318a80cf" />
<br/>

<h2>Estrutura Simplificada do Código</h2>

src/
├── app/
│ ├── login/
│ ├── dashboard/
│ ├── accounts/
│ ├── transactions/
│ └── api/
│ ├── auth/
│ ├── accounts/
│ └── transactions/
│
├── components/
├── hooks/
├── lib/
│ ├── prisma.ts
│ └── authService.ts
└── styles/

<br/>

<h2>Destaques Técnicos</h2>

<h3>Prisma + PostgreSQL</h3>
<ul>
  <li>Tipagem forte</li>
  <li>Migrações automáticas</li>
  <li>Relacionamentos sólidos</li>
</ul>

<h3>Next.js App Router</h3>
<ul>
  <li>Arquitetura moderna</li>
  <li>API Routes integradas</li>
  <li>SSR/CSR híbrido</li>
</ul>

<h3>Boas práticas</h3>
<ul>
  <li>Camadas bem separadas</li>
  <li>Validação centralizada</li>
  <li>Tratamento estruturado de erros</li>
  <li>Middlewares de segurança</li>
</ul>
<br/>

<h2>Rodando Localmente</h2>

git clone https://github.com/jeffersonjuni/plataforma-controle-financeiro

cd plataforma-controle-financeiro
npm install

Criar .env baseado no .env.example

Preencha todas as variáveis conforme seu ambiente

Rodar Prisma

Nunca suba o arquivo `.env` para o GitHub

O projeto foi inicialmente desenvolvido com MySQL em ambiente Docker e posteriormente migrado para PostgreSQL (Supabase), refletindo um cenário real de evolução de arquitetura

npx prisma generate
npx prisma migrate dev

Iniciar servidor

npm run dev
<br/>

<h2>Acesso Online</h2>

<p>
 A aplicação está em produção na Vercel.<br/><br/>
 <a href="https://plataforma-controle-financeiro.vercel.app/" target="_blank">
<strong>https://plataforma-controle-financeiro.vercel.app</strong>
</a>
</p>

<br/>

<h2>Autor</h2>

**Jefferson Junior**  
Desenvolvedor Full Stack   
TypeScript • React • Next.js • Prisma • SQL Server • PostgreSQL  



