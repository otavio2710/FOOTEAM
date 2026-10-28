# ⚽ FOOTEAM — Loja Virtual de Camisas de Futebol

Uma aplicação web de e-commerce de camisas de futebol, com catálogo de produtos, carrinho de compras e atendimento para finalização de pedidos pelo WhatsApp.

🌐 **[Acessar o FOOTEAM](https://foteam.netlify.app/)**

## 📌 Sobre o projeto

O FOOTEAM foi criado para apresentar camisas de futebol em uma loja virtual responsiva. O projeto reúne uma interface para clientes e funcionalidades de administração do catálogo, com autenticação e armazenamento integrados ao Supabase.

## ✨ Funcionalidades

**Para clientes**
- Visualização do catálogo com imagens, preços e categorias.
- Pesquisa e filtros de produtos.
- Galeria de imagens e escolha de tamanho e quantidade.
- Carrinho de compras com cálculo do valor estimado.
- Encaminhamento do pedido ao WhatsApp para confirmar disponibilidade, pagamento e entrega.
- Cadastro e login de usuários.

**Para administração**
- Área administrativa acessível a usuários com perfil de administrador.
- Cadastro, edição e exclusão de produtos.
- Upload de imagens dos produtos para o Supabase Storage.
- Pesquisa de produtos na área de gerenciamento.

## 🛠️ Tecnologias

| Tecnologia | Utilização |
| --- | --- |
| HTML5 | Estrutura da interface |
| CSS3 | Estilização e layout responsivo |
| JavaScript | Catálogo, carrinho, formulários e interatividade |
| Supabase Auth | Cadastro e autenticação |
| Supabase PostgreSQL | Dados de produtos e perfis |
| Supabase Storage | Armazenamento das imagens |
| Netlify | Hospedagem do site |

## 🔐 Controle de acesso

O projeto utiliza autenticação do Supabase e políticas de **Row Level Security (RLS)** para controlar operações sobre produtos, perfis e imagens. O catálogo e as fotos dos produtos possuem acesso de leitura pública, enquanto as operações administrativas são condicionadas ao perfil de administrador.

> **Importante:** as credenciais privadas e as senhas de usuários não devem ser incluídas neste repositório. A chave pública do Supabase utilizada pelo navegador não substitui as políticas de segurança do banco.

## 📂 Estrutura básica

```text
FOOTEAM/
├── index.html
├── styles.css
├── app.js
└── footeam-logo.png
```

> A estrutura acima mostra os arquivos principais. Caso estejam dentro de uma subpasta no repositório, acesse essa pasta para encontrá-los.

## ▶️ Como executar

1. Baixe ou clone o repositório.
2. Abra a pasta que contém `index.html`, `styles.css` e `app.js`.
3. Execute com um servidor local, por exemplo a extensão **Live Server** do VS Code.
4. Para utilizar o catálogo e a autenticação, é necessário que o projeto Supabase configurado no código esteja disponível e com as políticas apropriadas.

## 📖 Experiência com o projeto

O FOOTEAM reúne atividades de planejamento de funcionalidades, integração com serviços externos, testes, identificação de problemas e ajustes de interface. O desenvolvimento contou com apoio de ferramentas de inteligência artificial.

## 👨‍💻 Responsável

**Otávio Higino de Macedo**  
Estudante de Análise e Desenvolvimento de Sistemas, com interesse em desenvolvimento back-end e oportunidades de estágio em tecnologia.

- 💼 [LinkedIn](https://www.linkedin.com/in/ot%C3%A1viohigino/)
- 💻 [GitHub](https://github.com/otavio2710)
- 🌐 [FOOTEAM online](https://foteam.netlify.app/)
