import { Star } from "lucide-react";

const STAR_POSITIONS = [1, 2, 3, 4, 5];

export default function StarRating({
  rating,
  max = 5,
}: { rating: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {STAR_POSITIONS.slice(0, max).map((pos) => (
        <Star
          key={pos}
          className={`w-4 h-4 ${
            pos <= rating ? "fill-star text-star" : "text-border fill-border"
          }`}
        />
      ))}
    </div>
  );
}
