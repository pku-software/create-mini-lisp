import { useEffect, useState } from "react";
import { generate } from "./generate";

interface OptionProp {
  title: string;
  image: string;
  disabled?: boolean;
  description?: string;
  selected?: boolean;
  onClick?: () => void;
}

function Option({
  title,
  image,
  selected,
  disabled,
  description,
  onClick,
}: OptionProp) {
  const classes = [
    "w-52",
    "p-2",
    "normal-case",
    "btn",
    "step--option",
    "flex",
    "flex-col",
    "items-center",
    "justify-start",
  ];
  if (disabled) {
    classes.push("opacity-50", "cursor-not-allowed");
  }
  if (selected) {
    classes.push("btn-primary");
  } else {
    classes.push("btn-ghost", "step--option__unselected");
  }
  return (
    <div className={classes.join(" ")} onClick={disabled ? undefined : onClick}>
      <img src={image} className="w-40 h-40 object-contain"></img>
      <div className="mt-1 text-lg">{title}</div>
      <div className="mt-1 text-sm font-normal">{description}</div>
    </div>
  );
}

interface Option {
  id: string;
  title: string;
  image: string;
  disabled?: boolean | string[];
  description?: string;
}

interface Option2 extends Option {
  disabled: boolean;
}

interface StepProp {
  title: string;
  options: Option2[];
  onSelected?: (id: string) => void;
}

function Step({ title, options, onSelected }: StepProp) {
  const [id, setId] = useState<string | null>(null);
  function setIdAndPropagate(id: string) {
    setId(id);
    onSelected && onSelected(id);
  }
  return (
    <div className="flex flex-col items-stretch pt-20">
      <div className="step--title text-2xl">{title}</div>
      <div className="mt-4 mx-6 flex flex-row justify-around">
        {options.map((option) => (
          <Option
            key={option.id}
            title={option.title}
            image={option.image}
            description={option.description ?? ""}
            selected={!option.disabled && id === option.id}
            disabled={option.disabled}
            onClick={() => setIdAndPropagate(option.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface Step {
  title: string;
  options: Option[];
}

const STEPS: Step[] = [
  {
    title: "??????????????????????????????",
    options: [
      {
        id: "windows",
        title: "Windows",
        image: "https://img.icons8.com/color/256/windows-11.png",
      },
      {
        id: "mac",
        title: "macOS",
        image: "https://img.icons8.com/color/256/mac-os-logo.png",
      },
      {
        id: "linux",
        title: "Linux",
        image: "https://img.icons8.com/color/256/linux.png",
        disabled: true,
        description: "Linux ???????????????????????????",
      },
    ],
  },
  {
    title: "????????????????????? IDE???",
    options: [
      {
        id: "vs",
        title: "Visua Studio",
        image: "https://img.icons8.com/color/256/visual-studio--v2.png",
        description: "???????????????????????? IDE??????????????????????????????????????? Windows",
        disabled: ["mac"],
      },
      {
        id: "vscode",
        title: "Visual Studio Code",
        image: "https://img.icons8.com/color/256/visual-studio-code-2019.png",
        description: "??????????????????????????????????????????????????????",
      },
      {
        id: "clion",
        title: "CLion",
        image: "./clion.svg",
        description:
          "JetBrains ????????? C++ IDE???????????????????????????????????????????????????",
      },
    ],
  },
  {
    title: "??????????????????????????????",
    options: [
      {
        id: "msvc",
        title: "Microsoft Visual C++",
        image: "./vcxproj.svg",
        description: "Visual Studio ??????????????????",
        disabled: ["mac"],
      },
      {
        id: "mingw",
        title: "MinGW",
        image: "https://v4.vscch.tk/assets/mingw64.png",
        disabled: ["mac", "vs"],
        description: "Windows ??????????????? C++ ?????????",
      },
      {
        id: "apple-clang",
        title: "Apple Clang",
        image: "https://v4.vscch.tk/assets/xcode.png",
        disabled: ["windows"],
        description: "??????????????? Clang ?????????",
      },
    ],
  },
  {
    title: "?????????????????????????????????",
    options: [
      {
        id: "sln",
        title: "VS ????????????",
        image: "./sln.png",
        description: "Visual Studio ?????????????????????",
        disabled: ["vscode", "clion"],
      },
      {
        id: "xmake",
        title: "Xmake",
        image: "./xmake.svg",
        disabled: ["vs", "clion"],
        description: "???????????????????????????????????????????????????????????????",
      },
      {
        id: "cmake",
        title: "CMake",
        image:
          "https://img.icons8.com/external-tal-revivo-color-tal-revivo/256/external-cmake-a-cross-platform-free-and-open-source-software-tool-logo-color-tal-revivo.png",
        disabled: ["vs"],
        description: "?????????????????????????????????????????????????????????",
      },
    ],
  },
];

function Generator({ ids }: { ids: string[] }) {
  const [generating, setGenerating] = useState(false);
  async function onClick() {
    setGenerating(true);
    try {
      await generate(ids);
    } catch (e) {
      if (e instanceof Error) {
        alert(e.message);
        console.error(e);
      }
    } finally {
      setGenerating(false);
    }
  }
  const btnClass = ["btn", "btn-primary", "btn-outline"];
  if (generating) {
    btnClass.push("loading", "disabled");
  }
  return (
    <div className="pt-20 flex flex-row">
      <div className="step--title text-2xl">???????????????</div>
      <div className="mx-6">
        <button className={btnClass.join(" ")} onClick={onClick}>
          {generating ? "?????????" : "???????????????"}
        </button>
      </div>
    </div>
  );
}

function App() {
  const [ids, setIds] = useState<string[]>([]);
  const steps: StepProp[] = STEPS.slice(0, ids.length + 1).map((s) => {
    return {
      ...s,
      options: s.options.map((o) => {
        return {
          ...o,
          disabled: Array.isArray(o.disabled)
            ? o.disabled.map((id) => ids.includes(id)).reduce((a, b) => a || b)
            : o.disabled ?? false,
        };
      }),
    };
  });
  function setId(stepIndex: number, id: string) {
    if (stepIndex >= ids.length) {
      setIds([...ids, id]);
    } else {
      setIds([...ids.slice(0, stepIndex), id]);
    }
  }
  return (
    <div className="container mx-auto px-4 pb-20">
      <h1 className="text-7xl pt-36">
        <code>Mini-Lisp</code> ?????????
      </h1>
      {steps.map((step, index) => (
        <Step
          key={ids.slice(0, index).join(".")}
          title={step.title}
          options={step.options}
          onSelected={(id) => {
            setId(index, id);
          }}
        />
      ))}
      {ids.length === STEPS.length && <Generator ids={ids} />}
    </div>
  );
}

export default App;
