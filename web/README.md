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