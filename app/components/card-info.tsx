import {
  Card,
  CardHeader,
  CardBody,
  Text,
  HStack,
  List,
  ListItem,
  Link,
} from "@chakra-ui/react";

interface CardInfoProps {
  info: {
    id: number;
    name: string;
    title: string;
    list: {
      id: number;
      title: string;
      url: string;
    }[];
  };
}

const CardInfo: React.FC<CardInfoProps> = ({ info: { name, title, list } }) => {
  return (
    <Card flex={1} maxW={400}>
      <CardHeader
        p={{
          base: "20px 24px 0px 24px",
          md: "20px 22px 0px 22px",
          xl: "20px 22px 0px 22px",
        }}
      >
        <HStack justifyContent="space-between">
          <Text textStyle="textBig">{title}</Text>
        </HStack>
      </CardHeader>
      <CardBody
        p={{
          base: "8px 23px 24px 23px",
          md: "8px 16px 22px 16px",
          xl: "8px 22px 20px 22px",
        }}
      >
        <List styleType="disc" ml={4}>
          {list.map((item) => {
            return (
              <ListItem key={item.id}>
                <Text>
                  <Link href={item.url} target="_blank">
                    {item.title}
                  </Link>
                </Text>
              </ListItem>
            );
          })}
        </List>
      </CardBody>
    </Card>
  );
};

export default CardInfo;
