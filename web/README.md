# Frontend da aplicação

- utilizarei o vitejs, uma espécie de template de aplicações front end.
- `npm reate vite@latest`
- dar um nome pra pasta
- selecionar `React` e `TypeScript` nas opções.
- `npm i`, para instalar as dependências.
- `npm run dev`, ele já inicia o servidor.

- criar o component `<Habits />` na pasta `components`
~~~ts
interface HabitProps {
   completed: number
}

export const Habit = (props: HabitProps) => {
   return(
      <div>{props.completed}</div>
   )
}
~~~

## Estilização com Tailwind
- `npm i -D tailwindcss postcss autoprefixer`
- postcss: ferramenta para automatizar tarefas no css
- tailwind: plugin do postcss
- autoprefixer: ajuda para colocar os prefixos de compatibilidade crossbrowser.

- `npx tailwindcss init -p`
- esse `-p` é pra criar o arquivo postcss.config, para o vite entender o tailwind.

- num arquivo `global.css`, escrever o seguinte:
~~~css
@tailwind base;
@tailwind utilities;
@tailwind components;
~~~

- e importar esse arquivo css no `<App />`

- no arquivo `tailwind.config`, fazer o seguinte:
~~~cjs
content: [
    './src/**/*.tsx',
    './index.html'
  ]
~~~

- traduzindo: dentro da pasta `./src`, TUDO que tiver la dentro `/**`, com a extensão .tsx `/*.tsx` terão estilização. (mesma ideia no do `index.html`, caso eu queira usar classes do tailwind la.)

- estilizando o componente `<Habits />` com as classes do tailwind: 
~~~html
<!-- no tailwind, todas as medidas são multiplas de 4, ou seja, w-10 = width 40px -->
<div className="
   bg-zinc-900
   w-10 h-10
   text-white
   rounded
   m-2
   flex
   items-center
   justify-center"
>
   {props.completed}
</div>
~~~
- OBS: se não carregar o estilo, reinicia o servidor do vite.

- falando bem rápido pelo tempo:
- no `tailwind.config.cjs`:
~~~json
theme: {
    extend: {
      colors: {
        background: '#09090A'
      },
      gridTemplateRows: {
        7: "repeat(7, minmax(0, 1fr))"
      }
    },
  },
~~~
- adiciona a opção de cor -background, com o valor ali especificado, e a opção de grid-rows -7, com o valor dali.

- no `index.html`:
   ~~~html
   <body class="bg-background text-white">
   ~~~

- `/components/*`
   - HabitDay => Só estilo
   - Header
      - `npm i phosphor-react`
         ~~~ts
         import { Plus } from 'phosphor-react'
         ~~~
      - usar ele no button
   - SummaryTable => aqui fica complexo, vamos lá:
   ~~~tsx
   // renderizar os dias da semana:
   const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

   export const SummaryTable = () => {
      return(
         <div className="w-full flex">
            <div className="grid grid-rows-7 grid-flow-row gap-3">
               {weekDays.map((weekDay, index) => (
                  <div
                     key={`${weekDay}-${index}`}
                     className="text-zinc-400 text-xl h-10 w-10 font-bold flex items-center justify-center"
                  >
                     {weekDay}
                  </div>
               ))}
            </div>
         </div>
      )
   }
   ~~~
   - `npm i dayjs`
   ~~~tsx
   // arquivo src/utils/generate-dates-from-year-beginning.ts
   import dayjs from 'dayjs';

   export function generateDatesFromYearBeggining() {
      const firstDayOfTheYear = dayjs().startOf('year')
      const today = new Date();

      const dates = [];
      let compareDate = firstDayOfTheYear;

      while(compareDate.isBefore(today)) {
         dates.push(compareDate.toDate())
         compareDate = compareDate.add(1, 'day')
      }

      return dates;
   }
   ~~~
   ~~~tsx
   // adicionando numero minimo de quadradinhos no SummaryTable.tsx
   ...
   import { generateDatesFromYearBeggining } from "../utils/generate-dates-from-year-beginning";
   ...
   const summaryDates = generateDatesFromYearBeggining();

   const minimumSummaryDatesSize = 18 * 7 //18 semanas, ou seja, 18 colunas de 7 dias
   const amountOfDaysToFill = minimumSummaryDatesSize - summaryDates.length;

   export const SummaryTable = () => {
      return(
         <div className="w-full flex">
            ...
            <div className="grid grid-rows-7 grid-flow-col gap-3">
               {summaryDates.map(summaryDate => <HabitDay key={summaryDate.toString()} />)}

               {amountOfDaysToFill > 0 && Array.from({ length: amountOfDaysToFill}).map((_, i) => (
                  <div
                     key={i}
                     className="w-10 h-10 bg-zinc-900 border-2 border-zinc-800 rounded-lg opacity-40 cursor-not-allowed"
                  />
               ))}
            </div>
         </div>
      )
   }
   ~~~
