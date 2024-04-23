import { Application } from "jsr:@oak/oak@14";

const app = new Application();

app.use(async (ctx, next) => {
  if (ctx.request.url.pathname === "/backup" && ctx.request.method === "GET") {
    try {
      const { SANITY_AUTH_TOKEN, PROJECT_ID } = await ctx.request.body.json();
      const cliConf =
        `import {defineCliConfig} from '@sanity/cli'; export default defineCliConfig({ api: { projectId: '${PROJECT_ID}',  } });`;

      try {
        await Deno.stat("tmp");
      } catch {
        console.info("tmp doesnt exist, creating");
        await Deno.mkdir("tmp");
      }

      const tempDir = await Deno.makeTempDir({ dir: "tmp" });
      await Deno.writeTextFile(`${tempDir}/sanity.cli.ts`, cliConf);

      const { success, stderr } = await new Deno.Command("sanity", {
        args: [
          "dataset",
          "export",
          "production", // dataset
          "--no-assets",
          "prod.tar.gz",
        ],
        cwd: tempDir,
        env: {
          "SANITY_AUTH_TOKEN": SANITY_AUTH_TOKEN,
        },
      })
        .output();

      /*
      const command = new Deno.Command(
        `${sanity} dataset list`,
        {
          cwd: tempDir,
        },
      );
      const { code, stdout, stderr } = await command.output();
      console.log(code);
      console.log(new TextDecoder().decode(stdout));
      console.log();

		 ?*/

      if (!success) throw Error(new TextDecoder().decode(stderr));

      ctx.response.body = "all good";
    } catch (err) {
      console.error(err);
      next();
    }
  } else if (
    ctx.request.url.pathname === "/" && ctx.request.method === "GET"
  ) {
    ctx.response.body = "??";
  } else next();
});

app.use((ctx) => {
  ctx.response.status = 404;
  ctx.response.body = "Not found";
});

await app.listen({ port: 8080 });
