# Adicionando notificações push

## Notificações via Local Notification

- No arquivo `App.tsx`:

```ts
// OBS: Fora do componente
window.Notification.requestPermission(permission => {
  if (permission === "granted") {
    new window.Notification("Titulo da Notificação", {
      body: "Texto da Notificação",
      icon: "diretorio da imagem",
      // dar um ctrl + space pra ver mais propriedades.
    });
  }
});
/*
  * Desvantagens da Local Notification:
  - Não consigo programar uma data,hora,etc, de envio pra notificação
  - Não envia notificação com o app (aba) fechado

  * Observação:
  - A janelinha de pedir permissão pra notificação não aparece, por um motivo que ainda não entendi
  - Porém, se a permissão for dada manualmente, funciona perfeitamente e envia a notificação.
*/
```

## Notificações via Service Workers

- Service Workers são scripts que podemos manter rodando por baixo dos panos, enquanto o navegador estiver aberto, mesmo que a aplicação não esteja aberta.
- O Service Worker funciona em uma thread separada (como se estivesse em outra página do navegador), ou seja, ele não vai ter acesso a algumas funcionalidades do `js`, como a manipulação do DOM, por exemplo.
- Criarei o arquivo `service-workers.js`, com as seguintes observações:
  - Dentro da pasta `public`, pra ficar acessível pelo endereço da aplicação, ou seja, públicos.
  - Para usar o `typescript` nesse arquivo, precisa ir em `tsconfig.json` e adicioná-lo manualmente, para ser compilado e interpretado pelo navegador.
  - Porém vou usar `js` mesmo.
- Para adicionar o service worker no navegador, adicionar o seguinte código no `App.tsx`:

```ts
navigator.serviceWorker.register("service-worker.js");
```

```js
// no service worker
self.addEventListener("push", e => {
  // se tiver texto, mande pro body, senão, manda a string vazia.
  const body = e.data?.text() ?? "";
  // esse waitUntil, diz pro service worker ficar vigiando e ficar ativado até o código dentro dele ocorrer.
  e.waitUntil(
    self.registration.showNotification("Habits", {
      body: body,
    })
  );
});
```

- Para testar a notificação do service worker, ir nas ferramentas do desenvolvedor e seguir o seguinte caminho: `Aplicativo > Service Workers`, escreva sua mensagem de personalização e clique em "Enviar por Push".

### API experimental para notificações push

- Permite enviar notificações do back para o front, sem uso de serviço de terceiros.

- na pasta `server`:

  - `npm i web-push`
  - `npm i @types/web-push -D` (instalando a tipagem para o código ter autocomplete, etc)

- criar `notifications-routes.ts` em `server/src`:

```ts
import { FastifyInstance } from "fastify";

export const notificationRoutes = async (app: FastifyInstance) => {};
```

- em `server.ts`, dar um `app.register(notificationRoutes)`, para que o backend reconheça essas rotas

```ts
// notifications-routes.ts
import WebPush from "web-push";

// console.log(WebPush.generateVAPIDKeys());
// retorna uma chave pública e uma privada, usadas para comunicação entre o front e o back.

const publicKey = "public key";
const privateKey = "private key";

WebPush.setVapidDetails("http://localhost:3333", publicKey, privateKey);
// serve para passar as chaves a serem utilizadas pelo web push.
//  parâmetros: url da aplicação, chave pública e chave privada.
```

### Criando rotas para comunicação com o front

```ts
// notifications-routes.ts
export const notificationRoutes = async (app: FastifyInstance) => {
  // retorna a public key para o front saber de onde veio a notificação.
  app.get("/push/public_key", async () => {
    return {
      publicKey,
    };
  });

  // essa seria a rota para registrar cada inscrição de notificação no usuário, mas ainda não tenho sistema de autenticação, então vou só retornar um status positivo.
  app.post("/push/register", (request, response) => {
    console.log(request.body);
    return response.status(201).send();
  });

  // na realidade, não existe rota para enviar notificação, geralmente o back envia notificação conforme algo ocorrido no back, mas criarei essa rota somente para exemplificar um envio de notificação.
  app.post("/push/send", async (request, response) => {
    console.log(request.body);
    return response.status(201).send();
  });
};
```

```ts
// App.tsx
navigator.serviceWorker
  .register("service-worker.js") // retorna promise, entao posso usar o then
  .then(async serviceWorker => {
    //verifica se o usuário já tem uma inscrição ativa (parte da api experimental)
    let subscription = await serviceWorker.pushManager.getSubscription();

    // cria a inscrição caso o usuário não tenha
    if (!subscription) {
      const publicKeyResponse = await api.get("/push/public_key");

      //(parte da api => pushManager)
      subscription = await serviceWorker.pushManager.subscribe({
        // essa opção tem q ser setada, pois o navegador bloqueia
        // notificações de conteúdo invisível ao usuário
        userVisibleOnly: true,
        applicationServerKey: publicKeyResponse.data.publicKey,
      });
    }
  });
```

- dando um log nessa `subscription`, veremos no atributo `endpoint` da response que é uma url da Firebase Cloud Messaging, ou seja, essa api automaticamente criou uma url que administra as notificações pelo firebase.

- Continuando:

```ts
// App.tsx
navigator.serviceWorker
  .register("service-worker.js")
  .then(async serviceWorker => {
    ...

    // não faz nada ent n vou explicar
    await api.post("/push/register", {
      subscription,
    });

    await api.post("/push/send", {
      subscription,
    });
  });
```

```ts
// notifications-routes.ts
app.post("/push/send", async (request, response) => {
  // pra descobrir a estrutura do body recebido, é so la no front dar um log na subscription.
  const sendPushBody = z.object({
    subscription: z.object({
      endpoint: z.string(),
      keys: z.object({
        p256dh: z.string(),
        auth: z.string(),
      }),
    }),
  });
  // zod pra validar

  const { subscription } = sendPushBody.parse(request.body);
  // valida os os atributos

  setTimeout(() => {
    WebPush.sendNotification(subscription, "Hello do backend");
    // após o timeout, envia a notificação mesmo que eu feche a guia do app, usando a API experimental web-push.
  }, 5000);

  return response.status(201).send();
});
```
