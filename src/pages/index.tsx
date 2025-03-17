import ClientOnlyMathField from "@/components/ClientOnlyMathField";
import html2canvas from "html2canvas";
import { MathfieldElement } from "mathlive";
import { useEffect, useRef, useState } from "react";
import {
  FaBroom,
  FaCamera,
  FaDownload,
  FaTrash,
  FaPlus,
  FaCopy,
} from "react-icons/fa6";
import sanitize from "sanitize-filename";
import { v4 as uuidv4 } from "uuid";

import { css } from "@emotion/react";
import {
  A,
  B,
  Br,
  Button,
  Div,
  H1,
  Header,
  Main,
  P,
  Span,
} from "style-props-html";

const iconButtonCss = css`
  width: 48px;
  height: 48px;
  font-size: 24px;
  border: none;
  transform-origin: center;
  &:hover:not(:disabled) {
    transform: scale(1.1);
  }
  &:active:not(:disabled) {
    transform: scale(0.9);
  }
  cursor: pointer;
  user-select: none;
  border-radius: 50%;
  color: black;
  background-color: lightgrey;
  transition: all 0.2s ease;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

function MathInputBox({ onDelete }: { onDelete: () => void }) {
  const mathfieldRef = useRef<MathfieldElement>(null);
  const [latex, setLatex] = useState("");

  useEffect(() => {
    const mathfield = mathfieldRef.current;
    if (!mathfield) return;

    // Update the state whenever MathLive's internal content changes.
    const handleInput = () => {
      setLatex(mathfield.getValue("latex"));
    };

    mathfield.addEventListener("input", handleInput);

    const onKeyDown1 = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        mathfield.blur();
        event.preventDefault();
      }
    };

    document.addEventListener("keydown", onKeyDown1);

    return () => {
      mathfield.removeEventListener("input", handleInput);
      mathfield.removeEventListener("keydown", onKeyDown1);
    };
  }, []);

  // Adjusted capture function that uses a custom scale for 300dpi
  const captureMathfield = async (): Promise<HTMLCanvasElement | null> => {
    if (!mathfieldRef.current) return null;
    mathfieldRef.current.blur();

    await new Promise((resolve) => {
      setTimeout(resolve, 250); // Wait for MathLive to update the DOM.
    });
    try {
      // Calculate scale factor for 300dpi (assuming a default 96 dpi display)

      const dpiScale = 300 / 96;

      // Create a temporary clone of the mathfield for capturing
      const tempContainer = document.createElement("div");
      tempContainer.style.position = "absolute";
      tempContainer.style.left = "-9999px";
      tempContainer.style.top = "-9999px";
      tempContainer.style.width = "auto"; // Allow content to determine width
      document.body.appendChild(tempContainer);

      // Clone the mathfield element
      const tempMathField = mathfieldRef.current.cloneNode(true) as HTMLElement;

      // If we're using the inner content, we need to wait for the shadow DOM to be ready
      if (mathfieldRef.current.shadowRoot) {
        // Set the value directly to ensure the clone has the same content
        (tempMathField as unknown as { value: string }).value =
          mathfieldRef.current.getValue();

        // Remove width:100% styling to allow natural width
        tempMathField.style.width = "auto";
        tempMathField.style.maxWidth = "none";

        tempContainer.appendChild(tempMathField);

        // Wait a moment for the shadow DOM to render
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Now find the inner math content in the clone
        let targetElement: HTMLElement;
        if (tempMathField.shadowRoot) {
          const innerMath =
            tempMathField.shadowRoot.querySelector(".ML__content");
          if (innerMath) {
            targetElement = innerMath as HTMLElement;
          } else {
            targetElement = tempMathField;
          }
        } else {
          targetElement = tempMathField;
        }

        // Render the chosen element with html2canvas
        const canvas = await html2canvas(targetElement, {
          backgroundColor: "transparent",
          scale: dpiScale,
        });

        // Clean up the temporary elements
        document.body.removeChild(tempContainer);

        return canvas;
      } else {
        // Now find the inner math content in the clone
        let targetElement: HTMLElement;
        if (tempMathField.shadowRoot) {
          const innerMath =
            tempMathField.shadowRoot.querySelector(".ML__content");
          if (innerMath) {
            targetElement = innerMath as HTMLElement;
          } else {
            targetElement = tempMathField;
          }
        } else {
          targetElement = tempMathField;
        }

        // Render the chosen element with html2canvas
        const canvas = await html2canvas(targetElement, {
          backgroundColor: "transparent",
          scale: dpiScale,
        });

        return canvas;
      }
    } catch (error) {
      console.error("Error capturing mathfield:", error);
      return null;
    }
  };

  // Handler for "Copy Image" button.
  const handleCopyImage = async () => {
    const canvas = await captureMathfield();
    if (!canvas) return;
    // Convert canvas to a Blob.
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      try {
        // Use ClipboardItem to write the image blob to the clipboard.
        await navigator.clipboard.write([
          new ClipboardItem({ [blob.type]: blob }),
        ]);
        alert("Image copied to clipboard!");
      } catch (err) {
        console.error("Failed to copy image to clipboard", err);
        alert("Unable to copy image to clipboard.");
      }
    });
  };

  // Handler for "Download Image" button.
  const handleDownloadImage = async () => {
    const canvas = await captureMathfield();
    if (!canvas) return;
    // Convert the canvas to a data URL.
    const dataURL = canvas.toDataURL("image/png");
    // Create a temporary link element and trigger a download.
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = sanitize(latex) + ".png";
    link.click();
  };

  return (
    <>
      <Div
        width="100%"
        display="flex"
        flexDirection="row"
        alignItems="center"
        gap="8px"
        border="2px solid black"
        padding="8px"
      >
        <Div
          width="100%"
          display="flex"
          flexDirection="column"
          gap="8px"
          justifyContent="center"
        >
          <Div flex={1}></Div>
          <Div
            width="100%"
            flex={0}
            display="flex"
            flexDirection="row"
            alignItems="center"
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
            />
            <Div display="flex" flexDirection="row" gap="8px">
              <Button
                title="Copy Image To Clipboard"
                css={iconButtonCss}
                onClick={handleCopyImage}
                disabled={latex.length === 0}
                position="relative"
                overflow="visible"
              >
                <Div
                  position="absolute"
                  top="0"
                  left="0"
                  right="0"
                  bottom="0"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <FaCamera
                  css={css`
                    color: green;
                    transform: translate(-6px, -6px);
                    `}
                  />
                </Div>
                <Div
                  position="absolute"
                  width="48px"
                  height="48px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  top="0"
                  left="0"
                  right="0"
                  bottom="0"
                >
                  <FaCopy css={css`
                  color: blue;
                    transform: translate(6px, 6px);
                    `} />
                </Div>
              </Button>
              <Button
                title="Download Image"
                css={iconButtonCss}
                onClick={handleDownloadImage}
                disabled={latex.length === 0}
              >
                <FaDownload />
              </Button>
              <Button
                title="Clear Equation"
                css={iconButtonCss}
                disabled={latex.length === 0}
                backgroundColor="yellow"
                onClick={() => {
                  mathfieldRef.current?.setValue("");
                  mathfieldRef.current?.blur();

                  setLatex("");
                }}
              >
                <FaBroom />
              </Button>
              <Button
                title="Delete Equation"
                css={iconButtonCss}
                backgroundColor="red"
                onClick={onDelete}
              >
                <FaTrash />
              </Button>
            </Div>
          </Div>

          <Div width="100%" flex={1}>
            <Div
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
                title="Copy LaTeX Code"
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
            </Div>
          </Div>
        </Div>
      </Div>
    </>
  );
}

export default function Home() {
  const [boxIds, setBoxIds] = useState<Set<string>>(() => new Set([uuidv4()]));

  const addBox = () => {
    const newId = uuidv4();
    setBoxIds(new Set([...boxIds, newId]));
  };

  const removeBox = (id: string) => {
    setBoxIds(new Set([...boxIds].filter((boxId) => boxId !== id)));
  };

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
        <P marginLeft="auto">
          Powered by MathLive
          <Br />
          <A href="https://cortexjs.io/mathlive/">
            https://cortexjs.io/mathlive/
          </A>
        </P>
      </Header>
      <Main
        width="100%"
        display="flex"
        flexDirection="column"
        padding="8px"
        gap="8px"
        alignItems="center"
      >
        {[...boxIds].map((id) => (
          <MathInputBox key={id} onDelete={() => removeBox(id)} />
        ))}
        <Button
          title="Add New Equation"
          onClick={addBox}
          css={iconButtonCss}
          width="64px"
          height="64px"
          fontSize="48px"
          backgroundColor="lightgreen"
        >
          <FaPlus />
        </Button>
      </Main>
    </Div>
  );
}
