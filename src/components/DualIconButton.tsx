import { forwardRef } from "react";
import { Button, ButtonProps, Div } from "style-props-html";
import { IconType } from "react-icons";
import { css } from "@emotion/react";
import {
  increaseOrDecreaseSaturation,
  lightenOrDarkenColor,
} from "@/utils/colors";

export interface DualIconButtonProps extends ButtonProps {
  size: number | string;
  fontSize: number | string;

  backgroundColor: string;
  borderColor: string;
  borderThickness: number;

  Icon1: IconType;
  /**
   * The second icon is optional.
   * If not present, then the first/only icon will not be offset.
   */
  Icon2?: IconType;
  spacing?: number;
  color1?: string;
  color2?: string;
  transitionTimeMillis?: number;
  hoverScale?: number;
  activeScale?: number;
  hoverSaturationFactor?: number;
  activeLightnessFactor?: number;
  disabledOpacity?: number;
  /**
   * To increase reliability, we do not attempt to correlate hover and disabled state purely in css
   * Prior experience indicates that emotion css does not handle this perfectly
   *
   * Instead we use conditional rendering of different emotion `css` objects based on the `disabled` prop.
   */
  disabled?: boolean;
  loading?: boolean;
  onClick?: ButtonProps["onClick"];
}
export default forwardRef<HTMLButtonElement, DualIconButtonProps>(
  function DualIconButton(
    {
      backgroundColor,
      borderColor,
      Icon1,
      Icon2,
      spacing = 10,
      color1 = "currentColor",
      color2,
      transitionTimeMillis = 150,
      hoverScale = 1.05,
      activeScale = 0.95,
      hoverSaturationFactor = 1.1,
      activeLightnessFactor = 0.9,
      disabledOpacity = 0.65,
      disabled = false,
      loading = false,
      onClick = () => {},
      borderThickness,
      size,
      fontSize,
      ...rest
    },
    ref
  ) {
    const sizeString = typeof size === "number" ? `${size}px` : size;
    const hoverColor = increaseOrDecreaseSaturation(
      backgroundColor,
      hoverSaturationFactor
    );
    const activeColor = lightenOrDarkenColor(hoverColor, activeLightnessFactor);
    return (
      <Button
        width={sizeString}
        height={sizeString}
        transformOrigin="center"
        transition={`all ${transitionTimeMillis / 1000}s ease-in-out`}
        ref={ref}
        borderRadius="50%"
        opacity={disabled ? disabledOpacity : 1}
        cursor={loading ? "progress" : disabled ? "not-allowed" : "pointer"}
        // It has been shown that if pointerEvents is disabled
        // The cursor will not update properly
        onClick={disabled || loading ? () => {} : onClick}
        css={css`
          border: ${borderThickness}px solid ${borderColor};
          background-color: ${backgroundColor};

          ${!disabled && !loading
            ? css`
                &:hover {
                  background-color: ${hoverColor};
                  transform: scale(${hoverScale});
                }
                &:active {
                  background-color: ${activeColor};
                  transform: scale(${activeScale});
                }
              `
            : css``}
        `}
        position="relative"
        {...rest}
      >
        <Div
          position="absolute"
          top="0"
          bottom="0"
          left="0"
          right="0"
          display="flex"
          alignItems="center"
          justifyContent="center"
          transform={Icon2 ? `translate(-${spacing}px,-${spacing}px)` : "none"}
        >
          <Icon1
            css={css`
              color: ${color1};
              font-size: ${fontSize}px;
              line-height: 1;
            `}
          />
        </Div>
        {Icon2 && (
          <Div
            position="absolute"
            top="0"
            bottom="0"
            left="0"
            right="0"
            display="flex"
            alignItems="center"
            justifyContent="center"
            transform={`translate(${spacing}px,${spacing}px)`}
          >
            <Icon2
              css={css`
                color: ${color2};
                font-size: ${fontSize}px;
                line-height: 1;
              `}
            />
          </Div>
        )}
      </Button>
    );
  }
);
