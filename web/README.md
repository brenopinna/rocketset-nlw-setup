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