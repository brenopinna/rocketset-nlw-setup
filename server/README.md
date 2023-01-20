# Projet NLW 11 - Setup

## Configurando ambiente

- `npm init -y` => inicia o node
- `npm i typescript -D`
- `npx tsc --init` => cria o arquivo `tsconfig.json`
- no tsconfig.json, mudar o target para `es2020`
- `npm i tsx -D` => o Node não entende ts, e essa dependência faz com que o Node possa executá-lo.
- no `package.json`, mudar o script para `"dev": "tsx watch src/server.ts"`, para rodar no terminal com o `npm run dev`. esse `watch` serve para detectar mudanças no arquivo e reiniciar o servidor.

## Primeira rota backend

- Backend: API RESTful => Fornece funcionalidades através de rotas http.
- pela url do navegador, só é possível realizar operações GET. as demais dão erro.


- `npm i fastify` => framework node, semelhante ao express mas recebe mais suporte.

~~~js
import Fastify from 'fastify';

const app = Fastify();
app.get('/', () => {
   return 'Hello brenin'
});
app.listen({
   port: 3333
});
~~~

## Prisma e Banco de Dados
- ORM => O ORM cria uma ligação entre a aplicação e o banco de dados, assim pessoas programadoras podem manipular esses dados com mais praticidade e rapidez no processo.
- O ORM a ser ultilizado nesse projeto vai ser o Prisma (ele é integrado com o typescript).

- `npm i prisma -D`
- `npm i @prisma/client`
- `npx prisma init --datasource-provider SQLite` => inicia o prisma dizendo q o tipo de banco de dados vai ser sqlite
- o SQLite foi usado pois ele tem um arquivo local de banco de dados.

## Criando o banco de dados
- no arquivo `prisma/scheme.prisma`, criaremos uma tabela no banco de dados, seguindo a seguinte estrutura: 
~~~
// model => indica que uma tabela está sendo criada
// @id: indica q é a chave primária
// @default(uuid()) gera uma chave aleatória e única.
// @@map sobrescreve o nome "Habit" da tabela, mudando para "habits".
//nome / tipo

model Habit {
   id         String   @id @default(uuid())
   title      String
   created_at DateTime


   @@map("habits")
}
~~~

- `npx migrate dev` => vai ler o `scheme.prisma` e vai fazer um "commit" das mudanças dele. fazendo uma analogia, migrations == git

output no terminal:
~~~
SQLite database dev.db created at file:./dev.db

? Enter a name for the new migration: » ("commit message" aqui)
~~~

- na pasta prisma, surgiu a pasta migrations com essas alterações.

- agora o prisma criou o arquivo físico do banco de dados, o `dev.db`.

- para visualizar o banco de dados, `npx prisma studio`.

## Pegando informações do banco pelas rotas backend

~~~js
//server.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
~~~
- essa instância `prisma` será utilizada para acessar o banco de dados.

~~~js
app.get('/', async () => {
   const habits = await prisma.habit.findMany()
   return habits
});
~~~

- o retorno no navegador: 
~~~json
   [
  {
    "id": "1479efde-5368-44ac-bb06-03721902eaeb",
    "title": "Beber água",
    "created_at": "2023-01-20T00:00:00.000Z"
  },
  {
    "id": "d797a324-eaad-48ea-834f-20ccad7d7422",
    "title": "Me exercitar",
    "created_at": "2023-01-20T00:00:00.000Z"
  }
]
~~~

## Configurando CORS
- cors => mecanismo de segurança que diz quais aplicações podem acessar os dados desse backend.

- `npm i @fastify/cors`
~~~js
import cors from '@fastify/cors';
app.register(cors);
//rotas aqui embaixo
~~~

- agora o frontend poderá acessar esse backend.

