import { create } from "storybook/theming";

let appLink = "";

if (process.env.STORYBOOK_NODE_ENV === "development") {
  // calculate the link dynamically
  const currentHost = window.location.hostname;
  appLink = `http://${currentHost}:3000`;
} else {
  appLink = process.env.STORYBOOK_APP_URL || "https://safehome.report";
}

export default create({
  base: "dark",
  brandTitle: `Navigate to ${appLink}, the SafeHome webapp for this environment`,
  brandUrl: appLink,
  brandImage: "../public/images/SFSafeHome-fulllogo.svg",
});
