import CardInfo from "./card-info";
import { Info } from "../data/data";
import { CardContainer } from "./card-container";

const Information = () => {
  return (
    <CardContainer>
      {Info.map((infoItem) => {
        return <CardInfo key={infoItem.id} info={infoItem} />;
      })}
    </CardContainer>
  );
};

export default Information;
