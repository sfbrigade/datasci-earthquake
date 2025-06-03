import dynamic from "next/dynamic";

const DynamicHomeHeader = dynamic(() => import("../components/home-header"), {
  ssr: false,
  loading: () => <div>Loading Home Header...</div>,
});

export default DynamicHomeHeader;
