const { execSync } = require("child_process");

const run = (cmd) => execSync(cmd, { stdio: "inherit" });

try {

  console.log("🚀 Auto deploy iniciado...");

  run('git add .');
  run('git commit -m "update app"');
  run('git push origin main');

  console.log("✅ Deploy enviado a GitHub");

} catch (error) {
  console.log("⚠️ No hay cambios para subir");
}