# Modal de criar hábito
- OBS: Importante garantir a acessibilidade de usuários com deficiência visual, por exemplo.
- Uma das bibliotecas usadas para isso é o Radix, que traz componentes sem estilização e com acessibilidade garantida.
- `npm install @radix-ui/react-dialog`
~~~tsx
//Header.tsx => vou botar as coisas do modal aq, pois o button que o abre está no header, ou seja, o modal faz parte do componente header de certa forma.
import * as Dialog from '@radix-ui/react-dialog';
// não importei separadamente pois faz mais sentido no código dessa forma (Dialog.Content, Dialog.Overlay, etc)
//explicando linha a linha:
<Dialog.Root>
   <Dialog.Trigger
      type='button'
      className="(estilos)"
   >
      <Plus size={20} className="(estilos)" />
      Novo Hábito
   </Dialog.Trigger>
   <Dialog.Portal>
      <Dialog.Overlay className="(estilos)" />
      <Dialog.Content className="(estilos)">
         <Dialog.Close className="(estilos)">
            <X
               size={24}
               aria-label="Fechar"
            />
         </Dialog.Close>
         <Dialog.Title className="(estilos)">
            Criar Hábito
         </Dialog.Title>
         <NewComponentForm />
      </Dialog.Content>
   </Dialog.Portal>
</Dialog.Root>
//Dialog.Root => Container de todas as informações pertinentes ao modal.
//Dialog.Trigger => Botão que vai abrir o Dialog
//Dialog.Portal => Serve pra informar ao react que vai ser um elemento FORA do header, ele seria renderizado externamente a ele, no body fora da #root.
//Dialog.Overlay => Aquele background preto que aparece quando abre o modal
//Dialog.Close => Trigger para fechar o modal
// Dialog.Title => título, importante pra acessibilidade (o leitor de tela diria "modal de criar hábito aberto")
// o <X /> tem uma aria-label pois ele não é do radix, logo não tem a acessibilidade previamente configurada.

// a estilização é do 0, pois o radix não vem com estilo pronto.
~~~

# Popover de ver informações do dia
- OBS: Segue a mesma lógica do acima, vou explicar igual:
   ~~~tsx
   export const HabitDay = () => {
      return(
         <Popover.Root>
            <Popover.Trigger className="(estilos)" />
            // esse é aquele quadradinho do dia, ele será o trigger
         
            <Popover.Portal>
               <Popover.Content className="(estilos)">
                  <span className="(estilos)">domingo</span>
                  <span className="(estilos)">22/01</span>

                  <ProgressBar progress={40} />
                  <Popover.Arrow height={8} width={16} className="(estilos)"/>
                  // essa arrow foi personalizada de um jeio diferente pois se trata de um SVG.
               </Popover.Content>
            </Popover.Portal>
         </Popover.Root>
      )
   }
   ~~~

# Cores dinâmicas nos HabitDays

