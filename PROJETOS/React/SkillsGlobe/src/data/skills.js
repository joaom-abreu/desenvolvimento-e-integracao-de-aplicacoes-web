import { FaJava } from "react-icons/fa";
import {
  SiBootstrap,
  SiC,
  SiCplusplus,
  SiCss,
  SiDocker,
  SiExpress,
  SiFigma,
  SiFirebase,
  SiFlutter,
  SiGit,
  SiGithub,
  SiHtml5,
  SiIntellijidea,
  SiJavascript,
  SiJest,
  SiJunit5,
  SiKotlin,
  SiLinux,
  SiMongodb,
  SiMysql,
  SiNodedotjs,
  SiNpm,
  SiPostgresql,
  SiPostman,
  SiPython,
  SiReact,
  SiSass,
  SiSpringboot,
  SiSqlite,
  SiTailwindcss,
  SiTypescript,
  SiVercel,
  SiVite,
} from "react-icons/si";
import { TbBrandCSharp, TbBrandVscode } from "react-icons/tb";

// Suas habilidades. Troque, tire ou acrescente à vontade:
//   name     → nome que aparece no globo e na lista
//   icon     → componente do react-icons (procure em https://react-icons.github.io/react-icons)
//   color    → cor do ícone (em geral, a cor da marca)
//   category → precisa ser uma das CATEGORIES abaixo
//   link     → para onde o clique leva (documentação, repositório, certificado...)

export const CATEGORIES = ["Front-end", "Back-end", "Mobile", "Dados", "Ferramentas"];

const SKILLS = [
  // Front-end
  { name: "HTML", icon: SiHtml5, color: "#E34F26", category: "Front-end", link: "https://developer.mozilla.org/pt-BR/docs/Web/HTML" },
  { name: "CSS", icon: SiCss, color: "#663399", category: "Front-end", link: "https://developer.mozilla.org/pt-BR/docs/Web/CSS" },
  { name: "JavaScript", icon: SiJavascript, color: "#E5B800", category: "Front-end", link: "https://developer.mozilla.org/pt-BR/docs/Web/JavaScript" },
  { name: "TypeScript", icon: SiTypescript, color: "#3178C6", category: "Front-end", link: "https://www.typescriptlang.org/docs/" },
  { name: "React", icon: SiReact, color: "#149ECA", category: "Front-end", link: "https://react.dev/" },
  { name: "Vite", icon: SiVite, color: "#646CFF", category: "Front-end", link: "https://vite.dev/" },
  { name: "Sass", icon: SiSass, color: "#CC6699", category: "Front-end", link: "https://sass-lang.com/documentation/" },
  { name: "Bootstrap", icon: SiBootstrap, color: "#7952B3", category: "Front-end", link: "https://getbootstrap.com/" },
  { name: "Tailwind CSS", icon: SiTailwindcss, color: "#06B6D4", category: "Front-end", link: "https://tailwindcss.com/docs" },

  // Back-end
  { name: "Java", icon: FaJava, color: "#E76F00", category: "Back-end", link: "https://dev.java/learn/" },
  { name: "Spring Boot", icon: SiSpringboot, color: "#6DB33F", category: "Back-end", link: "https://spring.io/projects/spring-boot" },
  { name: "Node.js", icon: SiNodedotjs, color: "#5FA04E", category: "Back-end", link: "https://nodejs.org/pt" },
  { name: "Express", icon: SiExpress, color: "#333333", category: "Back-end", link: "https://expressjs.com/pt-br/" },
  { name: "Python", icon: SiPython, color: "#3776AB", category: "Back-end", link: "https://docs.python.org/pt-br/3/" },
  { name: "C", icon: SiC, color: "#5C6BC0", category: "Back-end", link: "https://en.cppreference.com/w/c" },
  { name: "C++", icon: SiCplusplus, color: "#00599C", category: "Back-end", link: "https://en.cppreference.com/w/cpp" },
  { name: "C#", icon: TbBrandCSharp, color: "#68217A", category: "Back-end", link: "https://learn.microsoft.com/pt-br/dotnet/csharp/" },

  // Mobile
  { name: "Kotlin", icon: SiKotlin, color: "#7F52FF", category: "Mobile", link: "https://kotlinlang.org/docs/home.html" },
  { name: "Flutter", icon: SiFlutter, color: "#02569B", category: "Mobile", link: "https://docs.flutter.dev/" },
  { name: "Firebase", icon: SiFirebase, color: "#FFA000", category: "Mobile", link: "https://firebase.google.com/docs" },

  // Dados
  { name: "MySQL", icon: SiMysql, color: "#4479A1", category: "Dados", link: "https://dev.mysql.com/doc/" },
  { name: "PostgreSQL", icon: SiPostgresql, color: "#4169E1", category: "Dados", link: "https://www.postgresql.org/docs/" },
  { name: "SQLite", icon: SiSqlite, color: "#003B57", category: "Dados", link: "https://www.sqlite.org/docs.html" },
  { name: "MongoDB", icon: SiMongodb, color: "#47A248", category: "Dados", link: "https://www.mongodb.com/docs/" },

  // Ferramentas
  { name: "Git", icon: SiGit, color: "#F05032", category: "Ferramentas", link: "https://git-scm.com/book/pt-br/v2" },
  { name: "GitHub", icon: SiGithub, color: "#181717", category: "Ferramentas", link: "https://github.com/joaopauloaramuni" },
  { name: "Docker", icon: SiDocker, color: "#2496ED", category: "Ferramentas", link: "https://docs.docker.com/" },
  { name: "Linux", icon: SiLinux, color: "#333333", category: "Ferramentas", link: "https://www.kernel.org/" },
  { name: "VS Code", icon: TbBrandVscode, color: "#007ACC", category: "Ferramentas", link: "https://code.visualstudio.com/docs" },
  { name: "IntelliJ IDEA", icon: SiIntellijidea, color: "#FE315D", category: "Ferramentas", link: "https://www.jetbrains.com/idea/" },
  { name: "Postman", icon: SiPostman, color: "#FF6C37", category: "Ferramentas", link: "https://learning.postman.com/" },
  { name: "Figma", icon: SiFigma, color: "#A259FF", category: "Ferramentas", link: "https://help.figma.com/" },
  { name: "npm", icon: SiNpm, color: "#CB3837", category: "Ferramentas", link: "https://docs.npmjs.com/" },
  { name: "Vercel", icon: SiVercel, color: "#111111", category: "Ferramentas", link: "https://vercel.com/docs" },
  { name: "Jest", icon: SiJest, color: "#C21325", category: "Ferramentas", link: "https://jestjs.io/pt-BR/" },
  { name: "JUnit 5", icon: SiJunit5, color: "#25A162", category: "Ferramentas", link: "https://junit.org/junit5/docs/current/user-guide/" },
];

export default SKILLS;
