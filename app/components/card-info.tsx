import { Text, List, Link, Box } from "@chakra-ui/react";
import { BaseCard } from "./base-card";

interface CardInfoProps {
  info: {
    id: number;
    name: string;
    title: string;
    textStyle?: string;
    list: { id: number; title: string; subtitle?: string; url: string }[];
  };
}

const CardInfo: React.FC<CardInfoProps> = ({
  info: { title, list, textStyle },
}) => {
  const textProps = textStyle === "bold" ? { fontWeight: "bold" } : {};

  return (
    <BaseCard header={title}>
      <List.Root ml={6}>
        {/* TODO: do we need styleType="disc" still? */}
        {list.map((item) => {
          return (
            <List.Item key={item.id}>
              <Box display="flex" flexDirection="row" flexWrap="wrap">
                <Text {...textProps} wordBreak="break-word">
                  <Link href={item.url} target="_blank">
                    {item.title}
                  </Link>
                </Text>
                {item.subtitle && <Text ml={1}>- {item.subtitle}</Text>}
              </Box>
            </List.Item>
          );
        })}
      </List.Root>
    </BaseCard>
  );
};

export default CardInfo;
