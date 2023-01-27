import WebPush from "web-push";
import { FastifyInstance } from "fastify";
import { z } from "zod";

const publicKey =
  "BO2MyL3kPfkX2ZvyZBz99Y8ZhQbA2rEK0QNSYECQgUfeS7Cb2pKdQ39Q4htesojO3nucdrWvdp14hbm-mWGuKS8";
const privateKey = "bSBN697s7YNNm54pNMuHpAFtpatSnYBOIPyNCNZzwEY";

WebPush.setVapidDetails("http://localhost:3333", publicKey, privateKey);

export const notificationRoutes = async (app: FastifyInstance) => {
  app.get("/push/public_key", async () => {
    return {
      publicKey,
    };
  });

  app.post("/push/register", (request, response) => {
    // essa seria a rota para registrar a inscrição de notificação no usuário, mas ainda não tenho sistema de autenticação.
    console.log(request.body);

    return response.status(201).send();
  });

  app.post("/push/send", async (request, response) => {
    const sendPushBody = z.object({
      subscription: z.object({
        endpoint: z.string(),
        keys: z.object({
          p256dh: z.string(),
          auth: z.string(),
        }),
      }),
    });

    const { subscription } = sendPushBody.parse(request.body);

    setTimeout(() => {
      WebPush.sendNotification(subscription, "Hello do backend");
    }, 5000);

    return response.status(201).send();
  });
};
