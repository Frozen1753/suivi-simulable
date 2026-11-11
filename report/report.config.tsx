import { defineReport } from "report-maker";
import SimuLABleIcon from "./assets/SimuLABle_icon_dark.svg?react";
import SimuLABleLogo from "./assets/SimuLABle_logo.svg?react";

export default defineReport({
  title: "Document de suivi SimuLABle",

  cover: {
    media: {
      content: <SimuLABleIcon width={256} height={256} />,
      href: "https://github.com/Frozen1753/report-maker",
      ariaLabel: "Icon de SimuLABle",
    },
    authors: [
      { firstName: "Eliot", lastName: "NADOUCE BOUORTTE", alias: "Frozen1753", href: "https://github.com/Frozen1753" },
      { firstName: "Noah", lastName: "GAUCHE PEREIRA", alias: "ElPotatoCorp", href: "https://github.com/ElPotatoCorp" },
      { firstName: "Grigor", lastName: "Gasparyan", alias: "GG-003", href: "https://github.com/GG-003" }
    ],
    affiliations: ["IUT Dijon-Auxerre-Nevers — Département Informatique, site de Nevers"],
    date: "Mercredi 11 Novembre 2026"
  },

  header: {
    logo: <SimuLABleLogo className="svg-shadow" />,
    logoAlt: "Logo de SimuLABle"
  },
});