- no `SummaryTable.tsx`:
   ~~~tsx
   // só para adicionar aleatoriedade, para ver as cores mesmo sem conectar com a API.
   {summaryDates.map(summaryDate => {
      return (
         <HabitDay
            key={summaryDate.toString()}
            amount={5}
            completed={Math.round(Math.random() * 5)}
         />
      )
   })}
   ~~~

- no `HabitDay.tsx`:
- `npm install clsx`, lib para classes condicionais.
~~~tsx
import clsx from 'clsx';

interface HabitDayProps {
   completed: number,
   amount: number
}

export const HabitDay = ({ completed, amount }: HabitDayProps) => {
   const completedPercentage = Math.round((completed/amount) * 100)

   return(
      <Popover.Root>
         <Popover.Trigger
            className={clsx("w-10 h-10 rounded-lg", {
               'bg-zinc-900 border-2 border-zinc-800': completedPercentage === 0,
               'bg-violet-900 border-violet-700': completedPercentage > 0 && completedPercentage < 20,
               'bg-violet-800 border-violet-600': completedPercentage >= 20 && completedPercentage < 40,
               'bg-violet-700 border-violet-500': completedPercentage >= 40 && completedPercentage < 60,
               'bg-violet-600 border-violet-500': completedPercentage >= 60 && completedPercentage < 80,
               'bg-violet-500 border-violet-400': completedPercentage >= 80
            })}
         />
         ...
      </Popover.Root>
   )
}
// esse clsx recebe 2 parâmetros:
//clsx(padrão, condicional)
/*
condicional: {
   'classe': condição
}
*/
~~~

# Adicionando checkboxes
- Neste caso vou comentar somente uma coisa específica do tailwind, o resto é compreensível a partir da leitura das instruções acima do radix.
~~~tsx
//NewHabitForm.tsx
<div className='mt-6 flex flex-col gap-3'>
   <Checkbox.Root className="(style) group">
      <div className='(style) group-data-[state=checked]:bg-green-500 group-data-[state=checked]:border-green-500'>
         <Checkbox.Indicator>
            <Check size={20} className='text-white' />
         </Checkbox.Indicator>
      </div>

      <span className='(style) group-data-[state=checked]:text-zinc-400 group-data-[state=checked]:line-through'>
         Beber 2L de água
      </span>
   </Checkbox.Root>
</div>
// o radix por padrão tem um atributo data-state na checkbox, e ele pode ser usado pelo tailwind para uma estilização condicional.
// porém, esse atributo só é colocado nos elementos Checkbox. para fazer a estilização do html normal, deve-se usar o group do tailwind:
<Checkbox.Root className="group">
   <div className='group-data-[state=checked]:(style)'>
      <Checkbox.Indicator>
         <Check size={20} className='text-white' />
      </Checkbox.Indicator>
   </div>
</Checkbox.Root>
~~~

# Pegando os dados do formulário
- No React, os dados são armazenados no estado.
- Mudanças principais (`NewHabitForm.tsx`):
~~~tsx
const createNewHabit = (event: FormEvent) => {
   // esse type foi pego dando ctrl+click até achar o type do evento.
   event.preventDefault();
   // para não dar reload na página
}

<form onSubmit={createNewHabit} ...>
~~~
~~~tsx
const [title, setTitle] = useState('')
<input
   ...
   onChange={event => setTitle(event.target.value)}
/>
~~~
~~~tsx
const [weekDays, setWeekDays] = useState<number[]>([])
// declarando o tipo da array dentro do state (<number[]>)

const handleToggleWeekDay = (weekDay: number) => {
   if(weekDays.includes(weekDay)){
      const weekDaysWithRemovedOne = weekDays.filter(day => day !== weekDay)

      setWeekDays(weekDaysWithRemovedOne)
   } else {
      const weekDaysWithAddedOne = [...weekDays, weekDay]

      setWeekDays(weekDaysWithAddedOne)
   }
}

<Checkbox.Root
   ...
   onCheckedChange={() => handleToggleWeekDay(index)}
>
~~~

