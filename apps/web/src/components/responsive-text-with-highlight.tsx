"use client";

import { Highlight, useBreakpointValue } from "@chakra-ui/react";
import { Fragment } from "react";

type ResponsiveTextWithHighlightProps = {
  text: string;
  highlight: string;
  highlightStyle?: object;
};

const ResponsiveTextWithHighlight = ({
  text,
  highlight,
  highlightStyle,
}: ResponsiveTextWithHighlightProps) => {
  // conditionally convert newlines to <br>s
  const lines = text.split("\n");
  const insertBreak = useBreakpointValue({
    base: true,
    xl: false,
  });

  return (
    <>
      {lines.map((line: string, index: number) => (
        <Fragment key={index}>
          <Highlight query={highlight} styles={highlightStyle}>
            {line}
          </Highlight>
          {insertBreak && index < lines.length - 1 ? <br /> : " "}
        </Fragment>
      ))}
    </>
  );
};

export default ResponsiveTextWithHighlight;
