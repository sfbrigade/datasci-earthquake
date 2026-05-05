import { create } from "storybook/theming";

export default create({
  base: "dark",
  brandTitle: "SafeHome Storybook",
  brandUrl: "https://safehome.report",
  brandImage: "images/SFSafeHome-fulllogo.svg", // NOTE: this is a dupe of the image in the Next app's public folder; we are using a separate copy to avoid self-referential issues since Storybook build is deploying to the `/public` folder, which is Vercel Edge-friendly for static files, and we don't want to also reference an image in that same folder (which would cause an error)
  brandTarget: "_self",
});