# Conexão com a API
- Rota Get Summary
   - Retorna os dias cadastrados (ou seja, com hábitos cadastrados nele) no banco de dados.
   - `npm install axios`
   - OBS: a pasta lib é usada para configurar interação com outras biblotecas.
   - `src/lib/axios.ts`:
   ~~~tsx
   import axios from "axios";

   export const api = axios.create({
      baseURL: 'http://localhost:3333'
   })
   // pra facilitar, pois essa é uma parte imutável na url do backend.
   ~~~
   - `SummaryTable.tsx`
   ~~~ts
   type Summary = Array<{
      id: string
      date: string
      amount: number
      completed: number
   }>
   /*
      type Summary = {
         id: string,
         date: string,
         amount: int,
         completed: int
      }[]
      é uma opção tb
   */

   export const SummaryTable = () => {
      const [summary, setSummary] = useState<Summary>([])

      useEffect(() => {
         api.get('/summary').then(response => {
            setSummary(response.data)
         })
      }, [])
      // resto das coisas 
   }
   ~~~
   ~~~tsx
   {summaryDates.map(date => {
      const dayInSummary = summary.find(day => {
         return dayjs(date).isSame(day.date, 'day')
      })
      // traduzindo: pra cada dia do summaryDates (todos os dias até hoje), pega os dias cadastrados (com hábitos, summary) e retorna ele CASO seja o mesmo dia. se não, retorna undefined.

      return (
         <HabitDay
            key={date.toString()}
            date={date}
            amount={dayInSummary?.amount}
            completed={dayInSummary?.completed}
         />
         // esse operador objeto?.atributo significa se existir, pega o atributo, senão, undefined
      )
   })}
   ~~~
   - `HabitDay.tsx`
   ~~~tsx
   interface HabitDayProps {
      date: Date
      completed?: number
      amount?: number
      // ?: significa q não é obrigatório ter esse atributo na interface.
   }
   //os params do HabitDay ganharam valor padrão de 0, pra nao ficarem como undefined.
   export const HabitDay = ({ completed = 0, amount = 0, date }: HabitDayProps) => {
   const completedPercentage = amount > 0 ? Math.round((completed/amount) * 100) : 0
   // essa validação é pra evitar que ocorra uma divisão por zero
   }
   ~~~
   - pequena configuração em `lib/dayjs.ts`
   ~~~ts
   import dayjs from "dayjs";
   import 'dayjs/locale/pt-br'

   dayjs.locale('pt-br')
   //para pegar os dias da semana em português.
   // importa isso aq no App, pra ficar disponível pra todos os componentes, que nem o arquivo de estilo css.
   ~~~
   - de volta ao `HabitDay.tsx`
   ~~~tsx
   const dayAndMonth = dayjs(date).format('DD/MM') //retorna a data formatada em dia/mês
   const dayOfWeek = dayjs(date).format('dddd') //retorna dia da semana por extenso
   
   return(
      <Popover.Root>
         ...
      
         <Popover.Portal>
            <Popover.Content className="min-w-[320px] p-6 rounded-2xl bg-zinc-900 flex flex-col">
               <span className="font-semibold text-zinc-400">{dayOfWeek}</span>
               <span className="mt-1 font-extrabold leading-tight text-3xl">{dayAndMonth}</span>
               ...
            </Popover.Content>
         </Popover.Portal>
      </Popover.Root>
   )
   ~~~
   - `NewHabitForm.tsx`
   ~~~tsx
   const createNewHabit = async (event: FormEvent) => {
      event.preventDefault();

      if (!title || weekDays.length === 0) {
         return
      }

      await api.post('/habits', {
         title,
         weekDays
      })
      // cria novo hábito

      setTitle('')
      setWeekDays([])
      // reseta formulario
      alert('Hábito criado com sucesso!')
   }
   ...
   <input
      ...
      value={title}
      // pra apagar quando der o setTitle(')
      onChange={event => setTitle(event.target.value)}
   />
   ...
   <Checkbox.Root
      ...
      checked={weekDays.includes(index)}
      // pra resetar quando der o setWeekDays([])
      onCheckedChange={() => handleToggleWeekDay(index)}
   >
      ...
   </Checkbox.Root>
   ~~~

