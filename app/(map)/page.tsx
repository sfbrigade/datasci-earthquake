import { Suspense } from "react";
import { Flex } from "@chakra-ui/react";

import AddressMapper from "@/components/address-mapper";
import {
  fetchSoftStories,
  fetchTsunami,
  fetchLiquefaction,
  fetchFema,
} from "../api/services";

// NOTE: UI changes to this page ought to be reflected in its suspense skeleton `home-skeleton.tsx` and vice versa
// TODO: look into if we can use narrow Suspense boundaries instead of `loading.tsx` and achieve the same (or better) perceived loading time effect
// TODO: look into if the initial page load size is too large, especially UX-wise; this may entail redesigning when we grab data (e.g., during client-side rendering instead) and evaluating trade-offs (e.g., traffic of build-time vs run-time API calls); there may be some overlap with the above TODO
const Home = async () => {
  // Required snapshots must fail the route rather than display an empty hazard map.
  const [softStoryData, tsunamiData, liquefactionData, femaData] =
    await Promise.all([
      fetchSoftStories(),
      fetchTsunami(),
      fetchLiquefaction(),
      fetchFema(),
    ]);
  return (
    <Flex direction="column" h="full">
      {/* NOTE: This Suspense boundary is being used around a component that utilizes `useSearchParams()` to prevent entire page from deopting into client-side rendering (CSR) bailout as per https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout */}
      <Suspense fallback={null}>
        <AddressMapper
          softStoryData={softStoryData}
          tsunamiData={tsunamiData}
          liquefactionData={liquefactionData}
          femaRiskData={femaData}
        />
      </Suspense>
    </Flex>
  );
};

export default Home;
