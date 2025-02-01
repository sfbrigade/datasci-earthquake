import {
  Card,
  CardHeader,
  CardBody,
  Text,
  HStack,
  List,
  ListItem,
  Link,
  Box,
} from "@chakra-ui/react";
import { BaseCard } from "./base-card";

interface CardInfoProps {
  info: {
    id: number;
    name: string;
    title: string;
    textStyle?: string;
    list: {
      id: number;
      title: string;
      subtitle?: string;
      url: string;
    }[];
  };
}

const CardInfo: React.FC<CardInfoProps> = ({
  info: { title, list, textStyle },
}) => {
  const textProps = textStyle === "bold" ? { fontWeight: "bold" } : {};

  return (
    <BaseCard header={title}>
      <List styleType="disc" ml={4}>
        {list.map((item) => {
          return (
            <ListItem key={item.id}>
              <Box display="flex" flexDirection="row" flexWrap="wrap">
                <Text {...textProps} wordBreak="break-word">
                  <Link href={item.url} target="_blank">
                    {item.title}
                  </Link>
                </Text>
                {item.subtitle && <Text ml={1}>- {item.subtitle}</Text>}
              </Box>
            </ListItem>
          );
        })}
      </List>
    </BaseCard>
  );
};

export default CardInfo;
