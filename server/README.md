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
~~~js
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

# Aula 2

## Criando mais tabelas no Banco de Dados

- no `scheme.prisma`:
   - tabela `Day`:
   ~~~js
   // esse uniqur determina que somente pode haver
   // um registro no banco com essa data, pois não
   // faz sentido o mesmo dia ser registrado 2 vezes.
   model Day {
      id   String   @id @default(uuid())
      date DateTime

      dayHabits DayHabit[]

      @@unique([date])
      @@map("days")
   }
   ~~~
   - tabela `DayHabit`: relaciona o dia com os hábitos daquele dia.
   ~~~js
   // esse unique diz que o day_id só pode ser
   // relacionado uma vez com o habit_id, pois o
   // hábito só é registrado uma vez por dia.
   model DayHabit {
      id       String @id @default(uuid())
      day_id   String
      habit_id String

      day   Day   @relation(fields: [day_id], references: [id])
      habit Habit @relation(fields: [habit_id], references: [id])

      @@unique([day_id, habit_id])
      @@map("day_habits")
   }
   ~~~
   - tabela `HabitWeekDays`:
   ~~~js
   // unique: o hábito só pode estar disponível 1 vez no mesmo dia da semana.
   model HabitWeekDays {
      id       String @id @default(uuid())
      habit_id String
      week_day Int

      habit Habit @relation(fields: [habit_id], references: [id])

      @@unique([habit_id, week_day])
      @@map("habit_week_days")
   }
   ~~~
- `npx migrate dev` para carregar as mudanças pro banco (migrate criado no arquivo prisma/migrations).

## Adicionando relação entre as tabelas
- `DayHabit`:
   ~~~js
   // day referencia o model Day
   // habit referencia o model Habit
   model DayHabit {
      ...
      day   Day
      habit Habit
      ...
   }
   // dar o format (shif+alt+f) para completar automaticamente.
   // vai criar dayId e habitId em camelcase, mas como ja criei em cima (day_id e habit_id), basta substituir nos fields e apagar os em camelcase.
   model DayHabit {
      ...
      day   Day   @relation(fields: [day_id], references: [id])
      habit Habit @relation(fields: [habit_id], references: [id])
      ...
   // o prisma tbm cria automaticamente os relacionamentos inversos:
   model Day {
      ...
      dayHabits DayHabit[]
      ...
   }
   }
   ~~~
- esse `@relation` não cria uma tabela nova, é só pro prisma entender que há uma relação, então as referências seguem o formato camelcase (dayHabits, por exemplo), o formato com underline é para as tabelas.

- `HabitWeekDays`:
~~~js
   model HabitWeekDays {
      //mesma parada do de cima.
      ...
      habit Habit @relation(fields: [habit_id], references: [id])
      ...
   }

   model Habit {
      ...
      weekDays  HabitWeekDays[]
      ...
   }
   ~~~

- `npx prisma migrate dev` para passar as mudanças pro banco.

## Seed do banco de dados
- seed é um populador do banco, ele cria dados fictícios para testar as rotas da API, usado no ambiente de desenvolvimento.
- criar `prisma/seed.ts`
- `npm i -D @types/node` (pq da um erro)
- copiar o código de seed fornecido na aula (ele ta no arquivo seed.ts)
- no `package.json`:
   ~~~json
   "prisma": {
   "seed": "tsx prisma/seed.ts"
   }
   ~~~
- vai vir como `ts-node prisma/seed.ts` na documentação do prisma seed, mas a biblioteca que usei nesse projeto para interpretação do typescript pelo node foi a tsx.
- `npx prisma db seed` para dar run no arquivo e popular o banco.
- `npx prisma studio` para visualizar o banco atualizado.

# Organizando arquivos
- criar na pasta src `lib/prisma.ts`
- mover o import do PrismaClient e instância para esse arquivo, pois essa conexão com o banco vai ser usada várias vezes..
   ~~~ts
   import { PrismaClient } from '@prisma/client';

   export const prisma = new PrismaClient();
   ~~~
