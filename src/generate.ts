import JSZip from "jszip";

const VS_FILES = [
  "mini-lisp.sln",
  "mini-lisp.vcxproj",
  "mini-lisp.vcxproj.filters",
];

const CLION_FILES = [
  ".gitignore",
  ".name",
  "mini-lisp.iml",
  "misc.xml",
  "modules.xml",
];

const VSCODE_FILES = ["tasks.json", "launch.json", "c_cpp_properties.json"];

function getIdeUrls(ide: string, platform: string, tool: string) {
  switch (ide) {
    case "vs":
      return VS_FILES.map((f) => "./vs/" + f);
    case "clion":
      return CLION_FILES.map((f) => "./clion/" + f);
    case "vscode":
      return VSCODE_FILES.map((f) => `./${tool}.${platform}.vscode/` + f);
    default:
      return [];
  }
}

const IDE_FILES_DEST: Record<string, string> = {
  vs: "",
  clion: ".idea",
  vscode: ".vscode",
};

const SRC_FILES = [
  "error.h",
  "token.h",
  "tokenizer.h",
  "main.cpp",
  "token.cpp",
  "tokenizer.cpp",
];

const SRC_FILES_DEST: Record<string, string> = {
  sln: "",
  cmake: "src",
  xmake: "src",
};

const TOOL_CONFIG_FILES: Record<string, string[]> = {
  sln: [],
  cmake: ["CMakeLists.txt"],
  xmake: ["xmake.lua"],
};
const COMMON_CONFIG_FILES = [".clang-format", ".gitignore", ".editorconfig"];

async function inline(template: TemplateStringsArray, ...links: string[]) {
  const result = [];
  for (let i = 0; i < template.length; i++) {
    result.push(template[i]);
    if (i < links.length) {
      const link = links[i];
      const content = await fetch(`./readme/${link}.md`).then((r) => r.text());
      result.push(content);
    }
  }
  return result.join("");
}

async function getReadmeSrc(ide: string, tool: string) {
  let prepareLink: string;
  let installLink: string;
  let runLink: string;
  switch (ide) {
    case "vs":
      prepareLink = "prepare-vs";
      runLink = "run-vs";
      break;
    case "clion":
      prepareLink = "prepare-clion";
      runLink = "run-clion";
      break;
    case "vscode": {
      switch (tool) {
        case "cmake":
          prepareLink = "prepare-vscode-cmake";
          break;
        case "xmake":
          prepareLink = "prepare-vscode-xmake";
          break;
        default:
          throw new Error("Unexpected tool: " + tool);
      }
      runLink = "run-vscode";
      break;
    }
    default:
      throw new Error("Unexpected ide: " + ide);
  }
  switch (tool) {
    case "sln":
      installLink = "install-vs";
      break;
    case "cmake":
      installLink = "install-cmake";
      break;
    case "xmake":
      installLink = "install-xmake";
      break;
    default:
      throw new Error("Unexpected tool: " + tool);
  }

  return inline`# \`Mini-Lisp\` 脚手架

## 准备步骤

${"compiler"}${installLink}${prepareLink}
## 编译、运行与调试

${runLink}`;
}

async function saveFilesFromUrls(zip: JSZip, urls: string[], dest: string) {
  for (const url of urls) {
    const content = await fetch(url).then((r) => r.text());
    zip.file(dest + "/" + url.split("/").pop(), content);
  }
}

function saveAs(name: string, content: Blob) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(content);
  a.download = name;
  a.click();
}

export async function generate(ids: string[]) {
  console.log(ids);
  const [os, ide, platform, tool] = ids;
  const readme = await getReadmeSrc(ide, tool);

  const srcUrls = SRC_FILES.map((f) => `./src/${f}`);
  const srcDest = SRC_FILES_DEST[tool];

  const ideUrls = getIdeUrls(ide, platform, tool);
  const ideDest = IDE_FILES_DEST[ide];

  const configUrls = [...COMMON_CONFIG_FILES, ...TOOL_CONFIG_FILES[tool]].map(
    (f) => `./configs/${f}`
  );

  const zip = new JSZip();
  zip.file("README.md", readme);
  await saveFilesFromUrls(zip, srcUrls, srcDest);
  await saveFilesFromUrls(zip, ideUrls, ideDest);
  await saveFilesFromUrls(zip, configUrls, "");

  const blob = await zip.generateAsync({ type: "blob" });
  saveAs("mini_lisp.zip", blob);
}
