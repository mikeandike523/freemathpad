import ClientOnlyMathField from "@/components/ClientOnlyMathField";
import { MathfieldElement } from "mathlive";
import { useEffect, useRef, useState } from "react";
import {
  A,
  B,
  Br,
  Button,
  Div,
  H1,
  Header,
  I,
  Main,
  Span,
} from "style-props-html";

function MathInputBox() {
  const mathfieldRef = useRef<MathfieldElement>(null);
  const [latex, setLatex] = useState("");

  useEffect(() => {
    const mathfield = mathfieldRef.current;
    if (!mathfield) return;

    // Update the state whenever MathLive's internal content changes.
    const handleInput = () => {
      setLatex(mathfield.getValue("latex"));
    };

    // Attach MathLive's built-in input event.
    mathfield.addEventListener("input", handleInput);

    // No need to override key events; we rely on MathLive's built-in behavior.
    // (MathLive already handles backspace, delete, arrow keys, etc.)

    return () => {
      mathfield.removeEventListener("input", handleInput);
    };
  }, []);

  return (
    <>
      <Div
        width="100%"
        display="flex"
        flexDirection="row"
        align-items="flex-start"
        gap="8px"
        border="2px solid black"
        padding="8px"
      >
        <Div
          width="100%"
          minHeight="72px"
          display="flex"
          flexDirection="column"
          gap="8px"
        >
          <ClientOnlyMathField
            ref={mathfieldRef}
            virtualKeyboardMode="onfocus"
            smartMode={true}
            multiline={true}
            style={{
              width: "100%",
              fontSize: "1.5rem",
              outline: "none",
            }}
          ></ClientOnlyMathField>
          <Span
            width="100%"
            display={latex.length > 0 ? "flex" : "none"}
            gap="8px"
            flexDirection="row"
            alignItems="center"
          >
            <B userSelect="none">LaTeX Code:</B>
            <Span fontFamily="monospace" fontSize="16px" userSelect="all">
              {latex}
            </Span>
            <Span
              userSelect="none"
              fontSize="24px"
              cursor="pointer"
              onClick={() => {
                navigator.clipboard.writeText(latex);
                alert(`Copied "${latex}" to clipboard.`);
              }}
            >
              {"\u2398"}
            </Span>
          </Span>
        </Div>
        <Div
          display="flex"
          flexDirection="column"
          alignItems="stretch"
          gap="8px"
        >
          <Button onClick={() => {}}>Copy Image</Button>
          <Button onClick={() => {}}>Download Image</Button>
          <Button onClick={() => {}}>Remove</Button>
        </Div>
      </Div>
    </>
  );
}

export default function Home() {
  return (
    <Div display="flex" flexDirection="column" height="100vh" width="100vw">
      <Header
        padding="8px"
        background="lightgray"
        display="flex"
        alignItems="center"
        flexDirection="row"
        gap="0.7em"
      >
        <H1 style={{ margin: 0 }}>FreeMathPad</H1>
        <I marginLeft="auto">
          Powered by MathLive
          <Br />
          <A href="https://cortexjs.io/mathlive/">
            https://cortexjs.io/mathlive/
          </A>
        </I>
      </Header>
      <Main
        width="100%"
        display="flex"
        flexDirection="column"
        padding="8px"
        gap="8px"
      >
        <MathInputBox />
      </Main>
    </Div>
  );
}
