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
    list: Array<{
      id: number;
      title: string;
      url: string;
    }>;
  };
}

const CardInfo: React.FC<CardInfoProps> = ({ info: { name, title, list } }) => {
  return (
    <Card flex={1}>
      <CardHeader
        p={{
          base: "10px 23px 0px 23px",
          md: "17px 16px 0px 16px",
          xl: "22px 22px 0px 22px",
        }}
      >
        <HStack justifyContent="space-between">
          <Text textStyle="textBig">{title}</Text>
        </HStack>
      </CardHeader>
      <CardBody
        p={{
          base: "10px 23px 10px 23px",
          md: "17px 16px 17px 16px",
          xl: "14px 22px 14px 22px",
        }}
      >
        <List styleType="disc" ml={4}>
          {list.map((item) => {
            return (
              <ListItem key={item.id}>
                <Text>
                  <Link href={item.url}>{item.title}</Link>
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
