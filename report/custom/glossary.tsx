import { GlossaryTerm, type GlossaryEntries } from "report-maker";

export const terms = {
  network: <>Computers talking to each other through <GlossaryTerm id="request">requests</GlossaryTerm>.</>,
  request: <>A request is a <GlossaryTerm id="network" /> thing.</>,
  latency: <>Time between a <GlossaryTerm id="request" /> and its response.</>,
} satisfies GlossaryEntries;
