import { SystemStyleObject, Text } from "@chakra-ui/react";
import ResponsiveTextWithHighlight from "./responsive-text-with-highlight";
export interface HeadingProps {
  text: string;
  highlight: string;
  style?: SystemStyleObject;
  highlightStyle?: SystemStyleObject;
  maxWidth?: {
    [key: string]: string;
  };
  themeTextStyle: SystemStyleObject["textStyle"];
}

const Heading: React.FC<{ headingData: HeadingProps }> = ({ headingData }) => {
  const { text, highlight, style, highlightStyle, maxWidth, themeTextStyle } =
    headingData;

  return (
    <Text textStyle={themeTextStyle} maxW={maxWidth} css={style}>
      <ResponsiveTextWithHighlight
        text={text}
        highlight={highlight}
        highlightStyle={highlightStyle}
      />
    </Text>
  );
};

export default Heading;