- importar a const prisma no `server.ts`

- criar `src/routes.ts` e mover as rotas para lá, para organizar o código. vai dar um erro, pois a instância do Fastify (app) não existe ali dentro. para isso, basta encapsular com uma função que recebe o app como parâmetro, importar a FastifyInstance para informar o type para o typescript, e importar o prisma para realizar a conexão com o banco. além disso, definir como async pois o register precisa de uma função assíncrona como parâmetro.
   ~~~ts
   import { FastifyInstance } from "fastify";
   import { prisma } from "./lib/prisma";

   export const appRoutes = async (app: FastifyInstance) => {
      app.get('/', async () => {
         const habits = await prisma.habit.findMany()
         return habits
      });
   }
   ~~~
- em `server.ts`:
   ~~~ts
   import { appRoutes } from './routes';

   const app = Fastify();
   app.register(cors);
   app.register(appRoutes)
   ~~~

# Rota da criação de um hábito

- OBS: Downloand do programa Insomnia para protocolos http (GET, POST, etc)
- base da rota:
~~~ts
export const appRoutes = async (app: FastifyInstance) => {
   app.post('/habits', async (request) => {
      const { title, weekDays } = request.body;
      // vai dar erro do typescript
   });
}
~~~

- validação dos dados:
   - `npm i zod`;
   ~~~ts
   ...
   import { z } from 'zod';
   ...

   app.post('/habits', async (request) => {
      const createHabitBody = z.object({
         title: z.string(),
         weekDays: z.array(
            z.number().min(0).max(6)
            // domingo = 0; sábado = 6;
         )
         // não vou descrever pois é bem intuitivo por si só.
      })

      const { title, weekDays } = createHabitBody.parse(request.body);
      // duas adições interessantes: ele já define o type das variáveis e ele não executa as linhas abaixo se der erro, na minha opinião é bem útil.
   });
   ~~~

- adicionando o habito no banco:
   ~~~ts
   const { title, weekDays } = createHabitBody.parse(request.body);
   // await pq retorna uma promise
   await prisma.habit.create({
         data: {
            title,
            created_at: new Date(),
            // esse aqui cria um weekDay mesmo estando dentro da criação de um hábito, para evitar duas operações.
            weekDays: {
               create: weekDays.map(weekDay => {
                  return {
                     week_day: weekDay
                  }
               })
            }
            // usei um map pois, pra cada dia da semana vai ser criado um weekDay no banco.
         }
      })
   ~~~
- esse `new Date()` nos traz um problema de incompatibilidade com o horário; para facilitar, uma biblioteca será instalada.
- `npm i dayjs`;
~~~ts
const today = dayjs() //retorna data atual
               .startOf('day') //zera horas e segundos da data.
               .toDate(); //retorna objeto date em javasscript.

await prisma.habit.create({
   data: {
      title,
      created_at: today,
      ...
   }
})
~~~

