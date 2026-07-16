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
import { EmergencyKitSteps } from "./emergency-kit-steps";

export function ChecklistDialog() {
  return (
    <DialogRoot placement="center" scrollBehavior="inside" size="lg">
      <DialogTrigger asChild>
        <Button size="sm">See checklist </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Build your emergency kit</DialogTitle>
          <DialogDescription>72-hour supply checklist</DialogDescription>
        </DialogHeader>

        <DialogBody>
          <EmergencyKitSteps />
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
