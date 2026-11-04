import { Suspense } from "react";
import { Flex } from "@chakra-ui/react";

import AddressMapper from "@/components/address-mapper";

// NOTE: UI changes to this page ought to be reflected in its suspense skeleton `home-skeleton.tsx` and vice versa
// TODO: look into if we can use narrow Suspense boundaries instead of `loading.tsx` and achieve the same (or better) perceived loading time effect
const Home = () => {
  return (
    <Flex direction="column" h="full">
      {/* NOTE: This Suspense boundary is being used around a component that utilizes `useSearchParams()` to prevent entire page from deopting into client-side rendering (CSR) bailout as per https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout */}
      <Suspense fallback={null}>
        <AddressMapper />
      </Suspense>
    </Flex>
  );
};

export default Home;
