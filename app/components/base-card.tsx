import { Card, CardBody, CardFooter, CardHeader, Text } from "@chakra-ui/react";
import React from "react";

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
    <Card flex={1} maxW={400} p={{ base: "16px", md: "20px" }}>
      <CardHeader p={0}>
        {typeof title === "string" ? (
          <Text textStyle="textBig">{title}</Text>
        ) : (
          <>{title}</>
        )}
      </CardHeader>
      <CardBody {...sectionProps}>{children}</CardBody>
      {footer && <CardFooter {...sectionProps}>{footer}</CardFooter>}
    </Card>
  );
};
