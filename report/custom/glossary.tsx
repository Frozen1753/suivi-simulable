import { type GlossaryEntries, GlossaryTerm, Link } from "report-maker";

export const terms = {
  mdx: <>Un fichier .mdx est un fichier <GlossaryTerm>Markdown</GlossaryTerm> pouvant contenir du code JSX (des composants JavaScript) intégré. Il est généralement compilé en JavaScript pour être utilisé dans des frameworks tels que React.</>,
  rhai: <>Un langage de script conçu pour être intégré à des applications écrites en <Link href="https://www.rust-lang.org/">Rust</Link>. Il permet notamment à une application d'exécuter du code écrit par ses utilisateurs. <Link href="https://rhai.rs/"> [En savoir plus]</Link></>,
  sparring_partner: <>Un interlocuteur stimulant, extérieur au projet, qui suscite la réflexion et favorise les progrès grâce à ses questions et à son regard extérieur.</>,
  engine: <>"moteur en anglais", dans notre cas, la partie qui exécute les règles et les calculs nécessaires au fonctionnement des simulations.</>,
  pseudo_langage: <>Un langage de programmation simplifié, créé spécialement pour un projet. Il permet de donner des instructions à un programme avec des règles définies par ses concepteurs.</>,
  rust: <>Un langage de programmation utilisé pour créer des logiciels. Il est notamment apprécié pour ses performances et sa capacité à aider les développeurs à éviter certaines erreurs. <Link href="https://www.rust-lang.org/"> [En savoir plus]</Link></>,
  freemium: <>Modèle économique dans lequel une version de base d'un service est gratuite, tandis que certaines fonctionnalités supplémentaires sont payantes.</>,
  react: <>Une bibliothèque JavaScript utilisée pour créer des interfaces de sites et d'applications à partir de composants réutilisables.</>,
  typescript: <>Un langage fondé sur JavaScript qui ajoute des vérifications sur les types de données, afin d'aider à repérer certaines erreurs pendant le développement.</>,
  pixijs: <>Une bibliothèque JavaScript qui aide à créer des graphismes et des animations en deux dimensions dans un navigateur web.</>,
  threejs: <>Une bibliothèque JavaScript qui aide à créer et afficher des scènes et des objets en trois dimensions dans un navigateur web.<Link href="https://threejs.org/"> [En savoir plus]</Link></>,
  markdown: <>Un format de texte qui permet de structurer facilement un document à l'aide de signes simples, par exemple pour créer des titres, des listes ou des liens.</>,
  plugin: <>Un module complémentaire qui ajoute une fonctionnalité à un logiciel ou à un outil existant.</>,
  build: <>L'étape où les fichiers et le code d'un projet sont préparés ou transformés pour produire une version utilisable ou publiable.</>,
  run: <>Le fonctionnement d'un logiciel ou d'un service après son lancement, notamment les ressources nécessaires pour qu'il reste accessible aux utilisateurs.</>,
  sae: <>Une Situation d'Apprentissage et d'Évaluation : un projet pédagogique qui permet aux étudiants de mettre en pratique leurs connaissances.</>,
  hit: <></>
} satisfies GlossaryEntries;
