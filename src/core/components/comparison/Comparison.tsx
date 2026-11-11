import type { ReactNode } from "react";
import { createSlot, readSlots } from "../../utils/components/slots";
import { Tabs } from "../tabs";
import styles from "./Comparison.module.css";

export type ComparisonProps = { children: ReactNode };
export type ComparisonItemProps = { children: ReactNode; label?: string };

const Left = createSlot<ComparisonItemProps>("Comparison.Left");
const Right = createSlot<ComparisonItemProps>("Comparison.Right");

const DEFAULT_LABELS = new Map([
  [Left, "Before"],
  [Right, "After"],
]);

function ComparisonRoot({ children }: ComparisonProps) {
  const items = readSlots(children, [Left, Right], "Comparison");

  return (
    <Tabs>
      {items.map(({ slot, props }, index) => (
        <Tabs.Item key={index} label={props.label ?? DEFAULT_LABELS.get(slot)}>
          <div className={styles.content}>{props.children}</div>
        </Tabs.Item>
      ))}
    </Tabs>
  );
}

export const Comparison = Object.assign(ComparisonRoot, { Left, Right });