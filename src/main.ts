import { Application } from "jsr:@oak/oak@14";
import { exec, OutputMode } from "https://deno.land/x/exec@0.0.5/mod.ts";

const app = new Application();

app.use(async (ctx, next) => {
  if (ctx.request.url.pathname === "/backup" && ctx.request.method === "GET") {
    try {
      const cliConf =
        `import {defineCliConfig} from '@sanity/cli'; export default defineCliConfig({ api: { projectId: 'l1rjav4f' } });`;

      await Deno.mkdir("tmp");
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
  } else next();
});

app.use((ctx) => {
  ctx.response.status = 404;
  ctx.response.body = "Not found";
});

await app.listen({ port: 8080 });
