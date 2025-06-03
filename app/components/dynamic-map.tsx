import dynamic from "next/dynamic";

const DynamicMap = dynamic(() => import("../components/map"), {
  ssr: false,
  loading: () => <div>Loading Map...</div>,
});

export default DynamicMap;
