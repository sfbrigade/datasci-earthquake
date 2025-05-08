import { Highlight, Text } from "@chakra-ui/react";
import { SystemStyleObject } from "@chakra-ui/styled-system";

export interface HeadingProps {
  text: string;
  highlight: string;
  style?: SystemStyleObject;
  highlightStyle?: SystemStyleObject;
  maxWidth?: {
    [key: string]: string;
  };
}

const Heading: React.FC<{ headingData: HeadingProps }> = ({ headingData }) => {
  const { text, highlight, style, highlightStyle, maxWidth } = headingData;
  return (
    <Text textStyle="headerBig" maxW={maxWidth} sx={style}>
      <Highlight query={highlight} styles={highlightStyle}>
        {text}
      </Highlight>
    </Text>
  );
};

export default Heading;
