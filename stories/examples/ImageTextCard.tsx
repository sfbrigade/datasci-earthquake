import "./image-text-card.css";

export interface ImageTextCardProps {
  image: string;
  title: string;
  description: string;
  imagePosition?: "left" | "right";
}

export const ImageTextCard = ({
  image,
  title,
  description,
  imagePosition = "left",
}: ImageTextCardProps) => (
  <div className={`image-text-card image-text-card--${imagePosition}`}>
    <img src={image} alt={title} className="image-text-card__image" />
    <div className="image-text-card__content">
      <h2 className="image-text-card__title">{title}</h2>
      <p className="image-text-card__description">{description}</p>
    </div>
  </div>
);
