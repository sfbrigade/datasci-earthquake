import dynamic from "next/dynamic";

const DynamicShare = dynamic(() => import("../components/share"), {
  ssr: false,
  loading: () => <div>Loading Share...</div>,
});

export default DynamicShare;