# Pegando os hábitos (completos ou não) de cada dia
- Ao invés de fazer a requisição no `HabitDay.tsx`, farei no novo componente `<HabitsList />`, pois ele só é renderizado quando o popover aparece, o que reduz a quantidade de chamadas da API de uma vez só.
- `HabitDay.tsx`:
~~~tsx
export const HabitDay = ({ completed = 0, amount = 0, date }: HabitDayProps) => {
   ...
   
   return(
      <Popover.Root>
         ...
      
         <Popover.Portal>
            <Popover.Content>
            ...
               <HabitsList date={date} />
            ...
            </Popover.Content>
         </Popover.Portal>
      </Popover.Root>
   )
}
~~~
- `HabitsList.tsx`:
~~~tsx
...

export const HabitsList = ({ date }: HabitsListProps) => {
   const [habitsInfo, setHabitsInfo] = useState<HabitsInfo>()

   useEffect(() => {
      api.get('/day', {
         // params pois essa rota envia a informação por querys na url
         params: {
            date: date.toISOString()
            //retorna uma data em uma string no formato ISO (2022-01-22....)
         }
      }).then(response => {
         setHabitsInfo(response.data)
      })
   }, [])

   return (
      <div className='mt-6 flex flex-col gap-3'>
         {habitsInfo?.possibleHabits.map(habit => {
            return (
               <Checkbox.Root
                  key={habit.id}
                  checked={habitsInfo.completedHabits.includes(habit.id)}
                  className="flex items-center gap-3 group"
               >
                  ...

                  <span className='font-semibold text-xl text-white leading-tight group-data-[state=checked]:text-zinc-400 group-data-[state=checked]:line-through'>
                     {habit.title}
                  </span>
               </Checkbox.Root>
            )
         })}
      </div>
   );
}
~~~
# Desabilitando marcação de hábitos de dias anteriores
- mudanças em `HabitsList.tsx`:
~~~tsx
const isDayBefore = dayjs(date)
      .endOf('day')
      .isBefore(new Date())
// retorna se a data desse hábito, ao fim do dia (pra considerar o dia todo), é anterior à data atual

return (
   <div className='mt-6 flex flex-col gap-3'>
      {habitsInfo?.possibleHabits.map(habit => {
         return (
            <Checkbox.Root
               disabled={isDayBefore}
               // desabilita se for de uma data anterior.
               defaultChecked={habitsInfo.completedHabits.includes(habit.id)}
               //troquei o checked por defaultChecked, pra poder alterar.
            >
            ...
         )
      })}
   </div>
);
~~~

# Toggle Checked nos hábitos completos
- `HabitsList.tsx`
~~~tsx
const handleToggleChecked = async (habitId: string) => {
   await api.patch(`/habits/${habitId}/toggle`)
   
   const isHabitAlreadyCompleted = habitsInfo!.completedHabits.includes(habitId)
   // essa exclamação basicamente diz pro typescript "essa informação COM CERTEZA vai existir, pois no map dos habitsInfo, la no return, eu deixei a condição que ele só acontecerá caso ele não seja nulo (habitsInfo?.map...)"

   let completedHabits: string[] = []
   // ids dos habitos completos

   if(isHabitAlreadyCompleted) {
      completedHabits = habitsInfo!.completedHabits.filter(habit => habit === habitId)
   } else {
      completedHabits = [...habitsInfo!.completedHabits, habitId]
   }

   setHabitsInfo({
      possibleHabits: habitsInfo!.possibleHabits,
      completedHabits: completedHabits
   })
}
...
<Checkbox.Root
   onCheckedChange={() => handleToggleChecked(habit.id)}
>
   ...
</Checkbox.Root>
...
~~~