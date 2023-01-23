interface ProgressBarProps {
   progress: number
}

export const ProgressBar = (props: ProgressBarProps) => {
   // poderia ser uma progress bar do radix, mas ele fez assim pra mostrar como adaptar a acessibilidade na mão.
   return(
      <div className="h-3 rounded-xl bg-zinc-700 w-full mt-4">
         <div
            role="progressbar"
            aria-label='Progresso de hábitos completados nesse dia'
            aria-valuenow={props.progress}
            className="h-3 rounded-xl bg-violet-600 transition-all"
            style={{width: `${props.progress}%`}}
            // passado por style, pois o tailwind não aceita valores dinâmicos assim.
         />
      </div>
   )
}