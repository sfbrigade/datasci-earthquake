import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Text,
  HStack,
  List,
} from "@chakra-ui/react";

interface CardInfoProps {
  info: {
    id: number;
    name: string;
    title: string;
    list: Array<object>;
  };
}

const CardInfo: React.FC<CardInfoProps> = ({ info: { name, title, list } }) => {
  const infoListItem = "";

  return (
    <Card>
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
          base: "10px 23px 0px 23px",
          md: "17px 16px 0px 16px",
          xl: "14px 22px 0px 22px",
        }}
      >
        <List></List>
      </CardBody>
    </Card>
  );
};

export default CardInfo;
