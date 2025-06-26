import { Card, Text } from "@chakra-ui/react";
import React, { type JSX } from "react";

export const BaseCard = ({
  header: title,
  children,
  footer,
}: {
  header: string | JSX.Element;
  children: React.ReactNode;
  footer?: JSX.Element;
}) => {
  const sectionProps = {
    p: 0,
    pt: "10px",
  };

  return (
    <Card.Root flex={1} maxW={400} p={{ base: "16px", md: "20px" }}>
      <Card.Header p={0}>
        {typeof title === "string" ? (
          <Text textStyle="cardTitle" layerStyle="headerAlt">
            {title}
          </Text>
        ) : (
          <>{title}</>
        )}
      </Card.Header>
      <Card.Body {...sectionProps}>{children}</Card.Body>
      {footer && <Card.Footer {...sectionProps}>{footer}</Card.Footer>}
    </Card.Root>
  );
};
