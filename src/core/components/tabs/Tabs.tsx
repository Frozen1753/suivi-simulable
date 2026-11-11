import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { createSlot, readSlots } from "../../utils/components/slots";
import styles from "./Tabs.module.css";

export type TabItemProps = {
  label: ReactNode;
  children: ReactNode;
  disabled?: boolean;
};

export type TabsProps = {
  children: ReactNode;
  defaultActive?: number;
  className?: string;
};

const Item = createSlot<TabItemProps>("Tabs.Item");

function TabsRoot({ children, defaultActive = 0, className = "" }: TabsProps) {
  const [activeIndex, setActiveIndex] = useState(defaultActive);
  const tabsId = useId();
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const tabItems = readSlots(children, [Item], "Tabs").map(({ props }) => props);

  const getNextEnabledIndex = (index: number, direction: 1 | -1): number => {
    let nextIndex = index;
    for (let i = 0; i < tabItems.length; i++) {
      nextIndex = (nextIndex + direction + tabItems.length) % tabItems.length;
      if (!tabItems[nextIndex].disabled) {
        return nextIndex;
      }
    }
    return index;
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let nextIndex: number | undefined;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        nextIndex = getNextEnabledIndex(index, 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        nextIndex = getNextEnabledIndex(index, -1);
        break;
      case "Home":
        nextIndex = tabItems.findIndex((tab) => !tab.disabled);
        break;
      case "End":
        nextIndex = [...tabItems]
          .map((tab, tabIndex) => ({ tab, tabIndex }))
          .reverse()
          .find(({ tab }) => !tab.disabled)?.tabIndex;
        break;
      default:
        return;
    }

    event.preventDefault();

    if (nextIndex !== undefined && nextIndex !== -1) {
      setActiveIndex(nextIndex);
      buttonRefs.current[nextIndex]?.focus();
    }
  };

  if (tabItems.length === 0) {
    return null;
  }

  const activeTab = tabItems[activeIndex] ?? tabItems[0];
  const activeTabId = `${tabsId}-tab-${activeIndex}`;
  const activePanelId = `${tabsId}-panel-${activeIndex}`;

  return (
    <div className={`${styles.tabs} ${className}`}>
      {/* Tab Triggers Header */}
      <div className={styles.tabslist} role="tablist" aria-label="Content sections">
        {tabItems.map((tab, index) => {
          const tabId = `${tabsId}-tab-${index}`;
          const panelId = `${tabsId}-panel-${index}`;
          const isActive = index === activeIndex;

          return (
            <button
              key={tabId}
              ref={(el) => {
                buttonRefs.current[index] = el;
              }}
              id={tabId}
              type="button"
              role="tab"
              className={`${styles.tabstrigger} ${isActive ? styles.active : ""}`}
              aria-selected={isActive}
              aria-controls={panelId}
              tabIndex={isActive ? 0 : -1}
              disabled={tab.disabled}
              onClick={() => setActiveIndex(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Active Tab Content Panel */}
      <div
        id={activePanelId}
        className={styles.tabspanel}
        role="tabpanel"
        aria-labelledby={activeTabId}
        tabIndex={0}
      >
        {activeTab.children}
      </div>
    </div>
  );
}

export const Tabs = Object.assign(TabsRoot, { Item });