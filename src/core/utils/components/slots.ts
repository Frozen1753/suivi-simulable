import { Children, isValidElement, type ReactNode } from "react";

type Slot<P> = ((props: P) => null) & { displayName?: string };

/** Creates a marker component : it returns nothing and only read its children props */
export function createSlot<P>(displayName: string): Slot<P> {
    const slot: Slot<P> = () => null;
    slot.displayName = displayName;
    return slot;
}

/**
 * Return direct children in the given slots with their props.
 * Any other children (except empty char / spaces) cause a warning.
 */
export function readSlots<S extends Slot<any>>(
    children: ReactNode,
    slots: readonly S[],
    owner: string,
) {
    const found: Array<{ slot: S; props: Parameters<S>[0] }> = [];

    Children.forEach(children, (child) => {
        if (child == null || typeof child === "boolean") return;
        if (typeof child === "string" && child.trim() === "") return;

        const type = isValidElement(child) ? child.type : undefined;
        const slot = slots.find((s) => s === type);

        if (!slot || !isValidElement(child)) {
            console.warn(
                `${owner} only accepts ${slots.map((s) => `<${s.displayName}>`).join(", ")} as direct children.`,
            );
            return;
        }

        found.push({ slot, props: child.props as Parameters<S>[0] });
    });

    return found;
}