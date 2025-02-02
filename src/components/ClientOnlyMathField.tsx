import React, {
  useEffect,
  useRef,
  forwardRef,
  ForwardedRef,
  HTMLAttributes,
} from "react";
import { MathfieldElement } from "mathlive";

// Define the props for the MathField component.
interface MathFieldProps extends HTMLAttributes<HTMLElement> {
  virtualKeyboardMode?: string;
  smartMode?: boolean;
  multiline?: boolean;
  // You can extend with more MathLive-specific attributes if needed.
}

/**
 * ClientOnlyMathField renders the MathLive custom element in a
 * server-side rendering friendly way and uses React.createElement.
 * We wrap it with forwardRef so that parent components can access
 * the underlying MathfieldElement.
 */
export default forwardRef<MathfieldElement, MathFieldProps>(
  function ClientOnlyMathField(props, ref: ForwardedRef<MathfieldElement>) {
    // Local ref to the math-field element.
    const innerRef = useRef<MathfieldElement>(null);

    // On the client, register the custom element if not already registered.
    useEffect(() => {
      if (typeof window !== "undefined" && !customElements.get("math-field")) {
        customElements.define("math-field", MathfieldElement);
      }
    }, []);

    // Optionally forward the inner ref to the provided ref.
    useEffect(() => {
      if (!ref) return;
      if (typeof ref === "function") {
        ref(innerRef.current);
      } else {
        (ref as React.MutableRefObject<MathfieldElement | null>).current =
          innerRef.current;
      }
    }, [ref]);

    // We extract any props we want to pass down.
    const {
      virtualKeyboardMode = "onfocus", // default to onfocus
      smartMode = true,
      multiline = true, // default to false if not provided
      style,
      ...rest
    } = props;

    // Create the custom element using React.createElement.
    // Note: The custom element will only be interactive on the client.
    return React.createElement("math-field", {
      ref: innerRef,
      virtualKeyboardMode,
      smartMode: smartMode.toString(), // some attributes may need to be strings
      multiline: multiline.toString(), // default to false if not provided
      style,
      ...rest,
    });
  }
);
