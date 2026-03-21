import type { OrderRequestInput, ReviewInput } from "@/backend";
import { useActor } from "@/hooks/useActor";
import { useMutation } from "@tanstack/react-query";

export function useAddOrderRequest() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (input: OrderRequestInput) => {
      if (!actor) throw new Error("Not connected");
      return actor.addOrderRequest(input);
    },
  });
}

export function useAddReview() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (input: ReviewInput) => {
      if (!actor) throw new Error("Not connected");
      return actor.addReview(input);
    },
  });
}
