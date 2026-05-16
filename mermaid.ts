import { system } from "@silverbulletmd/silverbullet/syscalls";
import { CodeWidgetContent } from "@silverbulletmd/silverbullet/type/client";

const frontmatterKeys = ["theme", "fillBackground"];

function extractFrontmatterConfig(text: string): {
  config: Record<string, string>;
  body: string;
} {
  const result: Record<string, string> = {};
  if (!text.startsWith("---")) {
    return { config: result, body: text };
  }

  const match = text.match(/^(---\r?\n)([\s\S]*?)(\r?\n---)/);
  if (!match) {
    return { config: result, body: text };
  }

  const [fullMatch, openMarker, yaml, closeMarker] = match;
  const rest = text.slice(fullMatch.length);
  const keptLines: string[] = [];
  let inConfig = false;
  let configIndent: string | null = null;

  for (const line of yaml.split("\n")) {
    if (line.trimEnd() === "config:") {
      inConfig = true;
      configIndent = null;
      keptLines.push(line);
      continue;
    }

    if (inConfig) {
      const indentMatch = line.match(/^(\s+)\S/);
      if (indentMatch) {
        configIndent ??= indentMatch[1];
        if (indentMatch[1] === configIndent) {
          const keyMatch = line.match(/^\s+(\w+):\s*(.*)/);
          if (keyMatch && frontmatterKeys.includes(keyMatch[1])) {
            result[keyMatch[1]] = keyMatch[2]
              .trim()
              .replace(/^["']|["']$/g, "");
            continue;
          }
        }
      } else if (/^\S/.test(line)) {
        inConfig = false;
        configIndent = null;
      }
    }

    keptLines.push(line);
  }

  return {
    config: result,
    body: openMarker + keptLines.join("\n") + closeMarker + rest,
  };
}

export async function widget(
    bodyText: string,
): Promise<CodeWidgetContent> {
  const config = await system.getConfig("mermaid", {}) ?? {};
  const mermaidVersion = config.version ?? "11.15.0";
  let mermaidHash : string | undefined = config.integrity ? `"${config.integrity}"` : `"sha256-cBN+d7snO7LvlyuG6LBADMqL5TyyW/xFkRoYbcmGZd4="`
  if (config.integrity_disabled) {
    mermaidHash = undefined;
  }

  let packs: string = "";
  if (config.icon_packs) {
    for (const pack of config.icon_packs) {
      packs += `{
        name: "${pack.name}",
        loader: () => fetch("${pack.url}").then(r => r.json()),
      },`;
    }
  }

  const { config: frontmatterConfig, body: cleanedBody } =
    extractFrontmatterConfig(bodyText);
  const themeName = frontmatterConfig.theme
    ?? config.theme
    ?? config.initialize?.theme
    ?? "default";
  const customThemes = config.custom_themes ?? {};

  function resolveTheme(name: string): {
    theme: string;
    themeVars: Record<string, string> | null;
  } {
    const customTheme: Record<string, string> | undefined = customThemes[name];
    if (!customTheme) {
      return { theme: name, themeVars: null };
    }

    return {
      theme: customTheme.based_on ?? "base",
      themeVars: Object.fromEntries(
        Object.entries(customTheme).filter(([key]) => key !== "based_on"),
      ),
    };
  }

  const scriptConfig = JSON.stringify({
    initialize: config.initialize ?? {},
    theme: resolveTheme(themeName),
    look: config.look ?? config.initialize?.look ?? "classic",
    fillBackground: frontmatterConfig.fillBackground
      ? frontmatterConfig.fillBackground.toLowerCase() === "true"
      : (config.fill_background ?? false),
    center: config.center ?? false,
  });

  return {
    html: `<pre class="mermaid">${cleanedBody.replaceAll("<", "&lt;")}</pre>`,
    script: `
    const _mermaidConfig = ${scriptConfig};
    const _themeConfig = _mermaidConfig.theme;
    loadJsByUrl("https://cdn.jsdelivr.net/npm/mermaid@${mermaidVersion}/dist/mermaid.min.js", ${mermaidHash}).then(() => {
      const _initConfig = {
        ..._mermaidConfig.initialize,
        startOnLoad: false,
        theme: _themeConfig.theme,
        look: _mermaidConfig.look,
      };
      if (_themeConfig.themeVars) {
        _initConfig.themeVariables = {
          ...(_initConfig.themeVariables ?? {}),
          ..._themeConfig.themeVars,
        };
      }
      mermaid.initialize(_initConfig);
      mermaid.registerIconPacks([${packs}]);
      mermaid.run().then(() => {
        if (_mermaidConfig.fillBackground) {
          const bg = mermaid.mermaidAPI.getConfig()?.themeVariables?.background;
          if (bg) {
            document.querySelectorAll("svg").forEach((svg) => {
              svg.style.background = bg;
            });
          }
        }
        if (_mermaidConfig.center) {
          document.querySelectorAll("svg").forEach((svg) => {
            svg.style.display = "block";
            svg.style.marginLeft = "auto";
            svg.style.marginRight = "auto";
          });
        }
        updateHeight();
      });
    });
    document.addEventListener("click", () => {
      api({type: "blur"});
    });
    `,
  };
}
