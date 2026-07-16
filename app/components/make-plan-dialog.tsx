import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MakePlanSteps } from "./make-plan-steps";
import { Button } from "@chakra-ui/react";

export function MakePlanDialog() {
  return (
    <DialogRoot placement="center" scrollBehavior="inside" size="lg">
      <DialogTrigger asChild>
        <Button size="sm">Make a plan</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Make a plan</DialogTitle>
          <DialogDescription>
            Steps to prepare for an earthquake
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <MakePlanSteps />
        </DialogBody>

        <DialogFooter>
          <DialogActionTrigger asChild>
            <button type="button">Close</button>
          </DialogActionTrigger>
        </DialogFooter>

        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
}
