import { system } from "@silverbulletmd/silverbullet/syscalls";
import { CodeWidgetContent } from "@silverbulletmd/silverbullet/type/client";

export async function widget(
    bodyText: string,
): Promise<CodeWidgetContent> {
  const config = await system.getConfig("mermaid", {version: "11.15.0"})
  const mermaidVersion = config?.version;
  const mermaidInitialize = JSON.stringify(config?.initialize ?? {});
  let mermaidHash : string | undefined = config?.integrity ? `"${config.integrity}"` : `"sha256-cBN+d7snO7LvlyuG6LBADMqL5TyyW/xFkRoYbcmGZd4="`
  if (config?.integrity_disabled) {
    mermaidHash = undefined;
  }

  let packs: string = "";
  if (config?.icon_packs) {
    for (const pack of config?.icon_packs) {
      packs += `{
        name: "${pack.name}",
        loader: () => fetch("${pack.url}").then(r => r.json()),
      },`;
    }
  }

  return {
    html: `<pre class="mermaid">${bodyText.replaceAll("<", "&lt;")}</pre>`,
    script: `
    loadJsByUrl("https://cdn.jsdelivr.net/npm/mermaid@${mermaidVersion}/dist/mermaid.min.js", ${mermaidHash}).then(() => {
      mermaid.initialize(${mermaidInitialize});
      mermaid.init().then(updateHeight);
      mermaid.registerIconPacks([${packs}]);
    });
    document.addEventListener("click", () => {
      api({type: "blur"});
    });
    `,
  };
}