## Rota Get Day
~~~ts
// vou explicar somente as coisas diferentes, pra ganhar tempo
app.get('/day', async (request) => {
   const getDayParams = z.object({
      date: z.coerce.date()
      // esse coerce significa "a string q vou receber pela url, force a conversão pra um objeto Date do javascript (new Date(parametro da url)).
   })

   const { date } = getDayParams.parse(request.query)
   // aqui é query ao invés de body, pois é passado por parâmetros da url invés de um json no body.

   const parsedDate = dayjs(date).startOf('day')
   // tem um problema ao reconhecer o dia da semana se passar o horario com 00:00....., por isso essa conversão, pra passar pro COMEÇO do dia.
   const weekDay = parsedDate.get('day') //pega o dia da semana (o index dele)

   const possibleHabits = await prisma.habit.findMany({
      where: {
         created_at: {
            lte: date,
            // lte = less than equal (menor ou igual)
         },
         weekDays: {
            some: {
               week_day: weekDay,
            }
         }
      }
      // pegar habitos onde a data de criação for menor ou igual que a data selecionada, e que tiverem no dia da semana da data selecionada.
   })

   const day = await prisma.day.findUnique({
      where: {
         date: parsedDate.toDate()
      },
      include: {
         dayHabits: true
      }
      // os dias com a data parsedDate, e retornar junto a referência pro dayHabits daquele dia.
   })

   const completedHabits = day?.dayHabits.map(dayHabit => {
      // day?. => se o day existir (não for nulo), dá o map.
      return dayHabit.habit_id
      // trata os dayHabits do day, retornando somente o id dele.
   })

   return {
      possibleHabits,
      completedHabits
   }
})
~~~
## Rota Patch Habits
~~~ts
app.patch('/habits/:id/toggle', async (request) => {
   //  esse :id é um route param, de identificação, significa que é um hábito específico.
   const toggleHabitParams = z.object({
      id: z.string().uuid()
      // esse uuid é a forma do zod de validar que é do formato uuid.
   })

   const { id } = toggleHabitParams.parse(request.params)

   // dayjs() retorna o dia atual, isso pois a aplicação só vai mudar o estado do hábito somente se estiver naquele dia.
   const today = dayjs().startOf('day').toDate()
   //  o startOf é pra facilitar a comparação de datas no backend.

   // esse trecho aqui é o seguinte: o dia só vai ser registrado no banco de dados se ele tiver algum hábito concluído, então é armazenado numa let. se ele existir na tabela, pega-se as informações dele. caso contrário, ele é criado no banco de dados.
   let day = await prisma.day.findUnique({
      where: {
         date: today
      }
   })

   if(!day){
      day = await prisma.day.create({
         data: {
            date: today
         }
      })
   }

   const dayHabit = await prisma.dayHabit.findUnique({
      where: {
         day_id_habit_id: {
            day_id: day.id,
            habit_id: id
         }
      }
   })

   // se já existir a relação entre o hábito e o dia, deleta. se não, adiciona.
   if(dayHabit){
      // remove o hábito num dia específico
      await prisma.dayHabit.delete({
         where: {
            id: dayHabit.id
         }
      })
   }else{
      // completa o hábito num dia específico
      await prisma.dayHabit.create({
         data: {
            day_id: day.id,
            habit_id: id
         }
      })
   }
})
~~~

## Rota Get Summary
~~~ts
app.get('/summary', async (request) => {
   /*
   retorno: uma array de objetos, cada um seguindo a seguinte estrutura:
   {
      date: 17/01,
      amount: 5 (quantidade de hábitos possíveis),
      completed: 1
   }
   */
   // query mais complexa, mais condições, relacionamentos => escrever o SQL na mão (Raw)
   //  Prisma ORM: Se eu trocar o tipo do banco de dados ele se adapta.
   // SQL Raw => O que for escrito só vai funcionar no SQLite, banco q estou usando, ou seja, se trocar terei de reescrever essa parte.

// comando pra fazer consultas ao banco com sql raw
   const summary = await prisma.$queryRaw`
      SELECT
         D.id,
         D.date,
         ${/*esses dois blocos abaixo são subqueries, consultas dentro de uma consulta.*/}
         (
            SELECT
               cast(count(*) as float)
            FROM day_habits DH
            WHERE DH.day_id = D.id
         ) as completed,
         (
            SELECT
               cast(count(*) as float)
            FROM habit_week_days HWD
            JOIN habits H
               ON H.id = HWD.habit_id
            WHERE
               ${
                  /*
                  essa função strftime converte de um tipo de data para outro,
                  nesse caso do unixepoch (tempo desde 1970 em segundos)
                  para mostrar somente o dia da semana, indicado por %w.

                  foi preciso dividir por 1000 pois o SQLite guarda o tempo em milissegundos, mas o unix epoque guarda em segundos.

                  no fim, usei o cast para converter para int, já que vem como string.
                  */
               }
               HWD.week_day = cast(strftime('%w', D.date/1000.0, 'unixepoch') as int)
               ${/*só retorna os hábitos criados antes da data desse dia*/}
               AND H.created_at <= D.date
         ) as amount
      FROM days D
   `

   return summary
})
~~~