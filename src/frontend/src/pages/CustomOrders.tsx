import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAddOrderRequest } from "@/hooks/useQueries";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";

const ITEM_TYPES = [
  "Toy",
  "Flower Arrangement",
  "Clothing",
  "Accessory",
  "Other",
];

export default function CustomOrders() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [itemType, setItemType] = useState("");
  const [description, setDescription] = useState("");
  const [success, setSuccess] = useState(false);
  const addOrder = useAddOrderRequest();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addOrder.mutateAsync({
        customerName: name,
        email,
        itemType,
        description,
      });
      setSuccess(true);
      setName("");
      setEmail("");
      setItemType("");
      setDescription("");
    } catch {
      // error handled below
    }
  };

  return (
    <main className="min-h-screen py-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-5xl block mb-4">🎀</span>
          <p className="text-sm font-bold uppercase tracking-widest text-primary mb-2">
            Made Just for You
          </p>
          <h1 className="text-4xl font-black text-foreground mb-3">
            Custom Orders ✨
          </h1>
          <p className="text-muted-foreground font-medium max-w-md mx-auto">
            Have something special in mind? We love creating unique,
            personalized pieces that bring joy!
          </p>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {[
            { emoji: "💕", label: "Made with care" },
            { emoji: "✨", label: "Easy ordering" },
            { emoji: "🌸", label: "Fast response" },
          ].map(({ emoji, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 bg-card rounded-full px-5 py-2 shadow-xs font-semibold text-sm"
            >
              <span>{emoji}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* Form */}
        <div
          className="bg-card rounded-3xl p-8 shadow-card"
          data-ocid="custom_order.panel"
        >
          {success ? (
            <div
              className="text-center py-10 flex flex-col items-center gap-4"
              data-ocid="custom_order.success_state"
            >
              <CheckCircle2 className="w-16 h-16 text-primary" />
              <h2 className="text-2xl font-black">Request Sent! 🎉</h2>
              <p className="text-muted-foreground max-w-sm">
                Your order request has been sent! We&apos;ll get back to you
                soon 💕
              </p>
              <Button
                className="rounded-full font-bold mt-2"
                onClick={() => setSuccess(false)}
                data-ocid="custom_order.secondary_button"
              >
                Submit Another Request
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <Label htmlFor="co-name">Your Name *</Label>
                <Input
                  id="co-name"
                  placeholder="e.g. Sophie M."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 rounded-xl"
                  required
                  data-ocid="custom_order.input"
                />
              </div>
              <div>
                <Label htmlFor="co-email">Email Address *</Label>
                <Input
                  id="co-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 rounded-xl"
                  required
                  data-ocid="custom_order.input"
                />
              </div>
              <div>
                <Label htmlFor="co-type">Item Type *</Label>
                <Select value={itemType} onValueChange={setItemType} required>
                  <SelectTrigger
                    className="mt-1.5 rounded-xl w-full"
                    data-ocid="custom_order.select"
                  >
                    <SelectValue placeholder="Select an item type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ITEM_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="co-desc">Describe Your Vision *</Label>
                <Textarea
                  id="co-desc"
                  placeholder="Tell us what you'd like! Colors, size, style, who it's for..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1.5 rounded-xl resize-none"
                  rows={5}
                  required
                  data-ocid="custom_order.textarea"
                />
              </div>

              {addOrder.isError && (
                <p
                  className="text-destructive text-sm font-medium"
                  data-ocid="custom_order.error_state"
                >
                  Something went wrong. Please try again.
                </p>
              )}

              <Button
                type="submit"
                size="lg"
                className="rounded-full font-bold text-base mt-2"
                disabled={addOrder.isPending || !itemType}
                data-ocid="custom_order.submit_button"
              >
                {addOrder.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Request 💌"
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
